// Database types matching PostgreSQL schema

export interface Keyword {
  id: string;
  slug: string;
  display_title: string;
  description: string;
  search_query: string;
  active: boolean;
  last_crawled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  url: string;
  domain: string;
  first_seen_at: string;
  last_seen_at: string;
  published_at: string | null; // Original publish date from Serper API
  summary_short: string | null;
  rss_feed_url: string | null;
  has_rss: boolean | null; // null = not checked, true = has RSS, false = no RSS
  rss_checked_at: string | null;
  blog_signals: string[]; // Array of detection methods: 'rss', 'url_pattern', 'known_platform', 'domain_keyword'
  is_blog: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface KeywordResult {
  id: string;
  keyword_id: string;
  source_id: string;
  title: string;
  snippet: string | null;
  position: number;
  crawled_at: string; // DATE string
  created_at: string;
}

export interface SlugVariant {
  id: string;
  keyword_id: string;
  variant_slug: string;
  created_at: string;
}

// Joined types for API responses

export interface ArticleWithSource extends KeywordResult {
  source: Source;
}

export interface TopicPageData {
  keyword: Keyword;
  latest_crawl_date: string | null;
  articles: ArticleWithSource[];
  article_count: number;
}

export interface HomePageTopic {
  slug: string;
  display_title: string;
  description: string;
  article_count: number;
  last_updated: string | null;
}
