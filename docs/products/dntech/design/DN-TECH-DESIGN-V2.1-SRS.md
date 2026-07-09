# DN Tech Design System Remediation — SRS
## System Requirements Specification

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Reference:** [DN-TECH-DESIGN-V2.1-PRD.md](./DN-TECH-DESIGN-V2.1-PRD.md) + [DN-TECH-DESIGN-V2.1-SDD.md](./DN-TECH-DESIGN-V2.1-SDD.md)

---

## 📋 System Overview

**System name:** DN Tech Design System V2.1 Remediation  
**Purpose:** Fix design audit findings (gradient/shadow/color inconsistencies)  
**Scope:** Frontend codebase (`frontend/src`)  
**Duration:** 5-6 hours (1 developer, full-time)  
**Success criteria:** All P0 + P1 requirements met, zero P0 violations remain

---

## 1. Functional Requirements

### 1.1 Visual Output Requirements

| Requirement | Definition | Testable |
|-------------|-----------|----------|
| **F1.1** No gradient backgrounds | Zero `gradient-*` Tailwind classes in portfolio/case-studies pages | `grep -r "gradient-to-"` = 0 results |
| **F1.2** No glassmorphism | Zero `backdrop-blur` in entire codebase | `grep -r "backdrop-blur"` = 0 results |
| **F1.3** No heavy shadows | Card components use `border` only, not `shadow-xl` | `grep -r "shadow-xl" app/admin/login` = 0 results |
| **F1.4** Unified link color | All primary CTA links = `text-blue-900` | `grep -r "text-blue-600" app/(public)` = 0 results |
| **F1.5** Solid placeholder images | Portfolio/case-study missing images = `bg-blue-900/10` + Lucide icon | Visual inspection |
| **F1.6** Accessible modals | Modal, Alert, Badge components support WCAG A11y (aria-*, labels) | axe DevTools audit ≥ 95 score |

### 1.2 Component Requirements

| Component | Must have | Interfaces | Files |
|-----------|-----------|-----------|-------|
| **Alert** | 4 variants (error, success, warning, info) + icon + close button | `<Alert variant="error">Message</Alert>` | `components/ui/Alert.tsx` |
| **Badge** | 5 variants (default, secondary, success, warning, error) | `<Badge variant="success">Text</Badge>` | `components/ui/Badge.tsx` |
| **Modal** | Open/close state + title + backdrop + close button | `<Modal open={open} onClose={...}>{children}</Modal>` | `components/ui/Modal.tsx` |
| **CaseStudyCard** | Image fallback (CMS or solid bg) + solid link color | `<CaseStudyCard study={data} />` | `components/cards/CaseStudyCard.tsx` |

### 1.3 Content & Imagery Requirements

| Requirement | Detail | Status |
|-------------|--------|--------|
| **F3.1** CMS media support | Portfolio/case study images load from CMS `image` field | ✅ Ready (condition exists) |
| **F3.2** Image fallback | If no image, render `bg-blue-900/10` + Lucide icon | ✅ Implemented in SDD |
| **F3.3** Team photos fallback | If no real photo uploaded, render avatar initials | ✅ Existing fallback works |
| **F3.4** Real photos eventual | Media uploader → CMS → Image field populated | ⏳ Out of scope (V2.2) |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| Requirement | Threshold | How to measure |
|-------------|-----------|----------------|
| **NFR2.1** LCP (Largest Contentful Paint) | < 2.5 seconds (all pages) | Lighthouse audit |
| **NFR2.2** CLS (Cumulative Layout Shift) | < 0.1 (all pages) | Lighthouse audit |
| **NFR2.3** No new CSS bloat | Build size < 10KB change (Tailwind unused classes pruned) | `npm run build` output |
| **NFR2.4** New component bundle size | Alert + Badge + Modal total < 3KB | `gzip` measurement |

### 2.2 Accessibility (WCAG 2.1 Level AA)

| Requirement | Standard | Implementation |
|-------------|----------|-----------------|
| **NFR2.5** Contrast ratio | Text foreground/background ≥ 4.5:1 | axe DevTools + Lighthouse |
| **NFR2.6** Keyboard navigation | Tab order correct, focus visible, no keyboard traps | Manual test + keyboard-only nav |
| **NFR2.7** Screen reader support | All form inputs have labels, alerts have `role="alert"`, modals have `aria-modal` | axe DevTools |
| **NFR2.8** Touch targets | Mobile CTA buttons ≥ 48px height | Lighthouse mobile audit |
| **NFR2.9** Color not only indicator | Don't rely on color alone to convey meaning (use icons, text, borders) | Visual inspection |

