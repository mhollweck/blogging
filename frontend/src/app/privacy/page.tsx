// Privacy Policy Page

import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy – BLOGG.ING',
  description: 'Privacy policy for BLOGG.ING - how we handle your data and protect your privacy.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: November 14, 2025</p>

        <section>
          <h2>Overview</h2>
          <p>
            BLOGG.ING is a content aggregation service that curates links to articles
            from across the web. We are committed to protecting your privacy.
          </p>
        </section>

        <section>
          <h2>Data We Collect</h2>
          <h3>No Account Required</h3>
          <p>
            BLOGG.ING does not require you to create an account or provide any personal
            information to use our service.
          </p>

          <h3>Analytics Data</h3>
          <p>
            We use Plausible Analytics, a privacy-friendly analytics service, to understand
            how visitors use our site. Plausible collects anonymous usage data including:
          </p>
          <ul>
            <li>Pages visited</li>
            <li>Referring websites</li>
            <li>Browser type and version</li>
            <li>Device type</li>
            <li>General geographic location (country/city level)</li>
            <li>Outbound link clicks (when you click to read an article)</li>
          </ul>
          <p>
            This data is aggregated and anonymous. Plausible does not use cookies, does not
            track individual users across sessions, and is fully GDPR compliant. Learn more at{' '}
            <a href="https://plausible.io/privacy-focused-web-analytics" target="_blank" rel="noopener noreferrer">
              plausible.io/privacy-focused-web-analytics
            </a>
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            BLOGG.ING does not use cookies. Our analytics solution (Plausible) is
            cookie-free and does not store any data in your browser.
          </p>
        </section>

        <section>
          <h2>Third-Party Links</h2>
          <p>
            BLOGG.ING contains links to external websites. We are not responsible for the
            privacy practices of these sites. We encourage you to review the privacy
            policies of any site you visit.
          </p>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We implement reasonable security measures to protect any data we collect.
            However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            Our service is not directed to children under 13. We do not knowingly collect
            information from children.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be posted
            on this page with an updated date.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy, please contact us at{' '}
            <a href="mailto:maria@asobi-labs.com">maria@asobi-labs.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
