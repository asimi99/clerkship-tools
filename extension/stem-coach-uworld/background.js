var panelPort = null, wantGrab = false, bgBusy = '', bgReady = '';

function notifyTabs(msg){
  chrome.tabs.query({ url: ['https://*.uworld.com/*'] }, function(tabs){
    (tabs || []).forEach(function(t){ chrome.tabs.sendMessage(t.id, msg).catch(function(){}); });
  });
}
function openPanel(windowId){
  try { return chrome.sidePanel.open({ windowId: windowId }); }
  catch(e){ return Promise.reject(e); }
}
function closePanel(){
  if (panelPort){ panelPort.postMessage({ t: 'close' }); return; }
  notifyTabs({ t: 'state', open: false });
}
async function ensureOffscreen(){
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['IFRAME_SCRIPTING'], justification: 'Reads the UWorld question in the background so the coaching is ready when the panel opens.' });
}
async function closeOffscreen(){ try { if (await chrome.offscreen.hasDocument()) await chrome.offscreen.closeDocument(); } catch(e){} }

async function bgCoach(tabId, qid){
  if (panelPort || !qid || qid === bgBusy || qid === bgReady) return;
  bgBusy = qid; bgReady = '';
  notifyTabs({ t: 'bg', state: 'reading', qid: qid });
  var q;
  try { q = await chrome.tabs.sendMessage(tabId, { t: 'grab' }); } catch(e){ q = null; }
  if (!q || !q.text){ bgBusy = ''; notifyTabs({ t: 'bg', state: 'idle' }); return; }
  try { await ensureOffscreen(); } catch(e){ bgBusy = ''; notifyTabs({ t: 'bg', state: 'idle' }); return; }
  setTimeout(function(){ chrome.runtime.sendMessage({ t: 'bg-coach', q: q }).catch(function(){}); }, 50);
  setTimeout(function(){ if (bgBusy === qid){ bgBusy = ''; notifyTabs({ t: 'bg', state: 'idle' }); } }, 120000);
}

chrome.runtime.onConnect.addListener(function(port){
  if (port.name !== 'sc-panel') return;
  panelPort = port; bgBusy = ''; bgReady = '';
  closeOffscreen();
  notifyTabs({ t: 'state', open: true });
  if (wantGrab){ wantGrab = false; port.postMessage({ t: 'grab' }); }
  port.onDisconnect.addListener(function(){ if (panelPort === port) panelPort = null; notifyTabs({ t: 'state', open: false }); });
});

chrome.runtime.onMessage.addListener(function(m, sender, reply){
  if (m.t === 'open'){
    openPanel(sender.tab.windowId).then(function(){ reply({ ok: true }); }, function(e){ reply({ ok: false, err: String(e) }); });
    return true;
  }
  if (m.t === 'close'){ closePanel(); return; }
  if (m.t === 'newq'){
    if (panelPort) panelPort.postMessage({ t: 'newq', qid: m.qid });
    else if (sender.tab) bgCoach(sender.tab.id, m.qid);
    return;
  }
  if (m.t === 'bg-done'){
    if (panelPort) return;
    bgBusy = ''; bgReady = m.ok ? m.qid : ''; notifyTabs({ t: 'bg', state: m.ok ? 'ready' : 'idle', qid: m.qid });
    return;
  }
  if (m.t === 'grab'){
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs){
      var tab = (tabs || [])[0];
      if (!tab || !/uworld\.com/.test(tab.url || '')){ reply({ err: 'Open a UWorld question in this window first.' }); return; }
      chrome.tabs.sendMessage(tab.id, { t: 'grab' }).then(reply, function(){ reply({ err: 'Refresh the UWorld tab once so Stem Coach can read it.' }); });
    });
    return true;
  }
});

function toggle(tab, grab){
  if (panelPort && !grab){ closePanel(); return; }
  if (grab){ if (panelPort) panelPort.postMessage({ t: 'grab' }); else wantGrab = true; }
  openPanel(tab.windowId).catch(function(){});
}
chrome.action.onClicked.addListener(function(tab){ toggle(tab, false); });
chrome.commands.onCommand.addListener(function(cmd, tab){ if (tab) toggle(tab, cmd === 'coach-question'); });
