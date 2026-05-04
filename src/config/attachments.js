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
      g.fillStyle(0xffffff, 0.6);
      g.fillRect(-26, -3, 52, 4);
    },
  },
  {
    id: 'flame-decal',
    name: 'Flame Decal',
    emoji: '🔥',
    classId: 'addition',
    cost: 800,
    draw(g, c) {
      g.fillStyle(0xff6600, 0.85);
      g.fillTriangle(-20, 9, -14, -2, -10, 9);
      g.fillTriangle(-10, 9, -4, -4, 0, 9);
      g.fillStyle(0xffdd00, 0.85);
      g.fillTriangle(-18, 9, -13, 0, -9, 9);
      g.fillTriangle(-8, 9, -3, -2, 1, 9);
    },
  },
  {
    id: 'rear-spoiler',
    name: 'Rear Spoiler',
    emoji: '🏎️',
    classId: 'addition',
    cost: 1000,
    draw(g, c) {
      g.fillStyle(0xaaaaaa);
      g.fillRect(-26, -22, 2, 6);  // left support
      g.fillRect(-20, -22, 2, 6);  // right support
      g.fillRect(-30, -24, 16, 3); // blade
    },
  },
  {
    id: 'rocket-exhaust',
    name: 'Rocket Exhaust',
    emoji: '🚀',
    classId: 'addition',
    cost: 1500,
    draw(g, c) {
      g.fillStyle(0xff4400, 0.9);
      g.fillTriangle(-30, -1, -48, 0, -30, 5);
      g.fillStyle(0xffcc00, 0.7);
      g.fillTriangle(-30, 0, -42, 0, -30, 4);
    },
  },
  {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    classId: 'addition',
    cost: 2000,
    draw(g, c) {
      g.fillStyle(0xffdd00);
      // crown base bar
      g.fillRect(-8, -26, 16, 4);
      // three points
      g.fillTriangle(-8, -26, -6, -34, -4, -26);
      g.fillTriangle(-1, -26, 0, -34, 1, -26);
      g.fillTriangle(4, -26, 6, -34, 8, -26);
      // gems
      g.fillStyle(0xff2244);
      g.fillCircle(-6, -28, 2);
      g.fillCircle(0, -28, 2);
      g.fillCircle(6, -28, 2);
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
      g.fillStyle(0xffffff);
      g.fillCircle(28, -3, 4);
      g.fillCircle(30, 3, 4);
      g.fillStyle(0x222222);
      g.fillCircle(29, -3, 2);
      g.fillCircle(31, 3, 2);
    },
  },
  {
    id: 'rainbow-trail',
    name: 'Rainbow Trail',
    emoji: '🌈',
    classId: 'addition',
    cost: 2500,
    draw(g, c) {
      const colors = [0xff0000, 0xff8800, 0xffff00, 0x00cc00, 0x0066ff];
      for (let i = 0; i < colors.length; i++) {
        g.fillStyle(colors[i], 0.7);
        g.fillRect(-34 - i * 5, -3 + i, 4, 3 - i * 0.4);
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
      g.lineStyle(2, 0x888888);
      g.strokeRect(-14, -26, 26, 5);
      // pegs
      for (let x = -10; x <= 8; x += 6) {
        g.lineBetween(x, -26, x, -30);
      }
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
      g.fillStyle(0x666666);
      g.fillRect(22, -36, 5, 18);
      g.lineStyle(3, 0x888888);
      g.beginPath();
      g.arc(24, -36, 4, Math.PI, 0, false);
      g.strokePath();
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
      g.fillStyle(0x666666);
      g.fillRect(0, -44, 5, 14);
      g.fillRect(8, -44, 5, 14);
      // smoke puffs
      g.fillStyle(0xbbbbbb, 0.5);
      g.fillCircle(2, -46, 4);
      g.fillCircle(11, -48, 5);
      g.fillStyle(0xdddddd, 0.3);
      g.fillCircle(4, -52, 5);
      g.fillCircle(13, -54, 6);
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
      g.lineStyle(3, 0x888888);
      g.strokeCircle(-18, 12, 16);
      g.strokeCircle(18, 12, 16);
      g.lineStyle(2, 0x666666);
      g.strokeCircle(-18, 12, 12);
      g.strokeCircle(18, 12, 12);
    },
  },
  {
    id: 'lightning-bolts-decal',
    name: 'Lightning Bolts',
    emoji: '⚡',
    classId: 'multiplication',
    cost: 2500,
    draw(g, c) {
      g.fillStyle(0xffee00, 0.9);
      g.fillTriangle(-8, -20, -3, -20, -6, -12);
      g.fillTriangle(-6, -12, -1, -12, -4, -4);
      g.fillTriangle(2, -20, 7, -20, 4, -12);
      g.fillTriangle(4, -12, 9, -12, 6, -4);
    },
  },
  {
    id: 'fire-wheels',
    name: 'Fire Wheels',
    emoji: '🔥',
    classId: 'multiplication',
    cost: 5000,
    draw(g, c) {
      g.lineStyle(3, 0xff6600, 0.8);
      g.strokeCircle(-18, 12, 16);
      g.strokeCircle(18, 12, 16);
      g.lineStyle(2, 0xffcc00, 0.6);
      g.strokeCircle(-18, 12, 18);
      g.strokeCircle(18, 12, 18);
    },
  },
  {
    id: 'viking-horns',
    name: 'Viking Horns',
    emoji: '🐃',
    classId: 'multiplication',
    cost: 6000,
    draw(g, c) {
      g.fillStyle(0xeeeecc);
      // left horn
      g.fillTriangle(-20, -28, -30, -44, -14, -30);
      // right horn
      g.fillTriangle(20, -28, 14, -30, 30, -44);
      g.fillStyle(0xccccaa);
      g.fillTriangle(-20, -28, -26, -40, -16, -30);
      g.fillTriangle(20, -28, 16, -30, 26, -40);
    },
  },
  {
    id: 'spiked-bumper',
    name: 'Spiked Bumper',
    emoji: '🦔',
    classId: 'multiplication',
    cost: 3500,
    draw(g, c) {
      g.fillStyle(0x888888);
      for (let i = 0; i < 5; i++) {
        const bx = 22;
        const by = -18 + i * 7;
        g.fillTriangle(bx, by + 1, bx + 8, by + 3, bx, by + 5);
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
      g.fillStyle(0xffffff);
      g.fillRect(-12, -26, 8, 5);
      g.fillRect(2, -26, 8, 5);
      g.fillStyle(0xff0000);
      g.fillRect(-10, -26, 4, 5);
      g.fillRect(4, -26, 4, 5);
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
      g.fillStyle(0x221133, 0.9);
      // left wing
      g.fillTriangle(-22, -10, -50, -30, -22, -24);
      g.fillTriangle(-50, -30, -44, -14, -22, -10);
      // right wing
      g.fillTriangle(22, -10, 50, -30, 22, -24);
      g.fillTriangle(50, -30, 44, -14, 22, -10);
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
      g.fillStyle(0x555555);
      g.fillRect(-38, -26, 22, 3);
      g.fillRect(-38, -30, 22, 3);
      g.fillStyle(0x333333);
      g.fillRect(-36, -30, 2, 4);
      g.fillRect(-18, -30, 2, 4);
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
      g.fillStyle(0x777777);
      g.fillRoundedRect(-44, -4, 14, 10, 3);
      g.fillStyle(0xff6600, 0.7);
      g.fillCircle(-44, 1, 4);
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
      g.fillStyle(0x444444);
      g.fillRect(32, -7, 10, 3);
      g.fillRect(32, 2, 10, 3);
      // angle them slightly
      g.fillStyle(0x555555);
      g.fillRect(40, -9, 4, 3);
      g.fillRect(40, 0, 4, 3);
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
      g.lineStyle(1, 0x000000, 0.3);
      for (let x = -28; x <= 28; x += 8) {
        g.lineBetween(x, -6, x, 8);
      }
      for (let y = -6; y <= 8; y += 6) {
        g.lineBetween(-28, y, 28, y);
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
      g.fillStyle(0x222222);
      g.fillTriangle(-36, 8, -24, 8, -30, 18);
      g.fillTriangle(-24, 8, -14, 8, -19, 16);
      g.fillTriangle(-14, 8, -6, 8, -10, 14);
    },
  },
  {
    id: 'side-scoops',
    name: 'Side Scoops',
    emoji: '🕳️',
    classId: 'advanced',
    cost: 5000,
    draw(g, c) {
      g.fillStyle(0x111111);
      g.fillTriangle(-26, -4, -14, -4, -26, 2);
      g.fillTriangle(14, -4, 26, -4, 26, 2);
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
      g.fillStyle(0xaaaaaa, 0.6);
      const positions = [
        [36, -3], [40, -3], [44, -3],
        [38, 0], [42, 0],
        [36, 3], [40, 3], [44, 3],
      ];
      for (const [x, y] of positions) {
        g.fillRect(x, y, 3, 3);
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
      g.fillStyle(0xff4400, 0.9);
      g.fillTriangle(-22, 10, -40, 12, -22, 16);
      g.fillStyle(0xffaa00, 0.7);
      g.fillTriangle(-22, 11, -36, 12, -22, 15);
      g.fillStyle(0xffee00, 0.5);
      g.fillTriangle(-22, 12, -32, 12, -22, 14);
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
