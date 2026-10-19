import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rollLute } from '../src/roll.js';
import { TEST_CONFIG, sequenceRandom } from './fixtures.js';

// Roll order: base type, then each group (size, color), then each
// independent modifier (holographic, negative, gilded). One random value each.

test('fixed random values land on the expected lute', () => {
  const random = sequenceRandom([
    0.97, // base: lute < 0.55, oud < 0.95, theorbo < 1.0 -> theorbo
    0.93, // size: normal < 0.92, jumbo < 0.96 -> jumbo
    0.95, // color: none < 0.9, crimson < 1.0 -> crimson
    0.01, // holographic: 0.01 < 0.02 -> hit
    0.5, // negative: miss
    0.5, // gilded: miss
  ]);

  assert.deepEqual(rollLute(random, TEST_CONFIG), {
    baseType: 'theorbo',
    groups: { size: 'jumbo', color: 'crimson' },
    modifiers: ['holographic'],
  });
});

test('random value of 0 picks the first option and hits every modifier', () => {
  const random = sequenceRandom([0, 0, 0, 0, 0, 0]);

  assert.deepEqual(rollLute(random, TEST_CONFIG), {
    baseType: 'lute',
    groups: { size: 'normal', color: 'none' },
    modifiers: ['holographic', 'negative', 'gilded'],
  });
});

test('random value just under 1 picks the last option and hits nothing', () => {
  const almostOne = 0.9999999;
  const random = sequenceRandom(Array(6).fill(almostOne));

  assert.deepEqual(rollLute(random, TEST_CONFIG), {
    baseType: 'theorbo',
    groups: { size: 'tiny', color: 'crimson' },
    modifiers: [],
  });
});

test('a value exactly on an option boundary goes to the next option', () => {
  // 0.55 is where lute ends and oud begins.
  const random = sequenceRandom([0.55, 0.5, 0.5, 0.5, 0.5, 0.5]);
  assert.equal(rollLute(random, TEST_CONFIG).baseType, 'oud');
});

test('a value exactly equal to a modifier chance is a miss', () => {
  // Holographic is 0.02; a hit needs a value strictly below it.
  const random = sequenceRandom([0.5, 0.5, 0.5, 0.02, 0.5, 0.5]);
  assert.deepEqual(rollLute(random, TEST_CONFIG).modifiers, []);
});
