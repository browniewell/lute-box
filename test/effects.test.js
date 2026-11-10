import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectPlan, TIER_EFFECTS } from '../src/effects.js';
import { CONFIG } from '../src/config.js';

// Real config on purpose: a new tier without effects should fail here.
test('every tier in the config has effects', () => {
  for (const tier of CONFIG.tiers) {
    assert.ok(TIER_EFFECTS[tier.id], `no effects for tier "${tier.id}"`);
  }
});

test('effects never get smaller as tiers get rarer', () => {
  const plans = CONFIG.tiers.map((tier) => effectPlan(tier.id, { reducedMotion: false }));
  for (let i = 1; i < plans.length; i++) {
    const [less, more] = [plans[i - 1], plans[i]];
    const label = `${CONFIG.tiers[i - 1].id} -> ${CONFIG.tiers[i].id}`;
    assert.ok(more.anticipationMs >= less.anticipationMs, `anticipation, ${label}`);
    assert.ok(more.shake >= less.shake, `shake, ${label}`);
    assert.ok(more.particles >= less.particles, `particles, ${label}`);
    assert.ok(more.flash || !less.flash, `flash, ${label}`);
    assert.ok(more.beam !== 'none' || less.beam === 'none', `beam, ${label}`);
  }
});

test('the rarest tier gets something bigger than everything else', () => {
  const rarest = effectPlan(CONFIG.tiers.at(-1).id, { reducedMotion: false });
  assert.equal(rarest.beam, 'rainbow');
  assert.equal(rarest.screenShake, true);
});

test('reduced motion: no anticipation, shake, flash, particles or beam', () => {
  for (const tier of CONFIG.tiers) {
    assert.deepEqual(effectPlan(tier.id, { reducedMotion: true }), {
      anticipationMs: 0,
      shake: 0,
      particles: 0,
      flash: false,
      beam: 'none',
      screenShake: false,
    });
  }
});

test('an unknown tier fails loudly', () => {
  assert.throws(() => effectPlan('nope', { reducedMotion: false }), /nope/);
});
