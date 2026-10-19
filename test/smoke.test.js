// Proves the test runner works and that Node can import the same
// ES modules the browser loads from src/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GAME_TITLE } from '../src/game-title.js';

test('game title is importable from src', () => {
  assert.equal(GAME_TITLE, 'Lute Box');
});
