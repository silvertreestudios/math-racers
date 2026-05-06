# Garage UX Design Review — Kid-Friendliness Audit

**Date:** 2026-05-04  
**Target user:** 6-year-old child on a Kindle Fire / iPad (touch only, limited reading)  
**Reviewer:** OpenClaw (from code review of `GarageScene.js`, `attachments.js`, `ProgressManager.js`)

---

## Executive Summary

The current Garage is functional but designed like an adult settings panel — text-heavy, dense grid, multi-step confirmation flows, and tiny touch targets. A 6-year-old will struggle with:
1. **Reading comprehension** — too many words, small text, status labels like "Owned" / "Equipped"
2. **Information density** — 10 attachments in a 3-column grid with 52px tall cards is overwhelming
3. **Conceptual complexity** — color purchase requires preview → confirm → purchase flow; attachment has buy vs. equip vs. unequip as three separate states
4. **Touch target sizes** — color swatches are 34px (below the 48dp minimum), attachment cards pack too tight
5. **Navigation** — the left/right arrow paradigm for switching cars isn't intuitive for young kids

Below is a detailed element-by-element audit with severity ratings and redesign suggestions.

---

## 1. Overall Layout

### Current Design
- Split layout: left 40% (car preview) / right 60% (color picker + attachment grid)
- Landscape-only, ~800×480 viewport

### Assessment: ⚠️ PROBLEMATIC
- **Split panels feel like an app settings page**, not a fun garage
- A 6-year-old's eye is drawn to the car but all the interactive elements are on the other side
- The right panel is dense — color swatches, a confirm button, a separator line, a section label, then a packed grid of cards with tiny text
- **No visual grouping** — the color section and attachment section blend together

### Recommendations
- **Full-width single-column layout** with the car centered at the top, customization options below
- Use **tab icons** (🎨 / ⚙️) to switch between color mode and attachment mode rather than showing both simultaneously
- Or: show the car large and centered, with a **horizontal scrollable strip** of options below it

---

## 2. Car Preview & Navigation

### Current Design
- Car drawn at 2.8× scale inside a container on the left panel
- `◀` and `▶` text characters for switching between unlocked classes
- Class name displayed below the car

### Assessment: ⚠️ NEEDS WORK
- **Arrows are plain text Unicode characters** (◀ ▶), not styled buttons — they have no background, no button shape, and blend into the dark background
- Arrow hit areas are just the text bounds (~32px) — too small for a 6-year-old's finger
- **No visual affordance** that these are tappable (no button shape, no color contrast)
- The car is nice but at 2.8× scale on the left 40%, it's actually quite small on a 480px tall screen
- **No animation** — switching cars is an instant re-render, no slide or transition
- Class name "Rookie League" / "Amateur Circuit" means nothing to a 6-year-old

### Recommendations
- Replace text arrows with **large colored arrow buttons** (rounded rectangles with ◀/▶ inside, 60×60px minimum, high contrast background)
- Add a **slide animation** when switching cars (old car slides out, new slides in)
- Replace class names with **car type names** prominently: "GO-KART" / "RALLY CAR" / "MONSTER TRUCK" — these are visual and meaningful to kids
- Show the car **centered and larger** (3.5-4× scale) — it's the star of the show
- Add **dots indicator** below the car (● ○ ○ ○ ○) showing which car you're on and how many there are

---

## 3. Color Picker

### Current Design
- Section label "🎨 COLOR" in 16px text
- 8 color swatches in a horizontal row, 34×34px each with 6px gaps
- White border on the currently active color, gray on others
- Tapping a new color previews it on the car
- A hidden "Confirm 💵10,000" button appears below, requiring a second tap to purchase
- Tapping the pending color again cancels the preview

### Assessment: ❌ POOR FOR KIDS
- **34px swatches violate the 48dp minimum touch target** — a 6-year-old will mis-tap constantly
- **8 swatches × 40px = 320px** — they span most of the right panel width with little breathing room
- **Two-step purchase flow** (tap to preview → tap "Confirm") is confusing for a young child. They'll tap a color, see the car change, think it's done, and navigate away without purchasing
- The confirm button text "Confirm 💵10,000" uses adult language — "Confirm" means nothing to a 6-year-old
- The "cancel by re-tapping" pattern is a hidden gesture — no visual indicator that tapping again cancels
- **No indication of which colors are already owned vs. available** — the only visual difference is the white border on the current color
- `RECOLOR_COST` constant at top of file is still `10000`, but the actual per-class cost comes from `tracks.js` `colorCost`. The confirm button text uses the old constant — **this is likely a display bug** showing 10,000 even when the actual cost is 1,000-5,000

