import Link from 'next/link';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL, TOTAL_QUESTIONS, PASSING_PCT } from '@/lib/curriculum';
import { GLOSSARY } from '@/lib/content/glossary';
import { EXAM_BANK } from '@/lib/content/exam-bank';
import { T, SHADOW_3D, BUTTON_3D, CARD } from '@/lib/theme';
import { Footer } from '@/components/Shell';

// Premium Editorial direction — Atlantic/NYT magazine. Photographic hero,
// italic serif headline, editorial 3-column deck, generous whitespace.
const HERO_IMG = 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=2400&q=85&auto=format&fit=crop';

export default function Landing() {
  const featured = [
    CURRICULUM.find(c => c.slug === 'property-ownership')!,
    CURRICULUM.find(c => c.slug === 'hi-material-facts')!,
    CURRICULUM.find(c => c.slug === 'hi-professional-conduct')!,
  ];
  const totalQ = EXAM_BANK.length;
  const totalTerms = GLOSSARY.length;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Hero />
      <PayoutMath totalQ={totalQ} totalTerms={totalTerms} />
      <Deck featured={featured} />
      <BlueprintAlignment />
      <ThreeStepFlow />
      <Quote />
      <FreeCta />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <header className="ed-hero" style={{
      position: 'relative',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      backgroundImage: `linear-gradient(0deg, rgba(14,26,38,0.55), rgba(14,26,38,0.25)), url(${HERO_IMG})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Soft radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 70%, transparent 30%, rgba(14,26,38,0.4))',
      }} />

      {/* Nav */}
      <nav className="ed-hero-nav" style={{
        position: 'relative', zIndex: 2,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#fbf7f0',
      }}>
        <Link href="/" style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, letterSpacing: '-0.01em',
          fontSize: 22, color: '#fbf7f0', textDecoration: 'none',
        }}>
          Ralph&apos;s Academy
        </Link>
        <NavLinks />
      </nav>

      {/* Hero content */}
      <div className="ed-hero-content" style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1100, margin: '0 auto',
        color: '#fbf7f0', alignSelf: 'center', width: '100%',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'rgba(251,247,240,0.85)', marginBottom: 18, fontWeight: 600,
        }}>
          Volume 21 · Hawaii Real Estate
        </div>
        <h1 className="ed-hero-h1" style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400,
          lineHeight: 0.94, letterSpacing: '-0.025em',
          marginBottom: 28, maxWidth: 1000, color: '#fbf7f0',
        }}>
          Pass Hawaii{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 700 }}>real estate</em>
          <br />the first time.
        </h1>
        <p className="ed-hero-lede" style={{
          fontSize: 19, maxWidth: 680, lineHeight: 1.55, marginBottom: 36,
          color: 'rgba(251,247,240,0.92)',
        }}>
          A complete licensing course built around the official PSI exam blueprint —
          twenty chapters, 130 mock questions, every Hawaii statute that matters. Free,
          for anyone studying the islands.
        </p>
        <div className="ed-hero-cta-row">
          <Link href="/course" style={{
            padding: '15px 30px',
            background: T.ocean, color: '#fbf7f0',
            border: `1px solid ${T.oceanDark}`, borderRadius: 0,
            fontSize: 14, fontWeight: 600, letterSpacing: '0.04em',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Start the course
          </Link>
          <Link href="/practice" style={{
            padding: '15px 30px',
            background: 'transparent', color: '#fbf7f0',
            border: '1px solid rgba(251,247,240,0.5)', borderRadius: 0,
            fontSize: 14, fontWeight: 600, letterSpacing: '0.04em',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Take a mock exam
          </Link>
        </div>
        <div style={{
          marginTop: 32, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', monospace", color: 'rgba(251,247,240,0.65)', fontWeight: 600,
        }}>
          Free · No card · Voice playback included
        </div>
      </div>
    </header>
  );
}

function NavLinks() {
  const links: Array<[string, string]> = [
    ['/course', 'Course'],
    ['/quizzes', 'Quizzes'],
    ['/practice', 'Mock Exam'],
    ['/listen', 'Listen'],
  ];
  return (
    <ul className="ed-hero-nav-links">
      {links.map(([href, label]) => (
        <li key={href}>
          <Link href={href === '/listen' ? '/course' : href} style={{
            color: '#fbf7f0', textDecoration: 'none', fontSize: 13, fontWeight: 500,
            letterSpacing: '0.02em', opacity: 0.88,
          }}>
            {label}
          </Link>
        </li>
      ))}
      <li>
        <Link href="/glossary" style={{
          color: '#fbf7f0', textDecoration: 'none', fontSize: 13, fontWeight: 500,
          letterSpacing: '0.02em', opacity: 0.88,
        }}>
          Glossary
        </Link>
      </li>
    </ul>
  );
}

function PayoutMath({ totalQ, totalTerms }: { totalQ: number; totalTerms: number }) {
  return (
    <section className="ed-stats-section" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div className="ed-stats-grid" style={{
        borderTop: `1px solid ${T.text}`, borderBottom: `1px solid ${T.text}`,
      }}>
        {[
          ['20', 'Chapters', 'PSI-aligned'],
          [TOTAL_QUESTIONS.toString(), 'Mock questions', `${NATIONAL_TOTAL} national + ${STATE_TOTAL} state`],
          [`${totalTerms}+`, 'Glossary terms', 'Hawaii flagged'],
          [`${PASSING_PCT}%`, 'Pass threshold', 'each portion'],
          ['$0', 'Forever', 'Free, no card'],
        ].map(([n, label, sub]) => (
          <div key={label} className="ed-stats-cell">
            <div className="ed-stats-num" style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900,
              fontSize: 44, color: T.ocean, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6,
            }}>{n}</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: T.text, fontWeight: 600, marginBottom: 4,
            }}>{label}</div>
            <div style={{ fontSize: 12, color: T.textMute }}>{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Deck({ featured }: { featured: typeof CURRICULUM }) {
  return (
    <section className="ed-deck-section" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 56, maxWidth: 880 }}>
        <Eyebrow>The curriculum</Eyebrow>
        <H2 style={{ marginBottom: 18 }}>
          Twenty chapters, written for the way the exam is actually graded.
        </H2>
        <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.65, maxWidth: 720 }}>
          Eleven national chapters and nine Hawaii-specific chapters, weighted to match
          the official PSI Content Outline question counts. Every chapter cross-references
          the underlying Hawaii Revised Statutes — HRS 467, 514B, 521, 508D, 515.
        </p>
      </div>

      <div className="ed-deck-cols" style={{ borderTop: `1px solid ${T.text}` }}>
        {featured.map((c) => (
          <Link key={c.slug} href={`/course/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article className="ed-deck-card" style={{ height: '100%', transition: 'background 0.2s' }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, fontSize: 56,
                color: T.ocean, lineHeight: 1, marginBottom: 18, letterSpacing: '-0.02em',
              }}>
                {c.number.toString().padStart(2, '0')}
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 26,
                lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.015em', color: T.text,
              }}>
                {c.title}
              </h3>
              <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, marginBottom: 24 }}>
                {c.description}
              </p>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: T.textMute, fontWeight: 600,
              }}>
                {c.portion} · {c.examItems} Q · ~{c.estimatedMinutes} min
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Link href="/course" style={{
          padding: '12px 26px', background: 'transparent', color: T.text,
          border: `1px solid ${T.text}`, borderRadius: 0,
          fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          See all 20 chapters
        </Link>
      </div>
    </section>
  );
}

