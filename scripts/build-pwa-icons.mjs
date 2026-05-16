// Generates the PWA icon set from public/icon.svg.
// iOS strictly needs a PNG apple-touch-icon (SVG is silently ignored, which
// is why the home-screen icon was rendering as a screenshot blob). Android
// needs 192/512 PNGs in the manifest. We also produce a 1024 maskable for
// future use.
//
// Run with: node scripts/build-pwa-icons.mjs

import { readFileSync } from 'node:fs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'icon.svg');
const OUT = path.join(ROOT, 'public');

mkdirSync(OUT, { recursive: true });

const svg = readFileSync(SRC);

// (filename, pixel size, optional background for maskable / iOS quirks)
const TARGETS = [
  { file: 'apple-touch-icon.png', size: 180 },           // iOS Home Screen
  { file: 'icon-192.png',         size: 192 },           // Android manifest
  { file: 'icon-512.png',         size: 512 },           // Android manifest (large)
  { file: 'icon-maskable-512.png', size: 512, padded: true }, // Maskable (safe zone)
];

for (const t of TARGETS) {
  let pipeline = sharp(svg).resize(t.size, t.size, {
    fit: 'contain',
    background: { r: 14, g: 26, b: 38, alpha: 1 }, // matches the SVG bg color
  });
  // For maskable icons, browsers crop the outer 20% — pad the inner content
  // so the "RF" stays inside the safe zone.
  if (t.padded) {
    const inner = Math.round(t.size * 0.78);
    pipeline = sharp(svg).resize(inner, inner, { fit: 'contain' })
      .extend({
        top: Math.round((t.size - inner) / 2),
        bottom: Math.round((t.size - inner) / 2),
        left: Math.round((t.size - inner) / 2),
        right: Math.round((t.size - inner) / 2),
        background: { r: 14, g: 26, b: 38, alpha: 1 },
      });
  }
  const buf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  const outPath = path.join(OUT, t.file);
  writeFileSync(outPath, buf);
  console.log(`✓ ${t.file} (${t.size}×${t.size}, ${(buf.length / 1024).toFixed(1)} KB)`);
}
