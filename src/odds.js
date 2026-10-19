import { CONFIG } from './config.js';

// The probability of a lute's traits: its base type chance times the
// chance of every modifier it has. Per Ryan (#3), only what the lute HAS
// counts. Misses and default group results (normal size, no color) don't,
// so every extra modifier always makes a lute rarer.
export function exactOdds(roll, config = CONFIG) {
  let odds = findById(config.baseTypes, roll.baseType).chance;

  for (const group of config.groups) {
    const option = findById(group.options, roll.groups[group.id]);
    if (!option.isDefault) {
      odds *= option.chance;
    }
  }

  for (const modifierId of roll.modifiers) {
    odds *= findById(config.independentModifiers, modifierId).chance;
  }

  return odds;
}

function findById(items, id) {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Unknown id in roll: "${id}"`);
  }
  return item;
}
