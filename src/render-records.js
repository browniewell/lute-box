// Draws the stats and trophy case into the page. Browser only; the rules
// for what goes in them live in records.js.
import { renderLute } from './render-lute.js';
import { formatOdds, formatPercent } from './format.js';

/**
 * @param {HTMLElement} section The #records section in index.html.
 * @param {import('./records.js').Records} records
 * @param {import('./tiers.js').ComputedTier[]} tiers
 */
export function renderRecords(section, records, tiers) {
  const best = records.trophies[0];
  setStat(section, 'opened', records.opened.toLocaleString('en-US'));
  setStat(section, 'best', best ? `${best.name} (${formatOdds(best.odds)})` : '—');
  const modifier = records.rarestModifier;
  setStat(section, 'modifier', modifier ? `${modifier.name} (${formatPercent(modifier.chance)} chance)` : '—');

  // Every tier in the config, so zeros show too. Counts saved under a
  // tier id the config no longer has are left out.
  section.querySelector('#tier-counts').replaceChildren(
    ...tiers.map((tier) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = tier.name;
      name.style.color = tier.color;
      item.append(name, `: ${(records.tierCounts[tier.id] ?? 0).toLocaleString('en-US')}`);
      return item;
    }),
  );

  section.querySelector('#trophies-empty').hidden = records.trophies.length > 0;
  section.querySelector('#trophies').replaceChildren(...records.trophies.map(trophyItem));
}

function setStat(section, key, text) {
  section.querySelector(`[data-stat="${key}"]`).textContent = text;
}

function trophyItem(trophy) {
  const item = document.createElement('li');
  item.className = 'trophy';

  const sprite = document.createElement('div');
  sprite.className = 'trophy-sprite';
  sprite.setAttribute('aria-hidden', 'true');
  try {
    renderLute(sprite, trophy.roll);
  } catch {
    // A saved roll the current config can't draw (e.g. a removed base
    // type). The text below still says what it was.
  }

  const name = document.createElement('strong');
  name.textContent = trophy.name;

  const tier = document.createElement('span');
  tier.textContent = trophy.tierName;
  tier.style.color = trophy.tierColor;

  const odds = document.createElement('span');
  odds.className = 'odds';
  odds.textContent = formatOdds(trophy.odds);
  odds.title = formatPercent(trophy.odds);

  const date = document.createElement('time');
  date.dateTime = trophy.pulledAt;
  date.textContent = new Date(trophy.pulledAt).toLocaleDateString();

  const details = document.createElement('div');
  details.append(name, document.createElement('br'), tier, ' · ', odds, ' · ', date);
  item.append(sprite, details);
  return item;
}
