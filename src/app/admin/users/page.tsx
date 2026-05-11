'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { T, CARD, BUTTON_3D } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';
import {
  loadLog,
  progressTo60,
  formatDuration,
  hoursDecimal,
  type TimeLog,
} from '@/lib/time-tracking';

// Admin user lookup. Currently shows the local device's profile only because
// the multi-user database has not been provisioned yet (no DATABASE_URL).
// When the backend is wired, this page will list all enrolled students and
// link to each user's full activity log.

export default function AdminUsersPage() {
  const [log, setLog] = useState<TimeLog | null>(null);

  useEffect(() => {
    setLog(loadLog());
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />

        <main style={{ padding: '48px 32px 64px', maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 12 }}>
            Admin · Users
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(38px, 5.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 16 }}>
            Student profiles &amp; <em style={{ color: T.ocean, fontStyle: 'italic' }}>study-hour audit.</em>
          </h1>
          <p style={{ fontSize: 16, color: T.textDim, lineHeight: 1.7, maxWidth: 760, marginBottom: 28 }}>
            Look up any student to see exact time spent across every section of the platform. Hawaii state law requires 60 hours of pre-license study before exam eligibility; this is the source-of-truth view used to certify completion.
          </p>

          {/* PROVISIONING NOTICE */}
          <div style={{ ...CARD, padding: 28, marginBottom: 28, borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: T.coral }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
              Backend not yet provisioned
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 12 }}>
              This view currently shows your device only.
            </h2>
            <p style={{ fontSize: 14, color: T.textDim, lineHeight: 1.7, marginBottom: 12 }}>
              Multi-student admin lookup needs three things wired before it can show every enrolled candidate:
            </p>
            <ol style={{ paddingLeft: 22, margin: 0, fontSize: 14, color: T.textDim, lineHeight: 1.85 }}>
              <li><code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: T.bgRaised, padding: '1px 6px', borderRadius: 4 }}>DATABASE_URL</code> &mdash; Postgres on Railway (one click on the service) or external host.</li>
              <li><code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: T.bgRaised, padding: '1px 6px', borderRadius: 4 }}>ADMIN_TOKEN</code> &mdash; bearer secret protecting this route, set in Railway env vars.</li>
              <li>Real auth on <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: T.bgRaised, padding: '1px 6px', borderRadius: 4 }}>/signup</code> &amp; <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: T.bgRaised, padding: '1px 6px', borderRadius: 4 }}>/login</code> so each student&apos;s timer writes to a server-side record keyed by user ID.</li>
            </ol>
            <p style={{ fontSize: 13, color: T.textMute, lineHeight: 1.7, marginTop: 14, marginBottom: 0 }}>
              Once those are in place, this page becomes a sortable table of every student with their device(s), total hours, eligibility status, and a drill-down button into their full activity log.
            </p>
          </div>

          {/* THIS DEVICE'S PROFILE — RENDERED LIKE A USER CARD */}
          {log && (() => {
            const p = progressTo60(log.totalSeconds);
            const buckets = Object.entries(log.byBucket).sort((a, b) => b[1] - a[1]).filter(([, s]) => s > 0);
            return (
              <div style={{ ...CARD, padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                      Device profile (preview)
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.01em', marginBottom: 4 }}>
                      Local Study Session
                    </h3>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textMute, letterSpacing: '0.04em' }}>
                      {log.deviceId} · Since {new Date(log.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{
                    background: p.unlocked ? 'rgba(45,134,89,0.12)' : 'rgba(193,70,40,0.10)',
                    color: p.unlocked ? T.green : T.coral,
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}>
                    {p.unlocked ? '✓ Eligible (60 h+)' : `${(60 - p.hours).toFixed(1)} h remaining`}
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>{hoursDecimal(log.totalSeconds).toFixed(1)} h / 60 h</span>
                    <span style={{ color: T.textMute, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>{p.pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 10, background: T.bgRaised, borderRadius: 999, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                    <div style={{
                      height: '100%', width: `${p.pct}%`,
                      background: p.unlocked
                        ? `linear-gradient(90deg, ${T.green} 0%, #1f6b46 100%)`
                        : `linear-gradient(90deg, ${T.ocean} 0%, ${T.oceanDark} 100%)`,
                      transition: 'width 0.4s ease-out',
                    }} />
                  </div>
                </div>

                {/* SECTION BREAKDOWN */}
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: T.textMute, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
                    Activity by section
                  </div>
                  {buckets.length === 0 ? (
                    <p style={{ fontSize: 13, color: T.textMute, margin: 0 }}>No activity logged on this device yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: T.textMute, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Section</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', color: T.textMute, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Time</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', color: T.textMute, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buckets.map(([key, sec]) => {
                          const pct = log.totalSeconds > 0 ? (sec / log.totalSeconds) * 100 : 0;
                          return (
                            <tr key={key} style={{ borderBottom: `1px solid ${T.border}` }}>
                              <td style={{ padding: '10px 0', color: T.text, fontWeight: 500, textTransform: 'capitalize' }}>{key}</td>
                              <td style={{ padding: '10px 0', textAlign: 'right', color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{formatDuration(sec, 'short')}</td>
                              <td style={{ padding: '10px 0', textAlign: 'right', color: T.ocean, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{pct.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href="/profile" style={{ ...BUTTON_3D.secondary, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none' }}>
                    View as student
                  </Link>
                </div>
              </div>
            );
          })()}
        </main>

        <Footer />
      </div>
    </div>
  );
}
