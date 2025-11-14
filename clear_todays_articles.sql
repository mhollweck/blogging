-- Clear today's articles to re-crawl with fixed duplicate prevention
-- Run this in Supabase SQL Editor

DELETE FROM keyword_results
WHERE crawled_at = CURRENT_DATE;

-- Show remaining count
SELECT COUNT(*) as remaining_articles FROM keyword_results;
