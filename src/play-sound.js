// Plays stings from sounds.js with the Web Audio API. Browser only.
// If the browser has no Web Audio, or blocks it, the game stays silent.
//
// Signal path for every note:
//   soft tone -> pan -> mix -> dry + reverb -> compressor -> speakers
import { reverbImpulse } from './synth.js';

const VOLUME = 0.6; // Overall level. Each note's own volume scales from here.
const REVERB_MIX = 0.18; // How much room to add. 0 is dry.

/** @type {AudioContext | undefined} */
let context;
/** @type {AudioNode | undefined} */
let mix;

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

// A rounded mallet tone: a pure sine with a faint octave on top that fades
// fast, giving a gentle "tok" and nothing sharp. Melody notes spread a
// little, lower ones left and higher ones right, centered between C5 and
// C6; bass notes stay in the middle.
function playNote({ frequency, lengthMs, volume, attackMs }, at) {
  const pan = context.createStereoPanner();
  pan.pan.value = frequency < 500 ? 0 : Math.max(-0.5, Math.min(0.5, Math.log2(frequency / 740) * 0.25));
  pan.connect(mix);

  const peak = at + attackMs / 1000;
  const end = at + lengthMs / 1000;
  for (const [multiple, level, fadeEnd] of [[1, 1, end], [2, 0.15, peak + 0.06]]) {
    const oscillator = context.createOscillator();
    oscillator.frequency.value = frequency * multiple;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(volume * level, peak);
    envelope.gain.exponentialRampToValueAtTime(0.0001, fadeEnd);
    oscillator.connect(envelope).connect(pan);
    oscillator.start(at);
    oscillator.stop(end + 0.05);
  }
}

// Notes go into the returned node. It splits into a dry path and a reverb
// path, and both meet at a compressor so chords don't clip.
function buildMix(ctx) {
  const input = ctx.createGain();

  const reverb = ctx.createConvolver();
  const [left, right] = reverbImpulse(ctx.sampleRate, 1200, Math.random);
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
