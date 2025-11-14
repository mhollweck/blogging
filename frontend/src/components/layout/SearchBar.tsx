'use client';

// Search bar component with client-side interactivity

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  topics: Array<{
    slug: string;
    display_title: string;
    description: string;
  }>;
}

export function SearchBar({ topics }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof topics>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = topics.filter(
      (topic) =>
        topic.display_title.toLowerCase().includes(searchQuery) ||
        topic.description.toLowerCase().includes(searchQuery) ||
        topic.slug.toLowerCase().includes(searchQuery)
    );

    setResults(filtered.slice(0, 5));
    setShowResults(true);
  }, [query, topics]);

  const handleSelect = (slug: string) => {
    setQuery('');
    setShowResults(false);
    router.push(`/${slug}`);
  };

  const handleBlur = () => {
    // Delay to allow click on result
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        placeholder="Search topics, keywords, or questions..."
        aria-label="Search"
        className={styles.searchInput}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setShowResults(true)}
        onBlur={handleBlur}
      />

      {showResults && results.length > 0 && (
        <div className={styles.results}>
          {results.map((topic) => (
            <button
              key={topic.slug}
              className={styles.resultItem}
              onClick={() => handleSelect(topic.slug)}
            >
              <div className={styles.resultTitle}>{topic.display_title}</div>
              <div className={styles.resultDescription}>{topic.description}</div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && (
        <div className={styles.results}>
          <div className={styles.noResults}>No topics found</div>
        </div>
      )}
    </div>
  );
}
