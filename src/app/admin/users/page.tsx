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
  roles: string[];
  createdAt: string;
  lastSeenAt: string;
  passedExamAt: string | null;
  accessExpiresAt: string | null;
  mockExamEarlyAccess: boolean;
  totalSeconds: number;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Full Admin',
  support: 'Support',
  instructor: 'Instructor',
  finance: 'Finance',
  content: 'Content',
};
const ALL_ROLES = Object.keys(ROLE_LABELS);

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
        {/* sidebar replaces header */}
        <main style={{ padding: '48px clamp(14px, 3.5vw, 32px) 64px', maxWidth: 1180, margin: '0 auto', minWidth: 0 }}>
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
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [rows, setRows] = useState(users);
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'standard' | 'plus' | 'solo' | 'admin'>('all');
  useEffect(() => { setRows(users); }, [users]);

  const updateUser = async (u: AdminUserRow, patch: Partial<AdminUserRow>) => {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.message ?? 'Could not update user.');
      return;
    }
    const data = await res.json();
    setRows(curr => curr.map(r => r.id === u.id ? { ...r, ...data.user } : r));
    setEditing(null);

    // Cross-tab signal so any open TierGate-protected page re-validates
    // its auth-me state. Without this a stale tab keeps the old tier
    // decision until reload. TierGate listens on window 'storage'.
    try { window.localStorage.setItem('rfs:auth-bump', String(Date.now())); } catch {/* ignore */}
  };

  // Filter first, then sort. Filtering by name / email / phone covers the
  // common admin search patterns; tierFilter is a separate dropdown.
  const q = query.trim().toLowerCase();
  const filtered = rows.filter(u => {
    if (q) {
      const hay = `${u.name} ${u.email} ${u.roles?.join(' ') ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (tierFilter === 'admin') {
      if (!u.isAdmin) return false;
    } else if (tierFilter !== 'all') {
      if (u.tier !== tierFilter) return false;
    }
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'hours') return b.totalSeconds - a.totalSeconds;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.6, margin: 0 }}>
          {filtered.length === users.length
            ? `${users.length} enrolled student${users.length === 1 ? '' : 's'}.`
            : `${filtered.length} of ${users.length} match the filters.`}
          {' '}Hawaii state law requires 60 hours of pre-license study before exam eligibility.
        </p>
      </div>

      {/* SEARCH + TIER FILTER + SORT — single row on desktop, stacks on mobile */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, email, or role…"
          style={{
            flex: '1 1 280px', minWidth: 200,
            padding: '10px 14px', borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.bgRaised, color: T.text,
            fontFamily: 'inherit', fontSize: 14, lineHeight: 1.3,
          }}
        />
        <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: T.bgRaised, borderRadius: 10, border: `1px solid ${T.border}` }}>
          {(['all', 'free', 'standard', 'plus', 'solo', 'admin'] as const).map(t => (
            <button key={t} onClick={() => setTierFilter(t)} style={{
              padding: '6px 12px', borderRadius: 6,
              background: tierFilter === t ? T.ocean : 'transparent',
              color: tierFilter === t ? '#fff' : T.text,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                  <th style={th}>Roles</th>
                  <th style={th}>Joined</th>
                  <th style={th}>Last seen</th>
                  <th style={{ ...th, textAlign: 'right' }}>Manage</th>
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
                      <td style={td}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {u.isAdmin && <RoleChip label="Full Admin" tone="coral" />}
                          {(u.roles ?? []).filter(r => r !== 'admin').map(r => <RoleChip key={r} label={ROLE_LABELS[r] ?? r} tone="ocean" />)}
                          {!u.isAdmin && (u.roles ?? []).length === 0 && <span style={{ fontSize: 11, color: T.textGhost }}>—</span>}
                        </div>
                      </td>
                      <td style={{ ...td, color: T.textMute, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                      <td style={{ ...td, color: T.textMute, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{formatDuration((Date.now() - new Date(u.lastSeenAt).getTime()) / 1000, 'short')} ago</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Link href={`/admin/users/${u.id}`} style={{ ...BUTTON_3D.ghost, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textDecoration: 'none', display: 'inline-block' }}>View</Link>
                          <button onClick={() => setEditing(u)} style={{ ...BUTTON_3D.secondary, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {editing && <EditUserDrawer user={editing} onClose={() => setEditing(null)} onSave={updateUser} />}
    </>
  );
}

function RoleChip({ label, tone }: { label: string; tone: 'ocean' | 'coral' }) {
  const c = tone === 'coral' ? { bg: 'rgba(232,93,60,0.10)', fg: T.coral } : { bg: 'rgba(20,131,123,0.10)', fg: T.ocean };
  return (
    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: c.bg, color: c.fg, whiteSpace: 'nowrap' }}>{label}</span>
  );
}

function EditUserDrawer({ user, onClose, onSave }: { user: AdminUserRow; onClose: () => void; onSave: (u: AdminUserRow, patch: Partial<AdminUserRow>) => Promise<void> }) {
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [roles, setRoles] = useState<string[]>(user.roles ?? []);
  const [tier, setTier] = useState(user.tier);
  // accessExpiresAt is YYYY-MM-DD for the date input; null means "no expiry".
  const [accessExpiresAt, setAccessExpiresAt] = useState<string>(
    user.accessExpiresAt ? user.accessExpiresAt.slice(0, 10) : ''
  );
  const [mockExamEarlyAccess, setMockExamEarlyAccess] = useState(user.mockExamEarlyAccess ?? false);
  const [saving, setSaving] = useState(false);

  const toggleRole = (role: string) => {
    setRoles(curr => curr.includes(role) ? curr.filter(r => r !== role) : [...curr, role]);
  };

  const save = async () => {
    setSaving(true);
    // accessExpiresAt: empty string → null (clear/lifetime); YYYY-MM-DD → string
    const patch: Partial<AdminUserRow> & { accessExpiresAt?: string | null } = {
      isAdmin, roles, tier,
      accessExpiresAt: accessExpiresAt.trim() === '' ? null : accessExpiresAt,
      mockExamEarlyAccess,
    };
    await onSave(user, patch as Partial<AdminUserRow>);
    setSaving(false);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,26,38,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 18, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ ...CARD, maxWidth: 520, width: '100%', padding: 28, marginTop: 60, borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
              Manage user
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.2, margin: 0 }}>{user.name}</h2>
            <div style={{ fontSize: 12, color: T.textMute, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>{user.email}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 22, color: T.textMute, lineHeight: 1 }}>×</button>
        </div>

        <Section title="Full admin">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <span style={{ fontSize: 14, color: T.text }}>Full admin (every permission, can manage roles)</span>
          </label>
        </Section>

        <Section title="Scoped roles">
          <p style={{ fontSize: 12, color: T.textMute, lineHeight: 1.6, marginBottom: 10, margin: 0 }}>
            Give scoped admin access to staff. Full admins always have all scopes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }} data-stack-mobile="true">
            {ALL_ROLES.filter(r => r !== 'admin').map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', border: `1px solid ${T.border}`, borderRadius: 10, background: roles.includes(r) ? 'rgba(20,131,123,0.06)' : 'transparent' }}>
                <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleRole(r)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{ROLE_LABELS[r]}</div>
                  <div style={{ fontSize: 11, color: T.textMute, marginTop: 1 }}>{ROLE_DESC[r]}</div>
                </div>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Tier (paid status)">
          <select value={tier} onChange={e => setTier(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.text, fontFamily: 'inherit', fontSize: 14 }}>
            <option value="free">Free</option>
            <option value="standard">Standard ($599)</option>
            <option value="plus">Plus ($899)</option>
            <option value="solo">Solo Website ($800)</option>
          </select>
          <p style={{ fontSize: 11, color: T.textGhost, marginTop: 6, lineHeight: 1.5 }}>Manually changing tier here doesn&apos;t charge them. Stripe webhook normally handles this on payment.</p>
        </Section>

        <Section title="Access window">
          <input
            type="date"
            value={accessExpiresAt}
            onChange={e => setAccessExpiresAt(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.white, color: T.text, fontFamily: 'inherit', fontSize: 14 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button onClick={() => {
              const d = new Date(); d.setUTCDate(d.getUTCDate() + 30);
              setAccessExpiresAt(d.toISOString().slice(0, 10));
            }} style={{ ...BUTTON_3D.ghost, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>+30 days</button>
            <button onClick={() => {
              const d = new Date(); d.setUTCDate(d.getUTCDate() + 90);
              setAccessExpiresAt(d.toISOString().slice(0, 10));
            }} style={{ ...BUTTON_3D.ghost, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>+90 days</button>
            <button onClick={() => {
              const d = new Date(); d.setUTCDate(d.getUTCDate() + 180);
              setAccessExpiresAt(d.toISOString().slice(0, 10));
            }} style={{ ...BUTTON_3D.ghost, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>+180 days</button>
            <button onClick={() => setAccessExpiresAt('')} style={{ ...BUTTON_3D.ghost, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit', color: T.coral }}>Clear (lifetime)</button>
          </div>
          <p style={{ fontSize: 11, color: T.textGhost, marginTop: 8, lineHeight: 1.55 }}>
            Empty = no expiration. Use this to comp study time after offline study or extend a window manually. Time gets set to end-of-day UTC.
          </p>
        </Section>

        <Section title="Mock exam early access">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', border: `1px solid ${T.border}`, borderRadius: 10, background: mockExamEarlyAccess ? 'rgba(232,93,60,0.06)' : 'transparent' }}>
            <input
              type="checkbox"
              checked={mockExamEarlyAccess}
              onChange={e => setMockExamEarlyAccess(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
                Unlock the mock exam now
              </div>
              <div style={{ fontSize: 11, color: T.textMute, marginTop: 2, lineHeight: 1.5 }}>
                Bypasses the 60-hour study-time gate. Useful for baseline diagnostic mocks before they start, or for instructor / QA accounts.
              </div>
            </div>
          </label>
        </Section>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={onClose} style={{ ...BUTTON_3D.ghost, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...BUTTON_3D.primary, padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', border: 'none', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

const ROLE_DESC: Record<string, string> = {
  support: 'Triage tickets + inbox',
  instructor: 'View student progress, answer questions',
  finance: 'View revenue + Stripe data',
  content: 'Edit lessons + glossary',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {children}
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
