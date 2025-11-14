// Footer component

import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.note}>
          <p>
            <strong>Every page is auto-curated daily.</strong>
          </p>
          <p>
            We don't host content — we link to original creators and help readers
            discover great writing.
          </p>
        </div>
        <div className={styles.links}>
          <Link href="/about">About BLOGG.ING</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
