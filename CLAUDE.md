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
├── index.html              # Entry HTML + portrait overlay + orientation CSS
├── package.json
├── vite.config.js
├── DESIGN.md               # Full game design document
├── CLAUDE.md               # This file
├── .github/workflows/      # GitHub Pages deploy
├── src/
│   ├── main.js             # Phaser game config & boot
│   ├── scenes/
│   │   ├── BootScene.js    # Asset preloading
│   │   ├── TitleScene.js   # Title screen + RACE! button
│   │   ├── RaceScene.js    # Core gameplay
│   │   └── ResultsScene.js # Post-race results
│   ├── systems/
│   │   ├── MathEngine.js   # Problem generation + smart distractors
│   │   ├── AIRacer.js      # AI opponent behavior
│   │   └── ProgressManager.js # Save/load via LocalStorage
│   └── config/
│       ├── constants.js    # Game constants (speeds, bucks, streaks)
│       ├── cars.js         # Car definitions
│       └── tracks.js       # Track definitions
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

2. **Landscape orientation lock** — The game MUST lock to landscape via the Screen Orientation API (`screen.orientation.lock('landscape')`). If on a portrait device that can't lock, show a full-screen "Please rotate your device" overlay that auto-hides when landscape is detected.

3. **20px safe area padding** — ALL buttons, text, and interactive elements MUST be at least 20px from every screen edge. Account for mobile safe areas (notches, rounded corners) using CSS `env(safe-area-inset-*)`. No element should ever be clipped or hidden under browser chrome.

4. **Proportional positioning** — All layout positions MUST use `this.scale.width` / `this.scale.height` (percentage-based), never hardcoded pixel coordinates that assume a fixed resolution.

5. **Touch targets** — All interactive buttons MUST be at least 48dp (48 CSS pixels). Kindle Fire has large fingers tapping it.

### Math & Gameplay

- Smart distractors ONLY — never generate random wrong answers. Use: off-by-one, wrong-operation, carry errors, digit swaps, nearby values.
- No fail state — wrong answers slow you down but you always finish.
- Problems keep coming until the player's car crosses the finish line.

### General Rules

- LocalStorage for all persistence (no backend, no server calls)
- No TypeScript, no external fonts, no `sudo`
- System font stack: Arial Black, Arial, sans-serif
