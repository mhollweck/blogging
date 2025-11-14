# Content Quality Filters

This document explains how BLOGG.ING ensures high-quality blog content by filtering out social media, forums, and duplicate articles.

## 🚫 Blocked Domains

The crawler automatically filters out these types of sites:

### Social Media Platforms
- Facebook, Twitter/X, Instagram, LinkedIn
- TikTok, Pinterest, Snapchat

### Forums & Q&A Sites
- Reddit, Quora
- Stack Overflow, Stack Exchange
- Yahoo Answers

### Video Platforms
- YouTube, Vimeo, Dailymotion

### Low-Quality User-Generated Content
- Medium (often low-quality, inconsistent)
- Substack (newsletters, not blogs)
- Tumblr

### E-commerce & Marketplaces
- Amazon, eBay, Etsy

### News Aggregators
- Hacker News

### Wikis
- Wikipedia, WikiHow

## 🔍 Why These Are Blocked

**Social Media & Forums:**
- User comments, not curated content
- Poor structure for blog-style content
- Often low-quality or off-topic discussions

**Video Platforms:**
- Not text-based blog content
- Requires video playback (not scannable)

**E-commerce:**
- Product listings, not informational content
- Heavy affiliate bias

**Wikis:**
- Not blog posts (encyclopedic format)
- Different content style/structure

## ✅ What Gets Through

The crawler focuses on:
- Traditional blogs (personal, company, niche blogs)
- Professional content sites (like The Points Guy, NerdWallet, Wirecutter)
- Expert-written articles on dedicated domains
- News sites with editorial standards

## 🔄 Duplicate Prevention

The crawler prevents duplicate articles per topic:

1. **URL Normalization:**
   - Removes tracking parameters (utm_*, etc.)
   - Removes trailing slashes
   - Standardizes format

2. **Daily Deduplication:**
   - Checks if same URL already exists for this keyword today
   - Skips if duplicate found
   - Logs: `⏭ Skipping duplicate: [url]`

3. **Database Constraints:**
   - Each topic can only have one entry per URL per day
   - Prevents accidental double-crawling

## 📊 Impact on Results

**Before Filtering:**
- 20 results from Serper API
- May include Reddit threads, YouTube videos, Quora answers

**After Filtering:**
- 10-18 blog results (typical)
- Only high-quality, blog-style content
- Better user experience on frontend

## 🔧 Modifying the Block List

To add/remove blocked domains, edit:

**File:** `workers/crawler/src/index.ts`

**Function:** `isBlockedDomain(domain: string)`

**Example:**
```typescript
const blockedDomains = [
  'facebook.com',
  'reddit.com',
  // Add new blocked domains here
  'newsite.com',
];
```

After editing, redeploy:
```bash
cd workers/crawler
wrangler deploy
```

## 📈 Performance Tracking

Monitor these metrics to evaluate filter effectiveness:

1. **Average results per topic** (target: 12-18 after filtering)
2. **User engagement** (do people click filtered results more?)
3. **Bounce rate** (are filtered results higher quality?)

Use Supabase to query:

```sql
-- Check average results per topic
SELECT
  k.display_title,
  COUNT(kr.id) as article_count
FROM keywords k
LEFT JOIN keyword_results kr ON kr.keyword_id = k.id
WHERE kr.crawled_at = CURRENT_DATE
GROUP BY k.id, k.display_title
ORDER BY article_count DESC;
```

## 🎯 Future Improvements

Consider adding:
- **Domain quality scoring** (rank blogs by authority)
- **Content freshness** (prioritize recently updated)
- **User feedback** (let users report low-quality sources)
- **Custom block list per topic** (some topics may benefit from Reddit)
