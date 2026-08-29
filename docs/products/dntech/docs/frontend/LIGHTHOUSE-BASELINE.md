# Lighthouse Baseline — DN Tech Frontend

> **Author:** Dozer  
> **Date:** 2026-08-29  
> **Source:** `frontend/scripts/lighthouse.mjs` → `docs/frontend/lighthouse/summary.json`

## Targets (mobile, p75)

| Metrik | Target | Status |
|--------|--------|--------|
| LCP | ≤ 2000 ms | ❌ Homepage prod 11401 ms (pre-deploy baseline) |
| INP | ≤ 200 ms | — (lab run, no field INP) |
| CLS | ≤ 0.1 | ✅ 0 on all routes |
| Lighthouse a11y | ≥ 90 | ✅ 96–100 |
| Lighthouse perf | ≥ 85 | ⚠️ Homepage 67 (prod baseline) |

## Production baseline (2026-08-29)

| Route | Perf | A11y | Best | SEO | LCP |
|-------|------|------|------|-----|-----|
| `/` | 67 | 96 | 100 | 100 | 11401 ms |
| `/products/dnpeople` | 81 | 96 | 77 | 100 | 4153 ms |
| `/contact` | 88 | 100 | 100 | 100 | 3563 ms |

Raw JSON: `docs/frontend/lighthouse/*.json`

## Re-run

```bash
cd frontend
npm run lighthouse
# or against local standalone:
LIGHTHOUSE_URL=http://localhost:3000 npm run lighthouse
```

## Notes

- Homepage LCP tinggi di baseline prod — kemungkinan TTFB/API SSR + belum deploy patch frontend P0–P2 ini.
- Setelah deploy, re-run Lighthouse dan update tabel di atas.
- Patch frontend P0–P2 (Header split, FAQ native `<details>`, deferred ExitIntent) belum tercermin di baseline prod di atas.
