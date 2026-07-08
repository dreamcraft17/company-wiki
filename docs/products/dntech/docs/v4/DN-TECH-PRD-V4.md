# DN Tech Company Profile Website
## Product Requirements Document (PRD) v4

**Document Version:** 4.0  
**Date:** Juli 2026  
**Status:** Active Development (Performance Optimization)  
**Owner:** Dozer (CEO + Tech Lead)

---

## Executive Summary

PRD v4 adalah **performance-first iteration** dari V3, fokus pada:
1. **Mempercepat file loading** (images, scripts, fonts)
2. **Mempercepat page transitions** (SSR optimization, caching, lazy loading)
3. **Menghilangkan bottlenecks** yang sudah diidentifikasi di audit

**Tidak ada fitur baru.** Hanya optimasi infrastructure & code untuk pengalaman user yang lebih cepat.

**Expected impact:** 
- ✅ TTFB (Time to First Byte): -30% to -50%
- ✅ LCP (Largest Contentful Paint): -20% to -40%
- ✅ Core Web Vitals: Maintain/improve GREEN
- ✅ Page transitions: Smooth, <300ms perceived load

---

## Version Timeline

| Version | Date | Focus |
|---------|------|-------|
| v1 | Juni 2026 | Initial spec (dengan data demo) |
| v2 | Juli 2026 | Remove fake data, solid colors, SEO-first |
| v3 | Juli 2026 | Refinement: Exit modal, navbar logo, UX polish |
| v4 | **Sekarang** | Performance: Optimize loading, caching, streaming |

---

## Priority Issues (Based on Performance Audit)

### 🔴 P0: Critical (Feels Slowest to Users)

#### Issue 1: Homepage SSR Waterfall — TTFB Lambat

**Current behavior:**
```
User navigates to / 
  ↓
Next.js SSR starts
  ↓
Homepage must fetch 4 APIs in parallel:
  - GET /services
  - GET /blog?limit=4
  - GET /team
  - GET /settings
  ↓
All 4 requests must complete before HTML renders
  ↓
If backend/DB/network slow → TTFB high (3-5s+)
```

**Problem:** TTFB depends on slowest API call. If backend slow, homepage feels slow.

**Solution (V4):**
- ✅ Make non-critical sections streaming (Suspense)
- ✅ Prioritize: hero + services (critical)
- ✅ Defer: team + blog preview (non-critical)
- ✅ Cache backend responses (Redis/memory)
- ✅ Shorter revalidate for content

**Expected impact:** TTFB -30% to -50%

---

#### Issue 2: Settings Fetched Multiple Times

**Current behavior:**
```
Homepage flow:
1. Layout SSR fetch /settings
2. Homepage SSR fetch /settings (duplicate!)
3. AnalyticsLoader client fetch /settings
4. CrispChatLoader client fetch /settings (duplicate!)
5. PageTracker client POST /analytics

Total: 4 requests for same data, 1 POST
```

**Problem:** Wasted network requests, duplicate data fetching, TTFB depends on settings fetch

**Solution (V4):**
- ✅ Pass settings from server layout to children (React Context or props)
- ✅ Cache settings in memory for 5-10 minutes
- ✅ Pass GA/Crisp IDs to client loaders via env/data
- ✅ Single source of truth for settings

**Expected impact:** -3-4 duplicate requests per page load

---

### 🟡 P1: High (Impacts Experience)

#### Issue 3: Third-Party Scripts Load Too Early

**Current behavior:**
```
Page renders
  ↓
AnalyticsLoader fetch GA script
CrispChatLoader fetch Crisp script
  ↓
Both scripts might:
- Add DNS lookups
- Add JS bundle size
- Block main thread
- Slow down page interaction
```

**Problem:** GA + Crisp load synchronously on page load, adding overhead

**Solution (V4):**
- ✅ Defer GA/Crisp until `requestIdleCallback` (browser idle)
- ✅ Or defer until user interaction (mouse move, scroll, click)
- ✅ Load GA with `async` attribute, no blocking
- ✅ Lazy load Crisp widget (only if scrolling to contact section)

