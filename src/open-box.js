import { CONFIG } from './config.js';
import { rollLute } from './roll.js';
import { exactOdds } from './odds.js';
import { lootName } from './names.js';
import { tierFor } from './tiers.js';
import { formatOdds, formatPercent } from './format.js';

/**
 * Everything the reveal shows for one opened box, as ready-to-display text.
 * @typedef {object} Reveal
 * @property {string} name e.g. "Crimson Jumbo Theorbo"
 * @property {string} tierId
 * @property {string} tierName
 * @property {string} tierColor CSS color from the tier.
 * @property {string} oddsText e.g. "1 in 25,000"
 * @property {string} percentText e.g. "0.004%", shown on hover.
 * @property {import('./roll.js').Roll} roll For drawing the sprite.
 */

/**
 * Opens one box: rolls a lute and works out what to show for it.
 * Kept apart from main.js so it runs in Node tests without a page.
 *
 * @param {() => number} random Math.random in the game.
 * @param {import('./tiers.js').ComputedTier[]} tiers From computeTiers.
 * @param {import('./config.js').Config} [config]
 * @returns {Reveal}
 */
export function openBox(random, tiers, config = CONFIG) {
  const roll = rollLute(random, config);
  const odds = exactOdds(roll, config);
  const tier = tierFor(odds, tiers);
  return {
    name: lootName(roll, config),
    tierId: tier.id,
    tierName: tier.name,
    tierColor: tier.color,
    oddsText: formatOdds(odds),
    percentText: formatPercent(odds),
    roll,
  };
}
