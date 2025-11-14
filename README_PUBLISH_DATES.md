# Adding Publish Dates to Articles - Complete Investigation

## Executive Summary

I've completed a comprehensive investigation into adding publish dates to article cards. Here's what you need to know:

### The Big Picture
- **Serper API Problem**: Does NOT reliably provide publish dates in organic search results
- **Database Status**: Already has `first_seen_at` field that can serve as a proxy
- **Frontend Status**: Ready for changes, minimal modifications needed
- **Solution**: Two implementation phases available

### Key Finding
The Serper API (which we use for crawling) doesn't include publish dates in organic search results. Only news results have dates, and individual article HTML would need to be parsed for true publish dates.

---

## What Data is Available?

### From Serper API
Currently captured:
- `title` - Article heading
- `link` - URL
- `snippet` - Preview text
- `position` - Ranking position

Missing:
- `date` or `published` field (not available in organic results)

### In Our Database
```sql
sources table:
- first_seen_at (TIMESTAMPTZ)  -- When we first discovered the article
- last_seen_at (TIMESTAMPTZ)   -- When we last saw it in results
- created_at (TIMESTAMPTZ)     -- When we created the record
```

Best proxy for publication date currently: `first_seen_at`

---

## Implementation Options

### Phase 1: Quick Implementation (2-3 hours) - RECOMMENDED START
**Use `first_seen_at` as temporary proxy for publish date**

What you get:
- Article cards display "Published X days ago"
- No database migration needed
- No crawler changes needed
- Only frontend modifications
- Can be done immediately

What it means:
- Shows when WE discovered the article, not actual publish date
- Better than nothing, good enough for MVP

Files to change:
1. Create: `frontend/src/lib/date-formatter.ts`
2. Modify: `frontend/src/components/cards/ArticleCard.tsx`
3. Modify: `frontend/src/components/cards/ArticleCard.module.css`
4. Modify: `frontend/src/types/database.ts`
5. Modify: `frontend/src/lib/db/supabase-service.ts`

### Phase 2: Full Implementation (4-6 hours) - FUTURE
**Add true publish date support with database and crawler changes**

What you get:
- Actual article publication dates
- More accurate and user-friendly
- Better long-term solution

What it requires:
- Database migration (add `published_at` column)
- Crawler updates to parse dates from Serper API (if available) or HTML
- HTML parsing to extract publication date metadata
- Backfill historical data

Not feasible right now because:
- Serper organic results don't include dates
- Would need to switch to News API or scrape article HTML
- More complex implementation needed

---

## Database Schema

### Current Structure
```sql
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Use this!
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    summary_short TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Proposed Addition (Phase 2)
```sql
ALTER TABLE sources ADD COLUMN published_at TIMESTAMPTZ;
ALTER TABLE sources ADD COLUMN publish_date_raw TEXT;
```

---

## Crawler Analysis

### Current SerperResult Interface
```typescript
interface SerperResult {
  title: string;
  link: string;
  snippet?: string;
  position: number;
  // Missing: date field
}
```

### Challenge
Serper API's organic search endpoint doesn't reliably return publish dates. The `date` field is only available in:
- News results (different API format)
- If we parse individual article HTML (requires additional work)

### Recommendation
Start with Phase 1 (use `first_seen_at`), then evaluate Phase 2 options later when you decide on the date source.

---

## Frontend Component Changes

### Current ArticleCard
Displays:
- Position badge (1, 2, 3, etc.)
- Domain name
- Article title
- Snippet/summary
- Domain and "Open original" button

### After Phase 1
Adds:
- Publish date in top right of card header
- Formats as: "2 days ago", "Yesterday", "Dec 15, 2024"
- Displays conditionally (only if date exists)

### Visual Example
```
Before:
┌─────────────────────────────────┐
│ 1 example.com                   │
│   Article Title                 │
│   Preview text...               │
│   example.com  [Open original→] │
└─────────────────────────────────┘

