# DN Tech Design System Remediation — SDD
## System Design Detail (Code Implementation)

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Baseline:** [DN-TECH-DESIGN-V2.1-PRD.md](./DN-TECH-DESIGN-V2.1-PRD.md)

---

## 📋 Structure

1. **Task 1-4:** Quick fixes (remove gradient/shadow, standardize colors) — copy-paste ready
2. **Task 5-7:** Component extraction (Alert, Badge, Modal) — new files + refactoring
3. **Task 8-10:** Palette unification + documentation

---

## Task 1: Remove Gradient Placeholders

### File 1: `frontend/src/components/cards/CaseStudyCard.tsx`

**Current code (lines 25-35):**

```typescript
export function CaseStudyCard({ study }: Props) {
  return (
    <Card className="overflow-hidden hover:border-gray-300 transition-colors">
      {/* Hero image or gradient placeholder */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-40 w-full flex items-center justify-center">
        <FolderOpen className="w-10 h-10 text-white" />
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900">{study.title}</h3>
        <p className="text-gray-600 mt-2">{study.description}</p>
        
        <a href={`/case-studies/${study.slug}`} className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Read more →
        </a>
      </div>
    </Card>
  );
}
```

**Fixed code:**

```typescript
import { Image as ImageIcon } from 'lucide-react';

export function CaseStudyCard({ study }: Props) {
  return (
    <Card className="overflow-hidden hover:border-gray-300 transition-colors">
      {/* Option A: CMS media image if available */}
      {study.image ? (
        <div className="h-40 w-full relative overflow-hidden">
          <Image
            src={study.image}
            alt={study.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        /* Fallback: solid bg + icon (NO GRADIENT) */
        <div className="bg-blue-900/10 h-40 w-full flex items-center justify-center">
          <FolderOpen className="w-10 h-10 text-blue-900" />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900">{study.title}</h3>
        <p className="text-gray-600 mt-2">{study.description}</p>
        
        {/* Fix link color: blue-600 → blue-900 */}
        <a 
          href={`/case-studies/${study.slug}`} 
          className="text-blue-900 hover:text-blue-800 font-medium mt-4 inline-block"
        >
          Read more →
        </a>
      </div>
    </Card>
  );
}
```

**Changes:**
- ❌ Removed: `bg-gradient-to-br from-blue-500 to-indigo-600`
- ✅ Added: Conditional `Image` from next/image OR `bg-blue-900/10` solid fallback
- ✅ Fixed: Link color `blue-600` → `blue-900` + `font-medium`

**Testing:**
```bash
# Visual test
# 1. Open /portfolio
# 2. Verify card shows solid light blue background (not gradient)
# 3. Hover link — should be darker blue-800
```

---

### File 2: `frontend/src/app/(public)/portfolio/page.tsx`

**Current code (lines 40-60):**

