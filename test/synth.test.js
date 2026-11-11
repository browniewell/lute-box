import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reverbImpulse } from '../src/synth.js';
import { createSeededRandom } from '../src/random.js';

const RATE = 48000;

function loudness(samples, from, to) {
  let sum = 0;
  for (let i = from; i < to; i++) sum += samples[i] ** 2;
  return Math.sqrt(sum / (to - from));
}

test('reverb is two channels that start loud and die away', () => {
  const [left, right] = reverbImpulse(RATE, 1500, createSeededRandom(4));
  assert.equal(left.length, RATE * 1.5);
  assert.equal(right.length, left.length);
  assert.notDeepEqual(left.slice(0, 100), right.slice(0, 100), 'different, for width');
  assert.ok(loudness(left, left.length - 2000, left.length) < loudness(left, 0, 2000) / 50);
});
