import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/design-review', destination: '/design-review/index.html' },
      { source: '/design-review/', destination: '/design-review/index.html' },
    ];
  },
};

export default nextConfig;
