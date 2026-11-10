// Browser entry point. Keep game logic out of this file: anything here
// touches the page, so it can't be unit tested in Node. The logic lives
// in open-box.js and keyboard.js.
import { CONFIG } from './config.js';
import { validateConfig } from './validate-config.js';
import { computeTiers } from './tiers.js';
import { openBox } from './open-box.js';
import { isSpaceToOpen } from './keyboard.js';

const openButton = document.getElementById('open-button');
const reveal = document.getElementById('reveal');
const errorMessage = document.getElementById('config-error');

let tiers;
try {
  // Check the config before computing tiers, so a typo in config.js shows
  // a clear message instead of a broken page.
  validateConfig(CONFIG);
  tiers = computeTiers(CONFIG);
} catch (error) {
  errorMessage.textContent = `Config error: ${error.message}`;
  errorMessage.hidden = false;
  openButton.disabled = true;
  throw error; // Also log it to the console with a stack trace.
}

function showNextLute() {
  const lute = openBox(Math.random, tiers);
  reveal.querySelector('[data-field="name"]').textContent = lute.name;

  const tier = reveal.querySelector('[data-field="tier"]');
  tier.textContent = lute.tierName;
  tier.style.color = lute.tierColor;

  const odds = reveal.querySelector('[data-field="odds"]');
  odds.textContent = lute.oddsText;
  odds.title = lute.percentText;

  reveal.hidden = false;
}

openButton.addEventListener('click', showNextLute);

document.addEventListener('keydown', (event) => {
  if (!isSpaceToOpen(event)) {
    return;
  }
  // Stops the page scrolling, and stops a focused Open button from also
  // "clicking" itself on key release, which would open two boxes.
  event.preventDefault();
  if (!openButton.disabled) {
    showNextLute();
  }
});
