// @ts-check
// Every odds number in the game lives in this file.
//
// - `chance` is a probability from 0 to 1 (0.05 = 5%).
// - Base type chances must add up to 1, and so must each group's options.
//   The tests check this, so a typo fails loudly instead of skewing drops.
// - Only what a lute HAS counts toward its odds: its base type, any
//   non-default group result, and any independent modifier that hit.
//
// Values marked PLACEHOLDER are waiting on Ryan's decisions in issue #1.

// The types below are JSDoc comments: VS Code reads them for autocomplete
// and, thanks to @ts-check, underlines entries with a wrong shape. They
// change nothing at runtime. validateConfig checks the numbers themselves.

/**
 * One thing that can be picked: a base type, a group option, or an
 * independent modifier.
 * @typedef {object} Option
 * @property {string} id Stable key used in code and saved data.
 * @property {string} name Shown to the player.
 * @property {number} chance Probability from 0 to 1 (0.05 = 5%).
 * @property {boolean} [isDefault] Group options only: means "no modifier".
 */

/**
 * A set of options where exactly one is picked, like size or color.
 * @typedef {object} Group
 * @property {string} id
 * @property {Option[]} options
 */

/**
 * @typedef {object} Config
 * @property {Option[]} baseTypes
 * @property {Group[]} groups
 * @property {Option[]} independentModifiers
 */

/** @type {Config} */
export const CONFIG = {
  // One is always picked.
  baseTypes: [
    { id: 'lute', name: 'Lute', chance: 0.35 }, // PLACEHOLDER
    { id: 'oud', name: 'Oud', chance: 0.25 }, // PLACEHOLDER
    { id: 'mandolin', name: 'Mandolin', chance: 0.2 }, // PLACEHOLDER
    { id: 'archlute', name: 'Archlute', chance: 0.1 }, // PLACEHOLDER
    { id: 'baroque-lute', name: 'Baroque Lute', chance: 0.05 }, // PLACEHOLDER
    { id: 'theorbo', name: 'Theorbo', chance: 0.05 }, // PLACEHOLDER
  ],

  // Exactly one option is picked per group. The `isDefault` option means
  // "no modifier" and doesn't count toward the odds.
  //
  // Per Ryan (#4): colors are the most common modifiers, then sizes, then
  // the independents. Each single option keeps to that order.
  groups: [
    {
      id: 'color',
      options: [
        { id: 'none', name: 'None', chance: 0.68, isDefault: true }, // PLACEHOLDER
        { id: 'crimson', name: 'Crimson', chance: 0.08 }, // PLACEHOLDER
        { id: 'azure', name: 'Azure', chance: 0.08 }, // PLACEHOLDER
        { id: 'emerald', name: 'Emerald', chance: 0.08 }, // PLACEHOLDER
        { id: 'violet', name: 'Violet', chance: 0.08 }, // PLACEHOLDER
      ],
    },
    {
      id: 'size',
      options: [
        { id: 'normal', name: 'Normal', chance: 0.92, isDefault: true }, // PLACEHOLDER
        { id: 'jumbo', name: 'Jumbo', chance: 0.04 }, // PLACEHOLDER
        { id: 'tiny', name: 'Tiny', chance: 0.04 }, // PLACEHOLDER
      ],
    },
  ],

  // Each one rolls separately, so a lute can have any number of these.
  independentModifiers: [
    { id: 'upside-down', name: 'Upside Down', chance: 0.035 }, // PLACEHOLDER
    { id: 'negative', name: 'Negative', chance: 0.03 }, // PLACEHOLDER
    { id: 'ancient', name: 'Ancient', chance: 0.025 }, // PLACEHOLDER
    { id: 'holographic', name: 'Holographic', chance: 0.02 }, // PLACEHOLDER
    { id: 'cursed', name: 'Cursed', chance: 0.015 }, // PLACEHOLDER
    { id: 'gilded', name: 'Gilded', chance: 0.01 }, // PLACEHOLDER
  ],
};
