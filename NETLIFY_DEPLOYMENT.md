# Netlify Deployment Guide

## ✅ Pre-Deployment Checklist

Your project is ready! Here's what's configured:

- ✅ Next.js frontend built
- ✅ Plausible Analytics integrated
- ✅ Database connected (Supabase)
- ✅ Cloudflare Workers deployed (crawler + summarizer)
- ✅ Privacy policy updated
- ✅ Sitemap and robots.txt configured

## 🚀 Deploy to Netlify (5 minutes)

### Step 1: Push to GitHub (if not already done)

```bash
cd /Users/mariahollweck/Projects/blogging
git add .
git commit -m "Add Plausible Analytics and prepare for Netlify deployment"
git push origin main
```

### Step 2: Deploy to Netlify

1. **Go to Netlify**: https://app.netlify.com
2. **Click "Add new site"** → "Import an existing project"
3. **Connect to GitHub** and select your `blogging` repository
4. **Configure build settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`
   - **Functions directory**: (leave empty)

5. **Add environment variables** (click "Show advanced" → "New variable"):
   ```
   NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
   USE_MOCK_DATA=false
   NEXT_PUBLIC_SUPABASE_URL=https://fgpkdibwpkphfbbettqr.supabase.co
   SUPABASE_SERVICE_KEY=<your-service-key>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

6. **Click "Deploy site"**

### Step 3: Configure Custom Domain (Optional)

If you have `blogg.ing` domain:

1. In Netlify dashboard → **Domain settings**
2. Click **Add custom domain**
3. Enter `blogg.ing`
4. Follow DNS instructions to point your domain to Netlify
5. Enable HTTPS (automatic with Netlify)

### Step 4: Update Plausible Domain

Once deployed:

1. Note your Netlify URL (e.g., `your-site.netlify.app`)
2. Go to Plausible dashboard: https://plausible.io
3. Add your site domain in Plausible settings
4. Your analytics will start tracking immediately!

## ⚙️ Environment Variables You'll Need

Copy these from your local `.env.local`:

```bash
# Site URL (update after deployment)
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Database (don't use mock data in production!)
USE_MOCK_DATA=false

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://fgpkdibwpkphfbbettqr.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🔍 Troubleshooting

### Build fails with "Module not found"
- Make sure `Base directory` is set to `frontend`
- Check that all dependencies are in `frontend/package.json`

### Site shows no articles
- Check that `USE_MOCK_DATA=false` in environment variables
- Verify Supabase credentials are correct
- Run the crawler manually: `curl https://blogging-crawler.maria-105.workers.dev`

### Analytics not working
- Wait 5-10 minutes after deployment
- Check browser console for errors
- Verify Plausible script loads (check Network tab)
- Make sure your domain is added in Plausible dashboard

### Pages return 404
- Netlify auto-detects Next.js, but if issues occur:
- Go to **Site settings** → **Build & deploy** → **Post processing**
- Ensure "Next.js" is selected as framework

## 📊 Post-Deployment Checklist

After deployment, verify:

- [ ] Homepage loads at your Netlify URL
- [ ] Topic pages load (e.g., `/ai-tools-for-productivity`)
- [ ] Articles appear on topic pages
- [ ] Privacy page loads at `/privacy`
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Plausible tracking appears in dashboard
- [ ] Clicking articles tracks as "Outbound Link" in Plausible

## 🎯 Next Steps After Deployment

### 1. Trigger First Data Collection (Optional)

If you want articles immediately (don't wait for cron):

```bash
# Crawl articles for all 10 topics
curl https://blogging-crawler.maria-105.workers.dev

# Generate AI summaries (wait 2-3 minutes after crawl)
curl https://blogging-summarizer.maria-105.workers.dev
```

### 2. Submit to Google Search Console

1. Go to: https://search.google.com/search-console
2. Add property: `blogg.ing` (or your domain)
3. Verify ownership (Netlify makes this easy)
4. Submit sitemap: `https://blogg.ing/sitemap.xml`

### 3. Monitor Your Analytics

- Check Plausible daily: https://plausible.io
- Look for organic traffic from Google (starts in 24-48 hours)
- Watch for outbound clicks (article engagement)

### 4. After 7-10 Days: Make Your Decision

Review these metrics:

| Metric | Goal |
|--------|------|
| Total visitors | > 100 |
| Organic traffic % | > 50% |
| Bounce rate | < 70% |
| Outbound clicks | > 10% |
| Pages/visit | > 1.5 |

**If metrics look good:** Continue the project, activate more topics!
**If metrics are weak:** Pivot or iterate on the concept.

## 💰 Costs

- **Netlify**: Free (up to 100GB bandwidth)
- **Plausible**: $9/month (cancel anytime)
- **Supabase**: Free tier
- **Cloudflare Workers**: Free tier
- **Total**: ~$9/month

## 🔗 Useful Links

- **Netlify Dashboard**: https://app.netlify.com
- **Plausible Dashboard**: https://plausible.io
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Cloudflare Dashboard**: https://dash.cloudflare.com

---

## 🎉 You're Ready!

Your BLOGG.ING project is fully configured and ready to deploy. Follow the steps above, and you'll have a live site in 5 minutes!

Good luck with your SEO experiment! 🚀
