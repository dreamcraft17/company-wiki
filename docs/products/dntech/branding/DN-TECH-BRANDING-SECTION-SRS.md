# DN Tech Branding Section — SRS
## System Requirements Specification

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Reference:** [PRD](./DN-TECH-BRANDING-SECTION-PRD.md) + [SDD](./DN-TECH-BRANDING-SECTION-SDD.md)

---

## 1. Functional Requirements

### F1: Brand Content Management

| Req | Description | Implementation |
|-----|-------------|-----------------|
| F1.1 | Display brand story (150-300 words) with optional image | BrandStory component + API |
| F1.2 | Display mission statement (1-2 sentences) | BrandStory component |
| F1.3 | Edit content from admin CMS | Admin page + PUT endpoint |
| F1.4 | Store in database (not hardcoded) | BrandContent model |

### F2: Core Values

| Req | Description | Implementation |
|-----|-------------|-----------------|
| F2.1 | Display 5 core values with icon + description | CoreValues component |
| F2.2 | Values editable from admin | Admin CRUD page |
| F2.3 | Each value has: name, description, icon (Lucide), order | CoreValue model |
| F2.4 | Dynamically render Lucide icons from database | Icon name stored, rendered at runtime |

### F3: Team Members

| Req | Description | Implementation |
|-----|-------------|-----------------|
| F3.1 | Display 5+ team members with photo, name, role, bio | TeamSpotlight component |
| F3.2 | Team photos from media uploader (CMS) | TeamMember.photoUrl field |
| F3.3 | Admin can add/edit/remove team members | Admin CRUD page |
| F3.4 | Only published team members shown on homepage | published boolean filter |
| F3.5 | Team members ordered by admin-defined order | order field for sorting |

### F4: Testimonials

| Req | Description | Implementation |
|-----|-------------|-----------------|
| F4.1 | Display 3-5 client testimonials | Testimonials component (carousel) |
| F4.2 | Each testimonial: quote, author, title, company, logo (optional) | Testimonial model |
| F4.3 | Carousel navigation (prev/next buttons, dots) | Carousel logic in component |
| F4.4 | Admin manage testimonials | Admin CRUD page |
| F4.5 | Only published testimonials shown | published boolean filter |

### F5: Key Metrics/Stats

| Req | Description | Implementation |
|-----|-------------|-----------------|
| F5.1 | Display 4 key stats (label, value, icon) | Stats component |
| F5.2 | Stats editable from admin | Admin page |
| F5.3 | Example: "50+ Proyek Selesai", "30+ Klien Puas", etc. | Stat model |
| F5.4 | Icons rendered dynamically (Lucide) | Icon name from database |

### F6: API Endpoints (Public)

| Endpoint | Method | Response | Auth |
|----------|--------|----------|------|
| `/api/v1/branding/content` | GET | BrandContent | Public |
| `/api/v1/branding/values` | GET | CoreValue[] | Public |
| `/api/v1/branding/advantages` | GET | CompetitiveAdvantage[] | Public |
| `/api/v1/branding/team` | GET | TeamMember[] (published only) | Public |
| `/api/v1/branding/testimonials` | GET | Testimonial[] (published only) | Public |
| `/api/v1/branding/stats` | GET | Stat[] | Public |

### F7: Admin CRUD Endpoints

| Path | Methods | Requires Auth | Purpose |
|------|---------|---------------|---------|
| `/api/v1/admin/branding/content` | GET, PUT | Yes | Edit brand story |
| `/api/v1/admin/branding/values` | GET, POST, PUT, DELETE | Yes | Manage values |
| `/api/v1/admin/branding/team` | GET, POST, PUT, DELETE | Yes | Manage team |
| `/api/v1/admin/branding/testimonials` | GET, POST, PUT, DELETE | Yes | Manage testimonials |
| `/api/v1/admin/branding/stats` | GET, POST, PUT, DELETE | Yes | Manage stats |

---

## 2. Non-Functional Requirements

### NFR1: Performance

| Requirement | Threshold | Measurement |
|-------------|-----------|-------------|
| Homepage LCP | <2.5 seconds | Lighthouse |
| Stats section load time | <500ms | Network tab |
| Branding section images | WebP + lazy load | Image optimization |
| Component render time | <100ms | React DevTools Profiler |
| Database queries | N+1 free (batch fetch) | Query analysis |

