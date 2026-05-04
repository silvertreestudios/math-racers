# 🏁 Math Racers

A racing-themed arithmetic game for kids built with [Phaser 3](https://phaser.io/).

Race Go-Karts, Rally Cars, Monster Trucks, and Formula 1 cars by solving math problems — correct answers give speed boosts, streaks trigger nitro, and earning bucks unlocks harder classes with bigger payouts.

**Play now:** https://silvertreestudios.github.io/math-racers/

---

## What's Built

### 4 Racing Classes · 20 Tracks

| Class | Operation | Car | Unlock |
|-------|-----------|-----|--------|
| 🟢 Rookie League | Addition | Go-Karts | Free |
| 🔵 Amateur Circuit | Subtraction | Rally Cars | 💵 1,000 |
| 🟡 Pro Series | Multiplication | Monster Trucks | 💵 5,000 |
| 🔴 Championship | Division | Formula 1 | 💵 10,000 |

Each class has 5 tracks of escalating difficulty. Place top 2 to unlock the next track. Earn bucks to unlock the next class.

### Features
- **Smart distractors** — wrong answers are never random; they mimic real mistakes (off-by-one, wrong-operation, carry/borrow errors, digit swaps)
- **No-repeat problems** — last 5 problems tracked per race to avoid seeing the same question twice
- **Streak bonuses** — 3/5/10 correct in a row triggers 🔥 Nitro / ⚡ Turbo / 🌟 Supercharge speed bursts
- **Scaled bucks** — harder classes (×1.5/×2/×3 multiplier) and later tracks (+10% per track) pay more
- **Per-class AI** — AI calibrates to your skill *in that specific class* so new classes always start approachable
- **Trophy system** — gold/silver/bronze per track based on your best finish
- **Always landscape** — CSS rotation handles portrait devices silently; no "please rotate" message

---

## Tech Stack

- **Engine:** [Phaser 3](https://phaser.io/) (HTML5 Canvas / WebGL)
- **Language:** Vanilla JavaScript (ES6+ modules)
- **Build:** Vite 5.x
- **Persistence:** LocalStorage (no backend)
- **Target:** Kindle Fire (Silk browser), works on any modern browser

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build → dist/
```

---

## License

Private — Silver Tree Studios
