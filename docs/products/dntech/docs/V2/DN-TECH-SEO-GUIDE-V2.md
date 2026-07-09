# DN Tech SEO Execution Guide
## Version 2.0 — Praktis & Achievable

**Document Version:** 2.0  
**Date:** Juli 2026  
**Responsibility:** Content Team + Dev Team  
**Last Updated:** Juli 2026

---

## 1. Quick Start: SEO Checklist (Week 1)

### Pre-Launch (Before Going Live)

- [ ] Install Google Analytics 4
  - Property ID: _________
  - Data stream configured
  - Tracking code in all pages

- [ ] Set up Google Search Console
  - Verify domain (DNS or HTML tag)
  - Submit XML sitemap
  - Check for manual actions/errors

- [ ] Create `sitemap.xml`
  - Auto-generated from Next.js
  - Includes all public pages
  - Excludes admin, drafts

- [ ] Create `robots.txt`
  ```
  User-agent: *
  Allow: /
  Disallow: /admin/
  Disallow: /api/
  
  Sitemap: https://dntech.id/sitemap.xml
  ```

- [ ] Security headers (Nginx/Next.js)
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  ```

- [ ] Canonical URLs
  - All pages have explicit `<link rel="canonical">`
  - Homepage: `<link rel="canonical" href="https://dntech.id" />`

- [ ] Meta tags (buildMetadata function)
  - Title (60 chars max, keyword-rich)
  - Description (160 chars max, compelling)
  - Open Graph image (1200x630px)
  - Twitter Card (if applicable)

- [ ] Structured Data (JSON-LD)
  - Homepage: Organization + LocalBusiness
  - Services page: Service schema
  - Blog posts: NewsArticle schema
  - Team page: Person schema
  - FAQ page: FAQPage schema

- [ ] Mobile Testing
  - Test on iPhone + Android
  - Google Mobile-Friendly Test (100%)
  - Lighthouse (Mobile > 80)

- [ ] SSL Certificate
  - HTTPS working on all pages
  - No mixed content warnings
  - Security headers present

---

## 2. Month 1: Foundation (Jul 2026)

### Week 1: Setup & Configuration

**Goals:** Get infrastructure right, create 1-2 articles

**Tasks:**

| Task | Owner | Status |
|------|-------|--------|
| GA4 + Search Console live | Dev | ⬜ |
| Robots.txt + Sitemap live | Dev | ⬜ |
| Structured data implemented | Dev | ⬜ |
| Meta tags template ready | Dev | ⬜ |
| Keyword research completed | Content | ⬜ |
| First blog article written | Content | ⬜ |
| SEO brief template ready | Content | ⬜ |

**Blog Article 1:**
- Title: "Memilih Tech Stack untuk MVP Startup"
- Target Keyword: "tech stack startup", "MVP development"
- Length: 1500-2000 words
- Internal links: 3-5
- Published: First week of launch

### Week 2-3: Launch & First Traffic

**Goals:** Soft launch, monitor errors, publish second article

**Blog Article 2:**
- Title: "DevOps Basics: Production Readiness Checklist"
- Target Keyword: "DevOps", "production deployment"
- Length: 1200-1500 words
- Published: Week 2

**Content:**
- Homepage finalized
- Services pages written (at least 4)
- Team members added with bios
- About page complete

**Monitoring:**
- Check Console for crawl errors daily
- Monitor bounce rate (target < 50%)
- Track initial leads

### Week 4: Optimization & Planning

**Goals:** Fix any issues, plan month 2, publish article 3

**Blog Article 3:**
- Title: "Outsourcing vs In-House Development: Mana yang Lebih Baik?"
- Target Keyword: "outsourcing development", "development agency"
- Length: 1500-2000 words
- Published: Week 4

**Monthly Review:**
- Analytics: traffic, users, bounce rate
- Search Console: impressions, clicks, rankings
- Conversion funnel: leads generated
- Page speed: Core Web Vitals
- Issues found & fixes scheduled

---

## 3. Month 2-3: Content Ramp-up (Aug-Sep 2026)

### Publishing Schedule

**August (Month 2)**

| Week | Article Title | Target Keyword | Length |
|------|---------------|-----------------|--------|
| 1 | Security Best Practices untuk Aplikasi Web | web app security | 1500 words |
| 2 | Database Selection: PostgreSQL vs MongoDB | database comparison | 1800 words |
| 3 | Building Scalable APIs: Lessons from Real Projects | API design | 1600 words |
| 4 | Version Control & Git Workflow untuk Tim Distributed | git workflow, version control | 1200 words |

**September (Month 3)**

| Week | Article Title | Target Keyword | Length |
|------|---------------|-----------------|--------|
| 1 | Testing Strategy untuk Startup: Unit, Integration, E2E | testing strategies | 1400 words |
| 2 | Cost Optimization: Cara Menghemat Cloud Infrastructure | cloud cost | 1300 words |
| 3 | UI/UX Principles untuk Developer | UI/UX | 1200 words |
| 4 | Startup Playbook: From Idea to MVP in 8 Weeks | startup guide | 2000 words |

### Content Pillar Strategy

**Build topical authority around 3 main pillars:**

### Pillar 1: "Tech Stack & Architecture"
```
Main article: "Complete Guide to Modern Tech Stack 2026"
  ├── MVP Tech Stack
  ├── Database Selection
  ├── API Design Patterns
  ├── DevOps Basics
  └── Scaling Strategies
