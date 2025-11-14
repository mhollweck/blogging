'use client';

import { useState, useEffect, useRef } from 'react';
import { ArticleWithSource } from '@/types/database';
import { ArticleCard } from '@/components/cards/ArticleCard';
import styles from './InfiniteArticleList.module.css';

interface InfiniteArticleListProps {
  initialArticles: ArticleWithSource[];
  pageSize?: number;
}

export function InfiniteArticleList({
  initialArticles,
  pageSize = 5
}: InfiniteArticleListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleArticles = initialArticles.slice(0, visibleCount);
  const hasMore = visibleCount < initialArticles.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);

          // Simulate loading delay for better UX
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + pageSize, initialArticles.length));
            setIsLoading(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, pageSize, initialArticles.length]);

  return (
    <>
      <div className={styles.resultsGrid}>
        {visibleArticles.map((article, index) => (
          <ArticleCard key={article.id} article={article} displayNumber={index + 1} />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className={styles.loadMore}>
          {isLoading ? (
            <div className={styles.spinner}>Loading more articles...</div>
          ) : (
            <div className={styles.loadPrompt}>Scroll to load more</div>
          )}
        </div>
      )}

      {!hasMore && initialArticles.length > pageSize && (
        <div className={styles.endMessage}>
          You've reached the end of the list
        </div>
      )}
    </>
  );
}
