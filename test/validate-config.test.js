import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig } from '../src/validate-config.js';
import { CONFIG } from '../src/config.js';
import { TEST_CONFIG } from './fixtures.js';

// Copy the test config so each test can break one thing without
// affecting the others.
function copyOfTestConfig() {
  return structuredClone(TEST_CONFIG);
}

test('the real game config is valid', () => {
  assert.doesNotThrow(() => validateConfig(CONFIG));
});

test('the test config is valid', () => {
  assert.doesNotThrow(() => validateConfig(TEST_CONFIG));
});

test('base type chances must sum to 1', () => {
  const config = copyOfTestConfig();
  config.baseTypes[0].chance = 0.5;
  assert.throws(() => validateConfig(config), /base types.*sum to 1/i);
});

test("each group's chances must sum to 1", () => {
  const config = copyOfTestConfig();
  config.groups[0].options[1].chance = 0.2;
  assert.throws(() => validateConfig(config), /size.*sum to 1/i);
});

test('each group needs exactly one default option', () => {
  const config = copyOfTestConfig();
  delete config.groups[1].options[0].isDefault;
  assert.throws(() => validateConfig(config), /color.*one default/i);
});

test('independent modifier chances must be between 0 and 1', () => {
  const config = copyOfTestConfig();
  config.independentModifiers[0].chance = 1.5;
  assert.throws(() => validateConfig(config), /holographic/i);
});

test('tier target shares must sum to 1', () => {
  const config = copyOfTestConfig();
  config.tiers[0].targetShare = 0.5;
  assert.throws(() => validateConfig(config), /tier.*sum to 1/i);
});
