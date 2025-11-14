# Plausible Analytics Setup Guide

## ✅ What's Already Done

Plausible Analytics has been integrated into your BLOGG.ING project with:

- ✅ Custom Plausible script embedded in [layout.tsx](frontend/src/app/layout.tsx)
- ✅ Privacy policy updated to mention Plausible
- ✅ Cookie-free tracking (GDPR compliant)
- ✅ Outbound link tracking enabled (tracks when users click article links)

## 🎯 What You'll Track

After 7-10 days, you'll be able to answer:

1. **Is SEO working?**
   - Organic traffic from Google
   - Which search terms are bringing users
   - Page views per topic

2. **Are users clicking articles?**
   - Outbound link click tracking
   - Which articles are most popular
   - Click-through rate per topic

3. **User engagement**
   - Bounce rate (do users leave immediately?)
   - Pages per visit (do they explore?)
   - Time on site

## 🚀 How to Access Your Analytics

1. **Login to Plausible**
   - Go to: https://plausible.io/login
   - Use your account credentials

2. **View Your Dashboard**
   - Your site should be: `blogg.ing` (or whatever domain you deployed to)
   - You'll see real-time stats immediately after deployment

## 📊 Key Metrics to Watch

### Success Indicators (after 7-10 days):

| Metric | Good Sign | Warning Sign |
|--------|-----------|--------------|
| **Total visitors** | > 100 | < 20 |
| **Organic traffic** | > 50% | < 10% |
| **Bounce rate** | < 70% | > 85% |
| **Outbound clicks** | > 10% of visitors | < 2% |
| **Pages/visit** | > 2 | < 1.2 |

### Where to Find These Metrics:

- **Total visitors**: Top of dashboard
- **Organic traffic**: Click "Top Sources" → look for "Google"
- **Bounce rate**: "Engagement" section
- **Outbound clicks**: "Goal Conversions" or "Outbound Links" section
- **Pages/visit**: "Engagement" section

## 🔍 What to Look For

### Week 1-2 Checklist:

- [ ] Are any pages getting organic traffic from Google?
- [ ] Which topics are most popular?
- [ ] Are users clicking through to read articles?
- [ ] What's the bounce rate? (lower is better)
- [ ] Are users exploring multiple topics?

### Decision Matrix:

**Continue the project if:**
- ✅ Getting 50+ organic visitors in 7 days
- ✅ Bounce rate < 70%
- ✅ At least 5-10% of visitors click articles
- ✅ Users view 1.5+ pages on average

**Consider pivoting if:**
- ❌ < 20 visitors after 7 days
- ❌ Bounce rate > 85%
- ❌ No outbound clicks
- ❌ All traffic is direct (no organic search)

## 🛠️ Technical Details

### Script Location
The Plausible script is embedded in [frontend/src/app/layout.tsx:41-50](frontend/src/app/layout.tsx#L41-L50)

```tsx
<Script
  src="https://plausible.io/js/pa-3p_OxfMqAxVDevyCYsNyz.js"
  strategy="afterInteractive"
/>
```

### Features Enabled:
- ✅ **Pageview tracking**: Automatic
- ✅ **Outbound link tracking**: Enabled (tracks article clicks)
- ✅ **Cookie-free**: No user consent needed
- ✅ **Privacy-friendly**: GDPR compliant

### What Gets Tracked:

**Automatically tracked:**
- Page views (homepage, topic pages)
- Traffic sources (Google, direct, social)
- Geographic location (country/city)
- Device type (desktop, mobile)

**Outbound links tracked:**
- Every click on article links in [ArticleCard](frontend/src/components/cards/ArticleCard.tsx)
- Shows which articles users actually read
- Helps validate content quality

## 💰 Cost

- **First 30 days**: Free trial or $9/month
- **After trial**: $9/month (up to 10k pageviews)
- **Can cancel anytime** if project doesn't take off

## 🔗 Useful Links

- **Plausible Dashboard**: https://plausible.io/login
- **Plausible Docs**: https://plausible.io/docs
- **Privacy Policy**: https://plausible.io/privacy-focused-web-analytics
- **Your Privacy Page**: [/privacy](frontend/src/app/privacy/page.tsx)

## 🚨 Important Notes

1. **Data appears immediately** after deployment (no 24-48hr delay like GA4)
2. **No cookie banner needed** (Plausible is cookie-free)
3. **Outbound links** automatically tracked when users click article links
4. **Real-time data** available in dashboard
5. **Export data anytime** if you want to analyze further

## ✅ Next Steps

1. **Deploy your site** (Vercel, Netlify, or your host)
2. **Wait 24 hours** for search engines to start indexing
3. **Check dashboard daily** to see early signals
4. **After 7-10 days**, evaluate metrics and decide whether to continue

---

**Your analytics are ready! 🎉**

Once you deploy, data will start flowing immediately.
