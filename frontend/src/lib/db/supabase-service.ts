// Real Supabase database service

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseService } from './interface';
import {
  Keyword,
  TopicPageData,
  HomePageTopic,
  ArticleWithSource,
} from '@/types/database';

export class SupabaseDatabaseService implements DatabaseService {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async getAllTopics(): Promise<HomePageTopic[]> {
    const { data: keywords, error } = await this.client
      .from('keywords')
      .select('id, slug, display_title, description, last_crawled_at')
      .eq('active', true)
      .order('display_title', { ascending: true });

    if (error) throw error;

    // Get article counts for each keyword
    const topicsWithCounts = await Promise.all(
      keywords.map(async (keyword) => {
        const { count } = await this.client
          .from('keyword_results')
          .select('*', { count: 'exact', head: true })
          .eq('keyword_id', keyword.id);

        return {
          slug: keyword.slug,
          display_title: keyword.display_title,
          description: keyword.description,
          article_count: count || 0,
          last_updated: keyword.last_crawled_at,
        };
      })
    );

    return topicsWithCounts;
  }

  async getTopicBySlug(slug: string): Promise<Keyword | null> {
    const { data, error } = await this.client
      .from('keywords')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async getTopicPageData(slug: string): Promise<TopicPageData | null> {
    // First, get the keyword
    const keyword = await this.getTopicBySlug(slug);
    if (!keyword) return null;

    // Get latest crawl date
    const { data: latestCrawl } = await this.client
      .from('keyword_results')
      .select('crawled_at')
      .eq('keyword_id', keyword.id)
      .order('crawled_at', { ascending: false })
      .limit(1)
      .single();

    const latest_crawl_date = latestCrawl?.crawled_at || null;

    if (!latest_crawl_date) {
      return {
        keyword,
        latest_crawl_date: null,
        articles: [],
        article_count: 0,
      };
    }

    // Get articles for latest crawl date
    const { data: results, error } = await this.client
      .from('keyword_results')
      .select(
        `
        id,
        keyword_id,
        source_id,
        title,
        snippet,
        position,
        crawled_at,
        created_at,
        source:sources (
          id,
          url,
          domain,
          first_seen_at,
          last_seen_at,
          summary_short,
          created_at,
          updated_at
        )
      `
      )
      .eq('keyword_id', keyword.id)
      .eq('crawled_at', latest_crawl_date)
      .order('position', { ascending: true });

    if (error) throw error;

    // Transform the nested response into ArticleWithSource[]
    const articles: ArticleWithSource[] = results.map((result: any) => ({
      id: result.id,
      keyword_id: result.keyword_id,
      source_id: result.source_id,
      title: result.title,
      snippet: result.snippet,
      position: result.position,
      crawled_at: result.crawled_at,
      created_at: result.created_at,
      source: result.source,
    }));

    return {
      keyword,
      latest_crawl_date,
      articles,
      article_count: articles.length,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('keywords').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

// Factory function to create Supabase service
export function createSupabaseService(): SupabaseDatabaseService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return new SupabaseDatabaseService(supabaseUrl, supabaseKey);
}
