// Saves and loads records in browser storage. Every access is wrapped:
// storage can be turned off, full, or hold data a person edited by hand,
// and none of that should stop the game. It just plays without saving.
import { emptyRecords } from './records.js';

export const STORAGE_KEY = 'lute-box:records';

/**
 * @typedef {Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>} StorageLike
 */

/**
 * @param {() => StorageLike} getStorage `() => window.localStorage`. A
 *   function, because even reading window.localStorage can throw.
 * @returns {{
 *   records: import('./records.js').Records,
 *   storage: StorageLike | null,
 *   problem: null | 'unavailable' | 'corrupt',
 * }}
 *   storage is null when it can't be used at all. On 'corrupt' it still
 *   works, and the next save replaces the bad data.
 */
export function loadRecords(getStorage) {
  let storage;
  let text;
  try {
    storage = getStorage();
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { records: emptyRecords(), storage: null, problem: 'unavailable' };
  }
  if (text === null) {
    return { records: emptyRecords(), storage, problem: null };
  }

  let records;
  try {
    records = JSON.parse(text);
  } catch {
    records = null;
  }
  if (!isValidRecords(records)) {
    return { records: emptyRecords(), storage, problem: 'corrupt' };
  }
  return { records, storage, problem: null };
}

/** @returns {boolean} Whether it saved. */
export function saveRecords(storage, records) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

/** @returns {boolean} Whether it cleared. */
export function clearRecords(storage) {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

// Checks the shape well enough that the page can show it without crashing.
function isValidRecords(r) {
  return (
    isObject(r) &&
    r.version === 1 &&
    isCount(r.opened) &&
    isObject(r.tierCounts) &&
    Object.values(r.tierCounts).every(isCount) &&
    Array.isArray(r.trophies) &&
    r.trophies.every(isValidTrophy) &&
    (r.rarestModifier === null ||
      (isObject(r.rarestModifier) &&
        typeof r.rarestModifier.name === 'string' &&
        isOdds(r.rarestModifier.chance)))
  );
}

function isValidTrophy(t) {
  return (
    isObject(t) &&
    ['name', 'tierId', 'tierName', 'tierColor', 'pulledAt'].every((key) => typeof t[key] === 'string') &&
    isOdds(t.odds) &&
    isObject(t.roll) &&
    typeof t.roll.baseType === 'string' &&
    isObject(t.roll.groups) &&
    Array.isArray(t.roll.modifiers)
  );
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isOdds(value) {
  return typeof value === 'number' && value > 0 && value <= 1;
}
