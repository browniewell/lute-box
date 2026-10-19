import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeededRandom } from '../src/random.js';

test('same seed gives the same sequence', () => {
  const a = createSeededRandom(42);
  const b = createSeededRandom(42);
  for (let i = 0; i < 100; i++) {
    assert.equal(a(), b());
  }
});

test('different seeds give different sequences', () => {
  const a = createSeededRandom(1);
  const b = createSeededRandom(2);
  assert.notEqual(a(), b());
});

test('values are in [0, 1)', () => {
  const random = createSeededRandom(7);
  for (let i = 0; i < 10000; i++) {
    const value = random();
    assert.ok(value >= 0 && value < 1, `out of range: ${value}`);
  }
});
