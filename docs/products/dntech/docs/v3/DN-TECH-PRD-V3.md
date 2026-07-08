# DN Tech Company Profile Website
## Product Requirements Document (PRD) v3

**Document Version:** 3.0  
**Date:** Juli 2026  
**Status:** Active Development (Refinement from V2)  
**Owner:** Dozer (CEO + Tech Lead)

---

## Executive Summary

PRD v3 adalah **refinement focused** dari v2, dengan perbaikan di:
1. **Exit Intent Modal** — Trigger logic yang lebih presisi
2. **Navbar Logo** — Visual fix untuk background hitam yang kontras
3. **Minor UX improvements** — Based on implementation feedback
4. **Documented bugs & fixes** — Clear change log

**No new features.** Hanya polish & refinement existing features.

---

## Version History

| Version | Date | Focus |
|---------|------|-------|
| v1 | Juni 2026 | Initial spec (dengan data demo) |
| v2 | Juli 2026 | PRD v2: Remove fake data, solid colors, SEO-first, no AI design |
| v3 | **Sekarang** | Refinement: Fix exit modal, navbar logo, accessibility, UX polish |

---

## Priority Issues Fixed in V3

### 🔴 P0: Critical (Must Fix)

#### Issue 1: Exit Intent Modal — Over-triggering

**Current behavior (v2):**
- Modal muncul saat user scroll up (tidak tepat)
- Modal muncul multiple times dalam session
- Trigger terlalu sensitive

**Desired behavior (v3):**
- ✅ Modal hanya muncul saat user benar-benar akan **menutup tab/window**
- ✅ Deteksi via: `beforeunload` event atau `visibilitychange` pada document blur
- ✅ Max 1x per session (set flag di localStorage)
- ✅ Close button (X) bekerja dengan proper state cleanup

**Implementation detail:**
- Hook: `useExitIntent()` → hanya trigger pada genuine exit (tidak scroll)
- Flag: `sessionStorage.exitModalShown = true`
- Events: Listen to `beforeunload`, `mouseout` (near top), `visibilitychange`
- Mobile: No trigger (keyboard ESC bukan genuine exit)

**Acceptance criteria:**
- [ ] Modal not triggered on normal scrolling
- [ ] Modal triggered only when user moves mouse outside viewport (top)
- [ ] Close (X) button dismisses properly
- [ ] Show only 1x per session per user
- [ ] No console errors

---

#### Issue 2: Navbar Logo Background — Dark on Light

**Current issue:**
- Logo DN Tech punya background hitam/dark
- Navbar background putih
- High contrast, looks jarring (warna background logo memecah visual harmony)

**Root cause:**
- Logo SVG atau PNG memiliki background color
- Atau ada styling padding/background di komponennya

**Desired solution (v3):**
- ✅ Use light/transparent logo variant
- ✅ Background hitam hanya di dark sections (hero, footer)
- ✅ Navbar: Logo transparan atau putih outline
- ✅ Hero: Dark logo (terlihat jelas di blue background)
- ✅ Footer: Light/white logo

**Implementation detail:**
- Create 2 logo variants: `Logo.tsx` (light/white) dan `LogoDark.tsx` (dark)
- Navbar: Use `Logo` (transparent bg)
- Hero/Footer: Use `LogoDark`
- CSS: Remove any background styling dari logo wrapper
- Font: Logo text dan icon should inherit navbar text color

**Design specs:**
```
// Navbar Header
<Header>
  <Logo variant="light" /> {/* transparent/white outline */}
  <Nav />
  <CTA />
</Header>

// Hero Section
<Hero>
  <LogoDark /> {/* dark variant - shown in imagery or above text */}
</Hero>

// Footer
<Footer>
  <LogoDark variant="light" /> {/* white/light for dark bg */}
</Footer>
```

