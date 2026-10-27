import { MetadataRoute } from 'next';
import { serverFetchAPI } from '@/lib/server-api-client';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shivaste.com';
  
  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/talent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamically add portfolio slugs
  try {
    const data = await serverFetchAPI(`/cms/portfolio`, { next: { revalidate: 3600 } });
    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        sitemapData.push({
          url: `${baseUrl}/projects/${item.slug}`,
          lastModified: new Date(item.updatedAt || item.createdAt),
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      });
    } else if (data && data.data && Array.isArray(data.data)) {
       data.data.forEach((item: any) => {
        sitemapData.push({
          url: `${baseUrl}/projects/${item.slug}`,
          lastModified: new Date(item.updatedAt || item.createdAt),
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching portfolio for sitemap:', error);
  }

  // Dynamically add blog slugs
  try {
    const data = await serverFetchAPI(`/cms/blog`, { next: { revalidate: 3600 } });
    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        sitemapData.push({
          url: `${baseUrl}/blog/${item.slug}`,
          lastModified: new Date(item.updatedAt || item.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    } else if (data && data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        sitemapData.push({
          url: `${baseUrl}/blog/${item.slug}`,
          lastModified: new Date(item.updatedAt || item.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching blog for sitemap:', error);
  }


  // Dynamically add talent IDs
  try {
    const data = await serverFetchAPI('/talent', { next: { revalidate: 3600 } });
    if (data && Array.isArray(data)) {
      data.forEach((talent: any) => {
        sitemapData.push({
          url: `${baseUrl}/talent/${talent.id}`,
          lastModified: new Date(talent.updatedAt || talent.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    } else if (data && data.data && Array.isArray(data.data)) {
      data.data.forEach((talent: any) => {
        sitemapData.push({
          url: `${baseUrl}/talent/${talent.id}`,
          lastModified: new Date(talent.updatedAt || talent.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching talent for sitemap:', error);
  }

  return sitemapData;
}
