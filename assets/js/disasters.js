renderHeader();
renderSubnav({ title: 'Active Disasters', links: [['Live Monitoring', 'live'], ['Monitoring Events', 'monitoring'], ['Disaster Events', 'events']] });
renderFooter();
renderRibbon(`${APP}/Disasters`);
hydrateIcons();

/* ---------- Stats ---------- */
(async function stats() {
  const list = await entity('StatSummary', { fields: ['stat_key', 'value_number'] }, 'stats');
  const byKey = Object.fromEntries(list.map((s) => [s.stat_key, s.value_number]));
  $$('[data-stat]').forEach((el) => { const n = byKey[el.dataset.stat]; if (n != null) el.textContent = n.toLocaleString(); });
})();

/* ---------- Live Monitoring ---------- */
(async function liveFeeds() {
  const feeds = await entity('LiveFeedVideo', { q: { is_visible: true }, sort: 'display_order', limit: 50, fields: ['id', 'youtube_url', 'title', 'description'] }, 'livefeeds');
  $('#live-feeds').innerHTML = feeds.map((f) => `
    <article class="live-card">
      <header><span class="pill live"><span class="dot"></span>LIVE</span><h3>${esc(f.title)}</h3></header>
      ${videoFacade(f.youtube_url, f.title)}
    </article>`).join('');
})();

/* ---------- Monitoring Events ---------- */
const MON_TYPES = {
  flood_warning: { label: 'Flood', icon: 'waves' },
  severe_weather: { label: 'Severe weather', icon: 'zap' },
  tornado: { label: 'Tornado', icon: 'tornado' },
  earthquake: { label: 'Earthquake', icon: 'activity' },
  wildfire: { label: 'Wildfire', icon: 'flame' },
  winter_storm: { label: 'Winter', icon: 'snow' },
  other: { label: 'Other', icon: 'alert' },
};
const SEVERITY = { warning: 'response', watch: 'assessment', monitoring: 'monitoring', advisory: 'monitoring' };
const mon = { all: [], type: '', shown: 3, prayers: {}, monitoring: {}, deploying: {} };

