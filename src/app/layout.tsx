import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Ralph's Real Estate Academy · Hawaii Real Estate Exam Prep",
  description: 'The most complete Hawaii real estate licensing prep system. 20-chapter curriculum, mock exams, flashcards, glossary — built around the official PSI Hawaii exam blueprint.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fbf7f0" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
