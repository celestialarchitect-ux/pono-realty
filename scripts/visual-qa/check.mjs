// ABOUTME: Visual QA pass — screenshots the live site at desktop + mobile widths so we can spot breakage fast.
// ABOUTME: Outputs to /tmp/rfa-visual-qa/<page>-<width>.png. Auth'd pages use a fresh test account.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT_DIR = '/tmp/rfa-visual-qa';
await mkdir(OUT_DIR, { recursive: true });

const BASE = 'https://ralphfoulger.com';

// Public pages — no auth needed
const PUBLIC = [
  '/',
  '/pricing',
  '/free',
  '/faq',
  '/policies/terms',
  '/policies/privacy',
  '/policies/disclaimer',
  '/verify-certificate',
  '/login',
  '/signup',
];

// Mobile + desktop both for the main funnel pages
const WIDTHS = [
  { label: 'mobile', w: 375, h: 812 },
  { label: 'desktop', w: 1280, h: 900 },
];

const browser = await chromium.launch();

for (const path of PUBLIC) {
  for (const v of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: v.h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(300);
      const safe = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
      const out = resolve(OUT_DIR, `${safe}-${v.label}.png`);
      await page.screenshot({ path: out, fullPage: true });
      const buf = (await import('node:fs')).statSync(out).size;
      console.log(`  ${safe.padEnd(28)} ${v.label.padEnd(8)} ${(buf / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.error(`  ${path} ${v.label} FAILED:`, e.message);
    } finally {
      await ctx.close();
    }
  }
}

await browser.close();
console.log(`\nDone. Screenshots in ${OUT_DIR}`);
