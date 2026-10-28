import type { NextConfig } from "next";

// `output: 'standalone'` needs filesystem symlinks. On Windows without Developer
// Mode that throws EPERM during build. Keep standalone for Linux/CI/Docker;
// local Windows can force it with FORCE_STANDALONE=1.
const useStandalone =
  process.env.FORCE_STANDALONE === '1' ||
  process.env.VERCEL === '1' ||
  process.platform !== 'win32';

const nextConfig: NextConfig = {
  ...(useStandalone ? { output: 'standalone' as const } : {}),
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  experimental: {
    workerThreads: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },


  transpilePackages: ['@mdms/types', '@mdms/design-tokens'],
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/super_admin',
        destination: '/super-admin',
        permanent: false,
      },
      {
        source: '/super_admin/:path*',
        destination: '/super-admin/:path*',
        permanent: false,
      },
      {
        source: '/portfolio',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/portfolio/:path*',
        destination: '/projects/:path*',
        permanent: true,
      },
      {
        source: '/casting-calls',
        destination: '/casting',
        permanent: true,
      },
      {
        source: '/casting-calls/:path*',
        destination: '/casting',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const rawPublic = process.env.NEXT_PUBLIC_API_URL || '';
    const publicApiUrl = rawPublic.includes('vercel.app') || rawPublic.includes('localhost:3000') || rawPublic.includes('mpproductions')
      ? ''
      : rawPublic.replace(/\/api\/v1\/?$/, '');
    const apiBase = process.env.API_URL || publicApiUrl || 'https://mp-backend-api.onrender.com';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/api/v1/:path*`,
      },
      // Secret admin base paths — the browser shows /studio-8f2k while the
      // real /super-admin and /admin panels are served internally. The more
      // specific /mgmt (Admin) rules MUST precede the generic Super Admin ones.
      {
        source: '/studio-8f2k/mgmt',
        destination: '/admin',
      },
      {
        source: '/studio-8f2k/mgmt/:path*',
        destination: '/admin/:path*',
      },
      {
        source: '/studio-8f2k',
        destination: '/super-admin',
      },
      {
        source: '/studio-8f2k/:path*',
        destination: '/super-admin/:path*',
      },
    ];
  },
};

export default nextConfig;
