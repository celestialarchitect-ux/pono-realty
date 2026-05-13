'use client';

// Study Planner — full class-schedule lesson plans on the profile page.
//
// Renders three nested views:
//   1. "Today's class schedule" card — each activity as a timed class block
//      ("9:00 AM · Chapter 3: Valuation & Market Analysis · 60 min · Open")
//      with check-as-complete state, links to the actual content.
//   2. Monthly calendar with chapter chips on days that start a new chapter.
//      Cells are color-coded by past_done / today / future / past_short / rest.
//   3. Expandable "Upcoming days" list — accordion of every future day with
//      its full activities lineup. Click a day to see its plan.
//
// All schedule generation is server-side. The component just renders.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { T, CARD, BUTTON_3D } from '@/lib/theme';

interface Activity {
  type: 'chapter' | 'flashcards' | 'math' | 'quiz' | 'mock' | 'glossary' | 'review';
  title: string;
  subtitle?: string;
  minutes: number;
  href?: string;
  chapterSlug?: string;
  chapterNumber?: number;
}

interface ChapterChip {
  slug: string;
  number: number;
  title: string;
  portion: 'national' | 'state';
  examItems: number;
  description: string;
  estimatedMinutes: number;
  keyTerms: number;
}

interface ScheduleDay {
  date: string;
  totalMinutes: number;
  actualMinutes: number;
  status: 'past_done' | 'past_short' | 'today' | 'future' | 'rest';
  activities: Activity[];
  startsChapter: ChapterChip | null;
  isReviewWeek: boolean;
}

interface PlanResponse {
  plan: {
    id: string;
    goalDate: string;
    includeWeekends: boolean;
    overrides: Record<string, number>;
  } | null;
  hoursStudied: number;
  hoursRemaining: number;
  hoursRequired: number;
  onPaceRatio?: number;
  schedule: ScheduleDay[];
}

function ymd(d: Date): string { return d.toISOString().slice(0, 10); }
function pad2(n: number): string { return n.toString().padStart(2, '0'); }

