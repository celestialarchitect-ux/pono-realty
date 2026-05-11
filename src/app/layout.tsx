import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TimeTracker } from '@/components/TimeTracker';
import { GetStartedFab } from '@/components/GetStartedFab';
import { HapticController } from '@/components/HapticController';

const SITE_URL = process.env.SITE_URL || 'https://ralphfoulger.com';
const SITE_NAME = "Ralph Foulger's Academy of Real Estate";
const DESCRIPTION = "Hawaii's most sophisticated real estate licensing system, built for 2026. 20-chapter PSI-aligned curriculum with full audiobook narration, smart flashcards, math drills, mock exams, and a 24/7 AI Real Estate Tutor.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Hawaii's Most Advanced Licensing Program`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
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
    title: SITE_NAME,
    description: "Hawaii's most advanced real estate licensing program. Pass the PSI exam the first time — guided by a veteran broker with a 54-year Hawaii lineage.",
    siteName: SITE_NAME,
    url: SITE_URL,
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: "Hawaii's most advanced real estate licensing program. Pass the PSI exam the first time.",
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'education',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fbf7f0',
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#school`,
      name: SITE_NAME,
      alternateName: 'Ralph Foulger Real Estate School',
      description: 'Hawaii pre-licensing real estate education. PSI exam preparation built around a 20-chapter curriculum and a 24/7 AI tutor. Plus-tier students who pass the PSI exam receive a complete agent launch bundle: custom Hawaii broker website on their own domain, CRM, lead capture, admin portal, and a 90-day onboarding playbook.',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      image: `${SITE_URL}/opengraph-image`,
      foundingDate: '1972',
      areaServed: {
        '@type': 'State',
        name: 'Hawaii',
      },
      knowsAbout: [
        'Hawaii real estate licensing',
        'PSI salesperson exam preparation',
        'Hawaii Revised Statutes Chapter 467',
        'Real estate continuing education',
      ],
      founder: {
        '@type': 'Person',
        name: 'Ralph S. Foulger',
        honorificSuffix: 'CPM',
        jobTitle: 'Principal Broker & Real Estate Educator',
        description:
          'Hawaii real estate professional licensed since November 1972, Hawaii broker since April 1987. Certified Property Manager (CPM, 1985). State-certified instructor for salesperson, broker, and continuing-education candidates. Past President of the Hawaii Association of Real Estate Schools (HARES, 1994–95), NAIOP Hawaii (1991–92), and IREM Hawaii Chapter (1993). IREM National Faculty Member (1994). Founded Ralph Foulger’s Academy of Real Estate in 1996.',
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Chaminade University of Honolulu',
        },
        hasCredential: [
          { '@type': 'EducationalOccupationalCredential', name: 'Hawaii Real Estate Salesperson License (1972)' },
          { '@type': 'EducationalOccupationalCredential', name: 'Hawaii Real Estate Broker License (1987)' },
          { '@type': 'EducationalOccupationalCredential', name: 'Certified Property Manager (CPM), IREM (1985)' },
          { '@type': 'EducationalOccupationalCredential', name: 'State of Hawaii Certified Real Estate Licensing Instructor (Salesperson, Broker, Continuing Education)' },
        ],
      },
      sameAs: [] as string[],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#school` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Course',
      name: 'Hawaii Real Estate Salesperson Pre-License — Standard',
      description: 'Full 20-chapter PSI-aligned curriculum with audiobook narration, smart flashcards, math drills, mock exams, and 24/7 AI tutor access. Six months of access.',
      provider: { '@id': `${SITE_URL}/#school` },
      educationalCredentialAwarded: 'Hawaii Real Estate Salesperson Pre-License Completion',
      offers: {
        '@type': 'Offer',
        price: '599',
        priceCurrency: 'USD',
        category: 'Education',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing#standard`,
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT60H',
      },
    },
    {
      '@type': 'Course',
      name: 'Hawaii Real Estate Salesperson Pre-License — Plus (with Graduation Website Bundle)',
      description: 'Full Standard curriculum (20-chapter PSI prep, audiobook, AI tutor, mocks) PLUS a custom Hawaii agent website, domain, CRM, lead capture, and admin portal delivered on passing the PSI Hawaii exam. 6 months of course access.',
      provider: { '@id': `${SITE_URL}/#school` },
      educationalCredentialAwarded: 'Hawaii Real Estate Salesperson Pre-License Completion + Agent Website Bundle (on passing)',
      offers: {
        '@type': 'Offer',
        price: '899',
        priceCurrency: 'USD',
        category: 'Education',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing#plus`,
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT60H',
      },
    },
    {
      '@type': 'Service',
      name: 'Solo Hawaii Real Estate Agent Website Build',
      description: 'Standalone build of a custom Hawaii broker website on your own domain (yourname.com) with CRM, lead capture, and admin portal. For already-licensed Hawaii brokers and salespersons. One-time build fee plus monthly hosting / maintenance.',
      provider: { '@id': `${SITE_URL}/#school` },
      serviceType: 'Real Estate Agent Website Build',
      areaServed: { '@type': 'State', name: 'Hawaii' },
      offers: {
        '@type': 'Offer',
        price: '800',
        priceCurrency: 'USD',
        category: 'Professional Service',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/pricing#solo`,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
        <TimeTracker />
        <HapticController />
        {children}
        <GetStartedFab />
      </body>
    </html>
  );
}
