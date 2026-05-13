'use client';

// ABOUTME: Pre-enrollment FAQ — the questions prospective Hawaii pre-license students actually ask.
// ABOUTME: Anchored sections so /faq#refunds and similar deep links work; expand-on-click accordion.

import { useState } from 'react';
import Link from 'next/link';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

interface QA {
  id: string;
  question: string;
  answer: React.ReactNode;
}

const SECTIONS: Array<{ heading: string; items: QA[] }> = [
  {
    heading: 'The licensing process',
    items: [
      {
        id: 'license-steps',
        question: 'What are all the steps to get a Hawaii real estate license?',
        answer: (
          <>
            <p>Four discrete steps, in order:</p>
            <ol>
              <li><strong>Complete an approved 60-hour pre-license course</strong> — that&rsquo;s us. Earn your school-completion certificate.</li>
              <li><strong>Register for + pass the PSI Hawaii Salesperson Exam.</strong> 130 questions, 70% on each portion (national + state) to pass. PSI charges its own fee.</li>
              <li><strong>Find a sponsoring broker</strong> who agrees to hold your license. Hawaii doesn&rsquo;t license unsponsored salespersons.</li>
              <li><strong>Submit your application to the Hawaii REC</strong> with the school certificate, PSI score report, broker info, and the state fee. They issue the license.</li>
            </ol>
            <p>We get you through step 1 fully. Steps 2-4 happen outside our platform.</p>
          </>
        ),
      },
      {
        id: 'how-long',
        question: 'How long does the whole thing take?',
        answer: (
          <>
            <p>Depends entirely on your pace, but two extremes:</p>
            <ul>
              <li><strong>Aggressive (6 hrs/day):</strong> finish our course in ~10 days, schedule PSI ~1 week out, license in hand within <strong>3-4 weeks</strong> if your broker paperwork moves fast.</li>
              <li><strong>Casual (1 hr/day):</strong> ~60 days for the course, then ~2 weeks for PSI, then ~2 weeks of broker + REC paperwork = <strong>3-4 months</strong>.</li>
            </ul>
            <p>Most working students land somewhere in between (60-90 days total).</p>
          </>
        ),
      },
      {
        id: 'rec-approved',
        question: 'Is this course REC-approved?',
        answer: <p>Yes. We&rsquo;re on the Hawaii Real Estate Commission&rsquo;s approved-pre-license-course list, and the certificate you earn here satisfies the 60-hour requirement under HRS §467.</p>,
      },
    ],
  },
  {
    heading: 'The course',
    items: [
      {
        id: 'how-many-chapters',
        question: 'How many chapters? How much actually to study?',
        answer: <p><strong>20 chapters total</strong> — 11 national, 9 Hawaii-specific. The chapters themselves take roughly 17 hours of reading or listening. The remaining ~43 hours that bring you to the state-required 60 come from <strong>quizzes, math drills, flashcards, mock exams, and AI-tutor sessions</strong> — repetition is what makes the material stick.</p>,
      },
      {
        id: 'study-planner',
        question: 'What is the daily lesson planner?',
        answer: <p>On your profile, pick a goal date (2 weeks, 1 month, 3 months, custom). The system builds a daily class schedule for you: today&rsquo;s chapters, today&rsquo;s flashcards, today&rsquo;s math drills, today&rsquo;s mocks — with class times. Open the profile, do today&rsquo;s plan, repeat. The planner rebalances automatically if you miss a day.</p>,
      },
      {
        id: 'ai-tutor',
        question: 'What\'s the AI tutor?',
        answer: <p>A 24/7 AI assistant trained on the Hawaii pre-license curriculum. Stuck on prorations at 11 PM? It will walk you through. Confused on agency duties? It&rsquo;ll explain ten different ways until it clicks. Included with Standard and Plus. Rate-limited to 60 conversations/hour per student to keep costs sane.</p>,
      },
      {
        id: 'mock-exam',
        question: 'How realistic are the mock exams?',
        answer: <p>130 questions (80 national + 50 state) — same proportion as the real PSI exam. Three difficulty tiers: Standard mirrors the textbook, Hard mirrors the PSI&rsquo;s real wording (double negatives, &ldquo;best&rdquo; answers, red-herring data), Gnarly is harder than the real thing on purpose. Pass either Hard or Gnarly at 70%+ and the actual PSI feels like a calmer version.</p>,
      },
    ],
  },
  {
    heading: 'Pricing + refunds',
    items: [
      {
        id: 'why-not-cheaper',
        question: 'Why isn\'t this $99 like the bottom-of-Google cookie-cutter courses?',
        answer: <p>You can absolutely buy a $99 Hawaii pre-license course. We&rsquo;ve looked at every one. They tend to be: PDF chapters with no audio, multiple-choice questions reused from 1998, no AI tutor, no progress tracking, no support after purchase. Ours costs more because we built the audiobook, the planner, the AI tutor, the mock-exam variant pool of ~1,000 questions, and the per-student grade system. If &ldquo;cheap and good enough&rdquo; is what you want, those courses exist. We&rsquo;re building for the people who want to <strong>actually pass first time</strong>.</p>,
      },
      {
        id: 'refund-policy',
        question: 'What\'s the refund policy?',
        answer: <p>Full refund within <strong>7 days of purchase</strong> if you&rsquo;ve completed less than 10% of the course. Email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean }}>support@ralphfoulger.com</a> — we process refunds within 3 business days. The $249.99 Plus extension and the $800 Solo Website Build are non-refundable once delivered.</p>,
      },
      {
        id: 'standard-vs-plus',
        question: 'Should I pick Standard or Plus?',
        answer: (
          <>
            <p><strong>Plus ($899)</strong> for first-time licensees who plan to actually work in real estate. You get everything in Standard <em>plus</em> a custom agent website built on your own domain when you pass PSI — that&rsquo;s the single biggest first-year cost saved.</p>
            <p><strong>Standard ($599)</strong> for everyone else — career-switchers who already have a website-building plan, retirees taking the license for limited use, anyone who doesn&rsquo;t need a launch kit.</p>
            <p>Plus also includes the <strong>$249.99 extension safety net</strong> if life gets in the way — Standard students who run out their window re-enroll at full price.</p>
          </>
        ),
      },
      {
        id: 'price-includes-psi',
        question: 'Is the PSI exam fee included?',
        answer: <p>No. PSI charges its own exam fee (currently ~$73 for the salesperson exam), separately from us. The Hawaii REC also charges an application fee. Plan for around $150 in fees on top of tuition.</p>,
      },
    ],
  },
  {
    heading: 'Access + extensions',
    items: [
      {
        id: 'access-window',
        question: 'What\'s the access window?',
        answer: <p>Standard: <strong>3 months</strong> from enrollment. Plus: <strong>6 months</strong>. Solo Website Build: no expiration (it&rsquo;s a build, not a course). Your profile shows the live countdown so you always know how long you have.</p>,
      },
      {
        id: 'window-expires',
        question: 'What if my window runs out?',
        answer: (
          <>
            <p><strong>Plus students</strong> can buy a one-time <strong>$249.99 extension</strong> for 90 additional days of full access. This is a Plus-only benefit. Your study progress and the agent-website bundle stay attached.</p>
            <p><strong>Standard students</strong> re-enroll at the full $599 Standard price for a fresh 3-month window. Your study history, quiz scores, and 60-hour state-law progress are preserved.</p>
          </>
        ),
      },
      {
        id: 'forgot-window',
        question: 'My access expired and I forgot about it. Help?',
        answer: <p>Email <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean }}>support@ralphfoulger.com</a> and we&rsquo;ll look at your case. We aren&rsquo;t a vending machine — if life happened and you genuinely studied most of the course before expiring, we work something out. The buttons in your profile are the default path; the email is the &ldquo;please explain&rdquo; path.</p>,
      },
    ],
  },
  {
    heading: 'After the course',
    items: [
      {
        id: 'certificate',
        question: 'What does completing the course actually get me?',
        answer: <p>Two things. (1) A <strong>course-completion certificate</strong> with a verification ID, downloadable from your profile, valid for 2 years per Hawaii REC rules. (2) Eligibility to register for the PSI Hawaii Salesperson Exam. The certificate is the gatekeeper for the exam — without it you can&rsquo;t sit.</p>,
      },
      {
        id: 'broker-help',
        question: 'Can you help me find a sponsoring broker?',
        answer: <p>Plus students get a <strong>broker introductions packet</strong> with our notes on Hawaii brokerages currently growing teams + intro emails to the ones we have relationships with. Standard students get the same brokerage research, just no warm intros. Solo students already have a broker.</p>,
      },
      {
        id: 'after-passing',
        question: 'What happens when I pass PSI?',
        answer: <p>Tell us. Plus students: we start building your agent website that week (delivery in 2-4 weeks). Standard / Solo: we mark your account as licensed and your certificate updates to reflect &ldquo;exam passed.&rdquo; You handle the REC application + sponsoring-broker paperwork on your end.</p>,
      },
    ],
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '64px 32px 80px', maxWidth: 820, margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.24em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 }}>
              FAQ
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.0, marginBottom: 14 }}>
              Plain answers, no fluff.
            </h1>
            <p style={{ fontSize: 17, color: T.textDim, lineHeight: 1.65, maxWidth: 620, margin: '0 auto' }}>
              The questions prospective students actually email us. If yours isn&rsquo;t here, write us: <a href="mailto:support@ralphfoulger.com" style={{ color: T.ocean, textDecoration: 'underline' }}>support@ralphfoulger.com</a>.
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map(section => (
            <section key={section.heading} style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.01em', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                {section.heading}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map(item => {
                  const isOpen = open === item.id;
                  return (
                    <div key={item.id} id={item.id} style={{ ...CARD, padding: 0, overflow: 'hidden', scrollMarginTop: 80 }}>
                      <button
                        onClick={() => setOpen(isOpen ? null : item.id)}
                        style={{
                          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', textAlign: 'left',
                        }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>
                          {item.question}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: T.textMute, fontWeight: 700, marginLeft: 12, flexShrink: 0 }}>
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 20px 18px', fontSize: 15, color: T.textDim, lineHeight: 1.7 }}>
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Bottom CTA */}
          <div style={{ ...CARD, padding: 28, marginTop: 32, textAlign: 'center', borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.ocean }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 10 }}>
              Still have questions?
            </h3>
            <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6, marginBottom: 18, maxWidth: 460, margin: '0 auto 18px' }}>
              Try the free course first — five lessons, no card needed. If it&rsquo;s a fit, the upsell to Standard or Plus is one click.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/free" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                Try the free course →
              </Link>
              <Link href="/pricing" style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                See pricing
              </Link>
              <a href="mailto:support@ralphfoulger.com" style={{ ...BUTTON_3D.ghost, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                Email us
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
