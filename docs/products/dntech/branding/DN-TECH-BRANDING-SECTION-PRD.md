# DN Tech Company Profile — Branding Section PRD
## Lengkapi "Tentang Kami" + Brand Story + Values

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** 📋 PLANNING — Branding section kosong  
**Baseline:** Design System V2 (solid colors, professional, B2B)

---

## 📋 Executive Summary

**Current state:** Compro dntech.id punya homepage dengan hero + newsletter, tapi **brand story section kosong**.

**Required:** Lengkapi dengan:
1. **Brand Story** (Tentang Kami) — siapa kami, apa yang kami lakukan
2. **Mission & Values** — purpose, core values (3-5 values)
3. **Why Choose Us** — keunggulan kompetitif (3-4 points)
4. **Team Spotlight** — foto + bio 3-5 key team members
5. **Testimonials** — 2-3 client testimonials (social proof)
6. **Stats/Metrics** — quantifiable results (projects, clients, years)

**Impact:** Builds trust dengan B2B visitors, establishes credibility sebelum mereka request konsultasi.

**Timeline:** 1 week (content + design + implementation)

---

## 🎯 Goals

| Goal | Success criteria | Priority |
|------|------------------|----------|
| **Brand story clear** | Visitor understand who DN Tech is in <2 min | P0 |
| **Mission visible** | Mission statement di above fold or easy to find | P0 |
| **Social proof strong** | 3+ testimonials + stats visible | P1 |
| **Team humanized** | Real team photos + short bios (5 people) | P1 |
| **Value proposition clear** | Why DN Tech > competitors (3-5 reasons) | P0 |
| **Design consistent** | All sections use Design System V2 (solid colors, flat) | P0 |
| **Mobile responsive** | Works on iPhone + tablet + desktop | P0 |
| **CMS-driven** | Content editable from admin (not hardcoded) | P1 |

---

## 📊 Scope

### Pages/Sections

| Section | Location | Type | Status |
|---------|----------|------|--------|
| **Brand Story** | `/about` or `/` → scroll | New page or section | ⏳ |
| **Team** | `/team` or `/about` | New page or section | ⏳ |
| **Testimonials** | `/testimonials` or homepage section | New page or section | ⏳ |
| **Stats/Metrics** | Homepage hero below CTAs | New section | ⏳ |

### Content Required

| Content | Owner | Source |
|---------|-------|--------|
| Brand story (200-300 words) | Dozer | Write or from existing doc |
| Mission statement (1 sentence) | Dozer | Define core purpose |
| 5 core values (name + description) | Dozer | Team workshop or existing |
| 5 team member bios | Each person | Self-written or interview |
| 5 team member photos | HR/Dozer | Professional headshots |
| 3-5 testimonials | Sales team | Client references |
| 5 key metrics/stats | Dozer | Projects completed, clients, revenue, etc. |

---

## 🏗️ Structure (Information Architecture)

### Option A: Separate Pages

```
Homepage
├── Hero
├── Stats
├── Trust Badges
├── Newsletter
└── CTA

/about
├── Brand Story
├── Mission & Values
├── Why Choose Us
└── Call to Action

/team
├── Team Grid (5+ people)
├── Individual profiles
└── Join us CTA

/testimonials
├── Testimonial carousel
├── Client logos
└── Request quote
```

### Option B: Single Long-Form Page (Recommended for small site)

```
Homepage /
├── Hero
├── Stats
├── Trust Badges
├── Brand Story
├── Mission & Values
├── Why Choose Us
├── Team Spotlight
├── Testimonials
├── Newsletter
└── CTA
```

**Recommendation:** Option B (less navigation friction for B2B visitors wanting to know about company quickly).

---

## 📑 Detailed Section Requirements

### Section 1: Brand Story (150-200 words)

**Content:**
```
Tentang DN Tech

DN Tech adalah software house Indonesia yang fokus pada solusi 
custom untuk startup dan perusahaan menengah.

Didirikan pada [year] oleh [Dozer], kami memulai dengan visi 
sederhana: membuat teknologi yang accessible tapi professional 
untuk bisnis lokal.

Kami percaya bahwa teknologi seharusnya mempermudah, bukan 
memperumit. Setiap project adalah partnership, bukan transaksi.

Sampai hari ini, kami sudah bantu 50+ perusahaan Indonesia 
transform business mereka dengan software yang tepat.
```

