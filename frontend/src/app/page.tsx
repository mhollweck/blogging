// Homepage

import { db } from '@/lib/db';
import { InfiniteTopicList } from '@/components/topics/InfiniteTopicList';
import styles from './page.module.css';

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const topics = await db.getAllTopics();

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1>Curated Daily from the Best Writing on the Internet</h1>
          <p className={styles.heroSubtitle}>
            Auto-updated collections of expert articles on any topic
          </p>
          <p className={styles.heroDescription}>
            Every page is refreshed each morning with the highest-ranking content
            from the best blogs and sources.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.container}>
        {topics.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No topics available yet. Check back soon!</p>
          </div>
        ) : (
          <InfiniteTopicList initialTopics={topics} pageSize={9} />
        )}
      </div>
    </>
  );
}
