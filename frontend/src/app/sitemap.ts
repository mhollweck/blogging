// Dynamic sitemap generation

import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogg.ing';

  // Fetch all topics from database
  const topics = await db.getAllTopics();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ];

  // Dynamic topic pages - highest priority
  const topicPages: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${baseUrl}/${topic.slug}`,
    lastModified: topic.last_crawled_at ? new Date(topic.last_crawled_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...staticPages, ...topicPages];
}
