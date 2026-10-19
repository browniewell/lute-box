// Finds a config entry by id. Throws on a bad id so a typo in a roll
// fails loudly instead of quietly producing wrong odds or names.
export function findById(items, id) {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Unknown id: "${id}"`);
  }
  return item;
}
