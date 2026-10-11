/* paradigm table (synced from envelope-v5): rows reveal one at a time (grey value, then ours).
   Off for ?static=1, ?t= and reduced motion. */
(function(){
  var root=document.documentElement, t=document.querySelector('.ptab'), q=location.search;
  if(!t) return;
  var still=/[?&]static=1/.test(q)||/[?&]t=/.test(q)||
    (window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||!('IntersectionObserver' in window);
  if(still) return;
  root.classList.add('ptab-anim');
  var rows=[].slice.call(t.querySelectorAll('tbody tr'));
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      io.unobserve(e.target);
      rows.forEach(function(tr,i){ setTimeout(function(){ tr.classList.add('in'); }, i*260); });
    });
  },{threshold:.35});
  io.observe(t);
})();
