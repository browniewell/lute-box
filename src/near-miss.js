/**
 * The next rarer tier, if a lute only just missed it; otherwise null.
 *
 * "Just missed" is measured the way the player reads odds, in "1 in N".
 * With a margin of 0.1, a lute is a near miss if its N is at least 90%
 * of the next tier's threshold N. For example, 1 in 91 against a
 * legendary threshold of 1 in 100.
 *
 * @param {number} odds The lute's exact odds, 0 to 1.
 * @param {import('./tiers.js').ComputedTier[]} tiers From computeTiers.
 * @param {number} margin config.nearMissMargin. 0 turns near misses off.
 * @returns {import('./tiers.js').ComputedTier | null}
 */
export function nearMiss(odds, tiers, margin) {
  // The lute's own tier is the rarest one whose threshold it meets, so the
  // next tier up is the first threshold (most common first) it fails.
  const next = tiers.find((tier) => odds > tier.maxOdds);
  if (!next || margin <= 0) return null;
  // N >= (1 - margin) x thresholdN, rearranged to compare odds directly.
  // The tiny tolerance keeps a lute exactly on the edge counting.
  return odds <= (next.maxOdds / (1 - margin)) * (1 + 1e-12) ? next : null;
}
