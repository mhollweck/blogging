// Header component matching the HTML design

import Link from 'next/link';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          BLOGG<span className={styles.logoDot}>.</span>ING
        </Link>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search topics, keywords, or questions..."
            aria-label="Search"
          />
        </div>
      </div>
    </header>
  );
}
