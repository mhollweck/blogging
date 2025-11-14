# BLOGG.ING MVP Setup Guide

Complete walkthrough for setting up the BLOGG.ING MVP from scratch.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Accounts needed:
  - [Supabase](https://supabase.com) (free tier)
  - [Cloudflare](https://cloudflare.com) (free tier)
  - [Serper.dev](https://serper.dev) or similar SERP API (free tier available)
  - [OpenAI](https://openai.com) (API access)
  - [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (free tier)

## Step-by-Step Setup

### Phase 1: Planning (CURRENT)

- [ ] Decide on your 25 topics
- [ ] For each topic, define:
  - URL slug (e.g., "best-budget-travel-destinations-2025")
  - Display title (e.g., "Best Budget Travel Destinations 2025")
  - Description (2-3 sentences for SEO)
  - Search query (exact query for SERP API)
- [ ] Update [database/seed.sql](../database/seed.sql) with your topics

### Phase 2: Database Setup

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com/dashboard
   # Click "New Project"
   # Choose a name, database password, and region
   ```

2. **Run Database Schema**
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `database/schema.sql`
   - Execute the query

3. **Seed Topics**
   - In SQL Editor, run `database/seed.sql`
   - Verify: `SELECT COUNT(*) FROM keywords;` should return 25

4. **Save Credentials**
   - Go to Settings > API
   - Copy "Project URL" and "service_role" key
   - Store securely (we'll use these in Phase 3)

### Phase 3: Crawler Worker Setup

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Configure Crawler Worker**
   ```bash
   cd workers/crawler
   npm install
   ```

4. **Set Environment Variables**
   ```bash
   wrangler secret put SUPABASE_URL
   # Paste your Supabase project URL

   wrangler secret put SUPABASE_SERVICE_KEY
   # Paste your service_role key

   wrangler secret put SERP_API_KEY
   # Paste your Serper.dev API key
   ```

5. **Test Locally**
   ```bash
   wrangler dev
   # Visit the local URL to test
   ```

6. **Deploy**
   ```bash
   wrangler deploy
   ```

7. **Configure Cron Trigger**
   - Already configured in `wrangler.toml`
   - Runs daily at 03:00 UTC
   - View logs: `wrangler tail`

### Phase 4: Summarizer Worker Setup

1. **Configure Summarizer Worker**
   ```bash
   cd workers/summarizer
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put OPENAI_API_KEY
   # Paste your OpenAI API key
   ```

3. **Deploy**
   ```bash
   wrangler deploy
   ```

4. **Cron Schedule**
   - Runs daily at 04:00 UTC (1 hour after crawler)
   - Configured in `wrangler.toml`

### Phase 5: Frontend Setup

1. **Initialize Next.js App**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_KEY=your-service-key
   ```

3. **Test Locally**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

4. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

5. **Configure Custom Domain**
   - In Vercel dashboard, go to Settings > Domains
   - Add `blogg.ing`
   - Follow DNS configuration instructions

### Phase 6: Initial Data Population

1. **Manually Trigger Crawler**
   ```bash
   # Get your worker URL from Cloudflare dashboard
   curl https://your-crawler-worker.workers.dev
   ```

2. **Verify Data in Supabase**
   ```sql
   -- Check sources were created
   SELECT COUNT(*) FROM sources;

   -- Check results were stored
   SELECT COUNT(*) FROM keyword_results;
   ```

3. **Manually Trigger Summarizer**
   ```bash
   curl https://your-summarizer-worker.workers.dev
   ```

4. **Check Summaries**
   ```sql
   SELECT COUNT(*) FROM sources WHERE summary_short IS NOT NULL;
   ```

### Phase 7: Validation

- [ ] Visit `blogg.ing` - home page shows all 25 topics
- [ ] Click a topic - page loads with articles
- [ ] Verify summaries display correctly
- [ ] Check links open original articles in new tab
- [ ] Test on mobile device
- [ ] Check page load speed

## Monitoring

### Cloudflare Workers
- View logs: `wrangler tail worker-name`
- Monitor in Cloudflare dashboard > Workers & Pages

### Supabase
- Database usage: Dashboard > Settings > Usage
- Query logs: Dashboard > Logs

### Costs Estimation (Free Tiers)
- Supabase: Free tier includes 500 MB database
- Cloudflare Workers: 100,000 requests/day free
- Serper.dev: 100 searches/month free (will need paid after ~3 days at 25 keywords/day)
- OpenAI: Pay per token (~$0.10-0.50/day depending on usage)
- Vercel: Free for personal projects

## Troubleshooting

### Crawler Issues
- Check SERP API key is valid
- Verify Supabase credentials
- Check rate limits on SERP API

### Summarizer Issues
- Verify OpenAI API key has credits
- Check sources table has data
- Review worker logs for errors

### Frontend Issues
- Verify environment variables are set
- Check Supabase connection
- Ensure data exists for at least one topic

## Next Steps After MVP

- Add RSS feeds for topics
- Implement user favorites/bookmarks
- Add email digest subscriptions
- Create admin dashboard for managing topics
- Add analytics tracking
- Implement caching layer (Cloudflare KV/R2)
