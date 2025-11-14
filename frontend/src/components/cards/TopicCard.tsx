// Topic card for homepage

import Link from 'next/link';
import { HomePageTopic } from '@/types/database';
import styles from './TopicCard.module.css';

interface TopicCardProps {
  topic: HomePageTopic;
}

export function TopicCard({ topic }: TopicCardProps) {
  const lastUpdated = topic.last_updated
    ? new Date(topic.last_updated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Never';

  return (
    <Link href={`/${topic.slug}`} className={styles.card}>
      <div className={styles.header}>
        <span className={styles.count}>{topic.article_count} articles</span>
      </div>
      <h3 className={styles.title}>{topic.display_title}</h3>
      <p className={styles.description}>{topic.description}</p>
      <div className={styles.meta}>
        <div className={styles.updated}>
          <span className={styles.dot}></span>
          <span>Updated {lastUpdated}</span>
        </div>
        <span className={styles.arrow}>→</span>
      </div>
    </Link>
  );
}
