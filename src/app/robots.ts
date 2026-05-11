import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || 'https://ralphfoulger.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/dashboard', '/login', '/signup', '/verify-email', '/reset-password', '/checkout'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
