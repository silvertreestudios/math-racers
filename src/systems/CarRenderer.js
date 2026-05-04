/**
 * CarRenderer — shared car drawing functions extracted from RaceScene.
 * Each function draws a car centered at (0, 0) on the given Graphics object.
 *
 * @param {Phaser.GameObjects.Graphics} gfx
 * @param {number} color  Hex color for the car body
 * @param {boolean} isPlayer  Whether this is the player's car
 */

/** Darken a color by ~40% for shading/dark panels */
export function darkenColor(color) {
  const r = Math.floor(((color >> 16) & 0xff) * 0.6);
  const gr = Math.floor(((color >> 8) & 0xff) * 0.6);
  const b = Math.floor((color & 0xff) * 0.6);
  return (r << 16) | (gr << 8) | b;
}

// ── Go-Kart (Addition — Rookie League) ────────────────────────────────────
// Low, compact, open-top with a visible driver helmet, small wheels
export function drawGoKart(g, color, isPlayer) {
  const dark = darkenColor(color);

  // Main body — low flat pod
  g.fillStyle(color);
  g.fillRoundedRect(-26, -7, 52, 16, 4);

  // Side pods
  g.fillStyle(dark);
  g.fillRoundedRect(-28, -3, 10, 10, 2);
  g.fillRoundedRect(18, -3, 10, 10, 2);

  // Nose (front taper)
  g.fillStyle(color);
  g.fillTriangle(26, -4, 36, 0, 26, 4);

  // Open cockpit surround
  g.fillStyle(dark);
  g.fillRoundedRect(-10, -12, 22, 8, 3);

  // Driver helmet
  g.fillStyle(0xff3300);
  g.fillCircle(-2, -13, 7);
  g.fillStyle(0x88ccff, 0.85);
  g.fillRoundedRect(-5, -17, 10, 6, 2);   // visor

  // Wheels — small, 4 corners
  g.fillStyle(0x111111);
  g.fillCircle(-18, 9, 6);   // rear left
  g.fillCircle(18, 9, 6);    // front left
  // Wheel highlights
  g.fillStyle(0x444444);
  g.fillCircle(-18, 9, 3);
  g.fillCircle(18, 9, 3);

  // Exhaust pipe (rear right)
  g.fillStyle(0x888888);
  g.fillRect(-30, 2, 5, 4);

  // Headlights
  g.fillStyle(0xffffaa);
  g.fillCircle(30, -2, 3);
  g.fillCircle(30, 4, 3);
}

// ── Rally Car (Subtraction — Amateur Circuit) ──────────────────────────────
// Wider hatchback, roll cage, mud flaps, rear spoiler
export function drawRallyCar(g, color, isPlayer) {
  const dark = darkenColor(color);

  // Body — wider, taller than kart
  g.fillStyle(color);
  g.fillRoundedRect(-28, -10, 56, 22, 5);

  // Hatchback roofline
  g.fillStyle(dark);
  g.fillRoundedRect(-16, -20, 34, 12, 4);

  // Windshield
  g.fillStyle(0x88ccff, 0.75);
  g.fillRoundedRect(-12, -19, 26, 10, 3);

  // Roll cage bars (top of roof)
  g.lineStyle(2, 0x888888);
  g.lineBetween(-10, -21, -10, -19);
  g.lineBetween(10, -21, 10, -19);
  g.lineBetween(-10, -21, 10, -21);

  // Rear spoiler
  g.fillStyle(0x888888);
  g.fillRect(-26, -24, 10, 4);  // mount
  g.fillRect(-30, -26, 18, 3);  // blade

  // Front hood scoop
  g.fillStyle(0x333333);
  g.fillRoundedRect(10, -12, 12, 6, 2);

  // Fender flares
  g.fillStyle(dark);
  g.fillRoundedRect(-32, 4, 10, 6, 2);
  g.fillRoundedRect(22, 4, 10, 6, 2);

  // Wheels — bigger than kart
  g.fillStyle(0x111111);
  g.fillCircle(-20, 12, 8);
  g.fillCircle(20, 12, 8);
  g.fillStyle(0x555555);
  g.fillCircle(-20, 12, 4);
  g.fillCircle(20, 12, 4);

  // Mud flaps
  g.fillStyle(0x222222);
  g.fillRect(-26, 8, 4, 8);

  // Headlights
  g.fillStyle(0xffffaa);
  g.fillRect(25, -7, 6, 4);
  // Tail lights
  g.fillStyle(0xff2200);
  g.fillRect(-30, -7, 4, 4);
}

