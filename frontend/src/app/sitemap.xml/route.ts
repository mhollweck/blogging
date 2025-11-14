// Sitemap XML generator

import { db } from '@/lib/db';

export async function GET() {
  const topics = await db.getAllTopics();

  const baseUrl = 'https://blogg.ing';

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
${topics
  .map(
    (topic) => `  <url>
    <loc>${baseUrl}/${topic.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    ${topic.last_updated ? `<lastmod>${new Date(topic.last_updated).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
