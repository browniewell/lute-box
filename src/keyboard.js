// Decides whether a keypress should open a box. Takes a KeyboardEvent
// (or anything with the same fields) so it can be tested without a page.

const FORM_FIELDS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
// Space already presses these, so it shouldn't open a box too.
const CONTROLS = new Set(['BUTTON', 'A', 'SUMMARY']);

/**
 * Space opens a box, except while typing in a form field, where space
 * should type a space, or on another button or link, where space presses
 * that instead. Held-down space (auto-repeat) is ignored so one press is
 * one box.
 *
 * @param {object} openButton The Open button, which space does open from.
 * @param {{ key: string, repeat: boolean, target: { tagName: string, isContentEditable?: boolean } }} event
 * @returns {boolean}
 */
export function isSpaceToOpen(openButton, event) {
  if (event.key !== ' ' || event.repeat) {
    return false;
  }
  const { target } = event;
  if (target === openButton) {
    return true;
  }
  return !FORM_FIELDS.has(target.tagName) && !CONTROLS.has(target.tagName) && !target.isContentEditable;
}
