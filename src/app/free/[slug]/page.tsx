import Link from 'next/link';
import { notFound } from 'next/navigation';
import { T, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { LessonAudio } from '@/components/LessonAudio';
import { FREE_LESSONS, getLesson, getNeighbors } from '../lessons-data';

export function generateStaticParams() {
  return FREE_LESSONS.map((l) => ({ slug: l.slug }));
}

export default async function FreeLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const { prev, next } = getNeighbors(slug);

  // Build audio segments: title intro → each section (heading + body) → takeaway
  const audioSegments = [
    { label: 'Introduction', text: `${lesson.title}. ${lesson.summary}` },
    ...lesson.sections.map((s, i) => ({
      label: `Section ${i + 1}: ${s.heading}`,
      text: `${s.heading}. ${s.body}`,
    })),
    { label: 'The takeaway', text: `The takeaway. ${lesson.takeaway}` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/free" />

        {/* HERO */}
        <section data-mobile-padding style={{ padding: '56px 32px 24px', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ marginBottom: 18 }}>
            <Link href="/free" style={{ fontSize: 13, color: T.ocean, textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
              ← Back to Free Foundation
            </Link>
          </div>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.3em', color: T.coral, textTransform: 'uppercase', marginBottom: 14, fontWeight: 700 }}>
            Lesson {lesson.number} of {FREE_LESSONS.length} · {lesson.duration}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(36px, 5.5vw, 60px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.05, color: T.text, marginBottom: 18 }}>
            {lesson.title}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: T.textDim, marginBottom: 24 }}>
            {lesson.summary}
          </p>

          <LessonAudio title={lesson.title} segments={audioSegments} />
        </section>

        {/* SECTIONS */}
        <section data-mobile-padding style={{ padding: '32px 32px', maxWidth: 760, margin: '0 auto' }}>
          {lesson.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.015em', color: T.text, marginBottom: 14, lineHeight: 1.25 }}>
                {s.heading}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.85, color: T.textDim, margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}
        </section>

        {/* TAKEAWAY */}
        <section data-mobile-padding style={{ padding: '32px 32px 24px', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ ...CARD, padding: '28px 32px', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: T.ocean, borderLeftStyle: 'solid' }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
              The takeaway
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: T.text, margin: 0, fontStyle: 'italic', fontFamily: "'Playfair Display', Georgia, serif" }}>
              {lesson.takeaway}
            </p>
          </div>
        </section>

        {/* NAVIGATION */}
        <section data-mobile-padding style={{ padding: '24px 32px 64px', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: prev && next ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 32 }}>
            {prev && (
              <Link href={`/free/${prev.slug}`} style={{ ...BUTTON_3D.secondary, padding: '14px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'left', display: 'block' }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', marginBottom: 4 }}>← Lesson {prev.number}</div>
                <div style={{ fontSize: 15, color: T.text, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>{prev.title}</div>
              </Link>
            )}
            {next && (
              <Link href={`/free/${next.slug}`} style={{ ...BUTTON_3D.primary, padding: '14px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'right', display: 'block' }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', opacity: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Lesson {next.number} →</div>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>{next.title}</div>
              </Link>
            )}
          </div>

          {!next && (
            <div style={{ ...CARD, padding: '36px 32px', borderRadius: 18, textAlign: 'center', borderColor: T.coral, borderWidth: 2 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.coral, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>You finished the Foundation</div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.02em', marginBottom: 12 }}>
                Ready for the real work?
              </h3>
              <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
                The full curriculum is 20 chapters, every chapter narrated, with the AI Real Estate Tutor on standby. Pick your tier.
              </p>
              <Link href="/pricing" style={{ ...BUTTON_3D.primary, padding: '14px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', display: 'inline-flex' }}>
                See Pricing →
              </Link>
            </div>
          )}
        </section>

        <Footer />
      </div>
    </div>
  );
}
