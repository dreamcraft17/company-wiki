# DN Tech V3 — Implementation Guide
## Ready-to-Use Code & Testing Steps

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Audience:** Development Team  
**Status:** Ready to Implement

---

## Quick Overview

Dokumen ini berisi **copy-paste ready code** untuk:
1. ✅ Fix Exit Intent Modal (trigger logic only on genuine exit)
2. ✅ Fix Navbar Logo (remove dark background)
3. ✅ Testing procedures
4. ✅ Deployment checklist

**Total implementation time:** 2-3 jam

---

## Part 1: Exit Intent Modal Fix

### Issue Summary

**Current:** Modal triggers saat scroll up (salah), multiple times per session, jangan bisa reliable distinguish exit vs scroll

**Target:** Modal hanya trigger saat **genuine exit** (mouse leave viewport top OR beforeunload), max 1x per session

### Solution: useExitIntent Hook

#### File: `frontend/src/hooks/useExitIntent.ts`

**Create this new file:**

```typescript
'use client';

import { useEffect, useState } from 'react';

interface UseExitIntentOptions {
  onExit?: () => void;
  enableMobile?: boolean;
  debug?: boolean;
}

export function useExitIntent(options?: UseExitIntentOptions) {
  const [showModal, setShowModal] = useState(false);
  const debugMode = options?.debug === true;
  const sessionKey = 'exitIntentModalShown';

  useEffect(() => {
    // Skip if mobile (unless explicitly enabled)
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    if (isMobile && !options?.enableMobile) {
      if (debugMode) console.log('[ExitIntent] Mobile device, skipping');
      return;
    }

    // Check if already shown in this session
    const alreadyShown = sessionStorage.getItem(sessionKey) === 'true';
    if (alreadyShown) {
      if (debugMode) console.log('[ExitIntent] Already shown in this session');
      return;
    }

    // Handler: Mouse leaves viewport from top
    const handleMouseLeaveTop = (e: MouseEvent) => {
      // Only trigger if mouse y-position is at/above 0 and moving upward (out of window)
      if (e.clientY <= 0 && !showModal) {
        if (debugMode) console.log('[ExitIntent] Mouse left viewport top');
        triggerModal();
      }
    };

    // Handler: beforeunload (user closing tab, navigating away)
    const handleBeforeUnload = () => {
      if (debugMode) console.log('[ExitIntent] beforeunload event triggered');
      // Mark as shown (but don't show modal, page is closing anyway)
      sessionStorage.setItem(sessionKey, 'true');
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeaveTop);
    window.addEventListener('beforeunload', handleBeforeUnload);

    function triggerModal() {
      setShowModal(true);
      sessionStorage.setItem(sessionKey, 'true');
      options?.onExit?.();
    }

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeaveTop);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showModal, options, debugMode]);

  const dismiss = () => {
    setShowModal(false);
  };

  return {
    showModal,
    dismiss,
    setShowModal,
  };
}
```

### Update: ExitIntentModal Component

#### File: `frontend/src/components/interactive/ExitIntentModal.tsx`

**Replace entire component with:**

```typescript
'use client';

import { useExitIntent } from '@/hooks/useExitIntent';
import { X } from 'lucide-react';
import Link from 'next/link';

export function ExitIntentModal() {
  const { showModal, dismiss } = useExitIntent({
    onExit: () => {
      // Optional: track event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exit_intent_shown');
      }
    },
    debug: process.env.NODE_ENV === 'development', // Show logs in dev
  });

  if (!showModal) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          {/* Close Button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Content */}
          <div className="p-8 pt-12">
            <h2
              id="exit-modal-title"
              className="text-2xl font-bold text-blue-900 mb-4"
            >
              Tunggu! Sebelum Anda pergi...
            </h2>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Jangan lewatkan kesempatan untuk mendiskusikan proyek Anda bersama
              tim DN Tech. Hubungi kami hari ini untuk konsultasi gratis.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={dismiss}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tidak, terima kasih
              </button>

              <Link
                href="/contact"
                onClick={dismiss}
                className="flex-1 px-4 py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors text-center"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

### Add to Layout

#### File: `frontend/src/app/layout.tsx`

**Add to root layout:**

```typescript
import { ExitIntentModal } from '@/components/interactive/ExitIntentModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        
        {/* Exit Intent Modal - must be at root level */}
        <ExitIntentModal />
      </body>
    </html>
  );
}
```

---

## Part 2: Navbar Logo Fix

### Issue Summary

**Current:** Logo punya background hitam/dark yang kontras dengan navbar putih (jelek)

**Target:** Logo transparent, tidak ada background color, clean di navbar putih

### Solution: Logo Variants

#### File: `frontend/src/components/branding/LogoLight.tsx`

**Create this new file (untuk navbar):**

```typescript
/**
 * LogoLight - Logo variant untuk navbar & light backgrounds
 * - Background: transparent
 * - Text/Icon color: Inherit dari navbar (blue-900)
 */

