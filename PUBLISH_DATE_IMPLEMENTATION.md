# Publish Date Feature - Implementation Guide

## Quick Reference

### What Data is Available?
- **Serper API**: Does NOT reliably provide publish dates in organic results
- **Database**: Has `first_seen_at` column (best current proxy)
- **Frontend**: Currently does not display any date information

### What Needs to Change?
1. Frontend component to display dates
2. Type definitions to include date fields
3. Database queries to fetch date fields
4. (Optional) Crawler to capture actual publish dates

---

## Implementation Options

### Option 1: Quick Implementation (RECOMMENDED - 2-3 hours)
Use `first_seen_at` from the database as a proxy for publish date.

**Pros:**
- No database migration needed
- No crawler changes needed
- Quick to implement
- Users see "Published X days ago" immediately

**Cons:**
- Shows when WE discovered it, not actual article publish date
- Not technically accurate for older articles

### Option 2: Full Implementation (4-6 hours)
Add true publish date support with database schema changes and crawler updates.

**Pros:**
- Shows actual article publication dates
- More accurate and user-friendly
- Better long-term solution

**Cons:**
- Requires database migration
- Requires crawler updates
- Serper API doesn't provide dates, so must parse HTML or use news API

---

## Code Examples

### 1. Create Date Formatter Utility

**File: `/frontend/src/lib/date-formatter.ts`** (NEW)

```typescript
/**
 * Formats a date string into human-readable relative format
 * Examples: "2 days ago", "Yesterday", "Dec 15, 2024"
 */
export function formatPublishDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Format relative to today
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // For older dates, show absolute date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}
```

### 2. Update ArticleCard Component

**File: `/frontend/src/components/cards/ArticleCard.tsx`**

```typescript
// Article card for topic pages

import { ArticleWithSource } from '@/types/database';
import { formatPublishDate } from '@/lib/date-formatter'; // ADD THIS
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  article: ArticleWithSource;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const displayText = article.source.summary_short || article.snippet || '';
  const publishDate = formatPublishDate(article.source.published_at); // ADD THIS

  return (
    <a
      href={article.source.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={styles.card}
    >
      <div className={styles.header}>
        <span className={styles.rank}>{article.position}</span>
        <span className={styles.domain}>{article.source.domain}</span>
        {publishDate && <span className={styles.date}>{publishDate}</span>} {/* ADD THIS */}
      </div>

      <h3 className={styles.title}>{article.title}</h3>

      {displayText && <p className={styles.snippet}>{displayText}</p>}

      <div className={styles.footer}>
        <span className={styles.meta}>
          {article.source.domain}
        </span>
        <button className={styles.openBtn}>Open original →</button>
      </div>
    </a>
  );
}
```

### 3. Update CSS

**File: `/frontend/src/components/cards/ArticleCard.module.css`** (ADD TO EXISTING FILE)

```css
/* Add this to the existing file */

.date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-left: auto;  /* Push to right side of header */
  white-space: nowrap;  /* Keep "2 weeks ago" on one line */
}

/* Update existing header style to ensure flexbox layout works with new element */
.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
```

### 4. Update Type Definitions

**File: `/frontend/src/types/database.ts`** (MODIFY EXISTING)

```typescript
// Database types matching PostgreSQL schema

// ... existing code ...

export interface Source {
  id: string;
  url: string;
  domain: string;
  first_seen_at: string;
  last_seen_at: string;
  summary_short: string | null;
  // ADD THESE TWO LINES:
  published_at?: string | null;      // ISO timestamp of article publication
  publish_date_raw?: string | null;  // Raw API response (for reference)
  created_at: string;
  updated_at: string;
}

// ... rest of file unchanged ...
```

### 5. Update Supabase Query

**File: `/frontend/src/lib/db/supabase-service.ts`** (MODIFY EXISTING)

In the `getTopicPageData()` method, update the `.select()` call:

```typescript
async getTopicPageData(slug: string): Promise<TopicPageData | null> {
  // ... existing code ...

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
        published_at,          // ADD THIS
        publish_date_raw,      // ADD THIS
        created_at,
        updated_at
      )
    `
    )
    .eq('keyword_id', keyword.id)
    .eq('crawled_at', latest_crawl_date)
    .order('position', { ascending: true });

  // ... rest of method unchanged ...
}
```

### 6. (Optional) Update Mock Service

**File: `/frontend/src/lib/db/mock-service.ts`** (IF USING MOCK DATA)

If using mock data, add `published_at` to source objects:

```typescript
source: {
  id: 's1',
  url: 'https://example.com/article',
  domain: 'example.com',
  first_seen_at: '2025-01-15T00:00:00Z',
  last_seen_at: '2025-11-14T03:05:00Z',
  summary_short: 'Article summary...',
  published_at: '2025-01-15T10:30:00Z',  // ADD THIS
  created_at: '2025-01-15T00:00:00Z',
  updated_at: '2025-11-14T03:05:00Z',
}
```

---

## Implementation Checklist

### Frontend Changes (Option 1 - Quick)
- [ ] Create `/frontend/src/lib/date-formatter.ts`
- [ ] Update `ArticleCard.tsx` to import and use formatPublishDate
- [ ] Update `ArticleCard.module.css` to add `.date` styles
- [ ] Update `Source` interface in `database.ts`
- [ ] Update Supabase query in `supabase-service.ts` to fetch published_at
- [ ] Test with mock data
- [ ] Verify styles on mobile/desktop

### Database Changes (Option 2 - Full)
- [ ] Create migration: `ALTER TABLE sources ADD COLUMN published_at TIMESTAMPTZ;`
- [ ] Create migration: `ALTER TABLE sources ADD COLUMN publish_date_raw TEXT;`
- [ ] Backfill with first_seen_at or NULL
- [ ] Deploy migrations to production

### Crawler Changes (Option 2 - Full)
- [ ] Update SerperResult interface to include `date?: string`
- [ ] Create `parsePublishDate()` function
- [ ] Update source upsert logic to capture dates
- [ ] Test with sample data
- [ ] Deploy to Cloudflare Workers

---

## Testing

### Unit Tests
```typescript
import { formatPublishDate } from '@/lib/date-formatter';

describe('formatPublishDate', () => {
  it('returns null for null input', () => {
    expect(formatPublishDate(null)).toBeNull();
  });

  it('returns "Today" for today', () => {
    const today = new Date().toISOString();
    expect(formatPublishDate(today)).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatPublishDate(yesterday)).toBe('Yesterday');
  });

  it('returns relative format for recent dates', () => {
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
    expect(formatPublishDate(twoDaysAgo)).toBe('2 days ago');
  });

  it('returns absolute format for old dates', () => {
    const sixMonthsAgo = new Date(Date.now() - 15552000000).toISOString();
    const result = formatPublishDate(sixMonthsAgo);
    expect(result).toMatch(/\w+ \d+, \d{4}/); // "Dec 15, 2024" format
  });
});
```

### Manual Testing
1. View topic page with articles
2. Verify dates appear in top right of each card
3. Test different relative time formats
4. Test on mobile device
5. Verify dates update correctly (check after 24 hours)

---

## Deployment

### Option 1: Quick Deployment (Frontend Only)
1. Push changes to frontend
2. Verify TypeScript compilation
3. Test in staging
4. Deploy to production
5. Monitor for errors

### Option 2: Full Deployment
1. Deploy database migrations to production
2. Wait for migrations to complete
3. Deploy crawler updates to Cloudflare
4. Wait for next scheduled crawl
5. Deploy frontend changes
6. Verify data is showing on website

---

## Troubleshooting

### Dates Not Showing?
- Check that `published_at` field exists in database
- Verify Supabase query includes `published_at`
- Check browser console for errors
- Verify ArticleCard component imports and uses formatPublishDate

### Wrong Dates Showing?
- If using `first_seen_at`, remember it's not actual publish date
- Check timezone handling in formatPublishDate
- Verify dates stored in database as ISO timestamps

### Display Issues?
- Check CSS `.date` class styling
- Verify flexbox layout in `.header` (use `margin-left: auto`)
- Test on different screen sizes
- Check color contrast for accessibility

---

## Files to Save for Reference

- `/Users/mariahollweck/Projects/blogging/PUBLISH_DATE_INVESTIGATION.md` - Full technical investigation
- `/Users/mariahollweck/Projects/blogging/PUBLISH_DATE_FINDINGS.txt` - Summary of findings
- `/Users/mariahollweck/Projects/blogging/PUBLISH_DATE_IMPLEMENTATION.md` - This file (implementation guide)

---

## Next Steps

1. **Immediate**: Review this guide and choose implementation option
2. **Short-term**: Implement Option 1 (quick, frontend-only)
3. **Medium-term**: Consider Option 2 if users request more accurate dates
4. **Long-term**: Research true publish date extraction methods (HTML parsing, news API, etc.)

---

## Questions?

Refer back to:
- PUBLISH_DATE_INVESTIGATION.md for technical details
- PUBLISH_DATE_FINDINGS.txt for quick reference
- This file for code examples and implementation steps
