import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shivaste.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/super-admin/',
          '/client-portal/',
          '/editor-portal/',
          '/employee-portal/',
          '/studio-8f2k/',
          '/api/',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'CCBot',
          'Applebot-Extended',
        ],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