**Design:**
- Left: Solid `bg-blue-900/10` or actual company photo
- Right: Text (gray-900 headings, gray-600 body)
- Layout: 2-column desktop, stacked mobile

**Location:** Homepage section 2 (after hero) or separate `/about` page

---

### Section 2: Mission & Values

**Mission Statement (1 sentence, prominent):**
```
Kami membangun software yang memberdayakan bisnis Indonesia 
untuk berkembang dan berinovasi.
```

**Core Values (card grid):**

| Value | Description | Icon |
|-------|-------------|------|
| **Pragmatik** | Solusi yang kerja, bukan fancy tapi useless | Wrench |
| **Jujur** | Transparent pricing, realistic timelines | Handshake |
| **Fokus Klien** | Success klien = success kami | Target |
| **Quality First** | Code bersih, tested, documented | CheckCircle |
| **Growth Mindset** | Terus belajar dan improve | TrendingUp |

**Design:**
- 5 cards in grid (1 row desktop, 2-3 rows mobile)
- Icon (Lucide) + title + 1-line description
- Solid `bg-blue-900/5` background
- Hover: border change to `blue-300`

---

### Section 3: Why Choose Us (Competitive Advantage)

**Comparison points vs competitors:**

| Point | DN Tech | Kompetitor lain |
|-------|---------|-----------------|
| **Local + expert** | Tim Indonesia paham bisnis lokal | Sering outsource ke luar |
| **Transparent** | Fixed price, jelas timeline, no hidden fees | Sering ada surprise costs |
| **Hands-on** | Founder involved di setiap project | Hanya account manager |
| **Long-term support** | Maintenance + training included | Hanya harga project doang |

**Design:**
- 4 cards with icon + title + description
- Left icon, right text (2-column layout)
- Solid `bg-white` with `border-l-4 border-blue-900`

---

### Section 4: Team Spotlight

**Team members (5 people, with photos):**

```
Dozer Napitupulu
Founder & Tech Lead
Fullstack developer, 10+ years experience building 
software di startup Indonesia.

[Photo]

---

[4 more team members with same format]
```

**Design:**
- Grid: 1-2-3 columns (mobile-tablet-desktop)
- Card: `rounded-lg` border + hover shadow
- Image: Circle (80px) or rectangular headshot
- Name: bold blue-900
- Role: teal-600
- Bio: gray-600 (2-3 lines)

---

### Section 5: Testimonials/Social Proof

**3-5 client quotes:**

```
"DN Tech delivered kami project dalam 3 bulan. Team mereka 
jujur, responsive, dan hasilnya exceed expectations."
— Sarah Chen, CEO Startup XYZ

"Sebagai founder, saya appreciate practical approach DN Tech. 
Mereka tidak overthink, langsung deliver value."
— Rudi Hermawan, Founder Perusahaan ABC

"Support post-launch dari DN Tech outstanding. Mereka committed 
ke success kami, bukan cuma closing deal."
— Budi Santoso, Operations Manager Korporat DEF
```

**Design:**
- Testimonial card: white bg, border-l teal-600
- Quote: italic gray-900
- Attribution: bold author name + title
- Layout: carousel (mobile) atau 1-2-3 cards (desktop)
- Optional: Add client logo above quote

---

### Section 6: Stats/Metrics

**Key numbers (above fold on homepage):**

```
[Icon] 50+
       Proyek Selesai

[Icon] 30+
       Klien Puas

[Icon] 5+
       Tahun di Industri

[Icon] 100%
       On-time Delivery
```

**Design:**
- 4 columns (grid)
- Large number (48px, bold blue-900)
- Subtitle (gray-600)
- Lucide icon above
- Background: `bg-blue-900/5`
- Mobile: 2 columns, stack to 1 on small screens

---

## 🎨 Design Specifications (V2 Compliance)