```

**Internal linking:** All related articles link to pillar content.

### Pillar 2: "Startup Development Guide"
```
Main article: "Complete Startup Development Playbook"
  ├── From Idea to MVP
  ├── MVP Development Strategy
  ├── Team Structure
  ├── Cost Optimization
  └── Growth After MVP
```

### Pillar 3: "Technology Best Practices"
```
Main article: "Essential Best Practices for Modern Development"
  ├── Security Practices
  ├── Testing Strategies
  ├── Git Workflow
  ├── Code Quality
  └── Performance Optimization
```

---

## 4. Keyword Research & Targeting

### Primary Keywords (High Conversion Intent)

Search in Google, check search volume with tools like Ahrefs, SEMrush, or Google Keyword Planner:

| Keyword | Volume | CPC | Difficulty | Target Page | Status |
|---------|--------|-----|-----------|------------|--------|
| software development Indonesia | 2.9K | $0.50 | High | `/services` | 📝 |
| custom app development Jakarta | 890 | $0.40 | Med | `/services/custom-app` | 📝 |
| startup tech consultant | 1.2K | $0.35 | Med | `/services/consulting` | ⬜ |
| sewa developer Indonesia | 1.5K | $0.30 | High | `/services` | 📝 |
| tim development outsource | 620 | $0.25 | Med | `/services` | 📝 |

### Secondary Keywords (Long-tail, Low Competition)

| Keyword | Intent | Target Page |
|---------|--------|------------|
| MVP development Indonesia | High | `/blog/mvp-development` |
| tech stack untuk startup | High | `/blog/choosing-tech-stack` |
| remote developer Indonesia | Medium | `/careers` |
| website development company Jakarta | High | `/services/web-dev` |
| API integration services | Medium | `/services/integration` |
| Next.js development Indonesia | Medium | `/blog/nextjs-guide` |
| React developer hire Indonesia | High | `/careers` |
| DevOps services Indonesia | Medium | `/services/devops` |

---

## 5. On-Page SEO Checklist

### Apply to Every Page

**Use this checklist for every new page/article:**

#### Title Tag & Meta Description

```
✓ Title: 50-60 characters
✓ Include primary keyword
✓ Avoid keyword stuffing
✓ Frontload keyword (keyword first if possible)

Example: "Tech Stack for Startup MVP | DN Tech Guide"

