// Motion layer, shared byte-for-byte by the dark and the light build: scroll reveals, count-up figures, header state, scroll progress,
// band parallax, smooth in-page links and the phone close button on quick search. Loaded in <head> by theme.js (after media.js);
// styles in assets/css/motion.css and assets/css/themes/cinema-ui.css.
// Hero and page-hero copy is never hidden: it is not in the reveal lists, and the hero tiles only reveal when they start below the fold.
// Progressive enhancement throughout:
//   - Nothing is hidden unless this file puts .mo-js on <html>, which it skips for prefers-reduced-motion or when
//     IntersectionObserver is missing. If the observer has not reported within 2.5 s, everything is revealed.
//   - Only opacity / transform / clip-path animate (motion.css), so nothing reflows; counters reserve their width.
//   - Content the pages render later from live data is picked up by a MutationObserver.
//   - Counters always finish on the element's exact original text, and screen readers get the final value throughout.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var animate = !reduce && hasIO;
  if (animate) root.classList.add('mo-js');

  /* ---------- What reveals, and how ---------- */
  var HEADS = [
    '.section-head', '.row-head', '.intents h2', 'main .block-head', 'main .panel-head:not(.filter-panel .panel-head)', 'main .list-head',
    '.layer-body > h2', '.storm-body > h2'
  ];
  var ITEMS = [
    // bands below the fold (the hero, page heroes and the Rebuild header band are never hidden)
    'section.band:not(:has(h1)) > .band-inner', '.cta > .band-inner > *',
    // home
    '.feature-body', '.impact-body', '.checks li', '.pillars > div', '.layer-body > .lede', '.storm-body > :not(h2)',
    // cards, rows and registers rendered from data
    '.live-card header', '.mon-card', '.why-grid > div', '.org-card', '.net-card', '.resp', '.net-more',
    '.stat-row > div', '.side-card', '.dz-body > .panel > :not(.panel-head)', '.split > .side > *',
    // colophon
    '.footer-note', '.footer-grid > *', '.footer-bottom'
  ];
  // Only tagged when they start below the fold on the first scan (part of a page hero on wide screens).
  var FOLD = ['.net-hero-tiles > div'];
  // Photos never hide: they are on screen from the first paint (no reveal, no clip).
  var IMGS = [];
  var HEX = [];
  var SKIP = '.brand-backdrop, .site-header, .utility-bar, .mobile-menu, .cmdk, .tabbar, .subnav, .mock-ribbon, .leaflet-container, [hidden]';

  var DUR = { item: 520, head: 520, img: 1300, hex: 900 };
  var STEP = 70, MAX_STAGGER = 5;

  var io = null, ioAlive = false, queue = [], flushPending = false;

  function tag(el, kind) {
    if (el.hasAttribute('data-mo') || el.closest(SKIP)) return;
    el.setAttribute('data-mo-k', kind);
    el.setAttribute('data-mo', 'r');
    io.observe(el);
  }
  var firstScan = true;
  function scan() {
    if (!io) return;
    if (firstScan) {
      firstScan = false;
      for (var f = 0; f < FOLD.length; f++) {
        var fl = document.querySelectorAll(FOLD[f]);
        for (var k = 0; k < fl.length; k++) if (fl[k].getBoundingClientRect().top >= window.innerHeight) tag(fl[k], 'item');
      }
    }
    var groups = [[HEADS, 'head'], [IMGS, 'img'], [HEX, 'hex'], [ITEMS, 'item']];
    for (var g = 0; g < groups.length; g++) {
      var sels = groups[g][0];
      for (var i = 0; i < sels.length; i++) {
        var list;
        try { list = document.querySelectorAll(sels[i]); } catch (e) { continue; }
        for (var j = 0; j < list.length; j++) tag(list[j], groups[g][1]);
      }
    }
  }
  function settle(el, delay) {
    var kind = el.getAttribute('data-mo-k') || 'item';
    setTimeout(function () {
      if (el.getAttribute('data-mo') === 'in') { el.setAttribute('data-mo', 'done'); el.style.removeProperty('--mo-delay'); }
    }, (DUR[kind] || 800) + delay + 120);
  }
  function show(el, delay) {
    if (el.getAttribute('data-mo') !== 'r') return;
    if (delay) el.style.setProperty('--mo-delay', delay + 'ms');
    el.setAttribute('data-mo', 'in');
    if (el.getAttribute('data-mo-k') === 'hex') { var m = el.closest('.mosaic'); if (m) m.classList.add('mo-seen'); }
    settle(el, delay);
  }
  function showNow(el) {
    el.setAttribute('data-mo', 'done');
    if (el.getAttribute('data-mo-k') === 'hex') { var m = el.closest('.mosaic'); if (m) m.classList.add('mo-seen'); }
  }
  function revealAll() {
    var list = document.querySelectorAll('[data-mo="r"]');
    for (var i = 0; i < list.length; i++) showNow(list[i]);
    var ms = document.querySelectorAll('.mosaic');
    for (var k = 0; k < ms.length; k++) ms[k].classList.add('mo-seen');
  }
  // Elements entering together are staggered in reading order (top, then left).
  function flush() {
    flushPending = false;
    var batch = queue.splice(0);
    batch.sort(function (a, b) { return (a.top - b.top) || (a.left - b.left); });
    var n = 0;
    for (var i = 0; i < batch.length; i++) {
      var el = batch[i].el;
      if (el.getAttribute('data-mo') !== 'r') continue;
      show(el, Math.min(n, MAX_STAGGER) * STEP);
      n++;
    }
  }
  function onIO(entries) {
    ioAlive = true;
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i], el = e.target;
      if (e.isIntersecting) {
        io.unobserve(el);
        queue.push({ el: el, top: Math.round(e.boundingClientRect.top / 8), left: e.boundingClientRect.left });
      } else if (e.boundingClientRect.bottom < 0) {
        // Already scrolled past (an anchor jump or a restored scroll position): show it without a transition.
        io.unobserve(el); showNow(el);
      }
    }
    if (queue.length && !flushPending) { flushPending = true; requestAnimationFrame(flush); }
  }

  /* ---------- Count-up figures ---------- */
  var COUNTS = '.hero-stats dd, .count-chip b, .stat-row dd, .mini-stats dd, .block-head .pill [data-stat], [data-count-up]';
  var DIGITS = /\d/;
  var counted = typeof WeakSet === 'function' ? new WeakSet() : null;
  var countIO = null;

  function firstNumberNode(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) {
      var n = w.currentNode;
      if (n.parentNode && n.parentNode.classList && n.parentNode.classList.contains('mo-sr')) continue;
      if (DIGITS.test(n.nodeValue)) return n;
    }
    return null;
  }
  function parse(text) {
    var m = /^([\s\S]*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/.exec(text);
    if (!m) return null;
    var raw = m[2], dec = raw.indexOf('.') >= 0 ? raw.split('.')[1].length : 0;
    return { prefix: m[1], raw: raw, value: parseFloat(raw.replace(/,/g, '')), decimals: dec, comma: raw.indexOf(',') >= 0 || parseFloat(raw.replace(/,/g, '')) >= 10000, suffix: m[3] };
  }
  function fmt(v, p) {
    var s = v.toFixed(p.decimals);
    if (p.comma) { var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = parts.join('.'); }
    return p.prefix + s + p.suffix;
  }
  function ease(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  // Runs one count on el, starting from `from`. Restarts from the shown value if the page swaps the content mid-count.
  function count(el, from, dur) {
    var node = firstNumberNode(el);
    if (!node) return false;
    var final = node.nodeValue, p = parse(final);
    if (!p || !isFinite(p.value)) return false;
    if (p.value === from) return true;
    var num = document.createElement('span'), sr = document.createElement('span');
    num.className = 'mo-num'; num.setAttribute('aria-hidden', 'true');
    sr.className = 'mo-sr'; sr.textContent = final;
    num.textContent = final;
    node.parentNode.replaceChild(num, node);
    num.parentNode.insertBefore(sr, num.nextSibling);
    // Reserve the final width (tabular figures while counting), so nothing beside the figure moves.
    num.style.minWidth = Math.ceil(num.getBoundingClientRect().width) + 'px';
    num.textContent = fmt(from, p);
    var t0 = 0, raf = 0, done = false;
    var mo = new MutationObserver(function () {
      if (done || el.contains(num)) return;
      // The page replaced the figure (live data arrived): carry on from what was showing to the new value.
      done = true; cancelAnimationFrame(raf); mo.disconnect();
      var shown = parseFloat((num.textContent.match(/[\d,.]+/) || ['0'])[0].replace(/,/g, '')) || 0;
      count(el, shown, 900);
    });
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    function finish() {
      done = true; mo.disconnect();
      if (num.parentNode) {
        var t = document.createTextNode(final);
        num.parentNode.replaceChild(t, num);
        if (sr.parentNode) sr.parentNode.removeChild(sr);
      }
    }
    function tick(now) {
      if (done) return;
      if (!t0) t0 = now;
      var k = Math.min(1, (now - t0) / dur);
      var v = from + (p.value - from) * ease(k);
      num.firstChild.nodeValue = fmt(p.decimals ? v : Math.round(v), p);
      if (k < 1) raf = requestAnimationFrame(tick); else finish();
    }
    raf = requestAnimationFrame(tick);
    return true;
  }
  function startCount(el) {
    if (counted && counted.has(el)) return;
    if (!firstNumberNode(el)) {
      // Placeholder ("—") until the live data lands: count as soon as a figure appears.
      if (el.__moWait) return;
      el.__moWait = new MutationObserver(function () {
        if (firstNumberNode(el)) { el.__moWait.disconnect(); el.__moWait = null; startCount(el); }
      });
      el.__moWait.observe(el, { childList: true, subtree: true, characterData: true });
      return;
    }
    if (counted) counted.add(el);
    setTimeout(function () { count(el, 0, 1600); }, 180);
  }
  function scanCounts() {
    if (!countIO) return;
    var list = document.querySelectorAll(COUNTS);
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.__moCount || el.closest(SKIP)) continue;
      el.__moCount = true;
      countIO.observe(el);
    }
  }

  /* ---------- Scroll-linked touches: header glass, progress line, band parallax ---------- */
  var bar = null, bands = [], ticking = false;
  var desk = window.matchMedia ? window.matchMedia('(min-width: 1069px)') : { matches: true };
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      root.classList.toggle('mo-scrolled', y > 8);
      if (bar) {
        var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / max)).toFixed(4) + ')';
      }
      // At the very foot of the page the last rows can sit inside the reveal margin: bring them in.
      if (io && y + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        var rest = document.querySelectorAll('[data-mo="r"]');
        for (var q = 0; q < rest.length; q++) {
          var rr = rest[q].getBoundingClientRect();
          if (rr.top < window.innerHeight && rr.bottom > 0) { io.unobserve(rest[q]); queue.push({ el: rest[q], top: Math.round(rr.top / 8), left: rr.left }); }
        }
        if (queue.length && !flushPending) { flushPending = true; requestAnimationFrame(flush); }
      }
      if (animate && desk.matches) {
        for (var i = 0; i < bands.length; i++) {
          var b = bands[i], r = b.parentNode.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          // pr runs from 1 (band entering at the bottom) to -1 (leaving at the top); the photo slides down 8%.
          var pr = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2 + r.height / 2)));
          b.style.setProperty('--mo-par', (-(pr + 1) / 2 * r.height * 0.075).toFixed(1) + 'px');
        }
      }
    });
  }

  /* ---------- Smooth in-page links ---------- */
  function onClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var t = document.getElementById(decodeURIComponent(id));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    try { history.pushState(null, '', '#' + id); } catch (err) {}
  }

  // Whatever sits in the first screen (the hero, the stats card that overlaps its foot) reveals on load without
  // waiting for the observer's bottom margin, and its figures count up while the fade plays.
  function firstScreen() {
    var h = window.innerHeight, list = document.querySelectorAll('[data-mo="r"]');
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.top < h && r.bottom > 0) { io.unobserve(list[i]); queue.push({ el: list[i], top: Math.round(r.top / 8), left: r.left }); }
    }
    if (queue.length && !flushPending) { flushPending = true; requestAnimationFrame(flush); }
    var cs = document.querySelectorAll(COUNTS);
    for (var j = 0; j < cs.length; j++) {
      var c = cs[j], cr = c.getBoundingClientRect();
      if (c.__moCount && cr.top < h && cr.bottom > 0) { countIO.unobserve(c); (function (el) { setTimeout(function () { startCount(el); }, 300); })(c); }
    }
  }

  /* ---------- Quick search: a close button for phones (no Esc key there); cinema-ui.css shows it on touch ---------- */
  function addSearchClose() {
    var input = document.querySelector('.cmdk-input');
    if (!input || input.querySelector('.cmdk-close')) return !!input;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cmdk-close'; b.setAttribute('aria-label', 'Close search');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    input.appendChild(b);
    return true;
  }

  /* ---------- Start ---------- */
  function start() {
    try {
      if (!addSearchClose()) {
        var cm = new MutationObserver(function () { if (addSearchClose()) cm.disconnect(); });
        cm.observe(document.body, { childList: true });
      }
    } catch (e) {}
    try {
      bar = document.createElement('div');
      bar.className = 'mo-progress'; bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      bands = [].slice.call(document.querySelectorAll('section.band:not(:has(h1)) > img.band-bg'));
    } catch (e) { bands = []; }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('click', onClick);
    onScroll();

    if (!animate) return;
    try {
      io = new IntersectionObserver(onIO, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
      countIO = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) if (entries[i].isIntersecting) { countIO.unobserve(entries[i].target); startCount(entries[i].target); }
      }, { rootMargin: '0px 0px -3% 0px', threshold: 0 });
      scan(); scanCounts(); firstScreen();
      var t;
      new MutationObserver(function (muts) {
        // Ignore the counters' own text updates.
        for (var i = 0; i < muts.length; i++) if (muts[i].type === 'childList' && muts[i].addedNodes.length) { clearTimeout(t); t = setTimeout(function () { scan(); scanCounts(); }, 60); return; }
      }).observe(document.body, { childList: true, subtree: true });
      // Failsafe: if the observer never reports, show everything.
      setTimeout(function () { if (!ioAlive) { root.classList.remove('mo-js'); revealAll(); } }, 2500);
    } catch (e) {
      root.classList.remove('mo-js'); revealAll();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
