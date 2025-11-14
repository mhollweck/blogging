# Publishing Date Feature Investigation Report

## Executive Summary
This document provides a comprehensive analysis of adding publish date functionality to the blogging platform. After investigating the codebase, Serper API capabilities, database schema, and frontend components, here are the findings and required changes.

---

## 1. SERPER API CAPABILITIES

### Current Implementation
- **Interface Definition**: `SerperResult` interface (workers/crawler/src/index.ts)
  - Currently captures: `title`, `link`, `snippet`, `position`
  - Does NOT capture: date/publish date field

### Serper API Response Data
Based on API research:
- **Organic Results** (standard search results): May NOT include a reliable date field
- **News Results**: Includes a `date` field formatted as relative time ("2 weeks ago", "4 months ago")
- **General**: Serper API returns: title, link, snippet, position as standard fields

### Key Finding
**The standard organic search results from Serper API do not reliably include publish dates.** Google doesn't always display publish dates in organic search results. The date field is primarily available in news results.

### Options Available
1. **Use news results endpoint** - If targeting news/blog content
2. **Parse publication date from snippet/metadata** - Limited reliability
3. **Store "first_seen_at" date** - When article first appeared in search results
4. **Fetch and parse the article HTML** - Extract date from article metadata (requires additional crawling)

---

## 2. CURRENT DATABASE SCHEMA

### Tables with Date Fields

#### `sources` table
```sql
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- When URL first appeared
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- Last time in search results
    summary_short TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `keyword_results` table
```sql
CREATE TABLE keyword_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword_id UUID NOT NULL REFERENCES keywords(id),
    source_id UUID NOT NULL REFERENCES sources(id),
    title TEXT NOT NULL,
    snippet TEXT,
    position INTEGER NOT NULL,
    crawled_at DATE NOT NULL,  -- Date of crawl
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Database Analysis
- **first_seen_at**: Tracks when we first discovered the article (best proxy for publish date currently)
- **last_seen_at**: Tracks when article last appeared in results
- **crawled_at**: Date we crawled the results (different from article publish date)
- **created_at**: When record was created in our system

### Proposed Schema Changes
**Option 1: Add to sources table (Recommended)**
```sql
ALTER TABLE sources ADD COLUMN published_at TIMESTAMPTZ;
ALTER TABLE sources ADD COLUMN publish_date_raw TEXT; -- Store raw API response
```

**Option 2: Add to keyword_results**
```sql
ALTER TABLE keyword_results ADD COLUMN article_published_at TIMESTAMPTZ;
```

### Why Option 1 is Better
- Publication date belongs to the article/source, not the crawl record
- Avoids duplication if same article appears in multiple keyword searches
- Cleaner data model

---

## 3. CRAWLER MODIFICATIONS NEEDED

### File: `workers/crawler/src/index.ts`

#### Current SerperResult Interface
```typescript
interface SerperResult {
  title: string;
  link: string;
  snippet?: string;
  position: number;
  // Missing: date, published, publishedDate
}
```

#### Required Changes

**Step 1: Update SerperResult interface**
```typescript
interface SerperResult {
  title: string;
  link: string;
  snippet?: string;
  position: number;
  date?: string;  // Add optional date field from API
}
```

**Step 2: Extract and parse the date**
- The Serper API may include a `date` field for some results
- Format varies: could be relative ("2 days ago") or absolute (timestamp)
- Need to handle missing dates gracefully

**Step 3: Update source upsert**
```typescript
// Current:
const { data: source, error: sourceError } = await supabase
  .from('sources')
  .upsert(
    {
      url: normalizedUrl,
      domain: domain,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'url', ignoreDuplicates: false }
  )
  .select()
  .single();

// Needs to add:
published_at: parsePublishDate(result.date),
publish_date_raw: result.date || null,
```

**Step 4: Create date parsing helper**
```typescript
function parsePublishDate(rawDate?: string): string | null {
  if (!rawDate) return null;
  
  // Try to parse relative dates like "2 days ago"
  // Return ISO timestamp if possible
  // Otherwise return null
}
```

### Challenge: Date Parsing
- Serper API doesn't consistently provide reliable publish dates in organic results
- Would need to:
  - Check if date field exists in response
  - Parse relative formats ("2 days ago", "Jan 15")
  - Handle missing dates

---

## 4. FRONTEND COMPONENT CHANGES

### File: `frontend/src/components/cards/ArticleCard.tsx`