```typescript
export default function PortfolioPage() {
  return (
    <div className="space-y-12">
      {/* Portfolio grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hardcoded cards with gradient */}
        {PORTFOLIO_ITEMS.map((item) => (
          <div 
            key={item.id}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-8 text-white h-48 flex flex-col justify-between"
          >
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-blue-100">{item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Fixed code:**

```typescript
export default function PortfolioPage() {
  return (
    <div className="space-y-12">
      {/* Portfolio grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Use CaseStudyCard component (already fixed in Task 1 File 1) */}
        {PORTFOLIO_ITEMS.map((item) => (
          <CaseStudyCard key={item.id} study={item} />
        ))}
      </div>
    </div>
  );
}
```

**Changes:**
- ❌ Removed: Hardcoded gradient divs
- ✅ Uses: `<CaseStudyCard />` component (centralized, consistent)

---

### File 3: `frontend/src/app/(public)/portfolio/[slug]/page.tsx`

**Current code (lines 50-70):**

```typescript
export default function PortfolioDetailPage() {
  return (
    <div>
      {/* Hero section with gradient */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold">{portfolio.title}</h1>
          <p className="text-xl mt-4 text-blue-100">{portfolio.category}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto py-12">
        {portfolio.description}
      </div>
    </div>
  );
}
```

**Fixed code:**

```typescript
export default function PortfolioDetailPage() {
  return (
    <div>
      {/* Hero section with solid color (NOT gradient) */}
      <div className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold">{portfolio.title}</h1>
          <p className="text-xl mt-4 text-blue-100">{portfolio.category}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto py-12">
        {portfolio.description}
      </div>
    </div>
  );
}
```

**Changes:**
- ❌ Removed: `bg-gradient-to-br from-blue-500 to-indigo-600`
- ✅ Added: `bg-blue-900` (solid primary color from palette)

---

### File 4: `frontend/src/app/(public)/case-studies/[slug]/page.tsx`

**Current code (lines 45-75, 115-125):**

```typescript
export default function CaseStudyPage() {
  return (
    <div>
      {/* Hero gradient */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white py-20">
        ...
      </div>
      
      {/* Content with badge that has backdrop-blur */}
      <div className="relative">
        <div className="backdrop-blur-sm bg-white/20 px-4 py-2 rounded-full text-blue-900 font-medium w-fit">
          Featured Case Study
        </div>
        ...
      </div>
    </div>
  );
}
```

**Fixed code:**

```typescript
export default function CaseStudyPage() {
  return (
    <div>
      {/* Hero: solid blue (NOT gradient) */}
      <div className="bg-blue-900 text-white py-20">
        ...
      </div>
      
      {/* Content: badge without backdrop-blur */}
      <div className="relative">
        {/* Option A: Solid white badge */}
        <div className="bg-white/90 px-4 py-2 rounded-full text-blue-900 font-medium w-fit shadow-sm">
          Featured Case Study
        </div>
        
        {/* OR Option B: Outline badge (simpler) */}
        {/* <div className="border border-blue-900 px-4 py-2 rounded-full text-blue-900 font-medium w-fit"> */}
        {/*   Featured Case Study */}
        {/* </div> */}
        ...
      </div>
    </div>
  );
}
```

**Changes:**
- ❌ Removed: `bg-gradient-to-br from-blue-500 to-indigo-600`
- ❌ Removed: `backdrop-blur-sm bg-white/20` (glassmorphism)
- ✅ Added: `bg-blue-900` hero + solid badge `bg-white/90`

---

## Task 2: Remove Shadow from Admin Login

### File: `frontend/src/app/admin/login/page.tsx`

**Current code (lines 35-50):**

```typescript
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}
```

**Fixed code:**

```typescript
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Remove shadow-xl, use border only (flat design) */}
      <Card className="w-full max-w-md border border-gray-200">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}
```

**Changes:**
- ❌ Removed: `shadow-xl` from Card
- ❌ Removed: Gradient background `from-slate-900 to-slate-800` (not required by audit, but aligns V2 solid-only)
- ✅ Added: `border border-gray-200` (flat design)
- Note: If you keep gradient, that's OK — focus is on shadow-xl removal

**Testing:**
```bash
# Navigate to /admin/login
# Verify: Card has subtle border, no shadow
# Accessibility: Check contrast (axe DevTools)
```

---

## Task 3: Standardize Link Accent Color

### Already fixed in Task 1 (CaseStudyCard)

**Additional files to check:**

```bash
grep -r "text-blue-600" frontend/src --include="*.tsx" --include="*.ts"
```

**Output (example):**
```
components/cards/CaseStudyCard.tsx: text-blue-600
components/common/Footer.tsx: text-blue-900 hover
app/(public)/blog/page.tsx: text-blue-600
```

**Fix each:**
```typescript
// BEFORE
className="text-blue-600 hover:text-blue-700"

// AFTER
className="text-blue-900 hover:text-blue-800 font-medium"
```

---

## Task 4: (Already done above)

✅ All P0 fixes included in Tasks 1-3.

---

## Task 5: Extract Alert Component

### File: `frontend/src/components/ui/Alert.tsx` (NEW)

```typescript
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils'; // Ensure this exists

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const variantConfig = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    text: 'text-red-800',
    Icon: AlertCircle,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    text: 'text-green-800',
    Icon: CheckCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    text: 'text-yellow-800',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    text: 'text-blue-800',
    Icon: Info,
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  onClose,
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <div
      className={cn(
        'border rounded-lg p-4 flex gap-3',
        config.bg,
        config.border,
        className
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.icon)} />
      
      <div className="flex-1">
        {title && <h3 className={cn('font-semibold', config.title)}>{title}</h3>}
        <p className={config.text}>{children}</p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}

