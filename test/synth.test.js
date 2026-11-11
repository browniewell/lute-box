import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pluckSamples, reverbImpulse } from '../src/synth.js';
import { createSeededRandom } from '../src/random.js';

const RATE = 48000;

function loudness(samples, from, to) {
  let sum = 0;
  for (let i = from; i < to; i++) sum += samples[i] ** 2;
  return Math.sqrt(sum / (to - from));
}

// The lag (in samples) where the signal best matches a shifted copy of
// itself: one period of the note.
function period(samples, minLag, maxLag) {
  let best = minLag;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let score = 0;
    for (let i = 0; i < 4000; i++) score += samples[i] * samples[i + lag];
    if (score > bestScore) [best, bestScore] = [lag, score];
  }
  return best;
}

test('a pluck lasts as long as asked and stays within -1..1', () => {
  const samples = pluckSamples(440, RATE, 500, createSeededRandom(1));
  assert.equal(samples.length, RATE / 2);
  assert.ok(samples.every((s) => s >= -1 && s <= 1));
  assert.ok(loudness(samples, 0, 2000) > 0.1, 'audible at the start');
});

test('a pluck rings at its note', () => {
  for (const frequency of [261.63, 523.25, 2093]) {
    const samples = pluckSamples(frequency, RATE, 300, createSeededRandom(2));
    const expected = RATE / frequency;
    const found = period(samples, Math.floor(expected * 0.8), Math.ceil(expected * 1.2));
    // Within 2%, about a third of a semitone.
    assert.ok(Math.abs(found - expected) / expected < 0.02, `${frequency} Hz: period ${found}, expected ${expected}`);
  }
});

test('a pluck fades out to silence by its end', () => {
  const samples = pluckSamples(523.25, RATE, 400, createSeededRandom(3));
  const n = samples.length;
  assert.ok(loudness(samples, n - 500, n) < loudness(samples, 0, 2000) / 50);
  assert.equal(Math.abs(samples[n - 1]), 0); // abs: it may be -0.
});

test('reverb is two channels that start loud and die away', () => {
  const [left, right] = reverbImpulse(RATE, 1500, createSeededRandom(4));
  assert.equal(left.length, RATE * 1.5);
  assert.equal(right.length, left.length);
  assert.notDeepEqual(left.slice(0, 100), right.slice(0, 100), 'different, for width');
  assert.ok(loudness(left, left.length - 2000, left.length) < loudness(left, 0, 2000) / 50);
});
