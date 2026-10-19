import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allOutcomes } from '../src/outcomes.js';
import { TEST_CONFIG, TINY_CONFIG, assertClose } from './fixtures.js';

test('lists every possible lute exactly once', () => {
  // 3 base types x 3 sizes x 2 colors x 2^3 modifier combinations
  const outcomes = allOutcomes(TEST_CONFIG);
  assert.equal(outcomes.length, 3 * 3 * 2 * 8);

  const keys = new Set(outcomes.map(({ roll }) => JSON.stringify(roll)));
  assert.equal(keys.size, outcomes.length);
});

test('outcome probabilities add up to 1', () => {
  const total = allOutcomes(TEST_CONFIG).reduce((sum, o) => sum + o.probability, 0);
  assertClose(assert, total, 1);
});

test('outcome probability counts misses, unlike the displayed odds', () => {
  // A plain lute shows odds of 0.9, but only 81% of pulls are a plain lute,
  // because 10% of lutes roll gilded.
  const plainLute = allOutcomes(TINY_CONFIG).find(
    ({ roll }) => roll.baseType === 'lute' && roll.modifiers.length === 0,
  );
  assertClose(assert, plainLute.probability, 0.81);
});
