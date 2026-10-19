// Rolls a lot of boxes and reports how often each tier actually shows up,
// so the odds in src/config.js can be tuned with real numbers.
//
// Usage: npm run simulate -- [count] [--seed N]
//   count  boxes to open (default 1,000,000)
//   seed   same seed gives the same run (default 1)

import { CONFIG } from '../src/config.js';
import { validateConfig } from '../src/validate-config.js';
import { computeTiers, tierFor } from '../src/tiers.js';
import { rollLute } from '../src/roll.js';
import { exactOdds } from '../src/odds.js';
import { lootName } from '../src/names.js';
import { createSeededRandom } from '../src/random.js';
import { formatOdds, formatPercent } from '../src/format.js';

const { count, seed } = parseArgs(process.argv.slice(2));

// Stop before printing any numbers if the config itself is broken.
validateConfig(CONFIG);

const tiers = computeTiers(CONFIG);
const random = createSeededRandom(seed);
const tierCounts = Object.fromEntries(tiers.map((tier) => [tier.id, 0]));
let rarest = null;

for (let i = 1; i <= count; i++) {
  const roll = rollLute(random);
  const odds = exactOdds(roll);
  tierCounts[tierFor(odds, tiers).id]++;
  if (!rarest || odds < rarest.odds) {
    rarest = { roll, odds, boxNumber: i };
  }
}

console.log(`Opened ${count.toLocaleString('en-US')} boxes (seed ${seed})\n`);
printTierTable();
console.log(
  `\nRarest pull: ${lootName(rarest.roll)}, ${formatOdds(rarest.odds)}, ` +
    `${tierFor(rarest.odds, tiers).name} (box #${rarest.boxNumber.toLocaleString('en-US')})`,
);

function printTierTable() {
  const rows = tiers.map((tier) => [
    tier.name,
    formatPercent(tier.targetShare),
    formatPercent(tier.expectedShare),
    formatPercent(tierCounts[tier.id] / count),
    describeThreshold(tier),
  ]);
  const header = ['Tier', 'Target', 'Expected', 'Simulated', 'Threshold'];
  printTable([header, ...rows]);
  console.log(
    '\nTarget: from config. Expected: exact share the calculated thresholds give ' +
      '(targets are hit as closely as possible). Simulated: this run.',
  );
}

function describeThreshold(tier) {
  if (tier === tiers[0]) return 'everything else';
  if (tier.maxOdds === 0) return 'none (tier is empty)';
  return `${formatOdds(tier.maxOdds)} or rarer`;
}

function printTable(rows) {
  const widths = rows[0].map((_, col) => Math.max(...rows.map((row) => row[col].length)));
  for (const row of rows) {
    console.log(row.map((cell, col) => cell.padEnd(widths[col])).join('   '));
  }
}

function parseArgs(args) {
  let count = 1_000_000;
  let seed = 1;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed') {
      seed = Number(args[++i]);
    } else {
      count = Number(args[i]);
    }
  }
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(seed)) {
    console.error('Usage: npm run simulate -- [count] [--seed N]');
    process.exit(1);
  }
  return { count, seed };
}
