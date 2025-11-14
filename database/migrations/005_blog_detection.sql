-- Migration 005: Add blog detection fields to sources table
-- This migration adds columns to support RSS feed detection and blog identification

-- Add RSS feed URL column
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS rss_feed_url TEXT;

-- Add RSS detection status (NULL = not checked, TRUE = has RSS, FALSE = no RSS found)
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS has_rss BOOLEAN DEFAULT NULL;

-- Add timestamp for when RSS was last checked
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS rss_checked_at TIMESTAMPTZ;

-- Add array to track which blog detection signals matched
-- Possible values: 'rss', 'url_pattern', 'known_platform', 'domain_keyword'
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS blog_signals TEXT[] DEFAULT '{}';

-- Add computed field for whether this is identified as a blog
ALTER TABLE sources
ADD COLUMN IF NOT EXISTS is_blog BOOLEAN DEFAULT NULL;

-- Create index for efficient querying of sources without RSS detection
CREATE INDEX IF NOT EXISTS idx_sources_rss_null
ON sources(domain)
WHERE has_rss IS NULL;

-- Create index for querying blog sources
CREATE INDEX IF NOT EXISTS idx_sources_is_blog
ON sources(is_blog)
WHERE is_blog = TRUE;

-- Add comment explaining the schema
COMMENT ON COLUMN sources.rss_feed_url IS 'URL of the RSS/Atom feed for this source, if detected';
COMMENT ON COLUMN sources.has_rss IS 'NULL = not checked yet, TRUE = RSS feed found, FALSE = no RSS feed';
COMMENT ON COLUMN sources.rss_checked_at IS 'Timestamp of when RSS detection was last attempted';
COMMENT ON COLUMN sources.blog_signals IS 'Array of detection methods that identified this as a blog (rss, url_pattern, known_platform, domain_keyword)';
COMMENT ON COLUMN sources.is_blog IS 'Whether this source has been identified as a blog through any detection method';
