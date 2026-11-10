import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSpaceToOpen } from '../src/keyboard.js';

// Stand-ins for KeyboardEvent: only the fields isSpaceToOpen reads.
function keydown(key, target = { tagName: 'BODY' }, extra = {}) {
  return { key, target, repeat: false, ...extra };
}

test('space on the page opens a box', () => {
  assert.equal(isSpaceToOpen(keydown(' ')), true);
});

test('space on the Open button opens a box', () => {
  assert.equal(isSpaceToOpen(keydown(' ', { tagName: 'BUTTON' })), true);
});

test('other keys do nothing', () => {
  assert.equal(isSpaceToOpen(keydown('Enter')), false);
  assert.equal(isSpaceToOpen(keydown('a')), false);
});

test('space while typing in a form field does nothing', () => {
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    assert.equal(isSpaceToOpen(keydown(' ', { tagName })), false, tagName);
  }
  assert.equal(isSpaceToOpen(keydown(' ', { tagName: 'DIV', isContentEditable: true })), false);
});

test('holding space down does not keep opening boxes', () => {
  assert.equal(isSpaceToOpen(keydown(' ', undefined, { repeat: true })), false);
});
