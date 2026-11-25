import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/site-content';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/team', '/thank-you', '/api/admin/', '/api/contact'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
