// ABOUTME: Emits 10 self-contained 1080x1080 HTML files into public/social/.
// ABOUTME: Each file is openable in a browser for preview; PNGs come from render-posts.mjs.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POSTS, BRAND, SITE } from './posts.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../../public/social');

// ─── shared styles ───────────────────────────────────────────────────────

const SHARED_CSS = `
  *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
  html,body { width: 1080px; height: 1080px; background: ${BRAND.bg}; color: ${BRAND.text}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
  body { display: flex; align-items: stretch; justify-content: stretch; }
  .stage { position: relative; width: 1080px; height: 1080px; overflow: hidden; }
  .serif { font-family: 'Playfair Display', Georgia, serif; }
  .mono  { font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace; }

  /* ornament: subtle diagonal lines used as background on every layout */
  .ornament-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 8% 12%, rgba(20,131,123,0.06), transparent 50%),
      radial-gradient(circle at 92% 88%, rgba(232,93,60,0.05), transparent 55%),
      ${BRAND.bg};
  }
  .corner-mark {
    position: absolute; top: 48px; left: 56px;
    display: inline-flex; align-items: center; gap: 12px;
    color: ${BRAND.text};
  }
  .corner-mark svg { display: block; }
  .corner-mark .name { font-family: 'Playfair Display', Georgia, serif; font-weight: 800; font-size: 18px; letter-spacing: 0.02em; line-height: 1.1; }
  .corner-mark .sub  { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: ${BRAND.textMute}; margin-top: 4px; }
  .corner-mark .stack { display: flex; flex-direction: column; }

  .footer-mark {
    position: absolute; bottom: 48px; left: 56px; right: 56px;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace; font-size: 13px; color: ${BRAND.textMute}; letter-spacing: 0.14em; text-transform: uppercase;
  }
  .footer-mark .url { color: ${BRAND.text}; font-weight: 700; letter-spacing: 0.08em; }

  .pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700; }
  .pill.ocean  { background: rgba(20,131,123,0.10); color: ${BRAND.ocean}; border: 1px solid rgba(20,131,123,0.22); }
  .pill.coral  { background: rgba(232,93,60,0.10);  color: ${BRAND.coral}; border: 1px solid rgba(232,93,60,0.22); }
  .pill.green  { background: rgba(45,134,89,0.10);  color: ${BRAND.green}; border: 1px solid rgba(45,134,89,0.22); }
`;

// Inline RF monogram — gold-on-dark — used in the top-left corner of every post.
const MONOGRAM_SVG = `
<svg width="56" height="56" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e1a26"/>
      <stop offset="100%" stop-color="#1a2d3f"/>
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e8c989"/>
      <stop offset="100%" stop-color="#b88a52"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g1)"/>
  <rect x="5" y="5" width="54" height="54" rx="10" fill="none" stroke="url(#g2)" stroke-width="0.6" opacity="0.5"/>
  <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="30" fill="url(#g2)" letter-spacing="-1.4">RF</text>
</svg>`;

const CORNER_MARK = `
<div class="corner-mark">
  ${MONOGRAM_SVG}
  <div class="stack">
    <div class="name">Ralph Foulger&rsquo;s</div>
    <div class="sub">Academy of Real Estate</div>
  </div>
</div>`;

const footerMark = (handle, cta) => `
<div class="footer-mark">
  <span>${handle}</span>
  <span class="url">${cta.replace(/^https?:\/\//, '')}</span>
</div>`;

// ─── template renderers ──────────────────────────────────────────────────

