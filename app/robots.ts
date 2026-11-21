import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/site-content';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/team', '/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
