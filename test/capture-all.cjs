#!/usr/bin/env node
/**
 * capture-all.cjs — Puppeteer script to screenshot all 55 car+attachment combos.
 *
 * Usage:
 *   node test/capture-all.cjs
 *
 * Prerequisites:
 *   - Dev server running at http://localhost:3002  (npm run dev)
 *
 * Output:
 *   test/screenshots/{classId}-{attachmentId}.png  (256×256 each)
 */

'use strict';

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const BASE_URL   = 'http://localhost:3002/test/visual-test.html';
const SHOTS_DIR  = path.join(__dirname, 'screenshots');
const WAIT_MS    = 600;   // ms after navigation before screenshot

// ── Class / attachment definitions (mirrors attachments.js) ────────────────
// Keep in sync with src/config/attachments.js
const CLASSES = [
  {
    classId: 'addition',
    attachments: [
      'racing-stripe', 'flame-decal', 'rear-spoiler', 'rocket-exhaust',
      'crown', 'star-antenna', 'googly-eyes', 'rainbow-trail',
      'turbo-fan', 'rubber-ducky',
    ],
  },
  {
    classId: 'subtraction',
    attachments: [
      'mud-flaps-big', 'roof-rack', 'bull-bar', 'rally-lights',
      'racing-numbers', 'antenna-flag', 'snorkel', 'spare-tire',
      'camo-paint', 'cat-ears',
    ],
  },
  {
    classId: 'multiplication',
    attachments: [
      'smoke-stacks', 'skull-hood', 'chain-wheels', 'lightning-bolts-decal',
      'fire-wheels', 'viking-horns', 'spiked-bumper', 'monster-eyes',
      'mohawk', 'bat-wings',
    ],
  },
  {
    classId: 'division',
    attachments: [
      'shark-fin', 'halo-ring', 'sponsor-stickers', 'drs-wing',
      'led-strip', 'gold-rims', 'jet-engine', 'laser-antenna',
      'aero-canards', 'top-hat',
    ],
  },
  {
    classId: 'advanced',
    attachments: [
      'carbon-fiber', 'neon-underglow', 'extra-diffuser', 'side-scoops',
      'digital-camo', 'diamond-grille', 'scissor-doors', 'flame-thrower',
      'angel-wings', 'party-hat',
    ],
  },
];

// Build the full list of (classId, attachmentId) pairs
const COMBOS = [];
for (const { classId, attachments } of CLASSES) {
  COMBOS.push({ classId, attachmentId: 'bare' });
  for (const id of attachments) {
    COMBOS.push({ classId, attachmentId: id });
  }
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(SHOTS_DIR, { recursive: true });

  console.log(`Capturing ${COMBOS.length} screenshots → ${SHOTS_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let ok = 0;
  let fail = 0;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 256, height: 256, deviceScaleFactor: 1 });

    for (const { classId, attachmentId } of COMBOS) {
      const url      = `${BASE_URL}?class=${classId}&attachment=${attachmentId}`;
      const filename = `${classId}-${attachmentId}.png`;
      const outPath  = path.join(SHOTS_DIR, filename);

      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
        await new Promise(r => setTimeout(r, WAIT_MS));

        // Screenshot just the canvas element (256×256)
        const canvas = await page.$('canvas');
        if (canvas) {
          await canvas.screenshot({ path: outPath });
        } else {
          // Fallback: full page viewport screenshot
          await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 256, height: 256 } });
        }

        console.log(`  ✓  ${filename}`);
        ok++;
      } catch (err) {
        console.error(`  ✗  ${filename}: ${err.message}`);
        fail++;
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nDone. ${ok} succeeded, ${fail} failed.`);
  console.log(`Screenshots saved to: ${SHOTS_DIR}`);
  if (fail > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
