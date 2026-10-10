/* Agentic Guardians · v5 · vanilla, no build step */
(function () {
  'use strict';

  var d = document.documentElement;
  var NM = d.classList.contains('no-motion');
  var Q = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ss(a, b, v) { var x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); }
  function rgb(c) { return 'rgb(' + c.join(',') + ')'; }
  function hex(v) { v = (v || '').trim().replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(v.substr(i, 2), 16); }); }

  /* ---- palette: ACT 1 (exposed, dark) → ACT 2 (safe world, from html[data-safe] in styles.css) ---- */
  var cs = getComputedStyle(d);
  var B = { bg: hex(cs.getPropertyValue('--P-bg')), fg: hex(cs.getPropertyValue('--P-fg')),
            mu: hex(cs.getPropertyValue('--P-mu')), dot: hex(cs.getPropertyValue('--P-dot')) };
  var LIGHT = (B.bg[0] * .299 + B.bg[1] * .587 + B.bg[2] * .114) > 140;
  var CFG = {
    A: { bg: [14, 14, 15], fg: [237, 235, 230], mu: [142, 140, 135], dot: [92, 92, 92] },
    B: B,
    shift: LIGHT ? [0.12, 1] : [0, 1],      // light worlds: the lights come up slowly, like a gallery
    pow: LIGHT ? 1.3 : 1,
    cross: LIGHT ? [0.46, 0.6] : [0.3, 0.42], // when the ink flips (light worlds: once the room is lit)
    alive: [0.7, 1]                          // the brand dot comes alive last
  };

  /* ---------------- threshold: scroll-linked world change ---------------- */
  var meta = $('meta[name="theme-color"]'), dawn = $('#dawn'), last = '';
  function paint(t, g) {
    var key = t.toFixed(3) + '|' + g.toFixed(3);
    if (key === last) return; last = key;
    var e = Math.pow(ss(CFG.shift[0], CFG.shift[1], t), CFG.pow), s = d.style;
    var bg = mix(CFG.A.bg, CFG.B.bg, e);
    var f = ss(CFG.cross[0], CFG.cross[1], LIGHT ? e : t);
    var fg = mix(CFG.A.fg, CFG.B.fg, f);
    s.setProperty('--bg', rgb(bg));
    s.setProperty('--bgc', bg.join(','));
    s.setProperty('--fg', rgb(fg));
    s.setProperty('--fgc', fg.join(','));
    s.setProperty('--mu', rgb(mix(CFG.A.mu, CFG.B.mu, f)));
    var dt = mix(CFG.A.dot, CFG.B.dot, ss(CFG.alive[0], CFG.alive[1], t));
    s.setProperty('--dot', rgb(dt));
    s.setProperty('--dotc', dt.join(','));
    s.setProperty('--t', e.toFixed(3));
    s.setProperty('--grain', g.toFixed(3));
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
      g = 1 - clamp((vh * 1.15 - r.top) / (vh * 0.35));   // grain dies before the light: a beat of stillness
    }
    d.classList.toggle('still', !NM && r.top < vh * 0.95);
    paint(t, g);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------------- hero typing ---------------- */
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

  /* ---------------- S5 · callback console (from mock-callback) ----------------
     The whole sequence is a pure function of time: render(t). Starts when the
     terminal scrolls into view.  ?static=1 → final state   ?t=<ms> → frozen frame */
  /* v7 pacing (from ag-v7-dev): ~8.15s total, a line every ~1350ms with a human typing
     rhythm; ~700ms hold before the transfer line; red the moment it completes; certificate ~1000ms later */
  var T = {
    lines: [[250, 1350], [1800, 2500], [3300, 4000], [5000, 6600]],  // [type start, type end] per line
    pass: [null, 2650, 4150],  // ok + "matches baseline"
    flip: 6600,                // red: status band, panel, BLOCKED
    prompt: 6900,              // $ ▌
    cert: 7650,                // ~1050ms after the flip
    end: 8150
  };
  var con = $('#console'), term = $('#term'), trav = $('#trav'), cert = $('#cert'), known = $('#known');
  var TL = $$('.ln', term), band = $('#band-text'), curLab = $('#cur-label');
  var toks = $$('#baseline .tok'), wls = $$('#cur-watch .wl[data-k]'), idle = $('#cur-idle');

  $$('.seg', term).forEach(function (sg) {
    var text = sg.getAttribute('data-t');
    sg.innerHTML = '<span class="ty"></span><span class="gh"></span>';
    sg.gh = sg.lastChild; sg.ty = sg.firstChild; sg.txt = text; sg.shown = -1;
  });
  // deterministic "human" rhythm: per-character weights (pauses after spaces, brackets, commas)
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  TL.forEach(function (ln) {
    ln.segs = $$('.seg', ln);
    ln.len = ln.segs.reduce(function (a, s) { return a + s.txt.length; }, 0);
    var full = ln.segs.map(function (s) { return s.txt; }).join(''), acc = 0, cum = [];
    for (var i = 0; i < full.length; i++) {
      var ch = full[i], pv = full[i - 1] || '';
      acc += 0.55 + rnd() * 0.9 + (ch === ' ' ? 0.5 : 0) + (/[(,"=]/.test(pv) ? 0.6 : 0); cum.push(acc);
    }
    ln.cum = cum.map(function (v) { return acc ? v / acc : 1; });
  });
  function chars(ln, p) { if (p >= 1) return ln.len; var n = 0; while (n < ln.cum.length && ln.cum[n] <= p) n++; return n; }
  function tog(el, c, on) { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); }
  function setSeg(sg, n) {
    if (sg.shown === n) return; sg.shown = n;
    sg.ty.textContent = sg.txt.slice(0, n); sg.gh.textContent = sg.txt.slice(n);
  }
  var dotLine = -1;
  function moveDot(i, instant) {
    if (i === dotLine && !instant) return; dotLine = i;
    var y = TL[i].offsetTop + (window.innerWidth <= 720 ? 8 : 9);
    if (instant) trav.style.transition = 'none';
    trav.style.transform = 'translateY(' + y + 'px)';
    if (instant) { void trav.offsetWidth; trav.style.transition = ''; }
  }
  var phase = '';
  function render(t, instant) {
    var active = 0;
    T.lines.forEach(function (w, i) {
      var ln = TL[i], on = t >= w[0];
      tog(ln, 'on', on);
      if (on) active = i;
      var p = on ? Math.min(1, (t - w[0]) / (w[1] - w[0])) : 0;
      var n = chars(ln, p), typing = on && p < 1;
      ln.segs.forEach(function (sg) {
        var k = Math.max(0, Math.min(sg.txt.length, n)); n -= sg.txt.length;
        setSeg(sg, k);
        tog(sg, 'act', typing && k > 0 && k < sg.txt.length);
      });
    });
    [1, 2].forEach(function (i) {
      var ok = t >= T.pass[i];
      tog(TL[i], 'pass', ok);
      tog(toks[i - 1], 'hit', ok);
      tog(wls[i - 1], 'on', ok);
      tog(wls[i - 1], 'good', ok);
    });
    tog(idle, 'on', t < T.pass[1]);
    tog(wls[2], 'on', t >= T.lines[3][0] && t < T.flip);
    var dev = t >= T.flip;
    tog(con, 'is-dev', dev);
    tog(TL[3], 'flag', dev);
    tog(toks[2], 'exp', dev);
    tog(trav, 'c', dev);
    var bt = dev ? 'SOMETHING LOOKS OFF<span class="sp"> · </span><span class="lo">Behaviour deviation detected</span>' : 'PROTECTED';
    if (band.getAttribute('data-s') !== String(dev)) { band.innerHTML = bt; band.setAttribute('data-s', String(dev)); }
    var cl = dev ? 'Deviation detected' : 'Current action';
    if (curLab.textContent !== cl) curLab.textContent = cl;
    tog(TL[4], 'on', t >= T.prompt);
    tog(cert, 'in', t >= T.cert);
    tog(trav, 'on', t >= 0);
    moveDot(t >= T.lines[0][0] ? active : 0, instant);
    var ph = t < 0 ? 'idle' : t < T.flip ? 'run' : t < T.cert ? 'dev' : t < T.end ? 'cert' : 'done';
    if (ph !== phase) { phase = ph; d.setAttribute('data-cb', ph); }
  }

  var cbDone = false, knownWaiting = false, raf = 0, t0 = 0;
  function finish() { if (cbDone) return; cbDone = true; if (knownWaiting) reveal(known); }
  function loop(now) {
    var t = now - t0; render(t);
    if (t < T.end) raf = requestAnimationFrame(loop); else finish();
  }
  function play() {
    cancelAnimationFrame(raf); render(-1, true); dotLine = -1;
    requestAnimationFrame(function (now) { t0 = now; render(0, true); raf = requestAnimationFrame(loop); });
  }
  window.addEventListener('resize', function () { var l = dotLine; dotLine = -1; if (l >= 0) moveDot(l, true); });

  /* ---------------- reveals ---------------- */
  function reveal(group) {
    $$('.rv, .slow', group).forEach(function (el) {
      setTimeout(function () { el.classList.add('in'); }, +(el.getAttribute('data-d') || 0));
    });
  }
  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  var fixed = NM ? Infinity : (Q.has('t') ? +Q.get('t') : null);

  if (fixed !== null || !('IntersectionObserver' in window)) {
    if (fixed === null) fixed = Infinity;
    if (NM) $$('.rv, .slow').forEach(function (el) { el.classList.add('in'); });
    render(fixed, true);
    ready.then(function () { dotLine = -1; render(fixed, true); });
    if (fixed >= T.end) cbDone = true;
  } else {
    render(-1, true);
  }
  if (!NM && 'IntersectionObserver' in window) {
    $$('[data-rv]').forEach(function (el) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); reveal(el); } });
      }, { threshold: 0.12, rootMargin: el.getAttribute('data-rm') || '0px 0px -12% 0px' });
      io.observe(el);
    });
    // lines that also reveal on their own when reached directly (fast scrollers)
    $$('[data-self]').forEach(function (el) {
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { so.disconnect(); setTimeout(function () { el.classList.add('in'); }, +el.getAttribute('data-self')); }
        });
      }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
      so.observe(el);
    });
    if (fixed === null) {
      ready.then(function () {
        var tio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { tio.disconnect(); play(); } });
        }, { threshold: 0.6 });
        tio.observe(term);
      });
    }
    var kio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { kio.disconnect(); if (cbDone) reveal(known); else knownWaiting = true; }
      });
    }, { threshold: 0.3 });
    kio.observe(known);
  }

  /* ---------------- S6 · signup ---------------- */
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
