import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nearMiss } from '../src/near-miss.js';

// Thresholds picked by hand so the "1 in N" math is easy to follow:
// rare starts at 1 in 10, legendary at 1 in 100.
const tiers = [
  { id: 'common', name: 'Common', maxOdds: 1 },
  { id: 'rare', name: 'Rare', maxOdds: 0.1 },
  { id: 'legendary', name: 'Legendary', maxOdds: 0.01 },
];

test('just short of the next tier is a near miss on that tier', () => {
  // 1 in 91 is within 10% of legendary's 1 in 100.
  assert.equal(nearMiss(1 / 91, tiers, 0.1)?.id, 'legendary');
  // 1 in 9.5 is within 10% of rare's 1 in 10.
  assert.equal(nearMiss(1 / 9.5, tiers, 0.1)?.id, 'rare');
});

test('the edge of the window counts: exactly 10% short', () => {
  assert.equal(nearMiss(1 / 90, tiers, 0.1)?.id, 'legendary');
});

test('further away than the margin is not a near miss', () => {
  assert.equal(nearMiss(1 / 89, tiers, 0.1), null);
  assert.equal(nearMiss(1 / 50, tiers, 0.1), null);
  assert.equal(nearMiss(0.9, tiers, 0.1), null);
});

test('a lute that made the tier is not a near miss', () => {
  assert.equal(nearMiss(0.01, tiers, 0.1), null); // Exactly on the threshold.
  assert.equal(nearMiss(1 / 101, tiers, 0.1), null);
});

test('the rarest tier has nothing above it to miss', () => {
  assert.equal(nearMiss(1 / 5000, tiers, 0.1), null);
});

test('a margin of 0 turns near misses off', () => {
  assert.equal(nearMiss(1 / 99.9, tiers, 0), null);
});