**Acceptance criteria:**
- [ ] Logo looks clean in navbar (no dark background showing)
- [ ] Logo visible in all sections (contrast OK)
- [ ] No CSS showing background color on logo
- [ ] Logo width/height consistent (doesn't stretch)

---

### 🟡 P1: High (Should Fix)

#### Issue 3: Modal Close State

**Problem:** When user closes modal (X button), focus not properly managed

**Fix:**
- [ ] Use `useRef` for modal trigger element
- [ ] After close, focus back to last interactive element
- [ ] Or focus to main content

**File:** `frontend/src/components/interactive/ExitIntentModal.tsx`

---

#### Issue 4: Form Accessibility

**Problem:** Some form errors not properly announced to screen readers

**Fix:**
- [ ] Ensure all inputs have `aria-describedby` linked to error message
- [ ] Use `aria-invalid="true"` when error exists
- [ ] Test with screen reader

**File:** `frontend/src/components/forms/MultiStepForm.tsx`

---

#### Issue 5: Mobile Navigation

**Problem:** Hamburger menu doesn't fully close on link click (mobile)

**Fix:**
- [ ] Close menu automatically after link click
- [ ] Add `onClick={() => setIsOpen(false)}` to each nav link

**File:** `frontend/src/components/common/Header.tsx`

---

### 🟢 P2: Nice-to-have (Polish)

#### Issue 6: Load Time Optimization

**Problem:** Initial page load takes 1.5-2s on slow connection

**Improvements:**
- [ ] Lazy load non-critical images
- [ ] Defer analytics scripts
- [ ] Preload Google Fonts

---

## Detailed Specifications

### 1. Exit Intent Modal — Complete Spec

#### File Location
`frontend/src/components/interactive/ExitIntentModal.tsx`

#### Hook: useExitIntent()
```typescript
// frontend/src/hooks/useExitIntent.ts
export function useExitIntent(options?: {
  onExit?: () => void;
  maxShowPerSession?: number;
}) {
  const [showModal, setShowModal] = useState(false);
  const dismissCountRef = useRef(0);

  useEffect(() => {
    // Check if already shown
    const shown = sessionStorage.getItem('exitModalShown');
    if (shown === 'true') return;

    // Track mouse leaving viewport (top edge only)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showModal) {
        setShowModal(true);
        sessionStorage.setItem('exitModalShown', 'true');
        options?.onExit?.();
      }
    };

    // Track beforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only trigger if modal not already shown
      if (sessionStorage.getItem('exitModalShown') !== 'true') {
        setShowModal(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showModal, options]);

  return { showModal, setShowModal, dismiss: () => setShowModal(false) };
}
```

#### Component: ExitIntentModal
```typescript
export function ExitIntentModal() {
  const { showModal, dismiss } = useExitIntent();

  if (!showModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        {/* Close button (X) */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Tunggu! Sebelum Anda pergi...
        </h2>
        
        <p className="text-gray-600 mb-6">
          Jangan lewatkan kesempatan untuk mendiskusikan proyek Anda bersama kami.
          Hubungi sekarang untuk konsultasi gratis.
        </p>

        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
          >
            Tidak, terima kasih
          </button>
          <a
            href="/contact"
            className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-center"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Trigger logic:**
- ✅ Only on genuine exit (mouse leaving viewport top OR beforeunload)
- ✅ Max 1x per session (check sessionStorage)
- ✅ Not on mobile (check `window.matchMedia('(max-width: 1024px)')`)
- ✅ Close button clears modal state

**Testing:**
- [ ] Move mouse out top edge → modal appears
- [ ] Refresh page → modal should NOT appear (session flag)
- [ ] Click X → modal closes, no error
- [ ] On mobile → modal never shows

---

### 2. Navbar Logo — Complete Spec

#### Logo Variants

**LogoLight (Navbar version):**
```typescript
// frontend/src/components/branding/LogoLight.tsx
export function LogoLight() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-blue-900">
      {/* Icon or minimal logo */}
      <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
        <span className="text-white text-sm font-bold">DN</span>
      </div>
      <span>DN Tech</span>
    </div>
  );
}
```

**LogoDark (Hero/Footer version):**
```typescript
// frontend/src/components/branding/LogoDark.tsx
export function LogoDark() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-white">
      {/* Same icon/logo, but text white */}
      <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
        <span className="text-blue-900 text-sm font-bold">DN</span>
      </div>
      <span>DN Tech</span>
    </div>
  );
}
```

#### Header Component Update

```typescript
// frontend/src/components/common/Header.tsx
export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo - light variant */}
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <LogoLight />
        </a>

        {/* Nav + CTA */}
        {/* ... */}
      </div>
    </header>
  );
}
```

**Key changes:**
- Remove any `bg-black` or `bg-gray-900` from logo wrapper
- Use simple text + icon (not image/SVG with embedded background)
- Logo inherits navbar text color (blue-900)
- No padding/background around logo

**Acceptance criteria:**
- [ ] Logo no longer has dark background in navbar
- [ ] Logo text & icon visible clearly on white navbar
- [ ] Logo matches design system colors
- [ ] On mobile, logo still readable

---

## Implementation Checklist (Dozer + Dev Team)

### Phase 1: Exit Intent Modal (2-3 hours)

- [ ] Create `useExitIntent()` hook
- [ ] Update `ExitIntentModal.tsx` with new logic
- [ ] Test on desktop (mouse exit)
- [ ] Test on desktop (beforeunload/refresh)
- [ ] Test on mobile (should NOT show)
- [ ] Verify sessionStorage flag works
- [ ] Check console for errors
- [ ] Deploy to staging

### Phase 2: Navbar Logo (1-2 hours)

- [ ] Create `LogoLight.tsx` & `LogoDark.tsx` components
- [ ] Update `Header.tsx` to use LogoLight
- [ ] Update `Hero.tsx` or wherever LogoDark needed
- [ ] Remove any `bg-*` styling from old logo component
- [ ] Check contrast (WCAG AA minimum)
- [ ] Test on mobile navbar
- [ ] Test on dark sections
- [ ] Deploy to staging

### Phase 3: QA & Polish (1-2 hours)

- [ ] Modal close button works
- [ ] Form accessibility (aria-* attributes)
- [ ] Mobile nav closes on link click
- [ ] Lighthouse score maintained (> 80)
- [ ] No console errors
- [ ] Accessibility audit (WCAG AA)

### Phase 4: Production Deploy

- [ ] Merge to main
- [ ] Run production build (`npm run build`)
- [ ] Deploy to dntech.id
- [ ] Verify on live site
- [ ] Monitor errors (Sentry, if configured)

---

## Backward Compatibility

✅ No breaking changes in v3.

- Existing DB schema: No changes
- API routes: No changes  
- Page routes: No changes
- Admin panel: No changes
- Seed data: No changes

This is purely UI/UX refinement.

---

## Testing Requirements

### Unit Tests
- [ ] `useExitIntent()` hook behavior
- [ ] Modal state management
- [ ] Logo variants render correctly

### Integration Tests
- [ ] Page load → no modal immediately
- [ ] Move mouse out → modal appears
- [ ] Click X → modal closes
- [ ] Close modal → session flag set
- [ ] Refresh page → no modal (flag check)

### Manual Testing
- [ ] Desktop Chrome, Firefox, Safari
- [ ] Mobile iOS Safari, Android Chrome
- [ ] Slow 3G connection (throttle in DevTools)
- [ ] Screen reader (NVDA, JAWS, VoiceOver)

### Performance
- [ ] Core Web Vitals: All GREEN
- [ ] Lighthouse: > 80 on mobile & desktop
- [ ] No jank (smooth 60fps)

---

## Success Criteria

### Exit Intent Modal
- ✅ Shows only on genuine exit (top mouse leave OR tab close)
- ✅ Shows max 1x per session
- ✅ Close button works smoothly
- ✅ No performance impact
- ✅ Mobile: Never shows

### Navbar Logo
- ✅ No dark background visible
- ✅ Clear readability on white navbar
- ✅ Consistent sizing
- ✅ Works on all breakpoints
- ✅ Proper contrast (WCAG AA)

---

## Rollback Plan

If issues arise after deploy:

1. **Exit modal causing issues?**
   - Disable via env var: `NEXT_PUBLIC_ENABLE_EXIT_MODAL=false`
   - Hide in CSS: `.exit-intent-modal { display: none !important; }`

2. **Logo looks broken?**
   - Revert to previous Header component
   - Use image logo if text-based logo fails

---

## Known Limitations & Future Work

### v3 scope:
- Exit modal only (no email capture inside modal — out of scope)
- Logo fix only (no brand redesign — out of scope)

### Potential v4 improvements:
- Email capture inside exit modal
- Modal analytics tracking
- A/B test different modal copy
- Logo animation on hover

---

## Appendix: Changed Files

Files modified in v3:

```
frontend/
├── src/
│   ├── components/
│   │   ├── interactive/ExitIntentModal.tsx [UPDATED]
│   │   ├── common/Header.tsx [UPDATED]
│   │   ├── branding/
│   │   │   ├── LogoLight.tsx [NEW]
│   │   │   └── LogoDark.tsx [NEW]
│   │   └── layout/Hero.tsx [UPDATED - use LogoDark]
│   └── hooks/
│       └── useExitIntent.ts [NEW]
```

---

## Questions?

For clarification:
1. Exit modal email capture? → Out of scope (v4)
2. Logo redesign? → Out of scope, only fix dark bg issue
3. Mobile exit modal? → No, desktop only
4. Should modal show on every tab? → No, once per session

---

**Owner:** Dozer (CEO + Tech Lead)  
**Last Updated:** Juli 2026  
**Next Review:** Agustus 2026 (after v3 launch)

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
