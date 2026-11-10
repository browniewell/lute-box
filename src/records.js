// The trophy case and stats: what the game remembers between visits.
// Pure data in, data out, so it runs in Node tests. storage.js saves it.
import { CONFIG } from './config.js';
import { modifiersOf } from './names.js';

export const MAX_TROPHIES = 10;

/**
 * One lute in the trophy case. Saved as it was shown when pulled, so a
 * later config change doesn't rewrite history.
 * @typedef {object} Trophy
 * @property {string} name
 * @property {string} tierId
 * @property {string} tierName
 * @property {string} tierColor
 * @property {number} odds Exact odds, 0 to 1. The case sorts by this.
 * @property {import('./roll.js').Roll} roll For drawing the sprite.
 * @property {string} pulledAt ISO date and time.
 */

/**
 * @typedef {object} Records
 * @property {1} version Bump if the shape changes, so old saves are caught.
 * @property {number} opened Boxes opened.
 * @property {Record<string, number>} tierCounts Tier id -> pulls.
 * @property {Trophy[]} trophies Rarest first; trophies[0] is the best pull ever.
 * @property {{ id: string, name: string, chance: number } | null} rarestModifier
 *   Rarest by the modifier's own chance.
 */

/** @returns {Records} */
export function emptyRecords() {
  return { version: 1, opened: 0, tierCounts: {}, trophies: [], rarestModifier: null };
}

/**
 * Records one opened box. Returns new records; the old ones are unchanged.
 *
 * A pull joins the trophy case if it's rarer than whatever would be #11,
 * so the case fills up from the first box. On equal odds the earlier pull
 * stays ahead, so a tie with #10 doesn't get in.
 *
 * @param {Records} records
 * @param {import('./open-box.js').Reveal} lute
 * @param {Date} pulledAt
 * @param {import('./config.js').Config} [config]
 * @returns {Records}
 */
export function addPull(records, lute, pulledAt, config = CONFIG) {
  const trophy = {
    name: lute.name,
    tierId: lute.tierId,
    tierName: lute.tierName,
    tierColor: lute.tierColor,
    odds: lute.odds,
    roll: lute.roll,
    pulledAt: pulledAt.toISOString(),
  };
  // sort is stable and the new trophy goes last, so it loses ties.
  const trophies = [...records.trophies, trophy]
    .sort((a, b) => a.odds - b.odds)
    .slice(0, MAX_TROPHIES);

  let rarestModifier = records.rarestModifier;
  for (const { id, name, chance } of modifiersOf(lute.roll, config)) {
    if (!rarestModifier || chance < rarestModifier.chance) {
      rarestModifier = { id, name, chance };
    }
  }

  return {
    version: 1,
    opened: records.opened + 1,
    tierCounts: { ...records.tierCounts, [lute.tierId]: (records.tierCounts[lute.tierId] ?? 0) + 1 },
    trophies,
    rarestModifier,
  };
}
