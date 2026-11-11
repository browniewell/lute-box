// The sound sting for each tier, as plain note data, so it's tested in
// Node. play-sound.js plays it with the Web Audio API: every sound is
// generated in code, with no audio files.
//
// These are earcons: short, soft UI sounds, not music. Common plays on
// most pulls, so it's one quiet, rounded note that stays out of the way.
// Each rarer tier adds a note and a little volume. The two rarest end on
// a chord that swells in gently, as a reward, rather than being struck.

/**
 * @typedef {object} Note
 * @property {number} frequency Hz.
 * @property {number} startMs From the start of the sting.
 * @property {number} lengthMs How long it rings before fading out.
 * @property {number} volume 0 to 1.
 * @property {number} attackMs How long it takes to reach full volume.
 *   Short (a soft "tok") for melody notes, longer (a swell) for chords.
 */

// C major pentatonic, so any of these sound fine together.
const PITCH = {
  C4: 261.63, G4: 392,
  C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5,
};

const STEP_MS = 80; // Gap between notes in a run.
const ROLL_MS = 60; // Gap between chord notes, low to high: a gentle roll.
const NOTE_ATTACK_MS = 6; // Fast enough to sound like a tap, slow enough not to click.
const CHORD_ATTACK_MS = 60; // Chord notes bloom in instead of hitting.
const CHORD_VOLUME = 0.35; // Each chord note. Several overlap, so keep them low.

// A rising run of soft notes, then (optionally) a chord that swells in.
function sting({ run, noteMs, volume, chord = [], chordMs = 0 }) {
  const notes = run.map((pitch, i) => ({
    frequency: PITCH[pitch], startMs: i * STEP_MS, lengthMs: noteMs, volume, attackMs: NOTE_ATTACK_MS,
  }));
  const chordStart = run.length * STEP_MS;
  chord.forEach((pitch, i) => {
    notes.push({
      frequency: PITCH[pitch], startMs: chordStart + i * ROLL_MS, lengthMs: chordMs,
      volume: CHORD_VOLUME, attackMs: CHORD_ATTACK_MS,
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
    chord: ['C4', 'G4', 'C5', 'E5'], chordMs: 900,
  }),
  mythic: sting({
    run: ['C5', 'E5', 'G5', 'A5', 'C6'], noteMs: 400, volume: 0.75,
    chord: ['C4', 'G4', 'C5', 'E5', 'G5', 'C6'], chordMs: 1200,
  }),
};

/** @param {Note[]} notes @returns {number} When the last note ends, in ms. */
export function stingLength(notes) {
  return Math.max(...notes.map((note) => note.startMs + note.lengthMs));
}
