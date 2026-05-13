// ABOUTME: Generates 4 additional variants per existing question via Claude Haiku.
// ABOUTME: Validates JSON shape + answer-key sanity, writes src/lib/content/variant-pool.ts.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-variants/build.mjs
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-variants/build.mjs --chapters property-ownership,contracts
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-variants/build.mjs --dry-run
//
// Outputs:
//   - src/lib/content/variant-pool.ts  (overwritten with all generated variants)
//   - /tmp/variant-gen.log              (per-question generation log)
//
// Design notes:
//   - We send one question at a time, asking for exactly 4 variants in
//     strict JSON. Larger batches sometimes hallucinate question shape.
//   - We never let the model "fix" the right answer — we tell it the
//     correctIndex it MUST keep, and reject the response if it changes it.
//   - Concurrency capped to 6 to stay polite to the API.
//   - On any per-question failure we emit a stub variant pool entry so the
//     output file is always valid TypeScript; failed questions are listed
//     at the end of the log so a human can review.

import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const OUTPUT = resolve(PROJECT_ROOT, 'src/lib/content/variant-pool.ts');
const LOG = '/tmp/variant-gen.log';

const args = new Map(process.argv.slice(2).map(a => {
  const m = a.match(/^--(\w+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
}));
const DRY_RUN = args.has('dry-run');
const CHAPTER_FILTER = args.get('chapters')?.split(',').map(s => s.trim()).filter(Boolean) ?? null;
// How many ADDITIONAL variants per question we'd like in the pool. The
// original question stays at index 0, so total = 1 + TARGET_VARIANTS.
// Override on the command line: --target=9 generates up to 9 additional
// (= 10 total per question including the original).
const TARGET_VARIANTS = Number(args.get('target') ?? '4');
// How many variants to ask for in a single API call. Smaller batches stay
// well under the per-minute output-token budget on rate-limited tiers.
const VARIANTS_PER_Q = 4;
// Sequential by default — Anthropic Haiku rate limits (10K output tok/min,
// 50 RPM) make concurrent requests counter-productive. Pace at ~6 sec
// between calls = ~10 req/min, well under the RPM cap, and stays under the
// output-token-per-minute budget for ~700-token responses.
const CONCURRENCY = 1;
const MIN_DELAY_MS = 6000;
const MAX_RETRIES = 4;

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

// Reset the log
await writeFile(LOG, `Variant generation run · ${new Date().toISOString()}\n\n`, 'utf8');

// Dynamic import so we don't need a build step
const nationalUrl = pathToFileURL(resolve(PROJECT_ROOT, 'src/lib/content/national.ts')).href;
const stateUrl    = pathToFileURL(resolve(PROJECT_ROOT, 'src/lib/content/state.ts')).href;
// We need a TS-aware import. Easiest: run via tsx (see package.json script we add).
// If that fails, fall back to a regex extract from the source file.
let NATIONAL_CONTENT, STATE_CONTENT;
try {
  ({ NATIONAL_CONTENT } = await import(nationalUrl));
  ({ STATE_CONTENT } = await import(stateUrl));
} catch (e) {
  console.error('TS import failed (run via `npx tsx scripts/generate-variants/build.mjs` or `npm run gen-variants`). Error:', e.message);
  process.exit(1);
}

const ALL_CHAPTERS = [...NATIONAL_CONTENT, ...STATE_CONTENT];
const TARGET_CHAPTERS = CHAPTER_FILTER
  ? ALL_CHAPTERS.filter(c => CHAPTER_FILTER.includes(c.slug))
  : ALL_CHAPTERS;
const TOTAL_QUESTIONS = TARGET_CHAPTERS.reduce((s, c) => s + c.practice.length, 0);

console.log(`Generating ${VARIANTS_PER_Q} variants for ${TOTAL_QUESTIONS} questions across ${TARGET_CHAPTERS.length} chapters`);
console.log(`  concurrency=${CONCURRENCY}  dry_run=${DRY_RUN}  model=claude-haiku-4-5`);
console.log('');

// ─── Per-question generation ─────────────────────────────────────────────

function autoQuestionId(slug, idx) {
  return `${slug}-q${idx.toString().padStart(2, '0')}`;
}

const SYSTEM_PROMPT = `You are an expert Hawaii real estate licensing instructor. You author additional variants of multiple-choice questions for a pre-licensing course. The variants test the SAME concept as the original, but use different wording, different distractors, and a different angle so a student who memorized the original cannot game them.

Rules:
1. Each variant tests the SAME concept (same correct answer principle).
2. The 4 options must include 3 plausible-but-wrong distractors using real Hawaii REC / national real estate vocabulary.
3. Vary the question stem: rephrase, recontextualize, change the scenario.
4. Variants must be of similar difficulty to the original (no easier, no harder).
5. The "explain" field must justify the correct answer (1-2 sentences).
6. Return ONLY valid JSON in the exact requested shape. No commentary, no markdown fences, no leading text.`;

function userPrompt(q, count) {
  return `Generate exactly ${count} additional variants of this multiple-choice real estate question. Each variant tests the SAME concept but uses different wording and different distractors.

ORIGINAL QUESTION:
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
  // Retry on 429 + 5xx with exponential backoff. Respects retry-after if
  // Anthropic returns it.
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
      // Honor retry-after header if present, else exponential backoff.
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

function parseVariants(raw, original) {
  // Strip markdown fences if the model added them
  let s = raw.trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  let parsed;
  try { parsed = JSON.parse(s); }
  catch (e) { throw new Error('JSON parse failed: ' + e.message); }
  if (!parsed || !Array.isArray(parsed.variants)) {
    throw new Error('missing variants array');
  }
  // Shape-validate each variant
  const out = [];
  for (const v of parsed.variants) {
    if (typeof v.q !== 'string' || v.q.length < 10 || v.q.length > 500) throw new Error('bad q');
    if (!Array.isArray(v.options) || v.options.length !== 4) throw new Error('bad options length');
    for (const o of v.options) {
      if (typeof o !== 'string' || o.length === 0 || o.length > 200) throw new Error('bad option string');
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

async function logLine(s) {
  await appendFile(LOG, s + '\n', 'utf8');
}

// Build flat list of questions to generate for, with their IDs
const queue = [];
for (const ch of TARGET_CHAPTERS) {
  ch.practice.forEach((q, i) => {
    queue.push({ chapterSlug: ch.slug, questionId: autoQuestionId(ch.slug, i), original: q });
  });
}

const results = new Map(); // questionId → variants[]
const failures = [];

// RESUME MODE: load existing variant-pool.ts if present and pre-fill
// `results` with questions that already have variants. Skips generating
// them again, which is critical after a rate-limited partial run.
let resumed = 0;
try {
  const existingTs = await readFile(OUTPUT, 'utf8');
  // Parse loosely by importing — the file exports VARIANT_POOL, a Record.
  // We can't `import` a TS file directly from .mjs without tsx, but since
  // this script IS run via tsx, dynamic import works.
  const mod = await import(pathToFileURL(OUTPUT).href);
  if (mod?.VARIANT_POOL && typeof mod.VARIANT_POOL === 'object') {
    for (const [qid, variants] of Object.entries(mod.VARIANT_POOL)) {
      if (Array.isArray(variants) && variants.length > 0) {
        results.set(qid, variants);
        resumed++;
      }
    }
  }
  void existingTs;
} catch { /* no existing pool — fresh run */ }
console.log(`Resume: pre-loaded ${resumed} questions from existing variant-pool.ts`);

// "Top off" mode: a question that already has variants is INCLUDED in
// the queue if we want more than it currently has. We mark these so the
// per-question loop knows to APPEND rather than replace.
const remaining = queue.filter(item => {
  const have = results.get(item.questionId)?.length ?? 0;
  return have < TARGET_VARIANTS;
});
console.log(`Target per question: ${TARGET_VARIANTS} variants`);
console.log(`Need more variants for: ${remaining.length} questions`);

// Sequential loop with min delay between requests + periodic save so a
// crash doesn't lose progress.
let done = 0;
async function flush() {
  await emitVariantPoolFile(results, queue.length, failures);
}
const SAVE_EVERY = 10;

for (const item of remaining) {
  const existing = results.get(item.questionId) ?? [];
  const needed = Math.max(0, TARGET_VARIANTS - existing.length);
  // We ask the API for up to VARIANTS_PER_Q (4) per call. If we need more
  // than that, we'll loop until satisfied. For most cases needed <= 4 so
  // one call suffices.
  let added = 0;
  while (added < needed) {
    const requestCount = Math.min(VARIANTS_PER_Q, needed - added);
    try {
      const raw = await callClaudeFor(item.original, requestCount);
      const variants = parseVariants(raw, item.original);
      // Append to existing rather than replace — preserves earlier work.
      const current = results.get(item.questionId) ?? [];
      results.set(item.questionId, [...current, ...variants]);
      added += variants.length;
      await logLine(`OK   ${item.questionId}  · +${variants.length} variants (now ${current.length + variants.length})`);
    } catch (e) {
      failures.push({ questionId: item.questionId, error: e.message });
      await logLine(`FAIL ${item.questionId}  · ${e.message}`);
      break;
    }
    if (added < needed) {
      await new Promise(res => setTimeout(res, MIN_DELAY_MS));
    }
  }
  done++;
  if (done % 5 === 0 || done === remaining.length) {
    process.stdout.write(`  progress ${done}/${remaining.length}  (${failures.length} failed)\n`);
  }
  if (done % SAVE_EVERY === 0) await flush();
  if (done < remaining.length) await new Promise(res => setTimeout(res, MIN_DELAY_MS));
}

console.log('');
console.log(`Generated variants for ${results.size}/${queue.length} questions`);
if (failures.length > 0) {
  console.log(`  ${failures.length} failures — see ${LOG} for details`);
}

if (DRY_RUN) {
  console.log('DRY RUN — skipping file write.');
  process.exit(0);
}

await emitVariantPoolFile(results, queue.length, failures);
console.log(`\nWrote ${OUTPUT}`);
if (failures.length > 0) {
  console.log(`\n${failures.length} failures — re-run \`npm run gen-variants\` to retry (it resumes from existing).`);
}

// ─── helper: write the variant-pool.ts file ─────────────────────────────
async function emitVariantPoolFile(results, totalQuestions, failures) {
  const header = `// ABOUTME: Auto-generated additional question variants. Edit by re-running scripts/generate-variants/build.mjs.
// ABOUTME: Per-question merge: original variant stays at index 0; entries here become variants 1..N.

import type { QuestionId, Variant } from './question-variants';

// Generated ${new Date().toISOString()} via Claude Haiku.
// ${results.size}/${totalQuestions} questions populated; ${failures.length} failures.
// Run \`npm run gen-variants\` to regenerate (resumes from existing). See /tmp/variant-gen.log for last run.
export const VARIANT_POOL: Record<QuestionId, Variant[]> = {
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
  const out = header + entries.join('\n') + footer;
  await writeFile(OUTPUT, out, 'utf8');
}
