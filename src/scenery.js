// Pixel art for the tavern around the game: the wall, the hanging title
// sign and its lanterns. Same format as sprites.js (one string per row,
// one character per pixel, "." is clear), with its own palette.

/** Pixel character -> CSS color. */
export const SCENERY_PALETTE = {
  o: '#1a0f08', // outline
  p: '#3a2414', // wall plank
  q: '#33200f', // wall plank, darker board
  l: '#432a17', // wood grain
  s: '#1f130a', // seam between planks
  n: '#6e5f4c', // nail head
  r: '#8a5a2b', // sign rim
  w: '#5c3a1e', // sign board
  g: '#f2c14e', // sign lettering
  k: '#2b1a10', // lettering shadow
  c: '#6e6a64', // chain
  m: '#4a4038', // lantern metal
  y: '#ffd75e', // lantern glass, lit
  f: '#ff9a2e', // flame
  h: '#fff3c4', // flame core
};

/** One tile of the plank wall behind everything; it repeats. */
export const WALL_TILE = [
  'ppplpplplpsllppppppppplppppppppp',
  'ppllppppppsppppppppppppppplppppp',
  'pppppppplpspnpppplppplppppplpppp',
  'ppppppppppsppplpppppppplpppppppp',
  'llpppllpnpslppppppppppplppppplpp',
  'pplpppppppsppppppppppppppllppppp',
  'ppppppppppspppplpppppppppppppppp',
  'ssssssssssssssssssssssssssssssss',
  'qqqqqqqqqqlqqqqqqqqqqqqqsqqqqqqq',
  'qqqqqlqqlqqqqqqqqqqqqqqqsqqqqqqq',
  'qqqqqqqqqqqqqqqlqlqqqqqqsqnqqqqq',
  'qqqqqqqqqlqqlqqqlqqqqqlqsqqqqqqq',
  'qqqllqqlqqqlqlqqqqqqqqnqsqlqqqqq',
  'qqqlqlqqqqqqqqqqqqqqqqqqsqqlqlqq',
  'qlqqqqqqqqqqqqqqqqqlqqqqsqlqlqll',
  'ssssssssssssssssssssssssssssssss',
  'ppppspppppppppplppsppppppppppppp',
  'plppsppppppplpppppslpplppppppppp',
  'ppplspnpppllppppppspnppppplppppp',
  'ppppspppppppppppllsppppppplppppp',
  'ppnpsppppplpppppnpspppppppppplpp',
  'ppplspppppppppppppspppppppppplpl',
  'ppppspppppplppppppsppppppppllppp',
  'ssssssssssssssssssssssssssssssss',
];

/** A hanging lantern, one on each side of the sign. */
export const LANTERN = [
  '....c....',
  '....c....',
  '...ooo...',
  '..ommmo..',
  '.ommmmmo.',
  '.omyyymo.',
  '.oyyhyyo.',
  '.oyhfhyo.',
  '.oyfffyo.',
  '.oyyfyyo.',
  '.omyyymo.',
  '.ommmmmo.',
  '..ooooo..',
];

/** 5x5 letters for the sign. Add one here to use it in a title. */
export const GLYPHS = {
  ' ': ['.....', '.....', '.....', '.....', '.....'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
};

const PAD_X = 3; // Board between the rim and the letters, each side.
const PAD_Y = 2; // Same, above and below.
const CHAIN_ROWS = 3;

/**
 * Builds the hanging wooden sign for `text`: an outlined board with a
 * lighter rim, gold letters with a drop shadow, and two chains on top.
 *
 * @param {string} text
 * @returns {string[]} Rows of pixels, in SCENERY_PALETTE.
 */
export function titleSign(text) {
  const glyphs = [...text.toUpperCase()].map((char) => {
    const glyph = GLYPHS[char];
    if (!glyph) throw new Error(`no glyph for "${char}"`);
    return glyph;
  });

  // The letters, one column apart, as a grid of true (ink) / false.
  const ink = Array.from({ length: 5 }, (_, y) =>
    [...glyphs.map((glyph) => glyph[y]).join('.')].map((char) => char === '#'),
  );
  const textWidth = ink[0].length;

  const innerWidth = textWidth + 2 * PAD_X;
  const innerHeight = 5 + 2 * PAD_Y;
  const board = Array.from({ length: innerHeight }, (_, y) =>
    Array.from({ length: innerWidth }, (_, x) => {
      const ty = y - PAD_Y;
      const tx = x - PAD_X;
      if (ink[ty]?.[tx]) return 'g';
      // Shadow one pixel down and right of each letter pixel.
      if (ink[ty - 1]?.[tx - 1]) return 'k';
      return 'w';
    }).join(''),
  );

  const width = innerWidth + 4; // Outline and rim on each side.
  const outline = 'o'.repeat(width);
  const rim = `or${'r'.repeat(innerWidth)}ro`;
  const chain = [...'.'.repeat(width)];
  chain[3] = 'c';
  chain[width - 4] = 'c';

  return [
    ...Array(CHAIN_ROWS).fill(chain.join('')),
    outline,
    rim,
    ...board.map((row) => `or${row}ro`),
    rim,
    outline,
  ];
}
