// Shared test helpers.
//
// Tests use their own small config instead of src/config.js, so Ryan can
// tune the real odds without breaking any tests.

export const TEST_CONFIG = {
  baseTypes: [
    { id: 'lute', name: 'Lute', chance: 0.55 },
    { id: 'oud', name: 'Oud', chance: 0.4 },
    { id: 'theorbo', name: 'Theorbo', chance: 0.05 },
  ],
  groups: [
    {
      id: 'size',
      options: [
        { id: 'normal', name: 'Normal', chance: 0.92, isDefault: true },
        { id: 'jumbo', name: 'Jumbo', chance: 0.04 },
        { id: 'tiny', name: 'Tiny', chance: 0.04 },
      ],
    },
    {
      id: 'color',
      options: [
        { id: 'none', name: 'None', chance: 0.9, isDefault: true },
        { id: 'crimson', name: 'Crimson', chance: 0.1 },
      ],
    },
  ],
  independentModifiers: [
    { id: 'holographic', name: 'Holographic', chance: 0.02 },
    { id: 'negative', name: 'Negative', chance: 0.03 },
    { id: 'gilded', name: 'Gilded', chance: 0.01 },
  ],
  tiers: [
    { id: 'common', name: 'Common', color: '#9d9d9d', targetShare: 0.7 },
    { id: 'rare', name: 'Rare', color: '#0070dd', targetShare: 0.25 },
    { id: 'legendary', name: 'Legendary', color: '#ff8000', targetShare: 0.05 },
  ],
};

// A config small enough to work out tiers by hand:
//
//   lute    (odds 0.9)  appears 0.9 x 0.9 = 81% of the time
//   gilded lute    (0.09)  0.9 x 0.1 =  9%
//   theorbo (0.1)       0.1 x 0.9 =  9%
//   gilded theorbo (0.01)  0.1 x 0.1 =  1%
//
// Ranked rarest first, the running share of pulls is 1%, 10%, 19%, 100%.
// So a 1% legendary target cuts after gilded theorbo (odds 0.01), and
// legendary + rare = 19% cuts after theorbo (odds 0.1).
export const TINY_CONFIG = {
  baseTypes: [
    { id: 'lute', name: 'Lute', chance: 0.9 },
    { id: 'theorbo', name: 'Theorbo', chance: 0.1 },
  ],
  groups: [],
  independentModifiers: [{ id: 'gilded', name: 'Gilded', chance: 0.1 }],
  tiers: [
    { id: 'common', name: 'Common', color: '#9d9d9d', targetShare: 0.81 },
    { id: 'rare', name: 'Rare', color: '#0070dd', targetShare: 0.18 },
    { id: 'legendary', name: 'Legendary', color: '#ff8000', targetShare: 0.01 },
  ],
};

// A "random" source that returns the given values in order, so a test can
// say exactly what each roll lands on. Throws if a test asks for more values
// than it supplied, which would mean the roll order changed.
export function sequenceRandom(values) {
  let index = 0;
  return () => {
    if (index >= values.length) {
      throw new Error(`sequenceRandom ran out after ${values.length} values`);
    }
    return values[index++];
  };
}

// Floating point multiplication isn't exact, so compare probabilities
// with a tiny tolerance instead of strict equality.
export function assertClose(assert, actual, expected) {
  assert.ok(
    Math.abs(actual - expected) < 1e-12,
    `expected ${expected}, got ${actual}`,
  );
}
