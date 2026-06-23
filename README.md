[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/H6lPFq0J)
# Computing 2 Coursework Submission
**CID**: [02609282]

---

## Hiking Survival — High-Altitude Challenge

A browser-based survival strategy game set across a 5-day mountaineering expedition. The player manages three survival stats — **Stamina**, **Hunger**, and **Warmth** — while navigating a 26-node trail to reach the summit.

### How to play

Open `web-app/index.html` in a browser (no server needed).

| Button | Effect |
|--------|--------|
| **Move Forward** | Advance one trail node. Costs stamina, hunger, and warmth. Terrain type applies bonus effects. |
| **Camp & Rest** | Recover stamina and warmth at the cost of hunger. |
| **Restart Expedition** | Reset all stats, position, and inventory. |

Use gear and food items from the **Gear & Inventory** panel to recover stats. Equip crampons before tackling icy terrain to reduce stamina drain.

The game ends in **defeat** if any stat reaches zero, or in **victory** when you reach 🚩 The Summit.

---

## Checklist

### Install dependencies locally
```bash
npm install
```

### Game Module – API

- [x] `web-app/game.js` — pure functions with full JSDoc (`@module`, `@typedef`, `@param`, `@returns`)
- [x] `jsdoc.json` source updated to `web-app/game.js` and `web-app/app.js`
- [x] Exported pure functions: `clampStat`, `isIcyCell`, `formatCostLine`, `checkStatus`, `isAtCamp`, `hasRestedHere`, `getCurrentCell`, `getNextCell`, `moveForward`, `campAndRest`, `useItem`, `dangerDrain`

### Game Module – Implementation

- [x] `web-app/game.js` — all game logic as pure functions (input state → new state, no mutation)
- [x] `web-app/app.js` — UI only; imports pure functions from `game.js`, no game logic

### Unit Tests – Specification

- [x] Test descriptions written in `web-app/tests/game.test.js` covering:
  - `getNewGame()` return structure and deep-copy immutability
  - Player initial stats (position, stamina, hunger, warmth, gear)
  - Inventory completeness (all item types present, required fields)
  - Trail integrity (node count, sequential IDs, 5-day structure, camp nodes, valid types)
  - `clampStat`, `isIcyCell`, `formatCostLine` utilities
  - `checkStatus` — win / lose / playing conditions
  - `getCurrentCell`, `getNextCell`, `isAtCamp`, `hasRestedHere` queries
  - `moveForward` — stat drain, clamping, terrain effects, icy terrain, crampons, surprise events, camp arrival (no cost), win/lose, immutability
  - `campAndRest` — recovery values, clamping, camp-only restriction, once-per-camp restriction, immutability
  - `useItem` — all item types, stat clamping, item removal, gear equipping, camp items, immutability

### Unit Tests – Implementation

- [x] **102 tests** implemented and passing

Run tests:
```bash
npm install
npm test
```

Expected output: **102 passing**

### Web Application

- [x] `web-app/index.html` — three-column layout: map | game | inventory + log
- [x] `web-app/style.css` — pixel-art dark theme, viewport-fit layout (no scroll)
- [x] `web-app/app.js` — UI rendering, event handling, audio system
- [x] `web-app/game.js` — pure game state module (all logic, no DOM)
- [x] `web-app/assets/` — background music per day (day1–4 + summit MP3)
- [x] `web-app/images/` — trail photographs, day maps, pixel-art item icons, hiker sprites

### Features

**Gameplay**
- 26-node trail across 5 days; manage Stamina, Hunger, and Warmth simultaneously
- Camp nodes are safe havens — no movement cost on arrival; Camp & Rest limited to once per camp
- Danger zones drain −1 Stamina and −1 Warmth every second while standing on them
- Icy terrain names trigger extra warmth drain; Crampons negate the stamina penalty
- Deterministic surprise events per node; summit and camp nodes are exempt
- Victory / defeat screens with animated modals and pixel confetti

**UI**
- Day-aware map panel with animated hiker sprite (changes with condition)
- Terrain legend, next-location hint strip, trail board with node highlight
- Gear & Inventory panel with hover tooltips; item pixel-art icons
- Expedition log with cost-breakdown lines and progress bar
- How-to-play tutorial modal (shown once, re-openable via 📖 button)

**Audio**
- Web Audio API sound effects: click, eat/consume, equip chime, danger drain, heartbeat
- Web Speech API character complaints when any stat ≤ 30 %
- Heartbeat vignette overlay (red/white fog) pulses with audio when stats critical
- Background music per day (MP3), mutable via 🔊/🔇 toggle

### Finally
- [x] Push to GitHub
- [x] Sync the changes
- [x] Check submission on GitHub website
