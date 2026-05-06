# Visual Attachment Review — CLAUDE.md

## Your Task

You are reviewing and fixing the visual rendering of car attachments in Math Racers. The game draws cars and cosmetic attachments using Phaser Graphics (vector shapes). Some attachments have rendering issues (wrong position, too small, unrecognizable, etc.).

## Workflow

1. **Start the dev server:** `npm run dev` (runs on port 3000)
2. **Capture all 55 screenshots:** `node test/capture-all.cjs` — outputs 256×256 PNGs to `test/screenshots/`
3. **Review each screenshot** by reading the PNG files. Compare against the expected descriptions below.
4. **For any FAIL or MINOR issues:** edit `src/config/attachments.js` to fix the `draw()` function
5. **Re-capture the fixed ones** and verify they now look correct
6. **Repeat** until all 55 pass
7. **Run `npm run build`** to verify no build errors
8. **Commit** with `fix: improve attachment renders from visual review`

## How to Review

Read each PNG from `test/screenshots/`. The filename format is `{classId}-{attachmentId}.png`. Compare what you see against the expected description below. Ask yourself:
- Is the attachment clearly visible?
- Is it positioned correctly relative to the car body?
- Would a 6-year-old recognize what it's supposed to be?
- Does it look naturally attached (not floating randomly)?

## Car Types (for spatial reference)

- **Go-Kart (addition):** Low, flat pod. Driver helmet (red circle) at top. Wheels at bottom. Body is ~14px tall at 1× scale. Nose points right.
- **Rally Car (subtraction):** Wider hatchback shape. Roof is the top edge. Wheels below. Taller than go-kart.
- **Monster Truck (multiplication):** BIG wheels (the defining feature). Lifted body above wheels. Blocky.
- **Formula 1 (division):** Very low, sleek. Pointed nose right. Rear wing. Open cockpit with driver.
- **Supercar (advanced):** Lamborghini silhouette. Low, curved, aerodynamic. Closed cockpit.

## Expected Descriptions (what each attachment SHOULD look like)

### Go-Kart (addition) — base color: 0x00cccc (cyan)

| ID | Name | Expected |
|---|---|---|
| racing-stripe | Racing Stripe | A horizontal lighter/contrasting stripe running across the middle of the car body. Should be clearly visible as a different color from the base cyan. |
| flame-decal | Flame Decal | Orange/red flame shapes on the sides of the body, pointing backward (like speed flames). Multiple flame "licks." |
| rear-spoiler | Rear Spoiler | A horizontal wing/blade ABOVE the car body at helmet height, on two vertical supports connected to the car's rear. NOT at body/wheel level. |
| rocket-exhaust | Rocket Exhaust | A bigger/brighter flame coming from the exhaust at the rear — larger than the default small exhaust flame. Orange/yellow. |
| crown | Crown | A gold/yellow crown with pointed peaks, sitting directly ON TOP of the red driver helmet. |
| star-antenna | Star Antenna | A yellow/gold star shape at the top of a thin vertical stick/pole, rising from the car body. |
| googly-eyes | Googly Eyes | Two large white circles with black pupils on the FRONT/NOSE of the car. Should look like cartoon eyes. |
| rainbow-trail | Rainbow Trail | Multiple horizontal colored stripes (red, orange, yellow, green, blue, purple) extending BEHIND the rear of the car. Clearly a rainbow. |
| turbo-fan | Turbo Fan | A circular fan/turbine shape on the BACK of the car. Visible blades in a circle. |
| rubber-ducky | Rubber Ducky | A yellow rubber duck shape sitting ON TOP of the car body. Should have a recognizable duck silhouette (round body, head, beak). |

### Rally Car (subtraction) — base color: 0x4488ff (blue)

| ID | Name | Expected |
|---|---|---|
| mud-flaps-big | Mud Flaps | Rectangular flap/guard shapes behind the rear wheels, hanging down. Dark colored. |
| roof-rack | Roof Rack | A rectangular frame with cross-bars on TOP of the car's roof. Connected to the roof, not floating. |
| bull-bar | Bull Bar | A thick metal bar/guard mounted on the FRONT bumper. Protective bar shape. |
| rally-lights | Rally Lights | A row of circular white/yellow lights on the ROOF of the car. Multiple circles in a line. |
| racing-numbers | Racing Numbers | A visible "01" or number on the SIDE of the car body. Should be readable. |
| antenna-flag | Antenna Flag | A small triangular flag on a thin pole/antenna rising from the car. Flag should be colored. |
| snorkel | Snorkel | A thick vertical pipe on the SIDE of the car, going UP past the roofline. Has an opening/cap at top. |
| spare-tire | Spare Tire | A circular tire shape mounted on the BACK of the car. Black circle with rim detail. |
| camo-paint | Camo Paint | Irregular green/brown camo pattern patches OVERLAID on the car body. Multiple blotches. |
| cat-ears | Cat Ears | Two pink/colored triangular ear shapes on TOP of the car's roof. Clearly cat ears. |

### Monster Truck (multiplication) — base color: 0xffcc00 (yellow)

