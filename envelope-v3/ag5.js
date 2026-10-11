/* ag5 · envelope-v5 proof components: the step replay for the proof block and the certificate reveal.
   Time-driven (starts when the block is in view), like the host pages' own replays.
   ?static=1 / prefers-reduced-motion: the final (blocked) state, no motion. ?t=<ms>: frozen frame at t. */
(function(){
  'use strict';
  var r=document.documentElement,q=location.search;
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ST=/[?&]static=1/.test(q), TM=q.match(/[?&]t=(\d+)/);
  r.classList.add('a5-js');
  if(ST||RM)r.classList.add('a5-instant');else if(TM)r.classList.add('a5-fixed');
  var INSTANT=ST||RM, FIXED=!INSTANT&&TM?+TM[1]:null;
  var STEP=2600, CERT=STEP*3+1300;     // WATCHING → BEHAVIOUR LOCKED → PROTECTED → SOMETHING LOOKS OFF, then the certificate
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  var certs=$$('.a5c .a5-cert');
  function showCerts(){certs.forEach(function(c){c.classList.add('a5-in')})}
  var blocks=$$('.a5p');
  function render(b,t){
    var s=t<0?2:Math.min(5,2+Math.floor(t/STEP));
    if(b.getAttribute('data-step')!==String(s)){
      b.setAttribute('data-step',String(s));
      $$('.a5-cap[data-c]',b).forEach(function(c){c.classList.toggle('on',+c.getAttribute('data-c')===s-1)});
      $$('.a5-cap-row .a5-pips i',b).forEach(function(p,i){p.classList.toggle('on',i<s-1)});
    }
    if(t>=CERT)showCerts();
  }
  // optional: a host without its own opening-terminal script can ask the module to reveal it
  $$('.a5h[data-a5-drive]').forEach(function(h){
    var ls=$$('.a5-ln',h);
    if(INSTANT||FIXED!==null){ls.forEach(function(l){l.classList.add('on')});return}
    ls.forEach(function(l,i){setTimeout(function(){l.classList.add('on')},500+i*420)});
  });
  // the certificate shows once it is on screen (or when the replay ends), so it never leaves an empty gap
  if(INSTANT||FIXED!==null||!('IntersectionObserver' in window))showCerts();
  else{var io0=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('a5-in');io0.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px'});certs.forEach(function(c){io0.observe(c)})}
  blocks.forEach(function(b){
    if(b.hasAttribute('data-a5-ext'))return;   // the host page drives this block (e.g. a scroll-pinned stage)
    b.classList.add('a5-live');
    if(INSTANT){render(b,STEP*3);showCerts();return}
    if(FIXED!==null){render(b,FIXED);return}
    if(!('IntersectionObserver' in window)){render(b,STEP*3);showCerts();return}
    b.setAttribute('data-step','');render(b,-1);
    var io=new IntersectionObserver(function(es){
      if(!es[0].isIntersecting)return;io.disconnect();
      var t0=performance.now();
      (function loop(){var t=performance.now()-t0;render(b,t);if(t<CERT)setTimeout(loop,100)})();
    },{rootMargin:'0px 0px -40% 0px'});
    io.observe(b);
  });
})();
