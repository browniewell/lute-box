import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTiers, tierFor } from '../src/tiers.js';
import { CONFIG } from '../src/config.js';
import { TINY_CONFIG, assertClose } from './fixtures.js';

// See TINY_CONFIG in fixtures.js for the hand-worked numbers.

test('thresholds land where the hand-worked example says', () => {
  const [common, rare, legendary] = computeTiers(TINY_CONFIG);

  assert.equal(common.maxOdds, 1);
  assertClose(assert, rare.maxOdds, 0.1);
  assertClose(assert, legendary.maxOdds, 0.01);
});

test('expected shares match the targets when they are reachable', () => {
  const [common, rare, legendary] = computeTiers(TINY_CONFIG);

  assertClose(assert, common.expectedShare, 0.81);
  assertClose(assert, rare.expectedShare, 0.18);
  assertClose(assert, legendary.expectedShare, 0.01);
});

test('an unreachable target goes to the closest achievable cut', () => {
  const config = structuredClone(TINY_CONFIG);
  config.tiers[0].targetShare = 0.85;
  config.tiers[1].targetShare = 0.14;
  // Rare + legendary now targets 15%. The cuts available are 10% and 19%;
  // 19% is closer, so rare still takes theorbo and gilded lute.
  const [, rare] = computeTiers(config);
  assertClose(assert, rare.maxOdds, 0.1);
});

test('tierFor: just above, exactly on, and just below each boundary', () => {
  const tiers = computeTiers(TINY_CONFIG);
  const tierAt = (odds) => tierFor(odds, tiers).id;

  // Rare boundary (0.1)
  assert.equal(tierAt(0.1 * 1.000001), 'common');
  assert.equal(tierAt(0.1), 'rare');
  assert.equal(tierAt(0.1 * 0.999999), 'rare');

  // Legendary boundary (0.01)
  assert.equal(tierAt(0.01 * 1.000001), 'rare');
  assert.equal(tierAt(0.01), 'legendary');
  assert.equal(tierAt(0.01 * 0.999999), 'legendary');
});

test('real config: shares add up to 1 and rarer tiers have lower thresholds', () => {
  const tiers = computeTiers(CONFIG);

  const totalShare = tiers.reduce((sum, tier) => sum + tier.expectedShare, 0);
  assertClose(assert, totalShare, 1);

  for (let i = 1; i < tiers.length; i++) {
    assert.ok(
      tiers[i].maxOdds <= tiers[i - 1].maxOdds,
      `${tiers[i].id} threshold should not be above ${tiers[i - 1].id}`,
    );
  }
});
