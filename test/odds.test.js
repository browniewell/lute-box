import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exactOdds } from '../src/odds.js';
import { formatOdds } from '../src/format.js';
import { TEST_CONFIG, assertClose } from './fixtures.js';

// Odds count only what a lute HAS: its base type plus every modifier that
// hit. Misses and default group results (normal size, no color) don't count.

function makeRoll({ baseType, size = 'normal', color = 'none', modifiers = [] }) {
  return { baseType, groups: { size, color }, modifiers };
}

test('a plain lute is just its base type chance', () => {
  const odds = exactOdds(makeRoll({ baseType: 'theorbo' }), TEST_CONFIG);
  assertClose(assert, odds, 0.05);
});

test('handoff example: theorbo x jumbo x holographic is 1 in 25,000', () => {
  const roll = makeRoll({ baseType: 'theorbo', size: 'jumbo', modifiers: ['holographic'] });
  const odds = exactOdds(roll, TEST_CONFIG);

  assertClose(assert, odds, 0.05 * 0.04 * 0.02);
  assert.equal(formatOdds(odds), '1 in 25,000');
});

test('a color hit counts toward the odds', () => {
  const odds = exactOdds(makeRoll({ baseType: 'lute', color: 'crimson' }), TEST_CONFIG);
  assertClose(assert, odds, 0.55 * 0.1);
});

test('several independent modifiers multiply together', () => {
  const roll = makeRoll({ baseType: 'oud', modifiers: ['negative', 'gilded'] });
  assertClose(assert, exactOdds(roll, TEST_CONFIG), 0.4 * 0.03 * 0.01);
});

test('every extra hit makes a lute rarer', () => {
  const plain = exactOdds(makeRoll({ baseType: 'lute' }), TEST_CONFIG);
  const tiny = exactOdds(makeRoll({ baseType: 'lute', size: 'tiny' }), TEST_CONFIG);
  const tinyGilded = exactOdds(
    makeRoll({ baseType: 'lute', size: 'tiny', modifiers: ['gilded'] }),
    TEST_CONFIG,
  );

  assert.ok(tiny < plain);
  assert.ok(tinyGilded < tiny);
});
