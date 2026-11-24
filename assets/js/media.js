// Field media for the directions that opt in (html[data-media=field]): swaps in Serve Source's own photos and video.
// Picks come from serve-source/media-review/candidates.json (the "recommended" candidate per slot). Images are hotlinked,
// never copied. Idempotent, never throws, and does nothing for Clarity or Bold (theme.js only loads it for field directions).
//
// DOM contract for theme CSS (all of it can be restyled; the baseline rules below use :where() so any theme rule wins):
//   img[data-media-slot="S1"]            every swapped image carries its slot id and data-credit; focal point set inline
//   .media-credit-host                   added to the element that holds an on-image credit (made position: relative)
//   .media-credit[data-slot]             credit line laid over the photo, bottom right (S1-S7, S9, S16)
//   .mosaic > .media-credit--group       one credit row under the After the Storm mosaic (S10), spans the grid
//   .cta.has-media-video                 closing band with the muted loop (S11); data-media-video="video" | "poster"
//   .cta > video.band-bg.media-video     the loop, stacked over the poster img (same .band-bg class, so band filters apply)
//   .cta > .media-bar                    holds button.media-toggle (pause / play, aria-label switches) and the video credit
//   video.media-video.is-playing         set once frames are actually playing (the baseline fades it in)
//   button.media-toggle.is-paused        set while the loop is paused (by the viewer or by autoplay failing)
// Disaster cards and the disaster header use window.SS_PHOTO_OVERRIDES, read by loadPhotos() in core.js: only the
// representative stand-ins change (weak photos.json picks and the generic per-type fallbacks), never Serve Source's own images.
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root || root.getAttribute('data-media') !== 'field') return;
  if (window.SS_MEDIA && window.SS_MEDIA.ready) return;

  var WIX = 'https://static.wixstatic.com/media/';
  var DVIDS = 'https://d1ldvf68ux039x.cloudfront.net/thumbs/photos/';

  // Wix serves resized copies of the original upload; "fit" keeps the photo's own aspect so a theme may crop it any way.
  function wix(file, w) { return WIX + file + '/v1/fit/w_' + w + ',h_' + (w * 2) + ',q_85,enc_auto/' + file; }
  function wixSet(file, widths) { return widths.map(function (w) { return wix(file, w) + ' ' + w + 'w'; }).join(', '); }
  function img(file, widths, sizes) { return { src: wix(file, widths[widths.length - 1]), srcset: wixSet(file, widths), sizes: sizes }; }

  // Wix PNG originals with enc_auto fall back to the full PNG (8-14 MB) for browsers that do not take AVIF, so every
  // .png source asks for a forced JPEG instead (no enc_auto, a .jpg name).
  function wixJpg(file, w) { var b = file.replace(/~mv2\.png$/, ''); return WIX + file + '/v1/fit/w_' + w + ',h_' + (w * 2) + ',q_85/' + b + '.jpg'; }
  function imgJ(file, widths, sizes) {
    return { src: wixJpg(file, widths[widths.length - 1]), sizes: sizes,
      srcset: widths.map(function (w) { return wixJpg(file, w) + ' ' + w + 'w'; }).join(', ') };
  }
  var B44 = 'https://media.base44.com/images/public/695c704f24f26045c4d0f1c0/';

  var SIZES = {
    full: '100vw',
    wide: '(min-width: 1069px) 1312px, 100vw',
    half: '(min-width: 1069px) 50vw, 100vw',
    tile: '(min-width: 1069px) 25vw, 100vw',
    big: '(min-width: 1069px) 30vw, 100vw'
  };
  var REEL = '4e81f7_655b7628d5c34514aeddf2e56deda672';
  var REEL_POSTER = REEL + 'f001.jpg'; // Wix's own frame from the field segment (chainsaw crew on a roof)
  var isHome = /(^|\/)(index\.html)?$/.test(location.pathname);

  /* ---------- Static image slots ---------- */
  // sel: the image; was: a fragment of the original src (guards against matching the wrong image); host: where the credit goes.
  // keep: the markup already carries the photo; only the credit is registered.
  var SLOTS = [
    { slot: 'S1', sel: '.hero > img.hero-bg', was: 'f83a26_309b51cb', host: '.hero',
      media: img('1d1de7_ca5026b0401b44548c1ba13e30469bb6~mv2.jpg', [1280, 1920, 2560], '(min-width: 1069px) 80vw, 100vw'), focus: '60% 40%',
      credit: 'Serve Source' },
    // Intent tiles (home): photos are in the markup; one group credit line under the grid.
    { slot: 'I1', sel: '.intent-grid .intent-media', was: '4f0518_6dcb3687', keep: true, credit: 'Serve Source' },
    { slot: 'I2', sel: '.intent-grid .intent-media', was: 'f83a26_0f45a7fb', keep: true, credit: 'Serve Source' },
    { slot: 'I3', sel: '.intent-grid .intent-media', was: 'f83a26_a084c13a', keep: true, credit: 'Serve Source' },
    { slot: 'I4', sel: '.intent-grid .intent-media', was: 'kempner-assessment-team', keep: true, credit: 'Serve Source' },
    { slot: 'S2', sel: '.feature-grid > .feature:nth-child(1) .feature-media img', was: 'f83a26_309b51cb', host: '.feature-media',
      media: imgJ('4f0518_718b96c03b904e2b86c2bfa0cb1611d2~mv2.png', [960, 1600, 2400], SIZES.wide), focus: '60% 18%',
      alt: 'A leader speaks to church and nonprofit leaders seated at round tables during an ATX Outreach Connection gathering', credit: 'Serve Source' },
    { slot: 'S3', sel: '.feature-grid > .feature:nth-child(2) .feature-media img', was: 'coordinate-response-map', host: '.feature-media',
      keep: true, credit: 'Serve Source', label: 'Image' },
    { slot: 'S4', sel: '.feature-grid > .feature:nth-child(3) .feature-media img', was: 'f83a26_f02783dc', host: '.feature-media',
      media: { src: 'assets/img/field/gpc-trailer-chainsaw-wall.jpg' }, focus: '50% 38%',
      alt: 'A wall of racked chainsaws inside the God\u2019s Pit Crew equipment trailer', credit: 'Serve Source / God\u2019s Pit Crew' },
    { slot: 'S5', sel: '.impact-grid > .impact:nth-child(1) .impact-media img', was: 'd9baa3d76_library-of-congress', host: '.impact-media',
      media: img('f83a26_8f6d0540d18a411d9c28c9a188749bf5~mv2.jpg', [800, 1200, 1600], SIZES.half), focus: '50% 50%',
      alt: 'Volunteers in church shirts haul a tarp heaped with storm debris across a lawn', credit: 'Serve Source' },
    { slot: 'S6', sel: '.impact-grid > .impact:nth-child(2) .impact-media img', was: 'd615a2eda', host: '.impact-media',
      media: img('f83a26_4427b63b6ba446b4ae768479ae864289~mv2.jpg', [800, 1200, 1600, 2048], SIZES.half), focus: '50% 40%',
      alt: 'Dozens of volunteers fill and stack sandbags from pallets in a parking lot', credit: 'Courtesy Serve 6.8' },
    { slot: 'S7', sel: '.layer .layer-media img', was: 'ad55d62bd_connective-layer', host: '.layer-media',
      media: img('1d1de7_359b821f4e8d48bca1f88f69704c8ec6~mv2.jpg', [1200, 1600, 2400, 3200], '(min-width: 1069px) 60vw, 100vw'), focus: '42% 50%',
      alt: 'Two relief volunteers embrace in a storm-stripped yard while others work among broken trees', credit: 'Serve Source' },
    { slot: 'S9', sel: 'section.band > img.band-bg', was: 'd615a2eda', host: 'section.band',
      media: { src: B44 + 'eee78b02f_Long-termrecoverypanelatDRRN.JPG' }, focus: '60% 50%', credit: 'Serve Source' },
    // Rebuild header band: the rebuild crew before a newly framed building.
    { slot: 'S16', sel: 'section.band > img.band-bg', was: 'f83a26_0f45a7fb', host: 'section.band', keep: true, credit: 'Serve Source' },
    // After the Storm mosaic (home and rebuild). No photo repeats on a page: on home the framing photo is an intent tile,
    // so tile 1 becomes the forklift; tile 2 (both pages) is the Just the Crumbs team; tile 4 keeps the debris tarp.
    { slot: 'S10-1', sel: '.storm .mosaic > img:nth-child(1)', was: 'f83a26_0f45a7fb',
      media: img('4f0518_6dcb3687e60e414ca1e675886d86a6c9~mv2.jpeg', [600, 1000, 1400], '(min-width: 1069px) 45vw, 100vw'), focus: '50% 50%', home: false,
      alt: 'A forklift loads pallets of bottled water into a semi trailer while a volunteer holds the door', credit: 'Serve Source' },
    { slot: 'S10-1', sel: '.storm .mosaic > img:nth-child(1)', was: 'f83a26_0f45a7fb', home: true,
      media: imgJ('4f0518_7503bbd98e7e4a63ae566d3b00152edb~mv2.png', [600, 1000, 1400], '(min-width: 1069px) 45vw, 100vw'), focus: '72% 50%',
      alt: 'God\u2019s Pit Crew and 516 Project volunteers stretch a blue tarp across a storm-damaged roof', credit: 'Serve Source' },
    { slot: 'S10-2', sel: '.storm .mosaic > img:nth-child(2)', was: 'd615a2eda', home: true,
      media: { src: 'assets/img/field/kempner-assessment-walk.jpg' }, focus: '50% 55%',
      alt: 'Two Serve Source partners walk a storm-damaged property in Kempner, Texas, to assess the work', credit: 'Serve Source' },
    { slot: 'S10-2', sel: '.storm .mosaic > img:nth-child(2)', was: 'd615a2eda', home: false,
      media: imgJ('f83a26_a0ae5b7e01984582923621095d165b34~mv2.png', [500, 800, 1100], SIZES.tile), focus: '50% 45%',
      alt: 'The Just the Crumbs Ministries disaster relief team in front of their trailer', credit: 'Courtesy Just the Crumbs Ministries', note: 'team photo courtesy Just the Crumbs Ministries' },
    { slot: 'S10-3', sel: '.storm .mosaic > img:nth-child(3)', was: 'f83a26_f02783dc',
      media: img('1d1de7_6c8202a40e8a4922af5c7c890244495f~mv2.jpg', [400, 700, 1000], SIZES.tile), focus: '45% 40%',
      alt: 'A Mercy Chefs volunteer at work in a field kitchen', credit: 'Serve Source' },
    { slot: 'S10-4', sel: '.storm .mosaic > img:nth-child(4)', was: 'f83a26_8f6d0540', home: true,
      media: imgJ('f83a26_bff35aead7da496f8b1e82966ef2c307~mv2.png', [400, 700, 1000], SIZES.tile), focus: '50% 55%',
      alt: 'The Serve Source mobile shower trailer parked on a grass lot', credit: 'Serve Source' },
    { slot: 'S10-4', sel: '.storm .mosaic > img:nth-child(4)', was: 'f83a26_8f6d0540', home: false,
      media: img('f83a26_8f6d0540d18a411d9c28c9a188749bf5~mv2.jpg', [400, 700, 1000], SIZES.tile), focus: '50% 50%',
      alt: 'Volunteers in church shirts haul a tarp heaped with storm debris across a lawn', credit: 'Serve Source' },
    // Inner page heroes: photos are in the markup.
    { slot: 'S18', sel: '.page-hero > img.page-hero-bg', was: '1d1de7_9d816c96', host: '.page-hero', keep: true, credit: 'Representative photo \u00b7 Serve Source' },
    { slot: 'S19', sel: '.page-hero > img.page-hero-bg', was: 'f83a26_4427b63b', host: '.page-hero', keep: true, credit: 'Courtesy Serve 6.8' },
    { slot: 'S20', sel: '.net-hero-media > img', was: 'eee78b02f_Long-term', host: '.net-hero-media', keep: true, credit: 'Serve Source' },
    // Closing CTA band: the poster is a frame of the loop; the loop itself is added in setupLoop().
    { slot: 'S11', sel: 'section.cta > img.band-bg', was: 'f83a26_309b51cb', host: 'section.cta', video: true,
      media: { src: WIX + REEL_POSTER + '/v1/fill/w_1920,h_1080,al_c,q_80,enc_auto/' + REEL_POSTER,
        srcset: WIX + REEL_POSTER + '/v1/fill/w_960,h_540,al_c,q_80,enc_auto/' + REEL_POSTER + ' 960w, ' +
          WIX + REEL_POSTER + '/v1/fill/w_1920,h_1080,al_c,q_80,enc_auto/' + REEL_POSTER + ' 1920w', sizes: '(max-width: 734px) 400vw, 100vw' },
      focus: '50% 40%', credit: 'Serve Source', label: 'Video' }
  ];

  /* ---------- Representative stand-ins for disaster cards and headers (read by loadPhotos() in core.js) ---------- */
  function rep(src, credit) {
    var line = /^Photo by /.test(credit) ? 'Representative photo by ' + credit.slice(9) : 'Representative photo · ' + credit;
    return { src: src, credit: line, license: 'Public domain', representative: true };
  }
  var DVIDS_HURRICANE = DVIDS + '1811/4908566/1000w_q95.jpg';  // S8-B / S14-C: Samaritan's Purse tarp a roof, Hurricane Michael
  var DVIDS_SAWYERS = DVIDS + '2411/8746073/1000w_q95.jpg';    // S8-D / S13-A: sawyers clear Helene debris, Asheville
  try {
    window.SS_PHOTO_OVERRIDES = Object.assign({}, window.SS_PHOTO_OVERRIDES, {
      // S8: generic per-type fallbacks (used only when a disaster has no image of its own and no photos.json entry).
      'type:Flooding': { src: WIX + 'f83a26_5e6091a87fd04f15952cddadc0542621f000.jpg', credit: 'Representative photo · Serve Source', license: 'Serve Source', representative: true },
      'type:Hurricane': rep(WIX + '1d1de7_45037295a69e483299b3a2e2e5712b73~mv2.jpg/v1/fit/w_1920,h_3840,q_85,enc_auto/1d1de7_45037295a69e483299b3a2e2e5712b73~mv2.jpg', 'Serve Source'),
      'type:Tornado': rep('https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Moore%2C_Okla.%2C_June_7%2C_2013_--_Southern_Baptist_Disaster_Relief_%28SBDR%29_volunteers_demolish_remnants_of_destroyed_homes_and_push_debris_to_the_street._SBDR_is_an_important_partner_wit_-_DPLA_-_f73588b8850fd9c9bff69b9dcfcd23a0.jpg/960px-thumbnail.jpg', 'FEMA / George Armstrong'),
      'type:Storm': rep(DVIDS_SAWYERS, 'U.S. Army photo by 2nd Lt. Jacob Moir'),
      'type:Wind Storm': rep(DVIDS_SAWYERS, 'U.S. Army photo by 2nd Lt. Jacob Moir'),
      // S13: photos.json stand-ins the review called weak fits (a satellite, a landscape, an archival sepia flood).
      // Place-accurate picks stay; the Colombia earthquake keeps its photo because no candidate fits an earthquake.
      'tropical-storm-rachel-eastern-pacific': rep(DVIDS_SAWYERS, 'U.S. Army photo by 2nd Lt. Jacob Moir'),
      'nepal–tibet-flash-flood-august-2026': rep(DVIDS + '2410/8717195/1000w_q95.jpg', 'Photo by Jocelyn Augustino / FEMA'),
      'southeast-ohio-flooding-august-2026': rep(DVIDS + '2211/7522368/1000w_q95.jpg', 'Jocelyn Augustino / FEMA'),
      // Two flooding events side by side both fell back to the one Flooding stand-in; the second takes the other flood photo.
      'four-corners-flooding-october-2026': rep(DVIDS + '2211/7522368/1000w_q95.jpg', 'Jocelyn Augustino / FEMA')
    });
  } catch (e) {}

  /* ---------- Baseline styles for the elements this file adds (zero specificity: every theme rule wins) ---------- */
  var CSS = [
    ':where(.media-credit-host){position:relative}',
    ':where(.media-credit){display:block;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:12px;font-weight:400;line-height:1.35;letter-spacing:.01em;font-style:normal}',
    ':where(.media-credit-host)>:where(.media-credit),:where(.media-bar){position:absolute;right:12px;bottom:10px;z-index:3;max-width:calc(100% - 24px);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6);text-align:right}',
    ':where(.media-bar){display:flex;align-items:center;gap:10px}',
    ':where(.media-bar)>:where(.media-credit){position:static}',
    ':where(.mosaic)>:where(.media-credit--group){grid-column:1/-1;margin-top:8px;opacity:.72}',
    '@media (min-width:821px){:where(.mosaic)>:where(.media-credit--group){margin-top:44px}}',
    ':where(.media-video){opacity:0;transition:opacity .8s ease}',
    ':where(.media-video.is-playing){opacity:1}',
    // A 44px hit area around a 32px visible disc.
    ':where(.media-toggle){position:relative;display:inline-grid;place-items:center;width:44px;height:44px;margin:-6px;padding:0;border:0;border-radius:50%;background:none;color:#fff;cursor:pointer;flex:none}',
    ':where(.media-toggle)::before{content:"";position:absolute;inset:6px;border:1px solid rgba(255,255,255,.6);border-radius:50%;background:rgba(30,58,95,.55)}',
    ':where(.media-toggle) svg{position:relative}',
    ':where(.media-toggle) svg{width:16px;height:16px;display:block}',
    ':where(.media-toggle):focus-visible{outline:2px solid #f4a261;outline-offset:-4px}',
    '@media (prefers-reduced-motion:reduce){:where(.media-video){transition:none}}'
  ].join('\n');
  function addBaseStyle() {
    if (document.getElementById('ss-media-base')) return;
    var s = document.createElement('style');
    s.id = 'ss-media-base';
    s.textContent = CSS;
    // First in <head>, so theme stylesheets that come later win any tie.
    var head = document.head || document.getElementsByTagName('head')[0];
    if (head) head.insertBefore(s, head.firstChild);
  }

  /* ---------- Swapping ---------- */
  function label(rule) {
    var c = rule.credit || '';
    if (rule.label) return rule.label + ': ' + c;
    return /\bphoto\b/i.test(c) ? c : 'Photo: ' + c;
  }
  function ruleFor(el) {
    if (!el || el.tagName !== 'IMG') return null;
    var src = el.getAttribute('src') || '';
    for (var i = 0; i < SLOTS.length; i++) {
      var r = SLOTS[i];
      if (r.home !== undefined && r.home !== isHome) continue;
      if (src.indexOf(r.was) < 0) continue;
      try { if (el.matches(r.sel)) return r; } catch (e) {}
    }
    return null;
  }
  function swap(el) {
    try {
      if (el.getAttribute('data-media-slot')) return;
      var r = ruleFor(el);
      if (!r) return;
      el.setAttribute('data-media-slot', r.slot);
      el.setAttribute('data-credit', r.credit);
      if (r.keep || !r.media) return;
      var orig = { src: el.getAttribute('src'), alt: el.getAttribute('alt') };
      if (r.alt !== undefined) el.setAttribute('alt', r.alt);
      if (r.focus) el.style.objectPosition = r.focus;
      el.decoding = 'async';
      if (r.media.sizes) el.setAttribute('sizes', r.media.sizes);
      if (r.media.srcset) el.setAttribute('srcset', r.media.srcset);
      el.setAttribute('src', r.media.src);
      // A hotlink that fails falls back to the original image, and its credit goes with it.
      el.addEventListener('error', function onErr() {
        el.removeEventListener('error', onErr);
        el.removeAttribute('srcset'); el.removeAttribute('sizes'); el.style.objectPosition = '';
        el.setAttribute('src', orig.src);
        if (orig.alt !== null) el.setAttribute('alt', orig.alt);
        el.setAttribute('data-media-failed', '');
        var c = document.querySelector('.media-credit[data-slot="' + r.slot + '"]');
        if (c && c.parentNode) c.parentNode.removeChild(c);
        refreshGroupCredits();
      });
    } catch (e) {}
  }
  function swapAll() {
    try { var imgs = document.querySelectorAll('img'); for (var i = 0; i < imgs.length; i++) swap(imgs[i]); } catch (e) {}
  }

  // Swap as the parser adds each image, so the original never paints and lazy originals never load.
  var mo = null;
  try {
    mo = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'IMG') swap(n);
          else if (n.getElementsByTagName) { var inner = n.getElementsByTagName('img'); for (var k = 0; k < inner.length; k++) swap(inner[k]); }
        }
      }
    });
    mo.observe(root, { childList: true, subtree: true });
  } catch (e) { mo = null; }

  /* ---------- Credits ---------- */
  function addCredits() {
    var tagged = document.querySelectorAll('img[data-media-slot]:not([data-media-failed])');
    for (var i = 0; i < tagged.length; i++) {
      var el = tagged[i], slot = el.getAttribute('data-media-slot'), r = null;
      for (var k = 0; k < SLOTS.length; k++) if (SLOTS[k].slot === slot && (SLOTS[k].home === undefined || SLOTS[k].home === isHome)) { r = SLOTS[k]; break; }
      if (!r || !r.host || r.video) continue;
      var host = el.closest(r.host);
      if (!host || host.querySelector('.media-credit[data-slot="' + slot + '"]')) continue;
      host.classList.add('media-credit-host');
      var c = document.createElement('span');
      c.className = 'media-credit';
      c.setAttribute('data-slot', slot);
      c.textContent = label(r);
      host.appendChild(c);
    }
    refreshGroupCredits();
  }
  // One credit row per group (the After the Storm mosaic, the intent tiles), listing each photo's credit in order.
  // The mosaic keeps its row inside the grid (it spans the grid); the intent grid gets it as the next sibling.
  function refreshGroupCredits() {
    try {
      var groups = document.querySelectorAll('.storm .mosaic, .intent-grid');
      for (var i = 0; i < groups.length; i++) {
        var m = groups[i], inside = m.classList.contains('mosaic'), tiles = m.querySelectorAll('img[data-media-slot]'), parts = [];
        for (var j = 0; j < tiles.length; j++) {
          if (tiles[j].hasAttribute('data-media-failed')) continue;
          var sl = tiles[j].getAttribute('data-media-slot'), note = null;
          for (var q = 0; q < SLOTS.length; q++) if (SLOTS[q].slot === sl && (SLOTS[q].home === undefined || SLOTS[q].home === isHome)) { note = SLOTS[q].note || null; break; }
          parts.push({ credit: tiles[j].getAttribute('data-credit'), note: note });
        }
        var c = inside ? m.querySelector(':scope > .media-credit--group') : (m.nextElementSibling && m.nextElementSibling.classList.contains('media-credit--group') ? m.nextElementSibling : null);
        if (!parts.length) { if (c && c.parentNode) c.parentNode.removeChild(c); continue; }
        if (!c) {
          c = document.createElement('p');
          c.className = 'media-credit media-credit--group';
          c.setAttribute('data-slot', inside ? 'S10' : 'I');
          if (inside) m.appendChild(c); else m.parentNode.insertBefore(c, m.nextSibling);
        }
        // One name per owner: "Photos: Serve Source; team photo courtesy Just the Crumbs Ministries".
        var names = [];
        for (var n = 0; n < parts.length; n++) {
          var nm = parts[n].credit === 'Serve Source' ? 'Serve Source' : (parts[n].note || parts[n].credit);
          if (names.indexOf(nm) < 0) names.push(nm);
        }
        names.sort(function (x, y) { return (y === 'Serve Source') - (x === 'Serve Source'); });
        var text = (names.length > 1 || parts.length > 1 ? 'Photos: ' : 'Photo: ') + names.join('; ');
        if (c.textContent !== text) c.textContent = text;
      }
    } catch (e) {}
  }

  /* ---------- S11: one muted loop on the closing band ---------- */
  var LOOP = {
    // Field shots only: the storm-wrecked yard, then the chainsaw crew on a roof. A crossfade to a stage shot starts at
    // about 7.9 s, and the shot of volunteers hugging a woman holding a toddler (12 to 16 s) is never reached.
    start: 0, end: 7.4,
    src: function () {
      var wide = Math.max(window.innerWidth || 0, 0) * (window.devicePixelRatio || 1) >= 2400;
      return 'https://video.wixstatic.com/video/' + REEL + '/' + (wide ? '1080p' : '720p') + '/mp4/file.mp4';
    }
  };
  var ICONS = {
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="4" y="3" width="2.6" height="10" rx=".6" fill="currentColor"/><rect x="9.4" y="3" width="2.6" height="10" rx=".6" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 3.2v9.6c0 .5.5.8.9.5l7.2-4.8c.4-.3.4-.8 0-1L5.9 2.7c-.4-.3-.9 0-.9.5z" fill="currentColor"/></svg>'
  };
  function setupLoop() {
    try {
      var poster = document.querySelector('section.cta > img[data-media-slot="S11"]:not([data-media-failed])');
      if (!poster) return;
      var section = poster.parentNode;
      if (section.querySelector(':scope > .media-bar')) return;
      var rule = null;
      for (var k = 0; k < SLOTS.length; k++) if (SLOTS[k].slot === 'S11') rule = SLOTS[k];

      var bar = document.createElement('div');
      bar.className = 'media-bar';
      bar.setAttribute('data-slot', 'S11');
      var credit = document.createElement('span');
      credit.className = 'media-credit';
      credit.setAttribute('data-slot', 'S11');
      credit.textContent = label(rule);
      bar.appendChild(credit);
      section.appendChild(bar);
      section.classList.add('has-media-video');

      var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (reduce.matches || (conn && conn.saveData) || typeof document.createElement('video').canPlayType !== 'function') {
        section.setAttribute('data-media-video', 'poster');
        return;
      }
      section.setAttribute('data-media-video', 'video');

      var v = document.createElement('video');
      v.className = 'band-bg media-video';
      v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
      v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
      v.setAttribute('preload', 'none');
      v.setAttribute('aria-hidden', 'true');
      v.setAttribute('tabindex', '-1');
      v.setAttribute('disablepictureinpicture', '');
      v.setAttribute('disableremoteplayback', '');
      v.poster = poster.currentSrc || poster.getAttribute('src');
      if (poster.style.objectPosition) v.style.objectPosition = poster.style.objectPosition;
      section.insertBefore(v, poster.nextSibling);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'media-toggle';
      bar.insertBefore(btn, credit);

      var state = { userPaused: false, visible: false, loaded: false };
      function render() {
        // Shows "play" when the viewer paused it, or when autoplay was refused while the band is on screen.
        var stopped = state.userPaused || (state.loaded && v.paused && state.visible && !document.hidden);
        btn.innerHTML = stopped ? ICONS.play : ICONS.pause;
        btn.setAttribute('aria-label', stopped ? 'Play background video' : 'Pause background video');
        btn.classList.toggle('is-paused', stopped);
      }
      function play() {
        if (state.userPaused || !state.visible || document.hidden || reduce.matches) return;
        if (!state.loaded) { state.loaded = true; v.src = LOOP.src(); }
        try {
          var p = v.play();
          if (p && p.catch) p.catch(function () { render(); });
        } catch (e) {}
      }
      function pause() { try { v.pause(); } catch (e) {} }
      function guard(t) { if (t >= LOOP.end || t < LOOP.start - 0.05) { try { v.currentTime = LOOP.start; } catch (e) {} } }

      v.addEventListener('timeupdate', function () { guard(v.currentTime); });
      v.addEventListener('ended', function () { guard(Infinity); play(); });
      v.addEventListener('playing', function () { v.classList.add('is-playing'); render(); });
      v.addEventListener('pause', render);
      v.addEventListener('error', function () { v.classList.remove('is-playing'); section.setAttribute('data-media-video', 'poster'); render(); });
      // Frame-accurate segment end where supported (timeupdate alone can run a quarter second late).
      if ('requestVideoFrameCallback' in v) {
        var onFrame = function (now, meta) { guard(meta && meta.mediaTime != null ? meta.mediaTime : v.currentTime); v.requestVideoFrameCallback(onFrame); };
        v.requestVideoFrameCallback(onFrame);
      }

      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-paused')) { state.userPaused = false; play(); }
        else { state.userPaused = true; pause(); }
        render();
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            state.visible = entries[i].isIntersecting;
            if (state.visible) play(); else pause();
          }
        }, { rootMargin: '200px 0px' }).observe(section);
      } else { state.visible = true; play(); }

      document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else play(); });
      var onReduce = function () { if (reduce.matches) { state.userPaused = true; pause(); render(); } };
      if (reduce.addEventListener) reduce.addEventListener('change', onReduce); else if (reduce.addListener) reduce.addListener(onReduce);
      render();
    } catch (e) {}
  }

  /* ---------- Run ---------- */
  function finish() {
    swapAll();
    addCredits();
    setupLoop();
    if (mo) { try { mo.disconnect(); } catch (e) {} mo = null; }
  }
  try {
    addBaseStyle();
    window.SS_MEDIA = { ready: true, slots: SLOTS, refresh: function () { try { swapAll(); addCredits(); setupLoop(); } catch (e) {} } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', finish);
    else finish();
  } catch (e) {}
})();
