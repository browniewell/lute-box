// Draws the link-preview image and the icons from the game's own pixel art
// and writes them to images/. Run after changing sprites or scenery:
//
//   npm run images
//
// The tests check the committed images still match the art.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SPRITES, BOX_SPRITE, PALETTE } from '../src/sprites.js';
import { SCENERY_PALETTE, WALL_TILE, LANTERN, titleSign } from '../src/scenery.js';
import { encodePng } from './png.js';

/** Published path -> [width, height]. */
export const IMAGE_SIZES = {
  // The size iMessage, Slack, Discord and social sites expect.
  'images/share.png': [1200, 630],
  'images/favicon.png': [32, 32],
  // iOS home screen icon.
  'images/apple-touch-icon.png': [180, 180],
};

// Wood recolors for the lutes on the shelf, standing in for the CSS color
// filters the game uses.
const CRIMSON = { ...PALETTE, b: '#d0453a', d: '#8f2a22' };
const AZURE = { ...PALETTE, b: '#4a8fd8', d: '#2b5f9e' };
const GILDED = { ...PALETTE, b: '#f2c14e', d: '#c18a1f', n: '#8a5a1a' };

const LEGENDARY = '#ff8000';
const SPARKLE = '#fffbe6';

/** @returns {Record<string, Buffer>} Published path -> PNG bytes. */
export function buildImages() {
  return {
    'images/share.png': shareImage(),
    'images/favicon.png': boxIcon(32, 2, null),
    'images/apple-touch-icon.png': boxIcon(180, 10, '#2b1a10'),
  };
}

// The tavern wall, the hanging sign between two lanterns, and a shelf of
// lutes with a gilded theorbo glowing in the middle.
function shareImage() {
  const [width, height] = IMAGE_SIZES['images/share.png'];
  const image = new Image(width, height);

  const wallPixel = 5;
  for (let y = 0; y < height; y += WALL_TILE.length * wallPixel) {
    for (let x = 0; x < width; x += WALL_TILE[0].length * wallPixel) {
      image.sprite(WALL_TILE, SCENERY_PALETTE, wallPixel, x, y);
    }
  }
  image.vignette();

  const sign = titleSign('Lute Box');
  const signPixel = 10;
  const signWidth = sign[0].length * signPixel;
  const signX = (width - signWidth) / 2;
  image.sprite(sign, SCENERY_PALETTE, signPixel, signX, 30);
  const lanternPixel = 8;
  const lanternWidth = LANTERN[0].length * lanternPixel;
  image.glow(signX - 40 - lanternWidth / 2, 110, 90, '#ffc85a', 0.35);
  image.glow(signX + signWidth + 40 + lanternWidth / 2, 110, 90, '#ffc85a', 0.35);
  image.sprite(LANTERN, SCENERY_PALETTE, lanternPixel, signX - 40 - lanternWidth, 46);
  image.sprite(LANTERN, SCENERY_PALETTE, lanternPixel, signX + signWidth + 40, 46);

  const shelfY = 568;
  image.glow(600, 420, 230, LEGENDARY, 0.75);
  image.rect(110, shelfY, 980, 6, '#8a5a2b');
  image.rect(110, shelfY + 6, 980, 14, '#6b4224');
  image.rect(110, shelfY + 20, 980, 6, '#120a05');

  const lutePixel = 6;
  const shelf = [
    ['mandolin', CRIMSON, 250],
    ['lute', PALETTE, 425],
    ['theorbo', GILDED, 600],
    ['oud', AZURE, 775],
    ['baroque-lute', PALETTE, 950],
  ];
  for (const [id, palette, centerX] of shelf) {
    const sprite = SPRITES[id];
    const x = centerX - (sprite[0].length * lutePixel) / 2;
    image.sprite(sprite, palette, lutePixel, x, shelfY - sprite.length * lutePixel);
  }
  for (const [x, y, size] of [[548, 300, 20], [660, 360, 16], [560, 470, 14], [648, 250, 12]]) {
    image.sparkle(x, y, size, SPARKLE);
  }

  return image.png();
}

// The closed box, centered on a square.
function boxIcon(size, pixel, background) {
  const image = new Image(size, size);
  if (background) image.rect(0, 0, size, size, background);
  const x = Math.floor((size - BOX_SPRITE[0].length * pixel) / 2);
  const y = Math.floor((size - BOX_SPRITE.length * pixel) / 2);
  image.sprite(BOX_SPRITE, PALETTE, pixel, x, y);
  return image.png();
}

/** An RGBA pixel buffer with just enough drawing for the images above. */
class Image {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4);
  }

  // Blends `color` over the pixel at (x, y) with opacity `alpha` (0-1).
  blend(x, y, [r, g, b], alpha) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 4;
    const d = this.data;
    const under = d[i + 3] / 255;
    const out = alpha + under * (1 - alpha);
    if (out === 0) return;
    for (const [k, c] of [[0, r], [1, g], [2, b]]) {
      d[i + k] = Math.round((c * alpha + d[i + k] * under * (1 - alpha)) / out);
    }
    d[i + 3] = Math.round(out * 255);
  }

  rect(x, y, w, h, color) {
    const rgb = hex(color);
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) this.blend(Math.round(px), Math.round(py), rgb, 1);
    }
  }

  sprite(rows, palette, pixel, x, y) {
    rows.forEach((row, sy) => {
      [...row].forEach((char, sx) => {
        if (char !== '.') this.rect(Math.round(x + sx * pixel), Math.round(y + sy * pixel), pixel, pixel, palette[char]);
      });
    });
  }

  // A soft round light, strongest in the middle.
  glow(cx, cy, radius, color, strength) {
    const rgb = hex(color);
    for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
      for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
        const distance = Math.hypot(x - cx, y - cy) / radius;
        if (distance < 1) this.blend(x, y, rgb, strength * (1 - distance) ** 2);
      }
    }
  }

  // Darkens toward the edges and bottom, like the page's background.
  vignette() {
    const black = [0, 0, 0];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const distance = Math.hypot((x - this.width / 2) / (this.width / 2), y / this.height);
        this.blend(x, y, black, Math.min(0.6, 0.55 * distance));
      }
    }
  }

  // A four-point twinkle, like the gilded sparkles in the game.
  sparkle(cx, cy, size, color) {
    const bar = Math.max(2, Math.round(size / 5));
    this.rect(cx - bar / 2, cy - size / 2, bar, size, color);
    this.rect(cx - size / 2, cy - bar / 2, size, bar, color);
  }

  png() {
    return encodePng(this.width, this.height, this.data);
  }
}

function hex(color) {
  return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
}

// Writes the files when run as a script (not when the tests import it).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../', import.meta.url);
  mkdirSync(new URL('images/', root), { recursive: true });
  for (const [path, png] of Object.entries(buildImages())) {
    writeFileSync(new URL(path, root), png);
    console.log(`wrote ${path} (${(png.length / 1024).toFixed(1)} KB)`);
  }
}
