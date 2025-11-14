import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'BLOGG.ING – Curated Daily from the Best Writing on the Internet',
  description:
    'Daily-curated collections of the best articles on any topic. Updated every morning from expert blogs across the web.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://blogg.ing'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BLOGG.ING',
    title: 'BLOGG.ING – Curated Daily from the Best Writing on the Internet',
    description:
      'Daily-curated collections of the best articles on any topic. Updated every morning from expert blogs across the web.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BLOGG.ING – Curated Daily from the Best Writing on the Internet',
    description:
      'Daily-curated collections of the best articles on any topic. Updated every morning from expert blogs across the web.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />

        {/* Privacy-friendly analytics by Plausible */}
        <Script
          src="https://plausible.io/js/pa-3p_OxfMqAxVDevyCYsNyz.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init()
          `}
        </Script>
      </body>
    </html>
  );
}
