renderHeader();
const subnav = renderSubnav({ title: 'Disaster', links: [['Overview', 'about-panel'], ['Resources', 'resources-panel'], ['Updates', 'videos-panel'], ['Map', 'map-section'], ['Partners', 'list-section']], cta: { label: 'Add Response', href: `${APP}/DisasterDetail?disaster=${encodeURIComponent(new URLSearchParams(location.search).get('disaster') || 'hurricane-isaias-october-2026')}` } });
renderFooter();
hydrateIcons();

const slug = new URLSearchParams(location.search).get('disaster') || 'hurricane-isaias-october-2026';
const liveUrl = `${APP}/DisasterDetail?disaster=${encodeURIComponent(slug)}`;
renderRibbon(liveUrl);
const snap = (name) => (slug === 'hurricane-isaias-october-2026' ? `isaias-${name}` : undefined);

/* ---------- Rich text from the CMS ----------
   Keep only simple formatting, drop empty paragraphs, and turn each H3 section into a collapsible row
   (the live page does the same with its section buttons). */
const ALLOWED = new Set(['P', 'H2', 'H3', 'H4', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'BR', 'BLOCKQUOTE']);
function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
  const walk = (node) => {
    [...node.children].forEach((el) => {
      walk(el);
      if (!ALLOWED.has(el.tagName)) { el.replaceWith(...el.childNodes); return; }
      const href = el.tagName === 'A' ? el.getAttribute('href') || '' : '';
      [...el.attributes].forEach((a) => el.removeAttribute(a.name));
      if (el.tagName === 'A' && /^(https?:|mailto:|tel:|\/)/.test(href)) {
        el.setAttribute('href', href.startsWith('/') ? APP + href : href);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    });
  };
  const root = doc.body.firstChild;
  walk(root);
  root.querySelectorAll('p, h2, h3, h4, li').forEach((el) => { if (!el.textContent.trim()) el.remove(); });
  // Headings in this CMS are often wrapped in <strong>; the heading weight already covers it.
  root.querySelectorAll('h2 > strong:only-child, h3 > strong:only-child').forEach((s) => s.replaceWith(...s.childNodes));
  return root;
}
function renderProse(target, html) {
  const root = sanitize(html);
  const out = document.createElement('div');
  let group = null;
  [...root.childNodes].forEach((n) => {
    if (n.nodeType !== 1) { if (n.textContent.trim()) (group || out).append(n); return; }
    if (n.tagName === 'H3') {
      group = document.createElement('div');
      const det = document.createElement('details');
      det.innerHTML = `<summary>${n.innerHTML}${icon('chevron')}</summary>`;
      det.append(group);
      out.append(det);
      return;
    }
    if (n.tagName === 'H2') group = null;
    (group || out).append(n);
  });
  target.replaceChildren(out);
  collapsible(target);
}
function collapsible(el) {
  if (el.scrollHeight < 640) { el.classList.remove('collapsible'); return; }
  el.classList.add('collapsed');
  const btn = document.createElement('button');
  btn.className = 'btn btn-tint btn-sm show-more';
  btn.textContent = 'Show More';
  btn.addEventListener('click', () => {
    const open = el.classList.toggle('collapsed') === false;
    btn.textContent = open ? 'Show Less' : 'Show More';
    if (!open) (el.closest('.panel') || el.closest('section')).scrollIntoView({ behavior: 'smooth' });
  });
  el.after(btn);
}

