import { CONFIG } from './config.js';

/**
 * Every lute the config can produce, each with how often it actually drops.
 *
 * Note this `probability` is different from the odds shown to the player
 * (src/odds.js). The shown odds count only what a lute has. This counts
 * everything, misses included, because it answers "what fraction of pulls
 * are exactly this lute?", which is what tier targets need.
 *
 * Small enough to list in full: the placeholder config has about 5,800.
 *
 * @param {import('./config.js').Config} [config]
 * @returns {{ roll: import('./roll.js').Roll, probability: number }[]}
 */
export function allOutcomes(config = CONFIG) {
  let outcomes = config.baseTypes.map((baseType) => ({
    roll: { baseType: baseType.id, groups: {}, modifiers: [] },
    probability: baseType.chance,
  }));

  // Split every outcome so far into one copy per group option...
  for (const group of config.groups) {
    outcomes = outcomes.flatMap(({ roll, probability }) =>
      group.options.map((option) => ({
        roll: { ...roll, groups: { ...roll.groups, [group.id]: option.id } },
        probability: probability * option.chance,
      })),
    );
  }

  // ...then into a "hit" and a "miss" copy per independent modifier.
  // Modifiers are added in config order, matching rollLute.
  for (const modifier of config.independentModifiers) {
    outcomes = outcomes.flatMap(({ roll, probability }) => [
      {
        roll: { ...roll, modifiers: [...roll.modifiers, modifier.id] },
        probability: probability * modifier.chance,
      },
      { roll, probability: probability * (1 - modifier.chance) },
    ]);
  }

  return outcomes;
}
