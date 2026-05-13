// ABOUTME: Shared typography styles for the legal pages so the three feel like one document.
// ABOUTME: Imported by /policies/{terms,privacy,disclaimer}/page.tsx.

import { T } from './theme';

export const policyStyles = {
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.22em', color: T.coral, textTransform: 'uppercase' as const, fontWeight: 700, marginBottom: 12 },
  h1: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 5.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.025em', color: T.text, lineHeight: 1.05, marginBottom: 14 },
  intro: { fontSize: 16, color: T.textDim, lineHeight: 1.7, marginBottom: 32 },
  h2: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.015em', marginTop: 32, marginBottom: 12 },
  h3: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: T.text, marginTop: 22, marginBottom: 8 },
  p:  { fontSize: 15, color: T.textDim, lineHeight: 1.75, marginBottom: 14 },
  ul: { fontSize: 15, color: T.textDim, lineHeight: 1.75, marginBottom: 14, paddingLeft: 20 },
  li: { marginBottom: 6 },
  effective: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.textMute, letterSpacing: '0.06em', marginTop: 40, padding: '14px 0 0', borderTop: `1px solid ${T.border}` },
  strong: { color: T.text, fontWeight: 700 },
};
