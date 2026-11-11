import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextTabIndex } from '../src/tabs.js';

// Arrow keys move between tabs and wrap around, as in the WAI-ARIA tabs pattern.
test('right arrow moves to the next tab, wrapping at the end', () => {
  assert.equal(nextTabIndex('ArrowRight', 0, 2), 1);
  assert.equal(nextTabIndex('ArrowRight', 1, 2), 0);
});

test('left arrow moves to the previous tab, wrapping at the start', () => {
  assert.equal(nextTabIndex('ArrowLeft', 1, 2), 0);
  assert.equal(nextTabIndex('ArrowLeft', 0, 2), 1);
});

test('Home and End jump to the first and last tab', () => {
  assert.equal(nextTabIndex('Home', 1, 3), 0);
  assert.equal(nextTabIndex('End', 0, 3), 2);
});

test('other keys leave the tabs alone', () => {
  assert.equal(nextTabIndex(' ', 0, 2), null);
  assert.equal(nextTabIndex('Enter', 0, 2), null);
  assert.equal(nextTabIndex('ArrowDown', 0, 2), null);
});
