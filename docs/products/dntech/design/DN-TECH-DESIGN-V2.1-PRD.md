# DN Tech Design System Remediation — PRD
## Fix Design Audit Findings (V2.1)

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** 🔴 CRITICAL — Design inconsistencies found  
**Baseline:** [design_audit.md](./design_audit.md) + [DESIGN_SUMMARY.md](./DESIGN_SUMMARY.md)

---

## 📋 Executive Summary

Design audit (9 Juli 2026) mengidentifikasi **18 temuan** yang melanggar **Design System V2** dan **mandat leadership** (solid color, anti-glassmorphism, no AI-look).

**Blocking issues (High severity):**
- ❌ Gradient placeholders di portfolio/case studies (4 file)
- ❌ Backdrop-blur di case study detail
- ❌ `shadow-xl` di admin login
- ❌ Dokumentasi vs implementasi gap

**Secondary issues (Medium + Low):**
- 🟠 Dual color palette (`gray-*` vs `slate-*`)
- 🟠 Link accent `blue-600` vs `blue-900`
- 🟠 Missing UI components (Alert, Badge, Modal)
- 🟡 Avatar using initials only
- 🟡 Unused orange accent token

**Impact:** Inconsistent visual brand; secondary pages don't align with homepage. **Must fix before user-facing rollout.**

---

## 🎯 Goals (V2.1 Remediation)

| Goal | Success criteria | Priority |
|------|-----------------|----------|
| **Eliminate all gradients** | Zero `gradient-*` classes in portfolio/case studies | P0 |
| **Remove glassmorphism** | Zero `backdrop-blur` in codebase | P0 |
| **Standardize primary color** | All primary CTAs → `blue-900` not `blue-600` | P0 |
| **Unify palette** | Admin + public use same gray/blue tokens OR document dual-theme | P1 |
| **Extract missing components** | Badge, Alert, Modal in `components/ui/` | P1 |
| **Fix form shadows** | Admin login card = flat (border only) | P0 |
| **Update documentation** | IMPLEMENTATION-STATUS.md reflects actual code | P1 |
| **Real photos (CMS ready)** | Media uploader functional; avatar fallback remains | P2 |

---

## 🚀 Scope

### In Scope (V2.1 — This Sprint)

