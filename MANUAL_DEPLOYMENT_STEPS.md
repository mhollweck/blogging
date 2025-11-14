# Manual Deployment Steps for BLOGG.ING Workers

## Current Status

✅ **Completed:**
- Cloudflare authentication successful (logged in as maria@asobi-labs.com)
- Both workers' code is complete and ready
- All secrets configured for both workers
- Dependencies installed

⏳ **Pending:**
- Workers.dev subdomain registration (one-time setup)
- Worker deployment to Cloudflare

---

## Step 1: Register Workers.dev Subdomain (One-time)

You need to register a workers.dev subdomain before deploying. This is a one-time setup.

**Option A: Via Dashboard (Recommended)**
1. Visit: https://dash.cloudflare.com/9105f5e1cfb9c14cf0e777469b275718/workers/onboarding
2. Choose a subdomain name (e.g., "blogging" → blogging.workers.dev)
3. Complete the registration

**Option B: During first deployment**
The wrangler CLI will prompt you to register when you first deploy.

---

## Step 2: Deploy Crawler Worker

Once subdomain is registered:

```bash
cd /Users/mariahollweck/Projects/blogging/workers/crawler
wrangler deploy
```

**Expected output:**
```
✨ Worker deployed successfully
URL: https://blogging-crawler.blogging.workers.dev
```

**Cron schedule:** Runs daily at 3:00 AM UTC
- To trigger manually: `curl https://blogging-crawler.YOUR-SUBDOMAIN.workers.dev`
- Cron will NOT run until you're ready

---

## Step 3: Deploy Summarizer Worker

```bash
cd /Users/mariahollweck/Projects/blogging/workers/summarizer
wrangler deploy
```

**Expected output:**
```
✨ Worker deployed successfully
URL: https://blogging-summarizer.blogging.workers.dev
```

**Cron schedule:** Runs daily at 4:00 AM UTC
- To trigger manually: `curl https://blogging-summarizer.YOUR-SUBDOMAIN.workers.dev`
- Cron will NOT run until you're ready

---

## Step 4: Manual Testing (When Ready)

### Test Crawler (fetches articles for all 10 active topics)
```bash
curl https://blogging-crawler.YOUR-SUBDOMAIN.workers.dev
```

**What it does:**
- Queries Serper API for all 10 active keywords
- Saves top 20 results per keyword (200 total articles)
- Inserts data into Supabase
- Uses 10 Serper API credits (~$0.10 on paid plan, free during trial)

**Expected response:**
```
Crawler completed successfully
```

### Test Summarizer (generates AI summaries)
```bash
curl https://blogging-summarizer.YOUR-SUBDOMAIN.workers.dev
```

**What it does:**
- Finds all sources without summaries (max 100 per run)
- Calls OpenAI GPT-4o-mini to generate 1-2 sentence summaries
- Updates sources table with summaries
- Costs: ~$0.01-0.05 depending on number of sources

**Expected response:**
```
Summarizer completed: 200 summaries generated
```

---

## Step 5: Verify Frontend Shows Articles

Once crawler and summarizer have run:

```bash
cd /Users/mariahollweck/Projects/blogging/frontend
npm run dev
```

Visit http://localhost:3000 and click on any of the 10 active topics. You should see:
- 20 articles per topic
- Each article has an AI-generated summary
- Articles are sorted by position (1-20)

---

## Cron Schedule Details

**Crawler:** `0 3 * * *` (3:00 AM UTC daily)
- Runs automatically every day at 3 AM UTC
- Fetches fresh SERP results for all active keywords
- To disable: Update `workers/crawler/wrangler.toml` and remove cron line, then redeploy

**Summarizer:** `0 4 * * *` (4:00 AM UTC daily)
- Runs automatically 1 hour after crawler
- Summarizes any new sources found by crawler
- To disable: Update `workers/summarizer/wrangler.toml` and remove cron line, then redeploy

---

## Cost Control

### Current Setup (10 Active Topics)
- **Serper API:** 10 searches/day = 300/month
  - First 10 days: FREE (2,500 searches included)
  - After trial: ~$3/month ($0.01 per search)

- **OpenAI:** ~200 summaries/day = 6,000/month
  - GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
  - Est: ~$1-2/month (60 words per summary)

- **Cloudflare Workers:** FREE (well under 100k requests/day)

- **Supabase:** FREE (500MB database, plenty for this use case)

**Total: ~$4-5/month** (after Serper trial ends)

### To Reduce Costs Further
1. Reduce active topics (currently 10)
2. Change cron to run less frequently (weekly instead of daily)
3. Lower MAX_SUMMARIES_PER_RUN in summarizer (currently 100)

---

## Monitoring & Logs

### View worker logs in real-time
```bash
# Crawler logs
wrangler tail blogging-crawler

# Summarizer logs
wrangler tail blogging-summarizer
```

### View deployment history
```bash
cd workers/crawler
wrangler deployments

cd workers/summarizer
wrangler deployments
```

### Check cron trigger status
Both workers will show their cron schedules in the Cloudflare dashboard:
https://dash.cloudflare.com/9105f5e1cfb9c14cf0e777469b275718/workers/

---

## Troubleshooting

### If crawler fails:
- Check Serper API key is valid: https://serper.dev/dashboard
- Verify Supabase connection: Check SUPABASE_URL and SUPABASE_SERVICE_KEY
- Check logs: `wrangler tail blogging-crawler`

### If summarizer fails:
- Check OpenAI API key is valid: https://platform.openai.com/api-keys
- Verify you have credits: https://platform.openai.com/usage
- Check logs: `wrangler tail blogging-summarizer`

### If frontend shows no articles:
- Verify database has data: Query `keyword_results` table in Supabase
- Check USE_MOCK_DATA is set to `false` in frontend/.env.local
- Ensure crawler has run at least once

---

## Important Notes

⚠️ **Cron jobs will start automatically once deployed**
- First cron run: Tomorrow at 3:00 AM UTC (crawler)
- You can manually trigger anytime with curl commands above
- Cron jobs respect rate limits (crawler: 1s between keywords, summarizer: 500ms between sources)

⚠️ **API Keys are stored as Cloudflare secrets**
- Never committed to git
- Can be updated with: `wrangler secret put SECRET_NAME`
- Can be listed with: `wrangler secret list`

⚠️ **Database credentials**
- Frontend uses SUPABASE_URL and SUPABASE_ANON_KEY (read-only)
- Workers use SUPABASE_SERVICE_KEY (admin access for writes)

---

## Ready to Deploy?

1. Complete workers.dev subdomain registration (link above)
2. Run deployment commands for both workers
3. Optionally trigger manually to populate initial data
4. Check frontend to see articles appearing

The cron jobs will then run automatically every day at 3 AM and 4 AM UTC.
