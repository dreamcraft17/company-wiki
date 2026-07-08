# TEST COVERAGE 60%+ — Action Plan
## dnPeople ERP — Folder `update/`

**Tanggal:** 3 Juli 2026 · **Updated:** 7 Juli 2026  
**Status:** ✅ COMPLETE — **≥60%** stmts · **390 tests** · **83 suites** · CI gate enforced  
**Owner:** QA / Backend Lead  

---

## Ringkasan Eksekutif

| Metrik | Saat Ini | Target |
|--------|----------|--------|
| Unit test suites | **83** | 45+ |
| Unit tests | **390** | 250+ |
| Statement coverage | **≥60%** | **≥60%** |
| CI coverage gate | ✅ | ✅ fail if <60% |
| E2E Cypress files | 15+ | 10+ |

**Catatan 7 Jul:** Target dipertahankan setelah Phase 2–4. Spec baru: `industry`, `health.service`, Phase 3 analytics/documents/platform. Fokus berikutnya = **staging E2E on live infra** (ops).

---

## Baseline → Current

```bash
cd backend && npm run test:cov

# 3 Jul baseline: ~28.6% Stmts | 22 suites · 112 tests
# 5 Jul:          60.08% Stmts | 68 suites · 355 tests
# 7 Jul (now):    ≥60% Stmts   | 83 suites · 390 tests · all green
```

---

## Status: ✅ CLOSED

Coverage gate enforced in CI. No further coding required unless new modules added without specs.

**Next (ops):** Run `npm run test:cov` against staging after AWS deploy to validate CI parity on live RDS.

---

**Last Updated:** 7 Juli 2026
