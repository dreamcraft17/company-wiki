# DN Tech V4 — Implementation Guide
## Performance Optimization: Quick Wins First

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Status:** Ready to Implement

---

## 🎯 Quick Overview

V4 fokus pada **3 quick wins dalam 2-3 jam** yang akan memberikan hasil immediate:

| Priority | Task | Time | Impact |
|----------|------|------|--------|
| 1️⃣ | Debounce search | 15 min | -80% search API calls |
| 2️⃣ | Defer GA + Crisp | 30 min | Lighter main thread |
| 3️⃣ | Pass settings via props | 30 min | -4 duplicate requests |
| 4️⃣ | Migrate images to next/image | 2-3 hours | Better LCP/CLS |
| 5️⃣ | Add Suspense streaming | 2-3 hours | TTFB -30-50% |
| 6️⃣ | Backend caching | 1-2 hours | -50-80% response time |
| 7️⃣ | Self-host font | 1 hour | Reliable builds |

**Do 1-3 today (2 hours) → Immediate impact**  
**Do 4-7 in next 2-3 days → Big performance wins**

---

## Phase 1: Quick Wins (2 hours)

### Quick Win 1️⃣: Search Debounce (15 min)

**Why:** User types quickly → 5 API calls. Debounce → 1 API call.

**File:** `frontend/src/components/common/Header.tsx`

**Replace search handler:**

```typescript
'use client';

import { useCallback, useRef, useState } from 'react';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortRef = useRef<AbortController>();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Wait 300ms before searching
    debounceRef.current = setTimeout(async () => {
      try {
        abortRef.current = new AbortController();
        const res = await fetch(
          `/api/v1/search?q=${encodeURIComponent(query)}`,
          { signal: abortRef.current.signal }
        );
        
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search error:', err);
        }
      }
    }, 300);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        {/* Nav */}

        {/* Search Input */}
        <input
          type="text"
          placeholder="Cari..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />

        {/* Results dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-2 bg-white border rounded shadow-lg">
            {searchResults.map((result: any) => (
              <a
                key={result.id}
                href={result.url}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                {result.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
```

**Test:**
```
1. Type "hello" quickly
2. Check Network tab → Only 1 API call (not 5)
3. Type again → Same
4. ✅ Pass
```

---

### Quick Win 2️⃣: Defer GA & Crisp (30 min)

**Why:** GA + Crisp load on page init → slows down. Defer until idle/interaction → lighter.

**File 1:** `frontend/src/components/seo/AnalyticsLoader.tsx`

```typescript
'use client';

import { useEffect } from 'react';

interface AnalyticsLoaderProps {
  googleAnalyticsId?: string;
}

export function AnalyticsLoader({ googleAnalyticsId }: AnalyticsLoaderProps) {
  useEffect(() => {
    if (!googleAnalyticsId) return;

    // Load GA when browser is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadGA(googleAnalyticsId);
      }, { timeout: 3000 });
    } else {
      // Fallback: load after 2 seconds
      setTimeout(() => {
        loadGA(googleAnalyticsId);
      }, 2000);
    }
  }, [googleAnalyticsId]);

  return null;
}

function loadGA(id: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer?.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', id);
  (window as any).gtag = gtag;
}
```

**File 2:** `frontend/src/components/interactive/CrispChatLoader.tsx`

```typescript
'use client';

import { useEffect } from 'react';

interface CrispChatLoaderProps {
  crispWebsiteId?: string;
}

export function CrispChatLoader({ crispWebsiteId }: CrispChatLoaderProps) {
  useEffect(() => {
    if (!crispWebsiteId) return;

    // Load Crisp on first user interaction
    const loadCrisp = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://client.crisp.chat/l.js';
      document.head.appendChild(script);

      (window as any).$crisp = [];
      (window as any).CRISP_WEBSITE_ID = crispWebsiteId;

      // Remove event listeners
      ['mousemove', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, loadCrisp);
      });
    };

    // Attach listeners (once only)
    ['mousemove', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, loadCrisp, { once: true });
    });

    return () => {
      ['mousemove', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, loadCrisp);
      });
    };
  }, [crispWebsiteId]);

  return null;
}
```

**Test:**
```
1. Open page
2. Network tab: NO GA or Crisp scripts
3. Wait 2s or move mouse
4. Network tab: GA + Crisp scripts appear
5. GA tracking works (check Analytics)
6. Crisp chat works (click on chat)
7. ✅ Pass
```

---

### Quick Win 3️⃣: Pass Settings via Props (30 min)

**Why:** Settings fetched 4 times. Pass once → 1 fetch.

**File 1:** `frontend/src/app/(public)/layout.tsx`

**Replace/update:**

