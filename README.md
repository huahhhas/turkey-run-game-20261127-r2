[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/huahhhas/turkey-run-game-20261127-r2/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/huahhhas/turkey-run-game-20261127-r2/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

# Gobble Dash — A Turkey Escape

Thanksgiving is coming, and one plucky turkey refuses to be dinner. **Gobble Dash** is a complete 2D canvas escape game that runs offline in any desktop browser from static files — no build step, no network, no libraries.

## The game

You are the turkey. The farmer is right behind you with a carving knife, the oven is preheated, and the only way out is **1000 metres** of running — out of the farmyard, through the cornfield, and across the farmhouse kitchen floor.

- **Run, jump, flap** — Space / click / ↑ jumps; jump again mid-air to flap-glide over tall ovens. Hold ↓ to duck.
- **Hide** — duck beside a haystack to vanish inside it while the farmer runs past.
- **Dodge** — wooden fences, grinning pumpkins, glowing hot ovens and carving knives that drop from the sky (watch for the red warning marker).
- **Collect** — corn cobs (+10) and rare golden feathers (+50) push the farmer back.
- **The chase** — the farmer-gap meter shows how close he is. Stumble and he closes in; run clean and you pull away. Lose all 3 lives or let him catch you and it's dinner time.
- **Three zones, rising difficulty** — Farmyard (0–300 m), Cornfield (300–650 m), Kitchen (650–1000 m).
- **Full game flow** — title screen, HUD (score, distance, lives, zone, escape progress, farmer gap), pause, **caught** and **escaped** end screens with restart. Synthesised WebAudio sound (gobbles, flaps, pickups, caught sting, escape fanfare) — M to mute, P to pause, R to restart.

## Play it

Serve `game/` with any static server and open `game/index.html`, or run `node serve.ts` and open http://localhost:8080.

## Screenshots

`1-title.jpg` (cover — title screen), `2-run.jpg` (mid-run with HUD), `3-caught.jpg` (caught end screen), `4-escaped.jpg` (escaped end screen). All are real renders of the game, taken in headless Chromium via the deterministic `?shot=` mode (`?shot=start|play|caught|escaped&seed=1`).

## Entry

Built for the make.fun bounty [turkey-run-game-01](https://make.fun/bounty/turkey-run-game-01). `main.ts` copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the kit's vendored `vendor/makefun-game.ts`.

## License

MIT — see [LICENSE](LICENSE).
