import { CONFIG } from './config.js';

// Rolls one lute. `random` is any function returning values in [0, 1),
// like Math.random, so tests can pass in fixed or seeded values.
//
// Roll order is fixed: base type, then each group, then each independent
// modifier, all in config order. Seeded runs depend on that order.
export function rollLute(random, config = CONFIG) {
  const baseType = pickOne(config.baseTypes, random).id;

  const groups = {};
  for (const group of config.groups) {
    groups[group.id] = pickOne(group.options, random).id;
  }

  const modifiers = config.independentModifiers
    .filter((modifier) => random() < modifier.chance)
    .map((modifier) => modifier.id);

  return { baseType, groups, modifiers };
}

// Picks one option, where each option's `chance` is its share of the
// range [0, 1). Options are laid end to end, and the random value lands
// in one of them.
function pickOne(options, random) {
  const value = random();
  let rangeEnd = 0;
  for (const option of options) {
    rangeEnd += option.chance;
    if (value < rangeEnd) {
      return option;
    }
  }
  // Chances that sum to 1 in theory can sum to 0.9999999... in floating
  // point, leaving a sliver at the top. That sliver belongs to the last option.
  return options[options.length - 1];
}