**Expected impact:** Main thread lighter, FID faster

---

#### Issue 4: Images Not Optimized

**Current behavior:**
```
Blog post, team page use <img> tag:
- Browser doesn't auto-resize
- No WebP conversion
- Risk: Large file size, CLS (layout shift)
- No responsive sizing
```

**Problem:** Images waste bandwidth, risk CLS, slow on mobile

**Solution (V4):**
- ✅ Migrate all public images to `next/image`
- ✅ Add `remotePatterns` for uploaded images
- ✅ Auto-sizing, WebP conversion, responsive srcset
- ✅ Lazy loading by default
- ✅ Aspect ratio to prevent CLS

**Expected impact:** LCP/CLS better, bandwidth -20-30%

---

#### Issue 5: Search API Gets Spammed

**Current behavior:**
```
User types search query:
"h" → API call
"he" → API call
"hel" → API call
"hell" → API call
"hello" → API call
Total: 5 API calls for 1 search word
```

**Problem:** User's fast typing = many API requests, waste resources

**Solution (V4):**
- ✅ Add debounce 300ms on search input
- ✅ Cancel previous request with AbortController
- ✅ Show results only after user stops typing
- ✅ Rate limit search endpoint (optional)

**Expected impact:** -80% API calls during search

---

### 🟢 P2: Nice-to-have (Longer-term)

#### Issue 6: Font Loading Can Block Render

**Current behavior:**
- `next/font/google` needs network access at build time
- If build server no internet → build fails
- At runtime: Font loading can delay text render

**Solution (V4):**
- ✅ Self-host Inter font (download at build time)
- ✅ Or use system fonts as fallback
- ✅ Reduce blocking by using `font-display: swap`

**Expected impact:** More reliable builds, no external build dependency

---

#### Issue 7: Build Process Warnings

**Current behavior:**
- Multiple lockfiles detected (root + `/frontend`)
- Turbo/Next uncertain about root directory
- Can cause inconsistent builds

**Solution (V4):**
- ✅ Clean up lockfile structure
- ✅ Or explicitly configure `turbopack.root`

**Expected impact:** Cleaner build logs, consistent CI/CD

---

## Implementation Roadmap (V4)

### Phase 1: Quick Wins (1-2 hours)
- [ ] **1A:** Debounce search input
- [ ] **1B:** Defer GA/Crisp with requestIdleCallback
- [ ] **1C:** Pass settings via props/context (eliminate duplicate fetches)

**Impact:** Feel of speed improvement immediately, -3-4 network requests per page

### Phase 2: Image Optimization (2-3 hours)
- [ ] **2A:** Migrate public images to next/image
- [ ] **2B:** Configure remotePatterns for uploads
- [ ] **2C:** Add lazy loading + aspect ratio

**Impact:** LCP better, CLS eliminated, bandwidth savings

### Phase 3: Streaming & Caching (3-4 hours)
- [ ] **3A:** Make non-critical sections streaming (Suspense)
- [ ] **3B:** Add backend caching (Redis or memory)
- [ ] **3C:** Optimize API response payloads

**Impact:** TTFB -30-50%, smoother page loads

### Phase 4: Font & Build Optimization (1-2 hours)
- [ ] **4A:** Self-host Inter font
- [ ] **4B:** Fix lockfile warnings

**Impact:** Build reliability, no external font dependency

---

## Detailed Specifications (Phased)

### Phase 1: Quick Wins

#### 1A. Search Debounce

**File:** `frontend/src/components/common/Header.tsx`

**Current code issue:**
```typescript
// Currently: every key fires API call
const handleSearch = async (q: string) => {
  if (q.length >= 2) {
    const results = await fetch(`/api/v1/search?q=${q}`);
    setResults(results);
  }
};
```

