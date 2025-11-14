# Deployment Guide: Blog Detection + Publish Dates

This guide covers deploying both the blog detection system and publish date features together.

## 📋 What's Included

### 1. Blog Detection System (Migration 005)
- RSS feed detection
- Blog signal tracking (URL patterns, known platforms, domain keywords)
- Health authority blocklist
- Weekly RSS detector worker

### 2. Publish Date Display (Migration 006)
- Captures publish dates from Serper API
- Displays relative dates ("2 days ago", "1 week ago")
- Fallback to domain-only display if no date

## 🚀 Deployment Steps

### Step 1: Run Database Migrations

Run both migrations in Supabase SQL Editor:

**Migration 005 - Blog Detection:**
```bash
# File: database/migrations/005_blog_detection.sql
```

**Migration 006 - Publish Dates:**
```bash
# File: database/migrations/006_add_published_date.sql
```

Go to: https://supabase.com/dashboard → Your Project → SQL Editor

Copy/paste each migration and click "Run".

### Step 2: Deploy Updated Crawler

The crawler now includes:
- Blog detection logic
- Health authority blocklist
- Publish date capture from Serper

```bash
cd workers/crawler
wrangler deploy
```

**Expected output:**
```
✓ Uploaded blogging-crawler
✓ Deployed blogging-crawler triggers
  https://blogging-crawler.maria-105.workers.dev
```

### Step 3: Deploy RSS Detector Worker

Set secrets first:
```bash
cd workers/rss-detector

# Set Supabase URL
wrangler secret put SUPABASE_URL
# Enter: https://fgpkdibwpkphfbbettqr.supabase.co

# Set Supabase service key
wrangler secret put SUPABASE_SERVICE_KEY
# Paste your service key
```

Then deploy:
```bash
wrangler deploy
```

### Step 4: Frontend Updates

The frontend changes are already in place:
- TypeScript types updated with `published_at` field
- ArticleCard component displays publish dates
- Date formatting utilities added

No action needed - Next.js will pick up changes on next build.

## 🧪 Testing

### Test 1: Check Migrations
```sql
-- Verify 005_blog_detection columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sources'
AND column_name IN ('rss_feed_url', 'has_rss', 'blog_signals', 'is_blog');

-- Verify 006_add_published_date column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sources'
AND column_name = 'published_at';
```

### Test 2: Trigger Crawler (Manual - Don't run yet per your request)
```bash
curl https://blogging-crawler.maria-105.workers.dev
```

This will:
- Filter health authority sites (WebMD, Mayo Clinic, etc.)
- Detect blog signals via URL patterns
- Capture publish dates from Serper
- Save `published_at` to database

### Test 3: Trigger RSS Detector
```bash
curl https://blogging-rss-detector.maria-105.workers.dev
```

This will:
- Find 100 sources without RSS check
- Detect RSS feeds via HTML parsing + common URLs
- Update `has_rss` and `rss_feed_url` fields

### Test 4: Check Frontend
Visit http://localhost:3000 and navigate to any topic page.

**Expected article card display:**
```
#1  example.com

Article Title Here

- Bullet point summary
- Another point
- Final point

2 days ago • example.com     [Open original →]
```

## 📊 Expected Results

### Immediate (after crawler runs):
- Health sites blocked (WebMD, Mayo Clinic, Healthline, etc.)
- Blog detection via URL patterns (~70-80% accuracy)
- Publish dates captured where available
- Articles display "X days ago" or just domain if no date

### Within 2-4 Weeks:
- RSS feeds detected for 20-30% of sources
- Combined blog detection accuracy: ~90%+
- Most articles showing publish dates

## 🔍 Monitoring

### Check Blog Detection
```sql
-- See blog signal distribution
SELECT
  unnest(blog_signals) as signal,
  COUNT(*) as count
FROM sources
WHERE is_blog = true
GROUP BY signal
ORDER BY count DESC;

-- Check blog vs non-blog ratio
SELECT
  is_blog,
  COUNT(*) as count
FROM sources
GROUP BY is_blog;
```

### Check Publish Dates
```sql
-- How many sources have publish dates?
SELECT
  COUNT(CASE WHEN published_at IS NOT NULL THEN 1 END) as with_date,
  COUNT(CASE WHEN published_at IS NULL THEN 1 END) as without_date,
  COUNT(*) as total
FROM sources;

-- Recent publish dates
SELECT url, domain, published_at
FROM sources
WHERE published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT 10;
```

### Check RSS Detection
```sql
-- RSS detection progress
SELECT
  COUNT(CASE WHEN has_rss = true THEN 1 END) as has_rss,
  COUNT(CASE WHEN has_rss = false THEN 1 END) as no_rss,
  COUNT(CASE WHEN has_rss IS NULL THEN 1 END) as not_checked,
  COUNT(*) as total
FROM sources;
```

## 📁 Files Changed

### Database:
- `database/migrations/005_blog_detection.sql` (NEW)
- `database/migrations/006_add_published_date.sql` (NEW)

### Workers:
- `workers/crawler/src/index.ts` (MODIFIED - blog detection + publish dates)
- `workers/rss-detector/` (NEW DIRECTORY - entire worker)

### Frontend:
- `frontend/src/types/database.ts` (MODIFIED - added `published_at` field)
- `frontend/src/components/cards/ArticleCard.tsx` (MODIFIED - display publish date)
- `frontend/src/components/cards/ArticleCard.module.css` (MODIFIED - date styles)
- `frontend/src/lib/date-utils.ts` (NEW - date formatting functions)

## 🐛 Troubleshooting

### Issue: Publish dates not showing
**Cause:** Migration 006 not run, or crawler hasn't run since update
**Fix:** Run migration 006, then trigger crawler

### Issue: Too many health sites still appearing
**Cause:** Need to add more domains to blocklist
**Fix:** Edit `workers/crawler/src/index.ts` → `isBlockedDomain()` function

### Issue: RSS detector not finding feeds
**Cause:** Secrets not set, or domains don't have RSS
**Fix:** Verify secrets with `wrangler secret list`

## 🎯 Next Steps

After deployment:

1. **Monitor health topic** ("how-to-lose-weight-fast"):
   - Should have NO WebMD, Mayo Clinic, Healthline
   - Should show only blog-style articles

2. **Check publish dates**:
   - Articles should show "X days/weeks ago"
   - Older articles show months/years

3. **Wait for RSS detection**:
   - Runs every Sunday at 02:00 UTC
   - Gradually populates RSS feeds
   - Check progress weekly

## ⏰ Cron Schedules

- **Crawler:** Daily at 03:00 UTC (filters health sites + captures dates)
- **RSS Detector:** Weekly on Sundays at 02:00 UTC (finds RSS feeds)
- **Summarizer:** Daily at 04:00 UTC (generates AI summaries)

All times are UTC.
