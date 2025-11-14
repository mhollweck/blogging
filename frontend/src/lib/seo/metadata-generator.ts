// SEO metadata generation service
// Generates optimized SEO metadata for topic pages

import { SEOMetadata, SEOInput } from '@/types/seo';

export class SEOMetadataGenerator {
  /**
   * Generate complete SEO metadata for a topic page
   */
  generate(input: SEOInput): SEOMetadata {
    const titleTag = this.generateTitleTag(input);
    const metaDescription = this.generateMetaDescription(input);
    const h1 = input.display_title;
    const heroParagraph = this.generateHeroParagraph(input);
    const faq = this.generateFAQ(input);
    const keywordClusters = this.generateKeywordClusters(input);

    return {
      title_tag: titleTag,
      meta_description: metaDescription,
      h1,
      hero_paragraph: heroParagraph,
      seo_faq: faq,
      schema_webpage: this.generateWebPageSchema(input, titleTag, metaDescription),
      schema_faq: this.generateFAQSchema(faq),
      semantic_keyword_clusters: keywordClusters,
      url_recommendations: this.generateURLRecommendations(input),
    };
  }

  private generateTitleTag(input: SEOInput): string {
    const base = input.display_title;
    const suffix = ' – Updated Daily | BLOGG.ING';
    const maxLength = 65;

    if ((base + suffix).length <= maxLength) {
      return base + suffix;
    }

    // Truncate base if too long
    const availableLength = maxLength - suffix.length - 3; // -3 for "..."
    return base.substring(0, availableLength) + '...' + suffix;
  }

  private generateMetaDescription(input: SEOInput): string {
    const maxLength = 160;
    const suffix = ' Curated daily from expert sources.';

    let description = input.page_description;

    if ((description + suffix).length > maxLength) {
      const availableLength = maxLength - suffix.length - 3;
      description = description.substring(0, availableLength) + '...';
    }

    return description + suffix;
  }

  private generateHeroParagraph(input: SEOInput): string {
    // Enhanced version of page_description with SEO power words
    const baseDesc = input.page_description;

    // Add power phrase
    const powerPhrase = `Updated every morning, this page brings together the best articles about ${input.search_query.toLowerCase()}.`;

    return `${baseDesc} ${powerPhrase}`;
  }

  private generateFAQ(input: SEOInput): Array<{ q: string; a: string }> {
    const keyword = input.search_query.toLowerCase();
    const title = input.display_title;

    return [
      {
        q: `What is ${title}?`,
        a: `${input.page_description} This page aggregates the most comprehensive and up-to-date articles from leading experts and authoritative sources.`,
      },
      {
        q: `How often is this page updated?`,
        a: `This page is automatically updated every morning with the latest articles about ${keyword}. Our system continuously monitors top sources to ensure you always have access to the most current and relevant information.`,
      },
      {
        q: `Where do these articles come from?`,
        a: `We curate articles from established blogs, industry experts, and authoritative websites that consistently publish high-quality content about ${keyword}. Each source is carefully selected for accuracy, depth, and reader value.`,
      },
      {
        q: `Are these articles ranked in any particular order?`,
        a: `Yes, articles are ranked based on search relevance, content quality, and authority. The top-ranking articles typically offer the most comprehensive coverage and actionable insights about ${keyword}.`,
      },
    ];
  }

  private generateKeywordClusters(input: SEOInput): {
    primary_cluster: string[];
    related_intents: string[];
    common_search_variants: string[];
  } {
    const baseKeyword = input.search_query.toLowerCase();
    const words = baseKeyword.split(' ');

    return {
      primary_cluster: [
        baseKeyword,
        `best ${baseKeyword}`,
        `${baseKeyword} guide`,
        `top ${baseKeyword}`,
        ...(input.secondary_keywords || []),
      ],
      related_intents: [
        `how to ${baseKeyword}`,
        `${baseKeyword} tips`,
        `${baseKeyword} for beginners`,
        `learn ${baseKeyword}`,
      ],
      common_search_variants: [
        baseKeyword,
        baseKeyword.replace('2025', '2026'),
        baseKeyword.replace('best', 'top'),
        baseKeyword.replace('guide', 'tutorial'),
      ],
    };
  }

  private generateWebPageSchema(
    input: SEOInput,
    title: string,
    description: string
  ): string {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: `https://blogg.ing/${input.topic_slug}`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'BLOGG.ING',
        url: 'https://blogg.ing',
      },
      about: {
        '@type': 'Thing',
        name: input.display_title,
        description: input.page_description,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `https://blogg.ing/og/${input.topic_slug}.png`,
      },
      dateModified: new Date().toISOString().split('T')[0],
      inLanguage: 'en-US',
    };

    return JSON.stringify(schema);
  }

  private generateFAQSchema(faq: Array<{ q: string; a: string }>): string {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };

    return JSON.stringify(schema);
  }

  private generateURLRecommendations(input: SEOInput): string[] {
    // Related topics based on secondary keywords
    return input.related_topics || [];
  }
}

// Singleton instance
export const seoGenerator = new SEOMetadataGenerator();
