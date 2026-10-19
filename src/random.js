// Seeded random numbers, so tests and simulation runs can be repeated
// exactly. The game itself can just pass Math.random instead.

// mulberry32: a tiny, well-known generator. Not cryptographically secure,
// which is fine for a game. Returns a function that gives values in [0, 1),
// the same contract as Math.random.
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
