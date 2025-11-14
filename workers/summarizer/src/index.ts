// AI Summarizer Worker for BLOGG.ING
// Generates AI summaries for sources that don't have them yet

import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  OPENAI_API_KEY: string;
}

interface Source {
  id: string;
  url: string;
}

interface KeywordResult {
  title: string;
  snippet: string | null;
}

const MAX_SUMMARIES_PER_RUN = 100; // Cost control

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const count = await runSummarizer(env);
      return new Response(`Summarizer completed: ${count} summaries generated`, {
        status: 200,
      });
    } catch (error) {
      console.error('Summarizer error:', error);
      return new Response(`Error: ${error}`, { status: 500 });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runSummarizer(env));
  },
};

async function runSummarizer(env: Env): Promise<number> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  console.log('🤖 Starting AI summarizer...');

  // 1. Find sources without summaries
  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('id, url')
    .is('summary_short', null)
    .order('first_seen_at', { ascending: true })
    .limit(MAX_SUMMARIES_PER_RUN);

  if (sourcesError) throw sourcesError;
  if (!sources || sources.length === 0) {
    console.log('No sources need summarization');
    return 0;
  }

  console.log(`📝 Found ${sources.length} sources to summarize`);

  let successCount = 0;

  // 2. Generate summaries
  for (const source of sources) {
    try {
      await summarizeSource(source, env, supabase);
      successCount++;

      // Rate limiting - wait 500ms between requests
      await delay(500);
    } catch (error) {
      console.error(`Error summarizing source ${source.id}:`, error);
    }
  }

  console.log(`✅ Generated ${successCount} summaries`);
  return successCount;
}

async function summarizeSource(source: Source, env: Env, supabase: any) {
  // 1. Get title and snippet from keyword_results
  const { data: results, error } = await supabase
    .from('keyword_results')
    .select('title, snippet')
    .eq('source_id', source.id)
    .order('crawled_at', { ascending: false })
    .order('position', { ascending: true })
    .limit(1)
    .single();

  if (error || !results) {
    console.log(`  ⚠️  No results found for source ${source.id}`);
    return;
  }

  const title = results.title;
  const snippet = results.snippet || '';

  // 2. Generate prompt
  const prompt = buildPrompt(title, snippet);

  // 3. Call OpenAI API
  const summary = await generateSummary(prompt, env);

  if (!summary) {
    console.log(`  ⚠️  Failed to generate summary for: ${title.substring(0, 50)}...`);
    return;
  }

  // 4. Save summary
  await supabase
    .from('sources')
    .update({ summary_short: summary })
    .eq('id', source.id);

  console.log(`  ✓ Summarized: ${title.substring(0, 50)}...`);
}

function buildPrompt(title: string, snippet: string): string {
  const context = snippet ? `${title}\n\n${snippet}` : title;

  return `You are helping users quickly decide which blog posts to read.
Summarize the following article in 1-2 sentences, max 60 words.
Focus on what the reader will learn or get from the article.
Do not be clickbaity. No emojis.

Title: ${title}
Description: ${snippet || 'No description available'}

Summary:`;
}

async function generateSummary(prompt: string, env: Env): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return null;
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
