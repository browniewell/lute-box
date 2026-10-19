import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lootName } from '../src/names.js';
import { TEST_CONFIG } from './fixtures.js';

test('a lute with no modifiers is just its base name', () => {
  const roll = { baseType: 'theorbo', groups: { size: 'normal', color: 'none' }, modifiers: [] };
  assert.equal(lootName(roll, TEST_CONFIG), 'Theorbo');
});

test('prefixes go from most common to most rare', () => {
  // Chances: crimson 10%, jumbo 4%, negative 3%, holographic 2%.
  // Holographic comes before negative in config order, but negative is
  // more common, so it goes first.
  const roll = {
    baseType: 'theorbo',
    groups: { size: 'jumbo', color: 'crimson' },
    modifiers: ['holographic', 'negative'],
  };
  assert.equal(lootName(roll, TEST_CONFIG), 'Crimson Jumbo Negative Holographic Theorbo');
});

test('default group options never appear in the name', () => {
  const roll = { baseType: 'lute', groups: { size: 'normal', color: 'none' }, modifiers: ['gilded'] };
  assert.equal(lootName(roll, TEST_CONFIG), 'Gilded Lute');
});