✓ Meta description: 150-160 characters
✓ Include keyword variation
✓ Compelling (include benefit or call-to-action)
✓ No keyword stuffing

Example: "Learn which technologies to choose for your startup MVP. PostgreSQL vs MongoDB? React vs Vue? Complete guide inside."
```

#### URL Structure

```
✓ Use keywords in slug
✓ Lowercase only
✓ Hyphens for spaces
✓ No numbers (unless significant)
✓ 3-5 words max

Good: /blog/tech-stack-startup-guide
Bad:  /blog/1234-tech-stack
```

#### Heading Structure (H1, H2, H3)

```
✓ Only ONE H1 per page
✓ H1 = main topic, include primary keyword
✓ H2s = major sections, include related keywords
✓ H3s = subsections, naturally placed
✓ Logical hierarchy (don't skip levels)

Structure:
H1: "Tech Stack for Startup MVP: Complete Guide"
  H2: "Why Tech Stack Matters for Your MVP"
  H2: "Frontend Technologies"
    H3: "React vs Vue: Which to Choose?"
  H2: "Backend Technologies"
```

#### Content Quality

```
✓ Minimum 1000-1500 words for blog posts
✓ Answer user's search intent completely
✓ Unique perspective/insights
✓ Real examples from actual projects
✓ No AI-generated fluff content
✓ Conversational, not robotic
✓ Break into digestible sections
✓ Include data/statistics (cite sources)
```

#### Internal Linking

```
✓ 3-5 internal links per blog post
✓ Anchor text is keyword-rich (not "click here")
✓ Link to related content
✓ Mix of pillar pages + supporting content

Example:
"We recommend PostgreSQL for most projects. 
If you're unsure between databases, 
read our [database selection guide](/blog/database-selection)."
```

#### External Linking

```
✓ 1-3 external links to authoritative sites
✓ Open in new tab (target="_blank" rel="noopener")
✓ Link to well-known sources (GitHub, MDN, etc.)
✓ Improves credibility
```

#### Images & Media

```
✓ At least one image per page
✓ Descriptive alt text (not just filename)
✓ Compressed & WebP format
✓ 1200x630px for featured image (blog)
✓ Lazy loading enabled
✓ Responsive sizing
✓ No copyright issues

Alt text example:
"Screenshot of VS Code terminal running 'npm run dev' 
for Next.js project setup"
```

#### Structured Data (Schema Markup)

**Homepage Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DN Tech",
  "url": "https://dntech.id",
  "logo": "https://dntech.id/rlogo2.png",
  "description": "Software development house providing custom app development and tech consulting",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Example #123",
    "addressLocality": "Jakarta",
    "addressCountry": "ID"
  },
  "sameAs": [
    "https://linkedin.com/company/dntech",
    "https://github.com/dntech"
  ]
}
```

**Blog Post Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Tech Stack for Startup MVP: Complete Guide",
  "image": "https://dntech.id/images/tech-stack.png",
  "datePublished": "2026-07-15",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "description": "Learn which technologies to choose for your startup MVP..."
}
```

**Service Page Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Custom App Development",
  "description": "End-to-end custom application development...",
  "provider": {
    "@type": "Organization",
    "name": "DN Tech"
  },
  "areaServed": "ID"
}
```

---

## 6. Technical SEO Requirements

### Core Web Vitals (Must Pass)

| Metric | Target | Tools to Test |
|--------|--------|--------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | PageSpeed Insights, Chrome DevTools |
| **FID** (First Input Delay) | < 100ms | Web Vitals extension, Chrome DevTools |
| **CLS** (Cumulative Layout Shift) | < 0.1 | PageSpeed Insights |

**How to test:**
1. Go to https://pagespeed.web.dev
2. Enter your page URL
3. Check "Mobile" tab
4. All metrics must be GREEN

**Common fixes:**
- Lazy load images
- Compress images
- Defer non-critical CSS/JS
- Use Next.js Image component
- Avoid layout shifts (reserve space for ads/images)