/* ---------- Header ---------- */
function renderHeaderBand(d, types, photos, prayers, press) {
  document.title = `${d.name} | Serve Source`;
  $('#d-name').textContent = dname(d.name);
  subnav.setTitle(dname(d.name));
  $('#status-pill').innerHTML = statusPill(d.status, 'on-photo');
  $('#d-regions').textContent = d.affected_regions || '';
  $('#d-date').textContent = fmtDate(d.date_reported, { month: 'long', day: 'numeric', year: 'numeric' });
  $('#d-updated').textContent = d.last_response_update_at ? `Updated ${timeAgo(d.last_response_update_at)}` : '';
  const img = disasterImage(d, types, photos);
  if (img.src) $('#hero-img').src = img.src;
  if (img.credit) $('#photo-credit').textContent = `${img.credit} · ${img.license}`;
  const ico = d.custom_icon_graphic_url || types[d.disaster_type_id]?.icon_graphic_url;
  if (ico) { $('#type-icon').src = ico; $('#type-icon').hidden = false; }

  $('#pray-count').dataset.count = prayers.length;
  // The sidebar button drives the header one, so the count stays in one place.
  const top = $('#pray-top'), side = $('#pray-side');
  toggleCount(top, `pray-${slug}`);
  const syncSide = () => { side.textContent = top.getAttribute('aria-pressed') === 'true' ? 'You’re Praying — Thank You' : 'I’m Praying'; };
  top.addEventListener('click', syncSide);
  side.addEventListener('click', () => top.click());
  syncSide();

  if (press[0]?.publish_url) { $('#press-link').href = APP + press[0].publish_url; $('#press-link').hidden = false; }
  $('#copy-link').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(liveUrl); } catch {}
    const s = $('#copy-link span:last-child'); s.textContent = 'Link copied'; setTimeout(() => (s.textContent = 'Copy share link'), 1800);
  });

  const step = STATUS[d.status]?.step ?? 0;
  $$('#phases li').forEach((li) => {
    const n = Number(li.dataset.step);
    li.classList.toggle('done', n < step);
    li.classList.toggle('current', n === step);
    if (n === step) { li.setAttribute('aria-current', 'step'); li.querySelector('small').textContent = 'Current phase'; }
  });
  // The rail fills from Monitoring to the current phase once the band scrolls into view.
  const track = $('#phase-track');
  // Measure where the current dot sits on the rail, so the fill stops exactly there (both layouts).
  const sizeFill = () => {
    const rail = track.querySelector('.ph-rail').getBoundingClientRect();
    const dot = track.querySelector(`li[data-step="${step}"] .ph-dot`).getBoundingClientRect();
    const vertical = rail.height > rail.width;
    const frac = vertical ? (dot.top + dot.height / 2 - rail.top) / rail.height : (dot.left + dot.width / 2 - rail.left) / rail.width;
    track.style.setProperty('--ph-frac', Math.max(0, Math.min(1, frac)).toFixed(4));
  };
  sizeFill(); addEventListener('resize', sizeFill);
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) track.classList.add('is-in');
  else new IntersectionObserver((es, io) => { if (es.some((e) => e.isIntersecting)) { track.classList.add('is-in'); io.disconnect(); } }, { threshold: .35 }).observe(track);

  const BTN_ICON = { map_pin: 'pin', building: 'building', share: 'share', map: 'map' };
  const BTN_CLASS = { white: 'btn-outline', orange: 'btn-primary', navy: 'btn-dark' };
  $('#actions').innerHTML = (d.action_buttons || []).slice().sort((a, b) => a.sort_order - b.sort_order).map((b) => {
    const href = b.link_type === 'internal' ? APP + b.link_value : b.link_type === 'anchor' ? '#map-section' : liveUrl;
    const ext = b.link_type === 'anchor' ? '' : ' target="_blank" rel="noopener"';
    return `<a class="btn ${BTN_CLASS[b.color] || 'btn-dark'}" href="${esc(href)}"${ext}>${icon(BTN_ICON[b.icon] || 'arrow')}${esc(b.text)}</a>`;
  }).join('');
  $('#add-response').href = liveUrl;
  $('#impact-report').href = liveUrl;
}

/* ---------- Responses, filters and map ---------- */
const state = { orgTypes: new Set(ORG_TYPES.map((t) => t[0])), services: new Set(), q: '' };
let responses = [], map, layerGroups = {}, responseMarkers = {};

