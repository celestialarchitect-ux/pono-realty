// ABOUTME: Rasterizes Stripe branding assets — square icon + wide logo — at the sizes Stripe wants.
// ABOUTME: Outputs /tmp/stripe-rfa-icon.png (512x512) and /tmp/stripe-rfa-logo.png (1000x300).

import { chromium } from 'playwright';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const OUT_DIR = '/tmp';
await mkdir(OUT_DIR, { recursive: true });

const ICON_SVG = await readFile(resolve(PROJECT_ROOT, 'public/icon.svg'), 'utf8');

// Wider banner-style wordmark for the LOGO slot (used on Stripe receipts /
// emails). Keeps the RF monogram on the left + full academy name on the
// right, all on a cream background so it works on white receipt headers.
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300" width="1000" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e1a26"/>
      <stop offset="100%" stop-color="#1a2d3f"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e8c989"/>
      <stop offset="100%" stop-color="#b88a52"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="300" fill="#fbf7f0"/>
  <!-- Monogram block -->
  <rect x="60" y="60" width="180" height="180" rx="32" fill="url(#bg)"/>
  <rect x="76" y="76" width="148" height="148" rx="22" fill="none" stroke="url(#gold)" stroke-width="1.6" opacity="0.55"/>
  <text x="150" y="172" text-anchor="middle" dominant-baseline="middle"
    font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="92"
    fill="url(#gold)" letter-spacing="-3">RF</text>
  <!-- Wordmark -->
  <text x="290" y="142" font-family="Playfair Display, Georgia, serif" font-weight="800"
    font-size="58" fill="#0e1a26" letter-spacing="-1.5">
    Ralph Foulger&#x2019;s
  </text>
  <text x="290" y="200" font-family="JetBrains Mono, SFMono-Regular, Menlo, monospace" font-weight="600"
    font-size="22" fill="#14837b" letter-spacing="7">
    ACADEMY OF REAL ESTATE
  </text>
  <!-- Underline accent -->
  <rect x="290" y="218" width="60" height="3" fill="#e85d3c"/>
</svg>`;

// Build a minimal HTML wrapper for each so Playwright can render to PNG at exact size + retina DPR.
function wrap(svg, width, height) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  *,html,body { margin:0; padding:0; }
  html,body { width:${width}px; height:${height}px; background:transparent; overflow:hidden; }
  svg { display:block; }
</style></head><body>${svg}</body></html>`;
}

const browser = await chromium.launch();

async function shoot(html, width, height, outPath) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: outPath,
    omitBackground: false,
    clip: { x: 0, y: 0, width, height },
  });
  await ctx.close();
}

await shoot(wrap(ICON_SVG, 512, 512), 512, 512, `${OUT_DIR}/stripe-rfa-icon.png`);
console.log(`  wrote ${OUT_DIR}/stripe-rfa-icon.png (512×512 @2x)`);

await shoot(wrap(LOGO_SVG, 1000, 300), 1000, 300, `${OUT_DIR}/stripe-rfa-logo.png`);
console.log(`  wrote ${OUT_DIR}/stripe-rfa-logo.png (1000×300 @2x)`);

await browser.close();
console.log('\nDone.');