export function LogoLight() {
  return (
    <div 
      className="flex items-center gap-2 font-bold text-lg text-blue-900"
      aria-label="DN Tech - Custom Software Development"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-white text-xs font-bold leading-none">DN</span>
      </div>

      {/* Text */}
      <span className="hidden sm:inline">DN Tech</span>
    </div>
  );
}

export default LogoLight;
```

#### File: `frontend/src/components/branding/LogoDark.tsx`

**Create this new file (untuk hero, footer):**

```typescript
/**
 * LogoDark - Logo variant untuk dark backgrounds (hero, footer)
 * - Icon: White background
 * - Text: White
 * - Used in dark sections
 */

export function LogoDark() {
  return (
    <div
      className="flex items-center gap-2 font-bold text-lg text-white"
      aria-label="DN Tech - Custom Software Development"
    >
      {/* Icon - inverted colors */}
      <div
        className="w-8 h-8 bg-white rounded-md flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-blue-900 text-xs font-bold leading-none">DN</span>
      </div>

      {/* Text */}
      <span className="hidden sm:inline">DN Tech</span>
    </div>
  );
}

export default LogoDark;
```

### Update: Header Component

#### File: `frontend/src/components/common/Header.tsx`

**Update header to use LogoLight:**

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LogoLight } from '@/components/branding/LogoLight';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Layanan', href: '/services' },
    { label: 'Tentang', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Kontak', href: '/contact' },
  ];

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <LogoLight />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:flex">
            <Link
              href="/contact"
              className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm"
            >
              Konsultasi Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="block py-3 text-gray-700 hover:text-blue-900 font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={handleNavClick}
              className="block mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-center font-medium"
            >
              Konsultasi Gratis
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
```

### Update: Hero Section

#### File: `frontend/src/components/layout/Hero.tsx`

**Update to use LogoDark:**

