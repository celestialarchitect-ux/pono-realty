import Link from 'next/link';
import { CURRICULUM, NATIONAL_TOTAL, STATE_TOTAL } from '@/lib/curriculum';
import { GLOSSARY } from '@/lib/content/glossary';
import { EXAM_BANK } from '@/lib/content/exam-bank';
import { T, SHADOW_3D, BUTTON_3D, CARD } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { MotivationModal } from '@/components/MotivationModal';
import { IconBadge, type IconKind } from '@/components/Icon';

const HERO_IMG = 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=2400&q=85&auto=format&fit=crop';

export default function Landing() {
  const totalQ = EXAM_BANK.length;
  const totalTerms = GLOSSARY.length;
  const totalMinutes = CURRICULUM.reduce((s, c) => s + c.estimatedMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);
  const nationalChapters = CURRICULUM.filter(c => c.portion === 'national').length;
  const stateChapters = CURRICULUM.filter(c => c.portion === 'state').length;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <MotivationModal />
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header active="/" />

        {/* HERO */}
        <section data-mobile-padding style={{ padding: '64px 32px 48px', maxWidth: 1180, margin: '0 auto' }}>
          <div className="rf-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 56, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: T.bgElevated, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.ocean }} /> Licensed since 1972 · Teaching since 1993 · Built for 2026
              </div>
              <h1 className="rf-hero-h1" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.02, marginBottom: 22, color: T.text }}>
                Pass Hawaii&apos;s real estate exam <em style={{ color: T.ocean, fontStyle: 'italic' }}>the first time.</em>
              </h1>
              <p style={{ fontSize: 19, lineHeight: 1.6, color: T.textDim, marginBottom: 28, maxWidth: 560 }}>
                The most sophisticated licensing system ever built for the Hawaii salesperson exam &mdash; every chapter narrated as audio, smart flashcards, math drills, full-length mock exams, and a 24/7 AI real estate tutor that knows the Hawaii curriculum cold.
              </p>
              <div className="rf-hero-cta-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                <Link href="/free" style={{ ...BUTTON_3D.primary, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Start the Free Foundation Course →
                </Link>
                <Link href="/pricing" style={{ ...BUTTON_3D.secondary, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none' }}>
                  See Pricing
                </Link>
              </div>
              <div style={{ fontSize: 13, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', display: 'flex', flexWrap: 'wrap', gap: '6px 14px', alignItems: 'center' }}>
                <span>One-time payment</span>
                <span style={{ color: T.textGhost }}>·</span>
                <span>No subscription</span>
                <span style={{ color: T.textGhost }}>·</span>
                <span>Free agent website on Plus</span>
              </div>
              <div style={{ marginTop: 18, fontSize: 12, color: T.textGhost, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                CPM · Past President HARES · IREM National Faculty
              </div>
            </div>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: SHADOW_3D.lg, aspectRatio: '4 / 5' }}>
              <img src={HERO_IMG} alt="Hawaii real estate" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(14,26,38,0.55) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px', color: '#fff' }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', opacity: 0.85, textTransform: 'uppercase', marginBottom: 6 }}>Founded by</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>Ralph Foulger, CPM</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Licensed in Hawaii since 1972 · Broker since 1987 · Teaching since 1993</div>
              </div>
            </div>
          </div>
        </section>

        {/* THE STATEWIDE PROBLEM */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '56px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>The 2025 reality</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text, maxWidth: 880, margin: '0 auto' }}>
                Most Hawaii test-takers don&apos;t pass on their first attempt.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <Stat big="922" sub="candidates tested in the past 12 months across all 28 Hawaii schools" />
              <Stat big="40–45%" sub="statewide pass rate (Hawaii REC, rolling 2025 data)" highlight />
              <Stat big="55%+" sub="of test-takers fail and have to retake" />
              <Stat big="$300+" sub="average cost of every retake — and weeks lost" />
            </div>
            <p style={{ textAlign: 'center', fontSize: 15, color: T.textDim, maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>
              We built Ralph Foulger&apos;s Academy of Real Estate to fix that. Every tool below exists because we studied where students fall short &mdash; and we engineered the curriculum to close those gaps.
            </p>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.textGhost, textTransform: 'uppercase' }}>
                Source: Hawaii Real Estate Commission &middot; School Files Q3 2025 (cca.hawaii.gov)
              </span>
            </div>
          </div>
        </section>

        {/* NATIONAL vs HAWAII STRUCTURE */}
        <section style={{ padding: '72px 32px', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>How the curriculum is structured</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: T.text }}>
              Two halves. Both required. <em style={{ color: T.ocean, fontStyle: 'italic' }}>Clearly labeled.</em>
            </h2>
            <p style={{ fontSize: 16, color: T.textDim, maxWidth: 720, margin: '20px auto 0', lineHeight: 1.7 }}>
              The PSI Hawaii exam tests two distinct portions. We teach them as two distinct portions &mdash; so you always know whether you&apos;re learning a national rule or a Hawaii-specific one.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ ...CARD, padding: '32px 30px', borderRadius: 18 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>National Portion</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 900, color: T.text, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{NATIONAL_TOTAL}<span style={{ fontSize: 18, color: T.textMute, marginLeft: 6 }}>questions</span></div>
              <div style={{ fontSize: 13, color: T.textDim, marginBottom: 18, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{nationalChapters} chapters · the rules every U.S. agent must know</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: T.textDim, lineHeight: 1.7 }}>
                <li>• Property ownership &amp; estates</li>
                <li>• Land use controls &amp; zoning</li>
                <li>• Valuation &amp; market analysis</li>
                <li>• Financing &amp; mortgage law</li>
                <li>• Laws of agency (COALD)</li>
                <li>• Mandated disclosures</li>
                <li>• Contracts &amp; transfer of title</li>
                <li>• Practice of real estate &amp; ethics</li>
                <li>• Real estate calculations</li>
                <li>• Specialty areas</li>
              </ul>
            </div>
            <div style={{ ...CARD, padding: '32px 30px', borderRadius: 18, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Hawaii Portion</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 900, color: T.text, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{STATE_TOTAL}<span style={{ fontSize: 18, color: T.textMute, marginLeft: 6 }}>questions</span></div>
              <div style={{ fontSize: 13, color: T.textDim, marginBottom: 18, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{stateChapters} chapters · what makes Hawaii different</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: T.textDim, lineHeight: 1.7 }}>
                <li>• HARPTA &amp; GET (state taxes)</li>
                <li>• Material facts &amp; statutory disclosures</li>
                <li>• Condominium law (HRS 514B)</li>
                <li>• Property management (HRS 521)</li>
                <li>• Hawaii land utilization &amp; zoning</li>
                <li>• Land Court vs. Regular System title</li>
                <li>• Hawaii standard sales contract &amp; addenda</li>
                <li>• Hawaii financing (Agreement of Sale)</li>
                <li>• Escrow process &amp; conveyance tax</li>
                <li>• License law (HRS 467) &amp; agency disclosure</li>
              </ul>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 14, color: T.textMute, marginTop: 28, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
            Total: {NATIONAL_TOTAL + STATE_TOTAL} questions · 70% to pass · 4-hour exam window
          </p>
        </section>

        {/* THE VALUE STACK */}
        <section style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgElevated} 100%)`, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '72px 32px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>What you get</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: T.text }}>
                Every tool you need to pass.
              </h2>
              <p style={{ fontSize: 16, color: T.textDim, maxWidth: 680, margin: '20px auto 0', lineHeight: 1.7 }}>
                {CURRICULUM.length} chapters. <strong style={{ color: T.text }}>60+ study hours</strong>. {totalTerms}+ key terms. {totalQ}+ exam-bank questions. All built around the official PSI Hawaii blueprint.
              </p>
              <p style={{ fontSize: 13, color: T.textMute, maxWidth: 640, margin: '12px auto 0', lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                Hawaii state law requires <strong style={{ color: T.ocean }}>60 hours of pre-license study</strong> before you can sit the PSI exam. Our platform tracks every minute you spend in the curriculum — and your mock exam unlocks the moment you hit the threshold.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <Feature icon="audiobook" title="Audiobook for every chapter" body="Listen in the car, on a hike, at the gym. Every chapter is professionally narrated so you can learn while you live your life." />
              <Feature icon="tutor" title="24/7 AI Real Estate Tutor" body="Trained on the Hawaii curriculum and a deep library of real estate textbooks. Stuck at 11 PM? Ask anything. Get a clear answer in seconds." highlight />
              <Feature icon="book" title="Read → Study → Quiz" body="Each chapter teaches in three phases. Read the material, internalize the key terms, prove you got it before moving on. Knowledge sticks because the structure forces it to." />
              <Feature icon="flashcards" title={`${totalTerms}+ smart flashcards`} body="Spaced repetition built in — the cards you miss come back more often, the ones you nail recede. The system learns you and prioritizes your weak spots automatically." />
              <Feature icon="calculator" title="Math drills (where most fail)" body="Prorations, commission splits, LTV, capitalization, GRM — with step-by-step worked examples. The single category that knocks the most candidates out, eliminated." />
              <Feature icon="exam" title={`${totalQ}-question exam bank + full mock`} body="Practice with the same 80 + 50 PSI question split, same time pressure, same calibration. The mock exam predicts your real exam score within a few points." />
              <Feature icon="library" title={`${totalTerms}-term searchable glossary`} body="Every key term — national + Hawaii — defined plainly, indexed, instantly searchable. Cross-linked to the chapters where it appears." />
              <Feature icon="mobile" title="Mobile-first" body="Studied on the bus to Kahala? Phone in your hand at the beach? The platform is designed for that. Resume exactly where you left off, on any device." />
              <Feature icon="website" title="Free agent website (Plus tier)" body="Pass your PSI exam? Plus students unlock a custom Hawaii real estate site — your name on your own domain, CRM, lead capture, admin portal. Built and deployed for you." />
            </div>
          </div>
        </section>

        {/* TIME WINDOW + FINAL EXAM */}
        <section style={{ padding: '72px 32px', maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>How the program runs</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text }}>
              Three to six months. <em style={{ color: T.ocean, fontStyle: 'italic' }}>Honest, focused, finish-able.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <Step
              number="01"
              title="Enroll. Clock starts."
              body="Standard gives you 3 months of full access. Plus doubles that to 6 months for students balancing the course with work and family. Both windows match Hawaii REC norms."
            />
            <Step
              number="02"
              title="Move through 20 chapters."
              body="Read or listen, drill the math, run the flashcards, take the chapter quizzes. The platform tracks your progress so you always know where you stand."
            />
            <Step
              number="03"
              title="Pass our final exam (70%+)."
              body="Before we issue your course-completion certificate, you have to pass our school&apos;s final exam at 70% or above — the same threshold the state exam uses. We don&apos;t shortcut this."
            />
            <Step
              number="04"
              title="Get your certificate. Take PSI."
              body="Your school-completion certificate is valid for 2 years (state rule). Use it to register for the official PSI Hawaii Salesperson Exam — and walk in confident."
            />
          </div>
          <div style={{ ...CARD, padding: '28px 32px', borderRadius: 16, marginTop: 28, borderLeft: `3px solid ${T.coral}` }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>If you don&apos;t finish in time</div>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textDim, margin: 0 }}>
              If your access window closes before you&apos;ve completed the curriculum &amp; final exam, you can re-enroll at a discounted alumni rate. We do this for the same reason every Hawaii school does: <strong style={{ color: T.text }}>retention drops sharply when material sits unstudied for too long</strong> &mdash; and walking into the PSI exam without recent practice is the fastest way to fail. The window is there to protect your investment.
            </p>
          </div>
        </section>

        {/* WHY RALPH */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, padding: '72px 32px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Why Ralph</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: T.text }}>
                54 years in Hawaii real estate. <em style={{ color: T.ocean, fontStyle: 'italic' }}>33 of them teaching it.</em>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }} data-stack-mobile="true">
              <CredStat big="1972" sub="Year Ralph earned his Hawaii salesperson license" />
              <CredStat big="1987" sub="Year Ralph earned his Hawaii broker license" />
              <CredStat big="33" sub="Years teaching pre-license, broker, &amp; continuing-ed candidates" />
              <CredStat big="3×" sub="Past President: HARES · NAIOP Hawaii · IREM Hawaii" />
            </div>

            <div style={{ ...CARD, padding: '36px 40px', borderRadius: 18, lineHeight: 1.8, fontSize: 16, color: T.textDim }}>
              <p style={{ marginBottom: 16 }}>
                Ralph Foulger has been a Hawaii real estate professional since November 1972 and a Hawaii broker since April 1987. He earned his Certified Property Manager (CPM) designation in 1985 and is one of the few instructors <strong style={{ color: T.text }}>certified by the State of Hawaii to teach all three license tracks</strong> &mdash; salesperson, broker, and continuing education.
              </p>
              <p style={{ marginBottom: 16 }}>
                His teaching career began in 1993 as Principal &amp; Instructor of the Century 21 Real Estate School, where he ran pre-license, broker, and continuing-ed programs for thirteen years. In 1996 he founded the school that today operates as <strong style={{ color: T.text }}>Ralph Foulger&apos;s Academy of Real Estate</strong> &mdash; now in its 30th year. He served as <strong style={{ color: T.text }}>President of the Hawaii Association of Real Estate Schools</strong> (HARES) in 1994 and 1995, President of NAIOP Hawaii (1991&ndash;92), President of IREM Hawaii Chapter (1993), and was named to the IREM <strong style={{ color: T.text }}>National Faculty</strong> in 1994.
              </p>
              <p style={{ marginBottom: 16 }}>
                Outside the classroom, Ralph has managed some of the most demanding real estate in the state: <strong style={{ color: T.text }}>Asset Manager of Campbell Industrial Park</strong> (1,400 acres), property manager for The Gentry Companies portfolio (the Gentry Pacific Design Center, Gentry Business Park, the Sunpoint complex, Gentry&apos;s Kona Marina), 125 sub-leases at the International Market Place, and the 120,000 sq ft Kapiolani Building. The curriculum he teaches isn&apos;t academic &mdash; it&apos;s the same toolkit he&apos;s used in the trenches for five decades.
              </p>
              <p>
                When COVID closed in-person classrooms, online behemoths absorbed the volume &mdash; but they teach mainland defaults that don&apos;t map to Hawaii&apos;s leasehold market, HARPTA withholdings, or HRS 514B condo law. <strong style={{ color: T.text }}>2026 is the return.</strong> Same Ralph. Same Hawaii-first curriculum. Now with audiobook narration, smart flashcards, math drills, mock exams, and a 24/7 AI tutor grounded in the curriculum, the statutes, and the PSI exam outline.
              </p>
            </div>
          </div>
        </section>

        {/* AI ACCURACY PROMISE */}
        <section data-mobile-padding style={{ padding: '72px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.coral, textTransform: 'uppercase', marginBottom: 12 }}>The AI commitment</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: T.text }}>
              Master AI tutor &mdash; <em style={{ color: T.ocean, fontStyle: 'italic' }}>human-audited for accuracy.</em>
            </h2>
            <p style={{ fontSize: 17, color: T.textDim, maxWidth: 720, margin: '20px auto 0', lineHeight: 1.7 }}>
              Every answer the AI gives is grounded in our verified Hawaii curriculum, the official PSI exam content outline, and Hawaii Revised Statutes. We audit a sample of every week&apos;s conversations &mdash; if it says something wrong, we catch it, correct the model, and notify any affected student.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <Pillar
              icon="target"
              title="Grounded, not guessing"
              body="The tutor pulls from our 20-chapter curriculum, the PSI Content Outline, HRS Title 16 (real estate law), and a verified library of real estate references. It cites where it found each answer."
            />
            <Pillar
              icon="compass"
              title="Hawaii vs national, always tagged"
              body="Every answer leads with [National] or [Hawaii] so you know which portion of the PSI exam the topic falls under. No accidental confusion."
            />
            <Pillar
              icon="audit"
              title="Weekly human audit"
              body="We sample student conversations every week. If the AI says something wrong, we flag it, retrain the prompt, and reach out personally to anyone who got bad info."
            />
            <Pillar
              icon="no-cheat"
              title="Refuses to cheat for you"
              body="The tutor won&apos;t take graded exams for you, won&apos;t fabricate case citations, and won&apos;t answer live-exam questions. Real estate is a profession of fiduciary trust — your AI tutor models it."
            />
          </div>
        </section>

        {/* PLUS-TIER GRADUATION BUNDLE */}
        <section style={{ background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgElevated} 100%)`, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '72px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.coral, textTransform: 'uppercase', marginBottom: 12 }}>Plus tier · The graduation bundle</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: T.text }}>
                Pass the exam. <em style={{ color: T.coral, fontStyle: 'italic' }}>We hand you a working business.</em>
              </h2>
              <p style={{ fontSize: 17, color: T.textDim, maxWidth: 760, margin: '20px auto 0', lineHeight: 1.7 }}>
                Other schools end at the certificate. We don&apos;t. <strong style={{ color: T.text }}>Plus-tier students who pass their PSI exam</strong> unlock a complete agent launch kit &mdash; the same infrastructure most new agents take two years to assemble.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <Reward
                tag="Plus tier · Post-exam"
                title="Your Own Agent Website"
                body="A custom-designed, mobile-perfect real estate site on your own domain (yourname.com). Hawaii-aware listings layout, bio, service area, contact. We build it. We deploy it."
              />
              <Reward
                tag="Plus tier · Post-exam"
                title="CRM + Lead Capture + Admin Portal"
                body="Built-in CRM to track every lead from first touch to closing. Inquiry forms wired to your portal. A real admin dashboard, not a Squarespace template. The operational backbone most agents pay $200/mo for."
              />
              <Reward
                tag="Plus tier · Post-exam"
                title="Lead Packet + Launch Playbook"
                body="A curated starter lead packet for your first 90 days, plus the playbook: broker intros, Hawaii contract templates, listing-presentation deck, vendor list (photographer, escrow, lender)."
              />
            </div>

            {/* SHAYNE EXAMPLE */}
            <div style={{ marginTop: 36, ...CARD, padding: '32px 36px', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: 32, alignItems: 'center' }} data-stack-mobile="true">
                <div>
                  <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Real graduate example</div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.15, color: T.text, marginBottom: 14 }}>
                    Shayne M. Guthrie&apos;s broker site.
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: T.textDim, marginBottom: 16 }}>
                    Licensed Hawaii broker (BC) operating out of the Ralph S. Foulger Brokerage in Kaneohe. Shayne&apos;s working real estate website &mdash; clean, mobile, search-indexed, lead-capture wired &mdash; is the same caliber of site Plus-tier graduates receive.
                  </p>
                  <Link href="/example-website" target="_blank" rel="noopener" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    View the live example →
                  </Link>
                </div>
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: SHADOW_3D.lg, aspectRatio: '16 / 11', background: T.bgElevated }}>
                  <iframe
                    src="/example-website"
                    title="Live example: Shayne Guthrie broker website"
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28, ...CARD, padding: '24px 28px', borderRadius: 14, borderLeftWidth: 3, borderLeftColor: T.ocean, borderLeftStyle: 'solid' }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim, margin: 0 }}>
                <strong style={{ color: T.text }}>Note on the bundle:</strong> the website, domain, CRM, and admin portal are built and delivered after you pass the PSI Hawaii exam. A standard monthly hosting &amp; maintenance fee applies to keep the site live (domain renewal, SSL, security patches, lead-capture infrastructure). Already licensed? See the <Link href="/pricing#solo" style={{ color: T.ocean, textDecoration: 'underline' }}>Solo Website Build</Link> tier &mdash; the same package, available a la carte.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING TEASE */}
        <section style={{ padding: '72px 32px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 12 }}>Choose your path</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: T.text }}>
                Three options. <em style={{ color: T.ocean, fontStyle: 'italic' }}>One-time payment.</em>
              </h2>
              <p style={{ fontSize: 15, color: T.textMute, marginTop: 14, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
                No subscription · No surprises
              </p>
            </div>

            {/* FREE COURSE BANNER */}
            <div style={{ marginBottom: 24, ...CARD, padding: '18px 24px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderLeftWidth: 4, borderLeftColor: T.ocean, borderLeftStyle: 'solid' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 320px' }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>Free first</div>
                <div style={{ fontSize: 15, color: T.text, lineHeight: 1.45 }}>
                  <strong>Free Foundation web course.</strong> 5 lessons, Hawaii market 101, no signup tricks &mdash; decide if real estate is for you before you pay a cent.
                </div>
              </div>
              <Link href="/free" style={{ ...BUTTON_3D.secondary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Start the free course →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <Tier name="Standard" price="$599" tagline="The complete prep system." features={['All 20 chapters + audiobook', 'Smart flashcards & math drills', '130-question mock exams', '24/7 AI Real Estate Tutor', 'School final exam', '3-month access window']} cta="Enroll" href="/pricing#standard" />
              <Tier name="Plus" price="$899" tagline="Course + free agent website on graduation." featured features={['Everything in Standard', 'Free agent website on passing', 'Your own domain (yourname.com)', 'CRM + lead capture + admin portal', '6-month course access', 'Launch playbook + lead packet']} cta="Enroll" href="/pricing#plus" />
              <Tier name="Solo Website Build" price="$800" tagline="Already licensed? Skip the course." features={['Custom-built Hawaii broker site', 'Your own domain (yourname.com)', 'CRM + lead capture + admin portal', 'Built, deployed, branded to you', 'No course included (a la carte)', 'Monthly hosting & maintenance']} cta="Order Site" href="/pricing#solo" />
            </div>
            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
              Plus website &amp; Solo build include a monthly hosting / maintenance fee after launch (domain renewal, SSL, CRM uptime, security patches).
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link href="/pricing" style={{ fontSize: 14, color: T.ocean, textDecoration: 'none', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
                Full pricing comparison &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: T.bgRaised, borderTop: `1px solid ${T.border}`, padding: '88px 32px' }}>
          <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05, color: T.text, marginBottom: 20 }}>
              Try the Free Foundation.
            </h2>
            <p style={{ fontSize: 18, color: T.textDim, maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.65 }}>
              Five short lessons. Zero cost. Decide if real estate is for you, and if Ralph Foulger&apos;s School is for you. No credit card.
            </p>
            <Link href="/free" style={{ ...BUTTON_3D.primary, padding: '18px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700, letterSpacing: '0.03em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Start Now &mdash; Free →
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

/* ───────────  PIECES  ─────────── */

function Stat({ big, sub, highlight }: { big: string; sub: string; highlight?: boolean }) {
  return (
    <div style={{
      ...CARD,
      padding: '24px 22px', borderRadius: 14, textAlign: 'center',
      background: highlight ? `linear-gradient(180deg, ${T.coral} 0%, ${T.coralDark} 100%)` : T.bg,
      color: highlight ? T.white : T.text,
    }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>{big}</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, opacity: highlight ? 0.95 : 0.7 }}>{sub}</div>
    </div>
  );
}

function Feature({ icon, title, body, highlight }: { icon: IconKind; title: string; body: string; highlight?: boolean }) {
  return (
    <div style={{
      ...CARD,
      padding: '24px 22px', borderRadius: 14,
      borderColor: highlight ? T.ocean : undefined,
      background: highlight ? `linear-gradient(180deg, ${T.bg} 0%, rgba(20,131,123,0.06) 100%)` : T.bg,
    }}>
      <div style={{ marginBottom: 14 }}><IconBadge kind={icon} accent={highlight ? 'ocean' : 'ocean'} /></div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 8, color: T.text }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim }}>{body}</div>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div style={{ ...CARD, padding: '24px 22px', borderRadius: 14 }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 900, color: T.ocean, opacity: 0.5, lineHeight: 1, marginBottom: 12 }}>{number}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 8, color: T.text }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim }}>{body}</div>
    </div>
  );
}

