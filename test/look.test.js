import { test } from 'node:test';
import assert from 'node:assert/strict';
import { luteLook, sparklePoints, displayPixelSize, pegEdges, MODIFIER_LOOKS, BASE_PIXEL_SIZE } from '../src/look.js';
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

// displayPixelSize: how big each sprite pixel is drawn in a given spot.
test('display size keeps the look size when it fits', () => {
  assert.equal(displayPixelSize(6, 28, {}), 6);
  assert.equal(displayPixelSize(9, 28, { maxHeight: 400 }), 9);
});

test('display size shrinks to whole pixels that fit the height', () => {
  // A jumbo theorbo (52 rows at 9px = 468px) in a 350px stage.
  assert.equal(displayPixelSize(9, 52, { maxHeight: 350 }), 6);
});

test('display size never drops below one pixel', () => {
  assert.equal(displayPixelSize(6, 52, { maxHeight: 10 }), 1);
});

test('scale keeps jumbo bigger than normal bigger than tiny', () => {
  const trophy = { scale: 1 / 3 };
  assert.equal(displayPixelSize(3, 28, trophy), 1); // tiny
  assert.equal(displayPixelSize(6, 28, trophy), 2); // normal
  assert.equal(displayPixelSize(9, 28, trophy), 3); // jumbo
});

test('scale and max height combine', () => {
  // A normal theorbo on the trophy shelf: 2px would be 104px, so 1px.
  assert.equal(displayPixelSize(6, 52, { scale: 1 / 3, maxHeight: 56 }), 1);
});

// pegEdges: where the thin dark edge goes around the pale tuning pegs.
test('a lone peg gets an edge on all four sides', () => {
  const sprite = ['...', '.p.', '...'];
  assert.deepEqual(pegEdges(sprite), [
    { x: 1, y: 1, side: 'top' },
    { x: 1, y: 1, side: 'right' },
    { x: 1, y: 1, side: 'bottom' },
    { x: 1, y: 1, side: 'left' },
  ]);
});

test('no edge where a peg touches another drawn pixel', () => {
  const sprite = ['po'];
  assert.deepEqual(
    pegEdges(sprite).map((edge) => edge.side),
    ['top', 'bottom', 'left'],
  );
});

test('only pegs get edges', () => {
  assert.deepEqual(pegEdges(['...', '.b.', '...']), []);
});
