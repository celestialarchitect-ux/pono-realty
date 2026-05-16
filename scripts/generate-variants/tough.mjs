// ABOUTME: Generates 9 additional variants per TOUGH_BANK item (mock-exam-only Hard/Gnarly questions).
// ABOUTME: Writes src/lib/content/tough-variant-pool.ts. Keyed by tough-{djb2(q)} to match practice-page IDs.
//
// Usage:
//   ANTHROPIC_API_KEY=... npx tsx scripts/generate-variants/tough.mjs
//   ANTHROPIC_API_KEY=... npx tsx scripts/generate-variants/tough.mjs --dry-run
//
// Resumes from existing tough-variant-pool.ts. Safe to re-run on rate-limit failure.

import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const OUTPUT = resolve(PROJECT_ROOT, 'src/lib/content/tough-variant-pool.ts');
const LOG = '/tmp/tough-variant-gen.log';

const args = new Map(process.argv.slice(2).map(a => {
  const m = a.match(/^--(\w+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
}));
const DRY_RUN = args.has('dry-run');
const TARGET_VARIANTS = Number(args.get('target') ?? '9');
const VARIANTS_PER_Q = 3;     // smaller batches → fewer rate-limit retries
const MIN_DELAY_MS = 6000;
const MAX_RETRIES = 4;

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

await writeFile(LOG, `Tough-bank variant gen · ${new Date().toISOString()}\n\n`, 'utf8');

// Match the same djb2 hash the practice page + admin API use so questionIds line up.
function toughHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h |= 0;
  }
  return `tough-${Math.abs(h).toString(36).slice(0, 7)}`;
}

const toughUrl = pathToFileURL(resolve(PROJECT_ROOT, 'src/lib/content/exam-tough.ts')).href;
const { TOUGH_BANK } = await import(toughUrl);

console.log(`Loaded TOUGH_BANK · ${TOUGH_BANK.length} items`);
console.log(`Target: ${TARGET_VARIANTS} additional variants per question (= ${TARGET_VARIANTS + 1} total per item)`);

const SYSTEM_PROMPT = `You are an expert Hawaii real estate licensing instructor. You author additional variants of HARD multiple-choice questions for a pre-licensing mock exam. The variants test the SAME concept and difficulty as the original, but use different wording, different distractors, and a different angle so a student who memorized the original cannot game them.

Rules:
1. Each variant tests the SAME concept (same correct answer principle).
2. The 4 options must include 3 plausible-but-wrong distractors using real Hawaii REC / national real estate vocabulary.
3. Vary the question stem: rephrase, recontextualize, change the scenario.
4. Variants MUST stay at the same difficulty level (hard / gnarly) — these are mock-exam-only items meant to stretch the student.
5. The "explain" field must justify the correct answer (1-2 sentences).
6. Return ONLY valid JSON in the exact requested shape. No commentary, no markdown fences, no leading text.`;

function userPrompt(q, count) {
  return `Generate exactly ${count} additional variants of this DIFFICULT multiple-choice real estate question. Each variant tests the SAME concept and same difficulty level but uses different wording and different distractors.

ORIGINAL QUESTION (${q.difficulty} difficulty · ${q.portion} portion):
${JSON.stringify({
  q: q.q,
  options: q.options,
  correctIndex: q.correctIndex,
  explain: q.explain,
}, null, 2)}

Return a JSON object with this exact shape (no markdown fences, no commentary):
{
  "variants": [
    {
      "q": "rephrased question stem",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explain": "1-2 sentence justification"
    },
    ...
  ]
}

The correctIndex CAN be different across variants (place the right answer in different positions to prevent positional memorization), but the correct ANSWER PRINCIPLE must be the same as the original.`;
}

async function callClaudeFor(q, count) {
  const body = {
    model: 'claude-haiku-4-5',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt(q, count) }],
  };
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      const data = await r.json();
      const text = data.content?.[0]?.text;
      if (!text) throw new Error('empty response');
      return text;
    }
    const text = await r.text();
    lastErr = new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
    if (r.status === 429 || r.status >= 500) {
      const ra = Number(r.headers.get('retry-after'));
      const waitMs = !Number.isNaN(ra) && ra > 0
        ? ra * 1000
        : Math.min(60_000, 4_000 * Math.pow(2, attempt));
      await new Promise(res => setTimeout(res, waitMs));
      continue;
    }
    throw lastErr;
  }
  throw lastErr;
}

