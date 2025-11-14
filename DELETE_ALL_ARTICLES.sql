-- Delete all articles and sources
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fgpkdibwpkphfbbettqr/sql

-- First delete keyword_results (references sources)
DELETE FROM keyword_results;

-- Then delete sources
DELETE FROM sources;

-- Verify deletion
SELECT
  (SELECT COUNT(*) FROM keyword_results) as keyword_results_count,
  (SELECT COUNT(*) FROM sources) as sources_count;

-- Expected output: both counts should be 0
