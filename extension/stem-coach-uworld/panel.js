(function(){
  var COACH = 'https://asimi99.github.io';
  var coach = document.getElementById('coach'), msg = document.getElementById('msg'), grab = document.getElementById('grab');
  var ready = false, queue = null;
  function say(t){ msg.textContent = t || ''; msg.title = t || ''; }
  function toCoach(d){ if (ready) coach.contentWindow.postMessage(d, COACH); else queue = d; }
  grab.addEventListener('click', function(){ grab.classList.remove('pulse'); say('Reading the question'); parent.postMessage({ type: 'sc-grab' }, '*'); });
  document.getElementById('hide').addEventListener('click', function(){ parent.postMessage({ type: 'sc-hide' }, '*'); });
  window.addEventListener('message', function(e){
    var d = e.data || {};
    if (e.source === coach.contentWindow && e.origin === COACH){
      if (d.type === 'sc-ready'){ ready = true; if (queue){ coach.contentWindow.postMessage(queue, COACH); queue = null; } }
      return;
    }
    if (e.source !== parent) return;
    if (d.type === 'sc-question'){ say(d.qid ? 'Coaching Q ' + d.qid : 'Coaching your selection'); toCoach(d); }
    if (d.type === 'sc-status') say(d.msg);
    if (d.type === 'sc-newq'){ say('New question on screen: Q ' + d.qid); grab.classList.add('pulse'); }
  });
})();
