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
    var hLead=$('#heroLead'), hQ=$('#heroQ'), hSub=$('#heroSub');
    var done=function(){root.setAttribute('data-hero-done','1')};
    var setShift=function(){ if(stack&&envQ)stack.style.setProperty('--shift',((envQ.offsetHeight+parseFloat(getComputedStyle(envQ).marginTop))/2)+'px') };
    if(INSTANT){
      lines.forEach(function(l){l.classList.add('on')});
      [hLead,hQ,hSub].forEach(function(e){if(e)e.classList.add('show')});
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
        await wait(800);
        for(var i=1;i<=text.length;i++){tx.textContent=text.slice(0,i);await wait(34+Math.random()*26)}
        tx.innerHTML=html; first.removeChild(cur);
        await wait(650);
        lines[1].classList.add('on'); await wait(950);   // read_file
        lines[2].classList.add('on'); await wait(1250);  // the $4,800 transfer: give it a beat
        lines[3].classList.add('on'); await wait(900);   // rm -rf logs/
        lines[4].classList.add('on'); await wait(400);   // ✔ transfer complete · $4,800 sent: let the loss land
        lines[5].classList.add('on');
        await wait(1200);
        opened=true; stack.style.setProperty('--shift','0px');
        await wait(250);
        if(hLead)hLead.classList.add('show');
        await wait(1000);
        if(hQ)hQ.classList.add('show');
        await wait(1600);
        if(hSub)hSub.classList.add('show');
        await wait(600);
        done();
      })();
      // never hide the page from someone who scrolls early
      window.addEventListener('scroll',function s(){if(window.scrollY>40){done();window.removeEventListener('scroll',s)}},{passive:true});
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

  /* ---------- BEAT 2 · the proof ----------
     One terminal, one caption per step. Steps 1-4 live on a pinned stage and are
     driven by scroll (each step owns a quarter of the pinned track, ~62vh of scroll).
     Step 5 ("And it leaves proof.") is the flow block straight after the stage, and the
     certificate rises in when it enters the viewport.
     ?static=1 / reduced motion → steps shown static and stacked with their captions.
     ?t=<ms> → frozen frame: step = 1 + floor(t / 2200), t ≥ 8800 shows the certificate. */
  var track=$('#track'), stage=$('#stage'), si=$('#stageIn'), cert=$('#cert'), proofEnd=$('#proofEnd'), env=$('#envelope');
  var STEP_MS=2200;
  function setStep(el,n){
    if(!el)return;
    var s=String(n);
    if(el.getAttribute('data-step')!==s)el.setAttribute('data-step',s);
    $$('.caps .cap',el).forEach(function(c){c.classList.toggle('on',+c.getAttribute('data-c')===n)});
    $$('.step-k .pips i',el).forEach(function(p,i){p.classList.toggle('on',i<n)});
    var sn=$('.sn',el);if(sn)sn.textContent=s;
    var stt=$('.st-t',el);if(stt)stt.textContent=n<3?'guarded':n===3?'checking':'blocked';
  }
  function heroGap(){ // empty space at the bottom of the full-screen envelope
    if(!env||!stack)return 0;
    return Math.max(0,env.getBoundingClientRect().bottom-stack.getBoundingClientRect().bottom);
  }
  function mobile(){return window.innerWidth<=760}
  if(track&&si){
    var FIXED=!INSTANT&&Q.has('t');
    if(INSTANT){
      /* static + stacked: steps 1-4, each with its own caption */
      var box=document.createElement('div');box.className='static-steps';
      for(var n=1;n<=4;n++){
        var c=si.cloneNode(true);c.removeAttribute('id');c.classList.add('live');
        if(n===2)c.classList.add('only-strip');
        setStep(c,n);box.appendChild(c);
      }
      track.parentNode.replaceChild(box,track);
      if(cert)cert.classList.add('in');
      var fitS=function(){box.style.marginTop=Math.round((mobile()?56:88)-heroGap())+'px'};
      fitS();window.addEventListener('resize',fitS);window.addEventListener('load',fitS);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitS);
    }else{
      if(FIXED)root.classList.add('fixed');
      setStep(si,1);
      /* remove the dead space around the centred stage: the step-1 caption sits ~90px under
         the hero question, and step 5 sits ~70px under the terminal as the stage unpins */
      var fit=function(){
        var nav=mobile()?52:56, vh=window.innerHeight;
        if(!FIXED){
          var sh=stage.offsetHeight;
          stage.style.setProperty('--stick',Math.min(nav,vh-sh)+'px');
        }
        track.style.marginTop='0px';proofEnd.style.marginTop='0px';
        var sr=stage.getBoundingClientRect(), ir=si.getBoundingClientRect();
        var top=ir.top-sr.top, bot=sr.bottom-ir.bottom;
        track.style.marginTop=Math.round((mobile()?56:88)-heroGap()-top)+'px';
        proofEnd.style.marginTop=Math.round((mobile()?48:64)-bot)+'px';
      };
      fit();
      window.addEventListener('load',fit);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
      var lastW=window.innerWidth,lastH=window.innerHeight;
      window.addEventListener('resize',function(){if(window.innerWidth===lastW&&Math.abs(window.innerHeight-lastH)<120)return;lastW=window.innerWidth;lastH=window.innerHeight;fit();if(typeof tick==='function')tick()});
      if(FIXED){
        var t=+Q.get('t')||0, n=Math.max(1,Math.min(5,1+Math.floor(t/STEP_MS)));
        si.classList.add('live');setStep(si,Math.min(n,4));
        if(cert)cert.classList.toggle('in',n>=5);
        root.setAttribute('data-step',String(n));
        root.setAttribute('data-hero-done','1');
      }else{
        var queued=false, cur=0;
        var tick=function(){
          queued=false;
          var r=track.getBoundingClientRect(), stick=parseFloat(stage.style.getPropertyValue('--stick'))||56;
          var total=track.offsetHeight-stage.offsetHeight;
          var p=total>0?(stick-r.top)/total:0;
          var n=p<.25?1:p<.5?2:p<.75?3:4;
          var ir=si.getBoundingClientRect();
          if(!si.classList.contains('live')&&root.hasAttribute('data-hero-done')&&ir.top<window.innerHeight*.72&&ir.bottom>0)si.classList.add('live');
          if(!si.classList.contains('live'))n=1;
          if(n!==cur){cur=n;setStep(si,n)}
          var er=proofEnd.getBoundingClientRect();
          root.setAttribute('data-step',String(er.top<window.innerHeight*.5?5:n));
        };
        var req=function(){if(!queued){queued=true;requestAnimationFrame(tick)}};
        window.addEventListener('scroll',req,{passive:true});
        new MutationObserver(req).observe(root,{attributes:true,attributeFilter:['data-hero-done']});
        tick();
        if(cert){
          if('IntersectionObserver' in window){
            var io3=new IntersectionObserver(function(en){if(en[0].isIntersecting){cert.classList.add('in');io3.disconnect()}},{threshold:.18});
            io3.observe(cert);
          }else cert.classList.add('in');
        }
      }
    }
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
