// The tavern panels are dark, so every color drawn as text on them must
// pass WCAG AA contrast (4.5:1). Reads the colors from the real files, so
// changing a tier color or the panel color re-checks it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';

const css = readFileSync(new URL('../src/tavern.css', import.meta.url), 'utf8');

function cssColor(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `--${name} not found in tavern.css`);
  return match[1];
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const panel = cssColor('panel');

test('every tier color is readable on the panels', () => {
  for (const tier of CONFIG.tiers) {
    const ratio = contrast(tier.color, panel);
    assert.ok(ratio >= 4.5, `${tier.name} ${tier.color} is ${ratio.toFixed(2)}:1 on ${panel}`);
  }
});

test('body text and muted text are readable on the panels', () => {
  for (const name of ['text', 'muted']) {
    const ratio = contrast(cssColor(name), panel);
    assert.ok(ratio >= 4.5, `--${name} is ${ratio.toFixed(2)}:1 on ${panel}`);
  }
});
