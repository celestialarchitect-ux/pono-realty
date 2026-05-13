// ABOUTME: 10 high-conversion social post specs for Ralph Foulger Academy.
// ABOUTME: Used by build-posts.mjs to emit 1080x1080 HTML pages + render them via Playwright.

// Each post = a single Instagram-native 1080x1080 image. Layout uses one of
// four templates (see render-template) so the set feels cohesive — same
// brand palette, fonts, ornament motif — without being identical.
//
// Conversion strategy is spread across the 10:
//  1. Awareness        — "60 hours" timeline reframe
//  2. Lead magnet      — Free course CTA
//  3. Differentiator   — Daily lesson planner
//  4. Conversion       — Plus bundle (course + website)
//  5. Feature          — AI tutor 24/7
//  6. Authority        — Hawaii-specific depth
//  7. Founder story    — Ralph since 1972
//  8. Objection-handle — Real estate math
//  9. Proof            — 130-question mock exam
// 10. Identity close   — Future-self emotional close

export const BRAND = {
  bg:       '#fbf7f0',  // warm cream
  bgRaised: '#ece2cc',  // raised cream
  ocean:    '#14837b',  // ocean teal — primary
  oceanDk:  '#0d5e58',
  coral:    '#e85d3c',  // sunset coral — accent
  coralDk:  '#c14628',
  green:    '#2d8659',
  text:     '#2d3748',
  textDim:  '#54616d',
  textMute: '#6b7a8a',
  border:   'rgba(45,55,72,0.12)',
  borderHi: 'rgba(45,55,72,0.22)',
};

export const SITE = 'ralphfoulger.com';

