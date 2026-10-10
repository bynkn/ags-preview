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

  /* ---------- world switch: dark → swiss red (scroll-linked) ---------- */
  var Q=new URLSearchParams(location.search);
  function clamp(v){return v<0?0:v>1?1:v}
  function ss(a,b,v){var x=clamp((v-a)/(b-a));return x*x*(3-2*x)}
  function hex(v){v=(v||'').trim().replace('#','');if(v.length===3)v=v.replace(/./g,'$&$&');return [0,2,4].map(function(i){return parseInt(v.substr(i,2),16)})}
  function mix(a,b,t){return [0,1,2].map(function(i){return Math.round(a[i]+(b[i]-a[i])*t)})}
  function rgb(c){return 'rgb('+c.join(',')+')'}
  var cs=getComputedStyle(root);
  // tokens eased with the light (e), with the ink (f), or with the watching dot (a)
  var TOK={e:['bg','bg2','p1','bar','lt','ph','bh'],f:['ln','ln2','tx','tx2','mu','mu2','dim','eye','green','stop','amber','bht'],a:['dot']};
  var PAL={};
  Object.keys(TOK).forEach(function(k){TOK[k].forEach(function(n){PAL[n]=[hex(cs.getPropertyValue('--A-'+n)),hex(cs.getPropertyValue('--B-'+n))]})});
  var meta=$('meta[name="theme-color"]'), dawn=$('#dawn'), lastKey='';
  function paint(t){
    var e=ss(0,1,ss(0.06,1,t)), f=ss(0.47,0.56,e), a=ss(0.55,0.85,t), k=e.toFixed(3)+'|'+a.toFixed(3);
    if(k===lastKey)return; lastKey=k;
    var s=root.style, W={e:e,f:f,a:a};
    Object.keys(TOK).forEach(function(g){TOK[g].forEach(function(n){
      var c=mix(PAL[n][0],PAL[n][1],W[g]); s.setProperty('--'+n,rgb(c));
      if(n==='bg')s.setProperty('--bgc',c.join(','));
      if(n==='tx')s.setProperty('--txc',c.join(','));
      if(n==='dot')s.setProperty('--dotc',c.join(','));
    })});
    s.setProperty('--t',e.toFixed(3)); s.setProperty('--a',a.toFixed(3));
    root.setAttribute('data-world',e>0.5?'red':'dark');
    if(meta)meta.setAttribute('content',rgb(mix(PAL.bg[0],PAL.bg[1],e)));
  }
  var wTick=false;
  function wUpdate(){
    wTick=false; if(!dawn)return;
    var vh=window.innerHeight, r=dawn.getBoundingClientRect(), t;
    if(STATIC){ t=(r.top+r.height*.5)<64?1:0; }   // static: each band paints its own world, the header follows what is under it
    else{ var start=vh*0.8, end=vh*0.4-r.height; t=clamp((start-r.top)/(start-end)); }
    paint(t);
  }
  function wScroll(){if(!wTick){wTick=true;requestAnimationFrame(wUpdate)}}
  window.addEventListener('scroll',wScroll,{passive:true});
  window.addEventListener('resize',wScroll);
  wUpdate();

  /* ---------- callback replay ----------
     A pure function of time: render(t). Starts when the terminal scrolls into view.
     ?static=1 → final state · ?t=<ms> → frozen frame at t.  ~7.6s total. */
  var CB={t0:null,end:7650,hand:420};
  var cb=$('#cbTerm');
  if(cb){
    var T={
      lines:[[250,1350],[1650,2350],[3000,3700],[4550,6150]], // [type start, type end]; a line every ~1350ms
      pass:[null,2500,3850],   // "ok" + "matches baseline"
      // brief hold (~700ms) after the second "ok" before the transfer line starts
      flip:6150,               // red the moment the transfer line completes
      prompt:6450,             // $ ▌
      cert:7150,               // ~1000ms after the flip
      foot:7350,
      end:7650
    };
    var grid=cb.parentNode, cl=$$('.ln',cb), w=$('.watcher',cb), blk=$('.blk',cb);
    var toks=$$('#cbSide .tok'), wls=$$('#curWatch .wl'), curLab=$('#curLab'), curMeta=$('#curMeta');
    var st=$('#cbState'), stT=$('#cbStateT'), cert=$('#cert');
    function tog(el,c,on){if(el&&el.classList.contains(c)!==on)el.classList.toggle(c,on)}
    // typed lines: every text node outside the late badges, with a deterministic "human" rhythm
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
        tog(L.el,'typing',on&&p<1);
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
      var lab=dev?'deviation detected':'current action', meta2=dev?'blocked':'watching', stx=dev?'deviation':'guarded';
      if(curLab.textContent!==lab)curLab.textContent=lab;
      if(curMeta.textContent!==meta2)curMeta.textContent=meta2;
      if(stT.textContent!==stx)stT.textContent=stx;
      tog(cl[4],'on',t>=T.prompt);
      if(cert)tog(cert,'in',t>=T.cert);
      tog(cb,'cb-done',t>=T.foot);
      tog(grid,'cb-hand',t>=CB.hand);   // the rail dot has arrived: the terminal's own dot takes over
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
      var raf=0,t0=0;
      var loop=function(now){var t=now-t0;render(t);if(t<T.end)raf=requestAnimationFrame(loop)};
      var io2=new IntersectionObserver(function(ents){
        if(ents[0].isIntersecting){io2.disconnect();requestAnimationFrame(function(now){t0=now;CB.t0=now;kick();render(0);raf=requestAnimationFrame(loop)})}
      },{threshold:.45});
      io2.observe(cb);
    }
    var lastW=window.innerWidth;
    window.addEventListener('resize',function(){if(window.innerWidth===lastW)return;lastW=window.innerWidth;replace()});
  }


  /* ---------- the watching-dot rail ----------
     A fixed rail on the left. The dot follows scroll progress (eased, rAF), dwells at
     each key moment (data-stop) with one soft pulse, and a tick marks every stop.
     Dim grey in the dark opening, red with a glow in the red world (--dot/--a from paint()).
     At the callback it slides into the terminal (the .watcher takes over) and comes back after. */
  var rail=$('#rail'), rdot=$('#railDot'), tEl=$('#railTicks'), navDot=$('.nav-dot');
  var stops=$$('[data-stop]'), ticks=[];
  stops.forEach(function(){var i=document.createElement('i');tEl.appendChild(i);ticks.push(i)});
  var M={H:1,max:1,L:1,iv:[],r:[]}, cur=null, pulsed=-1, running=false, watcherEl=$('.watcher');
  function docY(el){var r=el.getBoundingClientRect();return r.top+scrollY+r.height/2}
  function mapR(s){
    var m=s;M.iv.forEach(function(v){if(s>=v[1])m-=v[1]-v[0];else if(s>v[0])m-=s-v[0]});
    return M.L>0?clamp(m/M.L):0;
  }
  function measure(){
    if(STATIC){
      var top=parseFloat(getComputedStyle(rail).top)||100, dh=document.documentElement.scrollHeight, H=Math.max(1,dh-top-44);
      rail.style.height=H+'px'; M.H=H;
      var dw=dawn?dawn.getBoundingClientRect():null, d0=dw?(dw.top+scrollY-top)/H:.3, d1=dw?(dw.bottom+scrollY-top)/H:.34;
      rail.style.setProperty('--rs1',(d0*100).toFixed(2)+'%'); rail.style.setProperty('--rs2',(d1*100).toFixed(2)+'%');
      var last=0;
      stops.forEach(function(el,k){var r=clamp((docY(el)-top)/H);M.r[k]=r;ticks[k].style.top=(r*100)+'%';
        ticks[k].className=(r<(d0+d1)/2?'dk':'lt')+(k===stops.length-1?' on':' past');last=r});
      rdot.style.transform='translate3d(0,'+(last*H).toFixed(1)+'px,0)';
      return;
    }
    var vh=innerHeight; M.H=rail.offsetHeight; M.max=Math.max(1,document.documentElement.scrollHeight-vh);
    var W=vh*0.14, prevB=0, S=stops.map(function(el,k){return k===0?0:clamp((docY(el)-vh*0.45)/M.max)*M.max});
    M.iv=S.map(function(s){var a=Math.max(0,s-W,prevB),b=Math.min(M.max,Math.max(a,s+W));prevB=b;return [a,b]});
    var P=M.iv.reduce(function(acc,v){return acc+v[1]-v[0]},0); M.L=M.max-P;
    M.r=M.iv.map(function(v){return mapR(v[0])});
    ticks.forEach(function(t,k){t.style.top=(M.r[k]*100).toFixed(3)+'%'});
    kick();
  }
  function pulse(){
    if(REDUCED)return;
    [rdot,navDot].forEach(function(d){if(!d)return;d.classList.remove('pulse');void d.offsetWidth;d.classList.add('pulse')});
  }
  function ease(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function frame(now){
    running=false;
    var sY=scrollY, target=mapR(sY)*M.H;
    if(cur===null||REDUCED)cur=target; else cur+=(target-cur)*0.13;
    if(Math.abs(target-cur)<.2)cur=target;
    var x=0,y=cur,hidden=false,busy=Math.abs(target-cur)>.2;
    // callback handoff
    if(CB.t0!==null&&watcherEl){
      var el=now-CB.t0, h=-1;
      if(el<CB.hand)h=ease(el/CB.hand);
      else if(el<CB.end)hidden=true;
      else if(el<CB.end+650)h=1-ease((el-CB.end)/650);
      if(h>=0){
        var rr=rail.getBoundingClientRect(), wr=watcherEl.getBoundingClientRect();
        var wx=wr.left+wr.width/2-rr.left, wy=wr.top+wr.height/2-rr.top;
        x=wx*h; y=cur+(wy-cur)*h;
      }
      if(el<CB.end+700)busy=true;
    }
    rdot.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';
    if(rdot.classList.contains('gone')!==hidden)rdot.classList.toggle('gone',hidden);
    // which stop are we dwelling on?
    var k=-1;M.iv.forEach(function(v,i){if(sY>=v[0]-1&&sY<=v[1]+1)k=i});
    var ry=k>=0?M.r[k]*M.H:0, arrived=k>=0&&Math.abs(cur-ry)<1.5;
    if(k===0&&root.getAttribute('data-hero-done')!=='1')arrived=false;
    if(arrived&&pulsed!==k&&!hidden){pulsed=k;pulse()}
    if(k<0)pulsed=-1;
    ticks.forEach(function(t,i){var on=i===k&&arrived, past=!on&&M.r[i]*M.H<cur-2;
      if(t.classList.contains('on')!==on)t.classList.toggle('on',on);
      if(t.classList.contains('past')!==past)t.classList.toggle('past',past)});
    if(busy||(k===0&&pulsed!==0))kick();
  }
  function kick(){if(!running&&!STATIC){running=true;requestAnimationFrame(frame)}}
  if(rail&&rdot){
    measure();
    window.addEventListener('scroll',kick,{passive:true});
    window.addEventListener('resize',measure);
    window.addEventListener('load',measure);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
    if(window.ResizeObserver)new ResizeObserver(function(){measure()}).observe(document.body);
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
