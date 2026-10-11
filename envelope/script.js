(function(){
  'use strict';
  var root=document.documentElement;
  var STATIC=root.classList.contains('static');
  var REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INSTANT=STATIC||REDUCED;
  var Q=new URLSearchParams(location.search);
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function clamp(v){return v<0?0:v>1?1:v}

  /* ---------- BEAT 1 · the envelope ----------
     Only the terminal is on screen; it types, then rises as the question fades in. */
  var hero=$('#heroTerm'), stack=$('#envStack'), envQ=$('#envQ');
  if(hero){
    var lines=$$('.ln',hero);
    var hLead=$('#heroLead'), hQ=$('#heroQ'), hSub=$('#heroSub'), hHinge=$('#heroHinge'), hNever=$('#heroNever'), hLate=$('#heroLate');
    var done=function(){root.setAttribute('data-hero-done','1')};
    var setShift=function(){ if(stack&&envQ)stack.style.setProperty('--shift',((envQ.offsetHeight+parseFloat(getComputedStyle(envQ).marginTop))/2)+'px') };
    if(INSTANT){
      lines.forEach(function(l){l.classList.add('on')});
      [hLead,hQ,hSub,hHinge,hNever,hLate].forEach(function(e){if(e)e.classList.add('show')});
      done();
    }else{
      setShift();
      var opened=false, onR=function(){if(!opened)setShift()};
      window.addEventListener('resize',onR);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(onR);
      (async function(){
        var first=lines[0], tx=$('.tx',first), html=tx.innerHTML, text=tx.getAttribute('data-text');
        tx.textContent='';
        first.classList.add('on');
        var cur=document.createElement('span');cur.className='cursor';cur.setAttribute('aria-hidden','true');
        first.appendChild(cur);
        await wait(1100);
        for(var i=1;i<=text.length;i++){tx.textContent=text.slice(0,i);await wait(34+Math.random()*26)}
        tx.innerHTML=html; first.removeChild(cur);
        await wait(650);
        for(var k=1;k<lines.length;k++){lines[k].classList.add('on');await wait(k===lines.length-1?400:720)}
        await wait(1400);
        opened=true; stack.style.setProperty('--shift','0px');
        await wait(250);
        if(hLead)hLead.classList.add('show');
        await wait(1000);
        if(hQ)hQ.classList.add('show');
        await wait(1600);
        if(hSub)hSub.classList.add('show');
        await wait(1100);
        if(hHinge)hHinge.classList.add('show');
        await wait(1300);
        if(hNever)hNever.classList.add('show');
        await wait(1000);
        if(hLate)hLate.classList.add('show');
        await wait(600);
        done();
      })();
      // never hide the page from someone who scrolls early
      window.addEventListener('scroll',function s(){if(window.scrollY>40){opened=true;if(stack)stack.style.setProperty('--shift','0px');[hLead,hQ,hSub,hHinge,hNever,hLate].forEach(function(e){if(e)e.classList.add('show')});done();window.removeEventListener('scroll',s)}},{passive:true});
    }
  }

  /* ---------- scroll reveals ---------- */
  var rvs=$$('.rv');
  if(INSTANT||!('IntersectionObserver' in window)){
    rvs.forEach(function(e){e.classList.add('in')});
  }else{
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
    },{rootMargin:'0px 0px -10% 0px',threshold:.12});
    rvs.forEach(function(e){io.observe(e)});
  }

  /* static: show everything, including the How it works disclosure */
  if(STATIC){var how=$('#how');if(how)how.open=true}

  /* ---------- BEAT 2 · the callback ----------
     A pure function of time: render(t). Starts when the terminal scrolls into view.
     ?static=1 → final state · ?t=<ms> → frozen frame at t.
     BLOCKED at 6.5 s, certificate ~1 s later. */
  var cb=$('#cbTerm');
  if(cb){
    var T={
      lines:[[250,1350],[1800,2500],[3300,4000],[4950,6500]],
      pass:[null,2650,4150],
      flip:6500,
      prompt:6800,
      cert:7500,
      foot:7700,
      end:9000
    };
    var grid=$('#cbGrid'), cl=$$('.ln',cb), w=$('.watcher',cb), blk=$('.blk',cb);
    var toks=$$('#cbSide .tok'), wls=$$('#curWatch .wl'), curLab=$('#curLab'), curMeta=$('#curMeta');
    var st=$('#cbState'), stT=$('#cbStateT'), cert=$('#cert'), cnt=$('#cbCount');
    function tog(el,c,on){if(el&&el.classList.contains(c)!==on)el.classList.toggle(c,on)}
    function txt(el,s){if(el&&el.textContent!==s)el.textContent=s}
    var seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
    var TL=cl.slice(0,4).map(function(ln){
      var nodes=[],walker=document.createTreeWalker(ln,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentNode.closest('.ok,.blk')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
      while(walker.nextNode())nodes.push({n:walker.currentNode,t:walker.currentNode.nodeValue});
      var full=nodes.map(function(x){return x.t}).join(''), acc=0, cum=[];
      for(var i=0;i<full.length;i++){var ch=full[i],pv=full[i-1]||'';acc+=0.55+rnd()*0.9+(ch===' '?0.5:0)+(/[(,"=]/.test(pv)?0.6:0);cum.push(acc)}
      cum=cum.map(function(v){return v/acc});
      return {el:ln,nodes:nodes,cum:cum,shown:-1};
    });
    function setChars(L,n){
      if(L.shown===n)return;L.shown=n;
      L.nodes.forEach(function(x){var k=Math.max(0,Math.min(x.t.length,n));n-=x.t.length;if(x.n.nodeValue.length!==k||k===x.t.length)x.n.nodeValue=x.t.slice(0,k)});
    }
    function chars(L,p){if(p>=1)return L.cum.length;var n=0;while(n<L.cum.length&&L.cum[n]<=p)n++;return n}
    var placed=null;
    function place(l,force){
      if(!w||!l||(l===placed&&!force))return;placed=l;
      var lh=parseFloat(getComputedStyle(l).lineHeight)||24;
      w.style.top=(l.offsetTop+lh/2-w.offsetHeight/2)+'px';
    }
    var phase='';
    function render(t){
      var active=cl[0];
      T.lines.forEach(function(win,i){
        var L=TL[i], on=t>=win[0], p=on?clamp((t-win[0])/(win[1]-win[0])):0;
        tog(L.el,'on',on); if(on)active=L.el;
        setChars(L,on?chars(L,p):0);
      });
      [1,2].forEach(function(i){
        var ok=t>=T.pass[i];
        tog(TL[i].el,'pass',ok); tog(toks[i-1],'hit',ok); tog(wls[i],'on',ok);
      });
      tog(wls[0],'on',t<T.pass[1]);
      tog(wls[3],'on',t>=T.lines[3][0]);
      var dev=t>=T.flip;
      tog(grid,'cb-dev',dev); tog(toks[2],'exp',dev); tog(blk,'on',dev); tog(TL[3].el,'flag',dev);
      tog(st,'guarded',!dev); tog(st,'dev',dev);
      txt(curLab,dev?'deviation detected':'current action');
      txt(curMeta,dev?'blocked':'watching');
      txt(stT,dev?'deviation':'guarded');
      txt(cnt,dev?'1 blocked · 0 executed':'0 blocked · 0 executed');
      tog(cl[4],'on',t>=T.prompt);
      if(cert)tog(cert,'in',t>=T.cert);
      tog(cb,'cb-done',t>=T.foot);
      place(active);
      var ph=t<0?'idle':t<T.flip?'run':t<T.end?'dev':'done';
      if(ph!==phase){phase=ph;root.setAttribute('data-cb',ph)}
    }
    var fixed=STATIC?Infinity:(Q.has('t')?(+Q.get('t')||0):(REDUCED?Infinity:null));
    var replace=function(){placed=null;var on=cl.filter(function(l){return l.classList.contains('on')&&!l.classList.contains('ln-cur')});place(on.length?on[on.length-1]:cl[0],true)};
    if(fixed!==null||!('IntersectionObserver' in window)){
      if(fixed===null)fixed=Infinity;
      render(fixed);
      window.addEventListener('load',replace);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(replace);
    }else{
      render(-1);
      var t0=0;
      var loop=function(now){var t=now-t0;render(t);if(t<T.end)requestAnimationFrame(loop)};
      var io2=new IntersectionObserver(function(ents){
        if(ents[0].isIntersecting){io2.disconnect();requestAnimationFrame(function(now){t0=now;render(0);requestAnimationFrame(loop)})}
      },{threshold:.45});
      io2.observe(cb);
    }
    var lastW=window.innerWidth;
    window.addEventListener('resize',function(){if(window.innerWidth===lastW)return;lastW=window.innerWidth;replace()});
  }

  /* ---------- request access (client-side only) ---------- */
  var f=$('#accessForm');
  if(f){
    var em=$('#email',f), err=$('#formErr',f), ok=$('#formOk',f);
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var v=(em.value||'').trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){
        em.classList.add('bad');err.textContent='enter a valid email';em.focus();return;
      }
      em.classList.remove('bad');err.textContent='';
      f.classList.add('done');ok.hidden=false;
    });
    em.addEventListener('input',function(){em.classList.remove('bad');err.textContent=''});
  }
})();
