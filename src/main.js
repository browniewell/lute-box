// Browser entry point. Keep game logic out of this file: anything here
// touches the page, so it can't be unit tested in Node. The logic lives
// in open-box.js, keyboard.js, tabs.js, look.js, effects.js, sounds.js and
// records.js.
import { CONFIG } from './config.js';
import { validateConfig } from './validate-config.js';
import { computeTiers } from './tiers.js';
import { openBox } from './open-box.js';
import { isSpaceToOpen } from './keyboard.js';
import { renderLute, renderBox } from './render-lute.js';
import { renderScenery, renderWall } from './render-scenery.js';
import { BASE_PIXEL_SIZE } from './look.js';
import { nextTabIndex } from './tabs.js';
import { effectPlan } from './effects.js';
import { playAnticipation, playReveal } from './play-effects.js';
import { emptyRecords, addPull } from './records.js';
import { loadRecords, saveRecords, clearRecords, loadSoundOn, saveSoundOn } from './storage.js';
import { renderRecords } from './render-records.js';
import { TIER_STINGS } from './sounds.js';
import { unlockAudio, releaseAudio, playSting } from './play-sound.js';

const page = document.getElementById('game');
const openButton = document.getElementById('open-button');
const stage = document.getElementById('stage');
const reveal = document.getElementById('reveal');
const errorMessage = document.getElementById('config-error');
const recordsSection = document.getElementById('records');
const storageNote = document.getElementById('storage-note');
const resetButton = document.getElementById('reset-button');
const soundButton = document.getElementById('sound-button');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// Must match the phone breakpoint in tavern.css.
const phone = window.matchMedia('(max-width: 760px)');

// The tavern goes up first, so even a config error shows on the real page.
renderWall();
function drawScenery() {
  renderScenery(
    { sign: document.getElementById('sign'), lanterns: [...document.querySelectorAll('.lantern')] },
    phone.matches ? 3 : 4,
  );
}
drawScenery();
phone.addEventListener('change', drawScenery);

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

const STORAGE_NOTES = {
  unavailable: "This browser isn't letting the game save, so trophies and stats last only until you leave the page.",
  corrupt: "Saved trophies and stats couldn't be read, so they're starting fresh.",
  saveFailed: "Couldn't save this pull. Trophies and stats may not be kept after you leave the page.",
};

// If storage can't be used, the game still plays; it just doesn't save.
const saved = loadRecords(() => window.localStorage);
const storage = saved.storage;
let records = saved.records;
if (saved.problem) showStorageNote(saved.problem);
renderRecords(recordsSection, records, tiers);
// A closed box waits on the counter until the first open.
renderBox(stage, BASE_PIXEL_SIZE);

// Off by default (handoff); the player's choice is remembered.
let soundOn = loadSoundOn(storage);
showSoundState();

// True from the click until the last reveal effect ends. Opens are ignored
// meanwhile, rather than skipping ahead (Ryan's call in #7).
let opening = false;

async function openNext() {
  if (opening) return;
  opening = true;
  // Space can open a box from the phone's Trophies tab; show it happening.
  showTab('play');
  // Before any await: browsers only allow starting audio during the click.
  if (soundOn) unlockAudio();
  // aria-disabled rather than disabled: a disabled button drops keyboard
  // focus, which would break pressing Space on it again.
  openButton.setAttribute('aria-disabled', 'true');

  try {
    const lute = openBox(Math.random, tiers);
    // Saved straight away, so leaving mid-animation doesn't lose the pull.
    // The page shows it at the reveal, so the trophy case can't spoil it.
    records = addPull(records, lute, new Date());
    if (storage && !saveRecords(storage, records)) showStorageNote('saveFailed');

    const plan = effectPlan(lute.tierId, { reducedMotion: reducedMotion.matches });

    clearReveal();
    await playAnticipation(stage, plan, lute.tierColor);

    // Shrinks a tall lute (a jumbo theorbo) to fit a short window.
    renderLute(stage, lute.roll, { maxHeight: stage.clientHeight - STAGE_PADDING * 2 });
    showReveal(lute);
    if (soundOn) playSting(TIER_STINGS[lute.tierId]);
    renderRecords(recordsSection, records, tiers);
    await playReveal(stage, page, plan, lute.tierColor);
  } finally {
    opening = false;
    openButton.removeAttribute('aria-disabled');
  }
}

// #stage's padding in tavern.css.
const STAGE_PADDING = 12;

function clearReveal() {
  reveal.classList.add('pending');
  for (const field of reveal.querySelectorAll('[data-field]')) {
    field.textContent = '';
  }
}

function showReveal(lute) {
  reveal.querySelector('[data-field="name"]').textContent = lute.name;

  const tier = reveal.querySelector('[data-field="tier"]');
  tier.textContent = lute.tierName;
  tier.style.color = lute.tierColor;

  const odds = reveal.querySelector('[data-field="odds"]');
  odds.textContent = lute.oddsText;
  odds.title = lute.percentText;

  reveal.classList.remove('pending');
}

function showSoundState() {
  soundButton.setAttribute('aria-pressed', String(soundOn));
  soundButton.querySelector('[data-sound-state]').textContent = soundOn ? 'on' : 'off';
}

function showStorageNote(problem) {
  storageNote.textContent = STORAGE_NOTES[problem];
  storageNote.hidden = false;
}

// Phone tabs. On wider screens the tab bar is hidden and every panel shows,
// so the panels only take the tabpanel role while the tabs are in use.
function showTab(id) {
  page.dataset.tab = id;
  for (const tab of tabs) {
    const selected = tab.dataset.tab === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
}

function setPanelRoles() {
  for (const tab of tabs) {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (phone.matches) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
    }
  }
}
setPanelRoles();
phone.addEventListener('change', setPanelRoles);

for (const tab of tabs) {
  tab.addEventListener('click', () => showTab(tab.dataset.tab));
  tab.addEventListener('keydown', (event) => {
    const next = nextTabIndex(event.key, tabs.indexOf(tab), tabs.length);
    if (next === null) return;
    event.preventDefault();
    tabs[next].focus();
    showTab(tabs[next].dataset.tab);
  });
}

openButton.addEventListener('click', openNext);
// Clicking or tapping the box (or the lute after it) opens the next one.
stage.addEventListener('click', openNext);

soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  if (soundOn) unlockAudio();
  else releaseAudio();
  if (storage) saveSoundOn(storage, soundOn);
  showSoundState();
});

resetButton.addEventListener('click', () => {
  // Ignored mid-open, so a pull being revealed can't be wiped half-saved.
  if (opening) return;
  if (!window.confirm("Erase your trophy case and all stats? This can't be undone.")) return;
  records = emptyRecords();
  if (storage) clearRecords(storage);
  renderRecords(recordsSection, records, tiers);
});

document.addEventListener('keydown', (event) => {
  if (!isSpaceToOpen(openButton, event)) {
    return;
  }
  // Stops the page scrolling, and stops a focused Open button from also
  // "clicking" itself on key release, which would open two boxes.
  event.preventDefault();
  if (!openButton.disabled) {
    openNext();
  }
});