// publicDisasterData nests the organization and location; the shared card wants a flat shape.
const toCard = (r) => ({
  id: r.id, services: r.services, start_date: r.start_date, end_date: r.end_date, narrative: r.narrative,
  actions: r.action_links, website_link: r.website_link,
  org: { name: r.organization.name, logo: r.organization.logo, url: r.organization.url, tier: r.organization.verified_tier },
  location: { name: r.location?.name, address: r.location?.address },
});
function visible() {
  const q = state.q.trim().toLowerCase();
  return responses.filter((r) => {
    if (!state.orgTypes.has(r.organization.org_type || 'faith_based_nonprofit')) return false;
    if (state.services.size && !r.services.some((s) => state.services.has(s))) return false;
    if (q && !`${r.organization.name} ${r.location?.city || ''} ${r.location?.name || ''}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
function renderList() {
  const list = visible();
  $('#list-title').textContent = `${list.length} Response Location${list.length === 1 ? '' : 's'} by verified organizations`;
  $('#responses').innerHTML = list.map((r) => responseCard(toCard(r))).join('') || '<li class="empty">No responses match these filters.</li>';
  afterListRender($('#responses'));
  const ids = new Set(list.map((r) => r.id));
  Object.entries(responseMarkers).forEach(([id, m]) => (ids.has(id) ? m.addTo(layerGroups.responses) : layerGroups.responses.removeLayer(m)));
}
wireList($('#responses'), { map: () => map, markers: () => responseMarkers, mapEl: $('#map') });

function buildFilters() {
  const counts = {};
  responses.forEach((r) => r.services.forEach((s) => (counts[s] = (counts[s] || 0) + 1)));
  $('#f-orgtype').innerHTML = ORG_TYPES.map(([k, l]) => `<label class="check"><input type="checkbox" value="${k}" checked><span>${l}</span></label>`).join('');
  $('#f-service').innerHTML = Object.keys(counts).sort().map((s) => `<label class="check"><input type="checkbox" value="${esc(s)}"><span>${esc(s)}</span></label>`).join('');
  $('#f-orgtype').addEventListener('change', (e) => { e.target.checked ? state.orgTypes.add(e.target.value) : state.orgTypes.delete(e.target.value); renderList(); });
  $('#f-service').addEventListener('change', (e) => { e.target.checked ? state.services.add(e.target.value) : state.services.delete(e.target.value); renderList(); });
  $('#f-search').addEventListener('input', (e) => { state.q = e.target.value; renderList(); });
  $('#f-reset').addEventListener('click', () => {
    state.orgTypes = new Set(ORG_TYPES.map((t) => t[0])); state.services.clear(); state.q = '';
    $$('#f-orgtype input').forEach((i) => (i.checked = true)); $$('#f-service input').forEach((i) => (i.checked = false)); $('#f-search').value = '';
    renderList();
  });
  $('#f-copy').addEventListener('click', async () => {
    const p = new URLSearchParams({ disaster: slug });
    if (state.services.size) p.set('services', [...state.services].join('|'));
    if (state.orgTypes.size < ORG_TYPES.length) p.set('types', [...state.orgTypes].join('|'));
    if (state.q) p.set('q', state.q);
    try { await navigator.clipboard.writeText(`${location.origin}${location.pathname}?${p}#map-section`); } catch {}
    const b = $('#f-copy'); const t = b.innerHTML; b.textContent = 'Link copied'; setTimeout(() => (b.innerHTML = t), 1800);
  });
  // Restore filters from a shared link.
  const url = new URLSearchParams(location.search);
  url.get('services')?.split('|').forEach((s) => { state.services.add(s); const i = $(`#f-service input[value="${CSS.escape(s)}"]`); if (i) i.checked = true; });
  if (url.get('types')) { state.orgTypes = new Set(url.get('types').split('|')); $$('#f-orgtype input').forEach((i) => (i.checked = state.orgTypes.has(i.value))); }
  if (url.get('q')) { state.q = url.get('q'); $('#f-search').value = state.q; }
}

function buildMap(d, extra) {
  const center = latlng(d.coordinates) || [30.4, -87];
  map = L.map('map', { scrollWheelZoom: false, zoomControl: true }).setView(center, 7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map);

  const LAYERS = [
    ['polygons', 'Damage Assessment Polygons', true],
    ['lines', 'Damage Assessment Lines', true],
    ['tornado', 'Initial Tornado Reports', true],
    ['windhail', 'Significant Wind/Hail', false],
    ['resources', 'Community Resources', true],
    ['shelters', 'Open Shelters', true],
    ['praying', 'Show People Praying', false],
    ['responses', 'Response Partners', true],
  ];
  LAYERS.forEach(([k]) => (layerGroups[k] = L.layerGroup()));

  (d.affected_area_polygon?.polygons || []).forEach((poly) => L.polygon(poly, { color: '#c0352b', weight: 1.5, dashArray: '6 6', fillOpacity: 0.07 }).addTo(layerGroups.polygons));
  extra.storms.forEach((s) => {
    const type = s.report_type || '';
    if (s.geometry?.type === 'LineString') L.geoJSON(s.geometry, { style: { color: '#6b3fb8', weight: 3 } }).bindPopup(esc(type)).addTo(layerGroups.lines);
    else if (s.geometry?.type === 'Polygon' || s.geometry?.type === 'MultiPolygon') L.geoJSON(s.geometry, { style: { color: '#6b3fb8', weight: 1, fillOpacity: 0.15 } }).bindPopup(esc(type)).addTo(layerGroups.polygons);
    else if (s.latitude) {
      const tornado = /tornado|landspout|waterspout/i.test(type);
      const group = tornado ? layerGroups.tornado : s.is_significant ? layerGroups.windhail : null;
      if (group) L.circleMarker([s.latitude, s.longitude], { radius: 5, color: tornado ? '#6b3fb8' : '#a15c00', weight: 1, fillOpacity: 0.7 })
        .bindPopup(`<b>${esc(type)}</b>${esc(s.location_name || '')}<br>${esc(s.damage_summary || '')}`).addTo(group);
    }
  });
  extra.resources.forEach((c) => { const p = latlng(c.coordinates); if (p) L.marker(p, { icon: pinIcon('teal', 'life') }).bindPopup(`<b>${esc(c.location_name || c.org_name)}</b>${esc(c.location || '')}`).addTo(layerGroups.resources); });
  extra.shelters.forEach((s) => { if (s.latitude) L.marker([s.latitude, s.longitude], { icon: pinIcon('blue', 'home') }).bindPopup(`<b>${esc(s.shelter_name)}</b>${esc([s.address, s.city, s.state].filter(Boolean).join(', '))}<br>Shelter · ${esc(s.shelter_status || '')}`).addTo(layerGroups.shelters); });
  extra.prayers.forEach((p) => { if (p.fuzzy_lat) L.circleMarker([p.fuzzy_lat, p.fuzzy_lng], { radius: 6, color: '#6b3fb8', fillOpacity: 0.5 }).bindPopup(esc(p.display_name || 'Praying')).addTo(layerGroups.praying); });

  // Partners often share one church site; nudge identical points apart so each pin can be tapped.
  const seen = {};
  responses.forEach((r) => {
    let p = latlng(r.location?.coordinates); if (!p) return;
    const key = p.map((n) => n.toFixed(4)).join();
    const n = (seen[key] = (seen[key] || 0) + 1) - 1;
    if (n) p = [p[0] + 0.003 * Math.cos(n * 2.2) * Math.ceil(n / 4), p[1] + 0.0035 * Math.sin(n * 2.2) * Math.ceil(n / 4)];
    responseMarkers[r.id] = L.marker(p, { icon: pinIcon('orange', 'heart'), title: r.organization.name })
      .bindPopup(`<b>${esc(r.organization.name)}</b>${esc(r.location?.name || '')}<br>${esc(r.services.join(', '))}`);
  });

  $('#layers').innerHTML = LAYERS.filter(([k]) => k !== 'responses').map(([k, label, on]) =>
    `<label class="switch"><input type="checkbox" data-layer="${k}" ${on ? 'checked' : ''}><span class="track"></span><span>${label}</span></label>`).join('');
  LAYERS.forEach(([k, , on]) => on && layerGroups[k].addTo(map));
  $('#layers').addEventListener('change', (e) => { const g = layerGroups[e.target.dataset.layer]; e.target.checked ? g.addTo(map) : map.removeLayer(g); });

  const pts = Object.values(responseMarkers).map((m) => m.getLatLng());
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.25));
}

