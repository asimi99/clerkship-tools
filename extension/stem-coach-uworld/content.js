(function(){
  if (window.top !== window || document.getElementById('sc-root')) return;
  var EXT = chrome.runtime.getURL('').replace(/\/$/, '');
  var W = 440; try { W = Math.max(320, Math.min(900, +localStorage.getItem('sc_panel_w') || 440)); } catch(e){}

  var root = document.createElement('div'); root.id = 'sc-root'; root.hidden = true;
  root.innerHTML = '<div id="sc-drag" title="Drag to resize"></div>';
  var frame = document.createElement('iframe'); frame.id = 'sc-frame'; frame.style.width = W + 'px';
  frame.src = chrome.runtime.getURL('panel.html');
  root.appendChild(frame);
  var tab = document.createElement('button'); tab.id = 'sc-tab'; tab.type = 'button'; tab.textContent = 'Stem Coach';
  document.documentElement.appendChild(root); document.documentElement.appendChild(tab);

  function show(v){ root.hidden = !v; tab.hidden = v; }
  tab.addEventListener('click', function(){ show(true); });

  var drag = root.querySelector('#sc-drag');
  drag.addEventListener('mousedown', function(e){
    e.preventDefault(); frame.style.pointerEvents = 'none';
    function mv(ev){ W = Math.max(320, Math.min(window.innerWidth - 200, window.innerWidth - ev.clientX)); frame.style.width = W + 'px'; }
    function up(){ document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); frame.style.pointerEvents = ''; try { localStorage.setItem('sc_panel_w', W); } catch(e){} }
    document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
  });

  function clean(t){ return (t || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); }
  function qid(){ var m = (document.body.innerText || '').match(/Question Id:?\s*(\d{3,7})/i); return m ? m[1] : ''; }
  function stemEl(){ return document.querySelector('.question-content') || document.querySelector('#questionText') || document.querySelector('[class*="question-content"]') || document.querySelector('[id*="questionText"]'); }
  function choices(){
    var out = [];
    document.querySelectorAll('input[type=radio]').forEach(function(r){
      var el = r, best = '';
      for (var k = 0; k < 7 && el.parentElement; k++){
        el = el.parentElement;
        var n = el.querySelectorAll('input[type=radio]').length;
        if (n > 1) break;
        var t = clean(el.innerText);
        if (t.length > 1) best = t;
      }
      best = best.replace(/\s*\(\d{1,3}%\)\s*$/, '').replace(/\s*\n\s*/g, ' ');
      if (best) out.push(best);
    });
    return out.map(function(t, i){ return /^[A-J][.)]\s/.test(t) ? t : String.fromCharCode(65 + i) + '. ' + t; });
  }
  async function images(el){
    var list = [];
    var imgs = el ? Array.prototype.slice.call(el.querySelectorAll('img')) : [];
    for (var i = 0; i < imgs.length && list.length < 4; i++){
      var im = imgs[i]; if ((im.naturalWidth || im.width) < 60) continue;
      try { var b = await (await fetch(im.currentSrc || im.src, { credentials: 'include' })).blob(); if (/^image\//.test(b.type)) list.push(b); } catch(e){}
    }
    return list;
  }
  async function grab(){
    var sel = clean(String(window.getSelection ? window.getSelection() : ''));
    if (sel.length > 80) return { qid: '', text: sel, images: [] };
    var el = stemEl(); if (!el) return null;
    var ch = choices();
    var text = clean(el.innerText) + (ch.length ? '\n\nAnswer choices:\n' + ch.join('\n') : '');
    return { qid: qid(), text: text, images: await images(el) };
  }
  async function coach(){
    show(true);
    var q = await grab();
    if (!q || !q.text){ frame.contentWindow.postMessage({ type: 'sc-status', msg: 'No question found on this page. Open a question, or highlight the stem and press Coach again.' }, EXT); return; }
    frame.contentWindow.postMessage({ type: 'sc-question', qid: q.qid, text: q.text, images: q.images }, EXT);
  }

  window.addEventListener('message', function(e){
    if (e.origin !== EXT || e.source !== frame.contentWindow) return;
    var d = e.data || {};
    if (d.type === 'sc-grab') coach();
    if (d.type === 'sc-hide') show(false);
  });
  chrome.runtime.onMessage.addListener(function(m){
    if (m.t === 'toggle') show(root.hidden);
    if (m.t === 'coach') coach();
  });

  var last = '';
  setInterval(function(){
    var id = qid();
    if (id && id !== last){ last = id; if (!root.hidden) frame.contentWindow.postMessage({ type: 'sc-newq', qid: id }, EXT); }
  }, 1500);
})();
