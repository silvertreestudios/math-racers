/**
 * attachments.js — 50 cosmetic attachments (10 per class).
 * Each draw(gfx, color) draws at local (0,0) = car center.
 */

// ── Go-Kart / Addition ────────────────────────────────────────────────────

const additionAttachments = [
  {
    id: 'racing-stripe',
    name: 'Racing Stripe',
    emoji: '🏁',
    classId: 'addition',
    cost: 500,
    draw(g, c) {
      // Bold dual stripes across the body — dark color contrasts with any base color
      g.fillStyle(0x000000, 0.55);
      g.fillRect(-26, -4, 52, 3);
      g.fillRect(-26, 2, 52, 3);
      g.fillStyle(0xffffff, 0.7);
      g.fillRect(-26, -1, 52, 3);
    },
  },
  {
    id: 'flame-decal',
    name: 'Flame Decal',
    emoji: '🔥',
    classId: 'addition',
    cost: 800,
    draw(g, c) {
      // Hot-rod flame DECAL painted ON the car body surface (x:-26..+26, y:-7..+9).
      // Flames start near the front (right) and sweep backward (left) along the body.
      // All coordinates stay within the body rectangle.
      // Outer orange flames — large sweeping licks
      g.fillStyle(0xff4400, 0.85);
      g.fillTriangle( 20,  9,  10, -6,   0,  9);
      g.fillTriangle(  6,  9,  -2, -4, -12,  9);
      g.fillTriangle(-10,  9, -18, -3, -26,  9);
      // Mid yellow layer — slightly smaller
      g.fillStyle(0xff9900, 0.85);
      g.fillTriangle( 18,  9,  10, -3,   2,  9);
      g.fillTriangle(  4,  9,  -2, -1, -10,  9);
      g.fillTriangle(-12,  9, -18,  0, -24,  9);
      // Hot core — bright yellow
      g.fillStyle(0xffee00, 0.8);
      g.fillTriangle( 16,  9,  10,  0,   4,  9);
      g.fillTriangle(  2,  9,  -2,  2,  -8,  9);
      g.fillTriangle(-13,  9, -18,  2, -22,  9);
    },
  },
  {
    id: 'rear-spoiler',
    name: 'Rear Spoiler',
    emoji: '🏎️',
    classId: 'addition',
    cost: 1000,
    draw(g, c) {
      // Mini F1-style rear wing elevated above the kart body.
      // Kart body rear edge ~x=-26, body top ~y=-7, helmet center ~y=-13.
      // Uprights rise from the body top up to wing blade level.
      g.fillStyle(0x999999);
      g.fillRect(-25, -22, 3, 15);  // left upright (body top → blade)
      g.fillRect(-15, -22, 3, 15);  // right upright
      g.fillStyle(0xcccccc);
      g.fillRect(-28, -24, 20, 4);  // wide horizontal blade at helmet height
      g.fillStyle(0x777777);
      g.fillRect(-28, -21, 20, 2);  // blade underside shadow
    },
  },
  {
    id: 'rocket-exhaust',
    name: 'Rocket Exhaust',
    emoji: '🚀',
    classId: 'addition',
    cost: 1500,
    draw(g, c) {
      // Big dramatic flame cone shooting left from rear of kart (rear ~x=-30)
      g.fillStyle(0xff2200, 1.0);
      g.fillTriangle(-30, -5, -62, 1, -30, 7);   // outer flame
      g.fillStyle(0xff8800, 0.95);
      g.fillTriangle(-30, -3, -52, 1, -30, 5);   // mid flame
      g.fillStyle(0xffee00, 0.9);
      g.fillTriangle(-30, -1, -44, 1, -30, 3);   // inner hot core
      g.fillStyle(0xffffff, 0.6);
      g.fillTriangle(-30, 0, -38, 1, -30, 2);    // white-hot tip
    },
  },
  {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    classId: 'addition',
    cost: 2000,
    draw(g, c) {
      // Helmet center x=-2, y=-13. Crown centered on x=-2, sitting on top (y=-22).
      // Crown spans x=-10..+6 (16px wide), center at x=-2.
      g.fillStyle(0xffdd00);
      g.fillRect(-10, -22, 16, 4);          // base bar
      g.fillTriangle(-10, -22, -8, -30, -5, -22);  // left peak
      g.fillTriangle( -4, -22, -2, -30,  0, -22);  // center peak
      g.fillTriangle(  1, -22,  4, -30,  6, -22);  // right peak
      // gems
      g.fillStyle(0xff2244);
      g.fillCircle(-8, -24, 2);
      g.fillCircle(-2, -24, 2);
      g.fillCircle( 4, -24, 2);
    },
  },
  {
    id: 'star-antenna',
    name: 'Star Antenna',
    emoji: '⭐',
    classId: 'addition',
    cost: 500,
    draw(g, c) {
      g.lineStyle(2, 0xcccccc);
      g.lineBetween(5, -14, 5, -26);
      g.fillStyle(0xffdd00);
      g.fillCircle(5, -28, 4);
      g.fillStyle(0xffffff, 0.8);
      g.fillTriangle(3, -30, 5, -26, 7, -30);
      g.fillTriangle(1, -28, 5, -26, 1, -26);
    },
  },
  {
    id: 'googly-eyes',
    name: 'Googly Eyes',
    emoji: '👀',
    classId: 'addition',
    cost: 800,
    draw(g, c) {
      // ONE large cyclops eye centered on the front/nose of the go-kart.
      // Nose area: x≈+28..+36, centered at y=0.
      g.fillStyle(0xffffff);
      g.fillCircle(30, 0, 9);      // large white sclera
      g.fillStyle(0x4488ff);
      g.fillCircle(30, 0, 6);      // blue iris
      g.fillStyle(0x111111);
      g.fillCircle(30, 0, 3.5);    // black pupil
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(32, -2, 1.5);   // catchlight highlight
    },
  },
  {
    id: 'rainbow-trail',
    name: 'Rainbow Trail',
    emoji: '🌈',
    classId: 'addition',
    cost: 2500,
    draw(g, c) {
      // Horizontal colored streaks extending behind the rear of the kart.
      // Kart rear is ~x=-26. Streaks go left (negative x), tapering in length.
      const bands = [
        { color: 0xff2200, y: -5, len: 20 },
        { color: 0xff8800, y: -2, len: 22 },
        { color: 0xffee00, y:  1, len: 22 },
        { color: 0x00cc44, y:  4, len: 20 },
        { color: 0x2288ff, y:  7, len: 18 },
        { color: 0xaa44ff, y: 10, len: 15 },
      ];
      for (const { color, y, len } of bands) {
        g.fillStyle(color, 0.8);
        g.fillRect(-26 - len, y, len, 3);
      }
    },
  },
  {
    id: 'turbo-fan',
    name: 'Turbo Fan',
    emoji: '💨',
    classId: 'addition',
    cost: 1500,
    draw(g, c) {
      g.lineStyle(2, 0x888888);
      g.strokeCircle(-28, 0, 6);
      g.lineBetween(-28, -6, -28, 6);
      g.lineBetween(-34, 0, -22, 0);
      g.lineBetween(-33, -5, -23, 5);
      g.lineBetween(-23, -5, -33, 5);
    },
  },
  {
    id: 'rubber-ducky',
    name: 'Rubber Ducky',
    emoji: '🦆',
    classId: 'addition',
    cost: 3000,
    draw(g, c) {
      g.fillStyle(0xffee00);
      g.fillRoundedRect(-9, -24, 10, 7, 3);  // duck body
      g.fillStyle(0xffcc00);
      g.fillCircle(-2, -27, 4);              // duck head
      g.fillStyle(0xff8800);
      g.fillTriangle(1, -27, 4, -26, 1, -25); // beak
      g.fillStyle(0x222222);
      g.fillCircle(-3, -28, 1);              // eye
    },
  },
];

