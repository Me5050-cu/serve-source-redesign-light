renderHeader();
renderSubnav({ title: 'Long-Term Recovery', links: [['Get Involved', 'get-involved'], ['Projects', 'rebuild-projects']], cta: { label: 'Submit a Project', href: `${APP}/Rebuild` } });
renderFooter();
renderRibbon(`${APP}/Rebuild`);
hydrateIcons();
$$('.submit-project').forEach((a) => (a.href = `${APP}/Rebuild`));

const STATUSES = [['scheduled', 'Scheduled'], ['active', 'Active'], ['completed', 'Completed']];
const PLANNED = 'Planned Deployment';
const state = { status: new Set(['scheduled', 'active']), disaster: '', orgTypes: new Set(ORG_TYPES.map((t) => t[0])), services: new Set(), orgs: new Set() };
let projects = [], map, markers = {}, markerLayer;

function visible() {
  return projects.filter((p) => state.status.has(deploymentStatus(p, PLANNED).key)
    && (!state.disaster || p.disaster_id === state.disaster)
    && state.orgTypes.has(p.orgType || 'faith_based_nonprofit')
    && (!state.services.size || p.services.some((s) => state.services.has(s)))
    && (!state.orgs.size || state.orgs.has(p.org_id)));
}

function render() {
  const list = visible();
  const counts = { active: 0, scheduled: 0, completed: 0 };
  projects.forEach((p) => counts[deploymentStatus(p, PLANNED).key]++);
  Object.assign(counts, { orgs: new Set(list.map((p) => p.org_id)).size, showing: list.length });
  $$('#stats [data-k]').forEach((el) => (el.textContent = counts[el.dataset.k]));
  $('#list-title').textContent = `${list.length} Rebuild Project${list.length === 1 ? '' : 's'}`;
  $('#projects').innerHTML = list.map((p) => responseCard(p, { planned: PLANNED })).join('') || '<li class="empty">No rebuild projects match these filters.</li>';
  afterListRender($('#projects'));
  const ids = new Set(list.map((p) => p.id));
  Object.entries(markers).forEach(([id, m]) => (ids.has(id) ? m.addTo(markerLayer) : markerLayer.removeLayer(m)));
  const shown = Object.values(markers).filter((m) => markerLayer.hasLayer(m)).map((m) => m.getLatLng());
  if (shown.length) map.fitBounds(L.latLngBounds(shown).pad(0.2), { maxZoom: 9 });
}

function buildMap() {
  map = baseMap('map');
  markerLayer = L.layerGroup().addTo(map);
  const spread = spreader();
  const PIN = { active: ['green', 'home'], scheduled: ['blue', 'calendar'], completed: ['gray', 'check'] };
  projects.forEach((p) => {
    const pt = latlng(p.coordinates); if (!pt) return;
    const [cls, glyph] = PIN[deploymentStatus(p, PLANNED).key];
    markers[p.id] = L.marker(spread(pt), { icon: pinIcon(cls, glyph), title: p.org.name })
      .bindPopup(`<b>${esc(p.org.name)}</b>${esc(p.location.name || '')}${p.disasterName ? `<br>${esc(dname(p.disasterName))}` : ''}`);
  });
}

function buildFilters(disasters) {
  checkGroup($('#f-status'), STATUSES, state.status, render);
  checkGroup($('#f-orgtype'), ORG_TYPES, state.orgTypes, render);
  const services = [...new Set(projects.flatMap((p) => p.services))].sort();
  checkGroup($('#f-service'), services.map((s) => [s, s]), state.services, render);
  const orgs = [...new Map(projects.map((p) => [p.org_id, p.org.name])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  checkGroup($('#f-org'), orgs, state.orgs, render);
  $('#f-orgsearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$('#f-org .check').forEach((l) => (l.hidden = q && !l.textContent.toLowerCase().includes(q)));
  });
  const linked = [...new Set(projects.map((p) => p.disaster_id).filter(Boolean))].map((id) => disasters[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  $('#f-disaster').insertAdjacentHTML('beforeend', linked.map((d) => `<option value="${d.id}">${esc(dname(d.name))}</option>`).join(''));
  $('#f-disaster').addEventListener('change', (e) => { state.disaster = e.target.value; render(); });
  $('#f-reset').addEventListener('click', () => {
    state.status = new Set(['scheduled', 'active']); state.disaster = ''; state.orgTypes = new Set(ORG_TYPES.map((t) => t[0])); state.services.clear(); state.orgs.clear();
    $$('#f-status input').forEach((i) => (i.checked = state.status.has(i.value)));
    $$('#f-orgtype input').forEach((i) => (i.checked = true));
    $$('#f-service input, #f-org input').forEach((i) => (i.checked = false));
    $('#f-disaster').value = '';
    render();
  });
  $('#f-copy').addEventListener('click', (e) => {
    const p = new URLSearchParams();
    p.set('status', [...state.status].join('|'));
    if (state.disaster) p.set('disaster', state.disaster);
    if (state.services.size) p.set('services', [...state.services].join('|'));
    copyWithFeedback(e.currentTarget, `${location.origin}${location.pathname}?${p}`);
  });
  // Restore filters from a shared link.
  const url = new URLSearchParams(location.search);
  if (url.get('status')) { state.status = new Set(url.get('status').split('|')); $$('#f-status input').forEach((i) => (i.checked = state.status.has(i.value))); }
  if (url.get('disaster')) { state.disaster = url.get('disaster'); $('#f-disaster').value = state.disaster; }
  url.get('services')?.split('|').forEach((s) => { state.services.add(s); const i = $(`#f-service input[value="${CSS.escape(s)}"]`); if (i) i.checked = true; });
}

(async function main() {
  const [rows, disasterList, orgList, typeList] = await Promise.all([
    entity('Response', { q: { response_scope: 'rebuild', visibility_status: 'published', approval_status: 'approved' }, limit: 500,
      fields: ['id', 'disaster_id', 'org_id', 'response_types', 'start_date', 'end_date', 'location', 'location_name', 'coordinates', 'location_city', 'location_state', 'website_link', 'action_links', 'narrative'] }, 'rebuild-projects'),
    entity('Disaster', { limit: 500, fields: ['id', 'name', 'slug'] }, 'disaster-names'),
    entity('Organization', { q: { status: 'active', is_publicly_visible: true }, limit: 1000, fields: ['id', 'name', 'logo', 'org_type', 'verified_tier', 'social_links'] }, 'org-cards'),
    entity('ResponseType', { q: { is_hidden: false }, limit: 200, fields: ['id', 'name'] }, 'response-types'),
  ]);
  const disasters = Object.fromEntries(disasterList.map((d) => [d.id, d]));
  const orgs = Object.fromEntries(orgList.map((o) => [o.id, o]));
  const types = Object.fromEntries(typeList.map((t) => [t.id, t.name]));
  projects = rows.filter((r) => orgs[r.org_id]).map((r) => {
    const o = orgs[r.org_id];
    return {
      ...r,
      orgType: o.org_type,
      services: (r.response_types || []).map((id) => types[id]).filter(Boolean),
      disasterName: disasters[r.disaster_id]?.name,
      actions: r.action_links,
      org: { name: o.name, logo: o.logo, url: `${APP}/OrganizationDetail?id=${o.id}`, tier: o.verified_tier, social: o.social_links },
      location: { name: r.location_name || [r.location_city, r.location_state].filter(Boolean).join(', '), address: r.location },
    };
  }).sort(byStatusThenStart(PLANNED));
  buildMap();
  buildFilters(disasters);
  wireList($('#projects'), { map: () => map, markers: () => markers, mapEl: $('#map') });
  render();
})();
