// Draws a lute with its modifiers into a page element. Browser only; the
// decisions about what it should look like live in look.js.
import { SPRITES, BOX_SPRITE, PALETTE } from './sprites.js';
import { luteLook, sparklePoints, displayPixelSize, pegEdges, BASE_PIXEL_SIZE } from './look.js';

const SPARKLE_COUNT = 5;
const SPARKLE_SIZE = 16; // px at full size; matches .sparkle in lute.css.
// Pegs smaller than this (small trophies) skip their edge: it would swamp them.
const MIN_PIXEL_SIZE_FOR_PEG_EDGES = 3;
const PEG_EDGE_COLOR = '#000';

/**
 * Replaces the contents of `container` with the lute for `roll`.
 * Styles are in lute.css.
 *
 * @param {HTMLElement} container
 * @param {import('./roll.js').Roll} roll
 * @param {{ scale?: number, maxHeight?: number }} [size] See displayPixelSize
 *   in look.js. Leave out for full size.
 */
export function renderLute(container, roll, size = {}) {
  const sprite = SPRITES[roll.baseType];
  const look = luteLook(roll);
  const pixelSize = displayPixelSize(look.pixelSize, sprite.length, size);

  const wrapper = document.createElement('div');
  wrapper.className = 'lute';
  wrapper.style.transform = `rotate(${look.rotation}deg)`;

  const canvas = drawSprite(sprite, pixelSize);
  if (pixelSize >= MIN_PIXEL_SIZE_FOR_PEG_EDGES) drawPegEdges(canvas, sprite, pixelSize);
  canvas.style.filter = look.filter;
  wrapper.append(canvas);

  if (look.holographic) {
    // A rainbow layer cut to the lute's shape by using the sprite as a mask.
    const overlay = document.createElement('div');
    overlay.className = 'holographic';
    const mask = `url(${canvas.toDataURL()})`;
    overlay.style.maskImage = mask;
    overlay.style.webkitMaskImage = mask;
    wrapper.append(overlay);
  }

  if (look.sparkle) {
    // Sparkles shrink with the lute, so a small trophy isn't all sparkle.
    const sparkleSize = Math.max(6, Math.round((SPARKLE_SIZE * pixelSize) / BASE_PIXEL_SIZE));
    wrapper.style.setProperty('--sparkle-size', `${sparkleSize}px`);
    sparklePoints(sprite, SPARKLE_COUNT).forEach(({ x, y }, i) => {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${(x + 0.5) * pixelSize}px`;
      sparkle.style.top = `${(y + 0.5) * pixelSize}px`;
      sparkle.style.animationDelay = `${i * 0.37}s`;
      wrapper.append(sparkle);
    });
  }

  container.replaceChildren(wrapper);
}

/**
 * Replaces the contents of `container` with the unopened box and returns
 * the box element, for play-effects.js to shake.
 *
 * @param {HTMLElement} container
 * @param {number} pixelSize
 * @returns {HTMLElement}
 */
export function renderBox(container, pixelSize) {
  const wrapper = document.createElement('div');
  wrapper.className = 'box';
  wrapper.append(drawSprite(BOX_SPRITE, pixelSize));
  container.replaceChildren(wrapper);
  return wrapper;
}

// A 1px dark line along each peg side that faces clear space, drawn in the
// clear pixel next to it so the peg keeps its full size. On the canvas, so
// it changes with modifiers like the rest of the lute.
function drawPegEdges(canvas, sprite, pixelSize) {
  const ratio = window.devicePixelRatio || 1;
  const block = Math.round(pixelSize * ratio);
  const line = Math.max(1, Math.round(ratio));
  const context = canvas.getContext('2d');
  context.fillStyle = PEG_EDGE_COLOR;
  for (const { x, y, side } of pegEdges(sprite)) {
    const left = x * block;
    const top = y * block;
    if (side === 'top') context.fillRect(left, top - line, block, line);
    if (side === 'bottom') context.fillRect(left, top + block, block, line);
    if (side === 'left') context.fillRect(left - line, top, line, block);
    if (side === 'right') context.fillRect(left + block, top, line, block);
  }
}

// Draws each sprite pixel as a solid block. The canvas is sized in device
// pixels, so on a Retina screen every block lands on whole screen pixels
// and nothing gets smoothed or blurred. Also draws the scenery
// (render-scenery.js), which has its own palette.
export function drawSprite(sprite, pixelSize, palette = PALETTE) {
  const ratio = window.devicePixelRatio || 1;
  const block = Math.round(pixelSize * ratio);
  const width = sprite[0].length;
  const height = sprite.length;

  const canvas = document.createElement('canvas');
  canvas.width = width * block;
  canvas.height = height * block;
  canvas.style.width = `${width * pixelSize}px`;
  canvas.style.height = `${height * pixelSize}px`;

  const context = canvas.getContext('2d');
  sprite.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === '.') return;
      context.fillStyle = palette[char];
      context.fillRect(x * block, y * block, block, block);
    });
  });
  return canvas;
}