```typescript
import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AnalyticsLoader } from '@/components/seo/AnalyticsLoader';
import { CrispChatLoader } from '@/components/interactive/CrispChatLoader';

// ✅ Fetch settings ONCE at layout level
async function getPublicSettings() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`,
      {
        next: { revalidate: 300 }, // Cache 5 min
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getPublicSettings();

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />

      {/* ✅ Pass settings directly, no need to fetch again */}
      <AnalyticsLoader 
        googleAnalyticsId={settings?.googleAnalyticsId} 
      />
      <CrispChatLoader 
        crispWebsiteId={settings?.crispWebsiteId} 
      />
    </>
  );
}
```

**File 2:** `frontend/src/app/(public)/page.tsx`

**Update (remove settings fetch):**

```typescript
async function getHomeData() {
  try {
    // ✅ Fetch ONLY what homepage needs, NOT settings
    const [services, blog, team] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/services?limit=6`, {
        next: { revalidate: 3600 }, // Cache 1 hour
      }).then(r => r.json()),
      
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/blog?limit=4&status=published`,
        {
          next: { revalidate: 3600 },
        }
      ).then(r => r.json()),
      
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/team?limit=4`, {
        next: { revalidate: 3600 },
      }).then(r => r.json()),
    ]);

    return { services, blog, team };
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    return { services: [], blog: [], team: [] };
  }
}

export default async function HomePage() {
  const { services, blog, team } = await getHomeData();

  return (
    <>
      <Hero />
      {/* ... rest of homepage */}
    </>
  );
}
```

**Test:**
```
1. Open homepage
2. Network tab: Watch requests
3. Should see: 1 /settings, 1 /services, 1 /blog, 1 /team
4. Total: 4 requests (not 8)
5. ✅ Pass
```

---

## Phase 2: Image Optimization (2-3 hours)

### Quick Win 4️⃣: Migrate to next/image

**File:** `frontend/next.config.ts`

**Add remotePatterns:**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dntech.id',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dntech.id',
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
  },
};

export default nextConfig;
```

**File:** `frontend/src/app/(public)/blog/[slug]/page.tsx`

**Replace `<img>`:**

```typescript
import Image from 'next/image';

// Before:
// <img src={post.featuredImage} alt={post.title} />

// After:
<Image
  src={post.featuredImage}
  alt={post.title}
  width={800}
  height={600}
  quality={80}
  loading="lazy"
  className="rounded-lg w-full"
/>
```

**Do same for:**
- `frontend/src/app/(public)/team/page.tsx`
- `frontend/src/components/layout/TeamSpotlight.tsx`
- Any other `<img>` tags

**Test:**
```
1. Open blog post with image
2. Check Network: Image is WebP (if supported browser)
3. Image loads smoothly
4. No CLS (layout shift)
5. ✅ Pass
```

---

## Phase 3: Streaming (2-3 hours)

### Quick Win 5️⃣: Add Suspense Boundaries

**File:** `frontend/src/app/(public)/page.tsx`

```typescript
import { Suspense } from 'react';

// Loading skeleton
function TeamSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="h-40 bg-gray-200 rounded-lg animate-pulse" 
        />
      ))}
    </div>
  );
}

function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="h-60 bg-gray-200 rounded-lg animate-pulse" 
        />
      ))}
    </div>
  );
}

// Non-critical sections
async function TeamSection() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/team`);
  const team = await res.json();
  return <TeamSpotlight team={team} />;
}

async function BlogSection() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/blog?limit=4`
  );
  const blog = await res.json();
  return <BlogPreview blog={blog} />;
}

export default async function HomePage() {
  return (
    <>
      <Hero />
      
      {/* Critical - loads first */}
      <ServicesSection />
      
      {/* Non-critical - streams in */}
      <Suspense fallback={<TeamSkeleton />}>
        <TeamSection />
      </Suspense>

      <Suspense fallback={<BlogSkeleton />}>
        <BlogSection />
      </Suspense>
    </>
  );
}
```

**Test:**
```
1. Open homepage
2. See: Hero + Services immediately
3. See: Loading skeleton for Team/Blog
4. After ~500ms-1s: Team/Blog content appears
5. No blocking, smooth
6. ✅ Pass
```

---

### Quick Win 6️⃣: Backend Caching

**File:** `backend/src/utils/cache.ts`

```typescript
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, value: any, ttlSeconds: number = 300) {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expires });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const appCache = new MemoryCache();
```

**File:** `backend/src/routes/services.ts`

```typescript
import { Router } from 'express';
import { appCache } from '@/utils/cache';

const router = Router();

