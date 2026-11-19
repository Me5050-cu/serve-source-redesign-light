// Shared by the map + list pages: response/project cards, map pins and list interactions.

const latlng = (s) => {
  if (!s) return null;
  const p = String(s).split(',').map(Number);
  return p.length === 2 && p.every(Number.isFinite) ? p : null;
};
// The visible pin is ~30px; the marker box around it is 44px so it is easy to tap on a phone.
const pinIcon = (cls, glyph) => L.divIcon({ className: 'pin-hit', html: `<span class="pin ${cls}">${icon(glyph)}</span>`, iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -16] });
function baseMap(el, center = [37.5, -95], zoom = 4) {
  const map = L.map(el, { scrollWheelZoom: false }).setView(center, zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map);
  return map;
}
// Several entries often share one address; nudge identical points apart so each pin can be tapped.
function spreader() {
  const seen = {};
  return (p) => {
    const key = p.map((n) => n.toFixed(4)).join();
    const n = (seen[key] = (seen[key] || 0) + 1) - 1;
    return n ? [p[0] + 0.003 * Math.cos(n * 2.2) * Math.ceil(n / 4), p[1] + 0.0035 * Math.sin(n * 2.2) * Math.ceil(n / 4)] : p;
  };
}

const today = () => new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD
function deploymentStatus(r, planned = 'Scheduled') {
  if (r.start_date && r.start_date > today()) return { key: 'scheduled', label: planned, cls: 'monitoring' };
  if (r.end_date && r.end_date < today()) return { key: 'completed', label: 'Completed', cls: 'archived' };
  // Brand §11: Response / Active Deployment badges are red (the Response family); scheduled is info blue, completed is archived slate.
  return { key: 'active', label: 'Active Deployment', cls: 'response' };
}
const STATUS_RANK = { active: 0, scheduled: 1, completed: 2 };
const byStatusThenStart = (planned) => (a, b) =>
  STATUS_RANK[deploymentStatus(a, planned).key] - STATUS_RANK[deploymentStatus(b, planned).key] || String(b.start_date).localeCompare(String(a.start_date));

const ORG_TYPES = [['church', 'Churches'], ['faith_based_nonprofit', 'Faith-Based Organizations'], ['community_nonprofit', 'Community Organizations'], ['government_agency', 'Government Agencies']];
const ORG_TYPE_LABEL = { church: 'Church', faith_based_nonprofit: 'Faith-Based Nonprofit', community_nonprofit: 'Community Nonprofit', government_agency: 'Government Agency', business: 'Business' };
const TIER_LABEL = { verified_faith_based_partner: 'Verified Faith-Based Partner', verified_organization: 'Verified Organization', domain_verified: 'Domain Verified' };
const ACTION_LABEL = { volunteer: ['Volunteer', 'heart'], donate: ['Donate', 'gift'], survivor_help: ['Get Help', 'life'] };
const SOCIAL_ICON = { facebook: 'facebook', instagram: 'instagram', youtube: 'youtube', twitter: 'x', x: 'x', linkedin: 'link' };

/* Card for one response or rebuild project.
   r = { id, org: { name, logo, url, tier, social }, services, disasterName, location: { name, address }, start_date, end_date, narrative, actions, website_link } */
