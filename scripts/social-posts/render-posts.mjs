// ABOUTME: Renders every public/social/post-*.html to a 1080x1080 PNG.
// ABOUTME: Outputs to public/social/png/ — drop-in-ready for Instagram, FB, LinkedIn.

import { chromium } from 'playwright';
import { readdir, mkdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_DIR = resolve(__dirname, '../../public/social');
const PNG_DIR = resolve(HTML_DIR, 'png');

await mkdir(PNG_DIR, { recursive: true });

const files = (await readdir(HTML_DIR)).filter(f => /^post-\d+\.html$/.test(f)).sort();
console.log(`Rendering ${files.length} posts…`);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1080, height: 1080 },
  deviceScaleFactor: 2,        // retina-crisp PNGs
  reducedMotion: 'reduce',
});

for (const f of files) {
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(join(HTML_DIR, f)).toString(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(150); // settle web fonts
  const out = join(PNG_DIR, f.replace(/\.html$/, '.png'));
  await page.screenshot({ path: out, fullPage: false, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
  console.log(`  wrote ${out}`);
  await page.close();
}

await browser.close();
console.log(`\nDone. PNGs in ${PNG_DIR}`);
