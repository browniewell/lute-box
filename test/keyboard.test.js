import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSpaceToOpen } from '../src/keyboard.js';

// Stand-ins for KeyboardEvent and the page: only the fields isSpaceToOpen reads.
const openButton = { tagName: 'BUTTON' };

function keydown(key, target = { tagName: 'BODY' }, extra = {}) {
  return { key, target, repeat: false, ...extra };
}

test('space on the page opens a box', () => {
  assert.equal(isSpaceToOpen(openButton, keydown(' ')), true);
});

test('space on the Open button opens a box', () => {
  assert.equal(isSpaceToOpen(openButton, keydown(' ', openButton)), true);
});

test('other keys do nothing', () => {
  assert.equal(isSpaceToOpen(openButton, keydown('Enter')), false);
  assert.equal(isSpaceToOpen(openButton, keydown('a')), false);
});

test('space while typing in a form field does nothing', () => {
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    assert.equal(isSpaceToOpen(openButton, keydown(' ', { tagName })), false, tagName);
  }
  assert.equal(isSpaceToOpen(openButton, keydown(' ', { tagName: 'DIV', isContentEditable: true })), false);
});

test('holding space down does not keep opening boxes', () => {
  assert.equal(isSpaceToOpen(openButton, keydown(' ', undefined, { repeat: true })), false);
});

test('space on another button presses that button instead of opening a box', () => {
  // e.g. the Sound toggle or Reset: keyboard users need Space to work on them.
  for (const tagName of ['BUTTON', 'A', 'SUMMARY']) {
    assert.equal(isSpaceToOpen(openButton, keydown(' ', { tagName })), false, tagName);
  }
});
