document.getElementById('coach').src = 'https://asimi99.github.io/clerkship-tools/stem-coach/?embed=1&t=' + Date.now();
(function(){
  var COACH = 'https://asimi99.github.io';
  var coach = document.getElementById('coach'), msg = document.getElementById('msg'), grab = document.getElementById('grab');
  var ready = false, queue = null;
  var port = chrome.runtime.connect({ name: 'sc-panel' });
  function say(t){ msg.textContent = t || ''; msg.title = t || ''; }
  function toCoach(d){ if (ready) coach.contentWindow.postMessage(d, COACH); else queue = d; }
  function blob(u){ var p = u.split(','), mime = (p[0].match(/:(.*?);/) || [])[1] || 'image/png', b = atob(p[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], { type: mime }); }
  function doGrab(){
    grab.classList.remove('pulse'); say('Reading the question');
    chrome.runtime.sendMessage({ t: 'grab' }, function(q){
      if (chrome.runtime.lastError || !q){ say('Could not reach the UWorld tab. Refresh it once.'); return; }
      if (q.err){ say(q.err); return; }
      if (!q.text){ say('Open a UWorld question and it starts on its own.'); return; }
      say(q.qid ? 'Coaching Q ' + q.qid : 'Coaching your selection');
      toCoach({ type: 'sc-question', qid: q.qid, text: q.text, images: (q.images || []).map(blob) });
    });
  }
  grab.addEventListener('click', doGrab);
  setTimeout(doGrab, 300);
  document.getElementById('hide').addEventListener('click', function(){ window.close(); });
  port.onMessage.addListener(function(m){
    if (m.t === 'close') window.close();
    if (m.t === 'grab') doGrab();
    if (m.t === 'newq'){ clearTimeout(window.__scT); window.__scT = setTimeout(doGrab, 450); }
  });
  window.addEventListener('message', function(e){
    if (e.source === coach.contentWindow && e.origin === COACH && (e.data || {}).type === 'sc-ready'){
      ready = true; if (queue){ coach.contentWindow.postMessage(queue, COACH); queue = null; }
    }
  });
})();