// For backwards compatibility, export as AlertBox too
export const AlertBox = Alert;
```

### Usage Examples:

```typescript
import { Alert } from '@/components/ui/Alert';

// In a form
<form onSubmit={handleSubmit}>
  {error && <Alert variant="error" title="Error">{error}</Alert>}
  
  <input type="email" />
  
  {success && <Alert variant="success">Form submitted!</Alert>}
  
  <button type="submit">Submit</button>
</form>

// In admin
<div className="space-y-4">
  <Alert variant="info">
    This action cannot be undone. Please confirm your changes.
  </Alert>
</div>
```

### Files to Refactor (Replace inline divs):

**Search for:**
```bash
grep -r "bg-red-50 border" frontend/src
grep -r "bg-blue-50 border" frontend/src
grep -r "bg-yellow-100 border" frontend/src
```

**Replace with:**
```typescript
<Alert variant="error">Error message</Alert>
<Alert variant="info">Info message</Alert>
<Alert variant="success">Success message</Alert>
```

---

## Task 6: Extract Badge Component

### File: `frontend/src/components/ui/Badge.tsx` (NEW)

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantConfig = {
  default: 'bg-blue-50 text-blue-900 border border-blue-200',
  secondary: 'bg-teal-50 text-teal-900 border border-teal-200',
  success: 'bg-green-50 text-green-900 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
  error: 'bg-red-50 text-red-900 border border-red-200',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        variantConfig[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

### Usage:

```typescript
import { Badge } from '@/components/ui/Badge';

// In case study cards
<div className="space-x-2 mt-4">
  <Badge>Fullstack</Badge>
  <Badge variant="secondary">React</Badge>
  <Badge variant="success">Deployed</Badge>
</div>

// In portfolio
{item.tags.map(tag => (
  <Badge key={tag}>{tag}</Badge>
))}
```

---

## Task 7: Extract Modal Component

### File: `frontend/src/components/ui/Modal.tsx` (NEW)

```typescript
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            'bg-white rounded-lg shadow-lg max-w-md w-full',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  );
}

// Action buttons wrapper
export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 justify-end mt-6">{children}</div>;
}

Modal.Actions = ModalActions;
```

### Usage:

```typescript
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function ContactModal() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Contact us</Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Get in touch">
        <p>Send us a message...</p>
        <ContactForm />
        
        <Modal.Actions>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button>Send</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
```

---

## Task 8: Unify Palette (Option A — Recommended)

### Global find-replace (via IDE or script):

```bash
# In frontend/src directory
# Replace all slate-* with gray-*

find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-slate-900/bg-gray-900/g'
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-slate-800/bg-gray-800/g'
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-slate-700/bg-gray-700/g'
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-slate-600/bg-gray-600/g'
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/bg-slate-100/bg-gray-100/g'
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/text-slate-/text-gray-/g'
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/border-slate-/border-gray-/g'
```

### Admin sidebar special case (blue-900 primary):

**File:** `frontend/src/components/admin/AdminSidebar.tsx`

**Before:**
```typescript
<aside className="bg-slate-900 text-slate-300 w-64">
  <nav>
    <a className="text-slate-400 hover:text-slate-100">Dashboard</a>
  </nav>
</aside>
```

**After:**
```typescript
<aside className="bg-blue-900 text-white w-64">
  <nav>
    <a className="text-blue-100 hover:text-white font-medium">Dashboard</a>
  </nav>
</aside>
```

### Verify:

```bash
grep -r "slate-" frontend/src
# Should return 0 results

grep -r "gray-" frontend/src | head -20
# Should show unified gray palette
```

---

## Task 9: Update Documentation

### File: `IMPLEMENTATION-STATUS.md` (Section 2)

**Before:**
```markdown
## 2. Design System V2

- ✅ Solid color palet implemented
- ✅ Gradients removed from avatar & hero
- ✅ Flat card design (no heavy shadow)
- ...
```

**After:**
```markdown
## 2. Design System V2

