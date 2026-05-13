'use client';

// Study Planner — calendar + goal-date scheduler for the profile page.
//
// The plan is one of three states:
//   - No plan set       → prompt the user to pick a goal date (with quick
//                         presets: 2 weeks / 1 month / 3 months / custom)
//   - Plan exists       → render monthly calendar with planned vs actual
//                         minutes per day, color-coded by on-pace status
//   - Plan in past      → server validates; UI shows "your goal date has
//                         passed — set a new one"
//
// Per-day overrides are intentionally NOT yet exposed in the UI for v1.
// The schema supports them so a future "edit this day's target" picker
// can hook in without another migration.

import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';

interface ScheduleDay {
  date: string;
  plannedMinutes: number;
  actualMinutes: number;
  status: 'past_done' | 'past_short' | 'today' | 'future' | 'rest';
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

export function StudyPlanner() {
  const [state, setState] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [customDate, setCustomDate] = useState<string>('');
  const [includeWeekends, setIncludeWeekends] = useState(true);

  const fetchPlan = async () => {
    try {
      const r = await fetch('/api/study-plan', { cache: 'no-store' });
      if (!r.ok) {
        setState(null);
        return;
      }
      const j = (await r.json()) as PlanResponse;
      setState(j);
      if (j.plan) setIncludeWeekends(j.plan.includeWeekends);
    } catch {
      setState(null);
    }
  };

  useEffect(() => {
    fetchPlan();
    // Re-sync every 60 seconds so the calendar reflects newly-logged time.
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

  if (!state) return null; // not authed or 503 — caller renders nothing

  // ---------- NO PLAN: setup card ----------
  if (!state.plan || editing) {
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
          Study planner
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 8, lineHeight: 1.2 }}>
          Pick when you want to finish.
        </h2>
        <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.65, marginBottom: 18 }}>
          You need {state.hoursRemaining.toFixed(1)} more hours to hit the 60-hour state requirement. Pick a goal date and we&apos;ll generate a daily schedule for you. You can change it anytime.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
          {presets.map(p => {
            const date = new Date(today.getTime() + p.days * 24 * 60 * 60 * 1000);
            const dateStr = ymd(date);
            return (
              <button
                key={p.days}
                onClick={() => savePlan(dateStr)}
                disabled={loading}
                style={{
                  background: T.bgRaised, border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: '14px 12px', textAlign: 'left', cursor: loading ? 'wait' : 'pointer',
                  color: T.text, fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
                  transition: 'transform 0.12s, border-color 0.12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.ocean; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 4 }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: T.ocean, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginBottom: 6 }}>
                  {p.pace}
                </div>
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
            style={{
              fontFamily: 'inherit', fontSize: 13, padding: '8px 10px',
              borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bg, color: T.text,
            }}
          />
          <button
            onClick={() => customDate && savePlan(customDate)}
            disabled={!customDate || loading}
            style={{
              ...BUTTON_3D.primary, padding: '8px 16px', borderRadius: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
              cursor: !customDate || loading ? 'not-allowed' : 'pointer',
              opacity: !customDate || loading ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            Set goal
          </button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textDim, cursor: 'pointer', marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={includeWeekends}
            onChange={(e) => setIncludeWeekends(e.target.checked)}
          />
          <span>Schedule study time on weekends</span>
        </label>
        {saveError && <p style={{ fontSize: 12, color: T.coral, margin: 0 }}>{saveError}</p>}
        {editing && (
          <button onClick={() => setEditing(false)} style={{
            ...BUTTON_3D.ghost, padding: '6px 12px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, marginTop: 10, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Cancel
          </button>
        )}
      </div>
    );
  }

  // ---------- ACTIVE PLAN: monthly calendar ----------
  const goal = new Date(state.plan.goalDate);
  const today = new Date();
  const daysToGoal = Math.max(1, Math.ceil((goal.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
  const todayStr = ymd(today);
  const todayDay = state.schedule.find(d => d.date === todayStr);
  const onPace = state.onPaceRatio ?? 1;
  const paceLabel = onPace >= 0.95 ? 'On pace' : onPace >= 0.7 ? 'Slightly behind' : 'Behind pace';
  const paceColor = onPace >= 0.95 ? T.green : onPace >= 0.7 ? T.amber : T.coral;

  return (
    <div style={{ ...CARD, padding: 28, marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            Study planner
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>
            Goal: finish by {goal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <p style={{ fontSize: 12, color: T.textMute, margin: '6px 0 0', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
            {daysToGoal} day{daysToGoal === 1 ? '' : 's'} left · {state.hoursRemaining.toFixed(1)} hrs to go
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
            fontWeight: 700, color: '#fff', background: paceColor, textTransform: 'uppercase',
          }}>
            {paceLabel}
          </span>
          <button onClick={() => setEditing(true)} style={{
            ...BUTTON_3D.secondary, padding: '8px 14px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Change goal
          </button>
          <button onClick={clearPlan} style={{
            ...BUTTON_3D.ghost, padding: '8px 12px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', color: T.textMute,
          }}>
            Clear
          </button>
        </div>
      </div>

      {/* Today's target */}
      {todayDay && (
        <div style={{ ...CARD, padding: '14px 18px', marginBottom: 18, background: T.bgRaised, borderLeft: `3px solid ${todayDay.actualMinutes >= todayDay.plannedMinutes ? T.green : T.ocean}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Today&apos;s target</div>
              <div style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>
                {todayDay.plannedMinutes === 0 ? (
                  <>Rest day &mdash; no minutes scheduled.</>
                ) : (
                  <>
                    <strong style={{ color: T.text }}>{todayDay.actualMinutes}</strong> / {todayDay.plannedMinutes} minutes
                    {todayDay.actualMinutes >= todayDay.plannedMinutes && <span style={{ color: T.green, marginLeft: 10, fontSize: 13 }}>✓ done for today</span>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <CalendarGrid schedule={state.schedule} />

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14, fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
        <LegendDot color={T.green} label="On pace / done" />
        <LegendDot color={T.ocean} label="Today / scheduled" />
        <LegendDot color={T.coral} label="Short of target" />
        <LegendDot color={T.bgRaised} bordered label="Rest day" />
      </div>
    </div>
  );
}

function CalendarGrid({ schedule }: { schedule: ScheduleDay[] }) {
  if (schedule.length === 0) return null;

  // Group into weeks (Sun..Sat). Pad the front of the first week and the
  // tail of the last week with empty cells so each row aligns.
  const first = new Date(schedule[0].date + 'T12:00:00Z');
  const firstDow = first.getUTCDay(); // 0..6
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
            {week.map((day, di) => (
              <CalendarCell key={di} day={day} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarCell({ day }: { day: ScheduleDay | null }) {
  if (!day) {
    return <div style={{ aspectRatio: '1 / 1', minHeight: 44, background: 'transparent' }} />;
  }
  const dayNum = Number(day.date.slice(-2));
  let bg: string = T.bgRaised;
  let border: string = T.border;
  let accent: string = T.textMute;
  let label = '';

  if (day.status === 'past_done') {
    bg = 'rgba(20, 131, 123, 0.18)';
    border = T.green;
    accent = T.green;
    label = `${day.actualMinutes}m`;
  } else if (day.status === 'past_short') {
    bg = 'rgba(232, 93, 60, 0.12)';
    border = T.coral;
    accent = T.coral;
    label = day.actualMinutes > 0 ? `${day.actualMinutes}m` : '–';
  } else if (day.status === 'today') {
    bg = 'rgba(20, 131, 123, 0.16)';
    border = T.ocean;
    accent = T.ocean;
    label = `${day.actualMinutes}/${day.plannedMinutes}m`;
  } else if (day.status === 'rest') {
    bg = T.bgRaised;
    border = T.border;
    accent = T.textGhost;
    label = 'rest';
  } else { // future
    bg = T.bgRaised;
    border = T.border;
    accent = T.ocean;
    label = `${day.plannedMinutes}m`;
  }

  return (
    <div title={`${day.date} · planned ${day.plannedMinutes}m · actual ${day.actualMinutes}m`} style={{
      aspectRatio: '1 / 1', minHeight: 44, borderRadius: 8,
      background: bg, border: `1px solid ${border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 2, gap: 1, cursor: 'default',
    }}>
      <span style={{ fontSize: 11, color: T.text, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
        {dayNum}
      </span>
      <span style={{ fontSize: 9, color: accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  );
}

function LegendDot({ color, label, bordered }: { color: string; label: string; bordered?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 10, height: 10, borderRadius: 2,
        background: color,
        border: bordered ? `1px solid ${T.border}` : 'none',
      }} />
      {label}
    </span>
  );
}
