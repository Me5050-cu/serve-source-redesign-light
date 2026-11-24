// Shared pieces for every page: icons, header, footer, data access and small helpers.
const APP = 'https://app.servesource.org';
const API = `${APP}/api/apps/695c704f24f26045c4d0f1c0`;

/* ---------- Icons (24px line icons) ---------- */
const ICONS = {
  chevron: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  users: '<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"/><circle cx="10" cy="8" r="3.5"/><path d="M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.6a3.5 3.5 0 0 1 0 6.8"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  shield: '<path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6l-7-3z"/>',
  shieldCheck: '<path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"/>',
  heart: '<path d="M20.8 5.6a5.4 5.4 0 0 0-7.7 0L12 6.7l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 22l8.8-8.7a5.4 5.4 0 0 0 0-7.7z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  hands: '<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11M10 9.5V4a1.5 1.5 0 0 1 3 0v5.5M13 9.5V5.5a1.5 1.5 0 0 1 3 0V13"/><path d="M16 9a1.5 1.5 0 0 1 3 0v4a8 8 0 0 1-8 8h-.5A6.5 6.5 0 0 1 4 14.5V12a1.5 1.5 0 0 1 3 0"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/><circle cx="12" cy="12" r="1"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5z"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  x: '<path d="M4 4l16 16M20 4 4 20"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  life: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
  waves: '<path d="M2 7c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  tornado: '<path d="M3 4h18M5 8h13M8 12h9M10 16h5M12 20h1"/>',
  flame: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7z"/>',
  snow: '<path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5"/>',
  chevronUp: '<path d="m6 15 6-6 6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  hammer: '<path d="m14 10-9 9a2 2 0 0 1-3-3l9-9"/><path d="m13 4 7 7-2.5 2.5-7-7z"/><path d="m15.5 1.5 7 7"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
// Static markup marks icons with data-icon="name"; this fills them in.
const hydrateIcons = (root = document) => root.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

/* ---------- Helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Display-only disaster name: ' - ' becomes a no-break space + en dash so a wrapped line never starts with the dash.
const dname = (s) => String(s ?? '').replace(/ - /g, '\u00a0\u2013 ');
// Dates arrive as "2026-10-06" (local day) or as UTC timestamps that may lack the trailing Z.
function toDate(iso) {
  if (iso.length <= 10) return new Date(`${iso}T12:00:00`);
  return new Date(/Z$|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
}
function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.round((Date.now() - toDate(iso)) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}
const fmtDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => (iso ? toDate(iso).toLocaleDateString('en-US', opts) : '');
const STATUS = {
  monitoring: { label: 'Monitoring', cls: 'monitoring', step: 0 },
  assessment: { label: 'Assessment', cls: 'assessment', step: 1 },
  active_deployment: { label: 'Response', cls: 'response', step: 2 },
  long_term_recovery: { label: 'Long-Term Recovery', cls: 'recovery', step: 3 },
  archived: { label: 'Archived', cls: 'archived', step: 4 },
};
const statusPill = (s, extra = '') => { const st = STATUS[s] || { label: s, cls: '' }; return `<span class="pill ${st.cls} ${extra}"><span class="dot"></span>${esc(st.label)}</span>`; };
const youtubeId = (url) => (String(url).match(/(?:v=|youtu\.be\/|embed\/|live\/)([\w-]{11})/) || [])[1];

/* ---------- Data ----------
   Every request names the public fields it needs, so private columns (emails, internal notes)
   never reach the browser. If the live call fails, the page uses the saved copy in assets/data/. */
let usedSnapshot = false;
async function getJSON(url, snapshotKey, timeout = 9000) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    if (!snapshotKey) throw err;
    usedSnapshot = true;
    updateRibbon();
    const res = await fetch(`assets/data/${snapshotKey}.json`);
    return res.ok ? res.json() : [];
  }
}
function entity(name, { q, sort, limit, fields } = {}, snapshotKey) {
  const p = new URLSearchParams();
  if (q) p.set('q', JSON.stringify(q));
  if (sort) p.set('sort', sort);
  if (limit) p.set('limit', limit);
  if (fields) p.set('fields', fields.join(','));
  return getJSON(`${API}/entities/${name}?${p}`, snapshotKey);
}
const publicDisaster = (slug, snapshotKey) => getJSON(`${API}/functions/publicDisasterData?disaster=${encodeURIComponent(slug)}`, snapshotKey);

