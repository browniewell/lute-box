// Draws the tavern: the plank wall behind the page, the hanging title sign
// and its lanterns. Browser only; the pixel art lives in scenery.js.
import { drawSprite } from './render-lute.js';
import { SCENERY_PALETTE, WALL_TILE, LANTERN, titleSign } from './scenery.js';

const WALL_PIXEL_SIZE = 4;

/**
 * @param {{ sign: HTMLElement, lanterns: HTMLElement[] }} spots
 * @param {number} pixelSize For the sign and lanterns.
 */
export function renderScenery({ sign, lanterns }, pixelSize) {
  sign.replaceChildren(drawSprite(titleSign('Lute Box'), pixelSize, SCENERY_PALETTE));
  for (const lantern of lanterns) {
    lantern.replaceChildren(drawSprite(LANTERN, pixelSize, SCENERY_PALETTE));
  }
}

/**
 * Tiles the plank wall across the whole page, under a warm glow from the
 * top and darker corners. Sizes are in tavern.css's terms (CSS pixels).
 */
export function renderWall() {
  const tile = drawSprite(WALL_TILE, WALL_PIXEL_SIZE, SCENERY_PALETTE);
  const { style } = document.body;
  style.backgroundImage = [
    'radial-gradient(ellipse at 50% 0%, rgb(255 190 90 / 0.14), rgb(0 0 0 / 0.55) 80%)',
    `url(${tile.toDataURL()})`,
  ].join(', ');
  style.backgroundSize = `100% 100%, ${tile.style.width} ${tile.style.height}`;
}
