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
  date?: string; // ISO date string from Serper (e.g., "2024-01-15")
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

  // Filter out non-blog sites (social media, forums, health authorities, etc.)
  const filteredResults = results.filter(result => {
    const domain = extractDomain(result.link);
    if (isBlockedDomain(domain)) return false;

    // Apply blog detection - only keep sources that look like blogs
    return isBlogSource(result.link, domain);
  });

  console.log(`  After filtering: ${filteredResults.length} blog results`);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Get all existing URLs for this keyword today (for duplicate prevention)
  const { data: existingResults } = await supabase
    .from('keyword_results')
    .select('source_id')
    .eq('keyword_id', keyword.id)
    .eq('crawled_at', today);

  // Build a Set of existing source IDs for O(1) lookup
  const existingSourceIds = new Set(
    existingResults?.map((r: any) => r.source_id) || []
  );

  // Fetch existing source URLs if we have any
  let existingUrls = new Set<string>();
  if (existingSourceIds.size > 0) {
    const { data: existingSources } = await supabase
      .from('sources')
      .select('id, url')
      .in('id', Array.from(existingSourceIds));

    existingUrls = new Set(existingSources?.map((s: any) => s.url) || []);
  }

  // 3. Process each result
  for (let i = 0; i < filteredResults.length; i++) {
    const result = filteredResults[i];

    try {
      // Normalize URL
      const normalizedUrl = normalizeUrl(result.link);
      const domain = extractDomain(normalizedUrl);

      // Check if this URL already exists for this keyword today (prevent duplicates)
      if (existingUrls.has(normalizedUrl)) {
        console.log(`  ⏭ Skipping duplicate: ${normalizedUrl}`);
        continue;
      }

      // Detect blog signals for this URL
      const blogSignals = detectBlogSignals(normalizedUrl, domain);

      // Parse published date from Serper (optional)
      let publishedAt = null;
      if (result.date) {
        try {
          publishedAt = result.date; // Serper provides ISO date strings
        } catch (e) {
          console.log(`  ⚠ Invalid date format: ${result.date}`);
        }
      }

      // 4. Upsert source
      const { data: source, error: sourceError } = await supabase
        .from('sources')
        .upsert(
          {
            url: normalizedUrl,
            domain: domain,
            last_seen_at: new Date().toISOString(),
            published_at: publishedAt,
            blog_signals: blogSignals,
            is_blog: blogSignals.length > 0,
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

function isBlockedDomain(domain: string): boolean {
  const blockedDomains = [
    // Social Media
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'linkedin.com',
    'tiktok.com',
    'pinterest.com',
    'snapchat.com',

    // Forums & Q&A
    'reddit.com',
    'quora.com',
    'stackoverflow.com',
    'stackexchange.com',
    'answers.yahoo.com',

    // Video Platforms
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'dailymotion.com',

    // User-generated content (low quality)
    'medium.com', // Can be hit or miss, but often low-quality
    'substack.com', // Newsletters, not traditional blogs
    'tumblr.com',

    // E-commerce/Marketplaces
    'amazon.com',
    'ebay.com',
    'etsy.com',

    // News Aggregators
    'news.ycombinator.com',
    'hacker-news.firebaseapp.com',

    // Wikis
    'wikipedia.org',
    'wikihow.com',

    // Health Authority Sites (Medical/Government)
    'webmd.com',
    'mayoclinic.org',
    'healthline.com',
    'medicalnewstoday.com',
    'everydayhealth.com',
    'health.com',
    'prevention.com',
    'verywellhealth.com',
    'clevelandclinic.org',
    'hopkinsmedicine.org',
    'health.harvard.edu',
    'nih.gov',
    'cdc.gov',
    'who.int',
    'fda.gov',
  ];

  // Check exact match or subdomain match
  return blockedDomains.some(blocked =>
    domain === blocked || domain.endsWith(`.${blocked}`)
  );
}

/**
 * Detects blog signals from URL and domain
 * Returns an array of detected signal types
 */
function detectBlogSignals(url: string, domain: string): string[] {
  const blogSignals: string[] = [];

  // Signal 1: URL pattern matching
  // Check if URL contains blog-like patterns
  const blogUrlPatterns = [
    /\/blog\//i,           // /blog/ in path
    /\/posts?\//i,         // /post/ or /posts/ in path
    /\/articles?\//i,      // /article/ or /articles/ in path
    /\/\d{4}\/\d{2}\//,    // Date pattern like /2024/01/
    /\/\d{4}\/\d{2}\/\d{2}\//,  // Full date like /2024/01/15/
    /\/entry\//i,          // /entry/ in path
    /\/stories\//i,        // /stories/ in path
  ];

  if (blogUrlPatterns.some(pattern => pattern.test(url))) {
    blogSignals.push('url_pattern');
  }

  // Signal 2: Known blog platforms
  const blogPlatforms = [
    'wordpress.com',
    'blogspot.com',
    'blogger.com',
    'ghost.io',
    'typepad.com',
    'wix.com',
    'squarespace.com',
    'weebly.com',
  ];

  if (blogPlatforms.some(platform => domain === platform || domain.endsWith(`.${platform}`))) {
    blogSignals.push('known_platform');
  }

  // Signal 3: Domain contains blog-related keywords
  const blogKeywords = ['blog', 'diary', 'journal', 'writings'];
  if (blogKeywords.some(keyword => domain.includes(keyword))) {
    blogSignals.push('domain_keyword');
  }

  return blogSignals;
}

/**
 * Determines if a URL/domain appears to be a blog based on multiple signals
 * Returns true if ANY of the blog detection criteria are met
 */
function isBlogSource(url: string, domain: string): boolean {
  const signals = detectBlogSignals(url, domain);
  return signals.length > 0;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