/* ---------- Load everything ---------- */
(async function main() {
  const [list, types, photos] = await Promise.all([
    entity('Disaster', { q: { slug }, fields: ['id', 'name', 'slug', 'status', 'disaster_type_id', 'event_type', 'custom_background_image_url', 'custom_icon_graphic_url', 'affected_regions', 'date_reported', 'narrative', 'local_resources', 'coordinates', 'last_response_update_at', 'affected_area_polygon', 'action_buttons'] }, snap('disaster')),
    loadTypes(),
    loadPhotos(),
  ]);
  const d = list[0];
  if (!d) { $('#d-name').textContent = 'Disaster not found'; return; }
  const byDisaster = { disaster_id: d.id };
  const [pub, videos, shelters, storms, resources, prayers, press] = await Promise.all([
    publicDisaster(slug, snap('public')),
    entity('DisasterVideo', { q: byDisaster, sort: 'display_order', fields: ['id', 'youtube_url', 'title', 'display_order'] }, snap('videos')),
    entity('ExternalShelter', { q: { ...byDisaster, is_active: true }, limit: 500, fields: ['id', 'shelter_name', 'address', 'city', 'state', 'latitude', 'longitude', 'shelter_status'] }, snap('shelters')),
    entity('ExternalStormReport', { q: { ...byDisaster, display_on_map: true }, limit: 2000, fields: ['id', 'report_type', 'latitude', 'longitude', 'location_name', 'damage_summary', 'is_significant', 'geometry'] }, snap('storms')),
    entity('CommunityResource', { q: { ...byDisaster, approval_status: 'approved' }, limit: 500, fields: ['id', 'org_name', 'location_name', 'location', 'coordinates', 'website_link', 'visibility_status'] }, snap('resources')),
    entity('Prayer', { q: byDisaster, limit: 5000, fields: ['id', 'fuzzy_lat', 'fuzzy_lng', 'display_name'] }, snap('prayers')),
    entity('PressRelease', { q: { ...byDisaster, status: 'published' }, sort: '-release_date', fields: ['id', 'title', 'publish_url', 'release_date'] }, snap('press')),
  ]);
  // Active deployments first, then scheduled, then completed; newest start date first within each.
  responses = (pub.responses || []).slice().sort(byStatusThenStart());

  renderHeaderBand(d, types, photos, prayers, press);
  renderProse($('#about'), d.narrative);
  if (d.local_resources) { $('#resources-panel').hidden = false; renderProse($('#local-resources'), d.local_resources); }
  if (videos.length) {
    $('#videos-panel').hidden = false;
    $('#videos').innerHTML = videos.map((v) => `<figure>${videoFacade(v.youtube_url, v.title)}<figcaption>${esc(v.title)}</figcaption></figure>`).join('');
  }

  const services = new Set(responses.flatMap((r) => r.services));
  $('#mini-stats').innerHTML = [
    [new Set(responses.map((r) => r.organization.id)).size, 'Organizations'],
    [responses.length, 'Responses'],
    [services.size, 'Services'],
    [storms.length, 'Storm Reports'],
    [prayers.length, 'People Praying'],
  ].map(([n, l]) => `<div><dd>${n}</dd><dt>${l}</dt></div>`).join('');

  buildMap(d, { storms, shelters, prayers, resources: resources.filter((c) => c.visibility_status === 'public') });
  buildFilters();
  renderList();
  // Hide sub-nav links for sections this disaster doesn't have (no videos, no local resources).
  $$('.subnav-links a').forEach((l) => { l.hidden = !!document.getElementById(l.dataset.target)?.hidden; });
})();
