var panelPort = null, wantGrab = false;

function notifyTabs(open){
  chrome.tabs.query({ url: ['https://*.uworld.com/*'] }, function(tabs){
    (tabs || []).forEach(function(t){ chrome.tabs.sendMessage(t.id, { t: 'state', open: open }).catch(function(){}); });
  });
}
function openPanel(windowId){
  try { return chrome.sidePanel.open({ windowId: windowId }); }
  catch(e){ return Promise.reject(e); }
}
function closePanel(){
  if (panelPort){ panelPort.postMessage({ t: 'close' }); return; }
  notifyTabs(false);
}

chrome.runtime.onConnect.addListener(function(port){
  if (port.name !== 'sc-panel') return;
  panelPort = port; notifyTabs(true);
  if (wantGrab){ wantGrab = false; port.postMessage({ t: 'grab' }); }
  port.onDisconnect.addListener(function(){ if (panelPort === port) panelPort = null; notifyTabs(false); });
});

chrome.runtime.onMessage.addListener(function(m, sender, reply){
  if (m.t === 'open'){
    openPanel(sender.tab.windowId).then(function(){ reply({ ok: true }); }, function(e){ reply({ ok: false, err: String(e) }); });
    return true;
  }
  if (m.t === 'close'){ closePanel(); return; }
  if (m.t === 'newq' && panelPort){ panelPort.postMessage({ t: 'newq', qid: m.qid }); return; }
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