function tplCentered(post) {
  return `
  <div class="stage">
    <div class="ornament-bg"></div>
    ${CORNER_MARK}
    <div style="position: absolute; top: 180px; left: 64px; right: 64px;">
      <div class="pill ${post.accent}" style="font-size: 14px; padding: 10px 20px;">${post.eyebrow}</div>
      <h1 class="serif" style="font-size: ${headlineSize(post.headline)}px; font-weight: 900; letter-spacing: -0.03em; line-height: 0.98; color: ${BRAND.text}; margin: 36px 0 36px;">
        ${post.headline.replace(/<em>/g, `<em style="color:${accentColor(post.accent)};font-style:italic;">`)}
      </h1>
      <p style="font-size: 32px; line-height: 1.45; color: ${BRAND.textDim}; max-width: 960px; font-weight: 500;">
        ${post.body}
      </p>
      ${post.proof && post.proof.length ? `
        <div style="margin-top: 44px; display: flex; flex-wrap: wrap; gap: 12px;">
          ${post.proof.map(p => `
            <span style="padding: 14px 24px; border-radius: 12px; background: ${BRAND.bgRaised}; border: 1px solid ${BRAND.border}; color: ${BRAND.text}; font-size: 19px; font-weight: 700; letter-spacing: 0.01em;">
              ${p}
            </span>
          `).join('')}
        </div>
      ` : ''}
      ${post.ctaLabel ? `
        <div style="margin-top: 48px; display: inline-flex; align-items: center; gap: 14px; padding: 22px 38px; border-radius: 14px; background: ${accentBg(post.accent)}; color: white; font-weight: 800; font-size: 22px; letter-spacing: 0.05em; text-transform: uppercase;">
          ${post.ctaLabel} →
        </div>
      ` : ''}
    </div>
    ${footerMark(post.handle, post.cta)}
  </div>`;
}