### 2.3 Browser Compatibility

| Browser | Min version | Testing required |
|---------|------------|------------------|
| Chrome | Latest 2 versions | ✅ |
| Safari | Latest 2 versions | ✅ (iOS 14.5+) |
| Firefox | Latest version | ✅ |
| Edge | Latest version | ✅ |

### 2.4 Mobile & Responsive

| Breakpoint | Requirement | Test device |
|-----------|------------|-------------|
| **Mobile** | < 640px | iPhone 12 (375px) |
| **Tablet** | 640–1024px | iPad (768px) |
| **Desktop** | > 1024px | 1440px viewport |

**All P0 changes must render correctly on mobile (portfolio gradient replacement, badge without blur, etc.)**

---

## 3. Interfaces & Data Structures

### 3.1 Component Props

#### Alert Component

```typescript
interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';  // default: 'info'
  title?: string;                                        // optional heading
  children: React.ReactNode;                             // alert message
  className?: string;                                    // additional classes
  onClose?: () => void;                                  // close callback
}
```

#### Badge Component

```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';  // default: 'default'
  children: React.ReactNode;                                              // badge text
  className?: string;                                                     // additional classes
}
```

#### Modal Component

```typescript
interface ModalProps {
  open: boolean;                             // modal visibility state
  onClose: () => void;                       // close handler (required)
  title?: string;                            // modal title
  children: React.ReactNode;                 // modal content
  className?: string;                        // additional classes
  showClose?: boolean;                       // show close button (default: true)
}
```

#### CaseStudyCard Component

```typescript
interface CaseStudyCardProps {
  study: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    image?: string;  // CMS media URL or null
  };
}
```

### 3.2 Tailwind Color Tokens (Palette)

**Required tokens (must exist in `globals.css` or Tailwind config):**

```css
/* Primary colors */
--primary: #1e3a8a;        /* blue-900 */
--secondary: #0d9488;      /* teal-600 */

/* Neutrals */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-600: #4b5563;
--gray-900: #111827;

/* Semantic */
--red-600: #dc2626;        /* error */
--green-600: #16a34a;      /* success */
--yellow-500: #eab308;     /* warning */
--blue-50: #eff6ff;        /* info background */
```

**Palette consistency check:**

```bash
# Verify no invalid Tailwind tokens used
grep -E "(indigo-|purple-|violet-|pink-|slate-)" frontend/src/app/(public)
# Should return 0 results in public pages (acceptable in admin only if documented)
```

---

## 4. External Dependencies

### 4.1 Required Libraries

| Library | Version | Purpose | Already installed? |
|---------|---------|---------|-------------------|
| **react** | ^19.0 | UI library | ✅ Yes |
| **next** | ^16.0 | Framework | ✅ Yes |
| **tailwindcss** | ^4.0 | Styling | ✅ Yes |
| **lucide-react** | ^latest | Icons | ✅ Yes |

**No new dependencies added** — all changes use existing libraries.

### 4.2 CMS / Data Requirements

| Data source | Required field | Example | Status |
|------------|----------------|---------|--------|
| **CaseStudy** | `image?: string` | URL to WebP from media uploader | ✅ Assumed ready |
| **PortfolioItem** | `image?: string` | Same as above | ✅ Assumed ready |
| **TeamMember** | `photo?: string` | URL to team member photo | ⏳ Out of scope |

**If image fields missing:** Graceful fallback to `bg-blue-900/10` + icon (implemented in SDD).

---

## 5. Integration Points

### 5.1 File Dependencies

**Before changes:**
```
CaseStudyCard.tsx → imports Card, Lucide icon
Portfolio page → imports PORTFOLIO_ITEMS constant
Case studies page → [slug] route
Admin login → imports Card component
```

**After changes:**
```
CaseStudyCard.tsx → imports Card, Image, Lucide icon (+ Image import)
Alert.tsx → NEW, imports Lucide icons + cn utility
Badge.tsx → NEW, imports cn utility
Modal.tsx → NEW, imports Lucide icon + cn utility
Portfolio page → imports CaseStudyCard component
Admin pages → import Alert, Badge (refactored)
```

**Required utilities:**
- `cn()` utility (from `@/lib/utils` or `clsx`) — for class name merging

**If missing, create:**
```typescript
// frontend/src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5.2 CSS Global Styles

**Must exist in `frontend/src/app/globals.css`:**

```css
@layer components {
  .btn-primary {
    @apply bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800;
  }
  
  .form-input {
    @apply border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-900/20;
  }
}
```

**No changes needed** — existing globals.css already includes these.

---

## 6. Configuration Requirements

### 6.1 Environment Variables

**No new env vars required.**

Existing `NEXT_PUBLIC_*` vars unchanged:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GA_ID`
- etc.

