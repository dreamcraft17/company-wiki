# DN Tech V4 — Performance Optimization
## Executive Summary

**Date:** Juli 2026  
**Owner:** Dozer (CEO + Tech Lead)  
**Focus:** Mempercepat loading file dan page transitions

---

## 📊 The Problem (From Performance Audit)

Website terasa lambat karena **7 bottlenecks**:

| Issue | Impact | Severity |
|-------|--------|----------|
| **Homepage SSR waterfall** | TTFB 3-5s+ (wait for 4 API calls) | P0 🔴 |
| **Settings fetched 4x** | Duplicate network requests | P0 🔴 |
| **GA/Crisp load early** | Block main thread | P1 🟡 |
| **Images not optimized** | Risk CLS, waste bandwidth | P1 🟡 |
| **Search API spammed** | User types fast = 5 API calls | P1 🟡 |
| **Font blocks build** | Need external network | P2 🟢 |
| **Build warnings** | Inconsistent CI/CD | P2 🟢 |

---

## ✅ The Solution (V4)

**7 fixes organized in 4 phases:**

### Phase 1: Quick Wins (2-3 hours)
1. **Debounce search** → -80% search API calls
2. **Defer GA/Crisp** → Lighter main thread
3. **Pass settings via props** → Eliminate 4 duplicate requests

**Impact:** Immediate feel of speed

### Phase 2: Image Optimization (2-3 hours)
4. **Migrate to next/image** → Auto WebP, lazy loading, no CLS

**Impact:** LCP faster, CLS eliminated

### Phase 3: Streaming & Caching (3-4 hours)
5. **Add Suspense boundaries** → Stream non-critical content
6. **Backend caching** → -50-80% response time

**Impact:** TTFB -30-50%

### Phase 4: Font & Build (1 hour)
7. **Self-host font** → No external build dependency

**Impact:** Reliable builds

---

## 🎯 Expected Results

### After V4 Implementation:

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| **TTFB** | ~1.5-2s | < 0.8s | -50% ⚡ |
| **LCP** | ~3-4s | < 2.0s | -40% ⚡ |
| **FID** | ~100-200ms | < 50ms | -50% ⚡ |
| **CLS** | ~0.15 | < 0.05 | Better ✅ |
| **Lighthouse** | ~70-75 | > 85 | +10 ⚡ |
| **Network requests** | ~35-40 | < 25 | -30% ⚡ |
| **Total bundle** | ~420KB | < 350KB | -15% ⚡ |

### Core Web Vitals
**Before:** Mixed (some RED/YELLOW)  
**After:** All GREEN ✅

### User Experience
**Before:** "Website feels slow, waiting for data"  
**After:** "Website is fast and snappy"

---

## 📋 Implementation Order

### Option A: Quick Impact (1 day)
```
Day 1: Quick Wins 1-3 (2-3 hours)
  → -4 duplicate requests
  → Lighter main thread
  → TTFB improvement

Day 2: Image optimization (2-3 hours)
  → LCP/CLS better

Days 3-4: Streaming + caching (3-4 hours)
  → TTFB -30-50%

Day 5: Font + build (1 hour)
  → Build reliability
```

### Option B: Phased Approach
```
Week 1: Phase 1 + 2 (4-6 hours)
  → Quick wins + images

Week 2: Phase 3 (3-4 hours)
  → Streaming + caching

Week 2: Phase 4 (1 hour)
  → Font + build
```

---

## 🚀 Quick Wins First (Do Today!)

**If you only have 2-3 hours, do these:**

### 1. Debounce Search (15 min)
**Current:** User types "hello" → 5 API calls  
**After:** User types "hello" → 1 API call  
**Code:** ~20 lines

### 2. Defer GA & Crisp (30 min)
**Current:** Page load + GA + Crisp scripts load → slow  
**After:** GA loads after 2s, Crisp on first interaction  
**Code:** ~30 lines × 2 files

### 3. Pass Settings via Props (30 min)
**Current:** 4 separate /settings fetches  
**After:** 1 fetch, passed to all children  
**Code:** Update layout.tsx + homepage.tsx

**Result:** Website feels noticeably faster!

---

## 📊 Metrics to Track

### After Each Phase:

**Phase 1:** 
- [ ] Network requests: Reduced by 4
- [ ] TTFB: Slight improvement
- [ ] Search API: -80% calls

**Phase 2:**
- [ ] Lighthouse LCP: Better
- [ ] CLS: Eliminated
- [ ] Bandwidth: -20-30%

**Phase 3:**
- [ ] TTFB: -30-50%
- [ ] Homepage load: Smooth streaming
- [ ] API response time: -50-80%

**Phase 4:**
- [ ] Build time: Consistent
- [ ] No build warnings

---

## 💾 Files Changed (Summary)

### Phase 1
```
Header.tsx (debounce search)
AnalyticsLoader.tsx (defer GA)
CrispChatLoader.tsx (defer Crisp)
layout.tsx (pass settings)
page.tsx (remove settings fetch)
```

### Phase 2
```
next.config.ts (add image patterns)
blog/[slug]/page.tsx (use next/image)
team/page.tsx (use next/image)
TeamSpotlight.tsx (use next/image)
```

### Phase 3
```
page.tsx (add Suspense)
cache.ts [NEW] (memory cache)
routes/*.ts (add caching)
```

### Phase 4
```
layout.tsx (self-host font)
public/fonts/inter/*.woff2 [NEW]
next.config.ts (remove google font)
```

---

## ⏱️ Total Time Investment

| Phase | Time | Effort | Impact |
|-------|------|--------|--------|
| 1: Quick Wins | 2-3h | Low | High ⚡⚡ |
| 2: Images | 2-3h | Low | Medium ⚡ |
| 3: Streaming | 3-4h | Medium | High ⚡⚡ |
| 4: Font | 1h | Low | Low ⚡ |
| **Total** | **8-11h** | **Low** | **Very High** ⚡⚡⚡ |

**Recommendation:** Do Phase 1 today (2-3h), then Phase 2-3 over next 2-3 days.

---

## 🎯 Success = When You See

✅ **Subjective:** "Website loads instantly"  
✅ **Numbers:** Lighthouse > 85 all pages  
✅ **Numbers:** Core Web Vitals all GREEN  
✅ **Numbers:** TTFB < 1s  
✅ **Mobile:** Fast on 4G  
✅ **Search:** No API spam  
✅ **Images:** Smooth, no CLS  

---

## 📚 Documentation

| Doc | Purpose | Length |
|-----|---------|--------|
| **DN-TECH-PRD-V4.md** | Complete requirements | 50 pages |
| **V4-IMPLEMENTATION-GUIDE.md** | Step-by-step code | 40 pages |
| This summary | Quick overview | 5 pages |

---

## 🎓 Learning Path

**5 minutes:** Read this summary  
**30 minutes:** Read PRD V4 sections 1-2  
**1 hour:** Read Implementation Guide Phase 1  
**2-3 hours:** Implement Phase 1  

---

## 🚦 Next Steps

1. **Now:** Read PRD V4 (30 min)
2. **Today:** Implement Phase 1 (2-3 hours)
3. **Tomorrow:** Implement Phase 2 (2-3 hours)
4. **This week:** Implement Phase 3 (3-4 hours)
5. **Deploy:** Test + launch
6. **Monitor:** Track metrics

---

## ❓ FAQ

**Q: Can I skip Phase 1?**  
A: No, Phase 1 quick wins have highest ROI (2h work, big impact).

**Q: What if I only have 2 hours?**  
A: Do Phase 1 only. Immediate -4 requests, lighter main thread.

**Q: Will this break anything?**  
A: No, all changes are backward compatible.

**Q: How much will performance improve?**  
A: TTFB -30-50%, LCP -20-40%, overall -30% page load time.

**Q: Should we do this before V5?**  
A: Yes, V4 is prerequisite for future V5 improvements (CDN, service worker).

---

## 📞 Questions?

- **What to implement?** → Read PRD V4
- **How to implement?** → Read Implementation Guide V4
- **Quick reference?** → Read this summary

---

**Status:** ✅ Ready to implement  
**Timeline:** 2-3 hours (Phase 1 quick wins) OR 1 week (all phases)  
**Impact:** Very high (website will feel 3x faster)  

**Let's ship it! 🚀**

---

**Owner:** Dozer (CEO + Tech Lead)  
**Date:** Juli 2026

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