function tplStat(post) {
  return `
  <div class="stage">
    <div class="ornament-bg"></div>
    ${CORNER_MARK}
    <div style="position: absolute; top: 168px; left: 64px; right: 64px;">
      <div class="pill ${post.accent}" style="font-size: 14px; padding: 10px 20px;">${post.eyebrow}</div>
    </div>
    <div style="position: absolute; top: 232px; left: 64px; right: 64px; display: flex; align-items: flex-start; gap: 42px;">
      <div style="flex: 0 0 auto;">
        <div class="serif" style="font-size: 380px; font-weight: 900; line-height: 0.82; letter-spacing: -0.06em; color: ${accentColor(post.accent)};">
          ${post.bigNumber}
        </div>
        <div class="mono" style="font-size: 22px; letter-spacing: 0.24em; color: ${BRAND.textMute}; text-transform: uppercase; margin-top: 10px; font-weight: 700;">
          ${post.bigNumberUnit}
        </div>
      </div>
      <div style="flex: 1 1 auto; padding-top: 12px;">
        <h2 class="serif" style="font-size: 70px; font-weight: 900; letter-spacing: -0.025em; line-height: 1.0; color: ${BRAND.text}; margin-bottom: 26px;">
          ${post.headline.replace(/<em>/g, `<em style="color:${accentColor(post.accent)};font-style:italic;">`)}
        </h2>
        <p style="font-size: 26px; line-height: 1.45; color: ${BRAND.textDim}; font-weight: 500;">${post.body}</p>
      </div>
    </div>
    <div style="position: absolute; bottom: 152px; left: 64px; right: 64px;">
      <div style="display: grid; grid-template-columns: repeat(${post.breakdown.length}, 1fr); gap: 12px;">
        ${post.breakdown.map(([k, v]) => `
          <div style="background: ${BRAND.bgRaised}; border: 1px solid ${BRAND.border}; border-radius: 14px; padding: 22px 22px;">
            <div class="mono" style="font-size: 13px; letter-spacing: 0.2em; color: ${BRAND.textMute}; text-transform: uppercase; margin-bottom: 10px; font-weight: 700;">${k}</div>
            <div class="serif" style="font-size: 34px; font-weight: 900; color: ${BRAND.text}; letter-spacing: -0.01em; line-height: 1;">${v}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ${footerMark(post.handle, post.cta)}
  </div>`;
}

function tplSplit(post) {
  return `
  <div class="stage" style="display: grid; grid-template-columns: 1fr 1fr;">
    <div style="background: ${accentBg(post.accent)}; padding: 64px 52px; display: flex; flex-direction: column; justify-content: space-between; color: #fff; position: relative;">
      <div>
        <div style="display: inline-flex; align-items: center; gap: 12px;">
          ${MONOGRAM_SVG}
          <div>
            <div class="serif" style="font-size: 20px; font-weight: 800; letter-spacing: 0.02em; line-height: 1.1; color: #fff;">Ralph Foulger&rsquo;s</div>
            <div class="mono" style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.78); margin-top: 4px;">Academy of Real Estate</div>
          </div>
        </div>
        <div style="margin-top: 56px;">
          <div class="mono" style="font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.94); font-weight: 700; margin-bottom: 28px;">${post.eyebrow}</div>
          <h2 class="serif" style="font-size: 76px; font-weight: 900; letter-spacing: -0.03em; line-height: 0.98; color: #fff;">
            ${post.headline.replace(/<em>/g, '<em style="color:#fff;font-style:italic;opacity:0.86;">')}
          </h2>
        </div>
      </div>
      ${post.price ? `
        <div>
          <div class="serif" style="font-size: 104px; font-weight: 900; line-height: 0.95; color: #fff; letter-spacing: -0.03em;">${post.price}</div>
          <div class="mono" style="font-size: 14px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.82); margin-top: 12px; font-weight: 700;">${post.priceSub}</div>
        </div>
      ` : ''}
    </div>
    <div style="background: ${BRAND.bg}; padding: 64px 52px; display: flex; flex-direction: column; justify-content: space-between; color: ${BRAND.text};">
      <div>
        <p style="font-size: 24px; line-height: 1.5; color: ${BRAND.textDim}; margin-bottom: 32px; font-weight: 500;">${post.body}</p>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px;">
          ${(post.bullets || []).map(b => `
            <li style="display: flex; align-items: flex-start; gap: 14px; font-size: 22px; line-height: 1.35; color: ${BRAND.text};">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: ${accentBg(post.accent)}; color: #fff; flex-shrink: 0; margin-top: 2px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-12"/></svg>
              </span>
              <span style="font-weight: 600;">${b}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: ${BRAND.textMute}; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 32px;">
        <span>${post.handle}</span>
        <span style="color: ${BRAND.text}; font-weight: 700; letter-spacing: 0.08em;">${post.cta.replace(/^https?:\/\//, '')}</span>
      </div>
    </div>
  </div>`;
}

function tplEditorial(post) {
  return `
  <div class="stage">
    <div class="ornament-bg"></div>
    ${CORNER_MARK}
    <div style="position: absolute; top: 180px; left: 64px; right: 64px;">
      <div class="pill ${post.accent}" style="font-size: 14px; padding: 10px 20px;">${post.eyebrow}</div>
      <h2 class="serif" style="font-size: 82px; font-weight: 900; letter-spacing: -0.03em; line-height: 0.98; color: ${BRAND.text}; margin: 32px 0 28px; max-width: 940px;">
        ${post.headline.replace(/<em>/g, `<em style="color:${accentColor(post.accent)};font-style:italic;">`)}
      </h2>
      <p style="font-size: 24px; line-height: 1.5; color: ${BRAND.textDim}; max-width: 940px; font-weight: 500;">${post.body}</p>
    </div>
    <div style="position: absolute; bottom: 144px; left: 64px; right: 64px;">
      <div style="background: #fff; border: 1px solid ${BRAND.border}; border-radius: 20px; padding: 26px 28px; box-shadow: 0 8px 28px rgba(14,26,38,0.06);">
        <div class="mono" style="font-size: 13px; letter-spacing: 0.22em; color: ${BRAND.textMute}; text-transform: uppercase; font-weight: 700; margin-bottom: 18px;">Today’s classes · Mon, May 14</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${post.scheduleSample.map((s, i) => `
            <div style="display: grid; grid-template-columns: 132px 1fr auto; gap: 18px; align-items: center; padding: 14px 18px; background: ${BRAND.bgRaised}; border-radius: 12px; border-left: 4px solid ${i === 0 ? accentColor(post.accent) : BRAND.borderHi};">
              <div class="mono" style="font-size: 17px; color: ${BRAND.text}; font-weight: 700;">${s.time}</div>
              <div style="font-size: 21px; color: ${BRAND.text}; font-weight: 600;">${s.label}</div>
              <div class="mono" style="font-size: 13px; color: ${i === 0 ? accentColor(post.accent) : BRAND.textMute}; letter-spacing: 0.08em; font-weight: 700;">${i === 0 ? 'NOW' : ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ${footerMark(post.handle, post.cta)}
  </div>`;
}

function accentColor(a) {
  return a === 'ocean' ? BRAND.ocean : a === 'coral' ? BRAND.coral : a === 'green' ? BRAND.green : BRAND.text;
}
function accentBg(a) {
  return a === 'ocean' ? `linear-gradient(135deg, ${BRAND.ocean} 0%, ${BRAND.oceanDk} 100%)`
       : a === 'coral' ? `linear-gradient(135deg, ${BRAND.coral} 0%, ${BRAND.coralDk} 100%)`
       : a === 'green' ? `linear-gradient(135deg, ${BRAND.green} 0%, #1f6b46 100%)`
       : BRAND.bgRaised;
}

// Scale the headline font down a bit when copy is long so it never wraps awkwardly.
// Bumped across the board so headlines fill more of the 1080x1080 canvas.
function headlineSize(headline) {
  const len = headline.replace(/<[^>]+>/g, '').length;
  if (len > 90)  return 68;
  if (len > 70)  return 78;
  if (len > 50)  return 92;
  if (len > 30)  return 104;
  return 118;
}

const TPL = { centered: tplCentered, stat: tplStat, split: tplSplit, editorial: tplEditorial };

// ─── build ───────────────────────────────────────────────────────────────

await mkdir(OUT_DIR, { recursive: true });

for (const post of POSTS) {
  const body = (TPL[post.template] || tplCentered)(post);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1080, initial-scale=1">
<title>Ralph Foulger Academy · ${post.id}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
<style>${SHARED_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
  const path = resolve(OUT_DIR, `${post.id}.html`);
  await writeFile(path, html, 'utf8');
  console.log(`  wrote ${post.id}.html`);
}

// Also write a gallery index for easy preview
const galleryHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>RFA · Social posts</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; margin: 0; padding: 40px; background: #111; color: #fff; }
  h1 { font-size: 22px; margin-bottom: 24px; font-weight: 700; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
  .card { background: #1a1a1a; border-radius: 12px; padding: 16px; }
  .card iframe { width: 100%; aspect-ratio: 1/1; border: 0; border-radius: 8px; background: white; transform: scale(0.34); transform-origin: top left; }
  .card-frame { position: relative; width: 100%; aspect-ratio: 1/1; overflow: hidden; border-radius: 8px; background: white; }
  .card-frame iframe { position: absolute; top: 0; left: 0; width: 1080px; height: 1080px; transform: scale(calc(100% / 1080 * 360)); transform-origin: top left; border: 0; }
  .card .label { font-family: 'JetBrains Mono', monospace; font-size: 12px; opacity: 0.7; margin-top: 12px; }
  .card .name { font-weight: 600; margin-top: 4px; }
</style></head>
<body>
<h1>Ralph Foulger Academy · 10 social posts · 1080×1080</h1>
<div class="grid">
${POSTS.map(p => `
  <div class="card">
    <div class="card-frame"><iframe src="/social/${p.id}.html"></iframe></div>
    <div class="label">${p.id} · ${p.template}</div>
    <div class="name">${p.eyebrow}</div>
  </div>
`).join('')}
</div>
</body></html>`;
await writeFile(resolve(OUT_DIR, 'index.html'), galleryHtml, 'utf8');
console.log('  wrote index.html (gallery)');
console.log(`\nDone. ${POSTS.length} posts written to public/social/`);
console.log('Preview gallery: open public/social/index.html in a browser');
