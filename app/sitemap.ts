import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/site-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const lastModified = new Date('2026-11-25T00:00:00Z');

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/work`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
