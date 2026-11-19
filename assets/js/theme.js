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
      ['civic', 'Civic', 'Newsroom, institutional'],
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
    barlowHref: 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Barlow+Semi+Condensed:wght@400;500;600;700;800&display=swap',
  };
  var ids = function (list) { return list.map(function (x) { return x[0]; }); };
  REG.ids = { theme: ids(REG.themes), colorway: ids(REG.colorways), type: ids(REG.types) };
  REG.defaults = { theme: 'civic', colorway: 'daylight', type: 'system' };
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
  var t = 'civic', cw = 'daylight', ty = 'barlow'; // demo: Civic + Daylight + Barlow (the black demo's face), not switchable
  REG.theme = t; REG.colorway = cw; REG.type = ty; REG.frame = frame;
  root.setAttribute('data-theme', t);
  root.setAttribute('data-media', 'field');
  root.setAttribute('data-colorway', cw);
  root.setAttribute('data-type', ty);

  var font = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link rel="stylesheet" id="ss-barlow" href="' + REG.barlowHref + '">';
  document.write((ty === 'barlow' ? font : '') +
    '<link rel="stylesheet" href="assets/css/lettering.css"><link rel="stylesheet" href="assets/css/colorways.css">' +
    '<link rel="stylesheet" href="assets/css/themes/' + t + '.css"><script src="assets/js/themes/' + t + '.js"><\/script>' +
    '<script src="assets/js/media.js"><\/script>' +
    '<link rel="stylesheet" href="assets/css/motion.css"><script src="assets/js/motion.js"><\/script>');

  // Colorways are pure CSS, so the ribbon switches them in place; the URL and the remembered choice follow.
  REG.setColorway = function (id) {
    if (REG.ids.colorway.indexOf(id) < 0) return;
    REG.colorway = id; root.setAttribute('data-colorway', id); store('colorway', id);
    try { var u = new URL(location.href); u.searchParams.set('colorway', id); history.replaceState(history.state, '', u); } catch (e) {}
  };
})();