**Fix:**
```typescript
'use client';

import { useCallback, useRef, useState } from 'react';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Debounce: wait 300ms before searching
    debounceTimerRef.current = setTimeout(async () => {
      try {
        abortControllerRef.current = new AbortController();
        const res = await fetch(
          `/api/v1/search?q=${encodeURIComponent(query)}`,
          { signal: abortControllerRef.current.signal }
        );
        
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        console.error('Search error:', err);
      }
    }, 300); // 300ms debounce
  }, []);

  return (
    // ... existing header JSX ...
    <input
      type="text"
      placeholder="Cari artikel, layanan..."
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      className="..."
    />
  );
}
```

**Testing:**
- [ ] Type quickly: should only make 1 API call
- [ ] Wait 300ms: API call fires
- [ ] Cancel mid-search: previous request canceled
- [ ] No console errors

**Expected impact:** -80% API calls during search

---

#### 1B. Defer GA & Crisp

**File:** `frontend/src/components/seo/AnalyticsLoader.tsx`

**Fix (Defer GA):**
```typescript
'use client';

import { useEffect } from 'react';

interface AnalyticsLoaderProps {
  googleAnalyticsId?: string;
}

export function AnalyticsLoader({ googleAnalyticsId }: AnalyticsLoaderProps) {
  useEffect(() => {
    if (!googleAnalyticsId) return;

    // Defer GA load until browser is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadGoogleAnalytics(googleAnalyticsId);
      });
    } else {
      // Fallback: load after delay
      setTimeout(() => {
        loadGoogleAnalytics(googleAnalyticsId);
      }, 2000);
    }
  }, [googleAnalyticsId]);

  return null;
}

function loadGoogleAnalytics(id: string) {
  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', id);
  window.gtag = gtag;
}
```

**File:** `frontend/src/components/interactive/CrispChatLoader.tsx`

**Fix (Defer Crisp):**
```typescript
'use client';

import { useEffect } from 'react';

interface CrispChatLoaderProps {
  crispWebsiteId?: string;
}

export function CrispChatLoader({ crispWebsiteId }: CrispChatLoaderProps) {
  useEffect(() => {
    if (!crispWebsiteId) return;

    // Option 1: Load on first user interaction
    const loadCrisp = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://client.crisp.chat/l.js';
      document.head.appendChild(script);

      window.$crisp = [];
      window.CRISP_WEBSITE_ID = crispWebsiteId;

      // Remove listeners after loading
      document.removeEventListener('mousemove', loadCrisp);
      document.removeEventListener('scroll', loadCrisp);
      document.removeEventListener('touchstart', loadCrisp);
    };

    // Trigger load on first interaction
    document.addEventListener('mousemove', loadCrisp, { once: true });
    document.addEventListener('scroll', loadCrisp, { once: true });
    document.addEventListener('touchstart', loadCrisp, { once: true });

    return () => {
      // Cleanup
      document.removeEventListener('mousemove', loadCrisp);
      document.removeEventListener('scroll', loadCrisp);
      document.removeEventListener('touchstart', loadCrisp);
    };
  }, [crispWebsiteId]);

  return null;
}
```

**Testing:**
- [ ] Page load: GA/Crisp script NOT in Network tab initially
- [ ] After 2s or on interaction: Scripts appear in Network tab
- [ ] Functionality works (GA tracking, Crisp chat)

**Expected impact:** Main thread lighter, FID faster

---

#### 1C. Pass Settings via Props

**Current flow (problematic):**
```
Layout: fetch /settings
  ↓ (render homepage)
Homepage: fetch /settings again
  ↓ (hydrate)
AnalyticsLoader: fetch /settings
CrispChatLoader: fetch /settings
```

**Fixed flow:**
```
Layout: fetch /settings once
  ↓ (pass via context/props)
All children: use settings from context
  ↓ (hydrate)
Loaders: receive settings, no fetch needed
```

**File:** `frontend/src/app/(public)/layout.tsx`

