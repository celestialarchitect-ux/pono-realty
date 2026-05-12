#!/usr/bin/env node
// Generates MP3 narration of a free-course lesson using the Zachariah
// ElevenLabs voice clone. Each lesson becomes one MP3 saved to
// public/audio/lesson-N.mp3 and is served as a static asset (no per-play
// API cost).
//
// Usage:
//   ELEVENLABS_API_KEY=sk_xxx node scripts/generate-lesson-audio.mjs 1
//   (lesson number defaults to 1 if omitted)
//
// Reads lesson content directly from src/app/free/lessons-data.ts so the
// audio always matches the deployed text. Composes title → summary →
// section[heading + body]* → takeaway with natural pauses (".") between.

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'aJadAcgrxD6cf1C0koIA'; // Zachariah
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const KEY = process.env.ELEVENLABS_API_KEY;

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const LESSONS_FILE = resolve(PROJECT_ROOT, 'src/app/free/lessons-data.ts');
const AUDIO_DIR = resolve(PROJECT_ROOT, 'public/audio');

function die(msg, code = 1) {
  console.error(`error: ${msg}`);
  process.exit(code);
}

if (!KEY) die('ELEVENLABS_API_KEY not set. Source it from ~/.env or pass inline.');

const lessonNumber = parseInt(process.argv[2] ?? '1', 10);
if (!Number.isFinite(lessonNumber) || lessonNumber < 1 || lessonNumber > 5) {
  die('lesson number must be 1-5');
}

// ─── Extract lesson content from the TS source ───────────────────────────
// Simple, deterministic parse: split FREE_LESSONS by '{ slug:' and pull
// title / summary / sections / takeaway from each block. The lesson file
// has no fancy escaping so this is fine without a full parser.
function parseLessons() {
  const src = readFileSync(LESSONS_FILE, 'utf8');
  // Match the array entries (top-level only)
  const blocks = src.split(/(?=\{\s*\n?\s*slug:\s*['"]lesson-\d)/).slice(1);
  const out = [];
  for (const b of blocks) {
    const slug = b.match(/slug:\s*['"](lesson-\d+)['"]/)?.[1];
    const numberMatch = b.match(/number:\s*(\d+)/);
    const title = b.match(/title:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const summary = b.match(/summary:\s*["']([\s\S]*?)["'],?\n\s+sections/)?.[1] ?? '';
    const sectionsMatch = [...b.matchAll(/heading:\s*["']([\s\S]*?)["'],\s*\n\s*body:\s*["']([\s\S]*?)["'],?\s*\n\s*\}/g)];
    const sections = sectionsMatch.map(m => ({ heading: m[1], body: m[2] }));
    const takeaway = b.match(/takeaway:\s*["']([\s\S]*?)["'],?\s*\n\s*\}/)?.[1] ?? '';
    if (!slug || !numberMatch) continue;
    out.push({ slug, number: +numberMatch[1], title, summary, sections, takeaway });
  }
  return out;
}

function clean(t) {
  return String(t)
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function composeNarration(lesson) {
  const parts = [
    `Lesson ${lesson.number}. ${lesson.title}.`,
    clean(lesson.summary),
  ];
  for (const s of lesson.sections) {
    parts.push(`${clean(s.heading)}.`);
    parts.push(clean(s.body));
  }
  parts.push(`The takeaway. ${clean(lesson.takeaway)}`);
  // Two-space gap between parts encourages natural pause in TTS
  return parts.join('  ');
}

const lessons = parseLessons();
const lesson = lessons.find(l => l.number === lessonNumber);
if (!lesson) die(`lesson ${lessonNumber} not found in lessons-data.ts`);

const text = composeNarration(lesson);
console.log(`Lesson ${lesson.number}: "${lesson.title}"`);
console.log(`  text length: ${text.length.toLocaleString()} chars`);
console.log(`  voice: ${VOICE_ID}`);
console.log(`  model: ${MODEL_ID}`);

// ─── Quota check ──────────────────────────────────────────────────────────
console.log('\nchecking quota…');
const subRes = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
  headers: { 'xi-api-key': KEY },
});
if (!subRes.ok) die(`subscription check failed: ${subRes.status}`);
const sub = await subRes.json();
const remaining = sub.character_limit - sub.character_count;
const resetIso = sub.next_character_count_reset_unix
  ? new Date(sub.next_character_count_reset_unix * 1000).toISOString()
  : '(unknown)';
console.log(`  remaining: ${remaining.toLocaleString()} / ${sub.character_limit.toLocaleString()}  · resets ${resetIso}`);

if (text.length > remaining) {
  console.error(`\n⚠️  not enough quota. needed ${text.length}, have ${remaining}.`);
  console.error(`   re-run after ${resetIso} (in ${((sub.next_character_count_reset_unix * 1000 - Date.now()) / 3600_000).toFixed(1)} hours).`);
  process.exit(2);
}

// ─── Generate ─────────────────────────────────────────────────────────────
console.log('\ngenerating MP3…');
const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
  method: 'POST',
  headers: {
    'xi-api-key': KEY,
    'Content-Type': 'application/json',
    'Accept': 'audio/mpeg',
  },
  body: JSON.stringify({
    text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.85,
      style: 0.20,
      use_speaker_boost: true,
    },
  }),
});

if (!ttsRes.ok) {
  const errText = await ttsRes.text();
  die(`TTS failed (${ttsRes.status}): ${errText.slice(0, 500)}`);
}

const buf = Buffer.from(await ttsRes.arrayBuffer());
if (!existsSync(AUDIO_DIR)) await mkdir(AUDIO_DIR, { recursive: true });
const outPath = resolve(AUDIO_DIR, `${lesson.slug}.mp3`);
await writeFile(outPath, buf);

console.log(`\n✓ saved ${(buf.length / 1024).toFixed(1)} KB → ${outPath}`);
console.log(`  characters charged: ${text.length.toLocaleString()}`);
console.log(`  remaining quota: ~${(remaining - text.length).toLocaleString()}`);