const DISASTER_CARD_FIELDS = ['id', 'name', 'slug', 'status', 'event_type', 'affected_regions', 'date_reported', 'last_response_update_at', 'custom_background_image_url', 'disaster_type_id', 'custom_icon_graphic_url'];
// Field-media directions (assets/js/media.js) may set window.SS_PHOTO_OVERRIDES: entries by slug, and 'type:<Type name>' fallbacks.
async function loadPhotos() {
  let photos = {};
  try { photos = await (await fetch('assets/data/photos.json')).json(); } catch {}
  return Object.assign(photos, window.SS_PHOTO_OVERRIDES);
}
async function loadTypes() {
  const list = await entity('DisasterType', { limit: 200, fields: ['id', 'name', 'background_image_url', 'icon_graphic_url'] }, 'types');
  return Object.fromEntries(list.map((t) => [t.id, t]));
}
// Serve Source's own custom photo wins, then the place-specific photo we sourced, then the type's stock photo.
function disasterImage(d, types, photos) {
  if (d.custom_background_image_url) return { src: d.custom_background_image_url };
  if (photos[d.slug]) return photos[d.slug];
  const type = types[d.disaster_type_id];
  if (type?.background_image_url && photos[`type:${type.name}`]) return photos[`type:${type.name}`];
  return { src: type?.background_image_url || '' };
}
function disasterCard(d, types, photos, { cta = 'View details' } = {}) {
  const img = disasterImage(d, types, photos);
  const ico = d.custom_icon_graphic_url || types[d.disaster_type_id]?.icon_graphic_url;
  const updated = d.last_response_update_at ? `Updated ${timeAgo(d.last_response_update_at)}` : '';
  return `<a class="d-card" href="disaster.html?disaster=${encodeURIComponent(d.slug)}">
    <div class="d-media">
      ${img.src ? `<img class="photo" src="${esc(img.src)}" alt="" loading="lazy">` : ''}
      ${statusPill(d.status, 'on-photo')}
      ${ico ? `<img class="type-icon" src="${esc(ico)}" alt="">` : ''}
      ${img.credit ? `<span class="credit" title="${esc(img.credit)} · ${esc(img.license)}">${esc(img.credit)}</span>` : ''}
    </div>
    <div class="d-body">
      <h3>${esc(dname(d.name))}</h3>
      <div class="d-meta">
        <span>${icon('pin')}<span class="clamp">${esc(d.affected_regions || '')}</span></span>
        <span>${icon('calendar')}${fmtDate(d.date_reported)}</span>
      </div>
      <div class="d-foot"><span class="updated">${esc(updated)}</span><span class="go">${esc(cta)}${icon('chevronRight')}</span></div>
    </div>
  </a>`;
}

/* ---------- YouTube: show the thumbnail, load the player only when someone presses play ---------- */
function videoFacade(url, title) {
  const id = youtubeId(url);
  if (!id) return '';
  return `<div class="video" data-yt="${id}">
    <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">
    <button class="play" aria-label="Play ${esc(title)}"><span>${icon('play')}</span></button>
  </div>`;
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.video .play');
  if (!btn) return;
  const box = btn.closest('.video');
  box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&mute=1&rel=0" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
});

