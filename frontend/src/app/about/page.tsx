// About Page

import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About – BLOGG.ING',
  description: 'Learn about BLOGG.ING - your source for curated, auto-updated collections of expert articles.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>About BLOGG.ING</h1>
        <p className={styles.lastUpdated}>Curating the best content from the internet</p>

        <section>
          <h2>What is BLOGG.ING?</h2>
          <p>
            BLOGG.ING is a content aggregation platform that automatically curates the
            highest-quality articles on topics you care about. Every page is refreshed
            daily with the best content from across the web.
          </p>
        </section>

        <section>
          <h2>How It Works</h2>
          <h3>Automated Curation</h3>
          <p>
            Our system continuously scans the internet for high-quality content. Using
            advanced algorithms and search engine data, we identify and rank the most
            valuable articles on each topic.
          </p>

          <h3>Daily Updates</h3>
          <p>
            Each topic page is refreshed every morning with the latest top-ranking
            content. You always get the most current and relevant articles without
            having to search multiple sources.
          </p>

          <h3>Quality Sources</h3>
          <p>
            We prioritize content from authoritative blogs, expert writers, and trusted
            publications. Our AI-powered summarization helps you quickly understand what
            each article covers.
          </p>
        </section>

        <section>
          <h2>Why BLOGG.ING?</h2>
          <ul>
            <li><strong>Save Time:</strong> No need to search multiple sites or filter through low-quality content</li>
            <li><strong>Stay Current:</strong> Automatically updated daily with fresh, relevant articles</li>
            <li><strong>Discover Quality:</strong> Find the best writing from experts and trusted sources</li>
            <li><strong>No Account Needed:</strong> Free to use, no registration required</li>
          </ul>
        </section>

        <section>
          <h2>Our Mission</h2>
          <p>
            We believe great content deserves to be discovered. BLOGG.ING exists to
            connect readers with the best writing on the internet, making quality
            information accessible and easy to find.
          </p>
        </section>

        <section>
          <h2>Technology</h2>
          <p>
            BLOGG.ING uses a combination of search engine data analysis, AI-powered
            content summarization, and automated crawling to curate and present content.
            Our infrastructure is built on modern web technologies including Next.js,
            Supabase, and Cloudflare Workers.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Have questions or feedback? We'd love to hear from you at{' '}
            <a href="mailto:maria@asobi-labs.com">maria@asobi-labs.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
