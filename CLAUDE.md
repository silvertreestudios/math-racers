# CLAUDE.md — Math Racers

## Overview

**Math Racers** is a racing-themed educational math game for elementary-age kids. Players solve arithmetic problems to power their race car — correct answers give speed boosts, streaks trigger nitro, and bucks unlock new content.

- **Target:** Kindle Fire (Silk browser), works on any modern browser
- **Deployed:** https://silvertreestudios.github.io/math-racers/
- **Auto-deploys:** GitHub Pages on push to `main`

## Tech Stack

- **Engine:** Phaser 3.80+ (HTML5 Canvas/WebGL)
- **Language:** Vanilla JavaScript (ES6+ modules). **No TypeScript.**
- **Build:** Vite 5.x
- **Persistence:** LocalStorage only (no backend)
- **Fonts:** System fonts only (no external font loading)

## Project Structure

```
math-racers/
├── index.html              # Entry HTML + CSS-rotation orientation strategy
├── package.json
├── vite.config.js
├── DESIGN.md               # Full game design document
├── CLAUDE.md               # This file
├── .github/workflows/      # GitHub Pages deploy
├── src/
│   ├── main.js             # Phaser game config & boot
│   ├── scenes/
│   │   ├── BootScene.js        # Asset preloading
│   │   ├── TitleScene.js       # Title screen + RACE! button
│   │   ├── ClassSelectScene.js # Pick a racing class (operation)
│   │   ├── TrackSelectScene.js # Pick a track within a class
│   │   ├── RaceScene.js        # Core gameplay
│   │   └── ResultsScene.js     # Post-race results + bucks
│   ├── systems/
│   │   ├── MathEngine.js       # Problem generation + smart distractors (all 4 ops)
│   │   ├── AIRacer.js          # AI opponent behavior (per-class calibration)
│   │   └── ProgressManager.js  # Save/load, class/track unlocks, trophies
│   └── config/
│       ├── constants.js    # Game constants (speeds, bucks, streaks)
│       ├── cars.js         # Car colors and AI names per class
│       └── tracks.js       # All 4 classes + 20 track definitions
└── public/assets/          # Static assets (placeholder for now)
```

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server on port 3000
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

## Workflow

- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Build must pass (`npm run build`) before pushing
- Push to `main` triggers GitHub Pages deploy automatically
- Never use `sudo`

---

## Design Requirements (MANDATORY)

These are non-negotiable. Every scene, every UI element must follow these rules.

### Layout & Responsive Design

1. **Full-screen adaptive canvas** — The game MUST fill the entire screen on any device. No letterboxing, no dead space, no black bars. Use `Phaser.Scale.RESIZE` so the game adapts to the actual viewport dimensions.

2. **Landscape-always via CSS rotation** — The game MUST always appear in landscape orientation. If the device is in portrait, `#game-container` is CSS-rotated 90° clockwise with swapped dimensions (width↔height). Touch/pointer coordinates are remapped in the capture phase before Phaser's input manager sees them. The Screen Orientation API lock is attempted as a best-effort bonus but is NOT relied upon. **No "please rotate" overlay** — the game handles it silently.

3. **20px safe area padding** — ALL buttons, text, and interactive elements MUST be at least 20px from every screen edge. No element should ever be clipped or hidden under browser chrome.

4. **Proportional positioning** — All layout positions MUST use `this.scale.width` / `this.scale.height` (percentage-based), never hardcoded pixel coordinates that assume a fixed resolution.

5. **Touch targets** — All interactive buttons MUST be at least 48dp (48 CSS pixels). Kindle Fire has large fingers tapping it.

### Math & Gameplay

- **Smart distractors ONLY** — never generate random wrong answers. Use operation-specific strategies: off-by-one, wrong-operation, carry/borrow errors, digit swaps, nearby values, off-by-factor, partial-product.
- **No fail state** — wrong answers slow you down but you always finish the race.
- **Problems keep coming** until the player's car crosses the finish line.
- **No-repeat rule** — track the last 5 problem keys per race and regenerate on collision (bail-out after 10 attempts to handle tiny number ranges).

### AI Calibration

- AI difficulty is calibrated **per class** using `accuracyForClass(classId)` and `avgAnswerTimeMsForClass(classId)` from ProgressManager.
- First race in a new class defaults to 70% accuracy / 4,000ms (approachable). Do NOT use the global `accuracy` / `avgAnswerTimeMs` getters for AI construction.

### Bucks Calculation

Bucks scale by class multiplier and track index. Always compute in ResultsScene as:
```js
const scaledPosition = Math.round(BUCKS_BY_POSITION[pos-1] * multiplier);
const trackBonus = Math.round(Math.round(BUCKS_BY_POSITION[0] * multiplier) * 0.1 * trackIndex);
const positionPayout = scaledPosition + trackBonus;
// Bonuses also scale:
const accuracyBonus = accuracy === 100 ? Math.round(BUCKS_ACCURACY_BONUS * multiplier) : 0;
const streakBonus   = streak >= 5      ? Math.round(BUCKS_STREAK_BONUS   * multiplier) : 0;
```

### General Rules

- LocalStorage for all persistence (no backend, no server calls)
- No TypeScript, no external fonts, no `sudo`
- System font stack: `Arial Black, Arial, sans-serif`
- Schema version is currently **2** — bump and migrate gracefully when adding new save fields
