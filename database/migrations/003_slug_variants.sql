-- Migration: Add slug variants for SEO-friendly URL redirects
-- Created: 2025-11-14
-- Purpose: Allow multiple slug URLs to redirect to one canonical topic

-- Create slug_variants table
CREATE TABLE IF NOT EXISTS slug_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  variant_slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_slug_variants_keyword_id ON slug_variants(keyword_id);
CREATE INDEX IF NOT EXISTS idx_slug_variants_slug ON slug_variants(variant_slug);

-- Add comment
COMMENT ON TABLE slug_variants IS 'Alternative slugs that redirect to canonical keyword slugs';
COMMENT ON COLUMN slug_variants.variant_slug IS 'The alternative slug URL (e.g., "cheap-flights")';
COMMENT ON COLUMN slug_variants.keyword_id IS 'Points to the canonical keyword this variant redirects to';
