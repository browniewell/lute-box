import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyRecords, addPull, MAX_TROPHIES } from '../src/records.js';
import { TEST_CONFIG } from './fixtures.js';

// A pull as openBox returns it, with only the fields records use.
function pull(odds, { name = `Lute ${odds}`, tierId = 'common', roll } = {}) {
  return {
    name,
    tierId,
    tierName: tierId,
    tierColor: '#000',
    odds,
    roll: roll ?? { baseType: 'lute', groups: { size: 'normal', color: 'none' }, modifiers: [] },
  };
}

// Adds pulls one at a time, each a day after the last.
function addAll(pulls) {
  return pulls.reduce(
    (records, p, i) => addPull(records, p, new Date(Date.UTC(2026, 0, 1 + i)), TEST_CONFIG),
    emptyRecords(),
  );
}

test('the trophy case is sorted rarest first', () => {
  const records = addAll([pull(0.5), pull(0.01), pull(0.2)]);
  assert.deepEqual(records.trophies.map((t) => t.odds), [0.01, 0.2, 0.5]);
});

test('a trophy keeps what the case shows: name, sprite roll, tier, odds, date', () => {
  const roll = { baseType: 'oud', groups: { size: 'jumbo', color: 'none' }, modifiers: [] };
  const records = addAll([pull(0.016, { name: 'Jumbo Oud', tierId: 'rare', roll })]);
  assert.deepEqual(records.trophies[0], {
    name: 'Jumbo Oud',
    tierId: 'rare',
    tierName: 'rare',
    tierColor: '#000',
    odds: 0.016,
    roll,
    pulledAt: '2026-01-01T00:00:00.000Z',
  });
});

test('the case fills from the start, then keeps only the 10 rarest', () => {
  const odds = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.95, 0.01];
  const records = addAll(odds.map((o) => pull(o)));
  assert.equal(MAX_TROPHIES, 10);
  assert.equal(records.trophies.length, 10);
  // 0.95 never got in (it was the 11th), and 0.01 pushed 0.9 out.
  assert.deepEqual(
    records.trophies.map((t) => t.odds),
    [0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
  );
});

test('ties keep the earlier pull first, and a tie with #10 does not get in', () => {
  const full = addAll([
    pull(0.5, { name: 'first' }),
    ...Array.from({ length: 9 }, () => pull(0.1)),
    pull(0.5, { name: 'second' }),
  ]);
  assert.equal(full.trophies.length, 10);
  assert.equal(full.trophies[9].name, 'first');

  const twoTied = addAll([pull(0.3, { name: 'early' }), pull(0.3, { name: 'late' })]);
  assert.deepEqual(twoTied.trophies.map((t) => t.name), ['early', 'late']);
});

test('stats count boxes opened and pulls per tier', () => {
  const records = addAll([
    pull(0.9, { tierId: 'common' }),
    pull(0.8, { tierId: 'common' }),
    pull(0.01, { tierId: 'legendary' }),
  ]);
  assert.equal(records.opened, 3);
  assert.deepEqual(records.tierCounts, { common: 2, legendary: 1 });
});

test('the best pull ever is the rarest trophy', () => {
  const records = addAll([pull(0.5), pull(0.002, { name: 'Best' }), pull(0.3)]);
  assert.equal(records.trophies[0].name, 'Best');
});

test('the rarest modifier is the one with the lowest chance of its own', () => {
  const plain = addAll([pull(0.55)]);
  assert.equal(plain.rarestModifier, null);

  // Crimson (10%) then negative (3%) then holographic (2%) beats both.
  const records = addAll([
    pull(0.055, { roll: { baseType: 'lute', groups: { size: 'normal', color: 'crimson' }, modifiers: [] } }),
    pull(0.0165, { roll: { baseType: 'lute', groups: { size: 'normal', color: 'none' }, modifiers: ['negative'] } }),
    pull(0.011, { roll: { baseType: 'lute', groups: { size: 'normal', color: 'none' }, modifiers: ['holographic'] } }),
    pull(0.022, { roll: { baseType: 'lute', groups: { size: 'jumbo', color: 'none' }, modifiers: [] } }),
  ]);
  assert.deepEqual(records.rarestModifier, { id: 'holographic', name: 'Holographic', chance: 0.02 });
});

test('adding a pull leaves the old records unchanged', () => {
  const before = emptyRecords();
  addPull(before, pull(0.1), new Date(), TEST_CONFIG);
  assert.deepEqual(before, emptyRecords());
});
