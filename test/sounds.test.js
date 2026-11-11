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
// the way: one short, quiet, soft note.
test('the common sting is a single short, quiet, soft note', () => {
  const common = TIER_STINGS[CONFIG.tiers[0].id];
  assert.equal(common.length, 1);
  assert.ok(stingLength(common) <= 300, 'short');
  assert.ok(loudest(common) <= 0.5, 'quiet');
  assert.equal(common[0].tone, 'soft');
});

test('only the two rarest tiers use the plucked-string tone', () => {
  const plain = CONFIG.tiers.slice(0, -2).flatMap((tier) => TIER_STINGS[tier.id]);
  assert.ok(plain.every((note) => note.tone === 'soft'));
});

test('stings stay short and audible', () => {
  for (const [tierId, notes] of Object.entries(TIER_STINGS)) {
    assert.ok(stingLength(notes) <= 2000, `${tierId} is over 2 seconds`);
    for (const note of notes) {
      assert.ok(note.frequency >= 100 && note.frequency <= 5000, `${tierId} frequency`);
      assert.ok(note.startMs >= 0 && note.lengthMs > 0, `${tierId} timing`);
      assert.ok(note.volume > 0 && note.volume <= 1, `${tierId} volume`);
      assert.ok(['soft', 'string'].includes(note.tone), `${tierId} tone`);
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
