const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CELL_W = 120;
const CELL_H = 120;
const COLS = 11;
const ROWS = 5;

const CLASS_ORDER = ['addition', 'subtraction', 'multiplication', 'division', 'advanced'];
const CLASS_LABELS = ['gokart', 'rally', 'monster', 'formula1', 'supercar'];

const ATTACHMENTS_BY_CLASS = {
  addition: ['racing-stripe', 'flame-decal', 'rear-spoiler', 'rocket-exhaust', 'crown', 'star-antenna', 'googly-eyes', 'rainbow-trail', 'turbo-fan', 'rubber-ducky'],
  subtraction: ['mud-flaps', 'roof-rack', 'bull-bar', 'rally-lights', 'racing-numbers', 'antenna-flag', 'snorkel', 'spare-tire', 'camo-paint', 'cat-ears'],
  multiplication: ['smoke-stacks', 'skull-hood', 'chain-wheels', 'lightning-bolts', 'fire-wheels', 'viking-horns', 'spiked-bumper', 'monster-eyes', 'mohawk', 'bat-wings'],
  division: ['shark-fin', 'halo-ring', 'sponsor-stickers', 'drs-wing', 'led-strip', 'gold-rims', 'jet-engine', 'laser-antenna', 'aero-canards', 'top-hat'],
  advanced: ['carbon-fiber', 'neon-underglow', 'rear-diffuser', 'side-scoops', 'digital-camo', 'diamond-grille', 'scissor-doors', 'flame-thrower', 'angel-wings', 'party-hat'],
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: COLS * CELL_W + 100, height: ROWS * CELL_H + 200 });

  console.log('Loading visual test page...');
  await page.goto('http://localhost:3000/test/visual-test.html', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Find the canvas element and get its bounding box
  const canvasBox = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });

  if (!canvasBox) {
    console.error('No canvas found!');
    await browser.close();
    process.exit(1);
  }

  console.log(`Canvas at: ${JSON.stringify(canvasBox)}`);

  const outDir = path.join(__dirname, 'screenshots', 'individual');
  fs.mkdirSync(outDir, { recursive: true });

  for (let row = 0; row < ROWS; row++) {
    const classLabel = CLASS_LABELS[row];
    const classId = CLASS_ORDER[row];
    const attachments = ['bare', ...ATTACHMENTS_BY_CLASS[classId]];

    for (let col = 0; col < COLS; col++) {
      const name = attachments[col];
      const filename = `${classLabel}-${name}.png`;
      const clip = {
        x: canvasBox.x + col * CELL_W,
        y: canvasBox.y + row * CELL_H,
        width: CELL_W,
        height: CELL_H,
      };
      await page.screenshot({ path: path.join(outDir, filename), clip });
    }
  }

  console.log(`Saved 55 individual screenshots to ${outDir}`);
  await browser.close();
  process.exit(0);
})();
