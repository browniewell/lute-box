// The sound sting for each tier, as plain note data, so it's tested in
// Node. play-sound.js plays it with the Web Audio API: every sound is
// generated in code, with no audio files.
//
// These are earcons: short, soft UI sounds, not music. Common plays on
// most pulls, so it's one quiet, rounded note that stays out of the way.
// Each rarer tier adds a note and a little volume. Only the two rarest
// end on a strummed lute chord, as a reward.

/**
 * @typedef {object} Note
 * @property {number} frequency Hz.
 * @property {number} startMs From the start of the sting.
 * @property {number} lengthMs How long it rings before fading out.
 * @property {number} volume 0 to 1.
 * @property {'soft' | 'string'} tone soft: a rounded mallet tone.
 *   string: a plucked lute string (synth.js).
 */

// C major pentatonic, so any of these sound fine together.
const PITCH = {
  C3: 130.81, C4: 261.63, G4: 392,
  C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5,
};

const STEP_MS = 80; // Gap between notes in a run.
const STRUM_MS = 35; // Gap between strings in a strummed chord.

// A rising run of soft notes, then (optionally) a chord strummed low to
// high on lute strings.
function sting({ run, noteMs, volume, chord = [], chordMs = 0 }) {
  const notes = run.map((pitch, i) => ({
    frequency: PITCH[pitch], startMs: i * STEP_MS, lengthMs: noteMs, volume, tone: 'soft',
  }));
  const chordStart = run.length * STEP_MS;
  chord.forEach((pitch, i) => {
    notes.push({
      frequency: PITCH[pitch], startMs: chordStart + i * STRUM_MS, lengthMs: chordMs, volume: 0.6, tone: 'string',
    });
  });
  return notes;
}

/**
 * Tier id -> notes. Like the visual effects, stings only grow from one
 * tier to the next rarer one (the tests check).
 *
 * @type {Record<string, Note[]>}
 */
export const TIER_STINGS = {
  common: sting({ run: ['E5'], noteMs: 220, volume: 0.35 }),
  uncommon: sting({ run: ['C5', 'G5'], noteMs: 260, volume: 0.45 }),
  rare: sting({ run: ['C5', 'E5', 'G5'], noteMs: 300, volume: 0.55 }),
  epic: sting({ run: ['C5', 'E5', 'G5', 'C6'], noteMs: 360, volume: 0.65 }),
  legendary: sting({
    run: ['C5', 'E5', 'G5', 'C6'], noteMs: 360, volume: 0.7,
    chord: ['C3', 'G4', 'C5', 'E5', 'G5'], chordMs: 900,
  }),
  mythic: sting({
    run: ['C5', 'E5', 'G5', 'A5', 'C6'], noteMs: 400, volume: 0.75,
    chord: ['C3', 'C4', 'G4', 'C5', 'E5', 'G5', 'C6'], chordMs: 1200,
  }),
};

/** @param {Note[]} notes @returns {number} When the last note ends, in ms. */
export function stingLength(notes) {
  return Math.max(...notes.map((note) => note.startMs + note.lengthMs));
}
