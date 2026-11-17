/* Core auth for every tool. Email and password, instant, no email link. Guests can use every tool with a smaller daily allowance. */
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
  CT.mount = function(){};
  CT.signIn = function(email, pw){ return CT.sb.auth.signInWithPassword({ email:email, password:pw }); };
  CT.signUp = async function(email, pw){
    var r = await CT.sb.auth.signUp({ email:email, password:pw });
    if (r.error) return r;
    if (r.data && r.data.session) return r;
    return CT.sb.auth.signInWithPassword({ email:email, password:pw });
  };
  CT.signOut = function(){ return CT.sb.auth.signOut(); };
})();