function responseCard(r, { planned = 'Scheduled' } = {}) {
  const o = r.org, loc = r.location || {};
  const st = deploymentStatus(r, planned);
  const extra = r.services.length - 3;
  const actions = (r.actions || []).filter((a) => ACTION_LABEL[a.type]).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((a) => `<a class="btn btn-dark btn-sm" href="${esc(a.url)}" target="_blank" rel="noopener">${icon(ACTION_LABEL[a.type][1])}${ACTION_LABEL[a.type][0]}</a>`);
  if (r.website_link) actions.push(`<a class="btn btn-outline btn-sm" href="${esc(r.website_link)}" target="_blank" rel="noopener">${icon('globe')}Visit</a>`);
  const socials = Object.entries(o.social || {}).filter(([k, v]) => v && SOCIAL_ICON[k]).slice(0, 4)
    .map(([k, v]) => `<a class="social" href="${esc(v)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${icon(SOCIAL_ICON[k])}</a>`);
  return `<li class="resp" data-id="${esc(r.id)}">
    <div class="resp-top">
      ${o.logo ? `<img class="resp-logo" src="${esc(o.logo)}" alt="" loading="lazy">` : `<span class="resp-logo ph">${esc((o.name || '?')[0])}</span>`}
      <div class="resp-head">
        <span class="pill ${st.cls}"><span class="dot"></span>${st.label}</span>
        <h3>${(() => { const n = esc(o.name), i = n.lastIndexOf(' '), v = TIER_LABEL[o.tier] ? `<span class="verified" title="${TIER_LABEL[o.tier]}" style="margin-left:5px;vertical-align:-0.12em">${icon('shieldCheck')}</span>` : ''; return v ? `<span>${n.slice(0, i + 1)}<span style="white-space:nowrap">${n.slice(i + 1)}${v}</span></span>` : n; })()}</h3>
        <div class="resp-tags">
          ${r.disasterName ? `<span class="tag disaster">${esc(dname(r.disasterName))}</span>` : ''}
          ${r.services.slice(0, 3).map((s) => `<span class="tag">${esc(s)}</span>`).join('')}
          ${extra > 0 ? `<button class="tag more" data-more='${esc(JSON.stringify(r.services.slice(3)))}'>+${extra} more</button>` : ''}
        </div>
      </div>
    </div>
    <div class="resp-info">
      ${loc.name || loc.address ? `<span>${icon('building')}<span>${esc(loc.name || '')}${loc.address ? `${loc.name ? '<br>' : ''}<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}" target="_blank" rel="noopener">${esc(loc.address)}</a>` : ''}</span></span>` : ''}
      ${r.start_date ? `<span>${icon('calendar')}<span>${fmtDate(r.start_date)}${r.end_date ? ` → ${fmtDate(r.end_date)}` : ''}</span></span>` : ''}
    </div>
    ${r.narrative ? `<p class="resp-text">${esc(r.narrative)}</p><button class="read-more">Read more</button>` : ''}
    ${actions.length || socials.length ? `<div class="resp-actions">${actions.join('')}${socials.join('')}</div>` : ''}
    <div class="resp-foot">
      ${o.url ? `<a href="${esc(o.url)}" target="_blank" rel="noopener">View Org ${icon('chevronRight')}</a>` : ''}
      <button class="locate" data-locate="${esc(r.id)}">${icon('pin')}Show on map</button>
      <button class="act-pray" data-pray="${esc(r.id)}">${icon('hands')}I’m Praying</button>
    </div>
  </li>`;
}

// After a list renders: hide "Read more" where the text already fits, and wire the prayer toggles.
function afterListRender(listEl) {
  $$('.resp-text', listEl).forEach((p) => { if (p.scrollHeight <= p.clientHeight + 2) p.nextElementSibling?.remove(); });
  $$('[data-pray]', listEl).forEach((b) => toggleCount(b, `resp-pray-${b.dataset.pray}`));
}
// Tag expansion, read more, and "Show on map" for any card list.
function wireList(listEl, { map, markers, mapEl }) {
  listEl.addEventListener('click', (e) => {
    const more = e.target.closest('[data-more]');
    if (more) { more.outerHTML = JSON.parse(more.dataset.more).map((s) => `<span class="tag">${esc(s)}</span>`).join(''); return; }
    const rm = e.target.closest('.read-more');
    if (rm) { const open = rm.previousElementSibling.classList.toggle('open'); rm.textContent = open ? 'Show less' : 'Read more'; return; }
    const loc = e.target.closest('[data-locate]');
    const m = loc && markers()[loc.dataset.locate];
    if (m) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { map().flyTo(m.getLatLng(), 12, { duration: 0.8 }); m.openPopup(); }, 350);
    }
  });
}
// Checkbox group: render options, keep a Set in sync, call onChange.
function checkGroup(el, options, set, onChange) {
  el.innerHTML = options.map(([value, label]) => `<label class="check"><input type="checkbox" value="${esc(value)}" ${set.has(value) ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('');
  el.addEventListener('change', (e) => { e.target.checked ? set.add(e.target.value) : set.delete(e.target.value); onChange(); });
}
async function copyWithFeedback(btn, text) {
  try { await navigator.clipboard.writeText(text); } catch {}
  const before = btn.innerHTML;
  btn.textContent = 'Link copied';
  setTimeout(() => (btn.innerHTML = before), 1800);
}