function CredStat({ big, sub }: { big: string; sub: string }) {
  return (
    <div style={{ ...CARD, padding: '20px 18px', borderRadius: 12, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 900, color: T.ocean, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{big}</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: T.textMute }}>{sub}</div>
    </div>
  );
}

function Pillar({ icon, title, body, accent }: { icon: IconKind; title: string; body: string; accent?: 'ocean' | 'coral' | 'sand' }) {
  return (
    <div style={{ ...CARD, padding: '24px 22px', borderRadius: 14 }}>
      <div style={{ marginBottom: 14 }}><IconBadge kind={icon} accent={accent ?? 'ocean'} /></div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 8, color: T.text }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim }}>{body}</div>
    </div>
  );
}

function Reward({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div style={{ ...CARD, padding: '26px 24px', borderRadius: 16, borderColor: T.coral, borderWidth: 2 }}>
      <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', color: T.coral, textTransform: 'uppercase', padding: '4px 8px', background: 'rgba(232,93,60,0.08)', borderRadius: 6, fontWeight: 700, display: 'inline-block', marginBottom: 14 }}>{tag}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 10, color: T.text, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: T.textDim }}>{body}</div>
    </div>
  );
}

function Tier({ name, price, tagline, features, cta, href, featured }: { name: string; price: string; tagline: string; features: string[]; cta: string; href: string; featured?: boolean }) {
  return (
    <div style={{
      ...CARD,
      padding: '24px 22px', borderRadius: 16, position: 'relative',
      borderColor: featured ? T.ocean : undefined,
      borderWidth: featured ? 2 : 1,
      transform: featured ? 'translateY(-4px)' : undefined,
    }}>
      {featured && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: T.ocean, color: T.white, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6, fontWeight: 700 }}>
          Recommended
        </div>
      )}
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em', color: T.textMute, textTransform: 'uppercase', marginBottom: 6 }}>{name}</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', color: T.text, marginBottom: 4 }}>{price}</div>
      <div style={{ fontSize: 13, color: T.textDim, marginBottom: 14, lineHeight: 1.4 }}>{tagline}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
        {features.map((f, i) => (
          <li key={i} style={{ fontSize: 13, color: T.textDim, marginBottom: 8, lineHeight: 1.5, paddingLeft: 16, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: T.ocean, fontWeight: 700 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={href} style={{ ...(featured ? BUTTON_3D.primary : BUTTON_3D.secondary), display: 'block', textAlign: 'center', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
        {cta}
      </Link>
    </div>
  );
}
