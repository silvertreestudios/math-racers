# Math Racers — Game Design Document

## Overview

**Math Racers** is a racing-themed educational math game for elementary-age kids. Players solve arithmetic problems to power their race car through a season of tracks, unlocking new vehicles and racing classes as their skills grow.

The game is designed to **grow with the player** — from basic addition through division.

---

## 1. Core Concept

### The Pitch
> "Solve math problems to make your car go fast. Get streaks for nitro. Win races, earn bucks, unlock new classes."

### Core Loop
```
Title → ClassSelect → TrackSelect → Race → Results → (Next Track / Race Again / Back to Tracks)
```

### Design Pillars
1. **Fun first, education second** — it should feel like a racing game that happens to teach math, not a quiz with car wallpaper
2. **Adaptive difficulty** — AI calibrated per-class so new classes always start approachable
3. **No fail state** — wrong answers slow you down, but you always finish
4. **Short sessions** — a race is 2-3 minutes, perfect for bursts of play

---

## 2. Racing Classes (Math Operations)

Each math operation is a **racing class** with its own car type and 5-track season. Players unlock classes by spending **bucks**.

| Class | Operation | Car Type | Unlock Cost | Bucks Multiplier |
|-------|-----------|----------|-------------|-----------------|
| 🟢 Rookie League | Addition | Go-Karts | Free | ×1 |
| 🔵 Amateur Circuit | Subtraction | Rally Cars | 💵 1,000 | ×1.5 |
| 🟡 Pro Series | Multiplication | Monster Trucks | 💵 5,000 | ×2 |
| 🔴 Championship | Division | Formula 1 | 💵 10,000 | ×3 |

### Track Difficulty Progression (5 tracks per class)

Unlock the next track by placing **top 2** in the current one.

**🟢 Rookie League (Addition):**
1. **Starter Speedway** — single + single (3+4)
2. **Clover Circuit** — double + single (25+7)
3. **Sunset Raceway** — double + double (34+28)
4. **Mountain Pass** — triple + double (142+67)
5. **Thunder Road** — triple + triple (385+247)

**🔵 Amateur Circuit (Subtraction):**
1. **Dusty Trail** — single − single (8−3)
2. **Gravel Gulch** — double − single (45−7)
3. **Mudslide Run** — double − double (73−28)
4. **Canyon Drift** — triple − double (342−67)
5. **Avalanche Alley** — triple − triple (501−247)

**🟡 Pro Series (Multiplication):**
1. **Crusher Circuit** — single × single (3×4)
2. **Rumble Road** — single × double (7×12)
3. **Smash Speedway** — double × single (23×6)
4. **Demolition Drive** — double × double (12×15)
5. **Titan Track** — double × double hard (34×27)

**🔴 Championship (Division):**
1. **Grand Straightaway** — simple (12÷3)
2. **Precision Curve** — even division (45÷5)
3. **Apex Run** — double ÷ single (84÷7)
4. **Victory Lane** — harder (144÷12)
5. **Champion's Ring** — triple ÷ double (936÷24)

---

## 3. Race Mechanics

### How a Race Works
1. **Race starts** immediately on scene load
2. **Racing:** A math problem appears with 4 answer buttons (1×4 horizontal row at screen bottom)
   - **Correct answer:** Car surges forward (speed boost), streak increments
   - **Wrong answer:** Car slows down, correct answer flashes briefly (learning moment)
3. **Streak bonuses:**
   - 3 correct in a row = 🔥 Nitro Boost (+80 px/s for 600ms)
   - 5 in a row = ⚡ Turbo (+120 px/s for 800ms)
   - 10 in a row = 🌟 Supercharge (+180 px/s for 1200ms)
4. **Race ends** 1.5s after player crosses the finish line (problems keep coming until then)
5. **Results screen:** Finishing position, accuracy %, streak, bucks earned

### Physics
- Base speed: 120 px/s
- Correct boost: +60 px/s for 400ms
- Wrong penalty: −50 px/s for 800ms
- Finish line: 6,000 logical px

### Bucks (Currency)

Bucks scale by **class multiplier** and **track index** (+10% of the scaled 1st-place value per subsequent track within a class):

**Base payouts (Addition ×1, track 1):**
- 🥇 1st place: 💵 50 · 🥈 2nd: 💵 30 · 🥉 3rd: 💵 15 · 4th: 💵 5
- **Perfect accuracy bonus:** +💵 25 · **Streak ≥5 bonus:** +💵 10
- All amounts scale with class multiplier and track index

**Full 1st-place payout table:**

| Track | 🟢 Addition ×1 | 🔵 Subtraction ×1.5 | 🟡 Multiplication ×2 | 🔴 Division ×3 |
|-------|---------------|--------------------|--------------------|--------------|
| Track 1 | 50 | 75 | 100 | 150 |
| Track 2 | 55 | 83 | 110 | 165 |
| Track 3 | 60 | 90 | 120 | 180 |
| Track 4 | 65 | 98 | 130 | 195 |
| Track 5 | 70 | 105 | 140 | 210 |

