# Slug Variant Strategy Guide

This guide helps you create high-quality slug variants for SEO optimization.

## 🎯 Optimal Number Per Topic

- **5-10 variants** = Sweet spot
- **10-20 variants** = Diminishing returns
- **20+ variants** = Overkill (create new topics instead)

---

## 📋 Variant Categories & Examples

### 1. **Question Formats** (Informational Intent)
People often search as questions. Target "how", "what", "where", "when" queries.

**Pattern:**
- `where-to-{action}-{topic}-{year}`
- `how-to-{action}-{topic}`
- `what-are-best-{topic}`

**Examples for "Best Budget Travel Destinations 2025":**
- `where-to-travel-cheap-2025`
- `how-to-find-budget-destinations`
- `what-are-cheapest-countries-to-visit`

---

### 2. **Long-tail Keywords** (Specific Audiences)
Target niche audiences with specific needs.

**Pattern:**
- `{topic}-for-{audience}`
- `{adjective}-{topic}-{audience}`

**Examples:**
- `budget-travel-destinations-families`
- `cheap-solo-travel-spots`
- `affordable-honeymoon-destinations`
- `budget-backpacking-europe`

---

### 3. **Year Variations** (Time-sensitive)
Include current year for freshness signals.

**Pattern:**
- `{topic}-{year}`
- `{adjective}-{noun}-{year}`

**Examples:**
- `budget-travel-2025`
- `cheap-destinations-2025`
- `best-affordable-trips-2025`

---

### 4. **Intent Variations** (Search Intent Types)

**Informational Intent:**
- `best-{topic}`
- `top-{topic}`
- `ultimate-guide-{topic}`

**Transactional Intent:**
- `book-{topic}`
- `find-{topic}`
- `get-{topic}`

**Examples:**
- `best-cheap-vacations` (informational)
- `book-budget-travel` (transactional)
- `find-affordable-flights` (transactional)

---

### 5. **Synonym Variations** (Different Word Choices)
Use synonyms for main keywords.

**Budget synonyms:**
- cheap, affordable, budget-friendly, low-cost, economical, inexpensive

**Travel synonyms:**
- travel, vacation, trip, holiday, getaway, destination

**Examples:**
- `cheap-vacation-spots`
- `affordable-holiday-destinations`
- `low-cost-travel-ideas`

---

### 6. **Regional/Geographic Variations**
Target specific regions or countries.

**Pattern:**
- `{topic}-in-{region}`
- `{region}-{topic}`

**Examples:**
- `budget-travel-europe`
- `cheap-asia-destinations`
- `affordable-caribbean-vacations`

---

## 🚀 How to Use This Guide

### Step 1: Pick 1-2 variants from EACH category above
Don't just pile on synonyms. Mix categories for diversity.

### Step 2: SQL Command Template
```sql
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, variant FROM keywords, (VALUES
  ('variant-slug-1'),
  ('variant-slug-2'),
  ('variant-slug-3'),
  ('variant-slug-4'),
  ('variant-slug-5')
) AS variants(variant)
WHERE slug = 'your-canonical-slug';
```

### Step 3: Example Implementation

**For topic: "best-budget-travel-destinations-2025"**

Pick one from each category:
1. Question: `where-to-travel-cheap-2025`
2. Long-tail: `budget-travel-destinations-families`
3. Year: `cheap-destinations-2025` ✓ (already have)
4. Intent: `find-budget-vacation-deals`
5. Synonym: `affordable-travel-spots`
6. Regional: `budget-travel-europe`

```sql
INSERT INTO slug_variants (keyword_id, variant_slug)
SELECT id, variant FROM keywords, (VALUES
  ('where-to-travel-cheap-2025'),
  ('budget-travel-destinations-families'),
  ('find-budget-vacation-deals'),
  ('affordable-travel-spots'),
  ('budget-travel-europe')
) AS variants(variant)
WHERE slug = 'best-budget-travel-destinations-2025';
```

---

## ✅ Checklist for Quality Variants

Before adding a variant, ask:

- [ ] Is this semantically different from existing variants?
- [ ] Would someone actually search this phrase?
- [ ] Does it target a different search intent or audience?
- [ ] Is it specific enough to be useful?
- [ ] Does it follow natural language patterns?

---

## 🔍 Data-Driven Approach

Once your site is live:

1. **Use Google Search Console** to see:
   - What keywords people search for
   - Which queries drive clicks
   - Position for different keywords

2. **Add variants based on REAL data:**
   - High impression, low click = add variant
   - Position 11-20 = opportunity to rank better

3. **Monitor and iterate:**
   - Remove variants with zero traffic after 3 months
   - Add new variants based on trending searches

---

## 🎨 Creative Variant Examples

### Travel Topic:
- `best-budget-travel-destinations-2025` (canonical)
- `where-to-travel-cheap` (question)
- `affordable-family-vacations` (long-tail)
- `budget-travel-tips-2025` (year + how-to)
- `find-cheap-flights-hotels` (transactional)

### Tech/Productivity Topic:
- `ai-tools-for-productivity` (canonical)
- `best-ai-productivity-apps`
- `how-to-use-ai-for-work`
- `ai-automation-tools-2025`
- `free-ai-tools-students`

### Finance Topic:
- `personal-finance-tips` (canonical)
- `how-to-save-money-fast`
- `budgeting-tips-beginners`
- `personal-finance-advice-2025`
- `money-management-strategies`

---

## 📊 Performance Tracking

Track these metrics per variant (via Search Console):

- **Impressions** - How often it appears in search
- **Clicks** - How many people click
- **CTR** - Click-through rate
- **Position** - Average ranking position

**Good variant:** High impressions + decent CTR
**Bad variant:** Low impressions after 3+ months = remove

---

## 💡 Pro Tips

1. **Don't stuff keywords** - Variants should read naturally
2. **Target different intents** - Mix informational + transactional
3. **Think like a user** - What would YOU search for?
4. **Use answer-focused variants** - "how-to", "best-way-to", etc.
5. **Include modifiers** - "for beginners", "2025", "complete guide"

---

## 🛠 Quick Reference Commands

### View all variants for a topic:
```sql
SELECT sv.variant_slug, k.slug as canonical_slug
FROM slug_variants sv
JOIN keywords k ON k.id = sv.keyword_id
WHERE k.slug = 'your-topic-slug';
```

### Delete a variant:
```sql
DELETE FROM slug_variants WHERE variant_slug = 'slug-to-remove';
```

### Count variants per topic:
```sql
SELECT k.slug, COUNT(sv.id) as variant_count
FROM keywords k
LEFT JOIN slug_variants sv ON sv.keyword_id = k.id
GROUP BY k.id, k.slug
ORDER BY variant_count DESC;
```

---

**Remember:** Quality over quantity. 5 well-researched variants beat 20 random ones.
