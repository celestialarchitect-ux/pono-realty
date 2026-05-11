'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import { formatDuration, hoursDecimal, STATE_LAW_HOURS_REQUIRED } from '@/lib/time-tracking';

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  tier: string;
  isAdmin: boolean;
  createdAt: string;
  lastSeenAt: string;
  passedExamAt: string | null;
  totalSeconds: number;
}

type AuthState =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }      // 503 — no DB/SESSION_SECRET
  | { kind: 'unauthenticated' }   // 401 — needs login
  | { kind: 'forbidden' }         // 403 — logged in but not admin
  | { kind: 'authorized'; users: AdminUserRow[] };

export default function AdminUsersPage() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ kind: 'loading' });
  const [sortBy, setSortBy] = useState<'recent' | 'hours' | 'name'>('recent');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        if (res.status === 503) return setState({ kind: 'unconfigured' });
        if (res.status === 401) return setState({ kind: 'unauthenticated' });
        if (res.status === 403) return setState({ kind: 'forbidden' });
        if (res.ok) {
          const data = await res.json();
          setState({ kind: 'authorized', users: data.users ?? [] });
          return;
        }
        setState({ kind: 'unconfigured' });
      } catch {
        setState({ kind: 'unconfigured' });
      }
    };
    load();
  }, []);

  const onLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {/* ignore */}
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '48px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 12 }}>
            Admin · Users
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
            Student profiles &amp; <em style={{ color: T.ocean, fontStyle: 'italic' }}>study-hour audit.</em>
          </h1>

          {state.kind === 'loading' && (
            <p style={{ fontSize: 15, color: T.textMute }}>Loading users…</p>
          )}

          {state.kind === 'unconfigured' && (
            <UnconfiguredNotice />
          )}

          {state.kind === 'unauthenticated' && (
            <NeedsLogin />
          )}

          {state.kind === 'forbidden' && (
            <NotAdmin onLogout={onLogout} />
          )}

          {state.kind === 'authorized' && (
            <Table users={state.users} sortBy={sortBy} setSortBy={setSortBy} onLogout={onLogout} />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function UnconfiguredNotice() {
  return (
    <div style={{ ...CARD, padding: 28, marginTop: 24, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
        Backend not yet provisioned
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 12 }}>
        Database + auth env vars are missing.
      </h2>
      <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, marginBottom: 12 }}>
        The admin user lookup is fully built and will activate the moment three env vars are set on this Railway service:
      </p>
      <ol style={{ paddingLeft: 22, margin: 0, fontSize: 14, color: T.textDim, lineHeight: 1.9 }}>
        <li>
          <code style={mono}>DATABASE_URL</code> &mdash; add a Postgres database to the Railway project (one-click). DATABASE_URL is injected automatically.
        </li>
        <li>
          <code style={mono}>SESSION_SECRET</code> &mdash; any random 32+ character string. Used to sign session cookies.
        </li>
        <li>
          <code style={mono}>ADMIN_EMAILS</code> &mdash; comma-separated list of emails that should be promoted to admin on signup (e.g. <code style={mono}>zach@trinitycommand.io,ralph@…</code>).
        </li>
      </ol>
      <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, marginTop: 14, marginBottom: 0 }}>
        After the env vars are set and Postgres is wired, run <code style={mono}>railway run npm run db:push</code> once to create the tables. Then sign up with an email from <code style={mono}>ADMIN_EMAILS</code> and reload this page.
      </p>
    </div>
  );
}

function NeedsLogin() {
  return (
    <div style={{ ...CARD, padding: 28, marginTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 12 }}>Admin login required.</h2>
      <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, marginBottom: 18 }}>
        This area is restricted to academy staff. Sign in with an admin account to continue.
      </p>
      <Link href="/login" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
        Log in →
      </Link>
    </div>
  );
}

