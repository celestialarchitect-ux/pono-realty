'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRICULUM, getChapter, neighbors } from '@/lib/curriculum';
import { NATIONAL_CONTENT } from '@/lib/content/national';
import { STATE_CONTENT } from '@/lib/content/state';
import { loadProgress, markChapterRead, isChapterRead } from '@/lib/progress';
import type { CourseProgress } from '@/lib/progress';
import type { ChapterContent } from '@/lib/content/national';
import { T, SHADOW_3D, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { VoicePlayer } from '@/components/VoicePlayer';

export default function CourseChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const meta = getChapter(slug);
  const content: ChapterContent | undefined = [...NATIONAL_CONTENT, ...STATE_CONTENT].find(c => c.slug === slug);
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, [slug]);

  if (!meta || !content || !progress) {
    return <div style={{ padding: 64, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: T.text }}>Loading…</div>;
  }

  const accent = meta.portion === 'national' ? T.ocean : T.coral;
  const { prev, next } = neighbors(slug);
  const alreadyRead = isChapterRead(progress, slug);

  const finishChapter = () => {
    markChapterRead(slug);
    if (next) router.push(`/course/${next.slug}`);
    else router.push('/quizzes');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/course" />
        <main style={{ padding: '32px 32px 48px', maxWidth: 880, margin: '0 auto' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <Link href="/course" style={{ color: T.textMute, fontSize: 13, textDecoration: 'none' }}>← Back to course</Link>
            <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: accent, textTransform: 'uppercase', fontWeight: 700 }}>
                Ch. {meta.number.toString().padStart(2, '0')} · {meta.portion} · {meta.examItems}Q
              </span>
              {alreadyRead && (
                <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(45,134,89,0.12)', color: T.green, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  ✓ Read
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.1, marginBottom: 12 }}>
            {meta.title}
          </h1>
          <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.55, fontStyle: 'italic', marginBottom: 24 }}>{content.intro}</p>

          {/* Voice player */}
          <div style={{ marginBottom: 32 }}>
            <VoicePlayer sections={[
              { label: `Chapter ${meta.number}: ${meta.title}`, text: content.intro },
              { label: 'Overview', text: content.overview.join(' ') },
              { label: 'Key Concepts', text: content.concepts.map(c => `${c.term}. ${c.body}${c.hawaiiNote ? ' Hawaii note: ' + c.hawaiiNote : ''}`).join(' ') },
            ]} />
          </div>

          {/* Overview */}
          <article style={{ ...CARD, padding: 36, marginBottom: 24 }}>
            <SectionH>Overview</SectionH>
            {content.overview.map((p, i) => (
              <p key={i} style={{ fontSize: 16, color: T.textDim, lineHeight: 1.75, marginBottom: 16 }}>{p}</p>
            ))}
          </article>

          {/* Concepts */}
          <article style={{ ...CARD, padding: 36, marginBottom: 32 }}>
            <SectionH>Key Concepts</SectionH>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {content.concepts.map(k => (
                <div key={k.term} style={{ padding: 16, background: T.bgRaised, borderRadius: 8, borderLeft: `3px solid ${accent}` }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, color: T.text, marginBottom: 6 }}>{k.term}</div>
                  <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>{k.body}</p>
                  {k.hawaiiNote && <p style={{ fontSize: 12, color: T.coralDark, marginTop: 6, fontStyle: 'italic' }}>Hawaii: {k.hawaiiNote}</p>}
                </div>
              ))}
            </div>
          </article>

          {/* Action: mark read + go to next */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {prev && (
              <Link href={`/course/${prev.slug}`} style={{ ...BUTTON_3D.secondary, flex: '1 1 200px', padding: '14px 22px', fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: 'none' }}>
                ← Ch. {prev.number}: {prev.title}
              </Link>
            )}
            <button
              onClick={finishChapter}
              style={{ ...BUTTON_3D.primary, flex: '1 1 200px', padding: '14px 22px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', border: 'none' }}
            >
              {alreadyRead && next
                ? `Continue to Ch. ${next.number} →`
                : alreadyRead
                ? 'Done reading · go to quizzes →'
                : next
                ? `Mark read + Ch. ${next.number} →`
                : 'Mark read + go to quizzes →'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: T.textMute, fontStyle: 'italic' }}>
            Quizzes come after you finish all 20 chapters. One thing at a time.
          </p>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function SectionH({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
      {children}
    </h2>
  );
}
