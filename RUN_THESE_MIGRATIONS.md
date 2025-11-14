# Run These Migrations in Supabase Dashboard

## Step 1: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard/project/fgpkdibwpkphfbbettqr/sql
2. Click "New Query"

## Step 2: Run Migration 005 (Blog Detection)

Copy and paste the entire contents of:
`database/migrations/005_blog_detection.sql`

Click "Run" button.

**Expected output:**
```
Success. No rows returned
```

## Step 3: Run Migration 006 (Publish Dates)

Copy and paste the entire contents of:
`database/migrations/006_add_published_date.sql`

Click "Run" button.

**Expected output:**
```
Success. No rows returned
```

## Step 4: Verify Migrations

Run this query to verify both migrations worked:

```sql
-- Check if all new columns exist
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sources'
AND column_name IN (
  'rss_feed_url',
  'has_rss',
  'rss_checked_at',
  'blog_signals',
  'is_blog',
  'published_at'
)
ORDER BY column_name;
```

**Expected output:** 6 rows showing all new columns

## Done!

Once you see the verification results, migrations are complete and you can proceed with Step 2 (RSS Detector setup).
