import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadRecords, saveRecords, clearRecords, STORAGE_KEY } from '../src/storage.js';
import { emptyRecords, addPull } from '../src/records.js';
import { TEST_CONFIG } from './fixtures.js';

// Same methods as window.localStorage, kept in a Map.
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    data,
  };
}

function throwing() {
  throw new Error('SecurityError: storage is disabled');
}

const sampleRecords = addPull(
  emptyRecords(),
  {
    name: 'Lute', tierId: 'common', tierName: 'Common', tierColor: '#9d9d9d', odds: 0.55,
    roll: { baseType: 'lute', groups: { size: 'normal', color: 'none' }, modifiers: [] },
  },
  new Date(Date.UTC(2026, 0, 1)),
  TEST_CONFIG,
);

test('saved records load back the same', () => {
  const storage = fakeStorage();
  assert.equal(saveRecords(storage, sampleRecords), true);
  const loaded = loadRecords(() => storage);
  assert.deepEqual(loaded.records, sampleRecords);
  assert.equal(loaded.problem, null);
});

test('nothing saved yet starts empty with no problem', () => {
  const loaded = loadRecords(() => fakeStorage());
  assert.deepEqual(loaded.records, emptyRecords());
  assert.equal(loaded.problem, null);
});

test('storage that throws on access starts empty and says it is unavailable', () => {
  const loaded = loadRecords(throwing);
  assert.deepEqual(loaded.records, emptyRecords());
  assert.equal(loaded.storage, null);
  assert.equal(loaded.problem, 'unavailable');
});

test('storage that throws on read starts empty and says it is unavailable', () => {
  const loaded = loadRecords(() => ({ ...fakeStorage(), getItem: throwing }));
  assert.deepEqual(loaded.records, emptyRecords());
  assert.equal(loaded.problem, 'unavailable');
});

for (const [label, text] of [
  ['not JSON', '{oops'],
  ['JSON but not an object', '42'],
  ['a different version', JSON.stringify({ ...sampleRecords, version: 99 })],
  ['a negative count', JSON.stringify({ ...sampleRecords, opened: -1 })],
  ['a trophy with no odds', JSON.stringify({ ...sampleRecords, trophies: [{ name: 'x' }] })],
  ['trophies that are not a list', JSON.stringify({ ...sampleRecords, trophies: 'x' })],
]) {
  test(`corrupt saved data (${label}) starts empty and says so`, () => {
    const loaded = loadRecords(() => fakeStorage({ [STORAGE_KEY]: text }));
    assert.deepEqual(loaded.records, emptyRecords());
    assert.equal(loaded.problem, 'corrupt');
    // Storage itself works, so the next pull saves over the bad data.
    assert.notEqual(loaded.storage, null);
  });
}

test('a failed save (e.g. storage full) returns false instead of throwing', () => {
  const storage = { ...fakeStorage(), setItem: throwing };
  assert.equal(saveRecords(storage, sampleRecords), false);
  assert.equal(saveRecords(null, sampleRecords), false);
});

test('clearing removes the saved records, and never throws', () => {
  const storage = fakeStorage();
  saveRecords(storage, sampleRecords);
  assert.equal(clearRecords(storage), true);
  assert.equal(storage.data.has(STORAGE_KEY), false);
  assert.equal(clearRecords({ removeItem: throwing }), false);
  assert.equal(clearRecords(null), false);
});
