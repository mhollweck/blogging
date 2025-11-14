// Database interface - both mock and real services implement this

import {
  Keyword,
  TopicPageData,
  HomePageTopic,
  TopicCategory,
} from '@/types/database';

export interface DatabaseService {
  // Get all topics for homepage
  getAllTopics(): Promise<HomePageTopic[]>;

  // Get topics grouped by category for homepage
  getTopicsByCategory(): Promise<TopicCategory[]>;

  // Get single topic by slug
  getTopicBySlug(slug: string): Promise<Keyword | null>;

  // Get complete topic page data (keyword + latest articles)
  getTopicPageData(slug: string): Promise<TopicPageData | null>;

  // Check if database is available
  healthCheck(): Promise<boolean>;
}
