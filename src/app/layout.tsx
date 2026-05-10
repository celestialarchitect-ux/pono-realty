import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Ralph Foulger's School of Real Estate · Hawaii's Most Advanced Licensing Program",
  description: "Hawaii's most sophisticated real estate licensing system, built for 2026. 20-chapter PSI-aligned curriculum with full audiobook narration, smart flashcards, math drills, mock exams. Pass first time, then launch your career with our agent lead engine and IDX-enabled website.",
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
