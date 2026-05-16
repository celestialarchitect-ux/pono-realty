'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { hoursDecimal, STATE_LAW_HOURS_REQUIRED } from '@/lib/time-tracking';
import { tierLabel, tierColor, type ProspectTier } from '@/lib/prospect-scoring';

interface Prospect {
  user: { id: string; email: string; name: string; firstName: string; lastName: string; phone: string | null; tier: string; createdAt: string; lastSeenAt: string; emailVerified: boolean };
  signals: { totalSeconds: number; hoursLast7Days: number; daysActiveLast30: number; daysSinceLastActive: number | null; daysSinceSignup: number; emailVerified: boolean; hasPhone: boolean };
  score: number;
  tier: ProspectTier;
  flags: string[];
  recommended: string;
  breakdown: { hours: number; consistency: number; recency: number; commitment: number };
}
type CountMap = Record<ProspectTier, number>;

const FLAG_LABEL: Record<string, string> = {
  'eligible': '60h eligible',
  'near-eligible': 'Near 60h',
  'consistent': 'Consistent',
  'cooling-off': 'Cooling off',
  'dormant': 'Dormant 14d+',
  'unverified-email': 'Email unverified',
  'barely-started': 'Barely started',
};

const TIER_ORDER: ProspectTier[] = ['hot', 'engaged', 'building', 'at-risk', 'cold', 'new'];

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[] | null>(null);
  const [counts, setCounts] = useState<CountMap | null>(null);
  const [filter, setFilter] = useState<ProspectTier | 'all'>('all');
  const [active, setActive] = useState<Prospect | null>(null);
  const [unprovisioned, setUnprovisioned] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/prospects', { cache: 'no-store' });
      if (res.status === 503) { setUnprovisioned(true); return; }
      if (!res.ok) return;
      const data = await res.json();
      setProspects(data.prospects);
      setCounts(data.counts);
    } catch {/* ignore */}
  };

  useEffect(() => { load(); const id = setInterval(load, 20_000); return () => clearInterval(id); }, []);

  const filtered = !prospects ? [] : (filter === 'all' ? prospects : prospects.filter(p => p.tier === filter));

  return (
    <Shell>
      <Heading />
      {unprovisioned ? (
        <div style={{ ...CARD, padding: 28, marginTop: 18, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
          <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, margin: 0 }}>
            Backend not yet provisioned. Once Postgres is up and students start signing up, scored prospects will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          <FilterBar counts={counts} filter={filter} setFilter={setFilter} total={prospects?.length ?? 0} />
          {prospects === null ? (
            <p style={{ color: T.textMute, marginTop: 18 }}>Loading prospects…</p>
          ) : filtered.length === 0 ? (
            <div style={{ ...CARD, padding: 32, marginTop: 18, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: T.textMute, margin: 0 }}>
                {prospects.length === 0 ? 'No students enrolled yet. As people sign up they\'ll be scored automatically.' : 'No prospects in this bucket right now.'}
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(p => (
                <li key={p.user.id}>
                  <ProspectCard p={p} onOpen={() => setActive(p)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {active && <DetailDrawer p={active} onClose={() => setActive(null)} />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* sidebar replaces header */}
        <main style={{ padding: '48px clamp(14px, 3.5vw, 32px) 64px', maxWidth: 1180, margin: '0 auto', minWidth: 0 }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
        Admin · Prospects
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 52px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 6 }}>
        Who&apos;s <em style={{ color: T.ocean, fontStyle: 'italic' }}>actually studying.</em>
      </h1>
      <p style={{ fontSize: 14, color: T.textMute, margin: 0, maxWidth: 720, lineHeight: 1.6 }}>
        Every signup is scored on hours, consistency, recency, and commitment signals. Top of the list = ready to test. Bottom = needs a nudge or is gone.
      </p>
    </div>
  );
}

function FilterBar({ counts, filter, setFilter, total }: { counts: CountMap | null; filter: ProspectTier | 'all'; setFilter: (f: ProspectTier | 'all') => void; total: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <button
        onClick={() => setFilter('all')}
        style={{ ...(filter === 'all' ? BUTTON_3D.primary : BUTTON_3D.secondary), padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', border: filter === 'all' ? 'none' : undefined }}
      >
        All <span style={{ marginLeft: 6, opacity: 0.7 }}>{total}</span>
      </button>
      {TIER_ORDER.map(t => {
        const c = tierColor(t);
        const isActive = filter === t;
        const count = counts?.[t] ?? 0;
        return (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              background: isActive ? c.fg : c.bg,
              color: isActive ? '#fff' : c.fg,
              border: `1px solid ${isActive ? c.fg : 'transparent'}`,
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {tierLabel(t)} <span style={{ marginLeft: 6, opacity: 0.85 }}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function ProspectCard({ p, onOpen }: { p: Prospect; onOpen: () => void }) {
  const c = tierColor(p.tier);
  const hours = hoursDecimal(p.signals.totalSeconds);
  const pctTo60 = Math.min(100, (p.signals.totalSeconds / (STATE_LAW_HOURS_REQUIRED * 3600)) * 100);
  return (
    <button
      onClick={onOpen}
      style={{ ...CARD, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', padding: '18px 20px', borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: c.fg }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 80px 160px 120px 80px', gap: 18, alignItems: 'center' }} data-stack-mobile="true">
        {/* identity + flags */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ background: c.bg, color: c.fg, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
              {tierLabel(p.tier)}
            </span>
            <span style={{ fontSize: 15, color: T.text, fontWeight: 600 }}>{p.user.name}</span>
            {p.user.tier !== 'free' && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: T.ocean, textTransform: 'uppercase', fontWeight: 700 }}>{p.user.tier}</span>}
          </div>
          <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>{p.user.email}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {p.flags.map(f => (
              <span key={f} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: T.bgRaised, color: T.textDim }}>
                {FLAG_LABEL[f] ?? f}
              </span>
            ))}
          </div>
        </div>

        {/* score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: c.fg, lineHeight: 1 }}>{p.score}</div>
          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: T.textMute, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>/ 100</div>
        </div>

        {/* hours progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
            <span style={{ color: T.text, fontWeight: 700 }}>{hours.toFixed(1)} h</span>
            <span style={{ color: T.textMute }}>/ 60</span>
          </div>
          <div style={{ height: 4, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pctTo60}%`, background: c.fg }} />
          </div>
        </div>

        {/* consistency */}
        <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ color: T.text, fontWeight: 600 }}>{p.signals.daysActiveLast30} days</div>
          <div style={{ marginTop: 2, fontSize: 10, letterSpacing: '0.08em' }}>active / 30d</div>
        </div>

        {/* last seen */}
        <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>
          {p.signals.daysSinceLastActive === null
            ? 'never'
            : p.signals.daysSinceLastActive === 0
              ? 'today'
              : p.signals.daysSinceLastActive === 1
                ? '1d ago'
                : `${p.signals.daysSinceLastActive}d ago`}
        </div>
      </div>
    </button>
  );
}

function DetailDrawer({ p, onClose }: { p: Prospect; onClose: () => void }) {
  const c = tierColor(p.tier);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,26,38,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 18, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...CARD, maxWidth: 640, width: '100%', padding: 28, marginTop: 60, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div>
            <span style={{ background: c.bg, color: c.fg, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
              {tierLabel(p.tier)} · score {p.score}
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.2, margin: '10px 0 4px' }}>{p.user.name}</h2>
            <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace" }}>{p.user.email}{p.user.phone ? ` · ${p.user.phone}` : ''}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 22, color: T.textMute, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ background: T.bgRaised, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Recommended next step</div>
          <p style={{ fontSize: 14, color: T.text, lineHeight: 1.65, margin: 0 }}>{p.recommended}</p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Score breakdown (0-100)</div>
          <ScoreBar label="Hours toward 60" value={p.breakdown.hours} max={40} />
          <ScoreBar label="Consistency (days/30)" value={p.breakdown.consistency} max={30} />
          <ScoreBar label="Recency" value={p.breakdown.recency} max={20} />
          <ScoreBar label="Commitment" value={p.breakdown.commitment} max={10} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Signals</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, fontSize: 13 }}>
            <Sig label="Total" v={`${hoursDecimal(p.signals.totalSeconds).toFixed(1)} h`} />
            <Sig label="Last 7 days" v={`${p.signals.hoursLast7Days.toFixed(1)} h`} />
            <Sig label="Days active / 30" v={`${p.signals.daysActiveLast30}`} />
            <Sig label="Last seen" v={p.signals.daysSinceLastActive === null ? 'never' : `${p.signals.daysSinceLastActive}d ago`} />
            <Sig label="Signed up" v={`${p.signals.daysSinceSignup}d ago`} />
            <Sig label="Email" v={p.user.emailVerified ? 'verified' : 'unverified'} />
            <Sig label="Phone" v={p.user.phone ?? '—'} />
            <Sig label="Tier" v={p.user.tier} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {p.user.phone && (
            <a href={`tel:${p.user.phone}`} style={{ ...BUTTON_3D.primary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>Call</a>
          )}
          <a href={`mailto:${p.user.email}?subject=Hawaii%20Real%20Estate%20Academy%20%E2%80%94%20checking%20in`} style={{ ...BUTTON_3D.secondary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>Email</a>
          <Link href={`/admin/users`} style={{ ...BUTTON_3D.ghost, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>Manage account</Link>
        </div>

        <p style={{ fontSize: 10, color: T.textGhost, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', marginTop: 14 }}>
          User ID: {p.user.id}
        </p>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: T.text }}>{label}</span>
        <span style={{ color: T.textMute, fontFamily: "'JetBrains Mono', monospace" }}>{value} / {max}</span>
      </div>
      <div style={{ height: 5, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: T.ocean }} />
      </div>
    </div>
  );
}

function Sig({ label, v }: { label: string; v: string }) {
  return (
    <div style={{ background: T.bgRaised, padding: '8px 12px', borderRadius: 8 }}>
      <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.14em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{v}</div>
    </div>
  );
}