### 6.2 Build Configuration

**`next.config.ts` must include:**

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all for CMS media
      },
    ],
  },
  // ... other config
};
```

**Verify:**
```bash
grep -A 5 "remotePatterns" next.config.ts
# Should show domain whitelist for CMS media URLs
```

---

## 7. Deployment Requirements

### 7.1 Pre-deployment Checklist

- [ ] All files modified locally + tested
- [ ] No console errors / TypeScript warnings
- [ ] Branch created: `design/v2-1-remediation`
- [ ] Commits organized (4 logical commits per SDD)
- [ ] PR description includes before/after screenshots
- [ ] Design review requested from CEO/Tech Lead
- [ ] QA testing plan reviewed

### 7.2 Deployment Steps

```bash
# Step 1: Pull latest main
git checkout main
git pull origin main

# Step 2: Create branch
git checkout -b design/v2-1-remediation

# Step 3: Apply changes per SDD (Tasks 1-10)
# ... make code changes ...

# Step 4: Commit
git add .
git commit -m "Design: remove gradients, shadows, add Alert/Badge/Modal"

# Step 5: Build
npm run build
# Should complete without errors

# Step 6: Local test
npm run dev
# Open browser, verify visual changes

# Step 7: Push
git push origin design/v2-1-remediation

# Step 8: Create PR in GitHub
# ... wait for review ...

# Step 9: Merge to main (after approval)
# Step 10: Deploy to production
pm2 restart dntech-web
```

### 7.3 Rollback Procedure

If critical issues found post-deployment:

```bash
# Option A: Revert specific commit
git revert <commit-hash> --no-edit

# Option B: Full rollback to previous tag
git checkout v2.0.1  # Previous stable release
npm run build
npm run deploy

# Option C: Force rollback via production server
cd /var/www/dntech/frontend
git reset --hard origin/main~1
npm run build
pm2 restart dntech-web
```

---

## 8. Quality Assurance Requirements

### 8.1 Manual Testing Checklist

```
[ ] Homepage
  [ ] Hero section: solid blue-900 background
  [ ] CTA buttons: blue-900 with white text
  [ ] Links: blue-900 hover state visible
  
[ ] Portfolio page
  [ ] Grid renders correctly
  [ ] Cards show solid bg-blue-900/10 (no gradient)
  [ ] Click card → navigates to detail page
  
[ ] Portfolio detail page
  [ ] Hero: solid blue-900 (not gradient)
  [ ] Back button accessible
  [ ] Typography readable
  
[ ] Case studies page
  [ ] List renders, cards have solid backgrounds
  [ ] Featured badge: no blur, readable
  
[ ] Admin login
  [ ] Card has border (not shadow-xl)
  [ ] Form fills without errors
  [ ] Validation messages appear (using Alert component)
  
[ ] Admin dashboard
  [ ] Sidebar: blue-900 background (not slate)
  [ ] All text readable
  [ ] No visual glitches
  
[ ] New components
  [ ] Alert: all 4 variants render correctly
  [ ] Badge: all 5 variants render correctly
  [ ] Modal: opens, closes, backdrop dismisses
```

### 8.2 Automated Testing

```bash
# Visual regression (if Storybook setup in future)
npm run test:visual

# Linting
npm run lint
# Expected: 0 errors

# TypeScript
npm run type-check
# Expected: 0 errors

# Build
npm run build
# Expected: success, no warnings about unused CSS

# Lighthouse (after deploy)
npx lighthouse https://dntech.id --view
# Expected: Design score ≥ 85
```

### 8.3 Accessibility Testing

```bash
# axe DevTools browser extension
# On each page:
#  1. Open DevTools
#  2. Run axe
#  3. Fix "Critical" + "Serious" issues
#  4. Document "Needs review"

# Expected: axe score ≥ 95%

# Keyboard navigation
# - Tab through all focusable elements
# - Buttons activate with Enter/Space
# - Modals trap focus inside
# - Escape closes modal

# Screen reader (NVDA or JAWS)
# - Form labels announced
# - Alert title + message announced
# - Modal title announced
```

---

## 9. Documentation Requirements

### 9.1 Code Documentation

**New component files must have:**

```typescript
/**
 * Alert component for displaying dismissible messages
 * 
 * @example
 * <Alert variant="error" title="Error">
 *   Something went wrong
 * </Alert>
 */
