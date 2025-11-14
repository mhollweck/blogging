-- Migration: Add 10 high-traffic topics with slug variants
-- Created: 2025-11-14
-- Purpose: Add SEO-optimized topics with high search volume potential

-- ================================
-- INSERT KEYWORDS (10 topics)
-- ================================

INSERT INTO keywords (slug, display_title, description, search_query) VALUES

-- 1. Thanksgiving (Seasonal surge Nov-Dec)
(
    'thanksgiving-dinner-ideas-2025',
    'Thanksgiving Dinner Ideas 2025',
    'Complete guide to planning the perfect Thanksgiving dinner. Easy recipes, menu planning tips, and traditional dishes everyone will love.',
    'thanksgiving dinner ideas 2025'
),

-- 2. Credit Cards (High CPC, strong affiliate potential)
(
    'best-credit-cards-2025',
    'Best Credit Cards 2025',
    'Compare top credit cards and find the perfect match for your spending habits. Rewards, cashback, travel perks, and credit-building options.',
    'best credit cards 2025'
),

-- 3. Weight Loss (Evergreen, high engagement)
(
    'how-to-lose-weight-fast',
    'How to Lose Weight Fast',
    'Evidence-based strategies for safe and effective weight loss. Nutrition tips, workout plans, and sustainable habits for lasting results.',
    'how to lose weight fast safely'
),

-- 4. Netflix Shows (High engagement, constantly updated)
(
    'best-netflix-shows-2025',
    'Best Netflix Shows 2025',
    'Discover the top Netflix series and movies worth watching. Hidden gems, new releases, and critically acclaimed shows across all genres.',
    'best netflix shows to watch 2025'
),

-- 5. Side Hustles (Strong commercial intent)
(
    'best-side-hustle-ideas-2025',
    'Best Side Hustle Ideas 2025',
    'Start earning extra income with proven side hustle ideas. From freelancing to online businesses, find flexible ways to make money.',
    'best side hustle ideas 2025'
),

-- 6. Credit Building (Financial niche, high-value traffic)
(
    'how-to-build-credit-fast',
    'How to Build Credit Fast',
    'Build your credit score quickly with expert strategies. Credit cards, payment history, utilization tips, and common mistakes to avoid.',
    'how to build credit fast'
),

-- 7. Work From Home (Sustained demand)
(
    'legitimate-work-from-home-jobs',
    'Legitimate Work From Home Jobs',
    'Find real remote work opportunities that pay well. No scams, just verified work-from-home jobs across industries and skill levels.',
    'legitimate work from home jobs 2025'
),

-- 8. iPhone Tips (Tech niche, consistent interest)
(
    'iphone-tips-and-tricks-2025',
    'iPhone Tips and Tricks 2025',
    'Unlock your iPhone''s full potential with hidden features and productivity hacks. Master iOS shortcuts, settings, and time-saving tips.',
    'iphone tips and tricks 2025'
),

-- 9. Money Saving (Evergreen financial content)
(
    'how-to-save-money-fast',
    'How to Save Money Fast',
    'Practical money-saving strategies that work. Budgeting tips, expense cutting techniques, and smart spending habits to build wealth.',
    'how to save money fast'
),

-- 10. Student Laptops (Seasonal peaks, affiliate potential)
(
    'best-laptops-for-students-2025',
    'Best Laptops for Students 2025',
    'Find the perfect laptop for school without breaking the bank. Budget-friendly options, performance comparisons, and buying guide.',
    'best laptops for students 2025'
);


-- ================================
-- INSERT SLUG VARIANTS (50 total)
-- ================================

-- Thanksgiving slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'thanksgiving-menu-ideas' FROM keywords WHERE slug = 'thanksgiving-dinner-ideas-2025'
UNION ALL
SELECT id, 'thanksgiving-recipes-easy' FROM keywords WHERE slug = 'thanksgiving-dinner-ideas-2025'
UNION ALL
SELECT id, 'thanksgiving-meal-planning' FROM keywords WHERE slug = 'thanksgiving-dinner-ideas-2025'
UNION ALL
SELECT id, 'best-thanksgiving-dinner-recipes' FROM keywords WHERE slug = 'thanksgiving-dinner-ideas-2025'
UNION ALL
SELECT id, 'thanksgiving-food-ideas' FROM keywords WHERE slug = 'thanksgiving-dinner-ideas-2025';

-- Credit Cards slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'top-credit-cards' FROM keywords WHERE slug = 'best-credit-cards-2025'
UNION ALL
SELECT id, 'credit-card-comparison' FROM keywords WHERE slug = 'best-credit-cards-2025'
UNION ALL
SELECT id, 'best-rewards-credit-cards' FROM keywords WHERE slug = 'best-credit-cards-2025'
UNION ALL
SELECT id, 'credit-cards-for-beginners' FROM keywords WHERE slug = 'best-credit-cards-2025'
UNION ALL
SELECT id, 'highest-cashback-credit-cards' FROM keywords WHERE slug = 'best-credit-cards-2025';

-- Weight Loss slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'lose-weight-quickly' FROM keywords WHERE slug = 'how-to-lose-weight-fast'
UNION ALL
SELECT id, 'fast-weight-loss-tips' FROM keywords WHERE slug = 'how-to-lose-weight-fast'
UNION ALL
SELECT id, 'weight-loss-methods' FROM keywords WHERE slug = 'how-to-lose-weight-fast'
UNION ALL
SELECT id, 'quick-weight-loss-guide' FROM keywords WHERE slug = 'how-to-lose-weight-fast'
UNION ALL
SELECT id, 'lose-10-pounds-fast' FROM keywords WHERE slug = 'how-to-lose-weight-fast';

