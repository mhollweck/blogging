// Dynamic topic page

import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { seoGenerator } from '@/lib/seo';
import { InfiniteArticleList } from '@/components/articles/InfiniteArticleList';
import styles from './page.module.css';

export const revalidate = 3600; // Revalidate every hour

interface TopicPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const data = await db.getTopicPageData(params.slug);

  if (!data) {
    return {
      title: 'Topic Not Found',
    };
  }

  const seoData = seoGenerator.generate({
    topic_slug: data.keyword.slug,
    display_title: data.keyword.display_title,
    page_description: data.keyword.description,
    search_query: data.keyword.search_query,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogg.ing';
  const canonicalUrl = `${baseUrl}/${data.keyword.slug}`;

  return {
    title: seoData.title_tag,
    description: seoData.meta_description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoData.title_tag,
      description: seoData.meta_description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'BLOGG.ING',
      locale: 'en_US',
      images: [
        {
          url: `${baseUrl}/og/${data.keyword.slug}.png`,
          width: 1200,
          height: 630,
          alt: data.keyword.display_title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title_tag,
      description: seoData.meta_description,
      images: [`${baseUrl}/og/${data.keyword.slug}.png`],
    },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  // Check if this slug is a variant and redirect to canonical
  const canonicalSlug = await db.getCanonicalSlug(params.slug);
  if (canonicalSlug) {
    redirect(`/${canonicalSlug}`);
  }

  // Load topic data with canonical slug
  const data = await db.getTopicPageData(params.slug);

  if (!data) {
    notFound();
  }

  const { keyword, articles, latest_crawl_date } = data;

  const lastUpdated = keyword.last_crawled_at
    ? new Date(keyword.last_crawled_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never';

  // Generate SEO metadata for JSON-LD
  const seoData = seoGenerator.generate({
    topic_slug: keyword.slug,
    display_title: keyword.display_title,
    page_description: keyword.description,
    search_query: keyword.search_query,
  });

  return (
    <>
      {/* JSON-LD Schema - WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: seoData.schema_webpage }}
      />

      {/* JSON-LD Schema - FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: seoData.schema_faq }}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1>{keyword.display_title} – Curated Daily</h1>
          <p className={styles.heroSubtitle}>{seoData.hero_paragraph}</p>

          <div className={styles.heroMeta}>
            <span className={styles.updateBadge}>Last updated: {lastUpdated}</span>
            <span className={styles.heroStats}>
              <span>{articles.length} curated articles</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Articles Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Top Articles Right Now</h2>
            </div>
            <p className={styles.sectionSubtitle}>
              The highest-ranking, most comprehensive articles from expert bloggers.
            </p>

            {articles.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No articles available yet. Check back soon!</p>
              </div>
            ) : (
              <InfiniteArticleList initialArticles={articles} pageSize={5} />
            )}
          </div>

        </div>
      </div>
    </>
  );
}
