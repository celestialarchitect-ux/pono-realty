'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { formatDuration } from '@/lib/time-tracking';

interface KPI {
  totalUsers: number;
  paidUsers: number;
  eligibleCount: number;
  signupsToday: number;
  signups7d: number;
  signups30d: number;
  activeNow: number;
  totalStudyHours: number;
  todayStudyHours: number;
  revenueUsd: number;
  paymentCount: number;
  openTickets: number;
  unreadInbound: number;
}

interface DayRow { date: string; signups: number; seconds: number }
interface UserRow { id: string; email: string; name: string; tier: string; createdAt: string; emailVerifiedAt?: string | null }

interface DashboardData {
  kpi: KPI;
  last30: DayRow[];
  recentSignups: UserRow[];
  recentUpgrades: UserRow[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [unconfigured, setUnconfigured] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/analytics/admin', { cache: 'no-store' });
        if (res.status === 503) {
          if (mounted) setUnconfigured(true);
          return;
        }
        if (res.ok) {
          const d = await res.json();
          if (mounted) setData(d);
        }
      } catch {/* ignore */}
    };
    load();
    // Refresh every 10s for the "active now" feel
    const id = setInterval(load, 10_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (unconfigured) {
    return (
      <Shell>
        <Heading />
        <div style={{ ...CARD, padding: 28, marginTop: 24, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 12 }}>
            Backend not yet provisioned.
          </h2>
          <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, margin: 0 }}>
            Add Postgres on Railway, set <code style={mono}>SESSION_SECRET</code> and <code style={mono}>ADMIN_EMAILS</code>, then run <code style={mono}>railway run npm run db:push</code>. The dashboard will fill in automatically once any user signs up.
          </p>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <Heading />
        <p style={{ color: T.textMute, marginTop: 24 }}>Loading dashboard…</p>
      </Shell>
    );
  }

  const peakSignups = Math.max(1, ...data.last30.map(d => d.signups));
  const peakSeconds = Math.max(1, ...data.last30.map(d => d.seconds));

  return (
    <Shell>
      <Heading activeNow={data.kpi.activeNow} />

      {/* TOP KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }} data-stack-mobile="true">
        <Kpi label="Total students" value={data.kpi.totalUsers.toLocaleString()} sub={`${data.kpi.paidUsers.toLocaleString()} paid`} />
        <Kpi label="Active right now" value={data.kpi.activeNow.toLocaleString()} sub="last 60 s" accent={data.kpi.activeNow > 0 ? 'ocean' : 'mute'} live />
        <Kpi label="Eligible (60h+)" value={data.kpi.eligibleCount.toLocaleString()} sub="PSI-ready" />
        <Kpi label="Signups today" value={data.kpi.signupsToday.toLocaleString()} sub={`${data.kpi.signups7d} this week · ${data.kpi.signups30d} this month`} />
        <Kpi label="Hours studied today" value={data.kpi.todayStudyHours.toFixed(1)} sub={`${data.kpi.totalStudyHours.toFixed(1)} h all-time`} />
        <Kpi label="Verified revenue" value={`$${data.kpi.revenueUsd.toLocaleString()}`} sub={data.kpi.paymentCount === 0 ? 'Stripe — no payments yet' : `${data.kpi.paymentCount} payment${data.kpi.paymentCount === 1 ? '' : 's'}`} accent="coral" />
      </div>

      {/* 30-DAY CHART */}
      <div style={{ ...CARD, padding: 24, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Last 30 days</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Signups &amp; study hours</h2>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: T.textDim }}>
            <Legend color={T.ocean} label="Signups" />
            <Legend color={T.coral} label="Hours" />
          </div>
        </div>
        <DailyChart rows={data.last30} peakSignups={peakSignups} peakSeconds={peakSeconds} />
      </div>

      {/* TWO-COLUMN FEEDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18, marginBottom: 22 }} data-stack-mobile="true">
        <Feed title="Recent signups" rows={data.recentSignups} emptyText="No signups yet. They'll appear here in real time." renderSecondary={r => (
          <span style={{ color: r.emailVerifiedAt ? T.green : T.textMute, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
            {r.emailVerifiedAt ? 'verified' : 'unverified'}
          </span>
        )} />
        <Feed title="Recent upgrades" rows={data.recentUpgrades} emptyText="No tier upgrades yet. Stripe wire-up needed." renderSecondary={r => (
          <span style={{ color: T.ocean, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            {r.tier}
          </span>
        )} />
      </div>

      {/* NAV TO SUBPAGES */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/admin/prospects" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Prospects →
        </Link>
        <Link href="/admin/users" style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          All students
        </Link>
        <Link href="/admin/inbox" style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Inbox{data.kpi.unreadInbound > 0 && <span style={{ marginLeft: 8, padding: '2px 8px', background: T.coral, color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{data.kpi.unreadInbound}</span>}
        </Link>
        <Link href="/admin/support" style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Support{data.kpi.openTickets > 0 && <span style={{ marginLeft: 8, padding: '2px 8px', background: T.coral, color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{data.kpi.openTickets}</span>}
        </Link>
        <Link href="/profile" style={{ ...BUTTON_3D.ghost, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          My profile
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function Heading({ activeNow }: { activeNow?: number }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700 }}>Admin · Dashboard</span>
        {typeof activeNow === 'number' && activeNow > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.green, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, animation: 'rfs-pulse 1.5s infinite' }} /> Live
          </span>
        )}
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(38px, 5.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, margin: 0 }}>
        Academy <em style={{ color: T.ocean, fontStyle: 'italic' }}>vitals.</em>
      </h1>
      <style>{`
        @keyframes rfs-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
      `}</style>
    </div>
  );
}

function Kpi({ label, value, sub, accent = 'default', live = false }: { label: string; value: string; sub: string; accent?: 'default' | 'ocean' | 'coral' | 'mute'; live?: boolean }) {
  const accentColor: Record<string, string> = {
    default: T.text,
    ocean: T.ocean,
    coral: T.coral,
    mute: T.textMute,
  };
  return (
    <div style={{ ...CARD, padding: '18px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
        <span>{label}</span>
        {live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'rfs-pulse 1.5s infinite' }} />}
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: accentColor[accent], letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{sub}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      {label}
    </span>
  );
}

function DailyChart({ rows, peakSignups, peakSeconds }: { rows: DayRow[]; peakSignups: number; peakSeconds: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 160, paddingBottom: 24, position: 'relative' }}>
      {rows.map((r, i) => {
        const dayLabel = new Date(r.date).getUTCDate();
        const hoursPct = (r.seconds / peakSeconds) * 100;
        const signupsPct = (r.signups / peakSignups) * 100;
        return (
          <div key={r.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative', height: '100%' }} title={`${r.date}: ${r.signups} signup${r.signups === 1 ? '' : 's'} · ${(r.seconds/3600).toFixed(1)}h studied`}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <div style={{ flex: 1, height: `${hoursPct}%`, background: T.coral, borderRadius: '3px 3px 0 0', minHeight: r.seconds > 0 ? 2 : 0, opacity: 0.85 }} />
              <div style={{ flex: 1, height: `${signupsPct}%`, background: T.ocean, borderRadius: '3px 3px 0 0', minHeight: r.signups > 0 ? 2 : 0 }} />
            </div>
            {(i === 0 || i === rows.length - 1 || i === Math.floor(rows.length / 2)) && (
              <div style={{ position: 'absolute', bottom: -22, fontSize: 10, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Feed<T extends { id: string; name: string; email: string; createdAt: string }>(
  { title, rows, emptyText, renderSecondary }: { title: string; rows: T[]; emptyText: string; renderSecondary: (r: T) => React.ReactNode }
) {
  return (
    <div style={{ ...CARD, padding: '22px 24px' }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 14 }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13, color: T.textMute, margin: 0 }}>{emptyText}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(r => (
            <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: T.text, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {renderSecondary(r)}
                <div style={{ fontSize: 10, color: T.textGhost, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                  {formatDuration((Date.now() - new Date(r.createdAt).getTime()) / 1000, 'short')} ago
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  background: T.bgRaised,
  padding: '1px 6px',
  borderRadius: 4,
};
