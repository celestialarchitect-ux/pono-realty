// ABOUTME: Shared shell for all /policies/* pages (terms, privacy, disclaimer).
// ABOUTME: Wraps content in the public site Header + Footer; constrains line length for readability.

import { T } from '@/lib/theme';
import { Header, Footer, Backgrounds } from '@/components/Shell';

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Backgrounds />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Header />
        <main style={{ padding: '64px 32px 80px', maxWidth: 760, margin: '0 auto' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
