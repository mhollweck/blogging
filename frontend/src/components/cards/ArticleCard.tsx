// Article card for topic pages

import { ArticleWithSource } from '@/types/database';
import { formatRelativeDate } from '@/lib/date-utils';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  article: ArticleWithSource;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const displayText = article.source.summary_short || article.snippet || '';
  const publishedDate = formatRelativeDate(article.source.published_at);

  return (
    <a
      href={article.source.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={styles.card}
    >
      <div className={styles.header}>
        <span className={styles.rank}>{article.position}</span>
        <span className={styles.domain}>{article.source.domain}</span>
      </div>

      <h3 className={styles.title}>{article.title}</h3>

      {displayText && <p className={styles.snippet}>{displayText}</p>}

      <div className={styles.footer}>
        <span className={styles.meta}>
          {publishedDate ? (
            <>
              <span className={styles.publishDate}>{publishedDate}</span>
              <span className={styles.separator}>•</span>
              <span>{article.source.domain}</span>
            </>
          ) : (
            <span>{article.source.domain}</span>
          )}
        </span>
        <button className={styles.openBtn}>Open original →</button>
      </div>
    </a>
  );
}