### Mobile Optimization

**Test on real device or Chrome DevTools:**
- [ ] Font size readable (16px minimum)
- [ ] Buttons clickable (48px minimum)
- [ ] No horizontal scrolling
- [ ] Touch elements spaced (8px apart minimum)
- [ ] Forms work on mobile keyboard

### Page Speed

**Optimization checklist:**

- [ ] Images compressed (TinyPNG.com)
- [ ] Images lazy loaded (`loading="lazy"`)
- [ ] CSS minified (Tailwind does this)
- [ ] JavaScript minified (build process)
- [ ] Caching enabled (browser + server)
- [ ] CDN used for assets (optional but recommended)
- [ ] No render-blocking resources

**Test:**
```bash
# Local testing
npm run build && npm run start
# Then check performance in Chrome DevTools (Lighthouse tab)
```

### Indexing & Crawlability

**Check Search Console monthly:**

1. Google Search Console → Coverage
   - [ ] No errors (critical)
   - [ ] No warnings (important)
   - [ ] All pages indexed

2. Google Search Console → Enhancements
   - [ ] Mobile Usability (0 errors)
   - [ ] Core Web Vitals (all GREEN or NEED IMPROVEMENT)

3. Check robots.txt
   ```
   # Search Console → Settings → Crawl → Test robots.txt
   ```

### Security Headers

**Check in response headers:**

