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

// Proof band: partner logos for organizations already named on this site (needs at least four, or the row stays hidden).
(async function partnerLogos() {
  const row = $('#proof-logos');
  if (!row) return;
  try {
    const list = await entity('Organization', { q: { status: 'active', is_publicly_visible: true }, sort: 'name', limit: 1000, fields: ['id', 'name', 'logo'] }, 'organizations');
    // Marks that stay legible at 40px only (God's Pit Crew's script mark and the Just the Crumbs monogram do not).
    const named = /Serve 6\.8|Minuteman|Eight Days of Hope|Mercy Chefs|Celebration Church|516 Project|Church Unlimited|AustinServes/i;
    const picks = list.filter((o) => o.logo && named.test(o.name || '')).slice(0, 6);
    if (picks.length < 4) return;
    row.innerHTML = picks.map((o) => `<li><img src="${esc(o.logo)}" alt="${esc(o.name)}" loading="lazy" decoding="async"></li>`).join('');
    row.dataset.count = picks.length;
    row.hidden = false;
    // Optical sizing: every mark gets about the same ink area, whatever its aspect ratio.
    const fit = (img) => {
      const ar = img.naturalWidth / img.naturalHeight;
      if (!ar || !isFinite(ar)) return;
      const phone = matchMedia('(max-width: 734px)').matches, area = phone ? 2600 : 4000, maxW = phone ? 104 : 150, maxH = phone ? 36 : 44;
      let h = Math.min(maxH, Math.max(18, Math.sqrt(area / ar)));
      if (h * ar > maxW) h = maxW / ar;
      img.style.height = `${Math.round(h)}px`; img.style.width = 'auto';
    };
    $$('img', row).forEach((img) => { if (img.complete) fit(img); else img.addEventListener('load', () => fit(img), { once: true }); });
  } catch (e) {}
})();
