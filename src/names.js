import { CONFIG } from './config.js';
import { findById } from './lookup.js';

/**
 * Builds a loot-style name: modifier prefixes, then the base type.
 * e.g. "Crimson Jumbo Holographic Theorbo"
 *
 * Per Ryan (#4), prefixes go from most common to most rare, so the order
 * comes from the chances in config rather than a hand-written list.
 * Suffixes ("of Eternal Strumming") are deferred to later.
 *
 * @param {import('./roll.js').Roll} roll
 * @param {import('./config.js').Config} [config]
 * @returns {string}
 */
export function lootName(roll, config = CONFIG) {
  const prefixes = [];

  for (const group of config.groups) {
    const option = findById(group.options, roll.groups[group.id]);
    if (!option.isDefault) {
      prefixes.push(option);
    }
  }
  for (const modifierId of roll.modifiers) {
    prefixes.push(findById(config.independentModifiers, modifierId));
  }

  // Highest chance first. sort is stable, so ties keep config order.
  prefixes.sort((a, b) => b.chance - a.chance);

  const baseType = findById(config.baseTypes, roll.baseType);
  return [...prefixes.map((prefix) => prefix.name), baseType.name].join(' ');
}
