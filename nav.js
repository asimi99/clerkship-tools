/* Shared top bar for every page: logo, menu, account. */
(function(){
  var me = document.currentScript, src = me.src.split('?')[0], root = src.slice(0, src.lastIndexOf('/') + 1);
  var noauth = me.hasAttribute('data-noauth'), isStatic = me.hasAttribute('data-static');
  var MAIN = [
    ['Home', root, 'All tools'],
    ['Stem Coach', root + 'stem-coach/', 'Screenshot a question, get coached to the answer'],
    ['Practice Exams', root + 'exam/', 'Turn question PDFs into an NBME-style test']
  ];
  var SHELF = [
    ['OB/GYN', []],
    ['Pediatrics', [['Peds Flowcharts', root + 'flowcharts/', '40 approach flowcharts, full size'], ['Peds Videos', 'https://asimi99.github.io/peds-shelf/', 'Review videos split by topic and system']]],
    ['Internal Medicine', []], ['Family Medicine', []], ['Psychiatry', []], ['Surgery', []]
  ];
  function isOn(href){ return href===root ? (path===root) : (path.indexOf(href)===0 || location.href.indexOf(href)===0); }
  function lk(l){ return '<a href="'+l[1]+'"'+(isOn(l[1])?' class="on"':'')+'><b>'+l[0]+'</b><small>'+l[2]+'</small></a>'; }
  function menuHtml(){
    var anyOn = SHELF.some(function(s){ return s[1].some(function(l){ return isOn(l[1]); }); });
    var h = MAIN.map(lk).join('');
    h += '<details class="ctn-x"'+(anyOn?' open':'')+'><summary>NBME shelves</summary><div class="ctn-xi">';
    SHELF.forEach(function(s){
      if(!s[1].length){ h += '<div class="ctn-none">'+s[0]+'<span>No tools yet</span></div>'; return; }
      var on = s[1].some(function(l){ return isOn(l[1]); });
      h += '<details class="ctn-x ctn-x2"'+(on?' open':'')+'><summary>'+s[0]+'</summary><div class="ctn-xi">'+s[1].map(lk).join('')+'</div></details>';
    });
    return h + '</div></details>';
  }
  var F = 'Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var css = ''
   + '.ctn{background:rgba(255,255,255,.96);backdrop-filter:saturate(1.4) blur(8px);-webkit-backdrop-filter:saturate(1.4) blur(8px);color:#14202b;border-bottom:1px solid #dce3ea;font:500 14px/1.2 '+F+';position:'+(isStatic?'relative':'sticky')+';top:0;z-index:50;padding-top:env(safe-area-inset-top,0px)}'
   + '.ctn *{box-sizing:border-box}.ctn-in{max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:8px;height:62px;padding:0 max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px))}'
   + '.ctn a,.ctn button{font:inherit;color:inherit;text-decoration:none}'
   + '.ctn-logo{display:flex;align-items:center;gap:10px;min-width:0}.ctn-logo svg{width:38px;height:38px;flex:none;border-radius:10px;box-shadow:0 2px 6px rgba(29,79,143,.3)}'
   + '.ctn-word{display:flex;flex-direction:column;min-width:0;line-height:1.1}.ctn-word small{font-size:12.5px;font-weight:500;color:#5b6876;white-space:nowrap}.ctn-word small b{color:#1d4f8f;font-weight:800;font-size:14.5px}.ctn-word span{font-size:16px;font-weight:800;letter-spacing:-.01em;white-space:nowrap}'
   + '.ctn-sp{flex:1}.ctn-b{width:36px;height:36px;border-radius:9px;border:1px solid #dce3ea;background:#fff;cursor:pointer;display:grid;place-items:center;padding:0;color:#14202b}'
   + '.ctn-b svg{width:18px;height:18px}.ctn-b:hover,.ctn-m:hover{background:#f1f4f7}'
   + '.ctn-m{height:36px;border:1px solid #dce3ea;background:#fff;border-radius:9px;padding:0 12px;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:6px}'
   + '.ctn-a{height:36px;border:0;background:#1d4f8f;color:#fff!important;border-radius:9px;padding:0 14px;cursor:pointer;font-weight:600;white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis}.ctn-a:hover{background:#163d70}'
   + '.ctn-dd{position:absolute;right:max(16px,env(safe-area-inset-right,0px));top:calc(100% + 6px);width:min(340px,calc(100vw - 32px));background:#fff;border:1px solid #dce3ea;border-radius:12px;box-shadow:0 12px 32px rgba(20,32,43,.16);padding:6px;z-index:60}'
   + '.ctn-dd a{display:block;padding:10px 12px;border-radius:8px}.ctn-dd a b{display:block;font-weight:600;font-size:14.5px}.ctn-dd a small{color:#5b6876;font-size:12.5px}.ctn-dd a:hover{background:#f1f4f7}.ctn-dd a.on{background:#e6eef8}.ctn-dd a.on b{color:#1d4f8f}'
   + '.ctn-x{border-top:1px solid #edf1f5;margin-top:4px;padding-top:4px}.ctn-x summary{list-style:none;cursor:pointer;padding:10px 12px;border-radius:8px;font-weight:600;font-size:14.5px;display:flex;justify-content:space-between;align-items:center}.ctn-x summary::-webkit-details-marker{display:none}.ctn-x summary:after{content:\'\';width:7px;height:7px;border-right:2px solid #5b6876;border-bottom:2px solid #5b6876;transform:rotate(45deg);margin-right:4px;transition:transform .15s}.ctn-x[open]>summary:after{transform:rotate(-135deg)}.ctn-x summary:hover{background:#f1f4f7}.ctn-xi{padding-left:10px}.ctn-x2{border:0;margin:0;padding:0}.ctn-x2 summary{font-weight:500}.ctn-none{padding:10px 12px;color:#8a96a3;font-size:14.5px;display:flex;justify-content:space-between}.ctn-none span{font-size:12px}'
   + '@font-face{font-family:InterI;src:url('+root+'inter-i.woff2) format("woff2");font-weight:100 900;font-display:block}.ctn-si,.si{font-family:InterI,Inter,system-ui,sans-serif;font-feature-settings:"cv08"}'
   + '.ctn-g{width:100%;height:44px;border:1px solid #dce3ea;background:#fff;border-radius:10px;font:600 15px '+F+';color:#14202b;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;margin-top:6px}.ctn-g:hover{background:#f1f4f7}.ctn-or{text-align:center;color:#8a96a3;font-size:13px;margin:12px 0 4px}'
   + '.ctn-rel{position:relative}.ctn-gh{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5b6876;padding:10px 12px 4px}'
   + '.ctn-modal{position:fixed;inset:0;background:rgba(20,32,43,.5);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}.ctn-modal[hidden]{display:none}'
   + '.ctn-card{background:#fff;color:#14202b;border-radius:16px;padding:24px;width:100%;max-width:380px;font:400 15px/1.5 '+F+';box-shadow:0 20px 50px rgba(20,32,43,.25)}'
   + '.ctn-card h2{margin:0 0 4px;font-size:21px;letter-spacing:-.01em}.ctn-card p{margin:0 0 16px;color:#5b6876;font-size:14px}.ctn-card input{width:100%;font:inherit;padding:11px 12px;border:1.5px solid #dce3ea;border-radius:9px;margin-bottom:10px;background:#fff;color:#14202b}.ctn-card input:focus{outline:2px solid #2f6db5;outline-offset:-1px;border-color:transparent}'
   + '.ctn-card .go{width:100%;font:600 15px '+F+';padding:12px;border-radius:9px;border:0;background:#1d4f8f;color:#fff;cursor:pointer}.ctn-card .go:disabled{opacity:.6}.ctn-card .sw{background:none;border:0;color:#1d4f8f;font:600 14px '+F+';cursor:pointer;padding:12px 0 0;width:100%}.ctn-card .er{color:#b0342a;font-size:14px;min-height:20px;margin:0 0 8px}.ctn-card .x{float:right;background:none;border:0;font-size:24px;cursor:pointer;color:#5b6876;line-height:1;padding:0}'
   + '@media (max-width:640px){.ctn-word small{display:none}.ctn-hide{display:none}}@media (max-width:400px){.ctn-word{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="ctn-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f6db5"/><stop offset="1" stop-color="#143a6b"/></linearGradient></defs><rect width="40" height="40" rx="10" fill="url(#ctn-g)"/><path fill="#fff" fill-rule="evenodd" d="M4 30 L11.5 10 H15 L22.5 30 H18.8 L17.2 25.5 H9.3 L7.7 30 Z M10.6 22 H15.9 L13.25 14.5 Z"/><path fill="#fff" d="M24 10 H35 V13.2 H31.2 V26.8 H35 V30 H24 V26.8 H27.8 V13.2 H24 Z"/></svg>';
  var ARR = function(d){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="'+d+'"/></svg>'; };
  var path = location.href.split('#')[0].split('?')[0].replace(/index\.html$/,'');
  var h = document.createElement('header'); h.className = 'ctn';
  h.innerHTML = '<div class="ctn-in"><a class="ctn-logo" href="'+root+'" aria-label="Asim Ibrahim\'s Clerkship Tools, home">'+LOGO+'<span class="ctn-word"><small><b>A</b>sim <b class="ctn-si">I</b>brahim\'s</small><span>Clerkship Tools</span></span></a><span class="ctn-sp"></span>'
   + '<span class="ctn-rel"><button class="ctn-m" id="ctnm" type="button" aria-expanded="false"><span class="ctn-hide">Menu</span>'+ARR('M4 7h16M4 12h16M4 17h16').replace('<svg','<svg width="18" height="18"')+'</button>'
   + '<nav class="ctn-dd" id="ctnd" hidden>'+menuHtml()+'</nav></span>'
   + (noauth?'':'<button class="ctn-a" id="ctna" type="button">Sign in</button>')+'</div>';
  document.body.insertBefore(h, document.body.firstChild);
  // full width even when the page body has side padding
  var cs = getComputedStyle(document.body), pl = parseFloat(cs.paddingLeft)||0, pr = parseFloat(cs.paddingRight)||0, pt = parseFloat(cs.paddingTop)||0;
  if (pl || pr || pt){ h.style.marginLeft = (-pl)+'px'; h.style.marginRight = (-pr)+'px'; h.style.marginTop = (-pt)+'px'; }
  var dd = h.querySelector('#ctnd'), mb = h.querySelector('#ctnm');
  mb.onclick = function(e){ e.stopPropagation(); dd.hidden = !dd.hidden; mb.setAttribute('aria-expanded', String(!dd.hidden)); };
  document.addEventListener('click', function(e){ if (!dd.contains(e.target)) { dd.hidden = true; mb.setAttribute('aria-expanded','false'); } });
  document.addEventListener('keydown', function(e){ if (e.key==='Escape') dd.hidden = true; });
  if (noauth) return;

  var am = document.createElement('div'); am.className = 'ctn-modal'; am.hidden = true; document.body.appendChild(am);
  var acct = h.querySelector('#ctna'), mode = 'in';
  function paint(){ var u = window.CT && CT.user; acct.textContent = u ? (u.email || 'Account').split('@')[0] : 'Sign in'; }
  function modal(){
    if (!window.CT || !CT.ready){ am.innerHTML = '<div class="ctn-card"><button class="x" type="button" data-x>&times;</button><h2>Accounts not ready</h2><p>Sign in is not switched on yet. Everything still works as a guest.</p></div>'; am.hidden = false; return; }
    if (CT.user){ am.innerHTML = '<div class="ctn-card"><button class="x" type="button" data-x>&times;</button><h2>Your account</h2><p>'+(CT.user.email||'')+'</p><button class="go" type="button" data-out>Sign out</button></div>'; am.hidden = false; return; }
    am.innerHTML = '<div class="ctn-card"><button class="x" type="button" data-x>&times;</button><h2>'+(mode==='in'?'Sign in':'Create an account')+'</h2><p>'+(mode==='in'?'Your progress follows you to any device.':'Takes a few seconds. Saves your progress and gives you a bigger daily allowance.')+'</p>'
      + '<button class="ctn-g" type="button" data-g><svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button><div class="ctn-or">or</div>'
      + '<form id="ctnform"><input id="ctne" type="email" placeholder="Email" autocomplete="email" required><input id="ctnp" type="password" placeholder="Password (6+ characters)" minlength="6" autocomplete="'+(mode==='in'?'current-password':'new-password')+'" required><p class="er" id="ctner"></p><button class="go" type="submit">'+(mode==='in'?'Sign in':'Create account')+'</button></form>'
      + '<button class="sw" type="button" data-sw>'+(mode==='in'?'New here? Create an account':'Already have an account? Sign in')+'</button></div>';
    am.hidden = false; var e = am.querySelector('#ctne'); if (e) e.focus();
  }
  acct.onclick = modal;
  am.addEventListener('click', async function(ev){
    var t = ev.target;
    if (t === am || t.hasAttribute('data-x')){ am.hidden = true; return; }
    if (t.hasAttribute('data-sw')){ mode = mode==='in' ? 'up' : 'in'; modal(); return; }
    var g = t.closest && t.closest('[data-g]');
    if (g){ g.disabled = true; var r = await CT.sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: location.href.split('#')[0] } }); if (r && r.error){ g.disabled = false; var er = am.querySelector('#ctner'); if (er) er.textContent = 'Google sign in is not switched on yet. Use email for now.'; } return; }
    if (t.hasAttribute('data-out')){ await CT.signOut(); am.hidden = true; return; }
  });
  am.addEventListener('submit', async function(ev){
    ev.preventDefault();
    var em = am.querySelector('#ctne').value.trim(), pw = am.querySelector('#ctnp').value, er = am.querySelector('#ctner'), b = am.querySelector('.go');
    b.disabled = true; er.textContent = '';
    var r; try { r = mode==='in' ? await CT.signIn(em, pw) : await CT.signUp(em, pw); } catch(x){ r = { error:{ message:'' } }; }
    b.disabled = false;
    if (r.error){
      var m = r.error.message || '';
      er.textContent = /Invalid login/i.test(m) ? 'Wrong email or password.' : /already/i.test(m) ? 'That email already has an account. Sign in instead.' : /confirm/i.test(m) ? 'This account still needs email confirmation.' : /password/i.test(m) ? 'Password needs 6 or more characters.' : 'Could not sign in. Try again.';
      return;
    }
    am.hidden = true;
  });
  if (window.CT) CT.onAuth(paint); paint();
})();
