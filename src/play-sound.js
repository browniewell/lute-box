// Plays stings from sounds.js with the Web Audio API. Browser only.
// If the browser has no Web Audio, or blocks it, the game stays silent.

const VOLUME = 0.15; // Quiet: a sting shouldn't startle anyone.

/** @type {AudioContext | undefined} */
let context;

/**
 * Creates or wakes the audio context. Browsers (iOS Safari above all) only
 * allow that during a click or keypress, so call this straight from the
 * event handler, before any await.
 */
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') context.resume();
  } catch {
    context = undefined;
  }
}

/** @param {import('./sounds.js').Note[]} notes */
export function playSting(notes) {
  if (!context) return;
  try {
    const output = context.createGain();
    output.gain.value = VOLUME;
    output.connect(context.destination);

    const start = context.currentTime + 0.02;
    for (const note of notes) {
      pluck(output, note, start + note.startMs / 1000);
    }
  } catch {
    // Sound is a nice extra; never let it break a reveal.
  }
}

// One note: a triangle wave that starts sharp and fades out, roughly like
// a plucked string.
function pluck(output, { frequency, lengthMs }, at) {
  const end = at + lengthMs / 1000;
  const oscillator = context.createOscillator();
  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;

  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(1, at + 0.005);
  envelope.gain.exponentialRampToValueAtTime(0.001, end);

  oscillator.connect(envelope).connect(output);
  oscillator.start(at);
  oscillator.stop(end + 0.05);
}
