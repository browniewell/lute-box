// Turns a probability (0 to 1) into text for the reveal.

// "1 in 25,000". N is rounded to a whole number.
export function formatOdds(probability) {
  const n = Math.round(1 / probability);
  return `1 in ${n.toLocaleString('en-US')}`;
}

// "0.004%", for the hover text. Three significant digits is enough to
// compare pulls; toLocaleString keeps tiny values out of scientific notation.
export function formatPercent(probability) {
  const percent = (probability * 100).toLocaleString('en-US', {
    maximumSignificantDigits: 3,
  });
  return `${percent}%`;
}
