-- BLOGG.ING MVP Database Schema
-- PostgreSQL / Supabase

-- ================================
-- TABLE: keywords
-- ================================
-- List of topics (25 rows for MVP).
-- Each corresponds to one page and one search query.

CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    display_title TEXT NOT NULL,
    description TEXT NOT NULL,
    search_query TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_crawled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX keywords_slug_idx ON keywords(slug);
CREATE INDEX keywords_active_idx ON keywords(active) WHERE active = TRUE;

-- ================================
-- TABLE: sources
-- ================================
-- Unique URLs across all topics.
-- Summary is stored once per URL.

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    summary_short TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX sources_url_idx ON sources(url);
CREATE INDEX sources_domain_idx ON sources(domain);
CREATE INDEX sources_summary_null_idx ON sources(first_seen_at) WHERE summary_short IS NULL;

-- ================================
-- TABLE: keyword_results
-- ================================
-- SERP results per keyword per crawl.
-- This is the main data driving each topic page.

CREATE TABLE keyword_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    snippet TEXT,
    position INTEGER NOT NULL,
    crawled_at DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX keyword_results_keyword_crawled_idx ON keyword_results(keyword_id, crawled_at DESC);
CREATE INDEX keyword_results_source_idx ON keyword_results(source_id);
CREATE INDEX keyword_results_position_idx ON keyword_results(keyword_id, crawled_at, position);

-- ================================
-- TRIGGERS: Auto-update timestamps
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
