/* Shared sign-in for every tool. Email magic link, no password. Guests can use everything with a smaller daily allowance. */
(function(){
  var C = window.CT_CONFIG || {};
  var ok = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && C.SUPABASE_URL.indexOf('YOUR_')<0 && window.supabase);
  var CT = window.CT = { ready: ok, sb: null, user: null, anon: C.SUPABASE_ANON_KEY || '', fnUrl: (C.SUPABASE_URL||'') + '/functions/v1/coach', listeners: [] };
  if (ok){
    CT.sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth:{ persistSession:true, detectSessionInUrl:true } });
    CT.sb.auth.getSession().then(function(r){ CT.user = r.data.session ? r.data.session.user : null; fire(); });
    CT.sb.auth.onAuthStateChange(function(_e, s){ CT.user = s ? s.user : null; fire(); });
  }
  function fire(){ CT.listeners.forEach(function(f){ try{ f(CT.user); }catch(e){} }); }
  CT.onAuth = function(f){ CT.listeners.push(f); };
  CT.token = async function(){
    if (!CT.sb) return null;
    var r = await CT.sb.auth.getSession();
    return r.data.session ? r.data.session.access_token : null;
  };
  function esc(s){ var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  CT.mount = function(el){
    if (!el) return;
    if (!ok){ el.hidden = true; return; }
    var open = false, sent = false, msg = '';
    function draw(){
      if (CT.user){
        el.innerHTML = '<span class="who">'+esc(CT.user.email||'Signed in')+'</span><button type="button" class="abtn" data-a="out">Sign out</button>';
      } else if (!open){
        el.innerHTML = '<span class="who">Guest</span><button type="button" class="abtn" data-a="open">Sign in to save progress</button>';
      } else if (sent){
        el.innerHTML = '<span class="who">Check your email for the sign-in link.</span><button type="button" class="abtn" data-a="close">Close</button>';
      } else {
        el.innerHTML = '<form class="aform" id="aform"><input id="aemail" type="email" required placeholder="you@email.com" autocomplete="email" aria-label="Email address"><button class="abtn pri" type="submit">Email me a link</button><button type="button" class="abtn" data-a="close">Cancel</button></form>'+(msg?'<span class="amsg">'+esc(msg)+'</span>':'');
      }
    }
    el.addEventListener('click', function(e){
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.dataset.a;
      if (a==='open'){ open = true; sent = false; msg=''; draw(); var i=document.getElementById('aemail'); if(i) i.focus(); }
      if (a==='close'){ open = false; sent = false; msg=''; draw(); }
      if (a==='out'){ CT.sb.auth.signOut(); }
    });
    el.addEventListener('submit', async function(e){
      e.preventDefault();
      var email = document.getElementById('aemail').value.trim(); if (!email) return;
      var r = await CT.sb.auth.signInWithOtp({ email: email, options:{ emailRedirectTo: location.origin + location.pathname } });
      if (r.error){ msg = 'Could not send the link. Check the address and try again.'; } else { sent = true; }
      draw();
    });
    CT.onAuth(draw); draw();
  };
})();