### Recommendations
- **Increase swatch size to 56×56px** minimum, with 10px gaps
- Show **4 swatches per row in 2 rows** instead of 8 in one row — more breathing room
- Mark owned colors with a **✓ checkmark overlay** and unowned ones with a **💵 price tag below**
- **Remove the two-step confirm flow.** Instead: tap a color → if you own it, it equips immediately. If you don't own it, show a simple **"BUY? 💵1,000"** overlay directly on the swatch with a big ✅ / ❌ choice
- Or even simpler: tap unowned color → immediate purchase if you can afford it, with a celebratory "Got it!" animation. Kids don't need purchase confirmation for small amounts
- **Fix the cost display bug** — use the per-class `colorCost` from the class config, not the hardcoded `RECOLOR_COST = 10000`
- Add a **lock icon (🔒)** on colors you can't afford

---

## 4. Attachment Grid

### Current Design
- Section label "⚙ ATTACHMENTS" in 16px text
- 3-column grid of cards, each 52px tall
- Each card shows: attachment name (12px bold), status text below (11px)
- Status is one of: "💵 1,000" (unpurchased), "Owned" (bought, not equipped), "✓ Equipped" (active)
- Card background color changes: dark blue (unowned), dark gray-blue (owned), dark green (equipped)
- Stroke color changes: dark blue (unowned), gray (owned), green (equipped)
- Tapping an unowned attachment purchases it AND auto-equips
- Tapping an equipped attachment unequips it
- Tapping an owned-but-unequipped attachment equips it
- Cards that would overflow below the back button are silently dropped (`if (cy + cardH > h - SAFE_PADDING - 50) continue`)

### Assessment: ❌ POOR FOR KIDS
- **52px card height is too small** for a meaningful tap target, especially with 6px gaps
- **12px and 11px text** — unreadable for many 6-year-olds, and Kindle Fire pixel density makes this even tinier
- **"Owned" and "Equipped" are adult vocabulary** — a 6-year-old doesn't know what "Equipped" means
- **Three states (buy / owned / equipped) with subtle color differences** — the background colors `0x1a1a2e` vs `0x2a2a3a` vs `0x224422` are nearly indistinguishable, especially on a Kindle Fire's mediocre screen
- **No icons or preview** — attachment names like "Aero Canards" or "DRS Wing" are meaningless to a child. They can't see what the attachment looks like before buying
- **Silent card dropping** — if the screen is too small to fit all 10 attachments, some just don't render. No scroll, no indication that more exist
- **No visual feedback** on tap — the entire scene re-renders, which is jarring (everything flickers)
- **Auto-equip on purchase** is actually good — reduces steps. But the subsequent ability to unequip by tapping again is confusing because the same gesture (tap) does different things depending on state

### Recommendations
- **Increase card size to at least 80×64px** with larger text (16px name, 14px status)
- **Replace text status with icons:**
  - Unowned: 🔒 + 💵 price
  - Owned but not equipped: ☐ (empty checkbox)
  - Equipped: ☑ (checked) with green glow/border
- **Add a small preview thumbnail** — when you tap an attachment, show it on the car before committing. Or draw a tiny icon representation on each card
- **Use a vertical scrollable list** (2 columns) instead of a packed 3-column grid that clips
- **Add attachment icons/emojis** to each card to give visual meaning: 👑 Crown, 🦆 Rubber Ducky, 🔥 Flame Decal, ⭐ Star Antenna, etc.
- **Replace "Owned" / "Equipped" with visual states only** — green glow = on, gray = off, lock = can't buy
- **Add tap animation** (scale bounce) on purchase and equip/unequip instead of full re-render

---

## 5. Back Button

### Current Design
- "← Back" text on a 110×44px rectangle, bottom-left corner

### Assessment: ✅ ACCEPTABLE
- 110×44px is an adequate touch target
- Position is consistent with other scenes
- The "← Back" text is simple enough

### Recommendations
- Increase to 120×52px for more padding
- Could use a simple left arrow icon (◄) instead of the "← Back" text to be more icon-driven

---

## 6. Bucks Display

### Current Design
- "💵 {amount}" in 18px yellow text, top-right corner

### Assessment: ✅ GOOD
- Consistent with other screens
- The 💵 emoji is universally understood
- Amount updates when purchases happen

### Recommendations
- Add a **brief animation** (bounce, flash green/red) when bucks change after a purchase — gives the kid feedback that money was spent

---

## 7. Title

### Current Design
- "🔧 GARAGE" in 30px bold white text with blue stroke, top-center

### Assessment: ⚠️ MINOR
- "GARAGE" is a word most 6-year-olds know
- The wrench emoji helps convey meaning
- Good size and positioning

### Recommendations
- Could be "🔧 MY CARS" for slightly more kid-friendly language
- No major issue