```typescript
import { createContext } from 'react';

// Create context for settings
export const SettingsContext = createContext(null);

async function getPublicSettings() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/settings', {
      next: { revalidate: 300 }, // Cache 5 minutes
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  return (
    <SettingsContext.Provider value={settings}>
      <Header />
      {children}
      <AnalyticsLoader
        googleAnalyticsId={settings?.googleAnalyticsId}
      />
      <CrispChatLoader
        crispWebsiteId={settings?.crispWebsiteId}
      />
    </SettingsContext.Provider>
  );
}
```

**File:** `frontend/src/app/(public)/page.tsx`

```typescript
// Instead of fetching settings in homepage,
// just fetch services + blog + team

async function getHomeData() {
  const [services, blog, team] = await Promise.all([
    fetch('http://localhost:4000/api/v1/services?limit=6', {
      next: { revalidate: 3600 }, // Cache 1 hour
    }).then(r => r.json()),
    fetch('http://localhost:4000/api/v1/blog?limit=4&status=published', {
      next: { revalidate: 3600 },
    }).then(r => r.json()),
    fetch('http://localhost:4000/api/v1/team?limit=4', {
      next: { revalidate: 3600 },
    }).then(r => r.json()),
  ]);

  return { services, blog, team };
}

export default async function HomePage() {
  const { services, blog, team } = await getHomeData();

  return (
    // ... render homepage
  );
}
```

**Testing:**
- [ ] Network tab: Only 3 requests for homepage (services, blog, team)
- [ ] No duplicate /settings requests
- [ ] GA/Crisp still work
- [ ] Settings display correctly

**Expected impact:** -3-4 duplicate requests, faster TTFB

---

### Phase 2: Image Optimization

#### 2A. Migrate Images to next/image

**File:** `frontend/src/app/(public)/blog/[slug]/page.tsx`

**Current:**
```typescript
<img 
  src={post.featuredImage}
  alt={post.title}
  className="rounded-lg"
/>
```

**Fixed:**
```typescript
import Image from 'next/image';

<Image
  src={post.featuredImage}
  alt={post.title}
  width={800}
  height={600}
  className="rounded-lg"
  loading="lazy"
  quality={80}
  priority={false} // Only true for hero
/>
```

**File:** `frontend/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dntech.id',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dntech.id',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

**Testing:**
- [ ] Images render correctly on all pages
- [ ] Network tab: Images are WebP on supported browsers
- [ ] No CLS (aspect ratio preserved)
- [ ] Lazy loading works (scroll down)

**Expected impact:** LCP -15-20%, bandwidth -20-30%

---

### Phase 3: Streaming & Caching

#### 3A. Make Non-Critical Sections Streaming

**File:** `frontend/src/app/(public)/page.tsx`

**Concept:**
```typescript
import { Suspense } from 'react';

// Critical: loads before user sees page
async function CriticalContent() {
  const [services, settings] = await Promise.all([...]);
  return <ServiceGrid services={services} />;
}

// Non-critical: loads after initial render
async function TeamPreview() {
  const team = await fetch('/api/v1/team');
  return <TeamSpotlight team={team} />;
}

// Loading skeleton
function TeamSkeleton() {
  return <div className="h-40 bg-gray-200 animate-pulse" />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CriticalContent />
      
      {/* This streams in separately */}
      <Suspense fallback={<TeamSkeleton />}>
        <TeamPreview />
      </Suspense>
      
      <Suspense fallback={<BlogSkeleton />}>
        <BlogPreview />
      </Suspense>
    </>
  );
}
```

**Testing:**
- [ ] Page renders with hero + services first
- [ ] Team/blog load after (visible loading skeleton)
- [ ] Streaming works without blocking UI
- [ ] TTFB faster (partial page loads first)

**Expected impact:** TTFB -30%, perceived performance much better

---

#### 3B. Backend Caching

**File:** `backend/src/services/CacheService.ts`

```typescript
class CacheService {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, value: any, ttlSeconds: number = 300) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expiry });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(key: string) {
    this.cache.delete(key);
  }
}