```typescript
import { LogoDark } from '@/components/branding/LogoDark';
import Link from 'next/link';

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export function Hero({
  title = 'Custom Software Development untuk Startup & SME Indonesia',
  subtitle = 'Kami membangun solusi teknologi yang scalable, reliable, dan cost-effective',
  description,
}: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Optional: Logo at top of hero */}
        <div className="mb-12">
          <LogoDark />
        </div>

        {/* Main Content */}
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-blue-50 mb-8 leading-relaxed">
            {subtitle}
          </p>

          {description && (
            <p className="text-base md:text-lg text-blue-100 mb-12 leading-relaxed">
              {description}
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              Mulai Konsultasi Gratis
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-blue-800 transition-colors text-center"
            >
              Lihat Layanan Kami
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Update: Footer

#### File: `frontend/src/components/common/Footer.tsx`

**Update to use LogoDark:**

```typescript
import { LogoDark } from '@/components/branding/LogoDark';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <LogoDark />
            <p className="text-sm text-gray-400 mt-4">
              Custom software development solutions untuk startup dan SME Indonesia.
            </p>
          </div>

          {/* Produk */}
          <div>
            <h4 className="font-bold text-white mb-4">Produk</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services" className="hover:text-white transition">
                  Layanan
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h4 className="font-bold text-white mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition">
                  Karir
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700" />

        {/* Bottom Footer */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {currentYear} DN Tech. Semua hak dilindungi.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://linkedin.com/company/dntech" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/dntech" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://twitter.com/dntech" target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## Part 3: Testing Procedures

### Test Case 1: Exit Intent Modal

#### Setup
```bash
# Start dev server
npm run dev

# Open http://localhost:3000 in Chrome desktop
# Open DevTools → Console (to see debug logs)
```

#### Test Steps

**Test 1.1: Modal should NOT show on normal scroll**
```
1. Load page
2. Scroll up and down multiple times
3. ✅ EXPECT: Modal NOT shown
4. ✅ EXPECT: No "mouseleave" logs in console
```

**Test 1.2: Modal should show when mouse leaves viewport top**
```
1. Load page with debug=true
2. Move mouse cursor to top edge and move out of window (upward)
3. ✅ EXPECT: Modal appears
4. ✅ EXPECT: Console shows "[ExitIntent] Mouse left viewport top"
5. ✅ EXPECT: sessionStorage.exitIntentModalShown = 'true'
```

**Test 1.3: Modal close button (X) should work**
```
1. Modal is shown
2. Click close button (X) in top-right
3. ✅ EXPECT: Modal disappears
4. ✅ EXPECT: Overlay disappears
5. ✅ EXPECT: No errors in console
```

**Test 1.4: CTA button should navigate to contact**
```
1. Modal is shown
2. Click "Hubungi Kami" button
3. ✅ EXPECT: Navigate to /contact
4. ✅ EXPECT: Modal closes
```

**Test 1.5: Modal should show max 1x per session**
```
1. Trigger modal (mouse leave top) → shows
2. Close modal
3. Trigger exit again (mouse leave top) → doesn't show
4. ✅ EXPECT: Modal NOT shown second time
5. ✅ EXPECT: sessionStorage still has exitIntentModalShown = 'true'
6. Refresh page (same tab)
7. ✅ EXPECT: Modal NOT shown (flag still set in sessionStorage)
8. Open new tab → new session
9. ✅ EXPECT: Modal shows again (new sessionStorage)
```

**Test 1.6: Mobile should NOT show modal**
```
1. Open DevTools → Toggle device toolbar (mobile view)
2. Try to trigger modal (mouse leave)
3. ✅ EXPECT: Modal NOT shown (mobile skipped in code)
```

**Test 1.7: beforeunload should set flag**
```
1. Load page
2. Try to close browser tab / navigate away
3. ✅ EXPECT: beforeunload event triggered
4. ✅ EXPECT: sessionStorage flag set
5. (Modal may or may not show since page is closing)
```

### Test Case 2: Navbar Logo

#### Setup
```bash
npm run dev
# Open http://localhost:3000
# View on different screen sizes
```

#### Test Steps

**Test 2.1: Logo should be visible in navbar**
```
1. Load homepage
2. Look at navbar (top of page)
3. ✅ EXPECT: Logo visible (DN Tech text + icon)
4. ✅ EXPECT: No black/dark background around logo
5. ✅ EXPECT: Logo color matches navbar (blue-900 text on white bg)
```

**Test 2.2: Logo should not have background styling**
```
1. Open DevTools → Inspector
2. Click on logo element
3. Look at Computed Styles
4. ✅ EXPECT: No background-color property (or background: transparent)
5. ✅ EXPECT: No padding creating visual box
6. ✅ EXPECT: No box-shadow
```

**Test 2.3: Logo should be clean on all backgrounds**
```
1. Scroll down to Hero section (blue background)
2. ✅ EXPECT: Hero logo (LogoDark) visible with white text
3. ✅ EXPECT: Icon with white background showing
4. Scroll to Footer (dark background)
5. ✅ EXPECT: Footer logo visible with white text
```

**Test 2.4: Logo should scale responsively**
```
1. Resize browser window (mobile → desktop)
2. ✅ EXPECT: Logo text appears/disappears on mobile (hidden sm:inline)
3. ✅ EXPECT: Icon always visible
4. ✅ EXPECT: No stretching or sizing issues
```

**Test 2.5: Logo link should work**
```
1. Click on logo in navbar
2. ✅ EXPECT: Navigate to / (homepage)
3. ✅ EXPECT: Smooth transition, no errors
```

**Test 2.6: Hover state should work**
```
1. Hover over logo
2. ✅ EXPECT: opacity changes (opacity-80 on hover)
3. ✅ EXPECT: Smooth transition
```

### Test Case 3: Accessibility

#### Test Steps

**Test 3.1: Modal keyboard navigation**
```
1. Load page with modal showing
2. Press Tab key
3. ✅ EXPECT: Focus cycles through: "Tidak" button → "Hubungi" button → Close X → "Tidak" button
4. ✅ EXPECT: Can activate button with Enter/Space
```

**Test 3.2: Modal screen reader**
```
1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Load page
3. ✅ EXPECT: Screen reader announces "Exit Intent Modal" or heading
4. ✅ EXPECT: Buttons announced with labels
```

**Test 3.3: Color contrast**
```
1. Open browser DevTools → Lighthouse
2. Run Accessibility audit
3. ✅ EXPECT: No color contrast issues
4. ✅ EXPECT: All text readable
```

### Test Case 4: Performance

#### Test Steps

**Test 4.1: Lighthouse Score**
```
1. Open DevTools → Lighthouse
2. Run Lighthouse audit (Mobile + Desktop)
3. ✅ EXPECT: Performance > 80
4. ✅ EXPECT: No significant changes from before
```

**Test 4.2: Core Web Vitals**
```
1. Use https://pagespeed.web.dev
2. Enter https://dntech.id (production)
3. ✅ EXPECT: LCP < 2.5s (GREEN)
4. ✅ EXPECT: FID < 100ms (GREEN)
5. ✅ EXPECT: CLS < 0.1 (GREEN)
```

**Test 4.3: Bundle size**
```
1. npm run build (backend & frontend)
2. Check bundle size
3. ✅ EXPECT: No significant increase from V2
```

---

## Part 4: Deployment Checklist

### Pre-Deployment

- [ ] All tests passed (see Testing Procedures above)
- [ ] No console errors on production build
- [ ] Lighthouse score > 80 (mobile & desktop)
- [ ] Code reviewed by team lead
- [ ] Commit message follows convention: `feat: Exit modal + navbar logo fixes (V3)`
- [ ] Branch merged to `main`

### Deployment Steps

**1. Build & Test**
```bash
# Backend
cd backend
npm run build
npm run test  # if tests exist

# Frontend
cd frontend
npm run build
npm run lint

# Verify no errors
```

**2. Staging Deploy (Optional)**
```bash
# Deploy to staging environment
# Test all functionality one more time
# Verify exit modal behavior on actual server
# Check navbar logo on production domain
```

**3. Production Deploy**
```bash
# Pull latest from main
git pull origin main

# Backend
cd backend
npm install
npx prisma db push  # if schema changes (none in V3)
npm run build
pm2 restart dntech-api

# Frontend
cd frontend
npm install
npm run build
pm2 restart dntech-web

# Verify
curl https://api.dntech.id/api/v1/services  # Should return 200
```

### Post-Deployment

- [ ] Visit https://dntech.id (check navbar logo looks clean)
- [ ] Test exit modal (move mouse top edge)
- [ ] Check Sentry/error logs (should be quiet)
- [ ] Verify GA4 tracking works
- [ ] Monitor Core Web Vitals (PageSpeed Insights)
- [ ] Check CloudFlare caching (should see cache HIT)
- [ ] Announce to team (Slack/email)

---

## Part 5: Rollback Plan

If issues arise:

### Quick Rollback (Exit Modal)

```bash
# Disable exit modal without redeploying
# Option 1: Environment variable
NEXT_PUBLIC_DISABLE_EXIT_MODAL=true

# Option 2: CSS hide
# Add to globals.css
.exit-intent-modal {
  display: none !important;
}
```

### Full Rollback (if critical)

```bash
# Revert to previous commit
git revert HEAD

# Rebuild & redeploy
npm run build
pm2 restart dntech-web dntech-api
```

---

## Part 6: Monitoring After Deploy

### First 24 Hours

Check these metrics:

1. **Errors in Sentry** → Should be 0 new errors
2. **Core Web Vitals** → All should be GREEN
3. **Traffic** → Should be normal (no spike in errors)
4. **Exit Modal** → Monitor event tracking (if GA4 configured)
5. **Logo Display** → Spot check homepage on mobile + desktop

### Tools to Monitor

```
Google Analytics: https://analytics.google.com
  → Realtime traffic
  → Events → exit_intent_shown (if tracked)

PageSpeed Insights: https://pagespeed.web.dev
  → Input dntech.id
  → Check Core Web Vitals

Sentry (if configured): https://sentry.io
  → Check for new errors
  → Issues dashboard

CloudFlare (if using): https://dash.cloudflare.com
  → Analytics → Traffic
  → Cache → Cache Rules
```

---

## Quick Ref: Changed Files

```
NEW FILES:
  frontend/src/hooks/useExitIntent.ts (V3 exit modal hook)
  frontend/src/components/branding/LogoLight.tsx (navbar logo)
  frontend/src/components/branding/LogoDark.tsx (hero/footer logo)

MODIFIED FILES:
  frontend/src/components/interactive/ExitIntentModal.tsx (refined logic)
  frontend/src/components/common/Header.tsx (use LogoLight)
  frontend/src/components/layout/Hero.tsx (use LogoDark)
  frontend/src/components/common/Footer.tsx (use LogoDark)
  frontend/src/app/layout.tsx (add <ExitIntentModal /> at root)

NO DATABASE CHANGES (V3 is UI-only)
NO API CHANGES (V3 is UI-only)
```

---

## FAQ

**Q: Will exit modal affect SEO?**  
A: No, modal is client-side only. Doesn't appear to search bots.

**Q: Can users close modal and still see content?**  
A: Yes, click outside modal or press X button. Content still accessible.

**Q: What if browser blocks mouseleave event?**  
A: beforeunload event will still fire. Plus most modern browsers allow mouseleave.

**Q: Should we track modal performance?**  
A: Optional. Add GA4 event tracking if you want metrics.

**Q: Can users avoid modal?**  
A: Yes, once per session. Refreshing page → new session → modal reappears. This is intentional (not annoying).

---

## Support

**Issues during implementation?**

1. Check console logs (enable debug=true in useExitIntent)
2. Verify sessionStorage in DevTools → Application tab
3. Test on different browsers (Chrome, Firefox, Safari)
4. Review SDD section 6.1 for detailed spec

---

**Ready to implement!** 🚀

Start with Part 1 (Exit Modal), then Part 2 (Logo), then test thoroughly.

**Estimated time:** 2-3 hours total

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
