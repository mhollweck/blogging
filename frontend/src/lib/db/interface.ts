// Database interface - both mock and real services implement this

import {
  Keyword,
  TopicPageData,
  HomePageTopic,
} from '@/types/database';

export interface DatabaseService {
  // Get all topics for homepage
  getAllTopics(): Promise<HomePageTopic[]>;

  // Get single topic by slug
  getTopicBySlug(slug: string): Promise<Keyword | null>;

  // Get complete topic page data (keyword + latest articles)
  getTopicPageData(slug: string): Promise<TopicPageData | null>;

  // Check if slug is a variant and return canonical slug
  getCanonicalSlug(variantSlug: string): Promise<string | null>;

  // Check if database is available
  healthCheck(): Promise<boolean>;
}
