// Article card for topic pages

import { ArticleWithSource } from '@/types/database';
import { formatRelativeDate } from '@/lib/date-utils';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  article: ArticleWithSource;
  displayNumber?: number;
}

export function ArticleCard({ article, displayNumber }: ArticleCardProps) {
  const displayText = article.source.summary_short || article.snippet || '';
  const publishedDate = formatRelativeDate(article.source.published_at);

  // Format the summary text to handle bullet points
  const formatSummary = (text: string) => {
    // Split by newlines and convert bullet points to list items
    const lines = text.split('\n').filter(line => line.trim());

    // Check if this looks like a bulleted list (starts with -, *, •, or numbers)
    const hasBullets = lines.some(line => /^[\-\*\•\d\.]\s/.test(line.trim()));

    if (hasBullets) {
      return (
        <ul className={styles.bulletList}>
          {lines.map((line, idx) => {
            const cleanLine = line.replace(/^[\-\*\•\d\.]\s*/, '').trim();
            return cleanLine ? <li key={idx}>{cleanLine}</li> : null;
          })}
        </ul>
      );
    }

    return <p className={styles.snippet}>{text}</p>;
  };

  return (
    <a
      href={article.source.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={styles.card}
    >
      <div className={styles.header}>
        <span className={styles.rank}>{displayNumber ?? article.position}</span>
        <span className={styles.domain}>{article.source.domain}</span>
      </div>

      <h3 className={styles.title}>{article.title}</h3>

      {displayText && formatSummary(displayText)}

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
