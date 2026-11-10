// How modifiers change a lute's look. Pure data and math, so it runs in
// Node tests; render-lute.js turns the result into page elements.

/** Screen pixels per sprite pixel for a normal-size lute. */
export const BASE_PIXEL_SIZE = 6;

/**
 * Modifier id -> what it does to the look. Every modifier in the config
 * needs an entry (the tests check).
 *
 * Filters stack in the order listed here, so order matters: color first,
 * then gilded, then negative last, so a negative lute always inverts
 * whatever color it would otherwise be.
 *
 * Color variants hue-shift the wood (about 28°) toward each color's hue,
 * with a saturation boost so the shift reads clearly.
 */
export const MODIFIER_LOOKS = {
  crimson: { filter: 'hue-rotate(-35deg) saturate(1.8)' },
  azure: { filter: 'hue-rotate(180deg) saturate(1.6)' },
  emerald: { filter: 'hue-rotate(95deg) saturate(1.5)' },
  violet: { filter: 'hue-rotate(245deg) saturate(1.5)' },
  gilded: { filter: 'sepia(1) saturate(3.5) brightness(1.2)', sparkle: true },
  negative: { filter: 'invert(1)' },
  // Whole-number multiples of BASE_PIXEL_SIZE keep every pixel crisp.
  jumbo: { pixelScale: 1.5 },
  tiny: { pixelScale: 0.5 },
  'upside-down': { rotation: 180 },
  holographic: { holographic: true },
};

/**
 * @typedef {object} Look
 * @property {number} pixelSize Screen pixels per sprite pixel (a whole number).
 * @property {number} rotation Degrees.
 * @property {string} filter CSS filter, or "none".
 * @property {boolean} holographic Animated rainbow overlay.
 * @property {boolean} sparkle Gilded sparkles.
 */

/**
 * @param {import('./roll.js').Roll} roll
 * @returns {Look}
 */
export function luteLook(roll) {
  const has = new Set([...Object.values(roll.groups), ...roll.modifiers]);
  const look = { pixelSize: BASE_PIXEL_SIZE, rotation: 0, filter: 'none', holographic: false, sparkle: false };
  const filters = [];

  // Walk MODIFIER_LOOKS (not the roll) so filters stack in the order above.
  for (const [id, modifierLook] of Object.entries(MODIFIER_LOOKS)) {
    if (!has.has(id)) continue;
    if (modifierLook.filter) filters.push(modifierLook.filter);
    if (modifierLook.pixelScale) look.pixelSize = Math.round(look.pixelSize * modifierLook.pixelScale);
    if (modifierLook.rotation) look.rotation = (look.rotation + modifierLook.rotation) % 360;
    if (modifierLook.holographic) look.holographic = true;
    if (modifierLook.sparkle) look.sparkle = true;
  }

  if (filters.length) look.filter = filters.join(' ');
  return look;
}

/**
 * Picks `count` drawn (non-clear) pixels spread evenly through the sprite,
 * as places for gilded sparkles. Same sprite, same spots every time.
 *
 * @param {string[]} sprite Rows of pixels, as in sprites.js.
 * @param {number} count
 * @returns {{ x: number, y: number }[]}
 */
export function sparklePoints(sprite, count) {
  const drawn = [];
  sprite.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char !== '.') drawn.push({ x, y });
    });
  });
  const step = drawn.length / count;
  return Array.from({ length: count }, (_, i) => drawn[Math.floor(step * (i + 0.5))]);
}