function parseVariants(raw) {
  let s = raw.trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  const parsed = JSON.parse(s);
  if (!parsed || !Array.isArray(parsed.variants)) throw new Error('missing variants array');
  const out = [];
  for (const v of parsed.variants) {
    if (typeof v.q !== 'string' || v.q.length < 10 || v.q.length > 700) throw new Error('bad q');
    if (!Array.isArray(v.options) || v.options.length !== 4) throw new Error('bad options length');
    for (const o of v.options) {
      if (typeof o !== 'string' || o.length === 0 || o.length > 300) throw new Error('bad option string');
    }
    if (typeof v.correctIndex !== 'number' || v.correctIndex < 0 || v.correctIndex > 3) throw new Error('bad correctIndex');
    if (typeof v.explain !== 'string' || v.explain.length < 5) throw new Error('bad explain');
    out.push({
      q: v.q,
      options: v.options,
      correctIndex: Math.floor(v.correctIndex),
      explain: v.explain,
    });
  }
  if (out.length === 0) throw new Error('no usable variants');
  return out;
}

async function logLine(s) { await appendFile(LOG, s + '\n', 'utf8'); }

// RESUME: pre-load existing pool
const results = new Map();
let resumed = 0;
try {
  const mod = await import(pathToFileURL(OUTPUT).href);
  if (mod?.TOUGH_VARIANT_POOL && typeof mod.TOUGH_VARIANT_POOL === 'object') {
    for (const [qid, variants] of Object.entries(mod.TOUGH_VARIANT_POOL)) {
      if (Array.isArray(variants) && variants.length > 0) {
        results.set(qid, variants);
        resumed++;
      }
    }
  }
} catch { /* fresh run */ }
console.log(`Resume: pre-loaded ${resumed} questions from existing tough-variant-pool.ts`);

const queue = TOUGH_BANK.map(t => ({ questionId: toughHash(t.q), original: t }));
const remaining = queue.filter(item => (results.get(item.questionId)?.length ?? 0) < TARGET_VARIANTS);
console.log(`Need more variants for: ${remaining.length} tough items`);

const failures = [];
let done = 0;
const SAVE_EVERY = 4;

for (const item of remaining) {
  const existing = results.get(item.questionId) ?? [];
  const needed = Math.max(0, TARGET_VARIANTS - existing.length);
  let added = 0;
  while (added < needed) {
    const requestCount = Math.min(VARIANTS_PER_Q, needed - added);
    try {
      const raw = await callClaudeFor(item.original, requestCount);
      const variants = parseVariants(raw);
      const current = results.get(item.questionId) ?? [];
      results.set(item.questionId, [...current, ...variants]);
      added += variants.length;
      await logLine(`OK   ${item.questionId}  · +${variants.length} variants (now ${current.length + variants.length})`);
    } catch (e) {
      failures.push({ questionId: item.questionId, error: e.message });
      await logLine(`FAIL ${item.questionId}  · ${e.message}`);
      break;
    }
    if (added < needed) await new Promise(res => setTimeout(res, MIN_DELAY_MS));
  }
  done++;
  if (done % 2 === 0 || done === remaining.length) {
    process.stdout.write(`  progress ${done}/${remaining.length}  (${failures.length} failed)\n`);
  }
  if (done % SAVE_EVERY === 0) await flush();
  if (done < remaining.length) await new Promise(res => setTimeout(res, MIN_DELAY_MS));
}

console.log('');
console.log(`Generated variants for ${results.size}/${queue.length} tough items`);
if (failures.length > 0) console.log(`  ${failures.length} failures — see ${LOG}`);

if (DRY_RUN) { console.log('DRY RUN — skipping file write.'); process.exit(0); }
await flush();
console.log(`\nWrote ${OUTPUT}`);

async function flush() {
  const header = `// ABOUTME: Auto-generated variants for TOUGH_BANK (mock-exam-only Hard/Gnarly questions).
// ABOUTME: Keyed by tough-{djb2(q)} — same ID the practice page and admin analytics use.

import type { Variant } from './question-variants';

// Generated ${new Date().toISOString()} via Claude Haiku.
// ${results.size}/${queue.length} questions populated; ${failures.length} failures.
// Run \`npx tsx scripts/generate-variants/tough.mjs\` to regenerate (resumes).
export const TOUGH_VARIANT_POOL: Record<string, Variant[]> = {
`;
  const entries = [];
  for (const [qid, variants] of [...results.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const variantLines = variants.map(v => {
      const opts = v.options.map(o => JSON.stringify(o)).join(', ');
      return `    {
      q: ${JSON.stringify(v.q)},
      options: [${opts}],
      correctIndex: ${v.correctIndex},
      explain: ${JSON.stringify(v.explain)},
    },`;
    }).join('\n');
    entries.push(`  ${JSON.stringify(qid)}: [\n${variantLines}\n  ],`);
  }
  const footer = `\n};\n`;
  await writeFile(OUTPUT, header + entries.join('\n') + footer, 'utf8');
}
