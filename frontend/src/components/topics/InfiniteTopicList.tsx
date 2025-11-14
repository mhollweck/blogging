'use client';

import { useState, useEffect, useRef } from 'react';
import { HomePageTopic } from '@/types/database';
import { TopicCard } from '@/components/cards/TopicCard';
import styles from './InfiniteTopicList.module.css';

interface InfiniteTopicListProps {
  initialTopics: HomePageTopic[];
  pageSize?: number;
}

export function InfiniteTopicList({
  initialTopics,
  pageSize = 9
}: InfiniteTopicListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleTopics = initialTopics.slice(0, visibleCount);
  const hasMore = visibleCount < initialTopics.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);

          // Simulate loading delay for better UX
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + pageSize, initialTopics.length));
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
  }, [hasMore, isLoading, pageSize, initialTopics.length]);

  return (
    <>
      <div className={styles.topicGrid}>
        {visibleTopics.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className={styles.loadMore}>
          {isLoading ? (
            <div className={styles.spinner}>
              <div className={styles.spinnerIcon}></div>
              <span>Loading more topics...</span>
            </div>
          ) : (
            <div className={styles.loadPrompt}>Scroll to load more</div>
          )}
        </div>
      )}

      {!hasMore && initialTopics.length > pageSize && (
        <div className={styles.endMessage}>
          You've reached the end of the list
        </div>
      )}
    </>
  );
}
