import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENERY_PALETTE, WALL_TILE, LANTERN, GLYPHS, titleSign } from '../src/scenery.js';

function assertSprite(id, rows) {
  const widths = new Set(rows.map((row) => row.length));
  assert.equal(widths.size, 1, `"${id}" has rows of widths ${[...widths]}`);
  for (const [y, row] of rows.entries()) {
    for (const char of row) {
      assert.ok(char === '.' || char in SCENERY_PALETTE, `"${id}" row ${y} has unknown pixel "${char}"`);
    }
  }
}

test('the wall tile and lantern are well-formed sprites', () => {
  assertSprite('wall', WALL_TILE);
  assertSprite('lantern', LANTERN);
});

test('every glyph is the same size and uses only "#" and "."', () => {
  const sizes = new Set();
  for (const [char, rows] of Object.entries(GLYPHS)) {
    sizes.add(`${rows[0].length}x${rows.length}`);
    for (const row of rows) assert.match(row, /^[#.]+$/, `glyph "${char}"`);
  }
  assert.equal(sizes.size, 1, `glyph sizes differ: ${[...sizes]}`);
});

test('the title sign is a well-formed sprite', () => {
  assertSprite('sign', titleSign('LUTE BOX'));
});

test('a wider title makes a wider sign', () => {
  assert.ok(titleSign('LUTE BOX')[0].length > titleSign('LUTE')[0].length);
});

test('the sign is case-insensitive', () => {
  assert.deepEqual(titleSign('Lute Box'), titleSign('LUTE BOX'));
});

test('a letter with no glyph fails loudly', () => {
  assert.throws(() => titleSign('LUTE?'), /no glyph for "\?"/);
});
