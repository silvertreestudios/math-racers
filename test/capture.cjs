const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 800 });
  
  console.log('Loading visual test page...');
  await page.goto('http://localhost:3000/test/visual-test.html', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for Phaser to render
  await new Promise(r => setTimeout(r, 3000));
  
  const outPath = path.join(__dirname, 'screenshots', 'car-grid.png');
  const fs = require('fs');
  fs.mkdirSync(path.join(__dirname, 'screenshots'), { recursive: true });
  
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Screenshot saved: ${outPath}`);
  
  await browser.close();
  
  // Kill the dev server
  process.exit(0);
})();