Accuracy and streak bonuses scale with the same class multiplier (e.g. perfect accuracy in a Division race is worth 💵 75).

### Track Trophies
- 🥇 **Gold** — 1st place · 🥈 **Silver** — 2nd place · 🥉 **Bronze** — 3rd place
- Replay a track and finish higher to upgrade the trophy
- Trophy dots shown on ClassSelect; trophy icons shown on TrackSelect

### AI Opponents
- 3 AI cars per race, calibrated to the player's **per-class** recent performance
- First race in a new class defaults to easier AI (70% accuracy, 4s answer time)
- After each race the window updates; AI ramps up as the player improves in that specific class
- AI accuracy is clamped to [0.30, 0.95]

---

## 4. Answer Generation (Smart Distractors)

Multiple choice with **4 options** — wrong answers are never random. Per-operation strategies:

| Operation | Distractor Strategies |
|-----------|----------------------|
| Addition | Off-by-one, wrong-op (subtract/multiply), digit-swap, carry-error, nearby ±2–4 |
| Subtraction | Off-by-one, wrong-direction (a+b), borrow-error (+10), digit-swap, nearby |
| Multiplication | Off-by-one, wrong-op (addition), off-by-factor ((a±1)×b), partial-product, digit-swap |
| Division | Off-by-one, wrong-divisor (÷(d±1)), remainder-confusion, divisor itself as distractor |

All distractors are positive integers. Three distractors are picked; if fewer than 3 are generated, padding uses `correct + rand(2,8)`.

**No-repeat rule:** The last 5 problem keys (operator+operands) per race are tracked. New problems are regenerated up to 10 times to avoid repeats. Falls back to blocking exact back-to-back repeats only on very small number ranges (e.g. single+single addition).

---

## 5. Adaptive Difficulty

AI difficulty is calibrated **per class** using a rolling window of the last 5 races for that specific class:

| Scenario | AI accuracy | AI avg answer time |
|---------|-------------|-------------------|
| No history for this class | 70% | 4,000ms (approachable) |
| Has class history | Player accuracy ±20% | Player avg time ±30% std dev |

Problem ranges are fixed per track — difficulty within a track is constant. Only AI speed adapts.

---

## 6. Progression & Unlocks

### Class Unlock Flow
1. Player accumulates bucks from racing
2. On ClassSelect, a BUY button appears on locked classes the player can afford
3. Purchasing deducts bucks and unlocks the class + its first track

### Track Unlock Flow
1. Finish 1st or 2nd on the current track
2. Next track in the same class unlocks automatically
3. Results screen shows "🔓 Unlocked: [track name]!" and a "▶ Next Track" button

### Trophy System
- Per-track best position is stored; trophy upgrades if you beat your previous best place
- Trophy dots on ClassSelect (colour-coded): 🔵 unlocked, 🥇/🥈/🥉 trophy tiers
- Trophy icons on TrackSelect alongside best-position label

---

## 7. Screen Flow

```
┌─────────┐
│  TITLE  │ → Logo, animated cars, "🏁 RACE!" button, bucks balance
└────┬────┘
     ▼
┌─────────┐
│  CLASS  │ → 2×2 grid; locked = grayed + price; BUY button if affordable;
│ SELECT  │   5 progress dots per class (blue=unlocked, gold/silver/bronze=trophy)
└────┬────┘
     ▼
┌─────────┐
│  TRACK  │ → 5-track list for chosen class; 🔒 / trophy + best-pos / ▶ GO!
│ SELECT  │
└────┬────┘
     ▼
┌─────────┐
│  RACE   │ → Side-scroll, math problems, 4 answer buttons, progress bar, streak HUD
└────┬────┘
     ▼
┌─────────┐
│ RESULTS │ → Position, track name, accuracy, streak, scaled bucks breakdown, wallet
│         │   "▶ Next Track" (if unlocked) · "🔄 Race Again" · "🏁 Tracks"
└─────────┘
```

---

## 8. Visual Design

### Art Style
Programmatic placeholder art — colored rectangles and canvas-drawn shapes. No external image assets currently.

### Race View
- **Side-scrolling** (left to right)
- Parallax layers: static sky gradient → mountains → trees/grass → road
- 4 canvas-drawn cars (player + 3 AI) on a multi-lane track with animated dashed center lines
- Problem + 4 answer buttons overlaid at bottom (1×4 horizontal row, full-width)
- HUD: finish-line progress bar (top-center), accuracy % + answered count, streak counter (top-right), streak label pop animation

### Car Colors (per class)
- 🟢 Addition: blue / red / orange / green
- 🔵 Subtraction: light blue / orange-red / light green / peach
- 🟡 Multiplication: gold / orange / purple / cyan
- 🔴 Division: red / sky blue / yellow / lavender