```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

**Test:** https://securityheaders.com

---

## 7. Link Building Strategy

### Phase 1: Natural Links (Months 1-3)

**Goal:** 5-10 quality backlinks minimum

**Tactics:**

1. **Tech Community Mentions**
   - Post articles on dev.to
   - Share on IndoWebDev
   - Contribute to Tech Twitter (Indonesia)
   - Link back to original post

2. **Guest Posts**
   - Outreach to tech blogs (medium authority)
   - Offer 1-2 free guest posts
   - Include author bio with link back

3. **Press Coverage**
   - Send press release for launch
   - Reach out to tech journalists
   - Feature in startup news sites

4. **Social Media Mentions**
   - LinkedIn company page (share articles)
   - Twitter tech community
   - GitHub README mentions

### Phase 2: Strategic Links (Months 4-6)

**Goal:** 20-30 quality backlinks

**Tactics:**
- Tech directories (Indonesia-focused)
- Startup awards/listings (if applicable)
- Resource pages linking to guides
- HARO (Help A Reporter Out) responses

### DO NOT DO ❌

- ❌ Buy backlinks
- ❌ PBN (Private Blog Network) links
- ❌ Link schemes/exchange
- ❌ Comment spam
- ❌ Forum spam

---

## 8. Content Creation Best Practices

### Research Phase (1-2 hours)

1. Search keyword on Google
2. Read top 5 results
3. Find gaps/opportunities
4. Outline improvements

### Writing Phase (2-3 hours)

1. Write outline (5-7 main sections)
2. Fill each section with:
   - Main idea
   - Supporting details
   - Real examples
   - Code snippets (if technical)
3. Conversational tone (like talking to friend)
4. Proofread & edit

### Optimization Phase (1 hour)

- [ ] Check title/meta (60 chars, keyword)
- [ ] Check H1/H2 structure
- [ ] Verify internal links (3-5)
- [ ] Check image alt text
- [ ] Verify word count (1500+ for blog)
- [ ] Spell/grammar check
- [ ] Add schema markup

### Publishing Checklist

- [ ] Slug is SEO-friendly
- [ ] Featured image uploaded (1200x630px)
- [ ] Author assigned
- [ ] Category/tags added
- [ ] Meta description ready
- [ ] Internal links added
- [ ] External links verified
- [ ] Mobile preview checked
- [ ] Scheduled/published
- [ ] Shared on social media

---

## 9. Monthly SEO Tasks

### Week 1: Planning & Research

- [ ] Review previous month analytics
- [ ] Plan articles for next month
- [ ] Keyword research for new content
- [ ] Content calendar updated
- [ ] Check competitor new articles

### Week 2: Content Creation & Publishing

- [ ] Write 1-2 blog articles
- [ ] Optimize existing content
- [ ] Publish scheduled articles
- [ ] Share on social media
- [ ] Submit new URLs to Search Console

### Week 3: Monitoring & Analysis

- [ ] Check Google Search Console
  - New keywords appearing?
  - Click-through rate issues?
  - Crawl errors?
- [ ] Analytics review
  - Top performing pages?
  - Bounce rate trends?
  - Conversion funnel?
- [ ] Core Web Vitals status
- [ ] Ranking tracking (if using tool)

### Week 4: Optimization & Cleanup

- [ ] Fix any technical issues
- [ ] Improve underperforming pages
- [ ] Remove/consolidate duplicate content
- [ ] Build links (outreach, guest posts)
- [ ] Plan next month content

---

## 10. Tools & Resources

### Essential Tools

| Tool | Cost | Purpose | Status |
|------|------|---------|--------|
| Google Analytics 4 | Free | Traffic tracking | ✅ Setup required |
| Google Search Console | Free | Keyword rankings, indexing | ✅ Setup required |
| Google PageSpeed Insights | Free | Performance testing | ✅ Use before publishing |
| Lighthouse | Free (built-in Chrome) | Page audits | ✅ Use before publishing |

### Optional Tools (Recommended)

| Tool | Cost | Purpose |
|------|------|---------|
| Ahrefs | $99-999/mo | Keyword research, backlinks |
| SEMrush | $99-999/mo | Keyword research, competitor analysis |
| Google Keyword Planner | Free (with Ads account) | Keyword volume, CPC |
| Grammarly | Free-$12/mo | Grammar & readability |
| TinyPNG | Free-$108/mo | Image compression |

### Bookmarks to Keep

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Search Console](https://search.google.com/search-console/)
- [Analytics 4](https://analytics.google.com/)
- [SERP Checker (free tool)](https://www.semrush.com/analytics/serp-checker/)
- [Web.dev Learning Path](https://web.dev/learn/)

---

## 11. SEO Success Metrics & Dashboard

### Dashboard Setup (Google Sheets Template)

Create a simple spreadsheet to track:

```
Date       | Organic Traffic | Users  | Sessions | Leads | Avg Duration | Bounce Rate
07/15/2026 | 125            | 98     | 115      | 2     | 1m 45s      | 42%
07/22/2026 | 187            | 152    | 172      | 4     | 2m 12s      | 38%
```

### Monthly Reporting

**Review once per month:**

| Metric | Jul | Aug | Sep | Target |
|--------|-----|-----|-----|--------|
| Organic Traffic | 200 | 350 | 500+ | 500+ |
| Organic Users | 150 | 280 | 400+ | 400+ |
| Leads (organic) | 3 | 8 | 15+ | 15+ |
| Avg Session Duration | 1:45 | 2:10 | 2:30+ | 2:30+ |
| Pages per Session | 1.2 | 1.5 | 1.8+ | 1.8+ |
| Bounce Rate | 50% | 45% | 40% | < 40% |

---

## 12. Common SEO Mistakes to Avoid

### Content Mistakes ❌

- ❌ Duplicate content (same article on multiple URLs)
- ❌ Thin content (< 300 words on main pages)
- ❌ Keyword stuffing ("best best best developer")
- ❌ Outdated information (not updated for 6 months)
- ❌ No author/date information
- ❌ AI-generated content with no human review

### Technical Mistakes ❌

- ❌ Site not mobile-friendly
- ❌ Slow page speed (LCP > 3s)
- ❌ No XML sitemap or robots.txt
- ❌ Broken links (404s)
- ❌ No SSL certificate (HTTP instead of HTTPS)
- ❌ Duplicate pages (same content, different URLs)

### Linking Mistakes ❌

- ❌ No internal links on pages
- ❌ All links go to homepage
- ❌ External links to low-quality sites
- ❌ Buying backlinks
- ❌ Link schemes or PBNs

### Strategy Mistakes ❌

- ❌ Publishing once then abandoning blog
- ❌ Only targeting competitive keywords (no long-tail)
- ❌ No analytics/tracking setup
- ❌ Not reading Search Console errors
- ❌ No content calendar or planning

---

## 13. SEO Roadmap: 6-12 Months

### Months 1-3: Foundation
- ✅ Technical SEO setup
- ✅ Content publishing (12 articles)
- ✅ Basic link building
- **Target:** 500+ organic traffic/month, 15+ leads

### Months 4-6: Scale
- ✅ Topical authority building
- ✅ Content expansion (more articles)
- ✅ Link building (press, guest posts)
- ✅ First case study published
- **Target:** 1000+ organic traffic/month, 30+ leads

### Months 7-12: Mature
- ✅ Ranking improvements
- ✅ Content updates & refreshes
- ✅ Strategic partnerships
- ✅ Multiple case studies
- ✅ Industry recognition
- **Target:** 2000+ organic traffic/month, 50+ leads

---

## 14. Competitive Analysis (Basic)

### Competitors to Monitor

Identify 5-7 competitors and track:

1. **Website speed** — How fast are they?
2. **Content** — How many articles? What topics?
3. **Backlinks** — Where are their links from?
4. **Rankings** — What keywords rank for?

**Quick analysis tool:** Ahrefs free site audit or SEMrush free trial

### Your Advantage

As a startup:
- ✅ Authentic voice (not corporate buzzwords)
- ✅ Niche expertise (specific tech stack focus)
- ✅ Faster decision-making (vs big agencies)
- ✅ Real team (not generic stock photos)

---

## 15. Q&A: Common Questions

**Q: How long until ranking for main keywords?**  
A: 3-6 months for established keywords, depends on competition. Easy keywords (long-tail) can rank in 4-8 weeks.

**Q: How often should we publish?**  
A: Consistency > frequency. 2-4 per month is sustainable and shows SEO juice. Better than 10/month then nothing.

**Q: Do we need backlinks?**  
A: Yes, but quality > quantity. 10 links from authority sites > 100 from random blogs.

**Q: What about social media for SEO?**  
A: Social doesn't directly help rankings, but it drives traffic and engagement, which helps indirectly.

**Q: Should we do paid ads for SEO?**  
A: No, paid ads don't help organic SEO. But they can speed up initial lead generation while SEO ramps up.

**Q: Is our website ready for SEO?**  
A: If all items in Section 1 checklist are done, yes!

---

## Appendix: SEO Checklist Template

### Copy/Paste for Each New Page

```markdown
## [Page Title]

### Metadata
- [ ] Title (60 chars): 
- [ ] Meta description (160 chars):
- [ ] Canonical URL: 
- [ ] Primary keyword:
- [ ] Related keywords:

### Content
- [ ] H1 (include primary keyword):
- [ ] H2s (section headings):
- [ ] Word count (target 1500+): 
- [ ] Internal links (3-5):
- [ ] External links (1-3):

### Images
- [ ] Featured image (1200x630px):
- [ ] Alt text complete:
- [ ] Compressed/WebP:

### Schema
- [ ] Schema type selected:
- [ ] JSON-LD added:
- [ ] Schema validated:

### Performance
- [ ] Lighthouse score > 80:
- [ ] Core Web Vitals all GREEN:
- [ ] Mobile friendly (100%):

### Publishing
- [ ] Slug SEO-friendly:
- [ ] Published/scheduled:
- [ ] Shared on social:
- [ ] Submitted to Search Console:
```

---

**Prepared by:** SEO/Content Team  
**Last Updated:** Juli 2026  
**Next Review:** Agustus 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