// Compute start/end times so each activity reads like a class block.
// firstStudyHour defaults to 9am — feel free to make this user-settable
// in a future update.
function fmtTimeBlocks(activities: Activity[], firstStudyHour = 9): Array<Activity & { startTime: string; endTime: string }> {
  let cursor = firstStudyHour * 60;
  const toLabel = (m: number) => {
    const h = Math.floor(m / 60) % 24;
    const min = m % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hh}:${pad2(min)} ${period}`;
  };
  return activities.map(a => {
    const start = cursor;
    const end = cursor + a.minutes;
    cursor = end + 5; // 5-min break
    return { ...a, startTime: toLabel(start), endTime: toLabel(end) };
  });
}

export function StudyPlanner() {
  const [state, setState] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [customDate, setCustomDate] = useState<string>('');
  const [includeWeekends, setIncludeWeekends] = useState(true);
  // Tab: 'today' | 'calendar' | 'upcoming'
  const [tab, setTab] = useState<'today' | 'calendar' | 'upcoming'>('today');

  const fetchPlan = async () => {
    try {
      const r = await fetch('/api/study-plan', { cache: 'no-store' });
      if (!r.ok) { setState(null); return; }
      const j = (await r.json()) as PlanResponse;
      setState(j);
      if (j.plan) setIncludeWeekends(j.plan.includeWeekends);
    } catch {
      setState(null);
    }
  };

  useEffect(() => {
    fetchPlan();
    const id = setInterval(fetchPlan, 60_000);
    return () => clearInterval(id);
  }, []);

  const savePlan = async (goalDate: string) => {
    setLoading(true);
    setSaveError(null);
    try {
      const r = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalDate, includeWeekends }),
      });
      const j = await r.json();
      if (!r.ok) {
        const msg = j.error === 'goal_date_in_past' ? 'Pick a future date.'
                  : j.error === 'goal_date_too_far' ? 'Pick a date within the next year.'
                  : j.error === 'invalid_goal_date' ? 'That date is not valid.'
                  : 'Could not save plan.';
        setSaveError(msg);
        return;
      }
      setEditing(false);
      setCustomDate('');
      await fetchPlan();
    } catch {
      setSaveError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const clearPlan = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Clear your study plan? You can set a new goal anytime.')) return;
    setLoading(true);
    try {
      await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalDate: null }),
      });
      await fetchPlan();
    } finally {
      setLoading(false);
    }
  };

  if (!state) return null;

  // No plan yet → setup card
  if (!state.plan || editing) return (
    <SetupCard
      hoursRemaining={state.hoursRemaining}
      includeWeekends={includeWeekends}
      setIncludeWeekends={setIncludeWeekends}
      onSave={savePlan}
      onCancel={editing ? () => setEditing(false) : undefined}
      loading={loading}
      saveError={saveError}
      customDate={customDate}
      setCustomDate={setCustomDate}
    />
  );

  // Active plan → tabbed lesson plan view
  return (
    <ActivePlanView
      state={state}
      tab={tab}
      setTab={setTab}
      onEditGoal={() => setEditing(true)}
      onClearPlan={clearPlan}
    />
  );
}

// =========================================================================
// SETUP CARD
// =========================================================================

function SetupCard({
  hoursRemaining, includeWeekends, setIncludeWeekends,
  onSave, onCancel, loading, saveError, customDate, setCustomDate,
}: {
  hoursRemaining: number;
  includeWeekends: boolean;
  setIncludeWeekends: (b: boolean) => void;
  onSave: (date: string) => void;
  onCancel?: () => void;
  loading: boolean;
  saveError: string | null;
  customDate: string;
  setCustomDate: (s: string) => void;
}) {
  const today = new Date();
  const presets = [
    { days: 14,  label: '2 weeks',  pace: '~4.3 hrs/day' },
    { days: 30,  label: '1 month',  pace: '~2 hrs/day' },
    { days: 60,  label: '2 months', pace: '~1 hr/day' },
    { days: 90,  label: '3 months', pace: '~40 min/day' },
  ];
  return (
    <div style={{ ...CARD, padding: 28, marginBottom: 22, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.ocean }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
        Daily lesson planner
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 8, lineHeight: 1.2 }}>
        Pick when you want to finish.
      </h2>
      <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.65, marginBottom: 18 }}>
        Pick a goal date and we&apos;ll generate a <strong style={{ color: T.text }}>full class schedule</strong> for every study day — which chapters, which flashcards, which math drills, which mock exams. Like going to school: today&apos;s lesson, tomorrow&apos;s lesson, all the way to your exam date. You need {hoursRemaining.toFixed(1)} more hours.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        {presets.map(p => {
          const date = new Date(today.getTime() + p.days * 24 * 60 * 60 * 1000);
          const dateStr = ymd(date);
          return (
            <button
              key={p.days}
              onClick={() => onSave(dateStr)}
              disabled={loading}
              style={{
                background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12,
                padding: '14px 12px', textAlign: 'left', cursor: loading ? 'wait' : 'pointer',
                color: T.text, fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
                transition: 'border-color 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.ocean; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}
            >
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: T.ocean, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginBottom: 6 }}>{p.pace}</div>
              <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace" }}>
                finish by {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>Or pick a custom date:</label>
        <input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          min={ymd(new Date(today.getTime() + 24 * 60 * 60 * 1000))}
          max={ymd(new Date(today.getTime() + 360 * 24 * 60 * 60 * 1000))}
          style={{ fontFamily: 'inherit', fontSize: 13, padding: '8px 10px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, color: T.text }}
        />
        <button
          onClick={() => customDate && onSave(customDate)}
          disabled={!customDate || loading}
          style={{
            ...BUTTON_3D.primary, padding: '8px 16px', borderRadius: 8,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
            cursor: !customDate || loading ? 'not-allowed' : 'pointer',
            opacity: !customDate || loading ? 0.5 : 1, fontFamily: 'inherit',
          }}>
          Set goal
        </button>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textDim, cursor: 'pointer', marginBottom: 10 }}>
        <input type="checkbox" checked={includeWeekends} onChange={(e) => setIncludeWeekends(e.target.checked)} />
        <span>Schedule study time on weekends</span>
      </label>
      {saveError && <p style={{ fontSize: 12, color: T.coral, margin: 0 }}>{saveError}</p>}
      {onCancel && (
        <button onClick={onCancel} style={{ ...BUTTON_3D.ghost, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, marginTop: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
      )}
    </div>
  );
}

// =========================================================================
// ACTIVE PLAN VIEW — tabbed: Today / Calendar / Upcoming
// =========================================================================

function ActivePlanView({ state, tab, setTab, onEditGoal, onClearPlan }: {
  state: PlanResponse;
  tab: 'today' | 'calendar' | 'upcoming';
  setTab: (t: 'today' | 'calendar' | 'upcoming') => void;
  onEditGoal: () => void;
  onClearPlan: () => void;
}) {
  const goal = new Date(state.plan!.goalDate);
  const today = new Date();
  const todayStr = ymd(today);
  const daysToGoal = Math.max(1, Math.ceil((goal.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
  const todayDay = state.schedule.find(d => d.date === todayStr);
  const onPace = state.onPaceRatio ?? 1;
  const paceLabel = onPace >= 0.95 ? 'On pace' : onPace >= 0.7 ? 'Slightly behind' : 'Behind pace';
  const paceColor = onPace >= 0.95 ? T.green : onPace >= 0.7 ? T.amber : T.coral;

  return (
    <div style={{ ...CARD, padding: 28, marginBottom: 22 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Daily lesson plan
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
            Exam-ready by {goal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <p style={{ fontSize: 12, color: T.textMute, margin: '6px 0 0', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
            {daysToGoal} day{daysToGoal === 1 ? '' : 's'} left · {state.hoursRemaining.toFixed(1)} hrs to go
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', fontWeight: 700, color: '#fff', background: paceColor, textTransform: 'uppercase' }}>
            {paceLabel}
          </span>
          <button onClick={onEditGoal} style={{ ...BUTTON_3D.secondary, padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>
            Change goal
          </button>
          <button onClick={onClearPlan} style={{ ...BUTTON_3D.ghost, padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit', color: T.textMute }}>
            Clear
          </button>
        </div>
      </div>

      {/* TAB STRIP */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 18, background: T.bgRaised, padding: 4, borderRadius: 10, border: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
        {(['today', 'calendar', 'upcoming'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: '1 1 auto', minWidth: 100,
            padding: '8px 14px', borderRadius: 8,
            background: tab === t ? T.bg : 'transparent',
            color: tab === t ? T.text : T.textMute,
            border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
            transition: 'background 0.12s, color 0.12s',
          }}>
            {t === 'today' ? "Today's class" : t === 'calendar' ? 'Calendar' : 'Upcoming days'}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <TodaysClassSchedule day={todayDay} hoursStudied={state.hoursStudied} hoursRequired={state.hoursRequired} />
      )}

      {tab === 'calendar' && (
        <>
          <CalendarGrid schedule={state.schedule} />
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14, fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            <LegendDot color={T.green} label="On pace / done" />
            <LegendDot color={T.ocean} label="Today / scheduled" />
            <LegendDot color={T.coral} label="Short of target" />
            <LegendDot color={T.bgRaised} bordered label="Rest day" />
            <span style={{ marginLeft: 4 }}>· chip = new chapter starts</span>
          </div>
        </>
      )}

      {tab === 'upcoming' && (
        <UpcomingDays schedule={state.schedule} todayStr={todayStr} />
      )}
    </div>
  );
}

// =========================================================================
// TODAY'S CLASS SCHEDULE — each activity as a timed block
// =========================================================================

function TodaysClassSchedule({ day, hoursStudied, hoursRequired }: {
  day: ScheduleDay | undefined;
  hoursStudied: number;
  hoursRequired: number;
}) {
  const blocks = useMemo(() => day ? fmtTimeBlocks(day.activities, 9) : [], [day]);
  if (!day) return <p style={{ fontSize: 13, color: T.textMute }}>No plan for today.</p>;

  if (day.status === 'rest') {
    return (
      <div style={{ ...CARD, padding: '32px 28px', background: T.bgRaised, textAlign: 'center', borderRadius: 14 }}>
        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.24em', color: T.textMute, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Rest day</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 10 }}>Recovery is part of the plan.</h3>
        <p style={{ fontSize: 13, color: T.textDim, margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Knowledge consolidates between study sessions. Today is scheduled as a rest day — come back tomorrow ready to absorb more.
        </p>
      </div>
    );
  }

  if (day.activities.length === 0) {
    return <p style={{ fontSize: 13, color: T.textMute }}>You&apos;re ahead of schedule — no required activities today. Use the time to review weak chapters or grab a bonus chapter.</p>;
  }

  const totalMinutes = day.totalMinutes;
  const actualMinutes = day.actualMinutes;
  const pct = totalMinutes > 0 ? Math.min(100, Math.round((actualMinutes / totalMinutes) * 100)) : 0;
  const isReview = day.isReviewWeek;
  const dateLabel = new Date(day.date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: isReview ? T.coral : T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
              {dateLabel}{isReview && ' · final review'}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: T.text, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Today&apos;s classes
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 900, color: actualMinutes >= totalMinutes ? T.green : T.ocean, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {actualMinutes}<span style={{ fontSize: 13, color: T.textMute }}> / {totalMinutes} min</span>
            </div>
            <div style={{ fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
              {pct}% complete
            </div>
          </div>
        </div>
        <div style={{ height: 4, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: actualMinutes >= totalMinutes ? T.green : T.ocean, transition: 'width 0.4s' }} />
        </div>
        <p style={{ fontSize: 11, color: T.textMute, marginTop: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
          Total studied across all sessions: {hoursStudied.toFixed(1)} / {hoursRequired} hrs
        </p>
      </div>

      {/* Class blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {blocks.map((block, i) => (
          <ClassBlock key={i} block={block} />
        ))}
      </div>
    </div>
  );
}

function ClassBlock({ block }: { block: Activity & { startTime: string; endTime: string } }) {
  const meta = TYPE_META[block.type];
  const Inner = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(96px, 110px) 1fr auto',
      gap: 14,
      alignItems: 'center',
      padding: '14px 18px',
      borderRadius: 12,
      background: T.bgRaised,
      border: `1px solid ${T.border}`,
      borderLeftWidth: 4,
      borderLeftColor: meta.color,
      transition: 'transform 0.12s, border-color 0.12s',
      cursor: block.href ? 'pointer' : 'default',
    }}>
      {/* Time column */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: 'left' }}>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 700, letterSpacing: '0.02em' }}>{block.startTime}</div>
        <div style={{ fontSize: 10, color: T.textMute, marginTop: 2 }}>to {block.endTime}</div>
      </div>
      {/* Subject column */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, background: meta.bg, color: meta.color, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
            <span aria-hidden="true" style={{ fontSize: 11 }}>{meta.icon}</span>
            {meta.label}
          </span>
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMute, letterSpacing: '0.04em' }}>{block.minutes} min</span>
        </div>
        <div style={{ fontSize: 15, color: T.text, fontWeight: 700, lineHeight: 1.3, marginBottom: block.subtitle ? 2 : 0 }}>
          {block.title}
        </div>
        {block.subtitle && (
          <div style={{ fontSize: 12, color: T.textMute, lineHeight: 1.4 }}>{block.subtitle}</div>
        )}
      </div>
      {/* Action */}
      <div>
        {block.href ? (
          <span style={{ ...BUTTON_3D.primary, padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', display: 'inline-block', whiteSpace: 'nowrap' }}>
            Open →
          </span>
        ) : null}
      </div>
    </div>
  );
  return block.href ? (
    <Link href={block.href} style={{ textDecoration: 'none', display: 'block' }}>
      {Inner}
    </Link>
  ) : Inner;
}

// =========================================================================
// CALENDAR — chapter chips on cells
// =========================================================================

function CalendarGrid({ schedule }: { schedule: ScheduleDay[] }) {
  if (schedule.length === 0) return null;
  const first = new Date(schedule[0].date + 'T12:00:00Z');
  const firstDow = first.getUTCDay();
  const cells: Array<ScheduleDay | null> = [
    ...Array(firstDow).fill(null),
    ...schedule,
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<ScheduleDay | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {dayLabels.map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', letterSpacing: '0.1em', fontWeight: 700 }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {week.map((day, di) => <CalendarCell key={di} day={day} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarCell({ day }: { day: ScheduleDay | null }) {
  if (!day) return <div style={{ aspectRatio: '1 / 1', minHeight: 56, background: 'transparent' }} />;

  const dayNum = Number(day.date.slice(-2));
  let bg: string = T.bgRaised;
  let border: string = T.border;
  let accent: string = T.textMute;
  let label = '';

  if (day.status === 'past_done') { bg = 'rgba(45, 134, 89, 0.18)'; border = T.green; accent = T.green; label = `${day.actualMinutes}m`; }
  else if (day.status === 'past_short') { bg = 'rgba(232, 93, 60, 0.12)'; border = T.coral; accent = T.coral; label = day.actualMinutes > 0 ? `${day.actualMinutes}m` : '–'; }
  else if (day.status === 'today') { bg = 'rgba(20, 131, 123, 0.18)'; border = T.ocean; accent = T.ocean; label = `${day.actualMinutes}/${day.totalMinutes}m`; }
  else if (day.status === 'rest') { bg = T.bgRaised; border = T.border; accent = T.textGhost; label = 'rest'; }
  else { bg = T.bgRaised; border = T.border; accent = T.ocean; label = `${day.totalMinutes}m`; }

  // Chip preview: which chapter is this day starting?
  const chip = day.startsChapter ? `Ch. ${day.startsChapter.number}` : day.isReviewWeek ? 'Mock' : null;

  return (
    <div
      title={describeDay(day)}
      style={{
        aspectRatio: '1 / 1', minHeight: 56, borderRadius: 8,
        background: bg, border: `1px solid ${border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 3, gap: 2,
      }}>
      <span style={{ fontSize: 11, color: T.text, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
        {dayNum}
      </span>
      {chip && (
        <span style={{ fontSize: 9, color: day.isReviewWeek ? T.coral : T.ocean, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
          {chip}
        </span>
      )}
      <span style={{ fontSize: 9, color: accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  );
}

function describeDay(day: ScheduleDay): string {
  if (day.status === 'rest') return `${day.date} · rest day`;
  const acts = day.activities.map(a => `${a.minutes}m ${a.title}`).slice(0, 3).join('\n');
  return `${day.date}\nplanned ${day.totalMinutes}m · actual ${day.actualMinutes}m\n${acts}${day.activities.length > 3 ? '\n…' : ''}`;
}

// =========================================================================
// UPCOMING DAYS — expandable accordion
// =========================================================================

function UpcomingDays({ schedule, todayStr }: { schedule: ScheduleDay[]; todayStr: string }) {
  const upcoming = schedule.filter(d => d.date >= todayStr);
  const [openIdx, setOpenIdx] = useState<number | null>(0); // today expanded by default

  if (upcoming.length === 0) return <p style={{ fontSize: 13, color: T.textMute }}>No upcoming days in your plan.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {upcoming.map((day, idx) => {
        const open = openIdx === idx;
        const dateObj = new Date(day.date + 'T12:00:00Z');
        const dayLabel = day.date === todayStr ? 'Today'
                       : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const summary = day.status === 'rest' ? 'Rest day'
                      : day.startsChapter ? `Starts Chapter ${day.startsChapter.number}: ${day.startsChapter.title}`
                      : day.isReviewWeek ? 'Final review · mock exam + targeted flashcards'
                      : day.activities.length > 0 ? day.activities[0].title
                      : '—';

        return (
          <div key={day.date} style={{ background: T.bgRaised, borderRadius: 10, border: `1px solid ${day.status === 'today' ? T.ocean : T.border}`, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIdx(open ? null : idx)}
              style={{
                width: '100%', display: 'grid', gridTemplateColumns: '110px 1fr auto',
                gap: 12, alignItems: 'center',
                padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
              }}>
              <div>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 700, letterSpacing: '0.02em' }}>{dayLabel}</div>
                <div style={{ fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{day.date}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
                <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                  {day.status === 'rest' ? '0 min · recovery' : `${day.totalMinutes} min · ${day.activities.length} activities${day.isReviewWeek ? ' · review' : ''}`}
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>{open ? '−' : '+'}</div>
            </button>
            {open && day.status !== 'rest' && (
              <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {fmtTimeBlocks(day.activities, 9).map((b, i) => (
                  <UpcomingActivityRow key={i} block={b} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UpcomingActivityRow({ block }: { block: Activity & { startTime: string; endTime: string } }) {
  const meta = TYPE_META[block.type];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 10, alignItems: 'center',
      padding: '8px 12px', borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`,
      borderLeftWidth: 3, borderLeftColor: meta.color,
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.textMute, letterSpacing: '0.02em' }}>{block.startTime}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: meta.color, marginRight: 6 }}>{meta.icon}</span>
          {block.title}
        </div>
      </div>
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textMute, whiteSpace: 'nowrap' }}>{block.minutes}m</div>
    </div>
  );
}

// =========================================================================
// HELPERS
// =========================================================================

function LegendDot({ color, label, bordered }: { color: string; label: string; bordered?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, border: bordered ? `1px solid ${T.border}` : 'none' }} />
      {label}
    </span>
  );
}

// Visual metadata per activity type. Color + icon + display label.
const TYPE_META: Record<Activity['type'], { color: string; bg: string; label: string; icon: string }> = {
  chapter:    { color: '#14837b', bg: 'rgba(20,131,123,0.12)',  label: 'Chapter',    icon: '📖' },
  quiz:       { color: '#c08a2e', bg: 'rgba(192,138,46,0.14)',  label: 'Quiz',       icon: '📝' },
  flashcards: { color: '#0d5e58', bg: 'rgba(13,94,88,0.14)',    label: 'Flashcards', icon: '🃏' },
  math:       { color: '#2d5a3d', bg: 'rgba(45,90,61,0.14)',    label: 'Math',       icon: '🧮' },
  mock:       { color: '#e85d3c', bg: 'rgba(232,93,60,0.14)',   label: 'Mock exam',  icon: '🎯' },
  glossary:   { color: '#6b7a8a', bg: 'rgba(107,122,138,0.14)', label: 'Glossary',   icon: '📚' },
  review:     { color: '#2d8659', bg: 'rgba(45,134,89,0.14)',   label: 'Review',     icon: '🔁' },
};
