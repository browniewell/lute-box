# Lute Box

A one-page loot box game: click to open a box, get a lute of some rarity, repeat.

**Play it:** <https://browniewell.github.io/lute-box/>

See [lute-box-handoff.md](lute-box-handoff.md) for the plan and the [issues](https://github.com/browniewell/lute-box/issues) for progress.

## How to play

Press **Open** (or Space) to open a box. You get one lute: a base type, maybe a color and a size, and maybe a few extra modifiers like Upside Down or Gilded. The rarer the combination, the higher its tier, from Common up to Mythic, and the bigger the reveal.

Your stats and your 10 rarest lutes (the trophy case) are saved in your browser, so they're still there next time. **Reset trophies and stats** clears them. Sound starts off; turn it on with the **Sound** button.

## Run locally

The game uses ES modules, which browsers won't load from a `file://` URL, so serve the folder with any static server. Python 3 is already on most Macs:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

To review the sprites and sounds without rolling, open <http://localhost:8000/preview.html>. It has a button to play each tier's sound sting, and shows every base type with every modifier, plus a few stacks.

## Run tests

Needs Node 21 or newer. There are no dependencies to install.

```bash
npm test
```

Tests also run in GitHub Actions on every push and pull request.

## Change the odds

Every odds number is in [src/config.js](src/config.js), with comments on what each field means:

- `chance` is a probability from 0 to 1 (`0.05` is 5%). Base type chances must add up to 1, and so must the options in each group (color, size). Independent modifiers each roll on their own.
- Tiers aren't set by odds cutoffs. Each tier has a `targetShare`, the fraction of all pulls that should land in it (these add up to 1), and the game works out the cutoffs. So changing a modifier's chance won't quietly change how often each tier shows up.

After editing, run the tests, which catch chances that don't add up, then roll a million boxes to see the real tier shares:

```bash
npm test
```

```bash
npm run simulate
```

If the config is broken, the game shows the error on the page instead of rolling.

## Hosting

The live game is served by GitHub Pages straight from the `main` branch, so merging to `main` updates it within a minute or two. There's no build step. The empty `.nojekyll` file tells Pages to serve the files as they are instead of running them through Jekyll.