export function Alert({ ... }) { }
```

### 9.2 Design Documentation

**Update these files:**
- [ ] `DESIGN_SUMMARY.md` → Section 5 "Komponen UI" (add Alert, Badge, Modal)
- [ ] `IMPLEMENTATION-STATUS.md` → Section 2 (mark V2.1 complete)
- [ ] `README.md` → Link to remediation changelog

**Create changelog entry:**
```markdown
## V2.1 Remediation (9 Jul 2026)

### Fixed
- Removed gradient placeholders from portfolio/case-studies
- Removed backdrop-blur (anti-glassmorphism mandate)
- Standardized link accent color to blue-900
- Unified admin palette to gray-* + blue-900

### Added
- Alert component (4 variants: error, success, warning, info)
- Badge component (5 variants)
- Modal component (with keyboard + accessibility support)

### Technical
- Zero new dependencies
- Build size impact: +2KB (gzipped Alert + Badge)
- No breaking changes to existing components
```

---

## 10. Stakeholder Requirements

### 10.1 CEO + Tech Lead (Dozer)

- ✅ No gradients on public-facing pages
- ✅ No glassmorphism anywhere
- ✅ Brand color blue-900 consistent
- ✅ Professional, minimalist aesthetic
- ✅ Ready for B2B positioning

### 10.2 Frontend Developer

- ✅ Clear implementation guide (SDD)
- ✅ Copy-paste code provided
- ✅ All dependencies already installed
- ✅ No data model changes needed
- ✅ Backward compatible

### 10.3 QA Lead

- ✅ Testing checklist provided
- ✅ Acceptance criteria clear
- ✅ Accessibility requirements defined
- ✅ Visual regression approach defined

### 10.4 Product / Design

- ✅ Design audit findings addressed
- ✅ WCAG AA compliance verified
- ✅ Brand guidelines honored
- ✅ Lighthouse score maintained

---

## 11. Compliance Requirements

### 11.1 Web Standards

| Standard | Requirement | Verification |
|----------|-------------|--------------|
| **HTML** | Valid HTML5 | `npm run lint` passes |
| **CSS** | Valid Tailwind + CSS | Build completes |
| **a11y** | WCAG 2.1 Level AA | axe DevTools ≥ 95 |
| **Performance** | Core Web Vitals green | Lighthouse ≥ 85 |
| **SEO** | Open Graph tags present | Manual check |

### 11.2 Brand Guidelines

| Rule | Requirement | Check |
|------|------------|-------|
| **Logo** | Never distorted | Visual inspection |
| **Color palette** | Blue-900, teal-600, gray-* only | `grep -r "indigo-\|purple-"` = 0 |
| **Typography** | Inter or system stack | `globals.css` font-family |
| **Tone** | Professional-friendly | Content review (out of scope) |

---

## 12. Support & Maintenance

### 12.1 Post-deployment Support (24h)

| Issue type | Response time | Owner |
|-----------|---------------|----|
| Critical (site down) | Immediate | Frontend tech lead |
| High (major visual bug) | 30 min | Frontend tech lead |
| Medium (color mismatch) | 2h | Designer + frontend |
| Low (typo in button) | EOD | Whoever sees it first |

### 12.2 Future Enhancements (V2.2+)

- Dark mode support
- Storybook component library
- Design tokens TypeScript mirror
- Real team photos upload flow

---

## 13. Success Criteria (Acceptance)

| Criterion | Test method | Pass/Fail |
|-----------|------------|----------|
| All gradients removed | `grep -r "gradient-to-"` | [ ] |
| No glassmorphism | `grep -r "backdrop-blur"` | [ ] |
| Link color unified | `grep -r "text-blue-600"` in public | [ ] |
| New components working | Manual test + axe | [ ] |
| Lighthouse ≥ 85 | Chrome DevTools | [ ] |
| WCAG AA compliant | axe + manual | [ ] |
| Mobile responsive | iPhone 12 test | [ ] |
| No build errors | `npm run build` | [ ] |
| PR approved by CEO/Tech Lead | GitHub review | [ ] |
| Deployed to production | Live site check | [ ] |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CEO + Tech Lead | Dozer | | [ ] |
| Frontend Tech Lead | TBD | | [ ] |
| QA Lead | TBD | | [ ] |

---

**Status:** 📋 Awaiting approval  
**Effort:** 5-6 hours  
**Risk:** Low (backward compatible, no data changes)  
**Ready to begin?** → Assign developer to PRD + SDD

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** V2.1 Remediation SRS
