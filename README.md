# BLOGG.ING MVP

A minimal, production-ready system that powers topic-based blog aggregation pages.

## Overview

BLOGG.ING aggregates and summarizes top blog posts for 25 curated topics. Each topic page displays:
- Topic title and description
- Last updated timestamp
- Top articles with AI-generated summaries
- Links to original sources

## Architecture

### Tech Stack
- **Database**: Supabase (PostgreSQL)
- **Workers**: Cloudflare Workers with Cron Triggers
- **Frontend**: Next.js (deployed to Vercel/Netlify)
- **APIs**: SERP API (Serper.dev) + OpenAI GPT-4o-mini

### Project Structure
```
blogging/
├── database/          # SQL schemas and migrations
├── workers/          # Cloudflare Workers
│   ├── crawler/      # Daily SERP crawler
│   └── summarizer/   # Daily AI summarization
├── frontend/         # Next.js application
└── docs/            # Additional documentation
```

## Workflows

### 1. Daily SERP Crawler (03:00 UTC)
- Fetches top search results for each active keyword
- Stores unique URLs in `sources` table
- Records results in `keyword_results` table

### 2. Daily Summarizer (04:00 UTC)
- Generates AI summaries for new URLs
- Uses title + snippet from SERP results
- Limits to 100 new summaries per day

### 3. Frontend
- Server-side rendered topic pages
- Dynamic route: `blogg.ing/[slug]`
- Displays latest crawl results with summaries

## Getting Started

See individual README files in each directory for setup instructions:
- [Database Setup](database/README.md)
- [Workers Setup](workers/README.md)
- [Frontend Setup](frontend/README.md)

## Development Status

Current phase: Initial setup