| Item | Type | Files affected | Effort |
|------|------|----------------|--------|
| **Remove gradient placeholders** | Code fix | 4 files portfolio/case studies | 30 min |
| **Remove backdrop-blur** | Code fix | 1 file case-studies detail | 10 min |
| **Remove shadow-xl from admin login** | Code fix | 1 file admin login | 10 min |
| **Standardize link accent blue-900** | Code fix | 3 files (card, case study, footer) | 15 min |
| **Extract Alert component** | New component | 1 new file + 5 refactored | 45 min |
| **Extract Badge component** | New component | 1 new file + 3 refactored | 30 min |
| **Extract Modal component** | New component | 1 new file + 2 refactored | 45 min |
| **Unify admin palette** | Refactor | admin/* — shift slate → gray or document | 1-2 hours |
| **Update IMPLEMENTATION-STATUS.md** | Docs | 1 file | 15 min |

**Total effort:** 5-6 hours (1 dev, full-time)

### Out of Scope (V2.2+)

- Dark mode
- Storybook setup
- Design tokens TypeScript mirror
- Real team photos (awaiting CMS content)
- Font loader `next/font/google` (V4 performance trade-off)
- Animations/motion overhaul

---

## 🔍 Detailed Requirements

### P0.1 — Remove Gradient Placeholders

**Current state:**

```typescript
// ❌ WRONG
bg-gradient-to-br from-blue-500 to-indigo-600
```

**Why it's wrong:**
- Violates mandat leadership (solid color only)
- Looks like AI-generated placeholder (indigo-600 not in palette)
- Breaks visual continuity with homepage (blue-900 solid)

**Required state:**

```typescript
// ✅ RIGHT
// Option A: Solid light background + icon
<div className="bg-blue-900/10 rounded-lg flex items-center justify-center h-48">
  <Briefcase className="w-12 h-12 text-blue-900" />
</div>

// Option B: CMS media image (if available)
{image ? <Image src={image} /> : <Solid bg />}
```

**Affected files:**
1. `frontend/src/components/cards/CaseStudyCard.tsx` — line ~30
2. `frontend/src/app/(public)/portfolio/page.tsx` — line ~45
3. `frontend/src/app/(public)/portfolio/[slug]/page.tsx` — line ~60
4. `frontend/src/app/(public)/case-studies/[slug]/page.tsx` — line ~50 (hero) + line ~120 (badge)

**Acceptance criteria:**
- [ ] Zero `gradient-` strings found via `grep -r "gradient-"` in portfolio pages
- [ ] Replaced with `bg-blue-900/10` OR CMS media image
- [ ] Visual matches homepage aesthetic (solid colors)

---

### P0.2 — Remove Backdrop Blur

**Current state:**

```typescript
// ❌ WRONG
<badge className="backdrop-blur-sm bg-white/20">
```

**Why it's wrong:**
- Glassmorphism explicitly forbidden by CEO/Tech Lead
- Reduces readability (blurry text behind)
- Outdated trend (2022-2023 aesthetic)

**Required state:**

```typescript
// ✅ RIGHT
// Option A: Solid overlay badge
<badge className="bg-white/90 text-blue-900 font-medium">

// Option B: No background, just text + icon
<badge className="text-blue-900 font-medium">
```

**Affected files:**
1. `frontend/src/app/(public)/case-studies/[slug]/page.tsx` — ~line 120

**Acceptance criteria:**
- [ ] Zero `backdrop-blur` in codebase
- [ ] Badge renders crisp + readable
- [ ] Contrast ratio ≥ 4.5:1 (WCAG AA)

---

### P0.3 — Fix Admin Login Shadow

**Current state:**

```typescript
// ❌ WRONG
<Card className="shadow-xl w-full max-w-md">
```

**Why it's wrong:**
- V2 §5 guideline: flat card (border only, no shadow)
- Heavy shadow creates visual disconnect from admin sidebar flat design
- Not minimalist/professional

**Required state:**

```typescript
// ✅ RIGHT
<Card className="border border-gray-200 w-full max-w-md">
```

**Affected files:**
1. `frontend/src/app/admin/login/page.tsx` — line ~40

**Acceptance criteria:**
- [ ] Card has `border border-gray-200` only
- [ ] No `shadow-*` classes
- [ ] Visually matches other admin CRUD cards

---

### P0.4 — Standardize Link Accent Color

**Current state:**

```typescript
// ❌ INCONSISTENT
<a href="..." className="text-blue-600 hover:text-blue-700">  {/* Case study card */}
<a href="..." className="text-blue-900 hover:text-blue-800">  {/* Footer */}
```

**Why it's wrong:**
- V2 palette defines primary link as `blue-900` (not `blue-600`)
- Dual colors reduce brand perception
- `blue-600` is secondary tier

**Required state:**

```typescript
// ✅ CONSISTENT
<a href="..." className="text-blue-900 hover:text-blue-800 font-medium">
```

**Affected files:**
1. `frontend/src/components/cards/CaseStudyCard.tsx` — line ~50
2. `frontend/src/components/layout/Footer.tsx` — line ~80 (review)
3. `frontend/src/app/(public)/blog/page.tsx` — line ~40 (review)

**Acceptance criteria:**
- [ ] All CTA links use `text-blue-900`
- [ ] Hover state `text-blue-800` (darker)
- [ ] Grep finds zero `text-blue-600` in public pages

---

### P1.1 — Extract Alert Component

**Current state:**

Alerts dibuat inline di form/admin:

```typescript
// ❌ INCONSISTENT (scattered)
<div className="bg-red-50 border border-red-200 p-4 rounded-lg">
<div className="bg-blue-50 border border-blue-200 p-3">
<div className="bg-yellow-100 border p-4">
```

**Why needed:**
- No standard Alert component in `components/ui/`
- Copy-paste styling leads to inconsistency
- Hard to maintain if padding/border rules change

**Required state:**

```typescript
// ✅ COMPONENT
<Alert variant="error" title="Error">
  Invalid email address
</Alert>