// ── Monster Truck (Multiplication — Pro Series) ────────────────────────────
// Tall body, massive chunky wheels, lifted suspension gap
export function drawMonsterTruck(g, color, isPlayer) {
  const dark = darkenColor(color);

  // MASSIVE WHEELS — the star of the show
  // Rear wheel
  g.fillStyle(0x111111);
  g.fillCircle(-18, 12, 14);
  // Tread lines (concentric)
  g.lineStyle(2, 0x333333);
  g.strokeCircle(-18, 12, 10);
  g.strokeCircle(-18, 12, 6);
  // Lug bolts
  g.fillStyle(0x555555);
  for (let a = 0; a < 6; a++) {
    const ang = (a / 6) * Math.PI * 2;
    g.fillCircle(-18 + Math.cos(ang) * 8, 12 + Math.sin(ang) * 8, 2);
  }

  // Front wheel
  g.fillStyle(0x111111);
  g.fillCircle(18, 12, 14);
  g.lineStyle(2, 0x333333);
  g.strokeCircle(18, 12, 10);
  g.strokeCircle(18, 12, 6);
  g.fillStyle(0x555555);
  for (let a = 0; a < 6; a++) {
    const ang = (a / 6) * Math.PI * 2;
    g.fillCircle(18 + Math.cos(ang) * 8, 12 + Math.sin(ang) * 8, 2);
  }

  // Suspension / axle
  g.fillStyle(0x666666);
  g.fillRect(-22, -1, 40, 5);

  // Body — blocky, tall, sits above the wheels
  g.fillStyle(color);
  g.fillRoundedRect(-22, -24, 44, 24, 4);

  // Roof
  g.fillStyle(dark);
  g.fillRoundedRect(-18, -28, 36, 8, 3);

  // Windshield
  g.fillStyle(0x88ccff, 0.75);
  g.fillRoundedRect(-14, -26, 28, 10, 3);

  // Exhaust stacks (dual vertical pipes on hood)
  g.fillStyle(0x888888);
  g.fillRect(6, -30, 4, 10);
  g.fillRect(12, -30, 4, 10);

  // Grill
  g.fillStyle(0x333333);
  g.fillRoundedRect(16, -20, 8, 14, 2);
  g.lineStyle(1, 0x555555);
  for (let yy = -18; yy < -8; yy += 3) {
    g.lineBetween(17, yy, 23, yy);
  }

  // Number plate
  g.fillStyle(0xffffff);
  g.fillRect(-8, -20, 14, 8);
  g.fillStyle(0x000000);
}

// ── Formula 1 (Division — Championship) ────────────────────────────────────
// Sleek, low, elongated, pointed nose, large rear wing, front wings
export function drawFormulaOne(g, color, isPlayer) {
  const dark = darkenColor(color);

  // Rear wing (drawn first so body overlaps mount)
  // Vertical endplates
  g.fillStyle(dark);
  g.fillRect(-34, -18, 4, 14);
  g.fillRect(-22, -18, 4, 14);
  // Horizontal wing blade
  g.fillStyle(color);
  g.fillRect(-36, -20, 20, 4);

  // Rear diffuser
  g.fillStyle(dark);
  g.fillTriangle(-28, 8, -20, 8, -24, 14);

  // Main body — very long, low, bullet-shaped
  g.fillStyle(color);
  g.fillRoundedRect(-28, -8, 58, 14, 4);

  // Sidepods
  g.fillStyle(dark);
  g.fillRoundedRect(-22, -4, 16, 10, 3);
  g.fillRoundedRect(4, -4, 16, 10, 3);

  // Pointed nose cone
  g.fillStyle(color);
  g.fillTriangle(30, -5, 48, 0, 30, 5);
  // Nose tip highlight
  g.fillStyle(0xffffff, 0.3);
  g.fillTriangle(40, -2, 47, 0, 40, 2);

  // Open cockpit (monocoque)
  g.fillStyle(dark);
  g.fillRoundedRect(-8, -12, 18, 8, 3);

  // Driver helmet
  g.fillStyle(0xffffff);
  g.fillCircle(0, -13, 6);
  g.fillStyle(0x88ccff, 0.9);
  g.fillRoundedRect(-4, -16, 9, 5, 2);   // visor

  // Front wings — wide extensions past the body
  g.fillStyle(color);
  g.fillRect(22, 4, 26, 3);   // front wing plane
  g.fillStyle(dark);
  g.fillRect(24, 1, 3, 6);    // front wing endplate L
  g.fillRect(44, 1, 3, 6);    // front wing endplate R

  // Wheels — low-profile slicks
  g.fillStyle(0x111111);
  g.fillCircle(-18, 8, 7);   // rear
  g.fillCircle(20, 8, 7);    // front
  g.fillStyle(0x333333);
  g.fillCircle(-18, 8, 3);
  g.fillCircle(20, 8, 3);

  // Halo safety device (thin arc over cockpit)
  g.lineStyle(3, 0x888888);
  g.beginPath();
  g.arc(-4, -9, 10, Math.PI, 0, false);
  g.strokePath();

  // Headlights
  g.fillStyle(0xffffaa);
  g.fillCircle(45, -2, 2);
  // Rear lights
  g.fillStyle(0xff0000);
  g.fillCircle(-28, 0, 3);
}

