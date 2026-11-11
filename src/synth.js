// Generates the raw sound for stings, as arrays of samples. Pure math, so
// it runs in Node tests; play-sound.js hands the samples to Web Audio.

/**
 * One plucked string, made with the Karplus-Strong method: a short burst
 * of noise goes round a loop one note-period long, and a little gets
 * smoothed away on each trip. What's left rings at the note's pitch and
 * mellows as it fades, much like a real string.
 *
 * @param {number} frequency Hz.
 * @param {number} sampleRate e.g. 48000.
 * @param {number} lengthMs The pluck fades to silence by this point.
 * @param {() => number} random Math.random, or a seeded one in tests.
 * @returns {Float32Array} Samples from -1 to 1.
 */
export function pluckSamples(frequency, sampleRate, lengthMs, random) {
  const out = new Float32Array(Math.round((sampleRate * lengthMs) / 1000));

  // The loop's total delay sets the pitch. The smoothing step adds half a
  // sample, so the buffer is a bit shorter than one period, and an allpass
  // filter adds the leftover fraction so high notes stay in tune.
  let length = Math.floor(sampleRate / frequency - 0.5);
  let fraction = sampleRate / frequency - 0.5 - length;
  if (fraction < 0.1) [length, fraction] = [length - 1, fraction + 1];
  const allpass = (1 - fraction) / (1 + fraction);

  const loop = noiseBurst(length, random);
  const LOSS = 0.998; // Per trip round the loop. Lower = shorter ring.
  let index = 0;
  let previous = 0;
  let allpassIn = 0;
  let allpassOut = 0;
  for (let i = 0; i < out.length; i++) {
    const sample = loop[index];
    out[i] = sample;
    const smoothed = LOSS * 0.5 * (sample + previous);
    previous = sample;
    allpassOut = allpass * smoothed + allpassIn - allpass * allpassOut;
    allpassIn = smoothed;
    loop[index] = allpassOut;
    index = (index + 1) % length;
  }

  normalize(out, 0.9);
  fadeOut(out, 0.3);
  return out;
}

/**
 * A room's echo, for a ConvolverNode: decaying noise, different in each
 * ear so the sound feels wide. Dies away by about 60 dB at the end.
 *
 * @param {number} sampleRate
 * @param {number} lengthMs
 * @param {() => number} random
 * @returns {[Float32Array, Float32Array]} Left and right channels.
 */
export function reverbImpulse(sampleRate, lengthMs, random) {
  const length = Math.round((sampleRate * lengthMs) / 1000);
  const channel = () => {
    const samples = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      samples[i] = (random() * 2 - 1) * Math.exp((-6.9 * i) / length);
    }
    return samples;
  };
  return [channel(), channel()];
}

// White noise smoothed a few times, like plucking with the soft of a
// finger rather than a pick: raw noise sounds bright and scratchy. Any DC
// offset is removed so the string doesn't start off-center.
const PICK_SOFTNESS = 4; // Smoothing passes. More = darker, gentler pluck.

function noiseBurst(length, random) {
  let burst = Float32Array.from({ length }, () => random() * 2 - 1);
  for (let pass = 0; pass < PICK_SOFTNESS; pass++) {
    burst = burst.map((s, i) => 0.5 * (s + burst[(i + 1) % length]));
  }
  const mean = burst.reduce((sum, s) => sum + s, 0) / length;
  return burst.map((s) => s - mean);
}

function normalize(samples, peak) {
  const loudest = samples.reduce((max, s) => Math.max(max, Math.abs(s)), 0);
  if (loudest > 0) {
    for (let i = 0; i < samples.length; i++) samples[i] *= peak / loudest;
  }
}

// Fades the last `share` of the samples to exactly 0, on a curve so the
// tail is quiet well before the end (no click when it stops).
function fadeOut(samples, share) {
  const fadeLength = Math.round(samples.length * share);
  const start = samples.length - fadeLength;
  for (let i = start; i < samples.length; i++) {
    samples[i] *= ((samples.length - 1 - i) / fadeLength) ** 3;
  }
}
