// Plays an EffectPlan (effects.js) on the page. Browser only. Styles and
// keyframes are in effects.css, except the box's, which come from
// boxShakeFrames in effects.js.
import { renderBox } from './render-lute.js';
import { BASE_PIXEL_SIZE } from './look.js';
import { boxShakeFrames } from './effects.js';

// How long each reveal effect runs. Must match the animations in effects.css.
const FLASH_MS = 500;
const PARTICLE_MS = 900;
const BEAM_MS = 1600;
const SCREEN_SHAKE_MS = 600;

/**
 * Shows the unopened box in `stage`, shaking and glowing in the tier color,
 * and resolves when it's done.
 *
 * @param {HTMLElement} stage
 * @param {import('./effects.js').EffectPlan} plan
 * @param {string} tierColor
 * @returns {Promise<void>}
 */
export function playAnticipation(stage, plan, tierColor) {
  if (plan.anticipationMs === 0) return Promise.resolve();

  const box = renderBox(stage, BASE_PIXEL_SIZE);
  const timing = { duration: plan.anticipationMs, fill: 'forwards' };
  box.animate(boxShakeFrames(plan.anticipationMs, plan.shake), timing);

  // The glow: a layer in the tier color around the box that fades in.
  // Opacity, not a filter, so it animates on iPhone Safari too.
  const glow = document.createElement('div');
  glow.className = 'box-glow';
  glow.style.setProperty('--tier-color', tierColor);
  box.prepend(glow);
  glow.animate([{ opacity: 0 }, { opacity: 1 }], timing);
  return wait(plan.anticipationMs);
}

/**
 * Plays the reveal effects around the lute already drawn in `stage`, and
 * resolves when the last one has finished.
 *
 * @param {HTMLElement} stage
 * @param {HTMLElement} page Element to shake for screenShake. Not <body>:
 *   shaking body would drag the fixed-position flash along with it.
 * @param {import('./effects.js').EffectPlan} plan
 * @param {string} tierColor
 * @returns {Promise<void>}
 */
export function playReveal(stage, page, plan, tierColor) {
  const durations = [0];

  if (plan.beam !== 'none') {
    const beam = document.createElement('div');
    beam.className = `beam beam-${plan.beam}`;
    beam.style.setProperty('--tier-color', tierColor);
    stage.prepend(beam); // First child, so it sits behind the lute.
    removeAfter(beam, BEAM_MS);
    durations.push(BEAM_MS);
  }

  for (let i = 0; i < plan.particles; i++) {
    stage.append(makeParticle(plan, tierColor));
  }
  if (plan.particles) durations.push(PARTICLE_MS);

  if (plan.flash) {
    const flash = document.createElement('div');
    flash.className = 'flash';
    flash.style.setProperty('--tier-color', tierColor);
    document.body.append(flash);
    removeAfter(flash, FLASH_MS);
    durations.push(FLASH_MS);
  }

  if (plan.screenShake) {
    page.classList.add('screen-shake');
    setTimeout(() => page.classList.remove('screen-shake'), SCREEN_SHAKE_MS);
    durations.push(SCREEN_SHAKE_MS);
  }

  return wait(Math.max(...durations));
}

// One square "pixel" that flies out from the lute's center in a random
// direction. The rainbow beam's tier gets rainbow particles too.
function makeParticle(plan, tierColor) {
  const particle = document.createElement('span');
  particle.className = 'particle';
  const angle = Math.random() * 2 * Math.PI;
  const distance = 80 + Math.random() * 120;
  particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
  particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
  particle.style.background =
    plan.beam === 'rainbow' ? `hsl(${Math.floor(Math.random() * 360)} 100% 60%)` : tierColor;
  removeAfter(particle, PARTICLE_MS);
  return particle;
}

function removeAfter(element, ms) {
  setTimeout(() => element.remove(), ms);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
