// Keyboard moves between tabs (the phone layout's Play / Trophies bar),
// following the WAI-ARIA tabs pattern. Pure, so it's tested in Node.

/**
 * @param {string} key KeyboardEvent.key
 * @param {number} current Index of the focused tab.
 * @param {number} count How many tabs there are.
 * @returns {number | null} The tab to move to, or null to ignore the key.
 */
export function nextTabIndex(key, current, count) {
  switch (key) {
    case 'ArrowRight': return (current + 1) % count;
    case 'ArrowLeft': return (current - 1 + count) % count;
    case 'Home': return 0;
    case 'End': return count - 1;
    default: return null;
  }
}
