// The sound sting for each tier, as plain note data, so it's tested in
// Node. play-sound.js plays it with the Web Audio API: every sound is
// generated in code, with no audio files.
//
// These are earcons: short, soft UI sounds, not music. Common plays on
// most pulls, so it's two quiet, rounded notes that stay out of the way.
// Each rarer tier adds a note and a little volume. Epic and Legendary end
// on a chord that swells in gently rather than being struck. Mythic is the
// big one: a two-octave run, a deeper chord and a high twinkle on top.

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
  C3: 130.81, C4: 261.63, G4: 392,
  C5: 523.25, E5: 659.25, G5: 783.99, A5: 880,
  C6: 1046.5, E6: 1318.51, G6: 1567.98, C7: 2093,
};

const STEP_MS = 80; // Gap between notes in a run.
const ROLL_MS = 60; // Gap between chord notes, low to high: a gentle roll.
const NOTE_ATTACK_MS = 6; // Fast enough to sound like a tap, slow enough not to click.
const CHORD_ATTACK_MS = 60; // Chord notes bloom in instead of hitting.
const CHORD_VOLUME = 0.35; // Each chord note. Several overlap, so keep them low.
const TWINKLE_STEP_MS = 90; // Gap between twinkle notes.
const TWINKLE_DELAY_MS = 400; // Twinkle starts this long after the chord.
const TWINKLE_VOLUME = 0.2; // High notes cut through, so keep them quiet.

// A rising run of soft notes, then (optionally) a chord that swells in,
// and (optionally) a few quick high notes twinkling over the chord.
function sting({ run, noteMs, volume, chord = [], chordMs = 0, twinkle = [] }) {
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
  twinkle.forEach((pitch, i) => {
    notes.push({
      frequency: PITCH[pitch], startMs: chordStart + TWINKLE_DELAY_MS + i * TWINKLE_STEP_MS,
      lengthMs: 350, volume: TWINKLE_VOLUME, attackMs: NOTE_ATTACK_MS,
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
  // Each sound moved up one tier per Ryan (#20), and mythic got a new one.
  common: sting({ run: ['C5', 'G5'], noteMs: 260, volume: 0.45 }),
  uncommon: sting({ run: ['C5', 'E5', 'G5'], noteMs: 300, volume: 0.55 }),
  rare: sting({ run: ['C5', 'E5', 'G5', 'C6'], noteMs: 360, volume: 0.65 }),
  epic: sting({
    run: ['C5', 'E5', 'G5', 'C6'], noteMs: 360, volume: 0.7,
    chord: ['C4', 'G4', 'C5', 'E5'], chordMs: 900,
  }),
  legendary: sting({
    run: ['C5', 'E5', 'G5', 'A5', 'C6'], noteMs: 400, volume: 0.75,
    chord: ['C4', 'G4', 'C5', 'E5', 'G5', 'C6'], chordMs: 1200,
  }),
  mythic: sting({
    run: ['C5', 'E5', 'G5', 'A5', 'C6', 'E6'], noteMs: 400, volume: 0.8,
    chord: ['C3', 'C4', 'G4', 'C5', 'E5', 'G5', 'C6'], chordMs: 1800,
    twinkle: ['E6', 'G6', 'C7'],
  }),
};

/** @param {Note[]} notes @returns {number} When the last note ends, in ms. */
export function stingLength(notes) {
  return Math.max(...notes.map((note) => note.startMs + note.lengthMs));
}
