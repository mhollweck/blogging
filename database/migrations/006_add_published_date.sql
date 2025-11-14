-- Migration: Add published_at field to sources
-- Created: 2025-11-14
-- Purpose: Store article publish dates from Serper API

-- Add published_at column to sources table
ALTER TABLE sources
ADD COLUMN published_at DATE;

-- Add index for sorting by publish date
CREATE INDEX sources_published_at_idx ON sources(published_at DESC) WHERE published_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN sources.published_at IS 'Original publish date of the article (from Serper API)';