#### Current Component
```typescript
export function ArticleCard({ article }: ArticleCardProps) {
  const displayText = article.source.summary_short || article.snippet || '';
  
  return (
    <a href={article.source.url} ...>
      <div className={styles.header}>
        <span className={styles.rank}>{article.position}</span>
        <span className={styles.domain}>{article.source.domain}</span>
      </div>
      <h3 className={styles.title}>{article.title}</h3>
      {displayText && <p className={styles.snippet}>{displayText}</p>}
      <div className={styles.footer}>
        <span className={styles.meta}>{article.source.domain}</span>
        <button className={styles.openBtn}>Open original →</button>
      </div>
    </a>
  );
}
```

#### Required Changes

**Step 1: Update ArticleWithSource type**
```typescript
// In frontend/src/types/database.ts
export interface Source {
  // ... existing fields ...
  published_at?: string | null;      // ISO timestamp
  publish_date_raw?: string | null;  // Raw API value
}
```

**Step 2: Add date formatting utility**
```typescript
// frontend/src/lib/date-formatter.ts
export function formatPublishDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    // Otherwise show date like "Dec 15, 2024"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return null;
  }
}
```

**Step 3: Update ArticleCard component**
```typescript
export function ArticleCard({ article }: ArticleCardProps) {
  const displayText = article.source.summary_short || article.snippet || '';
  const publishDate = formatPublishDate(article.source.published_at);
  
  return (
    <a href={article.source.url} ...>
      <div className={styles.header}>
        <span className={styles.rank}>{article.position}</span>
        <span className={styles.domain}>{article.source.domain}</span>
        {publishDate && <span className={styles.date}>{publishDate}</span>}
      </div>
      {/* rest of component */}
    </a>
  );
}
```

**Step 4: Update CSS**
```css
.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-left: auto;  /* Push to right side */
  white-space: nowrap;
}
```

---

## 5. TYPE DEFINITION UPDATES

### File: `frontend/src/types/database.ts`

#### Current Source Interface
```typescript
export interface Source {
  id: string;
  url: string;
  domain: string;
  first_seen_at: string;
  last_seen_at: string;
  summary_short: string | null;
  created_at: string;
  updated_at: string;
}
```

#### Updated Source Interface
```typescript
export interface Source {
  id: string;
  url: string;
  domain: string;
  first_seen_at: string;
  last_seen_at: string;
  summary_short: string | null;
  published_at?: string | null;      // NEW: Article publication date
  publish_date_raw?: string | null;  // NEW: Raw API response
  created_at: string;
  updated_at: string;
}
```

---

## 6. DATA FETCHING UPDATES

### File: `frontend/src/lib/db/supabase-service.ts`

#### Current Query
```typescript
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
  // ...
```

#### Updated Query
```typescript
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
      published_at,
      publish_date_raw,
      created_at,
      updated_at
    )
  `
  )
  // ...
```

---

## 7. IMPLEMENTATION SUMMARY

### Database Changes
1. Add `published_at` (TIMESTAMPTZ) to sources table
2. Add `publish_date_raw` (TEXT) to sources table

### Crawler Changes
1. Update `SerperResult` interface to include optional `date` field
2. Create `parsePublishDate()` function to handle various date formats
3. Update source upsert to capture and parse published_at
4. Handle gracefully when date is not available

### Frontend Changes
1. Update `Source` interface to include `published_at` and `publish_date_raw`
2. Create `formatPublishDate()` utility for relative/absolute date display
3. Update `ArticleCard` component to display publish date
4. Add CSS styling for date display
5. Update Supabase query to fetch new fields

### Type Definition Changes
1. Update Source interface in `database.ts`

---

## 8. LIMITATIONS & CONSIDERATIONS

### Current Limitation: Serper API Data Gaps
- **Organic search results**: Serper API doesn't reliably include publish dates
- **News results**: Include dates but different result format
- **Alternative**: Must either:
  - Switch to news API results
  - Scrape HTML from articles to extract metadata
  - Use "first_seen_at" as proxy (when we discovered it)

### Recommendation
**Use `first_seen_at` as initial implementation** with note that it represents when we first saw the article, not actual publish date. This:
- Requires only database query updates
- No crawler changes needed initially
- User sees "Published X days ago" based on when article first appeared
- Can upgrade to true publish dates later when method is determined

### Alternative: True Publish Dates
For true article publish dates, would need to:
1. Parse HTML from each article URL
2. Extract publication date from metadata (og:published_time, schema.org, etc.)
3. This requires additional crawler logic and performance trade-offs

---

## 9. MIGRATION STEPS

1. **Database Migration**
   - Add columns to sources table
   - Backfill with first_seen_at or NULL

2. **Crawler Update**
   - Add date parsing logic
   - Deploy to Cloudflare Workers

3. **Frontend Update**
   - Update types
   - Update component
   - Add CSS
   - Test with local data

4. **Testing**
   - Verify dates display correctly
   - Test edge cases (missing dates)
   - Verify formatting on mobile

