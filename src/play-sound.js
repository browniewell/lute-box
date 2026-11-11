// Plays stings from sounds.js with the Web Audio API. Browser only.
// If the browser has no Web Audio, or blocks it, the game stays silent.
//
// Signal path for every note:
//   two plucked strings (synth.js) -> pan -> mix -> dry + reverb -> compressor -> speakers
import { pluckSamples, reverbImpulse } from './synth.js';

const VOLUME = 0.65; // The compressor evens out loud chords, so this can sit higher.
const REVERB_MIX = 0.3; // How much room to add. 0 is dry.
// Lutes have paired strings for each note, tuned a hair apart. The slow
// beating between the two is a big part of the lute's warm sound.
const PAIR_DETUNE = 1.0025; // About 4 cents sharp.

/** @type {AudioContext | undefined} */
let context;
/** @type {AudioNode | undefined} */
let mix;
// Rendering a pluck takes a few ms, so each one is made once and reused.
const plucks = new Map();

/**
 * Creates or wakes the audio context. Browsers (iOS Safari above all) only
 * allow that during a click or keypress, so call this straight from the
 * event handler, before any await.
 */
export function unlockAudio() {
  try {
    if (!context) {
      context = new AudioContext();
      mix = buildMix(context);
    }
    if (context.state === 'suspended') context.resume();
  } catch {
    context = undefined;
  }
}

/** @param {import('./sounds.js').Note[]} notes */
export function playSting(notes) {
  if (!context) return;
  try {
    const start = context.currentTime + 0.02;
    for (const note of notes) {
      playNote(note, start + note.startMs / 1000);
    }
  } catch {
    // Sound is a nice extra; never let it break a reveal.
  }
}

function playNote({ frequency, lengthMs, volume = 1 }, at) {
  // Melody notes spread a little, lower ones left and higher ones right,
  // centered between C5 and C6. Bass notes stay in the middle.
  const pan = context.createStereoPanner();
  pan.pan.value = frequency < 500 ? 0 : Math.max(-0.5, Math.min(0.5, Math.log2(frequency / 740) * 0.25));
  const gain = context.createGain();
  gain.gain.value = volume * 0.5; // Two strings per note.
  gain.connect(pan).connect(mix);

  for (const [string, rate] of [[0, 1], [1, PAIR_DETUNE]]) {
    const source = context.createBufferSource();
    source.buffer = pluckBuffer(frequency, lengthMs, string);
    source.playbackRate.value = rate;
    source.connect(gain);
    source.start(at);
  }
}

// `string` picks one of the pair: each has its own noise burst, so the two
// don't sound like one note copied.
function pluckBuffer(frequency, lengthMs, string) {
  const key = `${frequency}/${lengthMs}/${string}`;
  if (!plucks.has(key)) {
    const samples = pluckSamples(frequency, context.sampleRate, lengthMs, Math.random);
    const buffer = context.createBuffer(1, samples.length, context.sampleRate);
    buffer.copyToChannel(samples, 0);
    plucks.set(key, buffer);
  }
  return plucks.get(key);
}

// Notes go into the returned node. It splits into a dry path and a reverb
// path, and both meet at a compressor so big chords don't clip.
function buildMix(ctx) {
  const input = ctx.createGain();

  const reverb = ctx.createConvolver();
  const [left, right] = reverbImpulse(ctx.sampleRate, 1800, Math.random);
  const impulse = ctx.createBuffer(2, left.length, ctx.sampleRate);
  impulse.copyToChannel(left, 0);
  impulse.copyToChannel(right, 1);
  reverb.buffer = impulse;

  const dry = ctx.createGain();
  dry.gain.value = 1 - REVERB_MIX;
  const wet = ctx.createGain();
  wet.gain.value = REVERB_MIX;

  const compressor = ctx.createDynamicsCompressor();
  const output = ctx.createGain();
  output.gain.value = VOLUME;

  input.connect(dry).connect(compressor);
  input.connect(reverb).connect(wet).connect(compressor);
  compressor.connect(output).connect(ctx.destination);
  return input;
}
