import { test } from 'node:test';
import assert from 'node:assert/strict';
import { luteLook, sparklePoints, MODIFIER_LOOKS, BASE_PIXEL_SIZE } from '../src/look.js';
import { CONFIG } from '../src/config.js';

function roll(groups, modifiers = []) {
  return { baseType: 'lute', groups: { color: 'none', size: 'normal', ...groups }, modifiers };
}

test('a lute with no modifiers gets the plain look', () => {
  assert.deepEqual(luteLook(roll({})), {
    pixelSize: BASE_PIXEL_SIZE,
    rotation: 0,
    filter: 'none',
    holographic: false,
    sparkle: false,
  });
});

test('jumbo, negative and upside down stack', () => {
  const look = luteLook(roll({ size: 'jumbo' }, ['upside-down', 'negative']));
  assert.ok(look.pixelSize > BASE_PIXEL_SIZE);
  assert.equal(look.rotation, 180);
  assert.equal(look.filter, MODIFIER_LOOKS.negative.filter);
});

test('tiny shrinks the lute but keeps whole screen pixels', () => {
  const look = luteLook(roll({ size: 'tiny' }));
  assert.ok(look.pixelSize < BASE_PIXEL_SIZE);
  assert.ok(Number.isInteger(look.pixelSize));
});

test('filters stack with negative last, so a negative gilded lute is inverted gold', () => {
  const look = luteLook(roll({ color: 'crimson' }, ['negative', 'gilded']));
  assert.equal(
    look.filter,
    [MODIFIER_LOOKS.crimson.filter, MODIFIER_LOOKS.gilded.filter, MODIFIER_LOOKS.negative.filter].join(' '),
  );
  assert.equal(look.sparkle, true);
});

test('holographic turns on the rainbow overlay', () => {
  assert.equal(luteLook(roll({}, ['holographic'])).holographic, true);
});

// Real config on purpose: a new modifier without a look should fail here.
test('every modifier in the config has a look', () => {
  const ids = [
    ...CONFIG.groups.flatMap((group) => group.options.filter((o) => !o.isDefault)),
    ...CONFIG.independentModifiers,
  ].map((option) => option.id);
  for (const id of ids) {
    assert.ok(MODIFIER_LOOKS[id], `no look for "${id}"`);
  }
});

test('sparkles sit on drawn pixels, never on clear ones', () => {
  const sprite = ['..o..', '.ooo.', '..o..'];
  const points = sparklePoints(sprite, 3);
  assert.equal(points.length, 3);
  for (const { x, y } of points) {
    assert.notEqual(sprite[y][x], '.');
  }
});
