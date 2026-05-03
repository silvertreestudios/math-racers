# Math Racers — Game Design Document

## Overview

**Math Racers** is a racing-themed educational math game for elementary-age kids. Players solve arithmetic problems to power their race car through a season of tracks, unlocking new vehicles and racing classes as their skills grow.

The game is designed to **grow with the player** — from basic addition through long division, exponents, roots, and order of operations.

---

## 1. Core Concept

### The Pitch
> "Solve math problems to make your car go fast. Get streaks for nitro. Win races, earn bucks, buy faster cars."

### Core Loop
```
Pick a Race → Solve Problems → Car Moves → Finish → Earn Bucks → Buy Cars & Unlock Classes
```

### Design Pillars
1. **Fun first, education second** — it should feel like a racing game that happens to teach math, not a quiz with car wallpaper
2. **Adaptive difficulty** — always in the flow zone; ramps up when the kid is crushing it, eases off when they're struggling
3. **No fail state** — wrong answers slow you down, but you always finish. The goal is personal improvement, not punishment
4. **Short sessions** — a race is 2-3 minutes. Perfect for bursts of play

---

## 2. Racing Classes (Math Operations)

Each math operation is a **racing class** with its own car type and season of tracks. Players unlock classes by saving up enough **bucks** to buy the next car class.

| Class | Operation | Car Type | Cost to Unlock |
|-------|-----------|----------|----------------|
| 🟢 Rookie League | Addition | Go-Karts | Free (start here) |
| 🔵 Amateur Circuit | Subtraction | Stock Cars | 💵 500 |
| 🟡 Pro Series | Multiplication | Sports Cars | 💵 1,500 |
| 🔴 Championship | Division | Muscle Cars | 💵 3,000 |
| ⚡ Superclass | Exponents & Roots | Supercars | 💵 5,000 |
| 🏁 Grand Prix | Order of Operations / Formulas | Formula 1 | 💵 10,000 |

_Costs are tunable — will balance during playtesting._

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

### Bucks (Currency)
Bucks are the in-game currency earned from every race. More bucks for higher placement:
- 🥇 1st place: 💵 50
- 🥈 2nd place: 💵 30
- 🥉 3rd place: 💵 15
- 4th place: 💵 5 (you still get something!)
- **Accuracy bonus:** +💵 25 for 100% accuracy
- **Streak bonus:** +💵 10 for any streak ≥ 5

Bucks are spent in the **Garage** on new cars, car skins, and unlocking new racing classes. This gives players a reason to **replay earlier tracks** — grind bucks on races they're good at to save up for the next class.

_All amounts are tunable — will balance during playtesting._

### Track Trophies
Each track has a **trophy** with 4 tiers based on your best finish:
- 🏆 **Gold** — 1st place finish
- 🥈 **Silver** — 2nd place finish
- 🥉 **Bronze** — 3rd place finish
- 🏅 **Participant** — 4th place finish

Trophies are per-track records. Replay a track and finish higher to upgrade the trophy. They're for bragging rights / completionism, not currency.

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

### Garage (Shop)
- **Buy new racing classes** — spend bucks to unlock the next car type + its tracks
- **Buy car skins** — palette swaps, decals, body kits within a class (💵 50-200 each)
- Each class has 1 default car + ~3 purchasable skins
- Later: parts upgrades (engine, tires, paint) as cosmetic purchases

### Trophy Wall
- Visual grid showing every track's trophy (gold/silver/bronze/participant)
- Track records (best time, best accuracy per track)
- Motivates completionists to gold every track

### Wallet
- Running bucks total displayed in UI header at all times
- Transaction history not needed for MVP — just the balance

---

## 7. Screen Flow

```
### Full Game (post-MVP)
```
┌─────────┐
│  TITLE  │ → Title screen with logo, "START" button, music
└────┬────┘
     ▼
┌─────────┐
│ GARAGE  │ → Car select + shop (buy cars, skins, new classes)
│  SHOP   │   Shows bucks balance, locked items grayed with price
└────┬────┘
     ▼
┌─────────┐
│ CLASS   │ → Pick racing class (unlocked ones only)
│ SELECT  │
└────┬────┘
     ▼
┌─────────┐
│ TRACK   │ → Pick a track within the class
│ SELECT  │   Shows trophy tier, locked tracks grayed
└────┬────┘
     ▼
┌─────────┐
│  RACE   │ → The actual gameplay
└────┬────┘
     ▼
┌─────────┐
│ RESULTS │ → Position, accuracy, bucks earned, trophy tier
│         │   "RACE AGAIN" / "NEXT TRACK" / "GARAGE"
└────┬────┘
     ▼
┌─────────┐
│ TROPHY  │ → (optional) View trophy wall / records
│  WALL   │
└─────────┘
```

### MVP (v0.1)
```
┌─────────┐
│  TITLE  │ → Logo + "RACE!" button
└────┬────┘
     ▼
┌─────────┐
│  RACE   │ → Core gameplay (addition, single difficulty)
└────┬────┘
     ▼
┌─────────┐
│ RESULTS │ → Position, accuracy, bucks earned → "RACE AGAIN"
└─────────┘
```
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
      "bucks": 0,
      "selectedCar": "kart-default"
    },
    "classes": {
      "addition": {
        "unlocked": true,
        "tracks": {
          "starter-speedway": { "bestPosition": null, "bestAccuracy": null, "trophy": null },
          "clover-circuit": { "unlocked": false }
        },
        "ownedCars": ["kart-default"]
      }
    },
    "stats": {
      "totalRaces": 0,
      "totalCorrect": 0,
      "totalAnswered": 0,
      "bestStreak": 0,
      "totalBucksEarned": 0,
      "recentAnswers": []
    }
  }
}
```

---

## 11. MVP Scope (v0.1)

**Goal:** Bare-minimum playable game — the core race loop only.

**In scope:**
- [ ] Phaser 3 + Vite project scaffold
- [ ] **Title screen** — logo + "RACE!" button
- [ ] **Race screen** — the core gameplay:
  - Addition problems only (single + single digit to start)
  - 10 problems per race, 4 multiple-choice answers
  - Smart distractor generation
  - Player car + 3 AI cars (simple constant-speed AI)
  - Side-scrolling race view
  - Correct = speed boost, wrong = slow down + flash answer
  - Streak bonuses (visual + speed boost at 3/5/10)
- [ ] **Results screen** — position, accuracy, bucks earned, "RACE AGAIN" button
- [ ] Bucks earned per race (displayed on results, persisted)
- [ ] LocalStorage save (bucks balance + stats only)
- [ ] Placeholder art (colored rectangles for cars, simple gradient background)
- [ ] Touch-optimized UI (48dp+ touch targets, 2×2 answer grid)

**Explicitly NOT in MVP:**
- ❌ Garage / shop / car selection
- ❌ Track selection (one hardcoded track)
- ❌ Class selection / multiple operations
- ❌ Trophy wall
- ❌ Adaptive difficulty (fixed difficulty for MVP)
- ❌ Sound effects / music
- ❌ AI-generated art assets
- ❌ Subtraction, multiplication, division, exponents, OoO
- ❌ Car skins / unlockables
- ❌ Multiple save profiles
- ❌ Capacitor APK build

**The test:** Can a kid tap "RACE", answer 10 addition problems, watch cars move, see who won, earn some bucks, and tap "RACE AGAIN"? If yes, MVP is done.

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
