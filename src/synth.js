// The reverb's "room", generated as samples. Pure math, so it runs in
// Node tests; play-sound.js hands it to a Web Audio ConvolverNode.

/**
 * Decaying noise, different in each ear so the sound feels wide. Dies
 * away by about 60 dB at the end.
 *
 * @param {number} sampleRate
 * @param {number} lengthMs
 * @param {() => number} random Math.random, or a seeded one in tests.
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
