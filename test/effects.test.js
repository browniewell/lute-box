import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectPlan, boxShakeFrames, TIER_EFFECTS } from '../src/effects.js';
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
    assert.ok(more.screenShake || !less.screenShake, `screen shake, ${label}`);
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

// boxShakeFrames: the box's rattle and glow before it opens.
const frames = boxShakeFrames(1000, 6, '#ff8000');

function translate(frame) {
  const [, x, y] = frame.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/).map(Number);
  return { x, y };
}

test('the box rattles quickly, not a slow sway', () => {
  // About one direction change every 50ms.
  assert.ok(frames.length >= 1000 / 60, `only ${frames.length} frames in 1s`);
  for (let i = 2; i < frames.length - 1; i++) {
    const [before, now] = [translate(frames[i - 1]).x, translate(frames[i]).x];
    assert.ok(Math.sign(before) !== Math.sign(now), `frame ${i} doesn't change direction`);
  }
});

test('the rattle starts still and grows, never past the tier shake', () => {
  assert.deepEqual(translate(frames[0]), { x: 0, y: 0 });
  const sizes = frames.map((frame) => Math.abs(translate(frame).x));
  for (const size of sizes) assert.ok(size <= 6);
  assert.ok(sizes.at(-2) > sizes[2], 'should shake harder near the end');
});

test('every frame has the same two glow shadows, so Safari can animate them', () => {
  for (const frame of frames) {
    assert.equal(frame.filter.match(/drop-shadow\(/g).length, 2, frame.filter);
    assert.ok(frame.filter.includes('#ff8000'));
  }
  assert.match(frames[0].filter, /0px 0px 0px/);
  assert.match(frames.at(-1).filter, /0px 0px 16px/);
});

test('frames run from the start to the end of the animation', () => {
  assert.equal(frames[0].offset, 0);
  assert.equal(frames.at(-1).offset, 1);
});