function BlueprintAlignment() {
  return (
    <section className="ed-blueprint-section" style={{ background: T.bgRaised }}>
      <div className="ed-blueprint-grid" style={{ alignItems: 'start' }}>
        <div>
          <Eyebrow>Exam blueprint</Eyebrow>
          <H2 style={{ marginBottom: 24 }}>What the test is actually scored on.</H2>
          <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.7, marginBottom: 16 }}>
            The PSI Hawaii salesperson exam contains <b style={{ color: T.text }}>{TOTAL_QUESTIONS} questions</b>
            : <b style={{ color: T.text }}>{NATIONAL_TOTAL} national</b> + <b style={{ color: T.text }}>{STATE_TOTAL} state</b>.
            You need {PASSING_PCT}% on each portion to pass — that&apos;s {Math.ceil(NATIONAL_TOTAL * 0.7)} of {NATIONAL_TOTAL} national,
            and {Math.ceil(STATE_TOTAL * 0.7)} of {STATE_TOTAL} state.
          </p>
          <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.7 }}>
            Every chapter in our curriculum is sized to its share of the test. Heavy sections
            get heavy treatment — Practice of Real Estate (12Q), Hawaii Professional Conduct (14Q),
            Laws of Agency (10Q), Contracts (10Q).
          </p>
        </div>
        <div className="ed-blueprint-list" style={{ borderTop: `1px solid rgba(14,26,38,0.2)` }}>
          {CURRICULUM.map((c, i) => (
            <Link key={c.slug} href={`/course/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid rgba(14,26,38,0.12)`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10,
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', minWidth: 0 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.12em',
                    color: T.textMute, fontWeight: 600, minWidth: 22,
                  }}>
                    {c.number.toString().padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: 13, color: T.text, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {c.title}
                  </span>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                  color: c.portion === 'state' ? T.coral : T.ocean, flexShrink: 0,
                }}>
                  {c.examItems}Q
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThreeStepFlow() {
  const steps = [
    { n: 'I.', t: 'Read all chapters.', b: 'Twenty in order. Each one a substantive overview, key concepts, and Hawaii-specific notes. Voice-narrated for studying on the move.' },
    { n: 'II.', t: 'Take chapter quizzes.', b: 'Once you&apos;ve read everything, go back and quiz yourself per chapter. Ten to twelve questions each. Seventy percent passes. Unlimited retakes.' },
    { n: 'III.', t: 'Mock the exam.', b: 'A full timed 130-question PSI-format mock. Eighty national + fifty state, scored separately. Take it until you&apos;re consistently 85%+ before your real test.' },
  ];

  return (
    <section className="ed-method-section" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 48, maxWidth: 720 }}>
        <Eyebrow>Method</Eyebrow>
        <H2>Three phases, in order. One thing at a time.</H2>
      </div>
      <div className="ed-method-grid">
        {steps.map((s) => (
          <div key={s.n} className="ed-method-cell" style={{ borderTop: `2px solid ${T.text}` }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, fontStyle: 'italic',
              fontSize: 44, color: T.coral, lineHeight: 1, marginBottom: 16, letterSpacing: '-0.02em',
            }}>
              {s.n}
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 22,
              marginBottom: 10, letterSpacing: '-0.01em', color: T.text, lineHeight: 1.25,
            }}>
              {s.t}
            </h3>
            <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: s.b }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Quote() {
  return (
    <section className="ed-quote-section" style={{ background: T.bg, borderTop: `1px solid rgba(14,26,38,0.12)`, borderBottom: `1px solid rgba(14,26,38,0.12)` }}>
      <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.3, letterSpacing: '-0.015em',
          color: T.text, marginBottom: 24, fontWeight: 400,
        }}>
          &ldquo;Built around the actual PSI Content Outline. Hawaii statutes
          covered in the depth a working agent needs. Open to anyone studying
          the islands — no card, no paywall, no compromise on craft.&rdquo;
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: T.textMute, fontWeight: 600,
        }}>
          The editor&apos;s note · Volume 21
        </div>
      </div>
    </section>
  );
}

function FreeCta() {
  return (
    <section className="ed-final-section" style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
      <Eyebrow>One more thing</Eyebrow>
      <H2 style={{ marginBottom: 24 }}>The exam doesn&apos;t care how hard you tried.</H2>
      <p style={{ fontSize: 18, color: T.textDim, lineHeight: 1.65, marginBottom: 36, maxWidth: 640, margin: '0 auto 36px' }}>
        It cares whether you got 70% on each portion. We make sure you do.
      </p>
      <div className="ed-final-cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/course" style={{
          padding: '16px 36px', background: T.ocean, color: '#fbf7f0',
          border: `1px solid ${T.oceanDark}`, borderRadius: 0,
          fontSize: 14, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          Start the course
        </Link>
        <Link href="/practice" style={{
          padding: '16px 36px', background: 'transparent', color: T.text,
          border: `1px solid ${T.text}`, borderRadius: 0,
          fontSize: 14, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          Take a mock exam
        </Link>
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.24em',
      textTransform: 'uppercase', color: T.textMute, marginBottom: 18, fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900,
      fontSize: 'clamp(40px, 5.5vw, 68px)', lineHeight: 1.05, letterSpacing: '-0.025em',
      color: T.text, ...style,
    }}>{children}</h2>
  );
}
