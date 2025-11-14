// RSS Detector Worker for BLOGG.ING
// Detects RSS/Atom feeds for domains in the sources table

import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

interface Source {
  id: string;
  domain: string;
  url: string;
}

interface RSSDetectionResult {
  hasRSS: boolean;
  feedUrl: string | null;
  feedType: 'rss' | 'atom' | null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      await runRSSDetector(env);
      return new Response('RSS detector completed successfully', { status: 200 });
    } catch (error) {
      console.error('RSS detector error:', error);
      return new Response(`Error: ${error}`, { status: 500 });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runRSSDetector(env));
  },
};

async function runRSSDetector(env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  console.log('🔍 Starting RSS feed detector...');

  // Fetch domains that haven't been checked for RSS yet
  // Limit to 100 domains per run to avoid long execution times
  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('id, domain, url')
    .is('has_rss', null)
    .limit(100);

  if (sourcesError) throw sourcesError;
  if (!sources || sources.length === 0) {
    console.log('No sources to check for RSS feeds');
    return;
  }

  console.log(`📊 Found ${sources.length} sources to check`);

  // Group by domain to avoid checking the same domain multiple times
  const domainMap = new Map<string, Source[]>();
  for (const source of sources) {
    if (!domainMap.has(source.domain)) {
      domainMap.set(source.domain, []);
    }
    domainMap.get(source.domain)!.push(source);
  }

  console.log(`🌐 Checking ${domainMap.size} unique domains`);

  let checkedCount = 0;
  let foundCount = 0;

  // Check each unique domain
  for (const [domain, domainSources] of domainMap.entries()) {
    try {
      console.log(`  Checking ${domain}...`);

      const result = await detectRSSFeed(domain);

      // Update all sources from this domain
      const sourceIds = domainSources.map(s => s.id);

      await supabase
        .from('sources')
        .update({
          has_rss: result.hasRSS,
          rss_feed_url: result.feedUrl,
          rss_checked_at: new Date().toISOString(),
        })
        .in('id', sourceIds);

      // If RSS found, also add 'rss' to blog_signals
      if (result.hasRSS) {
        console.log(`  ✓ Found RSS feed: ${result.feedUrl}`);
        foundCount++;

        // Update blog_signals to include 'rss'
        for (const sourceId of sourceIds) {
          const { data: source } = await supabase
            .from('sources')
            .select('blog_signals')
            .eq('id', sourceId)
            .single();

          if (source) {
            const signals = source.blog_signals || [];
            if (!signals.includes('rss')) {
              signals.push('rss');
              await supabase
                .from('sources')
                .update({
                  blog_signals: signals,
                  is_blog: true, // Has RSS = definitely a blog
                })
                .eq('id', sourceId);
            }
          }
        }
      } else {
        console.log(`  ✗ No RSS feed found`);
      }

      checkedCount++;

      // Rate limiting - wait 2 seconds between domains
      await delay(2000);
    } catch (error) {
      console.error(`  Error checking ${domain}:`, error);
      // Mark as checked but without RSS to avoid retrying immediately
      const sourceIds = domainSources.map(s => s.id);
      await supabase
        .from('sources')
        .update({
          has_rss: false,
          rss_checked_at: new Date().toISOString(),
        })
        .in('id', sourceIds);
    }
  }

  console.log(`✅ RSS detector completed: ${checkedCount} domains checked, ${foundCount} RSS feeds found`);
}

/**
 * Detects RSS/Atom feed for a domain
 * Tries both HTML autodiscovery and common RSS URL patterns
 */
async function detectRSSFeed(domain: string): Promise<RSSDetectionResult> {
  const baseUrl = `https://${domain}`;

  // Method 1: Try HTML autodiscovery (fetch homepage and parse for RSS links)
  try {
    const htmlResult = await detectRSSFromHTML(baseUrl);
    if (htmlResult.hasRSS) {
      return htmlResult;
    }
  } catch (error) {
    console.log(`    HTML autodiscovery failed: ${error}`);
  }

  // Method 2: Probe common RSS URL patterns
  const commonPatterns = [
    '/feed/',
    '/feed',
    '/rss/',
    '/rss',
    '/rss.xml',
    '/feed.xml',
    '/atom.xml',
    '/index.xml',
    '/blog/feed/',
    '/blog/rss/',
  ];

  for (const pattern of commonPatterns) {
    try {
      const feedUrl = `${baseUrl}${pattern}`;
      const response = await fetch(feedUrl, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'BLOGG.ING RSS Detector/1.0',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (
          contentType.includes('xml') ||
          contentType.includes('rss') ||
          contentType.includes('atom')
        ) {
          return {
            hasRSS: true,
            feedUrl,
            feedType: contentType.includes('atom') ? 'atom' : 'rss',
          };
        }
      }
    } catch (error) {
      // Continue to next pattern
      continue;
    }
  }

  // No RSS feed found
  return {
    hasRSS: false,
    feedUrl: null,
    feedType: null,
  };
}

/**
 * Detects RSS feed from HTML <link> tags (autodiscovery)
 */
async function detectRSSFromHTML(url: string): Promise<RSSDetectionResult> {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent': 'BLOGG.ING RSS Detector/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();

  // Parse HTML for RSS/Atom feed links
  // Look for: <link rel="alternate" type="application/rss+xml" href="...">
  const rssPattern = /<link[^>]*rel=["']alternate["'][^>]*type=["']application\/(rss|atom)\+xml["'][^>]*>/gi;
  const matches = html.match(rssPattern);

  if (matches && matches.length > 0) {
    // Extract href from the first match
    const hrefMatch = matches[0].match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      let feedUrl = hrefMatch[1];

      // Handle relative URLs
      if (feedUrl.startsWith('/')) {
        const urlObj = new URL(url);
        feedUrl = `${urlObj.protocol}//${urlObj.host}${feedUrl}`;
      } else if (!feedUrl.startsWith('http')) {
        feedUrl = `${url}/${feedUrl}`;
      }

      const feedType = matches[0].includes('atom') ? 'atom' : 'rss';

      return {
        hasRSS: true,
        feedUrl,
        feedType,
      };
    }
  }

  return {
    hasRSS: false,
    feedUrl: null,
    feedType: null,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
