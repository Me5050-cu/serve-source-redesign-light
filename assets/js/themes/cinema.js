// Cinema direction: presentational touches only. It toggles classes on <html> and on existing elements and
// sets scroll positions; it never changes text and never adds, removes or moves content.
// Runs after the page's own scripts: document.addEventListener('DOMContentLoaded', ...).
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // 1. Header scroll state: the home header is transparent over the hero until the page moves.
  try {
    let raf = 0;
    const set = () => { raf = 0; root.classList.toggle('cx-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(set); }, { passive: true });
    set();
  } catch (e) {}

  // 2. Subnav: when the links row scrolls sideways (tablet, phone), keep the active link in view.
  //    Scrolls the row only (never scrollIntoView, which would move the page).
  try {
    const hook = (links) => {
      const center = () => {
        const a = links.querySelector('a.active');
        if (links.scrollWidth <= links.clientWidth + 1) return;
        // Above the first section nothing is active: the row returns to its start.
        if (!a) { if (links.scrollLeft) links.scrollTo({ left: 0, behavior: reduce.matches ? 'auto' : 'smooth' }); return; }
        // Align the active link's start with the row's start, so no clipped fragment of the previous link shows.
        links.scrollTo({ left: Math.max(0, a.offsetLeft), behavior: reduce.matches ? 'auto' : 'smooth' });
      };
      new MutationObserver(center).observe(links, { attributes: true, subtree: true, attributeFilter: ['class'] });
      // Edge fades: .cx-moved once the row leaves its start, .cx-end once the last link is fully in view.
      const edge = () => {
        const all = links.querySelectorAll('a');
        const last = all[all.length - 1];
        links.classList.toggle('cx-moved', links.scrollLeft > 1);
        links.classList.toggle('cx-end', !last || last.offsetLeft + last.offsetWidth - links.scrollLeft <= links.clientWidth + 1);
      };
      links.addEventListener('scroll', edge, { passive: true });
      window.addEventListener('resize', edge, { passive: true });
      edge();
    };
    const found = document.querySelector('.subnav-links');
    if (found) hook(found);
    else {
      const mo = new MutationObserver(() => { const l = document.querySelector('.subnav-links'); if (l) { mo.disconnect(); hook(l); } });
      mo.observe(document.body, { childList: true });
    }
  } catch (e) {}

  // 3. Scroll reveals (White build: motion.js owns reveals when it runs; this stays as the fallback path).
  //    Scroll reveals: a 24px rise and fade for blocks that start below the fold.
  //    Never armed under reduced motion, webdriver (screenshot and bones tools), a hidden tab or a deep link,
  //    and never for anything already on screen, so no content can be left invisible.
  try {
    if (root.classList.contains('mo-js') || !('IntersectionObserver' in window) || reduce.matches || navigator.webdriver || document.visibilityState !== 'visible' || location.hash) return;
    const SEL = '.section-head, .row-head, .block-head, .feature, .impact, .intent, .d-card:not(.skeleton), .org-card, .net-card, .why-grid > div, .pillars > div';
    const DELAYS = ['', 'cx-d1', 'cx-d2', 'cx-d3', 'cx-d4'];
    const seen = new WeakSet();
    const done = (el) => {
      el.classList.remove('cx-pre', 'cx-in', ...DELAYS.filter(Boolean));
    };
    const show = (el, i) => {
      const d = DELAYS[Math.min(i, 4)];
      el.classList.add('cx-in');
      if (d) el.classList.add(d);
      el.classList.remove('cx-pre');
      // Once risen, hand the element back to its own transitions (hover colours and borders).
      setTimeout(() => el.classList.remove('cx-in', ...DELAYS.filter(Boolean)), 640 + i * 60 + 120);
    };
    const io = new IntersectionObserver((entries) => {
      const hits = entries.filter((en) => en.isIntersecting).map((en) => en.target)
        .sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.top - rb.top || ra.left - rb.left; });
      // Stagger by position within a row: 60ms per step, capped at 240ms.
      let rowTop = null, i = 0;
      hits.forEach((el) => {
        const t = Math.round(el.getBoundingClientRect().top);
        if (rowTop === null || Math.abs(t - rowTop) > 8) { rowTop = t; i = 0; } else i += 1;
        io.unobserve(el);
        show(el, i);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    const scan = () => {
      const fold = window.innerHeight;
      document.querySelectorAll(SEL).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.top < fold || (!r.width && !r.height)) return;
        el.classList.add('cx-pre');
        io.observe(el);
      });
    };
    root.classList.add('cx-reveal');
    scan();
    // Lists render asynchronously: re-scan new cards once things settle. Cards that land on screen are never armed.
    const main = document.querySelector('main');
    let t = 0;
    if (main) new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 100); }).observe(main, { childList: true, subtree: true });
    // Print, in-page jumps and find-in-page show everything at once.
    const revealAll = () => { document.querySelectorAll('.cx-pre').forEach((el) => { io.unobserve(el); done(el); }); };
    window.addEventListener('beforeprint', revealAll);
    window.addEventListener('hashchange', revealAll);
    const onFind = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') { revealAll(); document.removeEventListener('keydown', onFind); } };
    document.addEventListener('keydown', onFind);
  } catch (e) {
    root.classList.remove('cx-reveal');
  }
});