<Alert variant="success">Form submitted!</Alert>
<Alert variant="info">Remember to check your inbox</Alert>
```

**New file:**
```
frontend/src/components/ui/Alert.tsx
```

**Acceptance criteria:**
- [ ] `Alert.tsx` created with 4 variants (error, success, warning, info)
- [ ] Replaces ≥5 inline alert divs in codebase
- [ ] Documentation in DESIGN_SUMMARY.md

---

### P1.2 — Extract Badge Component

**Similar to Alert** — badge currently inline:

```typescript
// ❌ INCONSISTENT
<span className="bg-teal-100 text-teal-900 px-3 py-1 rounded-full text-sm">
<span className="bg-blue-50 text-blue-900 px-2 py-1 rounded">
```

**Required:**

```typescript
// ✅ COMPONENT
<Badge variant="default">Production</Badge>
<Badge variant="secondary">In review</Badge>
```

**New file:**
```
frontend/src/components/ui/Badge.tsx
```

---

### P1.3 — Extract Modal Component

Exit intent modal exists; generalize for reuse:

```typescript
// ✅ COMPONENT
<Modal open={open} onClose={onClose} title="Stay in touch">
  <p>Before you go...</p>
  <Modal.Actions>
    <Button variant="secondary">Cancel</Button>
    <Button>Subscribe</Button>
  </Modal.Actions>
</Modal>
```

**New file:**
```
frontend/src/components/ui/Modal.tsx
```

---

### P1.4 — Unify Palette (Admin + Public)

**Current state:**

```
Public pages:  bg-gray-* text-gray-900 border-gray-200 ← gray palette
Admin pages:   bg-slate-* text-slate-900 border-slate-200 ← slate palette
Admin sidebar: bg-slate-900 text-slate-300
```

**Problem:**
- Two neutral colors create two visual systems
- Inconsistent to user when switching public ↔ admin
- Harder to maintain design token reusability

**Options:**

**Option A (Recommended): Unify to `gray-*` everywhere**

```
Frontend global change:
  slate-900 → gray-900
  slate-800 → gray-800
  slate-700 → gray-700
  slate-600 → gray-600
  slate-300 → gray-300
  slate-100 → gray-100
  slate-50  → gray-50

Admin sidebar:
  bg-slate-900 → bg-blue-900 (brand primary)
  text-slate-300 → text-white
```

Effort: ~1 hour (search-replace)

**Option B (Document dual-theme):**

Keep slate for admin, gray for public. Document as intentional "Admin Theme" in DESIGN_SUMMARY.md.

Effort: 15 min (docs only)

**Recommendation:** **Option A** — cleaner brand unity.

**Acceptance criteria:**
- [ ] All `slate-*` replaced OR documented as intentional theme
- [ ] Admin sidebar uses `bg-blue-900 text-white` (brand consistent)
- [ ] Grep confirms no `bg-slate-` or `text-slate-` in `/public` pages

---

### P1.5 — Update Documentation

**Current state:**

`IMPLEMENTATION-STATUS.md` claims:
> "Design System V2: Gradients removed from avatar & hero" ✅

**Actual state:**
- Avatar gradient: ✅ removed
- Hero gradient: ✅ removed
- **Portfolio/case study gradient: ❌ still present**

**Required:**
Update IMPLEMENTATION-STATUS.md section 2 "Design System":

```markdown
## 2. Design System V2

