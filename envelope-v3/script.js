(function(){
  'use strict';
  var root=document.documentElement;
  var INSTANT=root.classList.contains('instant');   // ?static=1 or prefers-reduced-motion
  var FIXED=root.classList.contains('fixed');       // ?t=<ms>
  var Q=new URLSearchParams(location.search);
  var FLIP=root.getAttribute('data-flip');          // 'blocked' (default) | 'why'
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function navH(){return window.innerWidth<=760?56:64}

  /* ---------- 1a · the envelope: the terminal types, then holds still ---------- */
  var hero=$('#heroTerm'), stack=$('#envStack'), envQ=$('#envQ'), hLead=$('#heroLead'), hQ=$('#heroQ');
  var done=function(){if(!root.hasAttribute('data-hero-done'))root.setAttribute('data-hero-done','1')};
  var showQ=function(){[hLead,hQ].forEach(function(e){if(e)e.classList.add('show')})};
  if(hero){
    var lines=$$('.ln',hero);
    if(INSTANT||FIXED){lines.forEach(function(l){l.classList.add('on')});showQ();done()}
    else{
      // the terminal starts centred on its own; it rises as the question fades in beneath it
      var opened=false;
      var setShift=function(){if(!opened&&stack&&envQ)stack.style.setProperty('--shift',((envQ.offsetHeight+parseFloat(getComputedStyle(envQ).marginTop))/2)+'px')};
      setShift();window.addEventListener('resize',setShift);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setShift);
      var open=function(){opened=true;if(stack)stack.style.setProperty('--shift','0px')};
      (async function(){
        var first=lines[0], tx=$('.tx',first), html=tx.innerHTML, text=tx.getAttribute('data-text');
        tx.textContent='';first.classList.add('on');
        var cur=document.createElement('span');cur.className='cursor';cur.setAttribute('aria-hidden','true');first.appendChild(cur);
        await wait(800);
        for(var i=1;i<=text.length;i++){tx.textContent=text.slice(0,i);await wait(32+Math.random()*24)}
        tx.innerHTML=html;first.removeChild(cur);
        await wait(650);
        for(var k=1;k<lines.length;k++){lines[k].classList.add('on');await wait(k===lines.length-1?400:720)}
        await wait(1100);                               // a short beat
        open();await wait(250);
        if(hLead)hLead.classList.add('show');
        await wait(1000);
        if(hQ)hQ.classList.add('show');
        await wait(1600);                               // stillness
        done();
      })();
      window.addEventListener('scroll',function s(){if(window.scrollY>40){lines.forEach(function(l){l.classList.add('on')});open();showQ();done();window.removeEventListener('scroll',s)}},{passive:true});
    }
  }

  /* ---------- reveals (single elements .rv, staggered groups .grp) ---------- */
  var rvs=$$('.rv').concat($$('.grp'));
  if(INSTANT||FIXED||!('IntersectionObserver' in window)){rvs.forEach(function(e){e.classList.add('in')})}
  else{
    var io=new IntersectionObserver(function(ents){ents.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -14% 0px',threshold:.12});
    rvs.forEach(function(e){io.observe(e)});
  }

  /* ---------- 3 · the proof ----------
     Steps 1-5 live on a pinned stage over developer-v7's callback components, each step
     owning a fifth of the pinned scroll. The stage only appears once the reality screen has
     fully left (under the nav). Step 5 (BLOCKED) flips the page to the light world.
     Step 6 ("And it leaves proof." + v7's compact Detection Certificate) follows in flow.
     ?static=1 / reduced motion: stacked steps with captions, each band in its own world.
     ?t=<ms>: frozen frame, step = 1 + floor(t / 2200); t >= 11000 shows step 6. */
  var track=$('#track'), stage=$('#stage'), si=$('#stageIn'), cert=$('#cert'), proofEnd=$('#proofEnd'), proof=$('#proof'), realityEnd=$('#realityEnd'), why=$('#why');
  var STEP_MS=2200, N=4;   // v5's 4 steps: WATCHING → BEHAVIOUR LOCKED → PROTECTED → SOMETHING LOOKS OFF
  function placeWatcher(el){
    var w=$('.watcher',el); if(!w)return;
    var on=$$('.term-body .ln',el).filter(function(l){return l.offsetParent!==null&&!l.classList.contains('ln-cur')});
    var l=on[on.length-1]; if(!l)return;
    var lh=parseFloat(getComputedStyle(l).lineHeight)||24;
    w.style.top=(l.offsetTop+lh/2-4)+'px';
  }
  function setStep(el,n){   // v5 proof block (ag5): data-step 2..5, one caption per step, pips fill
    var st=String(n+1);
    if(el.getAttribute('data-step')!==st)el.setAttribute('data-step',st);
    $$('.a5-cap[data-c]',el).forEach(function(c){c.classList.toggle('on',+c.getAttribute('data-c')===n)});
    $$('.a5-cap-row .a5-pips i',el).forEach(function(p,i){p.classList.toggle('on',i<n)});
  }
  function a5w(el,light){if(!el)return;$$('.a5',el).concat(el.classList.contains('a5')?[el]:[]).forEach(function(a){a.classList.toggle('a5-dark',!light)})}

  var meta=$('meta[name="theme-color"]');
  function world(light){
    var w=light?'light':'dark';
    a5w(proof,light);
    if(root.getAttribute('data-world')!==w){root.setAttribute('data-world',w);if(meta)meta.setAttribute('content',light?'#F5F5F3':'#0a0a0a')}
  }
  function band(el,light){el.classList.toggle('lw',light);el.classList.toggle('dw',!light);a5w(el,light)}

  if(track&&si){
    if(INSTANT){
      var box=document.createElement('div');box.className='static-steps';
      if(FLIP==='blocked'){var dz=document.createElement('div');dz.className='sdawn';dz.setAttribute('aria-hidden','true');box.appendChild(dz)}
      var b=document.createElement('div');b.className='sband';
      track.parentNode.replaceChild(box,track);
      b.appendChild(si);box.appendChild(b);
      setStep(si,N);band(b,FLIP==='blocked');band(proofEnd,FLIP==='blocked');
    }else if(FIXED){
      var t=+Q.get('t')||0, k=Math.max(1,Math.min(N+1,1+Math.floor(t/STEP_MS)));
      si.classList.add('live');
      var fx=function(){setStep(si,Math.min(k,N))};fx();
      window.addEventListener('load',fx);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fx);
      if(cert)cert.classList.toggle('in',k>N);
      band(proof,k>=N&&FLIP==='blocked');
      root.setAttribute('data-step',String(k));
    }else{
      setStep(si,1);
      var fit=function(){
        var nh=navH();
        proofEnd.style.marginTop='0px';
        // measure with the tallest (final) step laid out, then restore
        var was=si.getAttribute('data-step');si.setAttribute('data-step',String(N+1));
        var sr=stage.getBoundingClientRect(), ir=si.getBoundingClientRect();
        si.setAttribute('data-step',was);
        // step 6 sits ~56px under the stage content as the stage unpins (no dead scroll)
        proofEnd.style.marginTop=Math.round((nh<64?40:56)-(sr.bottom-ir.bottom))+'px';
        placeWatcher(si);
      };
      fit();
      window.addEventListener('load',fit);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
      var cur=0, queued=false;
      var tick=function(){
        queued=false;
        var nh=navH(), vh=window.innerHeight;
        // very short phones: if the stage is taller than the space under the nav, let it ride up so its bottom stays visible
        var sh=stage.offsetHeight, stick=Math.min(nh,vh-sh);
        if(stage.style.top!==stick+'px')stage.style.top=stick+'px';
        var r=track.getBoundingClientRect(), total=track.offsetHeight-sh;
        var p=total>0?(stick-r.top)/total:0;
        var k=Math.max(1,Math.min(N,1+Math.floor(p*N)));
        // the stage appears only once the reality screen is fully gone (above the nav)
        var gone=!realityEnd||realityEnd.getBoundingClientRect().bottom<nh+2;
        si.classList.toggle('live',gone);si.classList.toggle('a5-live',gone);
        if(!gone)k=1;
        if(k!==cur){cur=k;setStep(si,k);req()}
        var er=proofEnd.getBoundingClientRect();
        root.setAttribute('data-step',String(er.top<vh*.5?N+1:k));
        var light=FLIP==='why'?(why.getBoundingClientRect().top<vh*.6):(gone&&k>=N);
        world(light);
      };
      var req=function(){if(!queued){queued=true;requestAnimationFrame(tick)}};
      window.addEventListener('scroll',req,{passive:true});
      window.addEventListener('resize',function(){fit();req()});
      tick();
      if(cert){
        if('IntersectionObserver' in window){
          var io3=new IntersectionObserver(function(en){if(en[0].isIntersecting){cert.classList.add('in');io3.disconnect()}},{threshold:.18});
          io3.observe(cert);
        }else cert.classList.add('in');
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
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){em.classList.add('bad');err.textContent='enter a valid email';em.focus();return}
      em.classList.remove('bad');err.textContent='';f.classList.add('done');ok.hidden=false;
    });
    em.addEventListener('input',function(){em.classList.remove('bad');err.textContent=''});
  }
})();
