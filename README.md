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

- [x] `web-app/game.js` — exports `initialState` and `getNewGame()`, documented with JSDoc
- [x] `jsdoc.json` source updated
- [x] Docs compiled with `Generate Docs`

### Game Module – Implementation

- [x] `web-app/game.js` fully implemented — 26-node trail across 5 days, player stats, inventory

### Unit Tests – Specification

- [x] Test descriptions written in `web-app/tests/game.test.js` covering:
  - `getNewGame()` return structure and deep-copy immutability
  - Player initial stats (position, stamina, hunger, warmth, gear)
  - Inventory completeness (all item types present, required fields)
  - Trail integrity (node count, sequential IDs, 5-day structure, camp nodes, valid types)

### Unit Tests – Implementation

- [x] 26 tests implemented and passing

Run tests:
```bash
npx mocha
```

Expected output: **26 passing**

### Web Application

- [x] `web-app/index.html` — three-column layout: map | game | inventory
- [x] `web-app/style.css` — pixel-art dark theme, responsive
- [x] `web-app/app.js` — game loop, UI rendering, player actions
- [x] `web-app/game.js` — pure game state module
- [x] `web-app/images/` — trail photographs and day maps (map-day1 to map-day5)

### Features

- Left panel: interactive map that switches image per day (Day 1–5), with trail nodes and an animated hiker character that changes appearance based on player condition
- Right panel: scrollable gear & inventory grid
- Trail board: horizontal node track showing visited/current/upcoming stations
- Expedition log: timestamped event history with progress bar

### Finally
- [x] Push to GitHub
- [x] Sync the changes
- [x] Check submission on GitHub website
