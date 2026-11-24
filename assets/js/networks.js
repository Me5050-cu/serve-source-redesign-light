renderHeader();
renderSubnav({ title: 'Community Networks', links: [['Why Networks', 'why'], ['Explore', 'explore']], cta: { label: 'Start a Network', href: `${APP}/networks` } });
renderFooter();
renderRibbon(`${APP}/networks`);
hydrateIcons();

const state = { st: '', city: '', q: '' };
let networks = [], map, markers = {}, markerLayer;
const plain = (html) => (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// The data mixes "TX" and "Texas"; the State filter groups both under the full name.
const STATE_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
const stateName = (s) => { const t = (s || '').trim(); return STATE_NAMES[t.toUpperCase()] || t; };
// Networks with their own page on Serve Source link there; "link only" networks go to their website.
const netLink = (n) => (n.basic_link_only ? { href: n.website, label: 'Visit website' } : { href: `${APP}/networks/${n.slug}`, label: 'View network' });

function visible() {
  const q = state.q.trim().toLowerCase();
  return networks.filter((n) => (!state.st || n.stateKey === state.st) && (!state.city || n.city === state.city) && (!q || n.name.toLowerCase().includes(q)));
}
function netCard(n) {
  const link = netLink(n);
  return `<li><a class="net-card" href="${esc(link.href || '#')}" target="_blank" rel="noopener">
    <div class="net-logo">${n.logo_url ? `<img src="${esc(n.logo_url)}" alt="${esc(n.name)} logo" loading="lazy">` : `<span>${esc(n.name[0])}</span>`}</div>
    <div class="net-body">
      <div class="net-title"><h3>${esc(n.name.trim())}</h3><span class="pill">${esc(n.type_name === 'network' || !n.type_name ? 'Network' : n.type_name)}</span></div>
      ${n.place ? `<span class="net-place">${icon('pin')}${esc(n.place)}</span>` : ''}
      <p>${esc(n.text)}</p>
      <span class="net-go">${link.label}${icon('arrow')}</span>
    </div>
  </a></li>`;
}
function render() {
  const list = visible();
  $('#net-count').textContent = `${list.length} network${list.length === 1 ? '' : 's'}`;
  $('#networks').innerHTML = list.map(netCard).join('') || '<li class="empty-card">No networks match these filters.</li>';
  const ids = new Set(list.map((n) => n.id));
  Object.entries(markers).forEach(([id, m]) => (ids.has(id) ? m.addTo(markerLayer) : markerLayer.removeLayer(m)));
}
function fillCities() {
  const cities = [...new Set(networks.filter((n) => !state.st || n.stateKey === state.st).map((n) => n.city).filter(Boolean))].sort();
  $('#f-city').innerHTML = '<option value="">All cities</option>' + cities.map((c) => `<option>${esc(c)}</option>`).join('');
}

(async function main() {
  // Same order as the live page (no sort).
  const rows = await entity('Network', { q: { status: 'active' }, limit: 200,
    fields: ['id', 'name', 'slug', 'logo_url', 'city', 'state', 'description', 'website', 'basic_link_only', 'coordinates', 'type_name'] }, 'networks');
  networks = rows.map((n) => ({ ...n, stateKey: stateName(n.state), text: plain(n.description), place: [n.city, n.state].filter(Boolean).join(', ') }));

  map = baseMap('map');
  markerLayer = L.layerGroup().addTo(map);
  networks.forEach((n) => {
    const pt = latlng(n.coordinates); if (!pt) return;
    const link = netLink(n);
    markers[n.id] = L.marker(pt, { icon: pinIcon('navy', 'users'), title: n.name })
      .bindPopup(`<b>${esc(n.name)}</b>${esc(n.place)}${link.href ? `<br><a href="${esc(link.href)}" target="_blank" rel="noopener">${link.label}</a>` : ''}`);
  });
  const pts = Object.values(markers).map((m) => m.getLatLng());
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 6 });

  const states = [...new Set(networks.map((n) => n.stateKey).filter(Boolean))].sort();
  $('#f-state').insertAdjacentHTML('beforeend', states.map((s) => `<option>${esc(s)}</option>`).join(''));
  fillCities();
  render();
})();

$('#f-state').addEventListener('change', (e) => { state.st = e.target.value; state.city = ''; fillCities(); render(); });
$('#f-city').addEventListener('change', (e) => { state.city = e.target.value; render(); });
$('#f-search').addEventListener('input', (e) => { state.q = e.target.value; render(); });