router.get('/services', async (req, res) => {
  const cacheKey = 'services:active';
  
  // Check cache first
  const cached = appCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Fetch from DB
  const services = await prisma.service.findMany({
    where: { status: 'active' },
    take: 10,
  });

  // Cache for 1 hour
  appCache.set(cacheKey, services, 3600);
  
  res.json(services);
});

export default router;
```

**Do same for:** `/blog`, `/team`, `/settings`

**Test:**
```
1. First request: ~100-200ms (from DB)
2. Second request: ~5-10ms (from cache)
3. Wait 1 hour: Refresh from DB again
4. ✅ Pass
```

---

## Phase 4: Font & Build (1 hour)

### Quick Win 7️⃣: Self-Host Font

**File:** `frontend/src/app/layout.tsx`

```typescript
import localFont from 'next/font/local';

const inter = localFont({
  src: [
    {
      path: '../public/fonts/inter/inter-400.woff2',
      weight: '400',
    },
    {
      path: '../public/fonts/inter/inter-600.woff2',
      weight: '600',
    },
    {
      path: '../public/fonts/inter/inter-700.woff2',
      weight: '700',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-inter">
        {children}
      </body>
    </html>
  );
}
```

**Steps:**
1. Download Inter font files (`.woff2` format)
2. Place in `frontend/public/fonts/inter/`
3. Update `layout.tsx` as shown above
4. Test build: `npm run build`

**Test:**
```
1. npm run build
2. Should succeed without fonts.googleapis.com access
3. Font displays correctly
4. ✅ Pass
```

---

## Performance Verification

### Lighthouse Check

```bash
npm run build
npm start

# In browser:
# DevTools → Lighthouse → Analyze page load
```

**Targets after V4:**
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Core Web Vitals Check

```bash
# Use: https://pagespeed.web.dev
# Enter: https://dntech.id
# Check: All GREEN
```

**Targets:**
- LCP: < 2.0s ✅
- FID: < 50ms ✅
- CLS: < 0.05 ✅

### Network Analysis

```bash
# DevTools → Network tab
# Refresh page
# Check:
# - Total requests: < 25
# - Total size: < 350KB
# - DOMContentLoaded: < 2s
# - Load event: < 3s
```

---

## Deployment Checklist

### Before Deploy

- [ ] All code changes committed
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] Lighthouse > 85 all pages
- [ ] Core Web Vitals all GREEN
- [ ] Manual testing on mobile

### Deploy

```bash
cd /var/www/dntech

# Backend
cd backend
npm install
npm run build
pm2 restart dntech-api

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart dntech-web
```

### Post-Deploy

- [ ] Website loads quickly (subjective)
- [ ] No errors in Sentry
- [ ] Search debounce works
- [ ] GA tracking works
- [ ] Crisp chat loads
- [ ] Images load correctly

---

## Priority: Do This Order

### ✅ Do Today (2-3 hours)

1. Debounce search (15 min) — Immediate impact
2. Defer GA/Crisp (30 min) — Lighter main thread
3. Pass settings via props (30 min) — Eliminate duplicate fetches

**Result:** Feel of speed, -4 network requests

### ✅ Do Tomorrow (3-4 hours)

4. Migrate images to next/image (2-3 hours)
5. Add Suspense boundaries (1 hour)

**Result:** TTFB faster, LCP/CLS better

### ✅ Do This Week (2-3 hours)

6. Backend caching (1-2 hours)
7. Self-host font (1 hour)

**Result:** Responses -50% faster, build reliable

---

## Quick Wins Checklist

### Phase 1 (Today)

- [ ] Search debounce implemented + tested
- [ ] GA deferred with requestIdleCallback
- [ ] Crisp deferred on interaction
- [ ] Settings passed from layout
- [ ] No more duplicate /settings requests
- [ ] Network tab shows -4 requests
- [ ] Commit: `perf: Phase 1 quick wins (debounce, defer, settings)`

### Phase 2 (Tomorrow)

- [ ] next/image configured with remotePatterns
- [ ] All `<img>` tags migrated
- [ ] No CLS visible
- [ ] Images are WebP
- [ ] Suspense boundaries added
- [ ] Loading skeletons visible
- [ ] Commit: `perf: Phase 2 image optimization + streaming`

### Phase 3 (This Week)

- [ ] MemoryCache implemented
- [ ] Services/blog/team cached
- [ ] Second request much faster
- [ ] Inter font self-hosted
- [ ] Build works without fonts.googleapis
- [ ] Commit: `perf: Phase 3 backend caching + self-hosted font`

### Final

- [ ] All Lighthouse scores > 85
- [ ] All Core Web Vitals GREEN
- [ ] Deployed to production
- [ ] Monitored for 24h

---

**Ready to implement!** Start with Quick Wins 1-3 today. 🚀

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
