/* Agentic Guardians · v3 · vanilla, no build step */
(function () {
  'use strict';

  /* ---- Act 1: pure black, monochrome. Act 2: one of four calm safe worlds (?safe=) ---- */
  var A = { bg: [0, 0, 0], fg: [255, 255, 255], mu: [138, 138, 138], dot: [92, 92, 92] };
  var PAL = {
    graphite: { bg: [28, 29, 27], fg: [233, 230, 223], mu: [154, 151, 143], dot: [168, 213, 194], acc: [233, 230, 223], glow: 1, flip: null, pow: 1 },
    swissred: { bg: [245, 245, 243], fg: [10, 10, 10], mu: [98, 97, 93], dot: [227, 6, 19], acc: [227, 6, 19], glow: 0, flip: [0.48, 0.62], pow: 1.35 },
    dots:     { bg: [241, 237, 228], fg: [20, 20, 20], mu: [104, 100, 92], dot: [232, 73, 47], acc: [232, 73, 47], glow: 0, flip: [0.48, 0.62], pow: 1.35 },
    teal:     { bg: [63, 58, 55], fg: [239, 234, 226], mu: [167, 159, 150], dot: [108, 192, 184], acc: [108, 192, 184], glow: 0, flip: null, pow: 1 },
    blue:     { bg: [91, 184, 214], fg: [10, 10, 10], mu: [31, 77, 92], dot: [255, 255, 255], acc: [10, 10, 10], glow: 0, flip: [0.5, 0.66], pow: 1.2 },
    dotsflat: { bg: [241, 237, 228], fg: [20, 20, 20], mu: [104, 100, 92], dot: [140, 207, 203], acc: [232, 73, 47], glow: 0, flip: [0.48, 0.62], pow: 1.35 },
    tealflat: { bg: [63, 58, 55], fg: [239, 234, 228], mu: [167, 159, 150], dot: [108, 192, 184], acc: [108, 192, 184], glow: 0, flip: null, pow: 1 }
  };
  var d = document.documentElement;
  var B = PAL[d.getAttribute('data-safe')] || PAL.graphite;
  // phases along the threshold: grain fades → a beat of stillness → the world shifts
  var GRAIN_OUT = [0, 0.24], SHIFT = [0.4, 1];

  var NM = d.classList.contains('no-motion');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ss(a, b, v) { var x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); }
  function rgb(c) { return 'rgb(' + c.join(',') + ')'; }

  /* ---------------- threshold: scroll-linked world change ---------------- */
  var meta = $('meta[name="theme-color"]'), dawn = $('#dawn'), last = '';
  function set(name, c) { d.style.setProperty('--' + name, rgb(c)); d.style.setProperty('--' + name + 'c', c.join(',')); }
  function paint(t, g) {
    var key = t.toFixed(3) + '|' + g.toFixed(3);
    if (key === last) return; last = key;
    var e = Math.pow(ss(SHIFT[0], SHIFT[1], t), B.pow);   // light worlds: lights come up slowly, like a gallery
    var bg = mix(A.bg, B.bg, e);
    var f = B.flip ? ss(B.flip[0], B.flip[1], e) : e;     // light worlds: ink takes over once the room is lit
    var fg = mix(A.fg, B.fg, f);
    var alive = ss(0.72, 1, t);                           // the signal comes alive last
    set('bg', bg); set('fg', fg);
    d.style.setProperty('--mu', rgb(mix(A.mu, B.mu, f)));
    var dt = mix(A.dot, B.dot, alive);
    d.style.setProperty('--dot', rgb(dt)); d.style.setProperty('--dotc', dt.join(','));
    var ac = mix(fg, B.acc, alive);
    d.style.setProperty('--acc', rgb(ac)); d.style.setProperty('--accc', ac.join(','));
    d.style.setProperty('--glow', (B.glow * alive).toFixed(3));
    d.style.setProperty('--grain', g.toFixed(3));
    if (meta) meta.setAttribute('content', rgb(bg));
  }
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight, r = dawn.getBoundingClientRect(), t, g;
    if (NM) {
      // every section paints its own world; header follows whatever is under it
      t = (r.top + r.height * 0.5) < 64 ? 1 : 0; g = 1 - t;
    } else {
      var start = vh * 0.8, end = vh * 0.45 - r.height;
      t = clamp((start - r.top) / (start - end));
      g = 1 - ss(GRAIN_OUT[0], GRAIN_OUT[1], t);
    }
    paint(t, g);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------------- motif: dot grid (dots) / rounded tiles (teal) ---------------- */
  var motif = $('#motif'), pal = d.getAttribute('data-safe');
  if (motif && pal === 'dots') {
    // 6 rows × 18: vermilion above, teal below, with a soft wave of drop-outs (after the brochure)
    var html = '';
    for (var r = 0; r < 6; r++) for (var c = 0; c < 18; c++) {
      var w = Math.sin(c * 0.55) * 1.2 + 3.4;               // wave edge between colours
      var gap = (r === 5 && c % 3 !== 0) || (r === 4 && (c % 5 === 2));
      html += '<i class="' + (gap ? 'o' : (r < w - 0.6 ? 'v' : 't')) + '"></i>';
    }
    motif.innerHTML = html;
  } else if (motif && pal === 'teal') {
    var T = ['q4', 'c', 'q3', 'tu', 'c',
             'q1', 'td', 'q2', 'c', 'q1'];
    motif.innerHTML = T.map(function (k) { return '<i class="' + k + '"></i>'; }).join('');
  }

  /* ---------------- typing ---------------- */
  function prep(term, full) {
    $$('.seg', term).forEach(function (sg) {
      var text = sg.getAttribute('data-t');
      sg.innerHTML = '<span class="ty"></span><span class="gh"></span>';
      sg.firstChild.textContent = full ? text : '';
      sg.lastChild.textContent = full ? '' : text;
    });
    $$('.ln', term).forEach(function (ln) { ln.classList.toggle('on', !!full); });
  }
  function typeLine(ln, speed) {
    ln.classList.add('on', 'typing');
    var segs = $$('.seg', ln);
    return segs.reduce(function (p, sg) {
      return p.then(function () {
        var text = sg.getAttribute('data-t'), ty = sg.firstChild, gh = sg.lastChild, i = 0;
        sg.classList.add('act');
        return new Promise(function (res) {
          (function step() {
            i += text.length > 30 ? 2 : 1;
            ty.textContent = text.slice(0, i); gh.textContent = text.slice(i);
            if (i < text.length) setTimeout(step, speed + Math.random() * speed * 0.9);
            else { sg.classList.remove('act'); res(); }
          })();
        });
      });
    }, Promise.resolve()).then(function () { ln.classList.remove('typing'); });
  }

  /* ---------------- S1 · hero ---------------- */
  var night = $('#term-night'), lead = $('#lead'), q = $('#q'), cue = $('#cue');
  function heroFinal() {
    prep(night, true);
    [lead, night, q, cue].forEach(function (e) { e.classList.add('show'); });
    d.setAttribute('data-hero-done', '1');
  }
  async function heroRun() {
    prep(night, false);
    var L = $$('.ln', night);
    await wait(450); night.classList.add('show');
    await wait(650);
    await typeLine(L[0], 26); await wait(420);
    await typeLine(L[1], 15); await wait(480);
    await typeLine(L[2], 11); await wait(560);
    await typeLine(L[3], 17); await wait(800);
    lead.classList.add('show');
    await wait(1300);
    q.classList.add('show');
    await wait(1500); cue.classList.add('show');
    d.setAttribute('data-hero-done', '1');
  }
  if (NM) heroFinal(); else heroRun();
  cue.addEventListener('click', function () {
    $('#s2').scrollIntoView({ behavior: NM ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------------- S5 · callback: the same session, now watched ---------------- */
  var day = $('#term-day'), trav = $('#trav'), cert = $('#cert'), known = $('#known');
  var cbDone = false, knownWaiting = false;
  function moveTo(ln) { trav.style.transform = 'translateY(' + (ln.offsetTop + 9) + 'px)'; }
  function dayFinal() {
    prep(day, true);
    var L = $$('.ln', day);
    L[1].classList.add('pass'); L[2].classList.add('flag');
    trav.classList.add('on', 'c'); moveTo(L[2]);
    cert.classList.add('in'); cbDone = true;
  }
  async function dayRun() {
    var L = $$('.ln', day);
    await wait(300);
    trav.style.transition = 'none'; moveTo(L[0]); void trav.offsetWidth; trav.style.transition = '';
    trav.classList.add('on');
    await typeLine(L[0], 20); await wait(380);
    await typeLine(L[1], 14);
    moveTo(L[1]); trav.classList.add('chk'); await wait(900);
    trav.classList.remove('chk'); L[1].classList.add('pass'); await wait(550);
    await typeLine(L[2], 11);
    moveTo(L[2]); trav.classList.add('chk'); await wait(1000);
    trav.classList.remove('chk'); trav.classList.add('c'); L[2].classList.add('flag');
    await wait(900); L[3].classList.add('on');
    await wait(700); cert.classList.add('in');
    await wait(1400); cbDone = true;
    if (knownWaiting) reveal(known);
  }
  window.addEventListener('resize', function () {
    var L = $$('.ln', day); if (trav.classList.contains('c')) moveTo(L[2]);
  });

  /* ---------------- reveals ---------------- */
  function reveal(group) {
    $$('.rv, .slow', group).forEach(function (el) {
      setTimeout(function () { el.classList.add('in'); }, +(el.getAttribute('data-d') || 0));
    });
  }
  if (NM || !('IntersectionObserver' in window)) {
    $$('.rv, .slow').forEach(function (el) { el.classList.add('in'); });
    dayFinal();
  } else {
    $$('[data-rv]').forEach(function (el) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); reveal(el); } });
      }, { threshold: 0.12, rootMargin: el.getAttribute('data-rm') || '0px 0px -12% 0px' });
      io.observe(el);
    });
    prep(day, false);
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { dio.disconnect(); dayRun(); } });
    }, { threshold: 0.6 });
    dio.observe(day);
    var kio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { kio.disconnect(); if (cbDone) reveal(known); else knownWaiting = true; }
      });
    }, { threshold: 0.3 });
    kio.observe(known);
  }

  /* ---------------- S6 · the door ---------------- */
  var form = $('#form'), email = $('#email'), thanks = $('#thanks');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!EMAIL.test(email.value.trim())) {
      email.removeAttribute('aria-invalid'); void email.offsetWidth;
      email.setAttribute('aria-invalid', 'true'); email.focus();
      return;
    }
    // TODO: connect to waitlist backend (nothing is sent anywhere yet)
    form.classList.add('out');
    setTimeout(function () {
      form.hidden = true; thanks.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { thanks.classList.add('in'); }); });
    }, NM ? 0 : 700);
  });
})();
