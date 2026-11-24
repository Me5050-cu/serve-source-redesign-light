renderHeader();
renderFooter();
renderRibbon(`${APP}/Organizations`);
hydrateIcons();

const PAGE = 12;
const state = { q: '', types: new Set(), tags: new Set(), network: '', shown: PAGE };
let orgs = [], tagNames = {}, networkOrgs = {}, map, markers = {}, markerLayer;
const plain = (html) => (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const host = (url) => (url || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

function visible() {
  const q = state.q.trim().toLowerCase();
  return orgs.filter((o) => (!state.types.size || state.types.has(o.org_type))
    && (!state.tags.size || (o.category_tag_ids || []).some((t) => state.tags.has(t)))
    && (!state.network || networkOrgs[state.network]?.has(o.id))
    && (!q || `${o.name} ${o.place} ${o.text}`.toLowerCase().includes(q)));
}

function orgCard(o) {
  return `<li><a class="org-card" href="${APP}/OrganizationDetail?id=${o.id}" target="_blank" rel="noopener">
    <div class="org-top">
      ${o.logo ? `<img class="org-logo" src="${esc(o.logo)}" alt="" loading="lazy">` : `<span class="org-logo ph">${icon('building')}</span>`}
      <div class="org-name"><h3>${esc(o.name)}</h3><span>${esc(ORG_TYPE_LABEL[o.org_type] || 'Organization')}</span></div>
    </div>
    ${TIER_LABEL[o.verified_tier] ? `<span class="pill ${o.verified_tier === 'verified_faith_based_partner' ? 'recovery' : 'green'}">${icon('shieldCheck')}${TIER_LABEL[o.verified_tier]}</span>` : ''}
    ${o.text ? `<p class="org-desc">${esc(o.text)}</p>` : ''}
    <div class="org-meta">
      ${o.place ? `<span>${icon('pin')}${esc(o.place)}</span>` : ''}
      ${o.website ? `<span>${icon('globe')}${esc(host(o.website))}</span>` : ''}
    </div>
    <span class="org-go">View details${icon('chevronRight')}</span>
  </a></li>`;
}

function render() {
  const list = visible();
  $('#org-count').textContent = `${list.length} of ${orgs.length} organizations`;
  $('#orgs').innerHTML = list.slice(0, state.shown).map(orgCard).join('') || '<li class="empty-card">No organizations match these filters.</li>';
  const remaining = list.length - state.shown;
  $('#more').hidden = remaining <= 0;
  $('#more').textContent = `Show More (${remaining} remaining)`;
  const ids = new Set(list.map((o) => o.id));
  let onMap = 0;
  Object.entries(markers).forEach(([id, m]) => { if (ids.has(id)) { m.addTo(markerLayer); onMap++; } else markerLayer.removeLayer(m); });
  $('#map-note').textContent = `${onMap} of ${list.length} organizations shown on map · ${list.length - onMap} have no location data`;
  const active = state.types.size + state.tags.size + (state.network ? 1 : 0);
  $('#f-count').hidden = !active;
  $('#f-count').textContent = active;
}

function chipGroup(el, options, set) {
  el.innerHTML = options.map(([v, l]) => `<button type="button" class="fchip" aria-pressed="${set.has(v)}" data-v="${esc(v)}">${esc(l)}</button>`).join('');
  el.addEventListener('click', (e) => {
    const b = e.target.closest('.fchip'); if (!b) return;
    const on = !set.has(b.dataset.v);
    on ? set.add(b.dataset.v) : set.delete(b.dataset.v);
    b.setAttribute('aria-pressed', String(on));
    state.shown = PAGE; render();
  });
}

(async function main() {
  const [orgList, locs, tags, networks, links] = await Promise.all([
    entity('Organization', { q: { status: 'active', is_publicly_visible: true }, sort: 'name', limit: 1000, fields: ['id', 'name', 'logo', 'org_type', 'verified_tier', 'description', 'website', 'region', 'category_tag_ids'] }, 'organizations'),
    entity('OrgLocation', { limit: 3000, fields: ['id', 'org_id', 'city', 'state', 'coordinates', 'is_primary_location'] }, 'org-locations'),
    entity('OrganizationCategoryTag', { q: { is_hidden: false }, sort: 'sort_order', limit: 200, fields: ['id', 'name', 'icon'] }, 'category-tags'),
    entity('Network', { q: { status: 'active' }, sort: 'name', limit: 200, fields: ['id', 'name', 'slug'] }, 'network-names'),
    entity('NetworkOrganization', { q: { status: 'approved' }, limit: 5000, fields: ['id', 'network_id', 'org_id'] }, 'network-orgs'),
  ]);
  // One location per organization: the primary one if marked, otherwise the first with coordinates.
  const locByOrg = {};
  locs.forEach((l) => { const cur = locByOrg[l.org_id]; if (!cur || (l.is_primary_location && !cur.is_primary_location) || (!latlng(cur.coordinates) && latlng(l.coordinates))) locByOrg[l.org_id] = l; });
  links.forEach((l) => (networkOrgs[l.network_id] ||= new Set()).add(l.org_id));
  tagNames = Object.fromEntries(tags.map((t) => [t.id, t.name]));
  orgs = orgList.map((o) => {
    const loc = locByOrg[o.id];
    return { ...o, loc, text: plain(o.description), place: loc ? [loc.city, loc.state].filter(Boolean).join(', ') : '' };
  });

  map = baseMap('map');
  markerLayer = L.layerGroup().addTo(map);
  const spread = spreader();
  orgs.forEach((o) => {
    const pt = latlng(o.loc?.coordinates); if (!pt) return;
    markers[o.id] = L.marker(spread(pt), { icon: pinIcon(o.org_type === 'church' ? 'orange' : 'navy', o.org_type === 'church' ? 'home' : 'building'), title: o.name })
      .bindPopup(`<b>${esc(o.name)}</b>${esc(o.place)}<br><a href="${APP}/OrganizationDetail?id=${o.id}" target="_blank" rel="noopener">View details</a>`);
  });

  const typesPresent = ORG_TYPES.filter(([k]) => orgs.some((o) => o.org_type === k));
  // Links from the nav (e.g. the Response Partner Map) arrive with ?type= and ?tags= already set.
  const url = new URLSearchParams(location.search);
  url.get('type')?.split(',').forEach((t) => state.types.add(t));
  url.get('tags')?.split(',').forEach((name) => { const id = tags.find((t) => t.name === name)?.id; if (id) state.tags.add(id); });
  chipGroup($('#f-type'), typesPresent, state.types);
  chipGroup($('#f-tags'), tags.filter((t) => orgs.some((o) => (o.category_tag_ids || []).includes(t.id))).map((t) => [t.id, `${t.icon || ''} ${t.name}`.trim()]), state.tags);
  $('#f-network').insertAdjacentHTML('beforeend', networks.map((n) => `<option value="${n.id}">${esc(n.name)}</option>`).join(''));
  $('#f-network').addEventListener('change', (e) => { state.network = e.target.value; state.shown = PAGE; render(); });
  if (state.types.size || state.tags.size) { $('#f-drawer').hidden = false; $('#f-toggle').setAttribute('aria-expanded', 'true'); }

  render();
  const pts = Object.values(markers).map((m) => m.getLatLng());
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.05), { maxZoom: 6 });
})();

$('#f-search').addEventListener('input', (e) => { state.q = e.target.value; state.shown = PAGE; render(); });
$('#more').addEventListener('click', () => { state.shown += PAGE; render(); });
$('#f-toggle').addEventListener('click', (e) => {
  const open = $('#f-drawer').hidden;
  $('#f-drawer').hidden = !open;
  e.currentTarget.setAttribute('aria-expanded', String(open));
});
$('#f-reset').addEventListener('click', () => {
  state.types.clear(); state.tags.clear(); state.network = ''; state.shown = PAGE;
  $$('.fchip').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  $('#f-network').value = '';
  render();
});
