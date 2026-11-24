// White build: themes/cinema-ui.css (the shared component layer) loads right after themes/cinema.css, then
// themes/cinema-white.css (the daylight palette).
// Preview switcher: design direction (?theme=civic|cinema), colorway (?colorway=<id>) and typeface (?type=system|barlow).
// Loaded in <head> so every stylesheet below blocks rendering and the first paint is already right.
// Each choice is remembered in localStorage (ss-theme, ss-colorway, ss-type) unless the page is a compare frame (?frame=1).
// Load order it writes, after the page's own site.css / page CSS:
//   [Barlow from Google Fonts, only when type=barlow] -> lettering.css -> colorways.css -> themes/<t>.css -> themes/<t>.js -> media.js
// Both directions use Serve Source's field photos and video (media.js, html[data-media=field]).
// Showcase, Clarity and Bold were retired on 2026-11-06 (files in /_archive); any other theme name falls back to civic.
// compare.html loads this file with data-registry: it then only publishes window.SS_PREVIEW (the lists) and writes nothing.
(function () {
  var REG = {
    themes: [
      ['cinema', 'Cinema', 'Flagship, field photography'],
    ],
    colorways: [
      ['platform', 'Platform', "The guide's web decisions (default)"],
      ['impact-report', 'Impact Report', '2025 Impact Report navy; borrows Print Navy #002249'],
      ['mission-control', 'Mission Control', 'Serve Bot deep-navy canvas; borrows Deep Serve Navy #0B2A4A'],
      ['daylight', 'Daylight', 'White space; navy only in the hero and closing band'],
      ['community', 'Community', 'Platform plus teal and more light orange on navy'],
    ],
    types: [
      ['system', 'System', "System font: the guide's website rule (default)"],
      ['barlow', 'Barlow', 'Barlow Semi Condensed + Barlow: the print headline face'],
    ],
    // Lettering kits (assets/css/kits.css), chosen with ?kit=<id> or ?kit=1..4; nothing is stored.
    kits: [
      ['field', 'Field Manual', 'Barlow Semi Condensed + Barlow: the brand print face, refined (default)',
        'family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Barlow+Semi+Condensed:wght@300;400;500;600;700&family=Barlow+Condensed:wght@500;600'],
      ['chronicle', 'Chronicle', 'Newsreader + Instrument Sans: editorial serif headlines, italic accents, clean grotesk text',
        'family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..500&family=Instrument+Sans:wght@400..700'],
      ['groundwork', 'Groundwork', 'Bricolage Grotesque + Hanken Grotesk: a confident, characterful modern grotesk',
        'family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Hanken+Grotesk:wght@400..700'],
      ['commons', 'Commons', 'Libre Franklin + Source Sans 3: American civic gothic over a humanist text face',
        'family=Libre+Franklin:wght@300..800&family=Source+Sans+3:ital,wght@0,400..700;1,400'],
    ],
    barlowHref: 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Barlow+Semi+Condensed:wght@400;500;600;700;800&display=swap',
  };
  var ids = function (list) { return list.map(function (x) { return x[0]; }); };
  REG.ids = { theme: ids(REG.themes), colorway: ids(REG.colorways), type: ids(REG.types) };
  REG.defaults = { theme: 'cinema', colorway: 'platform', type: 'system' };
  REG.ids.kit = ids(REG.kits);
  REG.defaults.kit = 'field';
  window.SS_PREVIEW = REG;
  var me = document.currentScript;
  if (me && me.hasAttribute('data-registry')) return;

  var root = document.documentElement, q = new URLSearchParams(location.search), frame = q.has('frame');
  function store(key, v) { if (frame) return; try { localStorage.setItem('ss-' + key, v); } catch (e) {} }
  // A requested value wins (an unknown one falls back to the default); otherwise the remembered one; otherwise the default.
  function choose(key) {
    var ok = REG.ids[key], v = q.get(key);
    if (v !== null) { if (ok.indexOf(v) < 0) v = REG.defaults[key]; store(key, v); return v; }
    try { v = localStorage.getItem('ss-' + key); } catch (e) { v = null; }
    if (ok.indexOf(v) < 0) { if (v) store(key, REG.defaults[key]); v = REG.defaults[key]; }
    return v;
  }
  var t = 'cinema', cw = REG.defaults.colorway, ty = REG.defaults.type; // demo: Cinema only
  REG.theme = t; REG.colorway = cw; REG.type = ty; REG.frame = frame;
  root.setAttribute('data-theme', t);
  root.setAttribute('data-media', 'field');
  root.setAttribute('data-colorway', cw);
  root.setAttribute('data-type', ty);
  // Lettering kit: from the URL only (?kit=field|chronicle|groundwork|commons or 1-4), default field.
  var kq = (q.get('kit') || '').toLowerCase(), ki = REG.ids.kit.indexOf(kq);
  if (ki < 0 && /^[1-9]$/.test(kq)) ki = +kq - 1;
  if (ki < 0 || ki >= REG.kits.length) ki = 0;
  var kit = REG.kits[ki];
  REG.kit = kit[0];
  root.setAttribute('data-kit', kit[0]);
  root.classList.add('pro');

  var font = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link rel="stylesheet" id="ss-barlow" href="' + REG.barlowHref + '">';
  var kitFont = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link rel="stylesheet" id="ss-kit-font" href="https://fonts.googleapis.com/css2?' + kit[3] + '&display=swap">';
  document.write(kitFont + (ty === 'barlow' ? font : '') +
    '<link rel="stylesheet" href="assets/css/lettering.css"><link rel="stylesheet" href="assets/css/colorways.css">' +
    '<link rel="stylesheet" href="assets/css/themes/' + t + '.css"><link rel="stylesheet" href="assets/css/themes/cinema-ui.css"><link rel="stylesheet" href="assets/css/themes/cinema-white.css"><script src="assets/js/themes/' + t + '.js"><\/script>' +
    '<script src="assets/js/media.js"><\/script>' +
    '<link rel="stylesheet" href="assets/css/motion.css"><script src="assets/js/motion.js"><\/script>' +
    '<link rel="stylesheet" href="assets/css/kits.css">' +
    // pro.css: the professional layout pass (grid, hairlines, photo-backed cards). Last, so it wins; kit tokens only for type.
    '<link rel="stylesheet" href="assets/css/pro.css">');

  // Carry a non-default kit onto internal page links so a preview stays in one kit while clicking around.
  if (ki > 0) document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank') return;
    try {
      var u = new URL(a.getAttribute('href'), location.href);
      if (u.origin !== location.origin || !/\.html$/.test(u.pathname) || u.searchParams.has('kit')) return;
      u.searchParams.set('kit', REG.kit); a.href = u.href;
    } catch (err) {}
  }, true);

  // Preview-only kit switcher: shown when the URL carries ?kit= or ?preview, never on a plain link (or in a compare frame).
  if (!frame && (q.has('kit') || q.has('preview'))) {
    var mountKits = function () {
      if (document.getElementById('kit-switch')) return;
      var nav = document.createElement('nav');
      nav.id = 'kit-switch'; nav.className = 'kit-switch'; nav.setAttribute('aria-label', 'Lettering kit preview');
      var html = '<span class="ks-label">Lettering</span>';
      REG.kits.forEach(function (k, i) {
        var u = new URL(location.href); u.searchParams.set('kit', k[0]);
        html += '<a href="' + u.pathname + u.search + u.hash + '" title="' + k[2].replace(/"/g, '&quot;') + '"' + (i === ki ? ' aria-current="true"' : '') + '><b>' + (i + 1) + '</b><span>' + k[1] + '</span></a>';
      });
      nav.innerHTML = html;
      document.body.appendChild(nav);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountKits); else mountKits();
  }

  // Colorways are pure CSS, so the ribbon switches them in place; the URL and the remembered choice follow.
  REG.setColorway = function (id) {
    if (REG.ids.colorway.indexOf(id) < 0) return;
    REG.colorway = id; root.setAttribute('data-colorway', id); store('colorway', id);
    try { var u = new URL(location.href); u.searchParams.set('colorway', id); history.replaceState(history.state, '', u); } catch (e) {}
  };
})();
