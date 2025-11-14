# BLOGG.ING MVP - Quick Start Guide

Get the frontend running in **2 minutes** with mock data.

## Prerequisites

- Node.js 18+ installed
- Git (already initialized)

## Run the Frontend (Mock Data)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit **http://localhost:3000**

That's it! The site is running with mock data. No database required.

## What You'll See

- **Homepage** (`/`) - 5 topic categories with cards
- **Topic Pages** (e.g., `/best-budget-travel-destinations-2025`) - Curated articles with AI summaries
- **SEO Features** - Auto-generated metadata, FAQs, and structured data

## Architecture Highlights

### 🎯 Clean Database Abstraction

The frontend is built with a **database abstraction layer**:

```typescript
// Works with BOTH mock data AND real Supabase
import { db } from '@/lib/db';

const topics = await db.getAllTopics();
const topicData = await db.getTopicPageData('some-slug');
```

Switch between mock and real data with one environment variable:

```bash
# Mock data (default)
USE_MOCK_DATA=true

# Real Supabase
USE_MOCK_DATA=false
```

### 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── [slug]/page.tsx    # Dynamic topic pages
│   │   └── page.tsx           # Homepage
│   ├── lib/
│   │   ├── db/                # Database abstraction
│   │   │   ├── interface.ts   # Interface both services implement
│   │   │   ├── mock-service.ts    # Mock data for dev
│   │   │   └── supabase-service.ts  # Real Supabase
│   │   └── seo/               # SEO metadata generation
│   ├── components/            # Reusable UI components
│   ├── types/                 # TypeScript types matching DB schema
│   └── data/                  # Mock topic data
```

### 🎨 Design System

The UI perfectly matches your HTML designs:

- **Colors:** Warm beige/cream palette (`#FAF9F6`, `#C17D3A`)
- **Typography:** System fonts with careful sizing
- **Components:** TopicCard, ArticleCard, Header, Footer
- **Responsive:** Mobile-first CSS with breakpoints

### 🚀 SEO Optimization

Every topic page includes:

- Title tags (55-65 chars)
- Meta descriptions (150-160 chars)
- JSON-LD structured data (WebPage + FAQPage)
- Auto-generated FAQs (4 per topic)
- Semantic keyword clusters

Example from `best-budget-travel-destinations-2025`:

```json
{
  "title_tag": "Best Budget Travel Destinations 2025 – Updated Daily | BLOGG.ING",
  "meta_description": "Discover affordable travel destinations that offer amazing experiences without breaking the bank. Curated daily from expert sources.",
  "seo_faq": [
    {"q": "What is Best Budget Travel Destinations 2025?", "a": "..."},
    {"q": "How often is this page updated?", "a": "..."}
  ]
}
```

## Customizing Mock Data

Edit mock topics and articles:

```bash
frontend/src/data/mock-topics.ts
```

Add new topics to `MOCK_KEYWORDS` array:

```typescript
{
  id: '6',
  slug: 'your-new-topic',
  display_title: 'Your New Topic',
  description: 'Description here...',
  search_query: 'search query here',
  active: true,
  last_crawled_at: '2025-11-14T03:00:00Z',
  // ...
}
```

Add articles to `MOCK_ARTICLES` object:

```typescript
'your-new-topic': [
  {
    id: 'r10',
    keyword_id: '6',
    source_id: 's10',
    title: 'Article Title',
    snippet: 'Article description...',
    position: 1,
    crawled_at: '2025-11-14',
    created_at: '2025-11-14T03:05:00Z',
    source: {
      id: 's10',
      url: 'https://example.com/article',
      domain: 'example.com',
      summary_short: 'AI-generated summary...',
      // ...
    },
  },
]
```

Restart dev server to see changes.

## Next Steps

### Option 1: Continue Development (Mock Data)

- Add more topics to mock data
- Customize SEO generation logic
- Refine UI components
- Add search functionality
- Test responsive design

### Option 2: Connect to Supabase

1. **Create Supabase project** (see [database/README.md](database/README.md))
2. **Run schema** from `database/schema.sql`
3. **Seed topics** from `database/seed.sql`
4. **Update environment** in `frontend/.env.local`:
   ```bash
   USE_MOCK_DATA=false
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ```
5. **Restart dev server**

The frontend automatically works with real data. No code changes needed.

### Option 3: Build the Workers

Follow [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) to:
- Set up the SERP crawler worker
- Set up the AI summarization worker
- Deploy to Cloudflare

## File Reference

| File | Purpose |
|------|---------|
| [frontend/README.md](frontend/README.md) | Complete frontend documentation |
| [database/README.md](database/README.md) | Database setup instructions |
| [database/schema.sql](database/schema.sql) | PostgreSQL schema |
| [database/seed.sql](database/seed.sql) | 25 starter topics |
| [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Full MVP deployment guide |

## Troubleshooting

### Port 3000 already in use

```bash
# Use a different port
PORT=3001 npm run dev
```

### TypeScript errors

```bash
# Check types
npm run type-check

# Most common issue: missing @types packages
npm install --save-dev @types/node @types/react @types/react-dom
```

### Module not found errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## What's Ready

✅ Frontend with mock data
✅ Database schema and seed data
✅ SEO optimization layer
✅ TypeScript types matching schema
✅ Responsive design
✅ Component library

## What's Next

⏳ Cloudflare crawler worker
⏳ Cloudflare summarizer worker
⏳ Supabase database setup
⏳ Production deployment

---

**You can start developing immediately with mock data, then connect to real services when ready.**
