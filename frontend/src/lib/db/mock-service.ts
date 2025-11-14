// Mock database service for development without Supabase

import { DatabaseService } from './interface';
import {
  Keyword,
  TopicPageData,
  HomePageTopic,
} from '@/types/database';
import {
  MOCK_KEYWORDS,
  MOCK_ARTICLES,
} from '@/data/mock-topics';

export class MockDatabaseService implements DatabaseService {
  async getAllTopics(): Promise<HomePageTopic[]> {
    // Simulate network delay
    await this.delay(100);

    return MOCK_KEYWORDS.map((keyword) => ({
      slug: keyword.slug,
      display_title: keyword.display_title,
      description: keyword.description,
      article_count: MOCK_ARTICLES[keyword.slug]?.length || 38,
      last_updated: keyword.last_crawled_at,
    }));
  }

  async getTopicBySlug(slug: string): Promise<Keyword | null> {
    await this.delay(50);

    const keyword = MOCK_KEYWORDS.find((k) => k.slug === slug);
    return keyword || null;
  }

  async getTopicPageData(slug: string): Promise<TopicPageData | null> {
    await this.delay(150);

    const keyword = MOCK_KEYWORDS.find((k) => k.slug === slug);
    if (!keyword) return null;

    const articles = MOCK_ARTICLES[slug] || [];
    const latest_crawl_date = articles.length > 0 ? articles[0].crawled_at : null;

    return {
      keyword,
      latest_crawl_date,
      articles,
      article_count: articles.length,
    };
  }

  async getCanonicalSlug(variantSlug: string): Promise<string | null> {
    await this.delay(50);
    // Mock implementation - no variants in mock data
    return null;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  // Simulate network delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const mockDb = new MockDatabaseService();
