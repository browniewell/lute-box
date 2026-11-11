import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openBox } from '../src/open-box.js';
import { computeTiers } from '../src/tiers.js';
import { TINY_CONFIG } from './fixtures.js';

// TINY_CONFIG rolls the base type first, then gilded. Fixed values pick
// the outcome: 0.95 lands on theorbo (top 10%), 0.05 hits gilded (< 10%).
function fixedRandom(...values) {
  return () => values.shift();
}

const tiers = computeTiers(TINY_CONFIG);

test('a plain lute reveals as common with its odds', () => {
  const reveal = openBox(fixedRandom(0.1, 0.5), tiers, TINY_CONFIG);
  assert.deepEqual(reveal, {
    name: 'Lute',
    tierId: 'common',
    tierName: 'Common',
    tierColor: '#9d9d9d',
    odds: 0.9,
    oddsText: '1 in 1',
    percentText: '90%',
    roll: { baseType: 'lute', groups: {}, modifiers: [] },
  });
});

test('the rarest lute reveals in the rarest tier', () => {
  const reveal = openBox(fixedRandom(0.95, 0.05), tiers, TINY_CONFIG);
  assert.equal(reveal.name, 'Gilded Theorbo');
  assert.equal(reveal.tierName, TINY_CONFIG.tiers.at(-1).name);
  assert.equal(reveal.tierColor, TINY_CONFIG.tiers.at(-1).color);
  assert.equal(reveal.oddsText, '1 in 100');
  assert.equal(reveal.percentText, '1%');
});