/* ---------- Header & footer ---------- */
const NAV = [
  { label: 'Disaster Response', items: [
    ['Active Disasters & Monitoring', 'disasters.html', 'radar', 'Live events and partner response'],
    ['Rebuild & Long-Term Recovery', 'rebuild.html', 'home', 'Rebuild projects you can join'],
    ['Response Partner Map', 'organizations.html?type=faith_based_nonprofit,church&tags=Disaster%20Relief', 'map', 'Who serves where'],
    ['Annual Conference (DRRN)', 'https://www.servesource.org/drrn2026', 'users', 'Disaster Response Relational Network'],
    ['Host a Regional Event', `${APP}/partner`, 'calendar', 'Bring DRRN to your region'],
  ] },
  { label: 'Networks', items: [
    ['National Networks Map', 'networks.html', 'globe', 'Community networks nationwide'],
    ['AustinServes', `${APP}/networks/austin`, 'pin', 'Austin-area network'],
    ['ATX Outreach Connection', `${APP}/atxoutreach`, 'heart', 'Outreach across Austin'],
    ['Leader Connections', 'https://www.servesource.org/join-groups', 'users', 'Join a leader group'],
  ] },
  { label: 'Resources', items: [
    ['Resource Library', `${APP}/Resources`, 'file', 'Guides, tools and templates'],
    ['Register Your Organization', `${APP}/GetStarted`, 'building', 'Add your church or nonprofit'],
    ['Press Releases', `${APP}/Press-Releases`, 'file', 'News and response updates'],
    ['Consulting / Speaker Request', `${APP}/partner`, 'user', 'Invite Serve Source'],
    ['Help Center', `${APP}/Help-Center`, 'info', 'Questions and support'],
  ] },
];

// Pages not yet redesigned live on app.servesource.org; those links open in a new tab.
const isExternal = (h) => /^https?:/.test(h);
const extAttrs = (h) => (isExternal(h) ? ' target="_blank" rel="noopener"' : '');

