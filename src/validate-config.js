// Checks the odds config for mistakes that would quietly skew drops.
// Throws an error naming the problem; the tests run it on the real config.

// Floating point sums like 0.1 + 0.2 aren't exactly 0.3, so allow a
// rounding-sized gap when checking that chances add up to 1.
const TOLERANCE = 1e-9;

export function validateConfig(config) {
  checkSumsToOne('Base types', config.baseTypes);

  for (const group of config.groups) {
    checkSumsToOne(`Group "${group.id}"`, group.options);

    const defaults = group.options.filter((option) => option.isDefault);
    if (defaults.length !== 1) {
      throw new Error(
        `Group "${group.id}" needs exactly one default option, found ${defaults.length}`,
      );
    }
  }

  for (const modifier of config.independentModifiers) {
    if (!(modifier.chance > 0 && modifier.chance < 1)) {
      throw new Error(
        `Modifier "${modifier.id}" chance must be between 0 and 1, got ${modifier.chance}`,
      );
    }
  }
}

function checkSumsToOne(label, items) {
  const total = items.reduce((sum, item) => sum + item.chance, 0);
  if (Math.abs(total - 1) > TOLERANCE) {
    throw new Error(`${label} chances must sum to 1, got ${total}`);
  }
}