| ID | Name | Expected |
|---|---|---|
| smoke-stacks | Smoke Stacks | Tall vertical exhaust pipes going UP from behind the cab. Should be clearly taller than the truck body. |
| skull-hood | Skull Hood | A skull/death's head shape on the HOOD/FRONT of the truck. White skull with eye sockets. |
| chain-wheels | Chain Wheels | Chain link pattern AROUND the wheels. Gray/silver segments visible on the tire circumference. |
| lightning-bolts-decal | Lightning Bolts | Yellow/white lightning bolt zig-zag shapes on the SIDES of the truck body. |
| fire-wheels | Fire Wheels | Orange/red flame spike shapes around the WHEELS (not covering the whole car). |
| viking-horns | Viking Horns | Large curved bone-colored horns sweeping UP and OUTWARD from the top of the truck. High contrast against dark background. |
| spiked-bumper | Spiked Bumper | Sharp spike/triangle shapes on the FRONT bumper of the truck. Metallic gray. |
| monster-eyes | Monster Eyes | Two large angry eyes on the WINDSHIELD area. Red/orange with black pupils, slanted brows for angry look. |
| mohawk | Mohawk | A spiky ridge/row of triangles along the TOP CENTER of the truck, like a mohawk hairstyle. |
| bat-wings | Bat Wings | Purple/dark wing shapes extending from the SIDES of the truck. Bat-wing silhouette with membrane structure visible. |

### Formula 1 (division) — base color: 0xff4444 (red)

| ID | Name | Expected |
|---|---|---|
| shark-fin | Shark Fin | A tall vertical fin shape BEHIND the cockpit, like a shark's dorsal fin. Rises above the body line. |
| halo-ring | Halo Ring | A curved arc/ring shape ABOVE the cockpit opening, like the F1 halo safety device. |
| sponsor-stickers | Sponsor Stickers | Multiple small colorful rectangles/patches on the SIDES of the car body. Different colors. |
| drs-wing | DRS Wing | A TALLER/BIGGER rear wing than the car's default. Should be visibly larger than the standard rear wing. |
| led-strip | LED Strip | A glowing colored line/strip running along the BOTTOM edge of the car. Bright color (blue/green/purple). |
| gold-rims | Gold Rims | The wheel centers/rims colored GOLD/YELLOW instead of the default gray. |
| jet-engine | Jet Engine | A jet/rocket nozzle shape on the BACK/REAR of the car. Cone or circle shape suggesting thrust. |
| laser-antenna | Laser Antenna | A thin vertical antenna with a GLOWING RED tip/dot at the top. Rising from the car. |
| aero-canards | Aero Canards | Small winglet/fin shapes on the NOSE/FRONT of the car. Small aero surfaces. |
| top-hat | Top Hat | A small black top hat on the DRIVER'S head/helmet. Classic magician hat shape. |

### Supercar (advanced) — base color: 0xcc44ff (purple)

| ID | Name | Expected |
|---|---|---|
| carbon-fiber | Carbon Fiber | Dark/black textured overlay or pattern on parts of the car body. Should darken sections visibly. |
| neon-underglow | Neon Underglow | A bright glowing colored line UNDER the car (between body and ground). Neon green/cyan/purple glow. |
| extra-diffuser | Rear Diffuser | An aerodynamic piece on the REAR BOTTOM of the car. Fin/vane shapes at the back-bottom. |
| side-scoops | Side Scoops | Air intake openings/shapes on the SIDES of the car body. Dark openings or scooped shapes. |
| digital-camo | Digital Camo | Pixelated/blocky camo pattern (small squares) overlaid on the car body. Multiple colors. |
| diamond-grille | Diamond Grille | A sparkly/diamond pattern or bright spots on the FRONT grille area. Shiny/glittery appearance. |
| scissor-doors | Scissor Doors | Door shapes angled UPWARD from the car body (like Lamborghini doors). Lines suggesting open doors. |
| flame-thrower | Flame Thrower | Large flames shooting from the EXHAUST/REAR of the car. Bigger and more dramatic than normal exhaust. |
| angel-wings | Angel Wings | White wing shapes extending from the SIDES of the car. Feathered wing silhouette. |
| party-hat | Party Hat | A colorful cone-shaped party hat on TOP of the car/roof. Pointed cone with dots/stripes. |

## Fixing Attachments

All attachment draw functions are in `src/config/attachments.js`. Each attachment has a `draw(gfx, color)` function that receives:
- `gfx` — a Phaser Graphics object positioned at the car's center origin (0,0)
- `color` — the car's base color (hex number)

The car body spans roughly:
- **Go-kart:** x: -30 to +36, y: -17 to +14 (tiny)
- **Rally Car:** x: -34 to +34, y: -18 to +14
- **Monster Truck:** x: -30 to +30, y: -20 to +25 (big wheels extend below)
- **Formula 1:** x: -38 to +44, y: -14 to +10
- **Supercar:** x: -36 to +40, y: -14 to +12

Helmet/cockpit top is typically at y: -13 to -20 depending on car type.
Wheels are at y: +9 to +14 (go-kart) or +18 to +25 (monster truck).

## Important Rules

- Do NOT change the base car rendering (in `src/systems/CarRenderer.js`)
- Only fix the `draw()` functions in `attachments.js`
- Keep attachments small enough to not overwhelm the base car
- Ensure all attachments are visible at BOTH 1× scale (in-race) and 4× scale (in test renders)
- `npm run build` must pass after all changes
- Commit when done
