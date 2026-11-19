// Civic direction: presentational touches only (classes, wrappers, ordering, measured sizes). Never removes content or features.
// Runs after the page's own scripts: document.addEventListener('DOMContentLoaded', ...).
document.addEventListener('DOMContentLoaded', () => {
  // Hero eyebrow: bind each " · " separator to the word before it so no line starts with a dot.
  // A no-break space replaces the space before each dot; the text stays one node and reads the same.
  document.querySelectorAll('.hero .eyebrow').forEach((el) => {
    if (el.children.length) return;
    const t = el.textContent, n = t.replace(/ \u00B7 /g, '\u00A0\u00B7 ');
    if (n !== t) el.textContent = n;
  });

  // Unspaced em dashes: bind "word—word" into one unbreakable unit, so no line opens with "—".
  // Splits only at existing spaces and the text itself is unchanged. Idempotent via data-civic-nb.
  document.querySelectorAll('.band .lede, .storm .lede, .storm p').forEach((el) => {
    if (el.dataset.civicNb) return;
    el.dataset.civicNb = '1';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (/\S\u2014\S/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      let last = 0;
      node.nodeValue.replace(/\S+\u2014\S+/g, (m, i) => {
        if (i > last) frag.appendChild(document.createTextNode(node.nodeValue.slice(last, i)));
        const s = document.createElement('span');
        s.style.whiteSpace = 'nowrap';
        s.textContent = m;
        frag.appendChild(s);
        last = i + m.length;
        return m;
      });
      if (last < node.nodeValue.length) frag.appendChild(document.createTextNode(node.nodeValue.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  });

  // Stuck masthead: once row 1 (wordmark, search, Get Started) has scrolled away, fold it into the
  // pinned nav row. Moves existing elements only; civic.css scopes it to desktop pages without a subnav.
  const stick = () => {
    const h = document.querySelector('.site-header');
    if (!h) return;
    const u = document.querySelector('.utility-bar');
    h.classList.toggle('civic-stuck', window.scrollY > (u ? u.offsetHeight : 0) + 64);
  };
  window.addEventListener('scroll', stick, { passive: true });
  window.addEventListener('resize', stick, { passive: true });
  stick();

  // Subnav: a clicked link stays underlined when its jump ends. Short sections (Updates) land above the
  // middle band, so the scroll-spy would otherwise hand the underline to the section below on the way in.
  // The hold lapses after 2.5 s, so a later scroll by the reader is left to the scroll-spy.
  let held = null, heldAt = 0, idle;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.subnav-links a[data-target]');
    if (a) { held = a; heldAt = Date.now(); }
  });
  window.addEventListener('scroll', () => {
    if (!held) return;
    if (Date.now() - heldAt > 2500) { held = null; return; }
    clearTimeout(idle);
    idle = setTimeout(() => {
      const a = held; held = null;
      if (!a.isConnected) return;
      a.closest('.subnav-links').querySelectorAll('a').forEach((l) => l.classList.toggle('active', l === a));
    }, 160);
  }, { passive: true });

  // Segmented tabs that scroll sideways on phone: fade the right edge only while more tabs are hidden.
  const segs = new Set();
  const fade = (seg) => seg.classList.toggle('civic-more', seg.scrollWidth - seg.clientWidth - seg.scrollLeft > 4);
  const watch = () => document.querySelectorAll('.seg').forEach((seg) => {
    if (!segs.has(seg)) { segs.add(seg); seg.addEventListener('scroll', () => fade(seg), { passive: true }); }
    fade(seg);
  });
  watch();
  window.addEventListener('resize', () => segs.forEach(fade), { passive: true });
  // Sticky side rails (desktop): a rail taller than the window gets a negative top, so it scrolls to its own last
  // button before it sticks and is never cut off; a short rail sticks under the bar. civic.css reads --cv-rail-top.
  const desk = window.matchMedia('(min-width: 1069px)');
  const rails = () => document.querySelectorAll('.split > .side, .split > .filter-panel');
  const railTops = () => rails().forEach((el) => {
    if (!desk.matches) { el.style.removeProperty('--cv-rail-top'); return; }
    const sub = document.querySelector('.subnav');
    const bar = (sub && sub.offsetHeight) || 56;
    el.style.setProperty('--cv-rail-top', Math.round(Math.min(bar + 24, window.innerHeight - el.offsetHeight - 24)) + 'px');
  });
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => railTops()) : null;
  const seen = new WeakSet();
  const watchRails = () => rails().forEach((el) => { if (ro && !seen.has(el)) { seen.add(el); ro.observe(el); } });

  // Card rows hold one baseline: in each visual row of story cards, every title takes the tallest title's height,
  // so the datelines, regions and links line up only when a title really wraps (no reserved empty line).
  const evenTitles = () => document.querySelectorAll('.d-grid').forEach((grid) => {
    const hs = [...grid.querySelectorAll(':scope > .d-card .d-body h3')];
    hs.forEach((h) => { h.style.minHeight = ''; });
    const rows = new Map();
    hs.forEach((h) => {
      const top = Math.round(h.closest('.d-card').getBoundingClientRect().top);
      if (!rows.has(top)) rows.set(top, []);
      rows.get(top).push(h);
    });
    rows.forEach((row) => {
      if (row.length < 2) return;
      const max = Math.max(...row.map((h) => h.getBoundingClientRect().height));
      row.forEach((h) => { if (h.getBoundingClientRect().height < max - 0.5) h.style.minHeight = max + 'px'; });
    });
  });

  // Widow control: bind a heading's last two words with a no-break space, so no headline (including the ones the
  // CMS and partners write) ends on a lone word. Only when the pair is short enough to fit any column it sits in.
  // The words are unchanged (U+00A0 reads as a space); re-runs only when the heading's text changes.
  const bindLast = (el, max) => {
    if (el.dataset.civicWidow === el.textContent) return;
    const words = el.textContent.trim().split(/\s+/);
    if (words.length >= 3 && (words[words.length - 2] + ' ' + words[words.length - 1]).length <= max) {
      // Walk back from the end (across inline elements) to the space before the last word and make it unbreakable.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      let seenWord = false, done = false;
      for (let i = nodes.length - 1; i >= 0 && !done; i--) {
        const v = nodes[i].nodeValue;
        for (let j = v.length - 1; j >= 0; j--) {
          if (/\S/.test(v[j])) { seenWord = true; continue; }
          if (v[j] === ' ') { done = true; break; }
          if (seenWord) { nodes[i].nodeValue = v.slice(0, j) + ' ' + v.slice(j + 1); done = true; break; }
        }
      }
    }
    el.dataset.civicWidow = el.textContent;
  };
  const widows = () => {
    document.querySelectorAll('main h2, .net-intro h2').forEach((h) => bindLast(h, 18));
    document.querySelectorAll('main h3, main h4').forEach((h) => bindLast(h, 24));
    // The colophon's legal line: keep the organisation's name whole.
    document.querySelectorAll('.footer-bottom > span:first-child').forEach((el) => {
      if (el.children.length || el.dataset.civicNb) return;
      el.dataset.civicNb = '1';
      el.textContent = el.textContent.replace(/Serve Source/g, 'Serve Source');
    });
  };

  const relayout = () => { widows(); watchRails(); railTops(); evenTitles(); };
  relayout();
  window.addEventListener('resize', relayout, { passive: true });
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { watch(); stick(); relayout(); }, 120); }).observe(document.body, { childList: true, subtree: true });
});
