// The share image and icons are generated from the pixel art by
// scripts/make-images.js and committed, so GitHub Pages can serve them.
// This fails if the art changed and the images weren't remade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildImages, IMAGE_SIZES } from '../scripts/make-images.js';

const images = buildImages();

test('the committed images match the current art (run `npm run images` if not)', () => {
  for (const [path, png] of Object.entries(images)) {
    const saved = readFileSync(new URL(`../${path}`, import.meta.url));
    assert.ok(saved.equals(png), `${path} is out of date`);
  }
});

test('each image is the size link previews and browsers expect', () => {
  for (const [path, png] of Object.entries(images)) {
    const [width, height] = IMAGE_SIZES[path];
    assert.equal(png.readUInt32BE(16), width, `${path} width`);
    assert.equal(png.readUInt32BE(20), height, `${path} height`);
  }
});
