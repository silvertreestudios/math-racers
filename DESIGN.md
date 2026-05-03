# Math Racers — Game Design Document

## Overview

**Math Racers** is a racing-themed educational math game for elementary-age kids. Players solve arithmetic problems to power their race car through a season of tracks, unlocking new vehicles and racing classes as their skills grow.

The game is designed to **grow with the player** — from basic addition through long division, exponents, roots, and order of operations.

---

## 1. Core Concept

### The Pitch
> "Solve math problems to make your car go fast. Get streaks for nitro. Win races, earn trophies, unlock cars."

### Core Loop
```
Pick a Race → Solve Problems → Car Moves → Finish → Earn Trophies → Unlock Stuff
```

### Design Pillars
1. **Fun first, education second** — it should feel like a racing game that happens to teach math, not a quiz with car wallpaper
2. **Adaptive difficulty** — always in the flow zone; ramps up when the kid is crushing it, eases off when they're struggling
3. **No fail state** — wrong answers slow you down, but you always finish. The goal is personal improvement, not punishment
4. **Short sessions** — a race is 2-3 minutes. Perfect for bursts of play

---

## 2. Racing Classes (Math Operations)

Each math operation is a **racing class** with its own car type and season of tracks. Players unlock classes by earning enough trophies in the previous one.

| Class | Operation | Car Type | Unlock |
|-------|-----------|----------|--------|
| 🟢 Rookie League | Addition | Go-Karts | Start here |
| 🔵 Amateur Circuit | Subtraction | Stock Cars | 🏆×10 from Rookie |
| 🟡 Pro Series | Multiplication | Sports Cars | 🏆×10 from Amateur |
| 🔴 Championship | Division | Muscle Cars | 🏆×10 from Pro |
| ⚡ Superclass | Exponents & Roots | Supercars | 🏆×10 from Championship |
| 🏁 Grand Prix | Order of Operations / Formulas | Formula 1 | 🏆×10 from Superclass |

### Track Difficulty Progression (per class)

Each class has **5 tracks** that introduce progressively harder problems:

**Example — Rookie League (Addition):**
1. **Starter Speedway** — single + single (3+4)
2. **Clover Circuit** — double + single (25+7)
3. **Sunset Raceway** — double + double (34+28)
4. **Mountain Pass** — triple + double (142+67)
5. **Thunder Road** — triple + triple (385+247)

Unlock the next track by placing **top 2** in the current one.

---

## 3. Race Mechanics

### How a Race Works
1. **Pre-race:** Player sees the track, their car, and the 3 AI opponents
2. **Countdown:** 3... 2... 1... GO!
3. **Racing:** A math problem appears at the bottom of the screen with 4 answer buttons (2×2 grid)
   - **Correct answer:** Car surges forward (speed boost). Quick answer = bigger boost
   - **Wrong answer:** Car slows down. Correct answer flashes briefly on screen (learning moment). Move on to next problem
4. **Streak bonuses:**
   - 3 correct in a row = 🔥 Nitro Boost (big speed burst + visual effect)
   - 5 in a row = ⚡ Turbo (even bigger burst)
   - 10 in a row = 🌟 Supercharge (massive burst + special animation)
5. **Race ends** after 10 problems (or when all cars cross the finish line)
6. **Results screen:** Finishing position, time, accuracy %, streak info, trophies earned

### Scoring & Trophies
- 🥇 1st place: 3 trophies
- 🥈 2nd place: 2 trophies
- 🥉 3rd place: 1 trophy
- 4th place: 0 trophies (but you still finished!)
- **Bonus trophy** for 100% accuracy on any race

### AI Opponents
- 3 AI cars per race, each with a name and personality
- Their speed is calibrated to the player's recent performance
- They occasionally "make mistakes" (slow down) to keep races competitive
- As the player improves, AI gets faster — always a challenge, never unbeatable

---

## 4. Answer Generation (Smart Distractors)

Multiple choice with **4 options** — the wrong answers are never random. They're based on common mistakes:

| Strategy | Example (7 × 8 = 56) |
|----------|----------------------|
| Off by one | 55, 57 |
| Wrong operation | 15 (7+8) |
| Digit/table confusion | 54 (6×9), 63 (7×9) |
| Carry error | 48, 64 |

