# DN Tech PRD v2 — What's Changed?
## Summary & Implementation Guide

**Date:** Juli 2026  
**Status:** Ready for Implementation

---

## 📋 What You Got

Berikut 3 dokumen utama untuk PRD v2:

### 1. **DN-TECH-PRD-V2.md** (45+ pages)
Complete product requirements document dengan:
- ✅ Executive summary & goals
- ✅ Target audience & personas
- ✅ Feature set realistic untuk startup
- ✅ Content management strategy
- ✅ Marketing & launch plan
- ✅ Analytics & measurement framework
- ✅ Launch checklist

### 2. **DN-TECH-DESIGN-SYSTEM-V2.md** (40+ pages)
Comprehensive design system dengan:
- ✅ Philosophy (no glasmorphism, no AI design)
- ✅ Solid color palette (Deep Blue, Teal, Orange)
- ✅ Typography & spacing grid
- ✅ Component library (buttons, forms, cards)
- ✅ Accessibility guidelines (WCAG 2.1 AA)
- ✅ Mobile-first approach
- ✅ Brand voice & copy guidelines

### 3. **DN-TECH-SEO-GUIDE-V2.md** (50+ pages)
SEO execution guide dengan:
- ✅ Week 1 checklist (setup)
- ✅ 3-month content calendar
- ✅ Keyword research & targeting
- ✅ On-page SEO checklist
- ✅ Technical SEO requirements
- ✅ Link building strategy
- ✅ Monthly tasks & dashboard
- ✅ 6-12 month roadmap

---

## 🔄 Key Differences: v1 → v2

### 1. Data & Content

| Aspek | v1 | v2 |
|-------|----|----|
| **Portfolio** | Hardcoded demo projects | Empty state until real clients |
| **Testimonials** | Fake quotes | Wait for real feedback or none |
| **Statistics** | "10+ projects completed" | Only real numbers: "Founded 2026" |
| **Case Studies** | Simulated clients | Only publish when available |
| **Team** | Stock photos | Real team photos only |
| **Services** | 10 generic services | 5-8 services we actually do well |

**Action:** Remove ALL fake/demo data from database and frontend.

---

### 2. Design Approach

| Aspek | v1 | v2 |
|-------|----|----|
| **Colors** | Gradients, multiple overlays | Solid colors only |
| **Components** | Glassmorphism (blurred backgrounds) | Clean, flat design |
| **Animations** | Heavy, trendy animations | Minimal, purposeful motion |
| **Images** | Mix of stock + AI | Real photos only |
| **Icons** | Mixed sources | Lucide React only |
| **Overall** | "Modern AI-looking" | Timeless, professional, trustworthy |

**Action:** Redesign UI to use solid colors, remove all gradient/blur effects, replace stock photos with real team photos.

**Design checklist:**
- [ ] Remove all `background: linear-gradient()`
- [ ] Remove all `box-shadow: inset` or heavy shadows
- [ ] Replace stock images with real team photos
- [ ] Use Tailwind solid color classes only
- [ ] Test every component for glassmorphism → solid color

---

### 3. SEO Strategy

| Aspek | v1 | v2 |
|-------|----|----|
| **Keywords** | Vague targeting | Specific keyword research |
| **Content Calendar** | Not defined | 12 articles in first 3 months |
| **Blog Focus** | General tech content | 3 main content pillars |
| **Publishing** | Ad-hoc | Consistent 2-4/month |
| **Internal Linking** | Minimal | Strategic (3-5 per article) |
| **Monitoring** | Google Analytics only | GA4 + Search Console + monthly reviews |
| **Link Building** | Not mentioned | Guest posts + tech community |

**Action:** Implement full SEO strategy from guide. Start with month 1 keyword research and article plan.

---

### 4. Content Management

| Aspek | v1 | v2 |
|-------|----|----|
| **Portfolio** | CMS for management | CMS present but keep empty until real clients |
| **Testimonials** | CMS for management | Don't add fake testimonials |
| **Blog Status** | Draft/published | Draft/published/scheduled |
| **Content Approval** | Basic | Defined editorial process |
| **Publishing Rules** | Not defined | Clear guidelines (no buzzwords, be honest) |

