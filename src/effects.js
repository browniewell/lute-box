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
 * Tier id -> effects. Approved by Ryan in #7.
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
  legendary: { anticipationMs: 1600, shake: 6, particles: 36, flash: true, beam: 'light', screenShake: true },
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

// How often the box changes direction while it rattles.
const RATTLE_MS = 50;
// Glow blur at full strength, px: a wide soft one and a tight bright one.
const GLOW_WIDE = 16;
const GLOW_TIGHT = 4;

/**
 * Keyframes for the closed box before it opens (for element.animate): it
 * rattles side to side every RATTLE_MS, harder and harder up to `shake`
 * px, while a glow in the tier color grows around it.
 *
 * Built in JS rather than CSS so the rattle can be quick over any length
 * of anticipation, and so every frame has the same two shadows: Safari
 * can't animate between filter lists of different lengths, and jumps to
 * the end instead.
 *
 * @param {number} durationMs
 * @param {number} shake Most px the box moves, at the end.
 * @param {string} tierColor
 * @returns {{ offset: number, transform: string, filter: string }[]}
 */
export function boxShakeFrames(durationMs, shake, tierColor) {
  const count = Math.max(2, Math.round(durationMs / RATTLE_MS));
  return Array.from({ length: count + 1 }, (_, i) => {
    const progress = i / count;
    const size = shake * progress;
    // Alternate left and right; bob up and down at half the rate.
    const x = i === 0 ? 0 : (i % 2 ? -1 : 1) * size;
    const y = i === 0 ? 0 : (i % 4 < 2 ? -0.4 : 0.4) * size;
    const glow = (px) => `drop-shadow(0px 0px ${round(px * progress)}px ${tierColor})`;
    return {
      offset: progress,
      transform: `translate(${round(x)}px, ${round(y)}px)`,
      filter: `${glow(GLOW_WIDE)} ${glow(GLOW_TIGHT)}`,
    };
  });
}

function round(n) {
  return Math.round(n * 100) / 100 || 0; // `|| 0` turns -0 into 0.
}
