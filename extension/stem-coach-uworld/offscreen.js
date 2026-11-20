var COACH = 'https://asimi99.github.io';
var coach = document.getElementById('coach'), ready = false, queue = [];
coach.src = 'https://asimi99.github.io/clerkship-tools/stem-coach/?embed=1&bg=1&t=' + Date.now();
function blob(u){ var p = u.split(','), mime = (p[0].match(/:(.*?);/) || [])[1] || 'image/png', b = atob(p[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], { type: mime }); }
function send(q){ coach.contentWindow.postMessage({ type: 'sc-question', qid: q.qid, text: q.text, images: (q.images || []).map(blob) }, COACH); }
window.addEventListener('message', function(e){
  if (e.source !== coach.contentWindow || e.origin !== COACH) return;
  var d = e.data || {};
  if (d.type === 'sc-ready'){ ready = true; queue.splice(0).forEach(send); }
  if (d.type === 'sc-done') chrome.runtime.sendMessage({ t: 'bg-done', qid: d.qid, ok: d.ok });
});
chrome.runtime.onMessage.addListener(function(m){
  if (m.t !== 'bg-coach') return;
  if (ready) send(m.q); else queue.push(m.q);
});