// 4 templates we cycle through for variety:
//   'split'   — left ornament block + right content (used on conversion-heavy posts)
//   'centered'— hero quote layout (emotional / awareness)
//   'stat'    — large stat callout + small body (proof/data posts)
//   'editorial' — magazine-style with image-block (planner/feature posts)
export const POSTS = [
  // 1. Awareness — TIMELINE REFRAME
  {
    id: 'post-01',
    template: 'stat',
    accent: 'ocean',
    eyebrow: 'Hawaii pre-license · the real timeline',
    bigNumber: '60',
    bigNumberUnit: 'hours',
    headline: 'Two weeks if you go <em>full-time.</em>',
    body: 'Hawaii law requires 60 documented study hours before you can sit for the PSI exam. That’s the entire timeline. Not three months. Not six. <strong>Sixty hours.</strong>',
    breakdown: [
      ['6 hrs/day', '~10 days'],
      ['4 hrs/day', '~15 days'],
      ['2 hrs/day', '~30 days'],
      ['1 hr/day',  '~60 days'],
    ],
    cta: SITE,
    handle: '@ralphfoulger',
  },

  // 2. Lead magnet — FREE COURSE
  {
    id: 'post-02',
    template: 'centered',
    accent: 'coral',
    eyebrow: 'Free first',
    headline: 'Five free lessons.<br/>Then decide.',
    body: 'The Free Foundation walks you through Hawaii’s real estate market, the licensing path, the real income math, and what the lifestyle actually looks like. No credit card. No commitment.',
    proof: ['Hawaii market 101', 'Licensing process', 'Income reality check', 'Day-in-the-life'],
    ctaLabel: 'Start free',
    cta: SITE + '/free',
    handle: '@ralphfoulger',
  },

  // 3. Differentiator — DAILY LESSON PLANNER
  {
    id: 'post-03',
    template: 'editorial',
    accent: 'ocean',
    eyebrow: 'The game-changer',
    headline: 'A daily class schedule.<br/><em>Like going to actual school.</em>',
    body: 'Pick your exam date. The system builds your daily schedule — today’s chapters, today’s flashcards, today’s math, today’s mock. With class times. Open the app, do the day.',
    scheduleSample: [
      { time: '9:00 AM',  label: 'Chapter 3: Valuation' },
      { time: '10:05 AM', label: 'Chapter 3 quiz' },
      { time: '10:25 AM', label: 'Chapter 7: Contracts' },
      { time: '11:40 AM', label: 'Smart flashcards' },
    ],
    cta: SITE + '/pricing',
    handle: '@ralphfoulger',
  },

  // 4. Conversion — PLUS BUNDLE
  {
    id: 'post-04',
    template: 'split',
    accent: 'coral',
    eyebrow: 'Plus tier · The graduation bundle',
    headline: 'Pass the exam.<br/>Walk into a <em>career.</em>',
    body: 'Plus students graduate with their own <strong>custom Hawaii agent website</strong>, their own domain, a CRM, lead-capture forms, and an admin portal — delivered the moment you pass the PSI Hawaii Salesperson Exam.',
    bullets: [
      'Standard course (60h, audiobook, AI tutor, mocks)',
      'Custom website on your own domain',
      'CRM + lead capture + admin portal',
      'Launch playbook + starter lead packet',
      'Broker introductions',
    ],
    price: '$899',
    priceSub: 'one-time · no subscription',
    cta: SITE + '/pricing',
    handle: '@ralphfoulger',
  },

  // 5. Feature — AI TUTOR
  {
    id: 'post-05',
    template: 'centered',
    accent: 'ocean',
    eyebrow: 'Stuck at 11 PM on chapter 8?',
    headline: 'Your AI Real Estate Tutor<br/><em>doesn’t sleep.</em>',
    body: 'Trained on every Hawaii rule. Knows the math cold. Will explain a topic ten different ways until it clicks. <strong>24 / 7.</strong> Included with Standard tier and up.',
    proof: ['Hawaii-specific', 'Math walkthroughs', 'Practice problems', 'Always-on'],
    ctaLabel: 'See pricing',
    cta: SITE + '/pricing',
    handle: '@ralphfoulger',
  },

  // 6. Authority — HAWAII-SPECIFIC
  {
    id: 'post-06',
    template: 'split',
    accent: 'ocean',
    eyebrow: 'Trained on the islands you’ll work',
    headline: 'Hawaii-specific.<br/><em>Not a national course<br/>with a Hawaii wrapper.</em>',
    body: 'The state portion is 50 of the 130 PSI questions. We treat it like the make-or-break it is.',
    bullets: [
      'HRS 514B condominiums',
      'HARPTA + GET',
      'Leasehold disclosures',
      'State Land Use Districts',
      'Hawaii contract addenda',
      'License law (HRS 467)',
    ],
    price: null,
    priceSub: null,
    cta: SITE,
    handle: '@ralphfoulger',
  },

  // 7. Founder story — RALPH
  {
    id: 'post-07',
    template: 'centered',
    accent: 'coral',
    eyebrow: 'Instructor since 1972',
    headline: 'Ralph S. Foulger taught<br/>the people who taught<br/><em>the brokers.</em>',
    body: 'Hawaii REC-approved pre-license course. Five decades of island real estate education distilled into one focused program. The questions on the exam are the questions Ralph wrote tests around for half a century.',
    proof: ['REB-approved', 'Since 1972', 'HARES alumnus', 'IREM trained'],
    ctaLabel: 'Meet Ralph',
    cta: SITE,
    handle: '@ralphfoulger',
  },

  // 8. Objection-handle — MATH
  {
    id: 'post-08',
    template: 'stat',
    accent: 'green',
    eyebrow: 'The chapter everyone dreads',
    bigNumber: '0',
    bigNumberUnit: 'shortcuts',
    headline: 'Real estate math<br/><em>doesn’t have to suck.</em>',
    body: 'Prorations. LTV. Cap rates. Commissions. Worked-example drills calibrated to where students actually fall — practice until each one is automatic, not memorized.',
    breakdown: [
      ['Proration drills',     'unlimited'],
      ['Commission math',      'step-by-step'],
      ['LTV + points',         'visual'],
      ['Area + capitalization','exam-shaped'],
    ],
    cta: SITE,
    handle: '@ralphfoulger',
  },

  // 9. Proof — MOCK EXAM
  {
    id: 'post-09',
    template: 'stat',
    accent: 'coral',
    eyebrow: 'Walk into PSI ready',
    bigNumber: '130',
    bigNumberUnit: 'questions',
    headline: 'Mock exam in three difficulty tiers.',
    body: 'Hand-crafted questions that mirror the actual PSI Hawaii Salesperson Exam. <strong>80 national + 50 state</strong> — same proportions, same difficulty, same trap distractors.',
    breakdown: [
      ['Easy',   'concepts'],
      ['Medium', 'real wording'],
      ['Hard',   'trap-heavy'],
      ['Final',  '70% to graduate'],
    ],
    cta: SITE,
    handle: '@ralphfoulger',
  },

  // 10. Identity close — EARN IT
  {
    id: 'post-10',
    template: 'centered',
    accent: 'ocean',
    eyebrow: 'Earn this honestly',
    headline: 'Walk into your career<br/>with the one thing<br/>no shortcut ever gives you.',
    body: '<em style="font-style:italic;">The actual ability to do the work.</em>',
    proof: [],
    ctaLabel: 'Start free',
    cta: SITE + '/free',
    handle: '@ralphfoulger',
  },
];