// ── Supercar (Advanced — Superclass) ──────────────────────────────────────
// Lamborghini-style: very low, angular, enclosed cockpit, swept windshield,
// large rear diffuser, wide flat stance
export function drawSupercar(g, color, isPlayer) {
  const dark = darkenColor(color);

  // Rear diffuser — angular wide piece
  g.fillStyle(0x222222);
  g.fillTriangle(-34, 8, -20, 8, -27, 16);
  g.fillTriangle(-20, 8, -10, 8, -15, 14);

  // Wide low body — very flat and wide
  g.fillStyle(color);
  g.fillRoundedRect(-30, -6, 60, 14, 3);

  // Low angular nose — sharp taper
  g.fillStyle(color);
  g.fillTriangle(30, -5, 48, 0, 30, 5);
  // Nose tip
  g.fillStyle(0xffffff, 0.2);
  g.fillTriangle(42, -2, 47, 0, 42, 2);

  // Side air intakes / vents
  g.fillStyle(dark);
  g.fillRoundedRect(-28, -2, 12, 6, 2);
  g.fillRoundedRect(8, -2, 12, 6, 2);

  // Roof — very low swept-back profile
  g.fillStyle(dark);
  g.fillRoundedRect(-14, -16, 28, 12, 4);

  // Swept-back windshield
  g.fillStyle(0x88ccff, 0.8);
  // Front windshield: angled, wide
  g.fillTriangle(-10, -14, 14, -14, 14, -4);
  // Rear window
  g.fillTriangle(-14, -14, -4, -14, -14, -6);

  // Rear wing — low, wide blade
  g.fillStyle(0x444444);
  g.fillRect(-34, -10, 4, 10);  // endplate
  g.fillStyle(color);
  g.fillRect(-36, -12, 22, 4);  // wing blade

  // Front splitter
  g.fillStyle(dark);
  g.fillRect(28, 3, 20, 3);

  // Wheels — wide, low-profile racing slicks
  g.fillStyle(0x111111);
  g.fillEllipse(-20, 10, 18, 12);   // rear
  g.fillEllipse(20, 10, 18, 12);    // front
  // Rim highlights
  g.fillStyle(0x888888);
  g.fillEllipse(-20, 10, 8, 6);
  g.fillEllipse(20, 10, 8, 6);
  // Lug bolts
  g.fillStyle(0x555555);
  g.fillCircle(-20, 10, 2);
  g.fillCircle(20, 10, 2);

  // Headlights — sharp angular slits
  g.fillStyle(0xffffee);
  g.fillRect(40, -4, 6, 2);
  g.fillRect(40, 1, 6, 2);

  // Tail lights
  g.fillStyle(0xff2200);
  g.fillRect(-30, -4, 4, 3);
  g.fillRect(-30, 1, 4, 3);

  // Exhaust tips (dual center)
  g.fillStyle(0x888888);
  g.fillCircle(-22, 14, 3);
  g.fillCircle(-18, 14, 3);
  g.fillStyle(0x333333);
  g.fillCircle(-22, 14, 1);
  g.fillCircle(-18, 14, 1);

  // Lightning bolt emblem on door
  g.fillStyle(0xffee00, 0.9);
  g.fillTriangle(-4, -5, 2, -5, -2, 0);
  g.fillTriangle(-2, 0, 4, 0, 0, 6);
}

/** Map classId → draw function */
export const CAR_DRAW_FN = {
  addition:       drawGoKart,
  subtraction:    drawRallyCar,
  multiplication: drawMonsterTruck,
  division:       drawFormulaOne,
  advanced:       drawSupercar,
};
