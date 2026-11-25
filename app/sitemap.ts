import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/site-content';
import { SERVICE_LANDING_PAGES, getCaseStudyPages } from '@/lib/seo-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const lastModified = new Date('2026-11-25T00:00:00Z');

  const serviceRoutes: MetadataRoute.Sitemap = SERVICE_LANDING_PAGES.map(
    (svc) => ({
      url: `${baseUrl}/services/${svc.slug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    }),
  );

  const workRoutes: MetadataRoute.Sitemap = getCaseStudyPages().map((cs) => ({
    url: `${baseUrl}/work/${cs.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

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
    ...serviceRoutes,
    {
      url: `${baseUrl}/work`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...workRoutes,
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