function renderHeader({ dark = false } = {}) {
  const menus = NAV.map((m, i) => `
    <div class="nav-item">
      <button class="nav-trigger" aria-expanded="false" aria-controls="menu-${i}">${m.label}${icon('chevron')}</button>
      <div class="nav-menu" id="menu-${i}" role="menu">
        ${m.items.map(([t, h, ic, sub]) => `<a role="menuitem" href="${h}"${extAttrs(h)}>${icon(ic)}<span>${t}<small>${sub}</small></span>${isExternal(h) ? icon('external', 'ext') : ''}</a>`).join('')}
      </div>
    </div>`).join('');
  const mobile = NAV.map((m) => `<details><summary>${m.label}${icon('chevron')}</summary><div>${m.items.map(([t, h]) => `<a href="${h}"${extAttrs(h)}>${t}</a>`).join('')}</div></details>`).join('');
  const header = document.createElement('header');
  header.className = `site-header${dark ? ' on-dark' : ''}`;
  header.innerHTML = `
    <div class="wrap">
      <a class="brand" href="index.html"><img src="assets/img/logo.png" alt="">Serve Source</a>
      <nav class="nav" aria-label="Main">${menus}</nav>
      <div class="header-actions">
        <button class="search-btn" type="button" data-open-search aria-label="Search">${icon('search')}<span>Search</span><kbd>⌘K</kbd></button>
        <a class="link-quiet donate" href="${APP}/give" target="_blank" rel="noopener">Donate</a>
        <a class="link-quiet" href="${APP}/Dashboard" target="_blank" rel="noopener">Sign In</a>
        <a class="btn btn-primary btn-sm" href="${APP}/GetStarted" target="_blank" rel="noopener">Get Started</a>
      </div>
      <button class="search-btn m" type="button" data-open-search aria-label="Search">${icon('search')}</button>
      <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button>
    </div>
    <div class="mobile-menu">${mobile}
      <div class="m-actions">
        <a class="btn btn-dark" href="${APP}/GetStarted">Get Started</a>
        <a class="btn btn-primary" href="${APP}/give">Donate</a>
        <a class="btn btn-outline" href="${APP}/Dashboard">Sign In</a>
      </div>
    </div>`;
  document.body.prepend(header);
  // Mark the current section in the dropdowns and the phone sheet (the tab bar does its own).
  const here0 = location.pathname.split('/').pop() || 'index.html';
  const here = here0 === 'disaster.html' ? 'disasters.html' : here0;
  $$('.nav-menu a, .mobile-menu details a', header).forEach((a) => {
    const h = a.getAttribute('href');
    if (!isExternal(h) && h.split('?')[0] === here) {
      a.setAttribute('aria-current', 'page');
      a.closest('.nav-item')?.classList.add('current');
    }
  });
  // The phone sheet is position:fixed; the header's backdrop-filter would make the header its
  // containing block (clipping it to the 52px bar), so it lives next to the header instead.
  const mm = $('.mobile-menu', header);
  header.after(mm);
  // Utility bar above the main nav (shown by the Civic direction only).
  const util = document.createElement('div');
  util.className = 'utility-bar';
  util.innerHTML = `<div class="wrap"><span>Connect · Collaborate · Serve</span><span class="ub-links"><a href="${APP}/Help-Center" target="_blank" rel="noopener">Help Center</a><a href="${APP}/Dashboard" target="_blank" rel="noopener">Sign In</a><a class="ub-donate" href="${APP}/give" target="_blank" rel="noopener">Donate</a></span></div>`;
  document.body.prepend(util);

  // Dropdowns open on hover (pointer) or click (touch/keyboard), and close on outside click or Escape.
  const items = $$('.nav-item', header);
  const close = (except) => items.forEach((it) => { if (it !== except) { it.classList.remove('open'); $('.nav-trigger', it).setAttribute('aria-expanded', 'false'); } });
  items.forEach((it) => {
    const trig = $('.nav-trigger', it);
    const open = () => { close(it); it.classList.add('open'); trig.setAttribute('aria-expanded', 'true'); };
    let byHover = false;
    // A click on a menu the pointer just opened by hovering keeps it open instead of toggling it shut.
    trig.addEventListener('click', () => {
      if (it.classList.contains('open') && byHover) { byHover = false; return; }
      byHover = false;
      it.classList.contains('open') ? close() : open();
    });
    it.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) { open(); byHover = true; } });
    it.addEventListener('mouseleave', () => { if (matchMedia('(hover: hover)').matches) { byHover = false; close(); } });
    // Keyboard: tabbing out of a menu closes it (unless the pointer is still over it).
    it.addEventListener('focusout', (e) => { if (!it.contains(e.relatedTarget) && !it.matches(':hover')) { byHover = false; close(); } });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav-item')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const toggle = $('.menu-toggle', header);
  toggle.addEventListener('click', () => {
    const open = !mm.classList.contains('open');
    mm.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = icon(open ? 'close' : 'menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  renderTabBar();
  initSearch();

  // On pages with a dark hero, the header turns light once the hero scrolls away.
  if (dark) {
    const hero = $('.hero');
    const onScroll = () => header.classList.toggle('on-dark', !hero || hero.getBoundingClientRect().bottom > 60);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

/* ---------- Phone tab bar ---------- */
function renderTabBar() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const tabs = [['Home', 'index.html', 'home'], ['Disasters', 'disasters.html', 'radar'], ['Rebuild', 'rebuild.html', 'hammer'], ['Partners', 'organizations.html', 'building'], ['Networks', 'networks.html', 'users']];
  const bar = document.createElement('nav');
  bar.className = 'tabbar';
  bar.setAttribute('aria-label', 'Sections');
  const active = here === 'disaster.html' ? 'disasters.html' : here;
  bar.innerHTML = tabs.map(([t, h, ic]) => `<a href="${h}"${h === active ? ' aria-current="page"' : ''}>${icon(ic)}<span>${t}</span></a>`).join('');
  document.body.append(bar);
}

/* ---------- Quick search (⌘K / Ctrl K) ---------- */
function initSearch() {
  const box = document.createElement('div');
  box.className = 'cmdk';
  box.hidden = true;
  box.innerHTML = `<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Search Serve Source">
    <label class="cmdk-input">${icon('search')}<input type="text" placeholder="Search disasters, organizations, networks…" aria-label="Search" autocomplete="off"><kbd>esc</kbd></label>
    <div class="cmdk-results" role="listbox"></div>
    <div class="cmdk-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>↵</kbd> to open</span></div>
  </div>`;
  document.body.append(box);
  const input = $('input', box), results = $('.cmdk-results', box);
  const PAGES = [['Home', 'index.html', 'home'], ['Active Disasters & Monitoring', 'disasters.html', 'radar'], ['Rebuild & Long-Term Recovery', 'rebuild.html', 'hammer'], ['Organizations', 'organizations.html', 'building'], ['Community Networks', 'networks.html', 'users'],
    ['Register Your Organization', `${APP}/GetStarted`, 'plus'], ['Resource Library', `${APP}/Resources`, 'file'], ['Help Center', `${APP}/Help-Center`, 'info'], ['Donate', `${APP}/give`, 'heart']];
  let data = null, items = [], sel = 0;
  async function load() {
    if (data) return data;
    const [d, o, n] = await Promise.all([
      entity('Disaster', { sort: '-date_reported', limit: 200, fields: ['name', 'slug', 'status', 'affected_regions'] }, 'disasters').catch(() => []),
      entity('Organization', { q: { status: 'active', is_publicly_visible: true }, limit: 1000, fields: ['id', 'name', 'org_type'] }, 'org-cards').catch(() => []),
      entity('Network', { q: { status: 'active' }, limit: 200, fields: ['id', 'name', 'slug', 'basic_link_only', 'website', 'city', 'state'] }, 'networks').catch(() => []),
    ]);
    data = { d, o, n };
    return data;
  }
  const row = (r) => `<a class="cmdk-item" role="option" href="${esc(r.href)}"${extAttrs(r.href)}>${icon(r.icon)}<span><b>${esc(r.title)}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</span>${r.pill || ''}</a>`;
  function render() {
    const q = input.value.trim().toLowerCase();
    const groups = [];
    const pages = PAGES.filter(([t]) => !q || t.toLowerCase().includes(q)).map(([t, h, ic]) => ({ title: t, href: h, icon: ic }));
    if (data) {
      const match = (t) => !q || t.toLowerCase().includes(q);
      const dis = data.d.filter((x) => x.status !== 'archived' && match(`${x.name} ${x.affected_regions || ''}`)).slice(0, q ? 6 : 4)
        .map((x) => ({ title: dname(x.name), sub: x.affected_regions, href: `disaster.html?disaster=${encodeURIComponent(x.slug)}`, icon: 'alert', pill: statusPill(x.status) }));
      if (dis.length) groups.push(['Disasters', dis]);
      if (q) {
        const orgs = data.o.filter((x) => match(x.name)).slice(0, 5).map((x) => ({ title: x.name, sub: ORG_LABEL[x.org_type] || 'Organization', href: `${APP}/OrganizationDetail?id=${x.id}`, icon: 'building' }));
        if (orgs.length) groups.push(['Organizations', orgs]);
        const nets = data.n.filter((x) => match(`${x.name} ${x.city || ''}`)).slice(0, 4).map((x) => ({ title: x.name.trim(), sub: [x.city, x.state].filter(Boolean).join(', '), href: x.basic_link_only ? x.website : `${APP}/networks/${x.slug}`, icon: 'users' }));
        if (nets.length) groups.push(['Networks', nets]);
      }
    }
    if (pages.length) groups.push([q ? 'Pages' : 'Go to', pages.slice(0, q ? 4 : 9)]);
    items = groups.flatMap(([, rs]) => rs);
    sel = 0;
    results.innerHTML = items.length ? groups.map(([g, rs]) => `<div class="cmdk-group">${g}</div>${rs.map(row).join('')}`).join('') : `<div class="cmdk-empty">No results for “${esc(input.value)}”</div>`;
    paint();
  }
  function paint() { $$('.cmdk-item', results).forEach((el, i) => el.setAttribute('aria-selected', String(i === sel))); $$('.cmdk-item', results)[sel]?.scrollIntoView({ block: 'nearest' }); }
  function open() { box.hidden = false; document.body.style.overflow = 'hidden'; input.value = ''; render(); input.focus(); load().then(render); }
  function close() { box.hidden = true; document.body.style.overflow = ''; }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-search]')) open(); });
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  input.addEventListener('input', render);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); box.hidden ? open() : close(); return; }
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
    else if (e.key === 'Enter') { const a = $$('.cmdk-item', results)[sel]; if (a) { e.preventDefault(); a.click(); } }
  });
}
const ORG_LABEL = { church: 'Church', faith_based_nonprofit: 'Faith-Based Nonprofit', community_nonprofit: 'Community Nonprofit', government_agency: 'Government Agency' };

