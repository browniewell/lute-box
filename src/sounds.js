// The sound sting for each tier, as plain note data, so it's tested in
// Node. play-sound.js plays it with the Web Audio API: every sound is
// generated in code, with no audio files.

/**
 * @typedef {object} Note
 * @property {number} frequency Hz.
 * @property {number} startMs From the start of the sting.
 * @property {number} lengthMs How long it rings before fading out.
 */

// C major pentatonic, so any of these sound fine together.
const PITCH = {
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880,
  C6: 1046.5, E6: 1318.51, G6: 1567.98, C7: 2093,
};

const STEP_MS = 90; // Gap between notes in a run.
const PLUCK_MS = 250; // How long each note in a run rings.

// A rising run of plucked notes, then (optionally) a held chord.
function sting(run, chord = [], chordMs = 0) {
  const notes = run.map((pitch, i) => ({ frequency: PITCH[pitch], startMs: i * STEP_MS, lengthMs: PLUCK_MS }));
  const chordStart = run.length * STEP_MS;
  for (const pitch of chord) {
    notes.push({ frequency: PITCH[pitch], startMs: chordStart, lengthMs: chordMs });
  }
  return notes;
}

/**
 * Tier id -> notes. Like the visual effects, stings only grow from one
 * tier to the next rarer one (the tests check).
 *
 * @type {Record<string, Note[]>}
 */
export const TIER_STINGS = {
  common: sting(['C5']),
  uncommon: sting(['C5', 'E5']),
  rare: sting(['C5', 'E5', 'G5']),
  epic: sting(['C5', 'E5', 'G5', 'C6']),
  legendary: sting(['C5', 'E5', 'G5', 'C6'], ['C6', 'E6', 'G6'], 800),
  mythic: sting(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'], ['C6', 'E6', 'G6', 'C7'], 1200),
};

/** @param {Note[]} notes @returns {number} When the last note ends, in ms. */
export function stingLength(notes) {
  return Math.max(...notes.map((note) => note.startMs + note.lengthMs));
}
