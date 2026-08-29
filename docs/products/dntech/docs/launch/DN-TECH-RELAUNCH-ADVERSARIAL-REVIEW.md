# Adversarial Review: DN Tech Relaunch (Pre-Fix)

> **Status:** Active · **Last updated:** 2026-08-29 · **Author:** Dozer  
> **Scope:** Relaunch blockers — seed data, product template, auth bootstrap, About fetch, footer nav, E2E specs  
> **Source:** Full-file read + [bug triage](../qa/DN-TECH-BUG-TRIAGE-2026-08-29.md) cross-check  
> **Verdict:** **BLOCK** — do not announce relaunch until P0 resolved

---

## Scope

| Area | Files / surfaces |
|------|------------------|
| Trust / copy | `backend/scripts/seed-branding.ts`, `seed-dnpeople-product.ts`, `HomeTestimonials.tsx`, `testimonials/page.tsx` |
| Product UI | `frontend/src/app/(public)/products/[slug]/page.tsx` |
| Security | `backend/prisma/seed.ts`, `backend/.env.example` |
| Leads | `backend/src/services/LeadService.ts` |
| Integration | `frontend/src/components/content/AboutPageContent.tsx` |
| Nav | `frontend/src/components/common/Footer.tsx` |
| Tests | E2E navigation + contact specs (locator drift) |

**Change type:** Pre-fix audit (not a PR diff). Findings map to suggested tickets BF-021–BF-033.

---

## Critical findings

### C1 — Default SuperAdmin password in production bootstrap

**Personas:** Saboteur + Security Auditor (promoted from WARNING)

`backend/prisma/seed.ts` hashes `process.env.ADMIN_PASSWORD || 'Admin@123456'`. Public `/admin/login` + documented default = full CMS takeover (content, leads, SMTP config, user records).

**Fix:** Refuse seed when `ADMIN_PASSWORD` missing/weak; rotate prod credential; remove default from `.env.example` comment as “use this in prod”.

---

### C2 — Seed ships enterprise-scale social proof with 0 clients

**Personas:** Saboteur + New Hire + Security Auditor (promoted — trust breach)

`seed-branding.ts` story claims **50+ perusahaan**; stats **50 proyek**, **30 klien puas**, **5 tahun**. dnPeople seed adds fictional HR/CEO quotes and “ratusan perusahaan” copy while `customerCount` says “Soft launch”. Relaunch with this live = one screenshot destroys credibility.

**Fix:** Rewrite seeds to 0-client honest narrative; strip or empty `TESTIMONIALS` until real quotes; align `customerCount` with sidebar template.

---

## Warnings

### W1 — Product sidebar template breaks on status strings

**Persona:** Saboteur

```158:159:frontend/src/app/(public)/products/[slug]/page.tsx
                  {product.customerCount ? `Dipercaya ${product.customerCount} pelanggan. ` : ''}
```

Seed values are statuses (`Soft launch`, `Beta`, `1 client`) → UI reads **“Dipercaya Soft launch pelanggan”**. Implies customers that do not exist.

**Fix:** Numeric count only, or separate `launchStatus` badge — never concatenate free text into “Dipercaya … pelanggan”.

---

### W2 — About page uses client-side `getApiUrl` fetch

**Persona:** Saboteur + New Hire (promoted)

`AboutPageContent.tsx` fetches `/settings` and `/team` in `useEffect` via `getApiUrl()`. Rest of public site migrated to SSR `fetchPublicApi*` (BF-016–020 fix class). About can be empty/wrong in production while homepage works — classic split-brain.

**Fix:** Server component wrapper + `fetchPublicApiSafe` pattern used elsewhere.

---

### W3 — Footer hides product catalog

**Persona:** New Hire

Header exposes **Produk**; `Footer.tsx` `primaryLinks` has Beranda, Layanan, Tentang, Blog, Kontak — **no `/products`**. For 0-client relaunch, products **are** the proof. Secondary links still surface empty `/case-studies`, `/careers`.

**Fix:** Add `/products` to primary; demote or unlist empty social-proof routes.

---

### W4 — Testimonials pages lie when empty

**Persona:** New Hire + Security Auditor (promoted — reputational)

- `testimonials/page.tsx` meta: “klien enterprise … di seluruh Indonesia”
- `HomeTestimonials.tsx`: heading **“Apa Kata Klien Kami”** even with coming-soon empty state

Honest empty state under dishonest heading is worse than hiding the section.

**Fix:** Hide section until ≥1 consented quote; or heading **“Belum ada testimoni publik”**.

---

### W5 — Lead duplicate status dead logic

**Persona:** Saboteur

`LeadService.ts`: `status: isDuplicate ? 'new' : 'new'`. Duplicates only noted in `notes`; admin cannot filter. Low severity alone but signals untested duplicate path.

**Fix:** Use `'duplicate'` status or drop ternary.

---

### W6 — E2E specs drift from Indonesian UI

**Persona:** New Hire

Navigation spec expects English `/services/i`; header label is **Layanan**. Contact spec asserts `textarea[name=message]` on step 0; `MultiStepForm` shows message on step 1. CI green on unit tests masks broken E2E — false confidence before relaunch.

**Fix:** Update locators; run Playwright against staging before announce.

---

### W7 — Production seed unverified (ops)

**Persona:** Saboteur

Wiki + `BUG_FIXES.md` BF-013: VPS `db push` + product seed pending. Announcing relaunch → visitors hit empty `/products` or stale schema.

**Fix:** Verify with screenshot; gate launch on evidence.

---

### W8 — SMTP path unverified (ops)

**Persona:** Saboteur

North star = inbound leads. BF-014 open. `EmailService` may skip send depending on config. Contact form succeeds in UI while founder never sees inquiry.

**Fix:** End-to-end test to `info@dntech.id` + check `EmailLog`.

---

## Notes

### N1 — `GlobalLoadingIndicator` uses `backdrop-blur-[2px]`

**Persona:** New Hire

Violates V2.1 “no glass” mandat in one overlay. Low visual impact; fix when touching loading UX.

### N2 — Inter font stack

**Persona:** New Hire

`globals.css` uses Inter — acceptable for DN Tech brand; not slop if consistent. No change required for relaunch.

### N3 — No automated triage pipeline in CI

**Persona:** Security Auditor

Bug triage doc references fingerprints but no `failures.json`/Sentry feed. Future regressions won’t auto-surface.

---

## Persona summaries

| Persona | Top fear | Key finding |
|---------|----------|-------------|
| **Saboteur** | CMS takeover + empty prod | Default password + unverified seed/SMTP |
| **New Hire** | “Which pages are real?” | Footer/nav inconsistency; About fetch pattern unlike rest of app |
| **Security Auditor** | Trust + auth | Fake social proof + public admin defaults |

---

## Verdict: BLOCK

**1 CRITICAL (auth)** + **1 CRITICAL-equivalent (trust seed)** + **6+ warnings** that are P0/P1 in triage doc.

**Single most important fix:** Rotate admin password **and** rewrite seed copy before any public announcement. Technical fixes without honest copy still fail the relaunch hypothesis.

**Merge guidance:** Do not tag `relaunch-*` or post LinkedIn until adversarial review re-run shows CLEAN or CONCERNS-only after fixes.

---

*Property of DN Tech — PT. Dozer Napitupulu Technology · 2026*