export const cacheService = new CacheService();
```

**Usage:**
```typescript
app.get('/api/v1/services', async (req, res) => {
  const cached = cacheService.get('services:active');
  if (cached) {
    return res.json(cached);
  }

  const services = await prisma.service.findMany({
    where: { status: 'active' },
  });

  // Cache for 1 hour
  cacheService.set('services:active', services, 3600);
  res.json(services);
});
```

**Testing:**
- [ ] First request: takes time, returns from DB
- [ ] Subsequent requests (within 1h): instant, from cache
- [ ] After TTL: fresh data from DB

**Expected impact:** Response time -50-80% for cached endpoints

---

### Phase 4: Font & Build

#### 4A. Self-Host Inter Font

**File:** Download Inter font files and place in `frontend/public/fonts/inter/`

**File:** `frontend/src/app/layout.tsx`

```typescript
import localFont from 'next/font/local';

const inter = localFont({
  src: [
    {
      path: '../public/fonts/inter/inter-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/inter/inter-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/inter/inter-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout() {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className}`}>
        {/* ... */}
      </body>
    </html>
  );
}
```

**Testing:**
- [ ] Build succeeds without external font download
- [ ] Font displays correctly
- [ ] No font flash (FOUT)

**Expected impact:** No external build dependency

---

## Success Metrics (Track These)

### Core Web Vitals (Target: All GREEN)

| Metric | Target | Current* | After V4 |
|--------|--------|----------|----------|
| **LCP** | < 2.5s | ~3-4s** | < 2.0s ✅ |
| **FID** | < 100ms | ~100-200ms** | < 50ms ✅ |
| **CLS** | < 0.1 | ~0.15** | < 0.05 ✅ |

*Not measured formally yet, estimated from audit
**Rough estimates based on issues found

### Page Performance

| Metric | Target | Current* | After V4 |
|--------|--------|----------|----------|
| **TTFB** | < 1s | ~1.5-2s** | < 0.8s ✅ |
| **FCP** | < 1.8s | ~2-3s** | < 1.5s ✅ |
| **Lighthouse** | > 80 | ~70-75** | > 85 ✅ |
| **Network requests** | < 30 | ~35-40** | < 25 ✅ |
| **Total bundle** | < 400KB | ~420KB** | < 350KB ✅ |

### User Experience

| Metric | Current | After V4 |
|--------|---------|----------|
| Homepage load feel | "Slow, waits for data" | "Fast, immediate content" |
| Search while typing | "API calls spam" | "Smooth, debounced" |
| Image loading | "CLS shifts visible" | "Smooth, no shifts" |
| Third-party scripts | "Block main thread" | "Load in background" |

---

## Implementation Timeline (Phased)

### Phase 1: Quick Wins (1-2 hours)
- Debounce search
- Defer GA/Crisp
- Pass settings via props
- **Time:** 2-3 hours
- **Impact:** Immediate feel of speed
- **Risk:** Low

### Phase 2: Image Optimization (2-3 hours)
- Migrate images to next/image
- Add lazy loading
- **Time:** 2-3 hours
- **Impact:** LCP/CLS better
- **Risk:** Low

### Phase 3: Streaming (3-4 hours)
- Implement Suspense boundaries
- Add backend caching
- Test streaming
- **Time:** 3-4 hours
- **Impact:** TTFB -30-50%
- **Risk:** Medium (testing important)

### Phase 4: Font & Build (1 hour)
- Self-host font
- Fix lockfile
- **Time:** 1 hour
- **Impact:** Build reliability
- **Risk:** Low

**Total:** 8-11 hours of dev work + testing

---

## Testing Checklist

### Phase 1 Testing

- [ ] Search debounce works (type fast, 1 API call)
- [ ] GA tracks page views (GA dashboard shows traffic)
- [ ] Crisp chat loads (first interaction)
- [ ] Settings passed to children
- [ ] No console errors

### Phase 2 Testing

- [ ] All images load correctly
- [ ] No CLS visible (aspect ratios held)
- [ ] WebP served on supported browsers
- [ ] Lazy loading works (scroll down)

### Phase 3 Testing

- [ ] Homepage renders critical content first
- [ ] Team/blog stream in after (skeleton visible)
- [ ] Cached endpoints return faster
- [ ] No infinite loading states

### Phase 4 Testing

- [ ] Build succeeds without external network
- [ ] Font displays correctly
- [ ] No "swap" or FOUT visible

### Performance Verification

- [ ] Lighthouse: All scores > 80
- [ ] Core Web Vitals: All GREEN (PageSpeed Insights)
- [ ] Network tab: < 25 requests, < 350KB total
- [ ] Slow 3G throttle: Still usable

---

## Rollback Plan

If issues arise:

### 1. Search debounce causes issues?
- Reduce debounce to 150ms
- Or disable (remove debounce code)

### 2. Streaming breaks layout?
- Convert back to `getHomeData()` Promise.all
- Remove Suspense boundaries

### 3. Image migration issues?
- Revert to `<img>` tags
- Keep next/image config for future

### 4. Caching causes stale data?
- Reduce TTL to 60s
- Or clear cache on admin updates

---

## Known Limitations & Future (V5+)

### Not in scope (V4):
- ❌ CDN setup (Cloudflare, Vercel Edge)
- ❌ Database query optimization
- ❌ API pagination optimization
- ❌ Service worker/offline mode
- ❌ Image compression strategy

### Potential V5 improvements:
- [ ] Edge caching (Cloudflare, Vercel)
- [ ] Database connection pooling
- [ ] API pagination + infinite scroll
- [ ] Service worker + offline mode
- [ ] Automatic image compression + thumbnail generation

---

## Success Criteria

When V4 is complete, you should see:

✅ **Subjective feeling:** "Website feels snappy, not waiting for data"
✅ **Metrics:** Lighthouse > 85 across all pages
✅ **Core Web Vitals:** All GREEN
✅ **TTFB:** < 1 second
✅ **Page load:** Smooth, no janky transitions
✅ **Search:** Smooth, no API spam
✅ **Mobile:** Fast on 4G
✅ **Low-end devices:** Usable on older phones

---

## Questions & Decisions

**Q: Should we also add gzip compression?**  
A: Next.js handles automatically. Verify in nginx config `gzip on;`

**Q: What about CSS-in-JS optimization?**  
A: Using Tailwind (compile-time CSS). Already optimized.

**Q: Should we add service worker?**  
A: Out of scope V4. Consider for V5 if offline access needed.

**Q: Should we optimize API response payloads?**  
A: Not in scope V4 (application logic). Consider if APIs return too much data.

---

## Appendix: Files to Modify

### Phase 1
```
frontend/src/components/common/Header.tsx (debounce search)
frontend/src/components/seo/AnalyticsLoader.tsx (defer GA)
frontend/src/components/interactive/CrispChatLoader.tsx (defer Crisp)
frontend/src/app/(public)/layout.tsx (context for settings)
frontend/src/app/(public)/page.tsx (remove settings fetch)
```

### Phase 2
```
frontend/src/app/(public)/blog/[slug]/page.tsx
frontend/src/app/(public)/team/page.tsx
frontend/src/components/layout/TeamSpotlight.tsx
frontend/src/app/(public)/case-studies/[slug]/page.tsx
frontend/next.config.ts (add remotePatterns)
```

### Phase 3
```
frontend/src/app/(public)/page.tsx (add Suspense)
backend/src/services/CacheService.ts (new)
backend/src/routes/*.ts (add caching)
```

### Phase 4
```
frontend/src/app/layout.tsx (self-host font)
frontend/public/fonts/inter/*.woff2 (new font files)
frontend/next.config.ts (remove google fonts)
```

---

**Owner:** Dozer (CEO + Tech Lead)  
**Last Updated:** Juli 2026  
**Next Review:** Agustus 2026 (after V4 implementation)

**Status:** Ready to implement 🚀

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