-- Netflix Shows slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'netflix-recommendations' FROM keywords WHERE slug = 'best-netflix-shows-2025'
UNION ALL
SELECT id, 'top-netflix-series' FROM keywords WHERE slug = 'best-netflix-shows-2025'
UNION ALL
SELECT id, 'what-to-watch-on-netflix' FROM keywords WHERE slug = 'best-netflix-shows-2025'
UNION ALL
SELECT id, 'best-shows-on-netflix' FROM keywords WHERE slug = 'best-netflix-shows-2025'
UNION ALL
SELECT id, 'netflix-hidden-gems' FROM keywords WHERE slug = 'best-netflix-shows-2025';

-- Side Hustles slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'side-hustles-from-home' FROM keywords WHERE slug = 'best-side-hustle-ideas-2025'
UNION ALL
SELECT id, 'ways-to-make-extra-money' FROM keywords WHERE slug = 'best-side-hustle-ideas-2025'
UNION ALL
SELECT id, 'side-business-ideas' FROM keywords WHERE slug = 'best-side-hustle-ideas-2025'
UNION ALL
SELECT id, 'part-time-income-ideas' FROM keywords WHERE slug = 'best-side-hustle-ideas-2025'
UNION ALL
SELECT id, 'easy-side-hustles' FROM keywords WHERE slug = 'best-side-hustle-ideas-2025';

-- Credit Building slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'improve-credit-score' FROM keywords WHERE slug = 'how-to-build-credit-fast'
UNION ALL
SELECT id, 'building-credit-from-scratch' FROM keywords WHERE slug = 'how-to-build-credit-fast'
UNION ALL
SELECT id, 'raise-credit-score-quickly' FROM keywords WHERE slug = 'how-to-build-credit-fast'
UNION ALL
SELECT id, 'credit-building-tips' FROM keywords WHERE slug = 'how-to-build-credit-fast'
UNION ALL
SELECT id, 'increase-credit-score' FROM keywords WHERE slug = 'how-to-build-credit-fast';

-- Work From Home slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'remote-jobs-no-experience' FROM keywords WHERE slug = 'legitimate-work-from-home-jobs'
UNION ALL
SELECT id, 'online-jobs-from-home' FROM keywords WHERE slug = 'legitimate-work-from-home-jobs'
UNION ALL
SELECT id, 'best-remote-careers' FROM keywords WHERE slug = 'legitimate-work-from-home-jobs'
UNION ALL
SELECT id, 'work-at-home-opportunities' FROM keywords WHERE slug = 'legitimate-work-from-home-jobs'
UNION ALL
SELECT id, 'remote-work-positions' FROM keywords WHERE slug = 'legitimate-work-from-home-jobs';

-- iPhone Tips slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'iphone-hidden-features' FROM keywords WHERE slug = 'iphone-tips-and-tricks-2025'
UNION ALL
SELECT id, 'best-iphone-hacks' FROM keywords WHERE slug = 'iphone-tips-and-tricks-2025'
UNION ALL
SELECT id, 'iphone-secrets' FROM keywords WHERE slug = 'iphone-tips-and-tricks-2025'
UNION ALL
SELECT id, 'cool-iphone-tricks' FROM keywords WHERE slug = 'iphone-tips-and-tricks-2025'
UNION ALL
SELECT id, 'iphone-productivity-tips' FROM keywords WHERE slug = 'iphone-tips-and-tricks-2025';

-- Money Saving slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'money-saving-tips' FROM keywords WHERE slug = 'how-to-save-money-fast'
UNION ALL
SELECT id, 'ways-to-save-money' FROM keywords WHERE slug = 'how-to-save-money-fast'
UNION ALL
SELECT id, 'frugal-living-tips' FROM keywords WHERE slug = 'how-to-save-money-fast'
UNION ALL
SELECT id, 'save-money-monthly' FROM keywords WHERE slug = 'how-to-save-money-fast'
UNION ALL
SELECT id, 'money-saving-hacks' FROM keywords WHERE slug = 'how-to-save-money-fast';

-- Student Laptops slug variants (5)
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, 'affordable-student-laptops' FROM keywords WHERE slug = 'best-laptops-for-students-2025'
UNION ALL
SELECT id, 'college-laptop-recommendations' FROM keywords WHERE slug = 'best-laptops-for-students-2025'
UNION ALL
SELECT id, 'budget-laptops-for-school' FROM keywords WHERE slug = 'best-laptops-for-students-2025'
UNION ALL
SELECT id, 'student-laptop-buying-guide' FROM keywords WHERE slug = 'best-laptops-for-students-2025'
UNION ALL
SELECT id, 'cheap-laptops-for-students' FROM keywords WHERE slug = 'best-laptops-for-students-2025';


-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Count new keywords (should be 10)
-- SELECT COUNT(*) as new_keywords FROM keywords
-- WHERE slug IN (
--   'thanksgiving-dinner-ideas-2025',
--   'best-credit-cards-2025',
--   'how-to-lose-weight-fast',
--   'best-netflix-shows-2025',
--   'best-side-hustle-ideas-2025',
--   'how-to-build-credit-fast',
--   'legitimate-work-from-home-jobs',
--   'iphone-tips-and-tricks-2025',
--   'how-to-save-money-fast',
--   'best-laptops-for-students-2025'
-- );

-- Count slug variants (should be 50)
-- SELECT COUNT(*) as total_variants FROM slug_variants;

-- Show all topics with their variant counts
-- SELECT
--   k.slug,
--   k.display_title,
--   COUNT(sv.id) as variant_count
-- FROM keywords k
-- LEFT JOIN slug_variants sv ON sv.keyword_id = k.id
-- GROUP BY k.id, k.slug, k.display_title
-- ORDER BY k.created_at DESC;