### NFR2: Accessibility (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|-----------------|
| Contrast ratio (text) | ≥4.5:1 |
| Heading hierarchy | H1 (site) → H2 (section) → H3 (card titles) |
| Images alt text | All images have descriptive alt |
| Keyboard navigation | Tab through all sections |
| Screen reader | Team member bios announced |
| Color not only indicator | Use text + icons for meaning |

### NFR3: Mobile Responsive

| Breakpoint | Requirement |
|------------|------------|
| Mobile (<640px) | 1-2 columns, touch targets ≥48px |
| Tablet (640-1024px) | 2-3 columns, optimized spacing |
| Desktop (>1024px) | 4-5 columns, full layout |
| Touch | Carousel buttons easily tappable |

### NFR4: Browser Compatibility

| Browser | Min version | Test |
|---------|------------|------|
| Chrome | Latest 2 versions | ✅ |
| Safari | Latest 2 versions | ✅ (including iOS) |
| Firefox | Latest version | ✅ |
| Edge | Latest version | ✅ |

### NFR5: Security

| Requirement | Implementation |
|-------------|-----------------|
| XSS prevention | React escapes HTML, no dangerouslySetInnerHTML |
| CSRF protection | Admin endpoints require CSRF token (if applicable) |
| SQL injection | Use Prisma ORM (parameterized queries) |
| Authentication | Admin endpoints require valid session |
| Rate limiting | API endpoints rate-limited (optional) |

### NFR6: Data Integrity

| Requirement | Implementation |
|-------------|-----------------|
| No duplicate content | Unique constraints (if needed) |
| Referential integrity | Foreign keys maintained |
| Soft deletes | Optional (currently hard delete) |
| Audit trail | CreatedAt/UpdatedAt timestamps |

---

## 3. Database Schema

### Tables Created

| Table | Fields | Purpose |
|-------|--------|---------|
| BrandContent | id, tagline, story, mission, imageUrl, timestamps | Company info |
| CoreValue | id, name, description, iconName, order, timestamps | 5 core values |
| CompetitiveAdvantage | id, title, description, iconName, order, timestamps | Why choose us |
| TeamMember | id, name, role, bio, photoUrl, linkedinUrl, twitterUrl, order, published, timestamps | Team profiles |
| Testimonial | id, quote, author, title, company, logoUrl, published, order, timestamps | Client testimonials |
| Stat | id, label, value, iconName, order, timestamps | Key metrics |

### Indexes

```
BrandContent: PRIMARY (id)
CoreValue: (order), PRIMARY (id)
CompetitiveAdvantage: (order), PRIMARY (id)
TeamMember: (published, order), PRIMARY (id)
Testimonial: (published, order), PRIMARY (id)
Stat: (order), PRIMARY (id)
```

---

## 4. API Specifications

### Example: GET /api/v1/branding/team

**Request:**
```bash
GET /api/v1/branding/team
Authorization: none
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123",
      "name": "Dozer Napitupulu",
      "role": "Founder & Tech Lead",
      "bio": "Fullstack developer, 10+ years...",
      "photoUrl": "https://cdn.dntech.id/dozer.jpg",
      "linkedinUrl": "https://linkedin.com/in/dozer",
      "twitterUrl": null,
      "order": 0,
      "published": true
    },
    // ... 4 more team members
  ]
}
```

**Response (500):**
```json
{
  "success": false,
  "error": "Failed to fetch team"
}
```

### Admin: POST /api/v1/admin/branding/team

**Request:**
```json
{
  "name": "Sarah Chen",
  "role": "Lead Developer",
  "bio": "Full-stack engineer...",
  "photoUrl": "https://cdn.dntech.id/sarah.jpg",
  "order": 1,
  "published": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cuid456",
    "name": "Sarah Chen",
    // ... all fields
  }
}
```

---

## 5. Component Props & Interfaces

### BrandStory

```typescript
interface BrandContent {
  id: string;
  tagline: string;
  story: string;
  mission: string;
  imageUrl?: string;
}

// No props (fetches own data)
export function BrandStory() { }
```

### CoreValues

```typescript
interface CoreValue {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name
  order: number;
}

// No props (fetches own data)
export function CoreValues() { }
```

### Testimonials (Carousel)

```typescript
interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  company?: string;
  logoUrl?: string;
}

// No props (fetches own data + manages state)
export function Testimonials() { }
```

---

## 6. Testing Requirements

### Unit Tests

```typescript
// Test BrandStory component
- Test: Renders brand content after fetch
- Test: Falls back to placeholder if no image
- Test: Handles API error gracefully

// Test Stats component
- Test: Renders all stats from API
- Test: Lucide icons render correctly
- Test: Mobile layout switches to 2 columns
```

