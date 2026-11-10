// Which effects play for each tier. Pure data, so it's tested in Node;
// play-effects.js turns a plan into animation on the page.

/**
 * @typedef {object} EffectPlan
 * @property {number} anticipationMs How long the box shakes and glows.
 * @property {number} shake How far the box shakes, in px.
 * @property {number} particles How many particles burst out on reveal.
 * @property {boolean} flash A screen flash in the tier color on reveal.
 * @property {'none' | 'light' | 'rainbow'} beam A beam of light behind the lute.
 * @property {boolean} screenShake The whole page shakes on reveal.
 */

/**
 * Tier id -> effects. PROPOSAL, waiting on Ryan's approval in #7.
 * Effects only ever grow from one tier to the next rarer one (the tests
 * check), and the rarest tier is the secret one, so it gets everything.
 *
 * @type {Record<string, EffectPlan>}
 */
export const TIER_EFFECTS = {
  common: { anticipationMs: 500, shake: 2, particles: 0, flash: false, beam: 'none', screenShake: false },
  uncommon: { anticipationMs: 700, shake: 3, particles: 0, flash: false, beam: 'none', screenShake: false },
  rare: { anticipationMs: 900, shake: 4, particles: 12, flash: false, beam: 'none', screenShake: false },
  epic: { anticipationMs: 1200, shake: 5, particles: 24, flash: true, beam: 'none', screenShake: false },
  legendary: { anticipationMs: 1600, shake: 6, particles: 36, flash: true, beam: 'light', screenShake: false },
  mythic: { anticipationMs: 2200, shake: 8, particles: 60, flash: true, beam: 'rainbow', screenShake: true },
};

// With reduced motion on, the lute shows at once with its tier color and
// nothing moves or flashes.
const STILL = { anticipationMs: 0, shake: 0, particles: 0, flash: false, beam: 'none', screenShake: false };

/**
 * @param {string} tierId
 * @param {{ reducedMotion: boolean }} options
 * @returns {EffectPlan}
 */
export function effectPlan(tierId, { reducedMotion }) {
  const effects = TIER_EFFECTS[tierId];
  if (!effects) {
    throw new Error(`No effects for tier "${tierId}"`);
  }
  return reducedMotion ? { ...STILL } : { ...effects };
}