- ✅ Solid color palet (blue-900, teal-600, gray-*) implemented
- ✅ Gradients removed from avatar & hero
- ✅ Flat card design (border only, no heavy shadow)
- ✅ Form accessibility (labels, min-h 48px, aria-invalid)
- ✅ Lucide icons in all pages
- ✅ **V2.1 REMEDIATION (9 Jul 2026):**
  - ✅ Removed gradient placeholders from portfolio/case-studies
  - ✅ Removed `backdrop-blur` (anti-glassmorphism mandate)
  - ✅ Standardized link accent color to `blue-900`
  - ✅ Extracted Alert, Badge, Modal components
  - ✅ Unified admin + public palette to `gray-*` + `blue-900`
- 🟠 **Known deviations from V2:**
  - Avatar: initials only (awaiting real photos upload via CMS)
  - Font: system stack (performance trade-off per V4 audit)
  - Dark mode: not implemented (planned V2.2+)
```

---

## Task 10: Testing Checklist

### Visual Regression Test (Manual)

```
[ ] Homepage
  [ ] Hero: solid blue-900 bg (no gradient)
  [ ] Button: blue-900 + white text
  [ ] CTA: accessible contrast
  
[ ] Portfolio page
  [ ] Cards: solid bg-blue-900/10 OR CMS image
  [ ] Link: blue-900 (not blue-600)
  [ ] No gradients visible
  
[ ] Case studies detail
  [ ] Hero: solid blue-900 (not gradient)
  [ ] Badge: no backdrop-blur
  [ ] Readable text + contrast
  
[ ] Admin login
  [ ] Card: border only (no shadow-xl)
  [ ] Form: labels + error states
  
[ ] Admin pages
  [ ] Sidebar: blue-900 (not slate-900)
  [ ] Consistent gray palette throughout
  
[ ] New components (Alert, Badge, Modal)
  [ ] Alert: 4 variants work + icon
  [ ] Badge: colors match palette
  [ ] Modal: closes properly + accessible
```

### Automated Tests

```bash
# Grep for violations
grep -r "gradient-to-" frontend/src/app/(public) frontend/src/components
# Should return 0 (or only comments)

grep -r "backdrop-blur" frontend/src
# Should return 0

grep -r "shadow-xl" frontend/src/app/admin/login
# Should return 0 (if applied)

grep -r "text-blue-600" frontend/src/app/(public)
# Should return 0 (all converted to blue-900)

grep -r "slate-" frontend/src/app/(public)
# Should return 0 (all converted to gray-*)
```

### Lighthouse Audit

```bash
# After deployment
# Run Lighthouse on:
#  - /
#  - /portfolio
#  - /case-studies/[any]
#  - /admin/login

# Target: Design score ≥ 85
```

### Accessibility Test (axe DevTools)

```bash
# Run axe on each page
# Check:
#  - Contrast ratio ≥ 4.5:1
#  - Form labels connected
#  - Keyboard navigation works
#  - Alert aria-role correct
```

---

## Deployment Order

```
Branch: design/v2-1-remediation

Commit 1: Remove gradients + shadows
  - frontend/src/components/cards/CaseStudyCard.tsx
  - frontend/src/app/(public)/portfolio/page.tsx
  - frontend/src/app/(public)/portfolio/[slug]/page.tsx
  - frontend/src/app/(public)/case-studies/[slug]/page.tsx
  - frontend/src/app/admin/login/page.tsx

Commit 2: Extract new components
  - frontend/src/components/ui/Alert.tsx
  - frontend/src/components/ui/Badge.tsx
  - frontend/src/components/ui/Modal.tsx
  - Refactor 5 files to use new components

Commit 3: Unify palette
  - find+replace slate-* → gray-*
  - frontend/src/components/admin/AdminSidebar.tsx → blue-900

Commit 4: Documentation
  - IMPLEMENTATION-STATUS.md
  - DESIGN_SUMMARY.md (if needed)

PR → Review → Merge → Deploy
```

---

## Rollback Plan

If issues found after deployment:

```bash
git revert <commit-hash>  # Revert specific commit
# OR
git reset --hard <previous-tag>  # Full rollback
```

Keep Figma/screenshot of old design for reference.

---

**Status:** Ready to implement  
**Time estimate:** 4-5 hours (1 dev)  
**Complexity:** Medium (mostly copy-paste + component extraction)  
**Risk:** Low (backward compatible, no data changes)

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026  
**Version:** V2.1 Remediation SDD
