(function(){
  'use strict';
  var root=document.documentElement;
  var STATIC=root.classList.contains('static');
  var REDUCED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INSTANT=STATIC||REDUCED;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}

  /* ---------- hero terminal ---------- */
  var hero=$('#heroTerm');
  if(hero){
    var lines=$$('.ln',hero);
    var hLead=$('#heroLead'), hQ=$('#heroQ');
    var done=function(){root.setAttribute('data-hero-done','1')};
    if(INSTANT){
      lines.forEach(function(l){l.classList.add('on')});
      [hLead,hQ].forEach(function(e){if(e)e.classList.add('show')});
      done();
    }else{
      (async function(){
        var first=lines[0], tx=$('.tx',first), html=tx.innerHTML, text=tx.getAttribute('data-text');
        tx.textContent='';
        first.classList.add('on');
        var cur=document.createElement('span');cur.className='cursor';cur.setAttribute('aria-hidden','true');
        first.appendChild(cur);
        await wait(900);
        for(var i=1;i<=text.length;i++){tx.textContent=text.slice(0,i);await wait(26+Math.random()*22)}
        tx.innerHTML=html; first.removeChild(cur);
        await wait(380);
        for(var j=1;j<lines.length;j++){lines[j].classList.add('on');await wait(j===lines.length-2?520:600)}
        await wait(200);
        if(hLead)hLead.classList.add('show');
        await wait(1100);
        if(hQ)hQ.classList.add('show');
        await wait(900);
        done();
      })();
    }
  }

  /* ---------- scroll reveals ---------- */
  var rvs=$$('.rv');
  if(INSTANT||!('IntersectionObserver' in window)){
    rvs.forEach(function(e){e.classList.add('in')});
  }else{
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
    },{rootMargin:'0px 0px -12% 0px',threshold:.12});
    rvs.forEach(function(e){io.observe(e)});
  }

  /* ---------- callback replay (v4: + baseline / current-action panels) ---------- */
  var cb=$('#cbTerm');
  if(cb){
    var grid=cb.parentNode, cl=$$('.ln',cb), w=$('.watcher',cb), blk=$('.blk',cb);
    var toks=$$('#cbSide .tok'), wls=$$('#curWatch .wl'), curLab=$('#curLab'), curMeta=$('#curMeta');
    var st=$('#cbState'), stT=$('#cbStateT'), cert=$('#cert');
    var place=function(l){
      if(!w||!l)return;
      var lh=parseFloat(getComputedStyle(l).lineHeight)||24;
      w.style.top=(l.offsetTop+lh/2-w.offsetHeight/2)+'px';
    };
    var show=function(i){wls.forEach(function(x,j){if(j>0&&j<=i)x.classList.add('on');}); wls[0].classList.remove('on');};
    var hit=function(k){if(toks[k])toks[k].classList.add('hit')};
    var flip=function(){
      grid.classList.add('cb-dev');
      if(toks[2])toks[2].classList.add('exp');
      curLab.textContent='deviation detected'; curMeta.textContent='blocked';
      st.classList.remove('guarded'); st.classList.add('dev'); stT.textContent='deviation';
      if(blk)blk.classList.add('on');
    };
    var target=function(){return cl[3]};
    wls[0].classList.add('on');
    if(INSTANT){
      cl.forEach(function(l){l.classList.add('on')});
      hit(0);hit(1);show(2);flip();if(cert)cert.classList.add('in');
      place(target());
      window.addEventListener('load',function(){place(target())});
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){place(target())});
      root.setAttribute('data-cb','done');
    }else{
      place(cl[0]);
      var ran=false;
      var run=async function(){
        if(ran)return;ran=true;
        root.setAttribute('data-cb','run');
        await wait(350);
        cl[0].classList.add('on');place(cl[0]);await wait(600);
        cl[1].classList.add('on');place(cl[1]);await wait(380);
        hit(0);show(1);await wait(320);
        cl[2].classList.add('on');place(cl[2]);await wait(380);
        hit(1);show(2);await wait(320);
        cl[3].classList.add('on');place(cl[3]);wls[3].classList.add('on');await wait(650);
        flip();root.setAttribute('data-cb','dev');await wait(500);
        cl[4].classList.add('on');
        if(cert)cert.classList.add('in');
        await wait(900);
        root.setAttribute('data-cb','done');cb.classList.add('cb-done');
      };
      var io2=new IntersectionObserver(function(ents){
        if(ents[0].isIntersecting){run();io2.disconnect()}
      },{threshold:.45});
      io2.observe(cb);
    }
    var lastW=window.innerWidth;
    window.addEventListener('resize',function(){
      if(window.innerWidth===lastW)return;lastW=window.innerWidth;
      var on=cl.filter(function(l){return l.classList.contains('on')&&!l.classList.contains('ln-cur')});
      place(on.length?on[on.length-1]:cl[0]);
    });
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
