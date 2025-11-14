// Homepage

import { db } from '@/lib/db';
import { TopicCard } from '@/components/cards/TopicCard';
import styles from './page.module.css';

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const categories = await db.getTopicsByCategory();

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
        {categories.map((category) => (
          <section key={category.name} className={styles.section}>
            <h2 className={styles.sectionTitle}>{category.name}</h2>
            <p className={styles.sectionSubtitle}>{category.subtitle}</p>

            <div className={styles.grid}>
              {category.topics.map((topic) => (
                <TopicCard key={topic.slug} topic={topic} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
