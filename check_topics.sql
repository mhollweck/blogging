-- Check all keywords and their article counts
SELECT
  k.slug,
  k.display_title,
  k.active,
  k.last_crawled_at,
  COUNT(kr.id) as article_count
FROM keywords k
LEFT JOIN keyword_results kr ON kr.keyword_id = k.id
GROUP BY k.id, k.slug, k.display_title, k.active, k.last_crawled_at
ORDER BY k.created_at DESC;
