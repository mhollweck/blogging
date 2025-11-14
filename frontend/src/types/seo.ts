// SEO types for metadata generation

export interface SEOMetadata {
  title_tag: string;
  meta_description: string;
  h1: string;
  hero_paragraph: string;
  seo_faq: FAQItem[];
  schema_webpage: string; // JSON-LD as string
  schema_faq: string; // JSON-LD as string
  semantic_keyword_clusters: KeywordClusters;
  url_recommendations: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface KeywordClusters {
  primary_cluster: string[];
  related_intents: string[];
  common_search_variants: string[];
}

export interface SEOInput {
  topic_slug: string;
  display_title: string;
  page_description: string;
  search_query: string;
  secondary_keywords?: string[];
  related_topics?: string[];
}
