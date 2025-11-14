// Header component matching the HTML design

import Link from 'next/link';
import { db } from '@/lib/db';
import { SearchBar } from './SearchBar';
import styles from './Header.module.css';

export async function Header() {
  // Fetch topics for search
  const topics = await db.getAllTopics();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          BLOGG<span className={styles.logoDot}>.</span>ING
        </Link>
        <div className={styles.searchBar}>
          <SearchBar topics={topics} />
        </div>
      </div>
    </header>
  );
}
