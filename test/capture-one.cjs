const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 256, height: 256 });

  const url = `http://localhost:3000/test/visual-test.html?class=addition&attachment=rear-spoiler`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  const canvas = await page.$('canvas');
  const outPath = '/home/clausman/.openclaw/workspace/car-renders/addition-rear-spoiler-v2.png';
  await canvas.screenshot({ path: outPath });
  console.log('Saved:', outPath);

  await browser.close();
  process.exit(0);
})();
