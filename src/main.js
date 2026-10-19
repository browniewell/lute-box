// Browser entry point. Keep game logic out of this file: anything here
// touches the page, so it can't be unit tested in Node.
import { GAME_TITLE } from './game-title.js';

document.getElementById('game-title').textContent = GAME_TITLE;
