// SERP Crawler Worker for BLOGG.ING
// Crawls search results for active keywords and stores them in Supabase

import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SERPER_API_KEY: string;
}

interface Keyword {
  id: string;
  slug: string;
  search_query: string;
}

interface SerperResult {
  title: string;
  link: string;
  snippet?: string;
  position: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      await runCrawler(env);
      return new Response('Crawler completed successfully', { status: 200 });
    } catch (error) {
      console.error('Crawler error:', error);
      return new Response(`Error: ${error}`, { status: 500 });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runCrawler(env));
  },
};

async function runCrawler(env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  console.log('🚀 Starting SERP crawler...');

  // 1. Fetch all active keywords
  const { data: keywords, error: keywordError } = await supabase
    .from('keywords')
    .select('id, slug, search_query')
    .eq('active', true);

  if (keywordError) throw keywordError;
  if (!keywords || keywords.length === 0) {
    console.log('No active keywords found');
    return;
  }

  console.log(`📊 Found ${keywords.length} active keywords`);

  // 2. Crawl each keyword
  for (const keyword of keywords) {
    try {
      await crawlKeyword(keyword, env, supabase);

      // Update last_crawled_at
      await supabase
        .from('keywords')
        .update({ last_crawled_at: new Date().toISOString() })
        .eq('id', keyword.id);

      // Rate limiting - wait 1 second between requests
      await delay(1000);
    } catch (error) {
      console.error(`Error crawling keyword ${keyword.slug}:`, error);
    }
  }

  console.log('✅ Crawler completed');
}

async function crawlKeyword(keyword: Keyword, env: Env, supabase: any) {
  console.log(`🔍 Crawling: ${keyword.search_query}`);

  // Call Serper API
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: keyword.search_query,
      num: 20, // Get top 20 results
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data = await response.json();
  const results: SerperResult[] = data.organic || [];

  console.log(`  Found ${results.length} results`);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 3. Process each result
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    try {
      // Normalize URL
      const normalizedUrl = normalizeUrl(result.link);
      const domain = extractDomain(normalizedUrl);

      // 4. Upsert source
      const { data: source, error: sourceError } = await supabase
        .from('sources')
        .upsert(
          {
            url: normalizedUrl,
            domain: domain,
            last_seen_at: new Date().toISOString(),
          },
          {
            onConflict: 'url',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (sourceError) {
        console.error(`  Error upserting source:`, sourceError);
        continue;
      }

      // 5. Insert keyword_result
      await supabase.from('keyword_results').insert({
        keyword_id: keyword.id,
        source_id: source.id,
        title: result.title,
        snippet: result.snippet || null,
        position: result.position,
        crawled_at: today,
      });

      console.log(`  ✓ Saved: ${result.title.substring(0, 50)}...`);
    } catch (error) {
      console.error(`  Error processing result:`, error);
    }
  }
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));

    // Remove trailing slash
    let normalized = parsed.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    return url;
  }
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
