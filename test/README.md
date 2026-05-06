# Visual Attachment Testing

## Overview

Math Racers uses vector-drawn (Phaser Graphics) car attachments. Since there are 50 cosmetic attachments across 5 car types, visual rendering issues are common and hard to catch manually. This test harness automates the capture + review cycle.

## Architecture

```
test/
├── CLAUDE.md              # Instructions for Claude Code autonomous review
├── visual-test.html       # Phaser page that renders one car+attachment at 256×256
├── capture-all.cjs        # Puppeteer script to capture all 55 screenshots
├── capture-one.cjs        # Capture a single specific combination
└── screenshots/           # Output: 55 PNG files (256×256 each)
    ├── addition-bare.png
    ├── addition-racing-stripe.png
    ├── addition-crown.png
    └── ...
```

## Quick Start

```bash
# 1. Start dev server
npm run dev

# 2. Capture all 55 renders
node test/capture-all.cjs

# 3. View individual renders in browser
open http://localhost:3000/test/visual-test.html?class=addition&attachment=crown

# 4. View the index of all combinations
open http://localhost:3000/test/visual-test.html
```

## The Autonomous Review Technique

### How it works

Claude Code can review and fix attachment renders autonomously by:
1. Running `capture-all.cjs` to generate 256×256 PNGs
2. Reading each PNG with its built-in inline vision
3. Comparing against expected descriptions in `test/CLAUDE.md`
4. Editing `src/config/attachments.js` to fix broken draw functions
5. Re-capturing and re-verifying until all pass

### Why this works better than external vision APIs

| Approach | Pros | Cons |
|----------|------|------|
| External vision model (gpt-5.4-mini, etc.) | Cheap per call | Low resolution, no code context, needs explicit spatial prompts, model availability issues |
| Sub-agent with full-grid screenshot | Fast (one image) | 120px per cell is too small for reliable judgment |
| **Claude Code inline vision** | Full code context + image simultaneously, can fix immediately, no API availability issues | Costs more per review (uses main model), slower per image |

### When to run

- After changing any `draw()` function in `attachments.js`
- After adding new attachments
- After modifying `CarRenderer.js` (base car shapes)
- As a periodic quality check

### How to trigger

Send to the Claude Code ACP session:
```
Read test/CLAUDE.md and follow the visual review workflow. 
Review all 55 screenshots and fix any issues.
```

Or for a specific car class only:
```
Read test/CLAUDE.md. Only review the multiplication (monster truck) attachments.
Run node test/capture-all.cjs first, then check test/screenshots/multiplication-*.png
```

## Expected Descriptions

Full expected descriptions for all 50 attachments are in `test/CLAUDE.md`. These describe:
- What the attachment should look like
- Where it should be positioned relative to the car
- The car body coordinate ranges for spatial reference

## Prompt Engineering (for external vision model fallback)

If using an external vision model instead of Claude Code inline vision, the prompt needs:
1. **Spatial expectations** — explicitly state WHERE the attachment should be ("ABOVE the body", "ON the helmet")
2. **Specific positional questions** — "Is it above or below the body line?"
3. **The correct description** to compare against

A generic "does this look right?" prompt fails because small-model vision can't infer positioning expectations from a 256px game sprite alone.

See `test/PROMPT-ENGINEERING.md` for detailed prompt iteration notes.

## File Reference

- `src/config/attachments.js` — all 50 attachment definitions + draw functions
- `src/systems/CarRenderer.js` — base car rendering (shared between RaceScene + GarageScene)
- `src/config/cars.js` — car color palettes
- `src/config/tracks.js` — class definitions (color, car type)