- ✅ Solid color palet (blue-900, teal-600, gray-*) implemented
- ✅ Removed gradient from hero & avatar
- ❌ **KNOWN ISSUE:** Gradient placeholders in portfolio/case-studies (fixing in V2.1)
- ✅ Flat card design (border only, no heavy shadow)
- ✅ Form accessibility (labels, min-h 48px, aria-invalid)
- ✅ Lucide icons in all pages
- 🟠 Admin sidebar uses slate theme (vs public gray) — documented as intentional dual-theme
```

**Acceptance criteria:**
- [ ] IMPLEMENTATION-STATUS.md updated to reflect actual state
- [ ] No false claims about gradient removal
- [ ] V2.1 roadmap documented

---

## 📊 Testing Criteria

| Test type | Requirement | Pass/Fail |
|-----------|------------|-----------|
| Visual inspection | Portfolio page looks solid blue + teal only | [ ] |
| Grep audit | `grep -r "gradient-" frontend/src` → 0 results | [ ] |
| Grep audit | `grep -r "backdrop-blur" frontend/src` → 0 results | [ ] |
| Lighthouse | Design score ≥ 85 all core pages | [ ] |
| Contrast ratio | All text ≥ 4.5:1 (WCAG AA) — use axe DevTools | [ ] |
| Mobile responsive | Touch targets ≥ 48px on portfolio CTA buttons | [ ] |
| Browser test | Safari + Chrome desktop + iPhone 12 | [ ] |
| A11y test | Form validation alerts announced (screen reader) | [ ] |

---

## 📅 Timeline & Milestones

### Sprint 1 (2-3 hours)
- **Task 1:** Remove gradients (30 min)
- **Task 2:** Remove backdrop-blur (10 min)
- **Task 3:** Remove shadow-xl (10 min)
- **Task 4:** Standardize link color (15 min)
- **Testing:** Visual regression (30 min)

**Milestone:** All P0 fixes done, portfolio/case studies page live with solid colors.

### Sprint 2 (2-3 hours)
- **Task 5:** Extract Alert component (45 min)
- **Task 6:** Extract Badge component (30 min)
- **Task 7:** Extract Modal component (45 min)
- **Task 8:** Refactor pages to use new components (30 min)

**Milestone:** UI component library grown from 3 → 6 components.

### Sprint 3 (1-2 hours)
- **Task 9:** Unify palette (Option A or Option B) (1 hour)
- **Task 10:** Update IMPLEMENTATION-STATUS.md (15 min)
- **Testing:** Full Lighthouse + axe audit (30 min)

**Milestone:** Design system V2.1 complete, ready for production.

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Design consistency score | 9/10 (up from 7/10) |
| Gradient usage | 0 in portfolio/case studies |
| Glassmorphism usage | 0 in entire codebase |
| Link color consistency | 100% `blue-900` primary CTA |
| Component reusability | 6 shared UI components (vs 3) |
| Visual regression | 0 unintended changes |
| Lighthouse performance | ≥ 85 all pages |
| WCAG AA compliance | Accessible main flows |

---

## 📝 Dependencies & Blockers

| Item | Status | Impact |
|------|--------|--------|
| Design tokens frozen (blue-900, teal-600) | ✅ Ready | No change |
| CMS media uploader (for real portfolio images) | ⏳ Future (V2.2) | Placeholder component ready |
| Design review + CEO/Tech Lead sign-off | ⏳ Pending | Needed before launch |
| Team photos upload | ⏳ Content task | Avatar component ready |

---

## 🚨 Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Refactor breaks portfolio/case study rendering | Branch + QA before merge |
| Admin slate theme unification conflicts | Run before public redirect goes live |
| Component extraction introduces new bugs | Component testing + visual regression |
| Documentation update is incomplete | Peer review checklist in PR |

---

## 📚 Deliverables

1. ✅ **PRD (this document)** — High-level requirements
2. 📋 **SDD** — System Design Detail (how to implement per file)
3. 📋 **SRS** — System Requirements Spec (dependencies, interfaces)
4. 📋 **Code changes** — 10 task branches ready to merge
5. 📋 **Test plan** — Visual + automated + a11y tests
6. 📋 **Updated docs** — DESIGN_SUMMARY.md, IMPLEMENTATION-STATUS.md

---

## ✅ Sign-Off

| Role | Sign-off | Date |
|------|----------|------|
| CEO + Tech Lead (Dozer) | [ ] Approve PRD | |
| Frontend Tech Lead | [ ] Approve design direction | |
| QA Lead | [ ] Approve testing criteria | |

---

## Next Steps

1. **Read SDD** (System Design Detail) for implementation code
2. **Read SRS** (System Requirements Spec) for dependencies
3. **Assign tasks** to frontend developer (1 person, 5-6 hours)
4. **Create PR** with all changes + screenshots
5. **Design review** by CEO/Tech Lead
6. **QA + merge** to main

---

**Status:** 📋 Waiting approval  
**Effort:** 5-6 hours  
**Difficulty:** Medium (mostly copy-paste with grep-replace)  
**Risk:** Low (component extraction is standard React)

**Ready to proceed? → Read SDD next! 🚀**

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** V2.1 Remediation PRD
