# Lute Box

A one-page loot box game: click to open a box, get a lute of some rarity, repeat.

Work in progress. See [lute-box-handoff.md](lute-box-handoff.md) for the plan and the [issues](https://github.com/browniewell/lute-box/issues) for progress.

## Run locally

The game uses ES modules, which browsers won't load from a `file://` URL, so serve the folder with any static server. Python 3 is already on most Macs:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Run tests

Needs Node 21 or newer. There are no dependencies to install.

```bash
npm test
```

Tests also run in GitHub Actions on every push and pull request.
