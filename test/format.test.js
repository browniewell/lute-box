import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatOdds, formatPercent } from '../src/format.js';

test('odds show as "1 in N" with thousands separators', () => {
  assert.equal(formatOdds(0.00004), '1 in 25,000');
  assert.equal(formatOdds(1 / 1234567.4), '1 in 1,234,567');
});

test('odds round N to the nearest whole number', () => {
  assert.equal(formatOdds(0.35), '1 in 3'); // 1 / 0.35 = 2.857...
  assert.equal(formatOdds(1), '1 in 1');
});

test('percent keeps three significant digits', () => {
  assert.equal(formatPercent(0.35), '35%');
  assert.equal(formatPercent(1 / 3), '33.3%');
  assert.equal(formatPercent(0.00004), '0.004%');
});

test('very small percents stay readable, not scientific notation', () => {
  assert.equal(formatPercent(1e-12), '0.0000000001%');
});