After:
┌─────────────────────────────────┐
│ 1 example.com       2 days ago  │  <-- NEW!
│   Article Title                 │
│   Preview text...               │
│   example.com  [Open original→] │
└─────────────────────────────────┘
```

---

## Implementation Files

### Documents Included
1. **PUBLISH_DATE_VISUAL_SUMMARY.txt** - Quick reference with diagrams
2. **PUBLISH_DATE_FINDINGS.txt** - Detailed findings and analysis
3. **PUBLISH_DATE_INVESTIGATION.md** - Full technical investigation
4. **PUBLISH_DATE_IMPLEMENTATION.md** - Step-by-step code examples
5. **README_PUBLISH_DATES.md** - This file (executive summary)

### Key Code Files to Modify
- `/frontend/src/components/cards/ArticleCard.tsx`
- `/frontend/src/components/cards/ArticleCard.module.css`
- `/frontend/src/types/database.ts`
- `/frontend/src/lib/db/supabase-service.ts`

### New File to Create
- `/frontend/src/lib/date-formatter.ts`

---

## Recommended Next Steps

### Immediate (This Sprint)
1. Read `PUBLISH_DATE_VISUAL_SUMMARY.txt` for quick overview
2. Review `PUBLISH_DATE_IMPLEMENTATION.md` for code examples
3. Make decision: Phase 1 (quick) or Phase 2 (accurate)?

### Short-term (Implement Phase 1)
1. Create `date-formatter.ts` utility
2. Update `ArticleCard` component
3. Update CSS styling
4. Update TypeScript types
5. Update Supabase query
6. Test with mock data
7. Deploy to production

### Medium-term (Consider Phase 2)
1. Wait for user feedback
2. If accuracy matters, implement Phase 2
3. Choose date source:
   - Parse article HTML metadata (most accurate)
   - Switch to News API (easier, different results)
   - Hybrid approach (best of both)

---

## Testing Checklist

### Phase 1 Testing
- [ ] Date displays on article cards
- [ ] Relative format works ("2 days ago")
- [ ] Absolute format works ("Dec 15, 2024")
- [ ] Missing dates don't break layout
- [ ] Mobile layout looks good
- [ ] Dates update correctly after 24 hours

### Phase 2 Testing (if implemented)
- [ ] Database migration successful
- [ ] Crawler captures dates correctly
- [ ] Date formatting matches design
- [ ] Backfill completed successfully

---

## Current Codebase Status

### Strengths
- Database already has timestamp fields
- ArticleCard component designed for extensibility
- CSS flexbox layout supports additional metadata
- Type definitions clean and organized
- No architectural blockers

### Gaps
- No date display on frontend
- Serper API doesn't provide reliable publish dates
- No date parsing utilities

### Risks
- None blocking Phase 1 implementation
- Phase 2 depends on choosing reliable date source

---

## Time Estimates

### Phase 1 (Frontend Only)
- Create date formatter: 30 min
- Update ArticleCard: 30 min
- Update types/queries: 30 min
- Testing: 1 hour
- **Total: 2-3 hours**

### Phase 2 (Full Implementation)
- Database migration: 30 min
- Crawler updates: 1.5 hours
- HTML parsing setup: 1-2 hours
- Testing & refinement: 1.5 hours
- **Total: 4-6 hours**

---

## Questions & Answers

**Q: Will this work without database changes?**
A: Yes! Phase 1 works with existing `first_seen_at` field. No migrations needed.

**Q: Are we showing real publish dates?**
A: Phase 1 shows when we discovered the article (first_seen_at), not actual publish date. Phase 2 would show actual dates but requires HTML parsing or API changes.

**Q: Can we do Phase 2 later?**
A: Yes! Phase 1 is designed to be upgradeable. You can start with Phase 1 and move to Phase 2 later.

**Q: Will this affect performance?**
A: No. Phase 1 just displays existing data. Phase 2 might add minimal overhead for date parsing.

**Q: Do other competitive sites show publish dates?**
A: Yes, most curated content sites display article publication dates. Users expect this.

---

## Decision Point

### What to Do Right Now

Choose one:

1. **Start Phase 1 (Recommended)**
   - Takes 2-3 hours
   - Gets dates on cards quickly
   - Shows "discovered X days ago"
   - Can upgrade later
   - Good for MVP

2. **Wait for Phase 2**
   - Takes 4-6 hours
   - More accurate dates
   - Requires more planning
   - Better long-term
   - Good for high-quality product

3. **Do Both Sequentially**
   - Phase 1 this sprint (2-3 hours)
   - Phase 2 next sprint (4-6 hours)
   - Best of both worlds

**My Recommendation: Start with Phase 1 this sprint**
- Delivers value quickly
- Learns from Phase 1 before Phase 2
- Can evaluate Phase 2 options with real user feedback
- Low risk, high reward

---

## Files for Reference

Start here:
1. `PUBLISH_DATE_VISUAL_SUMMARY.txt` - 5 min read
2. `PUBLISH_DATE_IMPLEMENTATION.md` - 10 min read
3. `PUBLISH_DATE_FINDINGS.txt` - 15 min read
4. `PUBLISH_DATE_INVESTIGATION.md` - 20 min read (detailed)

---

## Contact / Questions

If you have questions about:
- **Implementation approach**: See PUBLISH_DATE_IMPLEMENTATION.md
- **Technical details**: See PUBLISH_DATE_INVESTIGATION.md  
- **Quick overview**: See PUBLISH_DATE_VISUAL_SUMMARY.txt
- **Detailed findings**: See PUBLISH_DATE_FINDINGS.txt

All files are in `/Users/mariahollweck/Projects/blogging/`

---

**Investigation completed**: November 14, 2025
**Estimated reading time**: 30 minutes for all documents
**Estimated implementation time**: 2-3 hours for Phase 1