function renderFooter() {
  const col = (title, links) => `<div><h4>${title}</h4><ul>${links.map(([t, h]) => `<li><a href="${h}"${extAttrs(h)}>${t}</a></li>`).join('')}</ul></div>`;
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="wrap">
      <p class="footer-note">Serve Source connects churches, nonprofits, disaster response organizations, and community partners so communities receive clearer, stronger, and more connected support — in everyday outreach and in times of crisis.</p>
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="index.html"><img src="assets/img/logo.png" alt="">Serve Source</a>
          <p>Serve Source is the collaborative infrastructure that helps churches, nonprofits, and response partners connect, communicate, and coordinate more effectively in times of crisis and community need. The passion to serve already exists. The infrastructure often does not.</p>
          <div class="socials">
            <a href="https://www.facebook.com/servesource" aria-label="Facebook" target="_blank" rel="noopener">${icon('facebook')}</a>
            <a href="https://www.instagram.com/servesource/" aria-label="Instagram" target="_blank" rel="noopener">${icon('instagram')}</a>
            <a href="https://www.youtube.com/@servesource" aria-label="YouTube" target="_blank" rel="noopener">${icon('youtube')}</a>
            <a href="https://x.com/Serve_Source" aria-label="X" target="_blank" rel="noopener">${icon('x')}</a>
          </div>
        </div>
        ${col('Quick Links', [['Active Disasters', 'disasters.html'], ['Rebuild &amp; Recovery', 'rebuild.html'], ['Organizations', 'organizations.html'], ['Community Networks', 'networks.html'], ['About Us', `${APP}/About`], ['Help Center', `${APP}/Help-Center`]])}
        ${col('For Organizations', [['Get Started', `${APP}/GetStarted`], ['Dashboard', `${APP}/Dashboard`], ['Resources', `${APP}/Resources`], ['Press Releases', `${APP}/Press-Releases`]])}
      </div>
      <div class="footer-bottom"><span>Copyright © 2022 – 2026 Serve Source. All rights reserved.</span><span><a href="${APP}/Privacy-Policy" target="_blank" rel="noopener">Privacy Policy</a> &nbsp;|&nbsp; <a href="${APP}/Terms-of-Service" target="_blank" rel="noopener">Terms of Service</a></span></div>
    </div>`;
  document.body.append(footer);
}

// Sticky in-page navigation (title on the left, section links + one action on the right).
function renderSubnav({ title, links, cta }) {
  document.body.classList.add('has-subnav');
  const bar = document.createElement('nav');
  bar.className = 'subnav';
  bar.setAttribute('aria-label', 'On this page');
  bar.innerHTML = `<div class="wrap">
    <span class="subnav-title" id="subnav-title">${esc(title)}</span>
    <div class="subnav-links">${links.map(([t, id]) => `<a href="#${id}" data-target="${id}">${t}</a>`).join('')}</div>
    ${cta ? `<a class="btn btn-primary btn-sm" href="${cta.href}"${extAttrs(cta.href)}>${cta.label}</a>` : ''}
  </div>`;
  $('.site-header').after(bar);
  // Underline the section currently in view.
  const anchors = $$('.subnav-links a', bar);
  const mark = (id) => anchors.forEach((a) => a.classList.toggle('active', a.dataset.target === id));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) mark(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  // A click marks its link at once (short sections may never reach the middle band), and back above the first section nothing is marked.
  bar.addEventListener('click', (e) => { const a = e.target.closest('[data-target]'); if (a) mark(a.dataset.target); });
  addEventListener('scroll', () => { const first = document.getElementById(links[0][1]); if (first && first.getBoundingClientRect().top > innerHeight * 0.5) mark(null); }, { passive: true });
  const observe = () => links.forEach(([, id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
  observe();
  return { setTitle: (t) => ($('#subnav-title').textContent = t), observe };
}

// Floating preview control: pick the design direction (Civic, Cinema), the colorway and the typeface, compare, or open the
// live page. The lists come from theme.js (window.SS_PREVIEW) so the ribbon, compare.html and theme.js never disagree.
// [key, name, description] (the description is each control's tooltip).
const PREVIEW = window.SS_PREVIEW || { themes: [['civic', 'Civic', ''], ['cinema', 'Cinema', '']], colorways: [['platform', 'Platform', '']], types: [['system', 'System', '']], defaults: { theme: 'civic', colorway: 'platform', type: 'system' } };
const THEME_NAMES = PREVIEW.themes;
function compareHref() {
  const u = new URL(location.href);
  ['theme', 'colorway', 'type', 'frame'].forEach((k) => u.searchParams.delete(k));
  const page = (location.pathname.split('/').pop() || 'index.html') + u.search;
  const cw = PREVIEW.colorway || PREVIEW.defaults.colorway, ty = PREVIEW.type || PREVIEW.defaults.type;
  const suffix = (cw !== PREVIEW.defaults.colorway || ty !== PREVIEW.defaults.type) ? `:${cw}${ty === 'barlow' ? ':barlow' : ''}` : '';
  return `compare.html?page=${encodeURIComponent(page)}${suffix ? `&frames=${encodeURIComponent(['live', ...THEME_NAMES.map(([k]) => k + suffix)].join(','))}` : ''}`;
}
function renderRibbon(liveUrl) {
  const root = document.documentElement.dataset;
  const current = root.theme || PREVIEW.defaults.theme, cw = root.colorway || PREVIEW.defaults.colorway, ty = root.type || PREVIEW.defaults.type;
  const name = (list, k) => (list.find(([x]) => x === k) || [k, k])[1];
  const el = document.createElement('div');
  el.className = 'mock-ribbon'; el.id = 'ss-ribbon';
  el.innerHTML = `<button type="button" class="mr-toggle" aria-expanded="false" aria-controls="mr-body" title="Show the preview controls"><b>Preview</b><span class="mr-now">${name(THEME_NAMES, current)} · ${name(PREVIEW.colorways, cw)}</span>${icon('chevronUp')}</button>
    <span class="mr-body" id="mr-body">
      <span class="mr-label"><b>Preview</b> <span class="src" id="ribbon-src">· live data</span></span>
      <span class="mr-seg mr-themes" role="group" aria-label="Design direction">${THEME_NAMES.map(([k, l, d]) => `<button type="button" data-theme="${k}" aria-pressed="${k === current}" title="${l}: ${d}">${l}</button>`).join('')}</span>
      <label class="mr-pick" title="Colorway: the colour set from Derick's guide (v1.4 §6)"><span class="mr-cap">Colors</span><select id="mr-colorway" aria-label="Colorway">${PREVIEW.colorways.map(([k, l, d]) => `<option value="${k}" title="${d}"${k === cw ? ' selected' : ''}>${l}</option>`).join('')}</select>${icon('chevron')}</label>
      <span class="mr-seg mr-type" role="group" aria-label="Typeface">${PREVIEW.types.map(([k, l, d]) => `<button type="button" data-type="${k}" aria-pressed="${k === ty}" title="${d}">${l}</button>`).join('')}</span>
      <span class="mr-links"><a class="mr-compare" href="${compareHref()}" title="Compare the live site and both directions side by side">Compare</a>
      <a href="${liveUrl}" target="_blank" rel="noopener" title="Open the current live page">Live ${icon('external')}</a></span>
    </span>`;
  const go = (key, v) => { const u = new URL(location.href); u.searchParams.set(key, v); location.href = u.toString(); };
  el.addEventListener('click', (e) => {
    const tog = e.target.closest('.mr-toggle');
    if (tog) { const open = !el.classList.contains('open'); el.classList.toggle('open', open); tog.setAttribute('aria-expanded', String(open)); return; }
    const b = e.target.closest('button[data-theme], button[data-type]'); if (!b || b.getAttribute('aria-pressed') === 'true') return;
    if (b.dataset.theme) go('theme', b.dataset.theme); else go('type', b.dataset.type);
  });
  el.querySelector('#mr-colorway').addEventListener('change', (e) => {
    if (PREVIEW.setColorway) PREVIEW.setColorway(e.target.value); else go('colorway', e.target.value);
    el.querySelector('.mr-now').textContent = `${name(THEME_NAMES, current)} · ${name(PREVIEW.colorways, e.target.value)}`;
    el.querySelector('.mr-compare').href = compareHref();
  });
  // Inside the compare page's frames, the control is just noise.
  if (window.self === window.top) document.body.append(el);
}
function updateRibbon() { const s = $('#ribbon-src'); if (s) s.textContent = '· saved data'; }

// Session-only toggles for buttons like "I'm Praying" (the real site saves these to the database).
function toggleCount(btn, key) {
  let on = false;
  try { on = sessionStorage.getItem(key) === '1'; } catch {}
  const countEl = $('[data-count]', btn);
  const base = Number(countEl?.dataset.count || 0);
  const paint = () => { btn.setAttribute('aria-pressed', String(on)); if (countEl) countEl.textContent = base + (on ? 1 : 0) || ''; };
  btn.addEventListener('click', () => { on = !on; try { sessionStorage.setItem(key, on ? '1' : '0'); } catch {} paint(); });
  paint();
}

/* ---------- BrandBackdrop hook ----------
   Serve Source's BrandBackdrop (dotted world map across the top, the mark bleeding off the bottom right) goes
   behind every page hero and every closing call-to-action band. One decorative element per host, inserted as
   the host's FIRST child; site.css styles it (absolute, z-index -1 in an isolated host) so it never takes a grid
   cell or a flex slot and every other child stays above it. Directions restyle or hide it with the --bb-* tokens.
   Hosts: .hero (Home), .page-hero (Active Disasters, Organizations), .dz-hero (Disaster Detail, filled from data),
   the first section.band of a page (Rebuild's header band), .net-hero (Networks), .cta (Home's closing band). */
const BRAND_BACKDROP_HOSTS = 'main .hero, main .page-hero, main .dz-hero, main > section.band:first-of-type, main .net-hero, main .cta';
function brandBackdrops(root = document) {
  $$(BRAND_BACKDROP_HOSTS, root).forEach((host) => {
    host.classList.add('bb-host');
    if ([...host.children].some((c) => c.classList.contains('brand-backdrop'))) return;
    const bb = document.createElement('div');
    bb.className = 'brand-backdrop';
    bb.setAttribute('aria-hidden', 'true');
    bb.innerHTML = '<span class="bb-map"></span><span class="bb-mark"></span>';
    host.insertBefore(bb, host.firstChild);
  });
}
window.ssBrandBackdrops = brandBackdrops;
// The hosts are in the page markup, so this runs now; it runs again after load in case a page script rebuilt a host.
brandBackdrops();
addEventListener('DOMContentLoaded', () => brandBackdrops());
addEventListener('load', () => brandBackdrops());
