(function(){
  if (window.top !== window || document.getElementById('sc-tab')) return;

  var tab = document.createElement('button'); tab.id = 'sc-tab'; tab.type = 'button';
  tab.innerHTML = '<span class="sc-label">Stem Coach</span><span class="sc-arrow" aria-hidden="true">&#8250;</span>';
  tab.title = 'Stem Coach (Alt+S)';
  document.documentElement.appendChild(tab);
  var isOpen = false;
  function setOpen(v){ isOpen = v; tab.classList.remove('closing'); tab.classList.toggle('open', v); tab.title = v ? 'Close Stem Coach' : 'Stem Coach (Alt+S)'; }
  tab.addEventListener('click', function(){
    if (isOpen){ tab.classList.add('closing'); chrome.runtime.sendMessage({ t: 'close' }); setTimeout(function(){ setOpen(false); }, 280); return; }
    chrome.runtime.sendMessage({ t: 'open' }, function(r){
      if (chrome.runtime.lastError || !r || !r.ok) tab.title = 'Click the Stem Coach icon in the toolbar to open';
    });
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
  function dataUrl(b){ return new Promise(function(res){ var r = new FileReader(); r.onload = function(){ res(r.result); }; r.readAsDataURL(b); }); }
  chrome.runtime.onMessage.addListener(function(m, sender, reply){
    if (m.t === 'state') setOpen(!!m.open);
    if (m.t === 'grab'){
      grab().then(async function(q){
        if (!q){ reply({ text: '' }); return; }
        reply({ qid: q.qid, text: q.text, images: await Promise.all(q.images.map(dataUrl)) });
      });
      return true;
    }
  });
  var last = '';
  setInterval(function(){
    var id = qid();
    if (id && id !== last){ last = id; if (isOpen) chrome.runtime.sendMessage({ t: 'newq', qid: id }).catch(function(){}); }
  }, 1500);
})();
