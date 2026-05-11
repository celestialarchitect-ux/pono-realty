import type { NextConfig } from 'next';

const securityHeaders = [
  // HTTPS only forever
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Legacy XSS filter (still respected by some browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Tight referrer policy — share origin, never path
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Lock down sensitive APIs we don't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // CSP — permissive enough for Google Fonts + Unsplash hero image + inline styles (we use them heavily)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "connect-src 'self'",
      "media-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/design-review', destination: '/design-review/index.html' },
      { source: '/design-review/', destination: '/design-review/index.html' },
      { source: '/example-website', destination: '/example-website.html' },
      { source: '/example-website/', destination: '/example-website.html' },
    ];
  },
  async redirects() {
    return [
      // www → apex canonical (SEO + single source of truth for cookies)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ralphfoulger.com' }],
        destination: 'https://ralphfoulger.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
