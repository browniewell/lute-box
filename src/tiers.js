import { CONFIG } from './config.js';
import { allOutcomes } from './outcomes.js';
import { exactOdds } from './odds.js';

/**
 * A tier from the config plus its calculated threshold.
 * @typedef {import('./config.js').Tier & { maxOdds: number, expectedShare: number }} ComputedTier
 *   maxOdds: a lute is in this tier (or a rarer one) if its odds are at most this.
 *   expectedShare: the fraction of pulls that will actually land in this tier.
 */

/**
 * Works out each tier's odds threshold from its target share. Call once at
 * startup; the result goes to tierFor.
 *
 * How: rank every possible lute from rarest odds to most common, then walk
 * down the list adding up how often each one drops. Each tier's cutoff goes
 * where that running total comes closest to the tier's target (counting the
 * tier plus every rarer tier).
 *
 * @param {import('./config.js').Config} [config]
 * @returns {ComputedTier[]} Same order as config.tiers, most common first.
 */
export function computeTiers(config = CONFIG) {
  const levels = oddsLevels(config);
  const tiers = config.tiers.map((tier) => ({ ...tier, maxOdds: 1, expectedShare: 0 }));

  // Rarest first, so each tier's target includes every rarer tier's share.
  // The most common tier keeps maxOdds 1 and catches everything left.
  let targetIncludingRarer = 0;
  for (let i = tiers.length - 1; i >= 1; i--) {
    targetIncludingRarer += tiers[i].targetShare;
    tiers[i].maxOdds = closestCutoff(levels, targetIncludingRarer);
  }

  for (const level of levels) {
    tierFor(level.odds, tiers).expectedShare += level.share;
  }
  return tiers;
}

/**
 * The tier for a lute's odds: the rarest tier whose threshold it meets.
 * A lute exactly on a threshold belongs to that tier.
 *
 * @param {number} odds
 * @param {ComputedTier[]} tiers From computeTiers.
 * @returns {ComputedTier}
 */
export function tierFor(odds, tiers) {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (odds <= tiers[i].maxOdds) {
      return tiers[i];
    }
  }
  // Unreachable: the most common tier's maxOdds is 1, and odds never exceed 1.
  return tiers[0];
}

// Every distinct odds value a lute can show, rarest first, with the share
// of pulls that show it. Different lutes often share the same odds (e.g.
// crimson jumbo vs. azure jumbo), and a threshold can't split them.
function oddsLevels(config) {
  const outcomes = allOutcomes(config)
    .map(({ roll, probability }) => ({ odds: exactOdds(roll, config), share: probability }))
    .sort((a, b) => a.odds - b.odds);

  const levels = [];
  for (const outcome of outcomes) {
    const last = levels[levels.length - 1];
    if (last && isSameOdds(last.odds, outcome.odds)) {
      last.share += outcome.share;
      last.odds = outcome.odds; // Keep the largest, so every member is <= it.
    } else {
      levels.push({ ...outcome });
    }
  }
  return levels;
}

// Mathematically equal odds can differ in the last digits depending on the
// order they were multiplied in (0.08 x 0.04 vs. 0.04 x 0.08).
function isSameOdds(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(a, b);
}

// The odds cutoff whose running share is closest to the target. Returns 0
// (nothing qualifies) when even the rarest lute alone overshoots.
function closestCutoff(levels, target) {
  let bestCutoff = 0;
  let bestGap = target; // Gap if the cutoff includes nothing.
  let runningShare = 0;
  for (const level of levels) {
    runningShare += level.share;
    const gap = Math.abs(runningShare - target);
    if (gap < bestGap) {
      bestGap = gap;
      bestCutoff = level.odds;
    }
  }
  return bestCutoff;
}