### Integration Tests

```typescript
// Test: Full data flow
- Seed database with branding data
- Hit GET /api/v1/branding/team
- Component fetches and renders
- No errors in console

// Test: Admin CRUD
- Create new team member via admin form
- API stores in database
- Homepage shows new member
```

### E2E Tests (Cypress/Playwright)

```typescript
// Test: User views branding section
- Load homepage
- Scroll to brand story section
- Verify text visible
- Verify image loaded
- Click "Mulai Sekarang" button

// Test: Testimonials carousel
- Load homepage
- Scroll to testimonials
- Click next button
- Verify next testimonial shows
- Click previous button
- Click dot indicator
```

### Lighthouse Audit

```
Performance: ≥85
Accessibility: ≥85
Best Practices: ≥90
SEO: ≥90
```

### axe Accessibility Audit

```
Score: ≥95
No "critical" violations
No "serious" violations
```

---

## 7. Deployment Requirements

### Pre-Deployment

- [ ] All feature branches merged to main
- [ ] Database migrations applied (dev + staging + prod)
- [ ] Seed data loaded (if needed)
- [ ] Admin pages tested
- [ ] Frontend components tested
- [ ] Mobile responsive verified
- [ ] Lighthouse audit passed

### Deployment Steps

```bash
# 1. Backend
cd backend
npm run build
npx prisma db push  # Apply migrations
npm run start

# 2. Frontend
cd frontend
npm run build
npm start

# 3. Verify
# - Open dntech.id/admin/branding
# - Check homepage brand sections render
# - Check API endpoints respond
# - Check mobile layout
```

### Rollback

```bash
# If critical error:
git revert <commit>
npm run build
npm run start
```

---

## 8. Configuration & Environment

### Required Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost/dntech
JWT_SECRET=...
API_URL=http://localhost:4000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://api.dntech.id
NEXT_PUBLIC_GA_ID=...
```

### No New Dependencies Required

All code uses existing libraries:
- React 19
- Next.js 16
- Prisma ORM
- Lucide React (icons)
- Tailwind CSS v4

---

## 9. Maintenance & Monitoring

### Monitoring

```
- API response times (should be <200ms)
- Database query performance
- Image loading times
- Component render times
```

### Error Tracking

```
- Log API errors to console + Sentry
- Monitor failed image loads
- Alert if API endpoints down
```

### Maintenance Tasks

```
- Weekly: Check broken image links
- Monthly: Verify testimonials still valid
- Quarterly: Update team photos/bios
- As-needed: Add new team members
```

---

## 10. Stakeholder Requirements

### CEO (Dozer)

- ✅ Brand story compelling + professional
- ✅ Team members visible (humanize company)
- ✅ Social proof (testimonials) visible
- ✅ Stats quantifiable + impressive
- ✅ All editable from admin (content can change)

### Users/Visitors

- ✅ Understand who DN Tech is in <2 minutes
- ✅ See real team (builds trust)
- ✅ Read client testimonials (social proof)
- ✅ Mobile-friendly viewing
- ✅ Fast loading

### Developers

- ✅ Clear component structure
- ✅ Reusable components
- ✅ Type-safe (TypeScript)
- ✅ CMS-driven (no hardcoding)
- ✅ Documented

---

## 11. Success Criteria

| Criterion | Measurement | Pass/Fail |
|-----------|------------|----------|
| All branding sections render | Visual inspection | [ ] |
| API endpoints return data | Manual API test + Postman | [ ] |
| Admin pages functional | Admin CRUD test | [ ] |
| Mobile responsive (320-1440px) | Browser DevTools + phone | [ ] |
| Lighthouse ≥85 all pages | Chrome DevTools | [ ] |
| axe audit ≥95 | axe DevTools | [ ] |
| Zero console errors | Browser console | [ ] |
| Images load fast (<1s) | Network tab | [ ] |
| Testimonials carousel works | Manual test | [ ] |
| Team photos display | Visual inspection | [ ] |

---

## 12. Sign-Off

| Role | Approval | Date |
|------|----------|------|
| CEO + Tech Lead (Dozer) | [ ] | |
| Frontend Tech Lead | [ ] | |
| Backend Tech Lead | [ ] | |
| QA Lead | [ ] | |

---

**Status:** 📋 Ready for development  
**Effort:** 8-10 hours (full stack)  
**Risk:** Low (uses existing patterns)

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** Branding Section SRS v1
