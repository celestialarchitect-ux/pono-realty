// Prospect lead scoring. Given a student's engagement signals, returns a
// 0-100 score, a tier bucket, and a short list of human-readable flags +
// a one-line recommended outreach action.
//
// The score is deliberately heuristic and transparent — no ML, no black box.
// If something doesn't feel right looking at a real student row, the numbers
// here are easy to tune.

import { STATE_LAW_HOURS_REQUIRED } from './time-tracking';

export interface ProspectSignals {
  totalSeconds: number;
  hoursLast7Days: number;
  daysActiveLast30: number;
  daysSinceLastActive: number | null;  // null = never studied
  daysSinceSignup: number;
  emailVerified: boolean;
  hasPhone: boolean;
}

export type ProspectTier = 'hot' | 'engaged' | 'building' | 'at-risk' | 'cold' | 'new';

export interface ProspectScore {
  score: number;          // 0-100
  tier: ProspectTier;
  flags: string[];        // short tags for filter chips
  recommended: string;    // one-line outreach action
  breakdown: {
    hours: number;        // 0-40
    consistency: number;  // 0-30
    recency: number;      // 0-20
    commitment: number;   // 0-10
  };
}

const TIER_LABELS: Record<ProspectTier, string> = {
  hot: 'Hot prospect',
  engaged: 'Engaged',
  building: 'Building',
  'at-risk': 'At risk',
  cold: 'Cold',
  new: 'Just signed up',
};

export function tierLabel(t: ProspectTier): string {
  return TIER_LABELS[t];
}

export function tierColor(t: ProspectTier): { bg: string; fg: string } {
  switch (t) {
    case 'hot':       return { bg: 'rgba(232,93,60,0.12)',  fg: '#c14628' };
    case 'engaged':   return { bg: 'rgba(20,131,123,0.12)', fg: '#14837b' };
    case 'building':  return { bg: 'rgba(20,131,123,0.06)', fg: '#0d5e58' };
    case 'at-risk':   return { bg: 'rgba(192,138,46,0.14)', fg: '#8a5d2a' };
    case 'cold':      return { bg: 'rgba(107,122,138,0.10)',fg: '#6b7a8a' };
    case 'new':       return { bg: 'rgba(212,165,116,0.16)',fg: '#8a5d2a' };
  }
}

export function score(signals: ProspectSignals): ProspectScore {
  // ── Hours: caps at 60h (the state-law eligibility threshold). 40 max ──
  const hoursTotal = signals.totalSeconds / 3600;
  const hours = Math.round(Math.min(hoursTotal / STATE_LAW_HOURS_REQUIRED, 1) * 40);

  // ── Consistency: distinct days active in last 30. 30 max ──
  const consistency = Math.round((Math.min(signals.daysActiveLast30, 30) / 30) * 30);

  // ── Recency: how recently they touched it. 20 max ──
  let recency = 0;
  if (signals.daysSinceLastActive === null) recency = 0;
  else if (signals.daysSinceLastActive < 1)   recency = 20;
  else if (signals.daysSinceLastActive < 3)   recency = 15;
  else if (signals.daysSinceLastActive < 7)   recency = 10;
  else if (signals.daysSinceLastActive < 14)  recency = 5;
  else if (signals.daysSinceLastActive < 30)  recency = 2;
  else                                        recency = 0;

  // ── Commitment: explicit signals beyond just being signed up. 10 max ──
  let commitment = 0;
  if (signals.emailVerified) commitment += 5;
  if (signals.hasPhone)      commitment += 5;

  const total = hours + consistency + recency + commitment;

  // ── Flags + recommendation ──
  const flags: string[] = [];
  let recommended = '';

  if (hoursTotal >= STATE_LAW_HOURS_REQUIRED) {
    flags.push('eligible');
  } else if (hoursTotal >= STATE_LAW_HOURS_REQUIRED * 0.83) {
    flags.push('near-eligible'); // within last 10h
  }
  if (signals.daysActiveLast30 >= 5 && signals.daysActiveLast30 >= signals.daysSinceSignup * 0.5) {
    flags.push('consistent');
  }
  if (signals.daysSinceLastActive !== null && signals.daysSinceLastActive >= 7 && hoursTotal > 1) {
    flags.push('cooling-off');
  }
  if (signals.daysSinceLastActive !== null && signals.daysSinceLastActive >= 14) {
    flags.push('dormant');
  }
  if (!signals.emailVerified && signals.daysSinceSignup >= 1) {
    flags.push('unverified-email');
  }
  if (hoursTotal < 0.25 && signals.daysSinceSignup >= 3) {
    flags.push('barely-started');
  }

  // ── Tier bucket ──
  let tier: ProspectTier;
  if (signals.daysSinceLastActive === null && signals.daysSinceSignup < 2) {
    tier = 'new';
    recommended = 'Give them another day — they just signed up. If they don\'t log in by day 3, send a welcome nudge.';
  } else if (total >= 75 || flags.includes('eligible')) {
    tier = 'hot';
    recommended = flags.includes('eligible')
      ? 'Eligible NOW — push them to take the mock exam this week and book a 1:1 follow-up.'
      : 'Top prospect. Personal email — congratulate the consistency and confirm exam plans.';
  } else if (total >= 50) {
    tier = 'engaged';
    recommended = 'On track. Light-touch encouragement is enough — share a chapter highlight or math drill of the week.';
  } else if (total >= 25 && (signals.daysSinceLastActive ?? 99) < 14) {
    tier = 'building';
    recommended = 'Studying but inconsistent. Suggest a 20-min daily window — habit beats heroics.';
  } else if (flags.includes('cooling-off') || flags.includes('dormant')) {
    tier = 'at-risk';
    recommended = 'Was studying, now drifting. Quick text or short email: "Saw you got through X — what\'s next?"';
  } else {
    tier = 'cold';
    recommended = 'Signed up but barely engaged. Send the why-now email (PSI test windows fill up, etc.) — or DQ them and move on.';
  }

  return {
    score: total,
    tier,
    flags,
    recommended,
    breakdown: { hours, consistency, recency, commitment },
  };
}
