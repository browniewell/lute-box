import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, PALETTE } from '../src/sprites.js';
import { CONFIG } from '../src/config.js';

// Uses the real config on purpose: a new base type without a sprite
// should fail here, not show a blank box in the game.
test('every base type in the config has a sprite', () => {
  for (const baseType of CONFIG.baseTypes) {
    assert.ok(SPRITES[baseType.id], `no sprite for "${baseType.id}"`);
  }
});

test('every sprite row is the same width', () => {
  for (const [id, rows] of Object.entries(SPRITES)) {
    const widths = new Set(rows.map((row) => row.length));
    assert.equal(widths.size, 1, `"${id}" has rows of widths ${[...widths]}`);
  }
});

test('every sprite pixel is a palette color or "." for clear', () => {
  for (const [id, rows] of Object.entries(SPRITES)) {
    for (const [y, row] of rows.entries()) {
      for (const char of row) {
        assert.ok(char === '.' || char in PALETTE, `"${id}" row ${y} has unknown pixel "${char}"`);
      }
    }
  }
});
