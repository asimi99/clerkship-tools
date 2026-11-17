/* Shared top bar: back, forward, menu, account. Works on every page of the site. */
(function(){
  var me = document.currentScript, src = me.src, root = src.slice(0, src.lastIndexOf('/') + 1);
  var noauth = me.hasAttribute('data-noauth'), isStatic = me.hasAttribute('data-static');
  var LINKS = [
    ['Home', root],
    ['Stem Coach', root + 'stem-coach/'],
    ['Practice Exams', root + 'exam/'],
    ['High Yield Videos', 'https://asimi99.github.io/peds-shelf/']
  ];
  var css = '.ctn{background:#4F2C1D;color:#fff;border-bottom:3px solid #F2A900;font:600 14px/1.2 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;position:'+(isStatic?'relative':'sticky')+';top:0;z-index:50;padding-top:env(safe-area-inset-top,0px)}'
   + '.ctn *{box-sizing:border-box}.ctn-in{max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:8px;padding:9px max(14px,env(safe-area-inset-right,0px)) 9px max(14px,env(safe-area-inset-left,0px))}'
   + '.ctn button,.ctn a{font:inherit;color:#fff;text-decoration:none}.ctn-b{width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,.35);background:transparent;cursor:pointer;font-size:20px;line-height:1;padding:0}'
   + '.ctn-b:hover,.ctn-m:hover,.ctn-a:hover{background:rgba(255,255,255,.14)}.ctn-brand{font-size:16px;font-weight:700;letter-spacing:-.01em;margin:0 6px;white-space:nowrap}.ctn-brand b{color:#F2A900}'
   + '.ctn-sp{flex:1}.ctn-m,.ctn-a{border:1px solid rgba(255,255,255,.35);background:transparent;border-radius:8px;padding:8px 12px;cursor:pointer;white-space:nowrap}.ctn-a{background:#F2A900;border-color:#F2A900;color:#2b1710}.ctn-a:hover{background:#ffbe2e}'
   + '.ctn-dd{background:#fff;color:#14202b;border-bottom:1px solid #d6dfe6;box-shadow:0 8px 20px rgba(0,0,0,.18)}.ctn-dd[hidden]{display:none}.ctn-dd a{display:block;color:#14202b;padding:13px max(18px,env(safe-area-inset-left,0px));border-top:1px solid #eee;font-weight:600}.ctn-dd a:first-child{border-top:0}.ctn-dd a:hover{background:#f6efe9}.ctn-dd a.on{color:#4F2C1D;box-shadow:inset 4px 0 #F2A900;background:#fbf6f1}'
   + '.ctn-modal{position:fixed;inset:0;background:rgba(30,15,8,.55);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}.ctn-modal[hidden]{display:none}.ctn-card{background:#fff;color:#14202b;border-radius:14px;padding:22px;width:100%;max-width:380px;font:400 15px/1.5 Inter,system-ui,sans-serif}'
   + '.ctn-card h2{margin:0 0 4px;font-size:20px;color:#4F2C1D}.ctn-card p{margin:0 0 14px;color:#566879;font-size:14px}.ctn-card input{width:100%;font:inherit;padding:10px 12px;border:1.5px solid #cfd8e0;border-radius:8px;margin-bottom:10px;background:#fff;color:#14202b}.ctn-card input:focus{outline:2px solid #F2A900;outline-offset:-1px}'
   + '.ctn-card .go{width:100%;font:600 15px Inter,system-ui,sans-serif;padding:11px;border-radius:8px;border:0;background:#4F2C1D;color:#fff;cursor:pointer}.ctn-card .sw{background:none;border:0;color:#4F2C1D;font:600 14px Inter,system-ui,sans-serif;cursor:pointer;padding:10px 0 0;width:100%;text-decoration:underline}.ctn-card .er{color:#b0342a;font-size:14px;min-height:20px;margin:0 0 8px}.ctn-card .x{float:right;background:none;border:0;font-size:22px;cursor:pointer;color:#566879;line-height:1}'
   + '@media (max-width:520px){.ctn-brand{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var path = location.href.split('#')[0].split('?')[0];
  var h = document.createElement('header'); h.className = 'ctn';
  h.innerHTML = '<div class="ctn-in"><button class="ctn-b" id="tnb" type="button" aria-label="Back">&#8249;</button><button class="ctn-b" id="tnf" type="button" aria-label="Forward">&#8250;</button>'
   + '<a class="ctn-brand" href="'+root+'">Clerkship <b>Tools</b></a><span class="ctn-sp"></span>'
   + '<button class="ctn-m" id="tnm" type="button" aria-expanded="false">Menu &#9662;</button>'+(noauth?'':'<button class="ctn-a" id="tna" type="button">Sign in</button>')+'</div>'
   + '<nav class="ctn-dd" id="tnd" hidden>'+LINKS.map(function(l){ var on = (l[1]===path || (l[1]!==root && path.indexOf(l[1])===0)) || (l[1]===root && (path===root || path===root+'index.html')); return '<a href="'+l[1]+'"'+(on?' class="on"':'')+'>'+l[0]+'</a>'; }).join('')+'</nav>';
  document.body.insertBefore(h, document.body.firstChild);
  var dd = h.querySelector('#tnd'), mb = h.querySelector('#tnm');
  h.querySelector('#tnb').onclick = function(){ history.back(); };
  h.querySelector('#tnf').onclick = function(){ history.forward(); };
  mb.onclick = function(){ dd.hidden = !dd.hidden; mb.setAttribute('aria-expanded', String(!dd.hidden)); };
  document.addEventListener('click', function(e){ if (!h.contains(e.target)) { dd.hidden = true; } });
  if (noauth) return;

  var am = document.createElement('div'); am.className = 'ctn-modal'; am.hidden = true; document.body.appendChild(am);
  var acct = h.querySelector('#tna'), mode = 'in';
  function paint(){
    var u = window.CT && CT.user;
    acct.textContent = u ? (u.email || 'Account').split('@')[0] : 'Sign in';
  }
  function modal(){
    if (!window.CT || !CT.ready){ am.innerHTML = '<div class="ctn-card"><button class="x" type="button" data-x>&times;</button><h2>Accounts not ready</h2><p>Sign in is not switched on yet. Everything still works as a guest.</p></div>'; am.hidden = false; return; }
    if (CT.user){
      am.innerHTML = '<div class="ctn-card"><button class="x" type="button" data-x>&times;</button><h2>Signed in</h2><p>'+(CT.user.email||'')+'</p><button class="go" type="button" data-out>Sign out</button></div>'; am.hidden = false; return;
    }
    am.innerHTML = '<div class="ctn-card"><button class="x" type="button" data-x>&times;</button><h2>'+(mode==='in'?'Sign in':'Create account')+'</h2><p>'+(mode==='in'?'Welcome back. Your progress syncs on every device.':'Instant. No email link. Saves your progress and raises your daily limit.')+'</p>'
      + '<form id="tnform"><input id="tne" type="email" placeholder="Email" autocomplete="email" required><input id="tnp" type="password" placeholder="Password (6+ characters)" minlength="6" autocomplete="'+(mode==='in'?'current-password':'new-password')+'" required><p class="er" id="tner"></p><button class="go" type="submit">'+(mode==='in'?'Sign in':'Create account')+'</button></form>'
      + '<button class="sw" type="button" data-sw>'+(mode==='in'?'New here? Create an account':'Have an account? Sign in')+'</button></div>';
    am.hidden = false; var e = am.querySelector('#tne'); if (e) e.focus();
  }
  acct.onclick = modal;
  am.addEventListener('click', async function(ev){
    var t = ev.target;
    if (t === am || t.hasAttribute('data-x')){ am.hidden = true; return; }
    if (t.hasAttribute('data-sw')){ mode = mode==='in' ? 'up' : 'in'; modal(); return; }
    if (t.hasAttribute('data-out')){ await CT.signOut(); am.hidden = true; return; }
  });
  am.addEventListener('submit', async function(ev){
    ev.preventDefault();
    var em = am.querySelector('#tne').value.trim(), pw = am.querySelector('#tnp').value, er = am.querySelector('#tner'), b = am.querySelector('.go');
    b.disabled = true; er.textContent = '';
    var r = mode==='in' ? await CT.signIn(em, pw) : await CT.signUp(em, pw);
    b.disabled = false;
    if (r.error){
      var m = r.error.message || '';
      er.textContent = /Invalid login/i.test(m) ? 'Wrong email or password.' : /already/i.test(m) ? 'That email already has an account. Sign in instead.' : /confirm/i.test(m) ? 'Email confirmation is still switched on for this site.' : /password/i.test(m) ? 'Password needs 6 or more characters.' : 'Could not sign in. Try again.';
      return;
    }
    am.hidden = true;
  });
  if (window.CT) CT.onAuth(paint); paint();
})();
