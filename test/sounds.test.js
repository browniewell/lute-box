import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIER_STINGS, stingLength } from '../src/sounds.js';
import { CONFIG } from '../src/config.js';

// Real config on purpose: a new tier without a sting should fail here.
test('every tier in the config has a sting', () => {
  for (const tier of CONFIG.tiers) {
    assert.ok(TIER_STINGS[tier.id]?.length, `no sting for tier "${tier.id}"`);
  }
});

test('stings never get smaller as tiers get rarer', () => {
  const stings = CONFIG.tiers.map((tier) => TIER_STINGS[tier.id]);
  for (let i = 1; i < stings.length; i++) {
    const label = `${CONFIG.tiers[i - 1].id} -> ${CONFIG.tiers[i].id}`;
    assert.ok(stings[i].length >= stings[i - 1].length, `notes, ${label}`);
    assert.ok(stingLength(stings[i]) >= stingLength(stings[i - 1]), `length, ${label}`);
    assert.ok(loudest(stings[i]) >= loudest(stings[i - 1]), `volume, ${label}`);
  }
});

// Players hear the common sting on most pulls, so it has to stay out of
// the way: at most two short, quiet notes.
test('the common sting is short and quiet', () => {
  const common = TIER_STINGS[CONFIG.tiers[0].id];
  assert.ok(common.length <= 2, 'one or two notes');
  assert.ok(stingLength(common) <= 400, 'short');
  assert.ok(loudest(common) <= 0.5, 'quiet');
});

// The rarest pull should sound clearly bigger than the one below it, not
// just a note longer.
test('the rarest tier stands out from the next one down', () => {
  const [below, rarest] = CONFIG.tiers.slice(-2).map((tier) => TIER_STINGS[tier.id]);
  assert.ok(rarest.length >= below.length + 4, 'several more notes');
  assert.ok(Math.max(...rarest.map((n) => n.frequency)) > Math.max(...below.map((n) => n.frequency)), 'reaches higher');
  assert.ok(Math.min(...rarest.map((n) => n.frequency)) < Math.min(...below.map((n) => n.frequency)), 'reaches lower');
});

// Nothing should start with a hard edge: that's what made the plucked
// strings sound alarming. Every note fades in, and chords swell slowly.
test('every note fades in, and chord notes swell in gently', () => {
  for (const [tierId, notes] of Object.entries(TIER_STINGS)) {
    for (const note of notes) {
      assert.ok(note.attackMs >= 5 && note.attackMs < note.lengthMs, `${tierId} attack`);
    }
  }
  const chordNotes = TIER_STINGS.legendary.filter((note) => note.attackMs > 6);
  assert.ok(chordNotes.length > 0 && chordNotes.every((note) => note.attackMs >= 40));
});

test('stings stay short and audible', () => {
  for (const [tierId, notes] of Object.entries(TIER_STINGS)) {
    assert.ok(stingLength(notes) <= 2000, `${tierId} is over 2 seconds`);
    for (const note of notes) {
      assert.ok(note.frequency >= 100 && note.frequency <= 5000, `${tierId} frequency`);
      assert.ok(note.startMs >= 0 && note.lengthMs > 0, `${tierId} timing`);
      assert.ok(note.volume > 0 && note.volume <= 1, `${tierId} volume`);
    }
  }
});

function loudest(notes) {
  return Math.max(...notes.map((note) => note.volume));
}

test('stingLength is when the last note ends', () => {
  assert.equal(
    stingLength([
      { frequency: 440, startMs: 0, lengthMs: 500 },
      { frequency: 440, startMs: 100, lengthMs: 200 },
    ]),
    500,
  );
});
