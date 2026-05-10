import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Ralph Foulger's School of Real Estate · Hawaii's Most Advanced Licensing Program",
  description: "Hawaii's most sophisticated real estate licensing system, built for 2026. 20-chapter PSI-aligned curriculum with full audiobook narration, smart flashcards, math drills, mock exams, and a 24/7 AI Real Estate Tutor.",
  applicationName: "Ralph Foulger's School of Real Estate",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: "Ralph Foulger's",
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Ralph Foulger's School of Real Estate",
    description: "Hawaii's most advanced licensing program. Pass the PSI exam the first time.",
    siteName: "Ralph Foulger's School of Real Estate",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ralph Foulger's School of Real Estate",
    description: "Hawaii's most advanced licensing program. Pass the PSI exam the first time.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fbf7f0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
