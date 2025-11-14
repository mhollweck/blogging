-- ============================================================================
-- COMBINED MIGRATIONS: Blog Detection + Publish Dates
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 005: Blog Detection System
-- ============================================================================

-- Add blog detection columns to sources table
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS rss_feed_url TEXT,
ADD COLUMN IF NOT EXISTS has_rss BOOLEAN,
ADD COLUMN IF NOT EXISTS rss_checked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blog_signals TEXT[],
ADD COLUMN IF NOT EXISTS is_blog BOOLEAN;

-- Add indexes for blog detection
CREATE INDEX IF NOT EXISTS sources_has_rss_idx ON sources(has_rss) WHERE has_rss IS NULL;
CREATE INDEX IF NOT EXISTS sources_is_blog_idx ON sources(is_blog) WHERE is_blog = true;
CREATE INDEX IF NOT EXISTS sources_blog_signals_idx ON sources USING GIN(blog_signals);

-- Add comments
COMMENT ON COLUMN sources.rss_feed_url IS 'URL of detected RSS/Atom feed';
COMMENT ON COLUMN sources.has_rss IS 'Whether source has RSS feed (null = not checked yet)';
COMMENT ON COLUMN sources.rss_checked_at IS 'When RSS detection last ran';
COMMENT ON COLUMN sources.blog_signals IS 'Array of detection methods: rss, url_pattern, known_platform, domain_keyword';
COMMENT ON COLUMN sources.is_blog IS 'Whether this source is identified as a blog';

-- ============================================================================
-- MIGRATION 006: Publish Dates
-- ============================================================================

-- Add published_at column to sources table
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS published_at DATE;

-- Add index for sorting by publish date
CREATE INDEX IF NOT EXISTS sources_published_at_idx ON sources(published_at DESC) WHERE published_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN sources.published_at IS 'Original publish date of the article (from Serper API)';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all columns were added successfully
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

-- Expected output: 6 rows showing all new columns
