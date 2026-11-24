renderHeader({ dark: true });
renderFooter();
renderRibbon(`${APP}/`);
hydrateIcons();

(async function stats() {
  const list = await entity('StatSummary', { fields: ['stat_key', 'value_number'] }, 'stats');
  const byKey = Object.fromEntries(list.map((s) => [s.stat_key, s.value_number]));
  $$('[data-stat]').forEach((el) => {
    const n = byKey[el.dataset.stat];
    if (n == null) return;
    // The live site rounds the two big counts down to the nearest 10 and adds "+".
    el.innerHTML = el.dataset.stat === 'states_with_activity' ? n : `${Math.floor(n / 10) * 10}<span class="num-plus">+</span>`;
  });
})();

(async function currentDisasters() {
  const [list, types, photos] = await Promise.all([
    entity('Disaster', { sort: '-date_reported', limit: 12, fields: DISASTER_CARD_FIELDS }, 'disasters'),
    loadTypes(),
    loadPhotos(),
  ]);
  const grid = $('#current-disasters');
  grid.innerHTML = list.filter((d) => d.status !== 'archived').slice(0, 3)
    .map((d) => disasterCard(d, types, photos, { cta: 'View responses' })).join('');
  grid.removeAttribute('aria-busy');
})();
