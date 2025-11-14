// Dynamic topic page

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { seoGenerator } from '@/lib/seo';
import { ArticleCard } from '@/components/cards/ArticleCard';
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

  return {
    title: seoData.title_tag,
    description: seoData.meta_description,
    openGraph: {
      title: seoData.title_tag,
      description: seoData.meta_description,
      type: 'website',
    },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
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
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: seoData.schema_webpage }}
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
              <div className={styles.resultsGrid}>
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