### Orientation Strategy
- Game always appears **landscape** regardless of device orientation
- If device is portrait, `#game-container` is CSS-rotated 90° CW with swapped dimensions (width↔height)
- Touch/pointer coordinates are remapped in the capture phase before Phaser's input manager sees them
- Screen Orientation API + fullscreen lock fired on first user tap as a best-effort bonus
- No "please rotate" overlay — the game just works

### UI Targets
- Minimum touch target: **48×48 dp** (Kindle Fire friendly)
- All interactive elements: ≥20px from every screen edge (safe area padding)
- System font stack: `Arial Black, Arial, sans-serif`

---

## 9. Audio

Not yet implemented. Planned:
- Engine rev (constant, pitch shifts with speed)
- Correct answer: ding + whoosh · Wrong answer: bonk + screech
- Streak bursts: nitro rocket / turbo jet / supercharge launch
- Race start countdown + air horn · Race finish fanfare
- Upbeat energetic music during races · Chill menu music

---

## 10. Technical Architecture

### Stack
- **Engine:** Phaser 3.80+ (HTML5 Canvas / WebGL)
- **Language:** Vanilla JavaScript (ES6+ modules, **no TypeScript**)
- **Build:** Vite 5.x
- **Target:** Silk browser (Kindle Fire), any modern browser
- **Data persistence:** LocalStorage (schema v2), no backend

### Save Data Schema (LocalStorage key: `mathRacers`, version 2)
```json
{
  "version": 2,
  "player": { "name": "Player 1", "bucks": 0, "selectedCar": "kart-default" },
  "stats": {
    "totalRaces": 0,
    "totalCorrect": 0,
    "totalAnswered": 0,
    "bestStreak": 0,
    "totalBucksEarned": 0,
    "recentRaces": [],
    "recentRacesByClass": {
      "addition": [{ "correct": 8, "answered": 10, "avgTimeMs": 2400 }]
    }
  },
  "classState": {
    "addition":       { "unlocked": true },
    "subtraction":    { "unlocked": false },
    "multiplication": { "unlocked": false },
    "division":       { "unlocked": false }
  },
  "trackState": {
    "starter-speedway": { "unlocked": true, "bestPosition": 1, "trophy": "gold" },
    "clover-circuit":   { "unlocked": false, "bestPosition": null, "trophy": null }
  }
}
```

---

## 11. Implementation Status

### ✅ Completed
- [x] Phaser 3 + Vite scaffold, GitHub Pages auto-deploy (`main` branch)
- [x] **TitleScene** — logo, animated cars, RACE! button, bucks balance
- [x] **ClassSelectScene** — 4 classes, buy-to-unlock flow, progress dots
- [x] **TrackSelectScene** — 5 tracks per class, trophy icons, locked state
- [x] **RaceScene** — complete race loop
  - All 4 operations (addition, subtraction, multiplication, division)
  - Smart distractors per operation (never random wrong answers)
  - No-repeat problem history (last 5 per race)
  - Player + 3 AI cars, side-scrolling parallax
  - Speed boosts / penalties, streak bonuses (Nitro / Turbo / Supercharge)
  - Progress bar, accuracy %, streak counter HUD
- [x] **ResultsScene** — scaled bucks breakdown, Next Track / Race Again / Tracks buttons
- [x] **Bucks scaling** — class multiplier + per-track escalation (+10%)
- [x] **Track unlock** — top-2 finish unlocks next; notification + button on results
- [x] **Trophy system** — gold/silver/bronze per track based on best finish
- [x] **LocalStorage v2** — per-class race history, graceful migration from v1
- [x] **Per-class AI calibration** — new classes start at 70% acc / 4s; ramps with history
- [x] **Landscape-always** — CSS rotation + touch coord remap; no overlay
- [x] Proportional layout, 20px safe padding, 48dp touch targets, system fonts only

### ❌ Not Yet Implemented
- Garage / shop / car skins (cosmetic unlocks)
- Sound effects and music
- Adaptive problem difficulty within a track (fixed operand ranges per track currently)
- Trophy wall / per-track records screen
- Exponents, roots, order-of-operations classes
- Multiple save profiles
- Android APK build (Capacitor)

---

## 12. Future Vision

### Phase 2 — Polish
- Garage with car skins per class (💵 50–200 each)
- Sound effects + background music
- Adaptive problem difficulty within tracks (rolling accuracy window adjusts operand ranges)
- Trophy wall / records screen

### Phase 3 — Advanced Math
- Exponents & Roots class (⚡ Superclass)
- Order of Operations class (🏁 Grand Prix)
- Mixed-operation challenges

### Phase 4 — Distribution
- Android APK via Capacitor
- Amazon Appstore / sideload
- Parent dashboard, multiple profiles per device

### Dream Features
- Local multiplayer (pass-and-play)
- Weekly challenge tracks
- Voice-read problems for pre-readers
- Custom track creator
