# Database Setup

PostgreSQL database schema for BLOGG.ING MVP, designed for Supabase.

## Schema Overview

### Tables

1. **keywords** - Topic definitions (25 rows)
   - Each row represents one topic page
   - Contains slug, title, description, and search query
   - Tracks last crawl timestamp

2. **sources** - Unique URLs across all topics
   - Normalized URLs with extracted domains
   - Stores AI-generated summaries
   - Tracks first/last seen timestamps

3. **keyword_results** - SERP results per keyword per crawl
   - Links keywords to sources
   - Stores title, snippet, and position from SERP
   - Partitioned by crawl date

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and service key

### 2. Run Schema
1. Open Supabase SQL Editor
2. Copy and paste contents of [schema.sql](schema.sql)
3. Execute the query

### 3. Seed Initial Topics
1. In SQL Editor, run [seed.sql](seed.sql)
2. This creates 25 placeholder topics
3. Update topics in PHASE 1: PLANNING

## Environment Variables

For workers and frontend, you'll need:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
```

## Database Queries

### Get Latest Results for a Topic
```sql
SELECT
    kr.title,
    kr.snippet,
    kr.position,
    s.url,
    s.domain,
    s.summary_short
FROM keyword_results kr
JOIN sources s ON s.id = kr.source_id
WHERE kr.keyword_id = 'uuid-here'
  AND kr.crawled_at = (
    SELECT MAX(crawled_at)
    FROM keyword_results
    WHERE keyword_id = 'uuid-here'
  )
ORDER BY kr.position ASC;
```

### Find Sources Needing Summaries
```sql
SELECT id, url
FROM sources
WHERE summary_short IS NULL
ORDER BY first_seen_at ASC
LIMIT 100;
```

## Maintenance

### Cleaning Old Data (Optional)
If you want to keep only recent crawls:

```sql
-- Delete keyword_results older than 30 days
DELETE FROM keyword_results
WHERE crawled_at < CURRENT_DATE - INTERVAL '30 days';

-- Delete orphaned sources (not referenced by any keyword_results)
DELETE FROM sources
WHERE id NOT IN (SELECT DISTINCT source_id FROM keyword_results);
```
