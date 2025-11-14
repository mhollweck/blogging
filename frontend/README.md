# BLOGG.ING Frontend

Next.js application for the BLOGG.ING MVP.

## Features

✅ **Clean Database Abstraction** - Switch between mock data and Supabase with one environment variable
✅ **SEO Optimized** - Auto-generated metadata, JSON-LD schemas, and FAQ sections
✅ **Responsive Design** - Mobile-friendly UI matching the provided HTML designs
✅ **Server-Side Rendering** - Fast page loads with automatic revalidation
✅ **TypeScript** - Full type safety across the entire codebase

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

By default, the app uses **mock data** for development:

```bash
USE_MOCK_DATA=true
```

To use real Supabase data, set:

```bash
USE_MOCK_DATA=false
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_KEY=your-service-key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [slug]/            # Dynamic topic pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── layout/            # Header, Footer
│   │   └── cards/             # TopicCard, ArticleCard
│   ├── lib/
│   │   ├── db/                # Database services
│   │   │   ├── interface.ts   # Database interface
│   │   │   ├── mock-service.ts   # Mock implementation
│   │   │   ├── supabase-service.ts   # Real implementation
│   │   │   └── index.ts       # Service factory
│   │   └── seo/               # SEO metadata generation
│   ├── types/                 # TypeScript type definitions
│   ├── data/                  # Mock data
│   └── styles/                # Global styles
```

## Database Service

The database service abstraction allows you to develop without Supabase:

```typescript
import { db } from '@/lib/db';

// Works with both mock and real data
const topics = await db.getAllTopics();
const topicData = await db.getTopicPageData('some-slug');
```

### Switching Between Mock and Real Data

**Mock Data (Default):**
```bash
USE_MOCK_DATA=true
```

**Real Supabase:**
```bash
USE_MOCK_DATA=false
```

The app automatically falls back to mock data if Supabase credentials are missing or invalid.

## SEO Features

Every topic page includes:

- **Optimized Title & Meta Description** (55-65 chars / 150-160 chars)
- **Structured Data** (WebPage + FAQPage JSON-LD schemas)
- **Auto-Generated FAQs** (4 relevant questions per topic)
- **Semantic Keyword Clusters** (Primary, related intents, variants)
- **Hero Paragraph** with SEO power words

Example SEO generation:

```typescript
import { seoGenerator } from '@/lib/seo';

const seoData = seoGenerator.generate({
  topic_slug: 'best-budget-travel-destinations-2025',
  display_title: 'Best Budget Travel Destinations 2025',
  page_description: 'Discover affordable travel destinations...',
  search_query: 'best budget travel destinations 2025',
});
```

## Pages

### Homepage (`/`)

- Lists all active topics grouped by category
- Shows article count and last updated date for each topic
- Responsive grid layout

### Topic Page (`/[slug]`)

- Displays topic title, description, and metadata
- Lists top articles with AI summaries
- Includes FAQ section for SEO
- Links to original sources

## Styling

Uses CSS Modules with design tokens:

```css
--color-bg: #FAF9F6;
--color-text: #2C2416;
--color-accent: #C17D3A;
--color-border: #E8E5DC;
```

All styles match the provided HTML designs exactly.

## Development Workflow

1. **Develop with mock data** - Fast iteration without database setup
2. **Add new topics** - Edit `src/data/mock-topics.ts`
3. **Test components** - All components work with both mock and real data
4. **Connect to Supabase** - Set environment variables when ready
5. **Deploy** - Works on Vercel, Netlify, or any Node.js host

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `USE_MOCK_DATA=false`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### Other Platforms

Works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted with Docker

## Next Steps

- [ ] Add more mock topics to `src/data/mock-topics.ts`
- [ ] Connect to real Supabase instance
- [ ] Customize SEO metadata generation logic
- [ ] Add category field to database schema
- [ ] Implement search functionality
- [ ] Add sitemap generation
- [ ] Set up analytics