**Action:** Update content moderation guidelines to enforce authenticity.

---

### 5. Marketing & Launch

| Aspek | v1 | v2 |
|-------|----|----|
| **Go-live** | Generic launch | Planned soft launch → full launch |
| **Content prep** | Not specified | 3-4 articles before launch |
| **Audience** | Enterprise-focused | Startup/SME focused |
| **Lead source** | Not emphasized | Organic (SEO) primary, form secondary |
| **Follow-up process** | Not defined | 24-hour response SLA |

**Action:** Execute launch plan with pre-written articles and team preparation.

---

## 🚀 Implementation Roadmap

### Week 1: Design & Branding Update

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Audit current website for glasmorphism/gradients
- [ ] Design color palette review (Deep Blue #1E3A8A, Teal #0D9488)
- [ ] Component library update (buttons, cards, forms)
- [ ] Remove all stock photos
- [ ] Schedule professional headshots for team
- [ ] Update Tailwind config (remove custom gradients)

**Owner:** Design Team  
**Effort:** 3-5 days  
**Deliverable:** Updated Figma file or component library

---

### Week 2: Data Cleanup & Content

**Priority:** 🔴 CRITICAL

**Tasks:**
- [ ] Remove fake/demo portfolio items
- [ ] Remove fake testimonials
- [ ] Update statistics to real numbers only
- [ ] Review all copy for buzzwords
- [ ] Rewrite vague/generic descriptions
- [ ] Create content moderation guidelines
- [ ] Define "authentic voice" guidelines

**Owner:** Content Team + Product  
**Effort:** 2-3 days  
**Deliverable:** Clean database + content guidelines doc

---

### Week 3: SEO Setup & Planning

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Install GA4 + Search Console
- [ ] Create sitemap.xml
- [ ] Set up robots.txt
- [ ] Keyword research (use attached guide)
- [ ] Create content calendar (12 articles)
- [ ] Write/schedule first 2 blog articles
- [ ] Set up SEO checklist template

**Owner:** Content Team + Dev  
**Effort:** 4-5 days  
**Deliverable:** Live GA4/SC + first 2 articles published

---

### Week 4: Frontend Updates

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Update all page layouts (solid colors)
- [ ] Replace all images with real photos
- [ ] Update team member bios
- [ ] Test Core Web Vitals (should be GREEN)
- [ ] Test mobile responsiveness
- [ ] Fix any accessibility issues
- [ ] Add schema markup (JSON-LD)

**Owner:** Dev Team  
**Effort:** 5-7 days  
**Deliverable:** Updated production website

---

### Month 2: Content & Marketing

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Publish 4 blog articles (from calendar)
- [ ] Social media strategy (LinkedIn focus)
- [ ] Prepare launch announcement
- [ ] Set up lead nurturing flow
- [ ] Create case study template (for future)
- [ ] Build 2-3 backlinks (guest posts)

**Owner:** Content Team + Marketing  
**Effort:** Ongoing  
**Deliverable:** 4 published articles + launch plan

---

### Month 3: Launch & Optimization

**Priority:** 🟡 HIGH

**Tasks:**
- [ ] Soft launch (testing phase)
- [ ] Monitor errors & fix issues
- [ ] Publish 4 more articles
- [ ] Analyze first traffic data
- [ ] Optimize underperforming pages
- [ ] Monthly SEO review & planning

**Owner:** All teams  
**Effort:** Ongoing  
**Deliverable:** Live production site + traffic dashboard

---

## ✅ Pre-Launch Checklist (Use This)

### Design & Branding
- [ ] No gradients or glassmorphism
- [ ] All text readable (16px minimum)
- [ ] All buttons 48px+ tall (mobile)
- [ ] All images real photos (no stock, no AI)
- [ ] Colors match solid palette (no custom colors)

### Content
- [ ] No fake testimonials or client logos
- [ ] No exaggerated statistics
- [ ] Portfolio/case studies empty or real only
- [ ] All copy: honest, clear, no buzzwords
- [ ] Team members have real bios + real photos

### SEO
- [ ] Meta titles on all pages (60 chars)
- [ ] Meta descriptions on all pages (160 chars)
- [ ] H1 tags correct (one per page)
- [ ] 3-5 internal links per article
- [ ] Images have alt text
- [ ] XML sitemap created
- [ ] robots.txt created
- [ ] Schema markup (JSON-LD) added

### Technical
- [ ] HTTPS working
- [ ] Mobile responsive (tested on device)
- [ ] Core Web Vitals all GREEN
- [ ] Lighthouse score > 80
- [ ] No broken links
- [ ] GA4 + Search Console live
- [ ] Forms tested (submit, email received)

### Marketing
- [ ] LinkedIn company page ready
- [ ] First 3 blog articles written
- [ ] Email for lead notifications set up
- [ ] Contact form CRM integration working
- [ ] Launch announcement drafted

---

## 📊 Success Metrics (Track These)

### Month 1 (July 2026)
- [ ] Website live & zero errors
- [ ] GA4 tracking users
- [ ] First 3-4 blog articles published
- [ ] 50-100 organic users
- [ ] 2-3 leads from forms

### Month 2 (August 2026)
- [ ] 200+ organic monthly users
- [ ] 5-8 leads from organic
- [ ] 8 blog articles published
- [ ] Core Web Vitals maintained GREEN

### Month 3 (September 2026)
- [ ] 300-500 organic monthly users
- [ ] 10-15 leads from organic
- [ ] 12 blog articles published
- [ ] First keyword ranking (page 2-3)

### Month 6 (December 2026)
- [ ] 800-1000+ organic monthly users
- [ ] 20-30 leads/month
- [ ] 25+ blog articles
- [ ] 3-5 keywords ranking page 1

---

## 🎯 Quick Win: First Week Tasks

**If you only do these, you'll see immediate improvement:**

1. **Monday:** Audit site for fake data
   - Screenshot all "portfolio items" that are fake
   - List all fake testimonials
   - Note all fake statistics

2. **Tuesday:** Keyword research
   - Use Google Keyword Planner (free)
   - Research 10-15 keywords related to your services
   - Document search volume & difficulty

3. **Wednesday:** First blog article
   - Pick top-ranking keyword from research
   - Write 1500+ word guide
   - Add meta tags, internal links, images

4. **Thursday:** Design audit
   - Take screenshot of current site
   - Check every element for gradients/shadows
   - Make list of components to update

5. **Friday:** Setup monitoring
   - Install GA4
   - Set up Search Console
   - Create SEO tracking spreadsheet

---

## ❓ FAQ

**Q: Do we need to redesign the entire website?**  
A: No, mostly component-level updates. Update colors, remove effects, replace images. UI layout can stay same.

**Q: How much time will implementation take?**  
A: 2-3 weeks for design + dev updates. Content/blog is ongoing. Full SEO traction takes 3-6 months.

**Q: Should we delay launch for perfect design?**  
A: No. Launch with solid design, then improve SEO gradually. Done > perfect.

**Q: What if we don't have real client projects yet?**  
A: That's fine. Portfolio/case studies can stay empty. Focus on thought leadership blog instead.

**Q: Can we fake some data "for now"?**  
A: Not recommended. Users can tell. Better to show "startup" authenticity than fake enterprise credibility.

**Q: Which is most important: design, content, or SEO?**  
A: All three matter. But for a startup with limited budget: Content (blog) > SEO setup > Design polish. Start with authentic content.

---

## 📞 Questions or Clarifications?

Each document is detailed but can be adapted to your team's specific situation:

1. **DN-TECH-PRD-V2.md** — Product scope & strategy
2. **DN-TECH-DESIGN-SYSTEM-V2.md** — Design specifications
3. **DN-TECH-SEO-GUIDE-V2.md** — SEO implementation

Pick one, follow the sections, and iterate. You don't need to implement everything at once.

**Recommended order:**
1. Fix design (week 1-2)
2. Clean data (week 1-2)
3. Setup SEO infrastructure (week 2-3)
4. Start publishing content (week 3+)
5. Monitor & optimize (ongoing)

---

**Good luck! 🚀**

---

*Prepared for DN Tech Product Team*  
*July 2026*  
*Questions? Review the relevant PRD document section.*

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