### Colors
- Primary: `blue-900` (#1E3A8A)
- Secondary: `teal-600` (#0D9488)
- Background: `white` (#FFFFFF)
- Surface alt: `gray-50` (#F9FAFB)
- Text primary: `gray-900` (#111827)
- Text secondary: `gray-600` (#4B7280)

### Typography
- Font: Inter (system stack)
- H2: 36px bold (brand story, values)
- H3: 24px semibold (card titles)
- Body: 16px regular (descriptions)
- Caption: 14px medium (stats)

### Spacing
- Section padding: `py-16` (desktop), `py-12` (mobile)
- Card padding: `p-6`
- Gap between cards: `gap-6`
- Container: `max-w-7xl mx-auto px-4`

### Components Used
- Cards (flat, border only)
- Grid layout (responsive)
- Lucide icons (24px)
- Buttons (if CTA needed)

### Anti-patterns (FORBIDDEN per CEO/Tech Lead)
- ❌ Gradient backgrounds
- ❌ Glassmorphism / backdrop-blur
- ❌ Heavy shadows (shadow-xl)
- ❌ Rounded corners > `rounded-lg` (8px)
- ❌ Anything that looks AI-generated

---

## 📋 Content Checklist

**What Dozer needs to provide:**

- [ ] Brand story (150-300 words)
- [ ] Mission statement (1 sentence)
- [ ] 5 core values (names + descriptions)
- [ ] Why choose us (3-4 competitive advantages)
- [ ] Key stats (5 numbers: projects, clients, years, etc.)
- [ ] Team member list (5 people):
  - [ ] Full name
  - [ ] Role/title
  - [ ] Bio (2-3 sentences)
  - [ ] Professional headshot (800x800px min, square or circular)
- [ ] Client testimonials (3-5):
  - [ ] Quote (50-100 words)
  - [ ] Client name + title
  - [ ] Company name (optional)
  - [ ] Logo (optional, for social proof)

---

## 🚀 Implementation Phases

### Phase 1: Content + Design (Week 1, Mon-Wed)
- [ ] Dozer writes brand story + mission
- [ ] Dozer defines values + competitive advantages
- [ ] Design team creates wireframes (2 hours)
- [ ] Dozer approves designs

### Phase 2: CMS Setup (Week 1, Thu)
- [ ] Create CMS models (Brand, Team, Testimonial, Stats)
- [ ] Admin pages for content management
- [ ] Dozer uploads content to CMS

### Phase 3: Frontend Implementation (Week 2, Mon-Tue)
- [ ] Create React components (BrandStory, TeamGrid, Testimonials, Stats)
- [ ] Connect to CMS APIs
- [ ] Styling per Design System V2
- [ ] Mobile responsive testing

### Phase 4: QA + Launch (Week 2, Wed-Thu)
- [ ] Visual QA (compare with designs)
- [ ] Mobile testing (iOS + Android)
- [ ] Lighthouse audit
- [ ] Deploy to production

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Homepage time on page** | 3+ minutes (up from current) | Google Analytics |
| **Bounce rate** | <40% (lower = better engagement) | GA |
| **About page CTR** | 10%+ click to "Konsultasi Gratis" | GA events |
| **Testimonial conversion** | Track "quote request" from testimonial | GA events |
| **Mobile UX score** | Lighthouse 85+ | Chrome DevTools |
| **Accessibility** | axe audit 95+ | axe DevTools |

---

## 💡 Additional Considerations

### Optional (V2.2+)
- Team member detailed profiles (`/team/[slug]`)
- Client case studies with testimonials (`/clients`)
- Company timeline/history
- Press mentions / media coverage
- Awards / certifications
- Diversity & inclusion statement

### CMS Fields Needed

**Brand model:**
```
- id
- tagline (string) — "Tentang DN Tech"
- story (text) — long-form brand story
- mission (string) — 1-2 sentence mission
- image (media) — company photo or illustration
- createdAt, updatedAt
```

**Value model:**
```
- id
- name (string) — e.g., "Pragmatik"
- description (text) — 1-2 sentences
- icon (string) — Lucide icon name
- order (number) — for sorting
```

**Team model:**
```
- id
- name (string)
- role (string)
- bio (text)
- photo (media) — headshot
- socialLinks (object) — LinkedIn, Twitter, etc. (optional)
- order (number)
- published (boolean)
```

**Testimonial model:**
```
- id
- quote (text)
- author (string) — client name
- title (string) — job title
- company (string) — company name
- logo (media) — company logo (optional)
- published (boolean)
```

**Stats model:**
```
- id
- label (string) — e.g., "Proyek Selesai"
- value (number) — 50
- icon (string) — Lucide icon name
- order (number)
```

---

## 🎯 Homepage Layout After Branding Additions

```
1. Header + Navigation
2. Hero Section (Konsultasi Gratis + Lihat Layanan buttons)
3. [NEW] Stats Section (50+ projects, 30+ clients, etc.)
4. [NEW] Brand Story Section (2-column: image + text)
5. [NEW] Core Values Cards (5-card grid)
6. [NEW] Why Choose Us (4 cards)
7. [NEW] Team Spotlight (5-person grid)
8. Services Section (existing)
9. [NEW] Testimonials/Social Proof (3 carousel or cards)
10. Newsletter Signup (existing)
11. Footer (existing)
```

---

## ✅ Acceptance Criteria

### Content
- [ ] Brand story is clear, compelling, <300 words
- [ ] Mission statement memorable + authentic
- [ ] 5 values clearly defined + distinct
- [ ] Competitive advantages specific (not generic)
- [ ] Team photos professional + consistent style
- [ ] Testimonials authentic + diverse (different industries)
- [ ] Stats accurate + impressive

### Design
- [ ] All sections use Design System V2 (solid colors, flat)
- [ ] Zero gradients, zero glassmorphism, zero heavy shadows
- [ ] Typography hierarchy clear (H2, H3, body)
- [ ] Spacing consistent (8px grid)
- [ ] Icons (Lucide) consistent + appropriate
- [ ] Colors: blue-900 primary, teal-600 secondary, gray-* text

### Technical
- [ ] All content editable from admin CMS
- [ ] No hardcoded content in components
- [ ] Mobile responsive (tested on iPhone + tablet)
- [ ] Lighthouse ≥85 on all pages
- [ ] axe audit ≥95 (accessibility)
- [ ] Zero console errors

### Performance
- [ ] Page load time <2.5s (LCP)
- [ ] No CLS issues (layout shifts)
- [ ] Images optimized (WebP + lazy load)
- [ ] Build size no regression

---

## 📚 Dependencies

### No new packages needed
- React 19 (existing)
- Next.js 16 (existing)
- Tailwind CSS v4 (existing)
- Lucide React (existing)

### CMS dependencies
- Assumes admin panel exists
- Assumes Prisma ORM already set up
- Assumes PostgreSQL database ready

---

## 🚨 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Content not ready** | Delays launch | Dozer starts writing now |
| **Team photos low quality** | Unprofessional feel | Hire professional photographer |
| **Testimonials hard to get** | Weak social proof | Reach out to existing clients |
| **Design takes too long** | Phase 2 delays | Use templates, iterate fast |
| **CMS setup complex** | Blocks Phase 3 | Pre-plan models, reuse existing patterns |

---

## 📅 Timeline & Budget

| Phase | Duration | Effort | Owner |
|-------|----------|--------|-------|
| **Content** | 3-4 days | Dozer | Dozer |
| **Design** | 2 days | Designer | Design |
| **CMS setup** | 1 day | Backend dev | Backend |
| **Frontend impl** | 2 days | Frontend dev | Frontend |
| **QA + launch** | 1 day | QA | QA |
| **Total** | **~1.5 weeks** | **~20 dev hours** | Team |

---

## 📞 Next Steps

1. **Dozer approval** of this PRD (today)
2. **Dozer writes content** (Mon-Tue)
3. **Designer creates wireframes** (Tue-Wed)
4. **Dev team starts backend CMS** (Thu)
5. **Frontend implements** (Week 2)
6. **Launch** (Week 2, Thursday)

---

**Status:** 📋 Awaiting Dozer content  
**Timeline:** 1.5 weeks  
**Complexity:** Medium (mostly content + component assembly)  
**Risk:** Low (no new dependencies, reuses existing patterns)

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** Branding Section PRD v1