---

## 8. Conceptual Flow

### Current Design
The garage presents everything at once: car switching, 8 colors, 10 attachments, purchase/equip/unequip states, back button, bucks balance — all on one screen.

### Assessment: ❌ OVERWHELMING
- A 6-year-old needs to understand: which car am I looking at, what can I buy, what do I own, what's equipped, how do I navigate
- That's 5 concepts on one screen with no progressive disclosure
- Adults can scan a grid and read labels; a 6-year-old sees a wall of rectangles

### Recommendations
**Simplify to a 2-step flow:**

**Screen 1 — Car Picker:**
- Full-screen car display, one at a time, big and centered
- Swipe or giant arrows to browse
- Car name and class emoji in big text
- "🎨 Customize!" button below → goes to Screen 2
- "← Back" returns to title

**Screen 2 — Customize This Car:**
- Car displayed at top, large
- Two big tab buttons: 🎨 (colors) and ⭐ (accessories)
- **Color tab:** 4×2 grid of big color circles (64px diameter), tap to preview, tap again to buy/apply. Owned colors have ✓, unaffordable have 🔒
- **Accessories tab:** Scrollable 2-column list of large cards (100px tall) with emoji icon + name + simple status (🔒💵500 / ☐ / ☑). Tap to toggle or buy
- "← Back" returns to Car Picker

This separates concerns and makes each decision simple.

---

## 9. Accessibility & Platform Issues

### Missing Features
- **No haptic/vibration feedback** on purchase (WebView/Phaser limitation, but worth noting)
- **No sound effects** — a purchase "ka-ching!" or equip "click" would help feedback enormously
- **No undo** — if a kid accidentally buys something, there's no way to undo. Consider a 3-second "Undo?" toast
- **Screen rotation** — the CSS rotation for portrait mode should work, but the dense right panel may render poorly on a narrow rotated view

### Kindle Fire Specific
- Kindle Fire screens have lower color accuracy — the subtle background color differences between card states will be nearly invisible
- Touch response on Kindle is slightly laggy — the full scene re-render on every tap will feel sluggish

---

## 10. Bugs Found During Review

1. **`RECOLOR_COST` constant is still 10000** at the top of GarageScene.js, used in the confirm button text. But actual costs are per-class (1k-5k) from `tracks.js`. The confirm button shows wrong price.

2. **Attachments silently clipped** — `if (cy + cardH > h - SAFE_PADDING - 50) continue` means on smaller screens some attachments are simply invisible with no scroll or "more" indicator.

3. **No prevention of equipping on wrong class** — `toggleAttachment` and `purchaseAttachment` in ProgressManager don't validate that the attachment belongs to the current classId. A coding bug could equip a Rally Car attachment on a Go-Kart.

---

## Priority Ranking

| Priority | Issue | Impact |
|----------|-------|--------|
| 🔴 P0 | Color swatch size (34px) violates 48dp minimum | Kids mis-tap constantly |
| 🔴 P0 | Attachment cards too small (52px tall, 11-12px text) | Unreadable + un-tappable |
| 🔴 P0 | Text-heavy status ("Owned" / "Equipped") instead of icons | 6YO can't read these |
| 🔴 P0 | RECOLOR_COST display bug (shows 10k, costs 1-5k) | Misleading price |
| 🟡 P1 | No visual preview of what attachment looks like | Kids buy blind |
| 🟡 P1 | Three-state cards with subtle color differences | Confusing + invisible on Kindle |
| 🟡 P1 | Two-step color confirm flow | Kids won't understand confirmation |
| 🟡 P1 | Dense everything-on-one-screen layout | Overwhelming |
| 🟡 P1 | Silent attachment clipping on small screens | Content missing |
| 🟢 P2 | No animation on car switch or purchase | Feels static |
| 🟢 P2 | Arrow navigation uses plain text | Low affordance |
| 🟢 P2 | No sound feedback | Silent purchases |
| 🟢 P2 | No undo on accidental purchase | Can't recover |

---

## Recommended Implementation Order

1. **Fix the RECOLOR_COST display bug** (5 min)
2. **Increase all touch targets** — swatches to 56px, cards to 80px+, arrows to 60px button shapes (30 min)
3. **Replace text states with icons** — 🔒/☐/☑ instead of "Owned"/"Equipped" (20 min)
4. **Add emoji icons to each attachment** in the card (15 min)
5. **Simplify color purchase** — remove confirm step, direct buy on tap (20 min)
6. **Add scrolling** for the attachment list so no cards get clipped (30 min)
7. **Restructure to 2-screen flow** (car picker → customization) if budget allows (2-3 hours)
8. **Add animations** — car slide, purchase bounce, bucks flash (1 hour)
