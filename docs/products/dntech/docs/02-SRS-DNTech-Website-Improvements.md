# SRS: DNTECH Website Improvements

**Software Requirements Specification v2.0**  
**Juli 2026 | Functional & Non-Functional Requirements**

---

## 1. Functional Requirements

### 1.1 Lead Capture & Form Management

| Requirement ID | Description | Priority |
|---|---|---|
| FR-1.1 | Multi-step lead form dengan progressive disclosure (3 steps) | HIGH |
| FR-1.2 | Form validation real-time & error messages yang friendly | HIGH |
| FR-1.3 | Lead source tracking (dari halaman mana user submit form) | MEDIUM |
| FR-1.4 | Auto-categorization leads berdasarkan service type + budget range | MEDIUM |
| FR-1.5 | Duplicate lead detection (cek berdasarkan email) | MEDIUM |
| FR-1.6 | Thank you page dengan download resource + next steps | HIGH |

### 1.2 Content Management (CMS Enhancements)

| Requirement ID | Description | Priority |
|---|---|---|
| FR-2.1 | Case study module (dengan hero image, metrics, client quote) | HIGH |
| FR-2.2 | Testimonial carousel dengan video support | HIGH |
| FR-2.3 | Team member profiles dengan social media links | MEDIUM |
| FR-2.4 | Blog author management & publishing workflow | HIGH |
| FR-2.5 | Meta tags editor per halaman (title, description, og:image) | MEDIUM |
| FR-2.6 | Published vs Draft status untuk blog posts & pages | HIGH |

### 1.3 Interactive Features

| Requirement ID | Description | Priority |
|---|---|---|
| FR-3.1 | Solution finder quiz (5-7 questions, result mapping) | MEDIUM |
| FR-3.2 | ROI calculator (input: team size, tech stack → output: estimate) | MEDIUM |
| FR-3.3 | Live chat integration (Crisp API) | LOW |
| FR-3.4 | Webinar/demo booking (Calendly embed) | MEDIUM |
| FR-3.5 | Exit-intent popup (triggered saat mouse leave viewport) | MEDIUM |

### 1.4 Analytics & Reporting

| Requirement ID | Description | Priority |
|---|---|---|
| FR-4.1 | Conversion funnel analytics (visitor → lead → contacted) | HIGH |
| FR-4.2 | Lead source attribution (organic, direct, referral, paid) | MEDIUM |
| FR-4.3 | Page performance metrics (views, avg time, bounce rate) | MEDIUM |
| FR-4.4 | Admin dashboard widgets: Today leads, month trend, conversion rate | HIGH |

### 1.5 Email & Automation

| Requirement ID | Description | Priority |
|---|---|---|
| FR-5.1 | Newsletter signup form dengan segmentation | MEDIUM |
| FR-5.2 | Automated welcome email sequence (triggered post-form submit) | HIGH |
| FR-5.3 | Integration dengan Mailchimp atau SendGrid API | HIGH |
| FR-5.4 | Lead nurture drip campaign (configurable via admin) | MEDIUM |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| Requirement | Metric | Rationale |
|---|---|---|
| Page Load Time | <2.5 sec (P75) | User experience & SEO ranking |
| Largest Contentful Paint | <1.5 sec | Core Web Vitals (Google ranking signal) |
| First Input Delay | <100 ms | Interactivity metric |
| Cumulative Layout Shift | <0.1 | Visual stability |
| Image Optimization | WebP format, lazy load | Reduce bandwidth |

### 2.2 Security

- CSRF protection on all forms (CSRF tokens)
- Rate limiting: Max 10 form submissions per IP per hour
- Email validation: Verify email format & MX records
- HTTPS/TLS 1.2+
- Input sanitization: XSS & SQL injection prevention

### 2.3 Scalability & Availability

- Uptime target: 99.5%
- Database: PostgreSQL with automated backups (daily)
- CDN: Cloudflare for static assets (CSS, JS, images)
- Horizontal scaling: Stateless backend (Docker-ready)

### 2.4 SEO

- Lighthouse SEO score: 95+
- XML sitemap auto-update (on content publish)
- Structured data (Schema.org): Organization, LocalBusiness, BreadcrumbList
- Open Graph & Twitter Card tags on all pages
- Mobile-first responsive (320px - 4K)

### 2.5 Accessibility (WCAG 2.1 Level AA)

- Color contrast ratio ≥4.5:1 for text
- All images have descriptive alt text
- Keyboard navigation support (Tab, Enter, Esc)
- Screen reader compatibility

### 2.6 Browser & Device Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS 12+, Android 8+
- Tablet support (iPad, Android tablets)

---

## 3. Data Requirements

### 3.1 New Database Schema Additions

#### CaseStudy Model
```
id, title, slug, description, heroImage, challenge, solution, 
results, metrics (JSON), clientName, clientLogo, publishedAt
```

#### Testimonial Model (Enhanced)
```
id, clientName, title, content, videoUrl (optional), rating (1-5), publishedAt
```

#### ConversionFunnel Model
```
id, sessionId, eventType (page_view, form_visit, form_submit), 
page, timestamp, metadata (JSON)
```

#### AnalyticsEvent (Enhanced)
```
id, eventType, pageUrl, leadSource (organic/direct/referral/paid), 
deviceType, conversionStatus, timestamp
```

---

## 4. Use Cases

### UC-1: User Submits Lead Form
1. User visits website
2. User clicks CTA button → form modal opens
3. User fills multi-step form (3 steps)
4. System validates input in real-time
5. User submits form
6. System checks for duplicate (by email)
7. System auto-categorizes lead (by service + budget)
8. System saves lead to database
9. System sends welcome email (SendGrid)
10. User sees thank you page with resource download

### UC-2: Admin Views Lead Analytics
1. Admin logs in to dashboard
2. Admin navigates to Analytics section
3. System displays widgets:
   - Today's leads count
   - Monthly trend graph
   - Conversion funnel chart
   - Top pages by traffic
4. Admin can filter by date range & lead source
5. Admin exports report as CSV

### UC-3: User Takes Solution Finder Quiz
1. User navigates to quiz page
2. User answers 5-7 questions
3. Each question is conditional (based on previous answers)
4. System calculates result mapping
5. System shows recommended service + CTA
6. User can optionally submit contact form pre-populated

---

## 5. Acceptance Criteria

### For Lead Form Feature
- [ ] All 3 form steps load without error
- [ ] Real-time validation shows error messages within 100ms
- [ ] Duplicate detection works for email addresses
- [ ] Thank you page loads within 1 second
- [ ] Lead data saved to database successfully
- [ ] Welcome email sent within 5 minutes
- [ ] Works on mobile (320px width)
- [ ] WCAG AA accessibility compliant

### For Case Study Module
- [ ] Case study pages render correctly with all metadata
- [ ] Hero images load within 1.5s
- [ ] Metrics JSON displays properly (no formatting errors)
- [ ] Case studies appear in blog feed with excerpts
- [ ] Admin can publish/unpublish without page rebuild

### For Analytics
- [ ] Funnel metrics update in real-time
- [ ] Conversion rate calculation accurate to 2 decimal places
- [ ] Dashboard loads within 2 seconds
- [ ] Date filtering works correctly
- [ ] CSV export contains all required columns

---

**Document Version: 2.0 | Last Updated: Juli 2026**

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