// ── Rally Car / Subtraction ───────────────────────────────────────────────

const subtractionAttachments = [
  {
    id: 'mud-flaps-big',
    name: 'Big Mud Flaps',
    emoji: '💦',
    classId: 'subtraction',
    cost: 1000,
    draw(g, c) {
      g.fillStyle(0x111111);
      g.fillRect(-28, 10, 6, 12);
      g.fillRect(14, 10, 6, 12);
    },
  },
  {
    id: 'roof-rack',
    name: 'Roof Rack',
    emoji: '📦',
    classId: 'subtraction',
    cost: 1500,
    draw(g, c) {
      // Rally car roof is roughly x:-16..16, y:-20..-14 area
      // Draw a rectangular frame sitting ON the roof
      g.lineStyle(3, 0x999999);
      g.strokeRect(-14, -24, 28, 6);  // outer frame
      // cross-bars
      g.lineStyle(2, 0x888888);
      g.lineBetween(-7, -24, -7, -18);
      g.lineBetween(0, -24, 0, -18);
      g.lineBetween(7, -24, 7, -18);
      // mounting feet connecting to roofline
      g.lineStyle(2, 0x777777);
      g.lineBetween(-14, -18, -16, -15);
      g.lineBetween(14, -18, 16, -15);
    },
  },
  {
    id: 'bull-bar',
    name: 'Bull Bar',
    emoji: '🐂',
    classId: 'subtraction',
    cost: 2000,
    draw(g, c) {
      g.lineStyle(3, 0x888888);
      g.strokeRoundedRect(25, -10, 8, 18, 3);
      g.lineBetween(25, -1, 33, -1);
    },
  },
  {
    id: 'rally-lights',
    name: 'Rally Lights',
    emoji: '💡',
    classId: 'subtraction',
    cost: 2500,
    draw(g, c) {
      g.fillStyle(0xffffaa, 0.95);
      g.fillCircle(-8, -24, 4);
      g.fillCircle(0, -24, 4);
      g.fillCircle(8, -24, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(-8, -24, 2);
      g.fillCircle(0, -24, 2);
      g.fillCircle(8, -24, 2);
    },
  },
  {
    id: 'racing-numbers',
    name: 'Racing Numbers',
    emoji: '#️⃣',
    classId: 'subtraction',
    cost: 1000,
    draw(g, c) {
      // "0" as rect outline
      g.lineStyle(2, 0xffffff);
      g.strokeRect(-2, -8, 7, 10);
      // "1" as thin rect
      g.fillStyle(0xffffff);
      g.fillRect(8, -8, 3, 10);
    },
  },
  {
    id: 'antenna-flag',
    name: 'Antenna Flag',
    emoji: '🚩',
    classId: 'subtraction',
    cost: 1500,
    draw(g, c) {
      g.lineStyle(2, 0xaaaaaa);
      g.lineBetween(20, -20, 20, -32);
      g.fillStyle(0xff4444);
      g.fillTriangle(20, -32, 28, -28, 20, -25);
    },
  },
  {
    id: 'snorkel',
    name: 'Snorkel',
    emoji: '🤿',
    classId: 'subtraction',
    cost: 3000,
    draw(g, c) {
      // Thick vertical pipe on the side, rising above roofline
      g.fillStyle(0x555555);
      g.fillRect(20, -32, 7, 22);  // main vertical pipe (thick)
      // Elbow/cap at top
      g.fillStyle(0x444444);
      g.fillRect(14, -34, 13, 7);  // horizontal elbow section
      // Opening cap circle
      g.fillStyle(0x333333);
      g.fillCircle(20, -34, 5);
      g.fillStyle(0x111111);
      g.fillCircle(20, -34, 3);    // dark opening
    },
  },
  {
    id: 'spare-tire',
    name: 'Spare Tire',
    emoji: '🛞',
    classId: 'subtraction',
    cost: 2000,
    draw(g, c) {
      g.lineStyle(4, 0x333333);
      g.strokeCircle(-30, -10, 7);
      g.fillStyle(0x555555);
      g.fillCircle(-30, -10, 3);
    },
  },
  {
    id: 'camo-paint',
    name: 'Camo Paint',
    emoji: '🪖',
    classId: 'subtraction',
    cost: 4000,
    draw(g, c) {
      g.fillStyle(0x2d4a1e, 0.5);
      g.fillRect(-20, -8, 10, 8);
      g.fillRect(0, -5, 12, 6);
      g.fillRect(-10, 2, 8, 5);
      g.fillStyle(0x4a6b2a, 0.5);
      g.fillRect(-5, -10, 14, 6);
      g.fillRect(10, 0, 8, 7);
    },
  },
  {
    id: 'cat-ears',
    name: 'Cat Ears',
    emoji: '🐱',
    classId: 'subtraction',
    cost: 5000,
    draw(g, c) {
      g.fillStyle(0xffaacc);
      g.fillTriangle(-12, -20, -8, -30, -4, -20);
      g.fillTriangle(4, -20, 8, -30, 12, -20);
      g.fillStyle(0xff88bb, 0.7);
      g.fillTriangle(-11, -21, -8, -27, -5, -21);
      g.fillTriangle(5, -21, 8, -27, 11, -21);
    },
  },
];

// ── Monster Truck / Multiplication ────────────────────────────────────────

const multiplicationAttachments = [
  {
    id: 'smoke-stacks',
    name: 'Smoke Stacks',
    emoji: '💨',
    classId: 'multiplication',
    cost: 2000,
    draw(g, c) {
      // Monster truck body top is ~y=-28, cab area center x~0
      // Tall pipes rising well above the roof
      g.fillStyle(0x555555);
      g.fillRect(-6, -50, 7, 24);   // left stack
      g.fillRect(4, -50, 7, 24);    // right stack
      // Flared opening at top
      g.fillStyle(0x333333);
      g.fillRect(-8, -52, 11, 4);
      g.fillRect(2, -52, 11, 4);
      // smoke puffs
      g.fillStyle(0xcccccc, 0.6);
      g.fillCircle(-2, -56, 5);
      g.fillCircle(8, -58, 6);
      g.fillStyle(0xdddddd, 0.35);
      g.fillCircle(0, -63, 6);
      g.fillCircle(10, -65, 7);
    },
  },
  {
    id: 'skull-hood',
    name: 'Skull Hood',
    emoji: '💀',
    classId: 'multiplication',
    cost: 3000,
    draw(g, c) {
      g.fillStyle(0xeeeeee);
      g.fillEllipse(16, -16, 14, 12);  // skull head
      g.fillStyle(0x000000);
      g.fillCircle(13, -17, 2);        // left eye
      g.fillCircle(19, -17, 2);        // right eye
      g.fillRect(12, -11, 9, 3);       // teeth area
      g.fillStyle(0xeeeeee);
      for (let x = 14; x <= 18; x += 3) {
        g.fillRect(x, -11, 2, 3);
      }
    },
  },
  {
    id: 'chain-wheels',
    name: 'Chain Wheels',
    emoji: '⛓️',
    classId: 'multiplication',
    cost: 4000,
    draw(g, c) {
      // Monster truck wheels at (±18, 12), radius ~14.
      // Draw a ring of alternating rectangular chain links around each wheel.
      // Use a slightly larger radius (17) so links sit ON the tyre, not inside.
      const centers = [[-18, 12], [18, 12]];
      for (const [wx, wy] of centers) {
        const linkCount = 10;
        for (let i = 0; i < linkCount; i++) {
          const angle = (i / linkCount) * Math.PI * 2;
          const lx = wx + Math.cos(angle) * 17;
          const ly = wy + Math.sin(angle) * 17;
          // Rotate each link to be tangent to the wheel
          const tx = -Math.sin(angle);
          const ty =  Math.cos(angle);
          const hw = 3, hh = 1.5; // half-width, half-height
          // 4 corners of the rotated rect
          const pts = [
            [lx + tx * hw - ty * hh, ly + ty * hw + tx * hh],
            [lx - tx * hw - ty * hh, ly - ty * hw + tx * hh],
            [lx - tx * hw + ty * hh, ly - ty * hw - tx * hh],
            [lx + tx * hw + ty * hh, ly + ty * hw - tx * hh],
          ];
          g.fillStyle(i % 2 === 0 ? 0xaaaaaa : 0x777777);
          g.fillTriangle(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
          g.fillTriangle(pts[0][0], pts[0][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1]);
        }
      }
    },
  },
  {
    id: 'lightning-bolts-decal',
    name: 'Lightning Bolts',
    emoji: '⚡',
    classId: 'multiplication',
    cost: 2500,
    draw(g, c) {
      // Black-outlined white lightning bolts on the truck door panels.
      // Truck body spans x:-22..+22, y:-24..0. Place one bolt each side.
      // Each bolt: wide top → narrow middle → wide tip (classic zig-zag)
      const drawBolt = (x) => {
        // Black outline (drawn first, slightly larger)
        g.fillStyle(0x000000);
        g.fillTriangle(x - 5, -22, x + 5, -22, x + 1, -13);
        g.fillTriangle(x - 3, -13, x + 7, -13, x - 1,  -4);
        // White fill
        g.fillStyle(0xffffff);
        g.fillTriangle(x - 4, -22, x + 4, -22, x + 0, -14);
        g.fillTriangle(x - 2, -14, x + 6, -14, x - 2,  -5);
      };
      drawBolt(-10);
      drawBolt(8);
    },
  },
  {
    id: 'fire-wheels',
    name: 'Fire Wheels',
    emoji: '🔥',
    classId: 'multiplication',
    cost: 5000,
    draw(g, c) {
      // Flame spikes radiating outward from each wheel's circumference.
      // Monster truck wheels at (±18, 12), radius 14.
      // Each spike: base point on wheel rim, tip 6px further out.
      const centers = [[-18, 12], [18, 12]];
      for (const [wx, wy] of centers) {
        const spikeCount = 8;
        for (let i = 0; i < spikeCount; i++) {
          const a = (i / spikeCount) * Math.PI * 2;
          const aLeft  = a - 0.25;
          const aRight = a + 0.25;
          // Base: two points on the rim at ±0.25 rad from spike direction
          const b1x = wx + Math.cos(aLeft)  * 14;
          const b1y = wy + Math.sin(aLeft)  * 14;
          const b2x = wx + Math.cos(aRight) * 14;
          const b2y = wy + Math.sin(aRight) * 14;
          // Tip: one point further out
          const tx = wx + Math.cos(a) * 21;
          const ty = wy + Math.sin(a) * 21;
          g.fillStyle(i % 2 === 0 ? 0xff4400 : 0xffaa00, 1.0);
          g.fillTriangle(b1x, b1y, b2x, b2y, tx, ty);
        }
      }
    },
  },
  {
    id: 'viking-horns',
    name: 'Viking Horns',
    emoji: '🐃',
    classId: 'multiplication',
    cost: 6000,
    draw(g, c) {
      // Large curved horns sweeping outward and up from top corners of truck body.
      // Truck body top is ~y=-24, corners at ~x=±18. Use bone/tan for contrast.
      g.fillStyle(0xddcc88);
      // Left horn: sweeps outward-left and up
      g.fillTriangle(-18, -26, -38, -44, -24, -26);
      g.fillTriangle(-38, -44, -34, -28, -18, -26);
      // Right horn: mirrors
      g.fillTriangle(18, -26, 38, -44, 24, -26);
      g.fillTriangle(38, -44, 34, -28, 18, -26);
      // Darker shading on inner face
      g.fillStyle(0xbbaa66);
      g.fillTriangle(-18, -26, -34, -42, -26, -26);
      g.fillTriangle(18, -26, 34, -42, 26, -26);
      // Base caps where horns meet the roof
      g.fillStyle(0xccbb77);
      g.fillCircle(-21, -26, 5);
      g.fillCircle(21, -26, 5);
    },
  },
  {
    id: 'spiked-bumper',
    name: 'Spiked Bumper',
    emoji: '🦔',
    classId: 'multiplication',
    cost: 3500,
    draw(g, c) {
      // Monster truck front bumper is at x=+22 (right side), spikes point RIGHT
      g.fillStyle(0x999999);
      // Bumper bar
      g.fillRect(20, -20, 4, 22);
      // Spikes pointing forward (right)
      g.fillStyle(0x888888);
      for (let i = 0; i < 4; i++) {
        const by = -17 + i * 6;
        g.fillTriangle(24, by, 34, by + 3, 24, by + 5);
      }
    },
  },
  {
    id: 'monster-eyes',
    name: 'Monster Eyes',
    emoji: '👹',
    classId: 'multiplication',
    cost: 2000,
    draw(g, c) {
      // Two large angry eyes on the windshield area of the monster truck
      // Windshield is roughly front (right side, x:10..30) upper area y:-20..-30
      // White sclera
      g.fillStyle(0xffffff);
      g.fillEllipse(4, -22, 14, 10);   // left eye
      g.fillEllipse(20, -22, 14, 10);  // right eye
      // Red iris
      g.fillStyle(0xff0000);
      g.fillEllipse(4, -22, 8, 8);
      g.fillEllipse(20, -22, 8, 8);
      // Black pupil
      g.fillStyle(0x000000);
      g.fillCircle(4, -22, 3);
      g.fillCircle(20, -22, 3);
      // Angry slanted brows
      g.lineStyle(3, 0x330000);
      g.lineBetween(-3, -28, 10, -25);   // left brow (angry slant)
      g.lineBetween(13, -25, 27, -28);   // right brow (angry slant)
    },
  },
  {
    id: 'mohawk',
    name: 'Mohawk',
    emoji: '🦖',
    classId: 'multiplication',
    cost: 4500,
    draw(g, c) {
      g.fillStyle(0xff2244);
      for (let i = 0; i < 5; i++) {
        const bx = -12 + i * 6;
        g.fillTriangle(bx - 3, -28, bx, -38, bx + 3, -28);
      }
    },
  },
  {
    id: 'bat-wings',
    name: 'Bat Wings',
    emoji: '🦇',
    classId: 'multiplication',
    cost: 8000,
    draw(g, c) {
      // Large bat wings extending from the sides — bright purple fill with outline
      g.fillStyle(0x8800cc, 1.0);
      // left wing — sweeps out left and up
      g.fillTriangle(-22, -8, -54, -34, -22, -26);
      g.fillTriangle(-54, -34, -48, -10, -22, -8);
      // right wing
      g.fillTriangle(22, -8, 54, -34, 22, -26);
      g.fillTriangle(54, -34, 48, -10, 22, -8);
      // bright magenta outline so wings pop
      g.lineStyle(2, 0xee44ff, 1.0);
      g.lineBetween(-22, -8, -54, -34);
      g.lineBetween(-54, -34, -48, -10);
      g.lineBetween(-48, -10, -22, -8);
      g.lineBetween(22, -8, 54, -34);
      g.lineBetween(54, -34, 48, -10);
      g.lineBetween(48, -10, 22, -8);
      // wing ribs
      g.lineStyle(1, 0xcc66ff, 0.8);
      g.lineBetween(-22, -8, -50, -20);
      g.lineBetween(-22, -8, -42, -32);
      g.lineBetween(22, -8, 50, -20);
      g.lineBetween(22, -8, 42, -32);
    },
  },
];

// ── Formula 1 / Division ──────────────────────────────────────────────────

const divisionAttachments = [
  {
    id: 'shark-fin',
    name: 'Shark Fin',
    emoji: '🦈',
    classId: 'division',
    cost: 3000,
    draw(g, c) {
      g.fillStyle(0x333333);
      g.fillTriangle(-6, -8, -6, -48, 2, -8);
    },
  },
  {
    id: 'halo-ring',
    name: 'Halo Ring',
    emoji: '💫',
    classId: 'division',
    cost: 4000,
    draw(g, c) {
      g.lineStyle(3, 0xddaa00);
      g.strokeEllipse(0, -20, 24, 8);
    },
  },
  {
    id: 'sponsor-stickers',
    name: 'Sponsor Stickers',
    emoji: '🏷️',
    classId: 'division',
    cost: 3000,
    draw(g, c) {
      g.fillStyle(0xff2222);
      g.fillRect(-20, -3, 10, 5);
      g.fillStyle(0xffffff);
      g.fillRect(-6, -3, 10, 5);
      g.fillStyle(0x2244ff);
      g.fillRect(8, -3, 10, 5);
    },
  },
  {
    id: 'drs-wing',
    name: 'DRS Wing',
    emoji: '🪽',
    classId: 'division',
    cost: 5000,
    draw(g, c) {
      // Wider, taller rear wing than the car's built-in one.
      // F1 built-in rear wing is at x=-36..-22, y=-20..-16.
      // Draw a bigger wing overlapping/extending that position in bright color.
      // Endplates — bright white so they contrast against the red car
      g.fillStyle(0xdddddd);
      g.fillRect(-40, -30, 5, 22);   // left endplate
      g.fillRect(-22, -30, 5, 22);   // right endplate
      // Upper blade (wider span)
      g.fillStyle(0xcccccc);
      g.fillRect(-40, -30, 23, 5);
      // Lower blade
      g.fillStyle(0xaaaaaa);
      g.fillRect(-40, -23, 23, 4);
      // Blue DRS gap highlight
      g.fillStyle(0x6699ff, 0.8);
      g.fillRect(-40, -26, 23, 3);
    },
  },
  {
    id: 'led-strip',
    name: 'LED Strip',
    emoji: '💎',
    classId: 'division',
    cost: 6000,
    draw(g, c) {
      g.fillStyle(0x00ffff, 0.8);
      g.fillRect(-28, 6, 58, 2);
    },
  },
  {
    id: 'gold-rims',
    name: 'Gold Rims',
    emoji: '✨',
    classId: 'division',
    cost: 7000,
    draw(g, c) {
      g.fillStyle(0xffcc00);
      g.fillCircle(-18, 8, 4);
      g.fillCircle(20, 8, 4);
      g.fillStyle(0x111111);
      g.fillCircle(-18, 8, 2);
      g.fillCircle(20, 8, 2);
    },
  },
  {
    id: 'jet-engine',
    name: 'Jet Engine',
    emoji: '🔧',
    classId: 'division',
    cost: 8000,
    draw(g, c) {
      // Jet engine pod mounted below/behind the F1 rear.
      // F1 rear is at x ~ -28, body bottom ~y=+8. Mount jet here.
      g.fillStyle(0x888888);
      g.fillRoundedRect(-42, 2, 18, 9, 3);    // engine pod cylinder
      g.fillStyle(0x555555);
      g.fillRect(-44, 4, 4, 5);               // nozzle opening
      // Exhaust flame cone
      g.fillStyle(0xff5500, 1.0);
      g.fillTriangle(-44, 4, -56, 6, -44, 9); // outer flame
      g.fillStyle(0xffcc00, 0.9);
      g.fillTriangle(-44, 5, -51, 6, -44, 8); // inner flame
      g.fillStyle(0xffffff, 0.6);
      g.fillTriangle(-44, 6, -47, 6, -44, 7); // white tip
    },
  },
  {
    id: 'laser-antenna',
    name: 'Laser Antenna',
    emoji: '📡',
    classId: 'division',
    cost: 4000,
    draw(g, c) {
      g.lineStyle(1, 0xdddddd);
      g.lineBetween(0, -9, 0, -52);
      g.fillStyle(0xff0000);
      g.fillCircle(0, -52, 3);
    },
  },
  {
    id: 'aero-canards',
    name: 'Aero Canards',
    emoji: '🪶',
    classId: 'division',
    cost: 5000,
    draw(g, c) {
      // Aero canard winglets on the nose of the F1 car, extending up and down.
      // Shifted to x=+18..+36 to stay clearly on-canvas at 4× scale.
      // Dark backing for contrast against red car body.
      g.fillStyle(0x000000, 0.6);
      g.fillRect(16, -15, 22, 7);   // upper canard backing
      g.fillRect(16,  6,  22, 7);   // lower canard backing
      // Bright white canard surfaces
      g.fillStyle(0xffffff);
      g.fillRect(17, -14, 18, 5);   // upper canard
      g.fillRect(17,   7, 18, 5);   // lower canard
      // Angled swept-back tips
      g.fillTriangle(35, -14, 40, -11, 35, -9);   // upper tip
      g.fillTriangle(35,   7, 40,   9, 35, 12);   // lower tip
    },
  },
  {
    id: 'top-hat',
    name: 'Top Hat',
    emoji: '🎩',
    classId: 'division',
    cost: 10000,
    draw(g, c) {
      g.fillStyle(0x111111);
      g.fillRect(-10, -20, 20, 3);  // brim
      g.fillRect(-6, -32, 12, 13);  // hat body
      g.lineStyle(1, 0x666666);
      g.lineBetween(-6, -28, 6, -28); // band
    },
  },
];

// ── Supercar / Advanced ───────────────────────────────────────────────────

const advancedAttachments = [
  {
    id: 'carbon-fiber',
    name: 'Carbon Fiber',
    emoji: '⬛',
    classId: 'advanced',
    cost: 4000,
    draw(g, c) {
      // Dark checkerboard pattern overlaid on the car body — high enough contrast to see
      g.fillStyle(0x000000, 0.55);
      // Alternating filled squares in a grid
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 0) {
            g.fillRect(-28 + col * 7, -6 + row * 5, 7, 5);
          }
        }
      }
    },
  },
  {
    id: 'neon-underglow',
    name: 'Neon Underglow',
    emoji: '💜',
    classId: 'advanced',
    cost: 5000,
    draw(g, c) {
      g.fillStyle(0x00ffcc, 0.75);
      g.fillRect(-30, 8, 60, 3);
    },
  },
  {
    id: 'extra-diffuser',
    name: 'Extra Diffuser',
    emoji: '🌀',
    classId: 'advanced',
    cost: 4000,
    draw(g, c) {
      // Aerodynamic fins hanging down from rear bottom — use contrasting light gray
      g.fillStyle(0xaaaaaa);
      g.fillTriangle(-36, 10, -24, 10, -30, 22);
      g.fillTriangle(-24, 10, -14, 10, -19, 20);
      g.fillTriangle(-14, 10, -6, 10, -10, 18);
      // darker face to add depth
      g.fillStyle(0x777777);
      g.fillTriangle(-36, 10, -33, 10, -30, 22);
      g.fillTriangle(-24, 10, -21, 10, -19, 20);
      g.fillTriangle(-14, 10, -11, 10, -10, 18);
    },
  },
  {
    id: 'side-scoops',
    name: 'Side Scoops',
    emoji: '🕳️',
    classId: 'advanced',
    cost: 5000,
    draw(g, c) {
      // Air intake scoops on sides — dark opening with lighter rim for contrast
      // Supercar body: x:-36 to +40, y:-6 to +14
      g.fillStyle(0xffffff, 0.25);
      g.fillEllipse(-22, 2, 16, 10);   // left scoop rim highlight
      g.fillEllipse(20, 2, 16, 10);    // right scoop rim highlight
      g.fillStyle(0x000000, 0.7);
      g.fillEllipse(-22, 2, 12, 7);    // left dark opening
      g.fillEllipse(20, 2, 12, 7);     // right dark opening
    },
  },
  {
    id: 'digital-camo',
    name: 'Digital Camo',
    emoji: '🟩',
    classId: 'advanced',
    cost: 7000,
    draw(g, c) {
      const shades = [0x333333, 0x555555, 0x222222, 0x444444];
      const blocks = [
        [-24, -4, 8, 5, 0], [-16, 1, 6, 4, 1],
        [-4, -5, 7, 4, 2], [6, 0, 8, 5, 3],
        [16, -4, 6, 4, 0], [-10, 3, 9, 4, 1],
      ];
      for (const [x, y, w, h, si] of blocks) {
        g.fillStyle(shades[si], 0.45);
        g.fillRect(x, y, w, h);
      }
    },
  },
  {
    id: 'diamond-grille',
    name: 'Diamond Grille',
    emoji: '💠',
    classId: 'advanced',
    cost: 8000,
    draw(g, c) {
      // Large diamond/sparkle pattern on the front nose area of the supercar.
      // Supercar nose: x=+30..+48. Use big, bright, clearly-visible diamonds.
      // Background panel on front face
      g.fillStyle(0x222222, 0.7);
      g.fillRect(30, -5, 16, 12);
      // Large bright diamonds (rotated squares) in a 2×3 grid
      const positions = [[33, -2], [40, -2], [33, 4], [40, 4]];
      for (const [dx, dy] of positions) {
        // Diamond: top, right, bottom, left points
        g.fillStyle(0xffffff, 1.0);
        g.fillTriangle(dx, dy - 3, dx + 3, dy, dx, dy + 3);
        g.fillTriangle(dx, dy - 3, dx - 3, dy, dx, dy + 3);
        // Cyan glint
        g.fillStyle(0x00ffff, 0.8);
        g.fillTriangle(dx, dy - 3, dx + 2, dy - 1, dx - 1, dy - 1);
      }
    },
  },
  {
    id: 'scissor-doors',
    name: 'Scissor Doors',
    emoji: '🚪',
    classId: 'advanced',
    cost: 10000,
    draw(g, c) {
      g.lineStyle(2, 0xaaaaaa, 0.8);
      g.lineBetween(-4, -6, 6, -20);
      g.lineBetween(6, -6, 16, -20);
    },
  },
  {
    id: 'flame-thrower',
    name: 'Flame Thrower',
    emoji: '🔥',
    classId: 'advanced',
    cost: 12000,
    draw(g, c) {
      // Large dramatic flames shooting LEFT from rear of supercar (rear at x~-30).
      // Supercar body bottom ~y=+8. Flames shoot horizontally from exhausts.
      g.fillStyle(0xff1100, 1.0);
      g.fillTriangle(-30, 2, -68, 6, -30, 14);   // huge outer flame
      g.fillStyle(0xff6600, 0.95);
      g.fillTriangle(-30, 3, -56, 6, -30, 12);   // mid flame
      g.fillStyle(0xffcc00, 0.9);
      g.fillTriangle(-30, 4, -46, 6, -30, 10);   // inner orange
      g.fillStyle(0xffee88, 0.8);
      g.fillTriangle(-30, 5, -38, 6, -30,  8);   // hot core
      g.fillStyle(0xffffff, 0.5);
      g.fillTriangle(-30, 6, -33, 6, -30,  7);   // white tip
    },
  },
  {
    id: 'angel-wings',
    name: 'Angel Wings',
    emoji: '😇',
    classId: 'advanced',
    cost: 12000,
    draw(g, c) {
      g.fillStyle(0xffffff, 0.85);
      // left wing
      g.fillTriangle(-14, -4, -42, -18, -14, -16);
      g.fillTriangle(-42, -18, -38, -6, -14, -4);
      // right wing
      g.fillTriangle(14, -4, 42, -18, 14, -16);
      g.fillTriangle(42, -18, 38, -6, 14, -4);
      // feather detail lines
      g.lineStyle(1, 0xdddddd, 0.5);
      g.lineBetween(-30, -14, -20, -6);
      g.lineBetween(-36, -10, -26, -4);
      g.lineBetween(30, -14, 20, -6);
      g.lineBetween(36, -10, 26, -4);
    },
  },
  {
    id: 'party-hat',
    name: 'Party Hat',
    emoji: '🎉',
    classId: 'advanced',
    cost: 15000,
    draw(g, c) {
      g.fillStyle(0xff44cc);
      g.fillTriangle(-8, -14, 0, -36, 8, -14);
      g.fillStyle(0xffee00);
      g.fillCircle(0, -36, 3);
      // polka dots
      g.fillStyle(0x44ffee);
      g.fillCircle(-3, -24, 2);
      g.fillCircle(3, -20, 2);
      g.fillCircle(-1, -30, 2);
    },
  },
];

/** All 50 attachments flat array */
export const ATTACHMENTS = [
  ...additionAttachments,
  ...subtractionAttachments,
  ...multiplicationAttachments,
  ...divisionAttachments,
  ...advancedAttachments,
];

/** Attachments grouped by classId */
export const ATTACHMENTS_BY_CLASS = {
  addition:       additionAttachments,
  subtraction:    subtractionAttachments,
  multiplication: multiplicationAttachments,
  division:       divisionAttachments,
  advanced:       advancedAttachments,
};
