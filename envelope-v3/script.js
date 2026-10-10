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
        lines[1].classList.add('on');await wait(950);   // read_file
        lines[2].classList.add('on');await wait(1250);  // the $4,800 transfer
        lines[3].classList.add('on');await wait(900);   // rm -rf logs/
        lines[4].classList.add('on');await wait(400);   // ✔ transfer complete · $4,800 sent
        lines[5].classList.add('on');
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
     Steps 1-4 live on a pinned stage, each owning a quarter of the pinned scroll (30vh).
     The stage only appears once the reality screen has fully left (under the nav).
     Step 4 (BLOCKED) flips the page to the light world; step 5 + the certificate follow in flow.
     ?static=1 / reduced motion: stacked steps with captions, each band in its own world.
     ?t=<ms>: frozen frame, step = 1 + floor(t / 2200); t >= 8800 shows step 5 + certificate. */
  var track=$('#track'), stage=$('#stage'), si=$('#stageIn'), cert=$('#cert'), proofEnd=$('#proofEnd'), proof=$('#proof'), realityEnd=$('#realityEnd'), why=$('#why');
  var STEP_MS=2200;
  function setStep(el,n){
    var s=String(n);
    if(el.getAttribute('data-step')!==s)el.setAttribute('data-step',s);
    $$('.caps .cap',el).forEach(function(c){c.classList.toggle('on',+c.getAttribute('data-c')===n)});
    $$('.step-k .pips i',el).forEach(function(p,i){p.classList.toggle('on',i<n)});
    var stt=$('.st-t',el);if(stt)stt.textContent=n<4?'guarded':'deviation';
  }
  var meta=$('meta[name="theme-color"]');
  function world(light){
    var w=light?'light':'dark';
    if(root.getAttribute('data-world')!==w){root.setAttribute('data-world',w);if(meta)meta.setAttribute('content',light?'#F5F5F3':'#0a0a0a')}
  }
  function band(el,light){el.classList.toggle('lw',light);el.classList.toggle('dw',!light)}

  if(track&&si){
    if(INSTANT){
      var box=document.createElement('div');box.className='static-steps';
      for(var n=1;n<=4;n++){
        if(n===4&&FLIP==='blocked'){var dz=document.createElement('div');dz.className='sdawn';dz.setAttribute('aria-hidden','true');box.appendChild(dz)}
        var b=document.createElement('div');b.className='sband';
        band(b,n===4&&FLIP==='blocked');
        var c=si.cloneNode(true);c.removeAttribute('id');c.classList.add('live');
        if(n===2)c.classList.add('only-strip');
        setStep(c,n);b.appendChild(c);box.appendChild(b);
      }
      track.parentNode.replaceChild(box,track);
      band(proofEnd,FLIP==='blocked');
      if(cert)cert.classList.add('in');
    }else if(FIXED){
      var t=+Q.get('t')||0, k=Math.max(1,Math.min(5,1+Math.floor(t/STEP_MS)));
      si.classList.add('live');setStep(si,Math.min(k,4));
      if(cert)cert.classList.toggle('in',k>=5);
      band(proof,k>=4&&FLIP==='blocked');
      root.setAttribute('data-step',String(k));
    }else{
      setStep(si,1);
      var fit=function(){
        var nh=navH();
        proofEnd.style.marginTop='0px';
        var sr=stage.getBoundingClientRect(), ir=si.getBoundingClientRect();
        // step 5 sits ~64px under the terminal as the stage unpins (no dead scroll)
        proofEnd.style.marginTop=Math.round((nh<64?44:64)-(sr.bottom-ir.bottom))+'px';
      };
      fit();
      window.addEventListener('load',fit);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
      var cur=0, queued=false;
      var tick=function(){
        queued=false;
        var nh=navH(), vh=window.innerHeight;
        var r=track.getBoundingClientRect(), total=track.offsetHeight-stage.offsetHeight;
        var p=total>0?(nh-r.top)/total:0;
        var k=p<.25?1:p<.5?2:p<.75?3:4;
        // the stage appears only once the reality screen is fully gone (above the nav)
        var gone=!realityEnd||realityEnd.getBoundingClientRect().bottom<nh+2;
        si.classList.toggle('live',gone);
        if(!gone)k=1;
        if(k!==cur){cur=k;setStep(si,k)}
        var er=proofEnd.getBoundingClientRect();
        root.setAttribute('data-step',String(er.top<vh*.5?5:k));
        // the flip
        var light=FLIP==='why'?(why.getBoundingClientRect().top<vh*.6):(gone&&p>=.75);
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
