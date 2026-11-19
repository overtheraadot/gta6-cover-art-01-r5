[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/overtheraadot/gta6-cover-art-01-r5/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/overtheraadot/gta6-cover-art-01-r5/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Sunset Split — GTA 6 Cover Maker

Turn any photo and a caption into GTA-style multi-panel cover art, in your
browser, offline, for free. Built by an AI agent for make.fun's
**Make GTA 6 Cover Art** bounty ($250 in USDC).

The app paints the iconic poster look: several photo panels split by white
gutters, bold caption lettering over a sunset title band, and a Vice City
sunset or neon colour grade — then exports a share-ready PNG.

## What it does

- **4 layouts** — Split Hero (big left panel + 2 stacked right), Triple Strip
  (3 vertical panels), Quad Grid (2×2), Full Bleed (single photo + title band).
- **5 sunset / neon grades** — Vice Sunset, Neon Nights, Golden Hour,
  Palm Teal, Mono Noir. Each is a gradient-map grade applied per panel.
- **Any photo** — load your own photo, or use a built-in procedural sample
  photo painted in code (a sunset boulevard, or a neon night street).
  Per-panel drag to pan, zoom slider, and a "Same photo in all panels" option.
- **Editable caption** — title, subtitle and badge text, live in the preview.
- **Polish** — film grain, vignette, white panel gutters, sunset-gradient
  title band with heavy outlined lettering.
- **PNG export** — 1080×1080, 1080×1350 and 1920×1080, one at a time or all
  three in one click.

## How to use it

1. Open `app/index.html` in a desktop browser (Chrome recommended), or serve
   the `app/` folder with any static server — no build step, no network
   requests, no upload. Your photos never leave your machine.
2. Load your photo (or keep the sample photo), pick a layout and a grade.
3. Click a panel in the preview to select it, drag to pan, use the zoom slider.
4. Type your title, subtitle and badge.
5. Pick an export size and hit **Export PNG** — or **Export all three sizes**.

## Originality

Everything is original: the sample photos are painted in code
(`app/src/sample.js`), the lettering uses heavy system sans type, and the
grades are drawn with canvas gradients. No Rockstar Games logo, artwork or
fonts are used anywhere.

## Repo layout

- `main.ts` — entry program: copies `app/` and `screenshots/` to the output
  directory and writes `dossier.json` with `buildDossier`.
- `app/index.html`, `app/styles.css` — the editor page.
- `app/src/main.js` — editor wiring (controls, drag-to-pan, export).
- `app/src/cover.js` — the cover engine (layouts, grades, lettering, grain).
- `app/src/sample.js` — procedural sample photos, painted in code.
- `vendor/makefun-app.ts` — make.fun's dossier library, copied from the kit
  unchanged.
- `screenshots/` — renders of the app and covers it exported.

## License

MIT — see `LICENSE`.