function NotAdmin({ onLogout }: { onLogout: () => void }) {
  return (
    <div style={{ ...CARD, padding: 28, marginTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 12 }}>Not authorized.</h2>
      <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, marginBottom: 18 }}>
        Your account is signed in but doesn&apos;t have admin permission. If this is a mistake, ask whoever manages the academy to add your email to <code style={mono}>ADMIN_EMAILS</code> on Railway, then sign out and back in.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href="/profile" style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
          Back to my profile
        </Link>
        <button onClick={onLogout} style={{ ...BUTTON_3D.secondary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>
          Log out
        </button>
      </div>
    </div>
  );
}

function Table({ users, sortBy, setSortBy, onLogout }: { users: AdminUserRow[]; sortBy: 'recent' | 'hours' | 'name'; setSortBy: (s: 'recent' | 'hours' | 'name') => void; onLogout: () => void }) {
  const sorted = [...users].sort((a, b) => {
    if (sortBy === 'hours') return b.totalSeconds - a.totalSeconds;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.6, margin: 0 }}>
          {users.length} enrolled students. Hawaii state law requires 60 hours of pre-license study before exam eligibility.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.18em', color: T.textMute, textTransform: 'uppercase', fontWeight: 600 }}>Sort</span>
          {(['recent', 'hours', 'name'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                ...(sortBy === s ? BUTTON_3D.primary : BUTTON_3D.secondary),
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'inherit',
                border: sortBy === s ? 'none' : undefined,
              }}
            >
              {s === 'recent' ? 'Recent' : s === 'hours' ? 'Hours' : 'Name'}
            </button>
          ))}
          <button onClick={onLogout} style={{ ...BUTTON_3D.ghost, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Log out</button>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{ ...CARD, padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: T.textMute, margin: 0 }}>No students enrolled yet. Their profiles will appear here automatically as they sign up.</p>
        </div>
      ) : (
        <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bgElevated }}>
                  <th style={th}>Student</th>
                  <th style={{ ...th, textAlign: 'right' }}>Hours / 60</th>
                  <th style={{ ...th, textAlign: 'center' }}>Status</th>
                  <th style={th}>Tier</th>
                  <th style={th}>Joined</th>
                  <th style={th}>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(u => {
                  const hours = hoursDecimal(u.totalSeconds);
                  const unlocked = u.totalSeconds >= STATE_LAW_HOURS_REQUIRED * 3600;
                  return (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={td}>
                        <div style={{ fontWeight: 600, color: T.text, marginBottom: 2 }}>{u.name}{u.isAdmin && <span style={{ marginLeft: 8, fontSize: 10, color: T.coral, letterSpacing: '0.15em' }}>ADMIN</span>}</div>
                        <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace" }}>{u.email}</div>
                      </td>
                      <td style={{ ...td, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                        <span style={{ color: unlocked ? T.green : T.text, fontWeight: 700 }}>{hours.toFixed(1)}</span>
                        <span style={{ color: T.textMute }}> / 60</span>
                        <div style={{ marginTop: 4, height: 4, background: T.bgRaised, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, (u.totalSeconds / (STATE_LAW_HOURS_REQUIRED * 3600)) * 100)}%`,
                            background: unlocked ? T.green : T.ocean,
                          }} />
                        </div>
                      </td>
                      <td style={{ ...td, textAlign: 'center' }}>
                        <span style={{
                          fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase',
                          padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap',
                          background: unlocked ? 'rgba(45,134,89,0.12)' : 'rgba(20,131,123,0.10)',
                          color: unlocked ? T.green : T.ocean,
                        }}>
                          {unlocked ? 'Eligible' : 'In progress'}
                        </span>
                      </td>
                      <td style={{ ...td, textTransform: 'capitalize' }}>{u.tier}</td>
                      <td style={{ ...td, color: T.textMute, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                      <td style={{ ...td, color: T.textMute, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{formatDuration((Date.now() - new Date(u.lastSeenAt).getTime()) / 1000, 'short')} ago</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  background: T.bgRaised,
  padding: '1px 6px',
  borderRadius: 4,
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: T.textMute,
  fontWeight: 700,
};

const td: React.CSSProperties = {
  padding: '14px 14px',
  verticalAlign: 'top',
};