Rules:
- All distractors are positive integers (no negatives, no fractions, no zero for most problems)
- Distractors are always "close" to the real answer (within a reasonable range)
- Distractors are shuffled randomly among the 4 positions
- No two distractors are the same

---

## 5. Adaptive Difficulty

The game tracks a rolling window of the last 20 answers:

| Accuracy | Action |
|----------|--------|
| > 90% | Increase difficulty (harder numbers, tighter distractors) |
| 70-90% | Stay at current level (the sweet spot) |
| < 70% | Decrease difficulty (simpler numbers, more spread distractors) |

Difficulty adjustments within a track:
- **Number size** — bigger or smaller operands
- **Distractor closeness** — wrong answers closer or farther from correct
- **Time pressure** — AI opponents speed up or slow down (indirect pressure)

---

## 6. Progression & Unlocks

### Garage
- Each racing class starts with a **default car**
- Earn trophies to unlock **new car skins** (palette swaps, decals, body kits)
- ~3 unlockable skins per class for MVP
- Later: parts upgrades (engine, tires, paint) that give small cosmetic differences

### Trophy Case
- Visual display of all trophies earned
- Track records (best time, best accuracy per track)
- Total trophies across all classes

### Season Standings
- Per-class leaderboard showing points across all tracks
- "Complete the season" by placing well across all 5 tracks

---

## 7. Screen Flow

```
┌─────────┐
│  TITLE  │ → Title screen with logo, "START" button, music
└────┬────┘
     ▼
┌─────────┐
│ GARAGE  │ → Car select (shows unlocked cars for current class)
└────┬────┘
     ▼
┌─────────┐
│ CLASS   │ → Pick racing class (go-karts, stock cars, etc.)
│ SELECT  │   Locked classes shown grayed out with trophy requirement
└────┬────┘
     ▼
┌─────────┐
│ TRACK   │ → Pick a track within the class
│ SELECT  │   Shows best finish, locked tracks grayed
└────┬────┘
     ▼
┌─────────┐
│  RACE   │ → The actual gameplay
└────┬────┘
     ▼
┌─────────┐
│ RESULTS │ → Position, accuracy, trophies earned, "NEXT RACE" or "GARAGE"
└────┬────┘
     ▼
┌─────────┐
│ TROPHY  │ → (optional) View trophy case / records
│  CASE   │
└─────────┘
```

---

## 8. Visual Design

### Art Style
**Cartoon with bold outlines and bright colors** — mobile game aesthetic.

- Clean shapes, thick outlines, saturated colors, simple shading
- AI-generated using prompts like: "cartoon race car, mobile game asset, bold outline, flat shading, bright colors, transparent background"
- Consistent style across all assets

### Race View
- **Side-scrolling** (left to right)
- Parallax scrolling background (sky → mountains → trees → road)
- 4 cars visible on a multi-lane track
- Problem + answer buttons overlaid at bottom of screen (large touch targets)

### UI Targets
- Minimum touch target: **48×48 dp** (Kindle-friendly)
- Answer buttons: large 2×2 grid, bottom third of screen
- Problem text: large, clear font, top-center
- Car action: middle of screen

---

## 9. Audio

### Sound Effects
- Engine rev (constant, pitch shifts with speed)
- Correct answer: satisfying "ding" + whoosh (speed boost)
- Wrong answer: gentle "bonk" + tire screech
- Streak nitro: rocket boost sound
- Race start: countdown beeps + horn
- Race finish: checkered flag + crowd cheer
- Trophy earned: fanfare
- Menu navigation: soft clicks

### Music
- Upbeat, energetic racing music during races
- Chill menu/garage music
- Victory jingle for 1st place

---

## 10. Technical Architecture

### Stack
- **Engine:** Phaser 3.80+
- **Language:** JavaScript (vanilla ES6+, no TypeScript for MVP)
- **Build:** Vite (fast dev server, simple bundling)
- **Target browser:** Silk (Chromium-based, Kindle Fire)
- **Data persistence:** LocalStorage (no backend)
- **Audio:** Phaser Sound Manager (Web Audio API)