function activeFor(created) {
  const mins = Math.max(1, Math.round((Date.now() - toDate(created)) / 60000));
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
function monCard(ev) {
  const t = MON_TYPES[ev.event_type] || MON_TYPES.other;
  const sev = ev.severity_level || 'monitoring';
  return `<li class="mon-card sev-${esc(sev)}">
    <span class="mon-icon">${icon(t.icon)}</span>
    <div class="mon-main">
      <div class="mon-top"><span class="pill ${SEVERITY[sev] || 'monitoring'}">${esc(sev.toUpperCase())}</span><span class="mon-type">${esc(t.label)}</span></div>
      <h3>${esc(ev.title)}</h3>
      <p class="mon-desc" role="button" tabindex="0" aria-expanded="false">${esc(ev.description || '')}</p>
      <div class="mon-meta">
        <span class="area" title="${esc(ev.affected_regions || '')}">${icon('pin')}<span>${esc(ev.affected_regions || '')}</span></span>
        <span>${icon('clock')}Active for ${activeFor(ev.created_date)}</span>
      </div>
      <div class="mon-actions">
        <button class="act" data-act="pray" data-id="${ev.id}">${icon('hands')}I’m Praying <b data-count="${mon.prayers[ev.id] || 0}"></b></button>
        <button class="act" data-act="monitor" data-id="${ev.id}">${icon('eye')}We’re Monitoring <b data-count="${mon.monitoring[ev.id] || 0}"></b></button>
        <button class="act" data-act="deploy" data-id="${ev.id}">${icon('route')}We’re Deploying <b data-count="${mon.deploying[ev.id] || 0}"></b></button>
        <a class="act link" href="${APP}/Disasters" target="_blank" rel="noopener">${icon('file')}Submit Community Report</a>
      </div>
    </div>
  </li>`;
}
function renderMon() {
  const list = mon.all.filter((e) => !mon.type || (mon.type === 'other' ? !MON_TYPES[e.event_type] || e.event_type === 'other' : e.event_type === mon.type));
  $('#mon-list').innerHTML = list.slice(0, mon.shown).map(monCard).join('') || '<li class="empty-note">No monitoring events of this type right now.</li>';
  $('#mon-more').hidden = list.length <= mon.shown;
  $$('#mon-list .act[data-act]').forEach((b) => toggleCount(b, `mon-${b.dataset.act}-${b.dataset.id}`));
}

(async function monitoring() {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 864e5);
  const [events, prayers, actions] = await Promise.all([
    entity('MonitoringEvent', {
      q: { $or: [{ expires_at: { $gte: now.toISOString() } }, { expires_at: null, created_date: { $gte: weekAgo.toISOString() } }] },
      sort: '-created_date', limit: 60,
      fields: ['id', 'title', 'description', 'event_type', 'severity_level', 'affected_regions', 'expires_at', 'created_date', 'status'],
    }, 'monitoring'),
    entity('Prayer', { limit: 5000, fields: ['id', 'monitoring_event_id'] }, 'prayers').catch(() => []),
    entity('MonitoringOrgAction', { limit: 5000, fields: ['id', 'monitoring_event_id', 'action_type'] }, 'monitoring-actions').catch(() => []),
  ]);
  prayers.forEach((p) => { if (p.monitoring_event_id) mon.prayers[p.monitoring_event_id] = (mon.prayers[p.monitoring_event_id] || 0) + 1; });
  actions.forEach((a) => {
    const bucket = a.action_type === 'deploying' ? mon.deploying : mon.monitoring;
    bucket[a.monitoring_event_id] = (bucket[a.monitoring_event_id] || 0) + 1;
  });
  mon.all = events;
  $('#mon-updated').textContent = `Updated ${timeAgo(events[0]?.created_date) || 'just now'}`;

  const present = ['', ...Object.keys(MON_TYPES).filter((k) => events.some((e) => (MON_TYPES[e.event_type] ? e.event_type : 'other') === k))];
  $('#mon-filter').innerHTML = present.map((k) => `<button aria-pressed="${k === ''}" data-type="${k}">${k ? MON_TYPES[k].label : 'All'}</button>`).join('');
  $('#mon-filter').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    mon.type = b.dataset.type; mon.shown = 3;
    $$('#mon-filter button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderMon();
  });
  renderMon();
})();
$('#mon-more').addEventListener('click', () => { mon.shown += 6; renderMon(); });
/* Expand/collapse clamped advisory text (delegated: #mon-list is re-rendered on filter/show-more) */
function toggleMonDesc(p) {
  const open = p.classList.toggle('open');
  p.setAttribute('aria-expanded', String(open));
}
$('#mon-list').addEventListener('click', (e) => {
  const p = e.target.closest('.mon-desc'); if (p) toggleMonDesc(p);
});
$('#mon-list').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const p = e.target.closest('.mon-desc'); if (!p) return;
  e.preventDefault(); toggleMonDesc(p);
});
$('#mon-collapse').addEventListener('click', (e) => {
  const btn = e.currentTarget, body = $('#mon-body');
  const open = body.hidden;
  body.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  btn.innerHTML = `${icon(open ? 'chevronUp' : 'chevron')}<span>${open ? 'Hide' : 'Show'}</span>`;
});

/* ---------- Disaster Events ---------- */
const STATUS_FILTERS = [['', 'All'], ['active_deployment', 'Response'], ['assessment', 'Assessment'], ['monitoring', 'Monitoring'], ['long_term_recovery', 'Long-Term Recovery'], ['archived', 'Archived']];
const dz = { all: [], types: {}, photos: {}, status: '', q: '', shown: 12 };

function renderDisasters() {
  const q = dz.q.trim().toLowerCase();
  const list = dz.all.filter((d) => (!dz.status || d.status === dz.status) && (!q || `${d.name} ${d.affected_regions}`.toLowerCase().includes(q)));
  $('#d-grid').innerHTML = list.slice(0, dz.shown).map((d) => disasterCard(d, dz.types, dz.photos)).join('');
  $('#d-empty').hidden = list.length > 0;
  $('#d-more').hidden = list.length <= dz.shown;
}

(async function disasters() {
  const [list, types, photos] = await Promise.all([
    entity('Disaster', { sort: '-date_reported', limit: 200, fields: DISASTER_CARD_FIELDS }, 'disasters'),
    loadTypes(),
    loadPhotos(),
  ]);
  Object.assign(dz, { all: list, types, photos });
  $('#d-status').innerHTML = STATUS_FILTERS.map(([k, l]) => `<button aria-pressed="${k === ''}" data-status="${k}">${l}</button>`).join('');
  $('#d-status').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    dz.status = b.dataset.status; dz.shown = 12;
    $$('#d-status button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderDisasters();
  });
  renderDisasters();
})();
$('#d-search').addEventListener('input', (e) => { dz.q = e.target.value; dz.shown = 12; renderDisasters(); });
$('#d-more').addEventListener('click', () => { dz.shown += 12; renderDisasters(); });
