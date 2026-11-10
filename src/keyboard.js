// Decides whether a keypress should open a box. Takes a KeyboardEvent
// (or anything with the same fields) so it can be tested without a page.

const FORM_FIELDS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Space opens a box, except while typing in a form field, where space
 * should type a space. Held-down space (auto-repeat) is ignored so one
 * press is one box.
 *
 * @param {{ key: string, repeat: boolean, target: { tagName: string, isContentEditable?: boolean } }} event
 * @returns {boolean}
 */
export function isSpaceToOpen(event) {
  if (event.key !== ' ' || event.repeat) {
    return false;
  }
  const { target } = event;
  return !FORM_FIELDS.has(target.tagName) && !target.isContentEditable;
}