### Project Structure
```
math-racers/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js              # Phaser game config & entry
│   ├── scenes/
│   │   ├── BootScene.js      # Asset preloading
│   │   ├── TitleScene.js     # Title screen
│   │   ├── GarageScene.js    # Car selection
│   │   ├── ClassSelectScene.js
│   │   ├── TrackSelectScene.js
│   │   ├── RaceScene.js      # Core gameplay
│   │   └── ResultsScene.js   # Post-race results
│   ├── systems/
│   │   ├── MathEngine.js     # Problem generation + distractors
│   │   ├── DifficultyManager.js  # Adaptive difficulty
│   │   ├── AIRacer.js        # AI opponent behavior
│   │   └── ProgressManager.js    # Save/load, trophies, unlocks
│   └── config/
│       ├── tracks.js         # Track definitions
│       ├── cars.js           # Car definitions
│       └── constants.js      # Game constants
├── public/
│   └── assets/
│       ├── cars/             # Car sprites
│       ├── tracks/           # Track backgrounds
│       ├── ui/               # Buttons, icons, trophies
│       ├── audio/
│       │   ├── sfx/          # Sound effects
│       │   └── music/        # Background music
│       └── fonts/
├── DESIGN.md                 # This file
└── README.md
```

### Save Data Schema (LocalStorage)
```json
{
  "mathRacers": {
    "version": 1,
    "player": {
      "name": "Player 1",
      "totalTrophies": 0,
      "selectedCar": "kart-default"
    },
    "classes": {
      "addition": {
        "unlocked": true,
        "tracks": {
          "starter-speedway": { "bestPosition": null, "bestAccuracy": null, "trophies": 0 },
          "clover-circuit": { "unlocked": false },
          ...
        },
        "unlockedCars": ["kart-default"]
      },
      ...
    },
    "stats": {
      "totalRaces": 0,
      "totalCorrect": 0,
      "totalAnswered": 0,
      "bestStreak": 0,
      "recentAnswers": []
    }
  }
}
```

---

## 11. MVP Scope (v0.1)

**In scope:**
- [x] Phaser 3 + Vite project scaffold
- [ ] Title screen
- [ ] One racing class: Addition (Go-Karts)
- [ ] 5 tracks with progressive difficulty
- [ ] 10 problems per race, 4 multiple-choice answers
- [ ] Smart distractor generation
- [ ] Basic adaptive difficulty
- [ ] Side-scrolling race view with 4 cars
- [ ] Streak bonuses (visual + speed boost)
- [ ] 3 AI opponents with adaptive speed
- [ ] Results screen with position + accuracy
- [ ] Trophy system (earn + display)
- [ ] Track unlocking (top 2 to advance)
- [ ] Car select (1 default + 2 unlockable skins)
- [ ] LocalStorage save/load
- [ ] Sound effects (correct, wrong, nitro, race start/finish)
- [ ] Background music (1 race track, 1 menu track)
- [ ] Touch-optimized UI (48dp+ touch targets)

**Out of scope for MVP (future features):**
- [ ] Subtraction, multiplication, division classes
- [ ] Exponents, roots, order of operations
- [ ] Parts/upgrade system
- [ ] Animated car customization
- [ ] Online leaderboards
- [ ] Multiple save profiles
- [ ] Capacitor APK build for Kindle app store
- [ ] Accessibility features (colorblind mode, dyslexia font)
- [ ] Parent dashboard (track kid's progress/weak areas)
- [ ] "Story mode" with character dialogue between races

---

## 12. Future Vision

### Phase 2 — Full Arithmetic
- Add Subtraction, Multiplication, Division classes
- Full garage with 24 cars (4 per class × 6 classes)
- 30 tracks total

### Phase 3 — Advanced Math
- Exponents & Roots (Superclass)
- Order of Operations (Grand Prix)
- Formula challenges

### Phase 4 — Polish & Distribution
- Wrap as Android APK (Capacitor or Cordova)
- Sideload or publish to Amazon Appstore
- Parent dashboard
- Multiple profiles (siblings)

### Dream Features
- Local multiplayer (split screen or pass-and-play)
- Weekly challenges
- Custom track creator
- Voice-read problems for pre-readers
