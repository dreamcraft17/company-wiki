# DN Tech — Bug Triage (Relaunch)

> **Author:** Dozer  
> **Date:** 2026-08-29

**Product:** DN Tech company profile (`dntech.id`)  
**Scope:** Full public site + admin CMS + seed content + tests  
**Context:** Website relaunch. Startup has **0 paying clients**. Catalog products in seed DB are first-party (dnPeople, dnCore, dnShop Finance, Nearwork, DVS, Threads Automation) plus **Trusted Jurist** as a real deliverable.  
**Source:** Code review + existing BF-013–BF-020 register + seed scripts + E2E locators. No CI `failures.json`, no Sentry.  
**Destination:** Suggested tickets for **human approval** (do not auto-create/close).  
**Dedup scope:** All-time against `docs/BUG_FIXES.md`.  
**Triage accuracy:** Unmeasured on this pass (no human labels yet). Target >85% after review.

---

## Pipeline notes

Deterministic fingerprints use SHA-256 of `exception_type|message_template|top_frames|test_name` (first 16 hex). Near-duplicates (content-integrity cluster) are **linked**, not auto-merged.

**Cluster A — Fake social proof** (similarity > 0.75): BF-021, BF-022, BF-023, BF-024, BF-032, BF-034. Canonical parent: **BF-021**.  
**Cluster B — Production data/API** (ops): BF-013, residual BF-016–BF-020, BF-025. Canonical: **BF-013**.  
**Cluster C — E2E locators vs Indonesian UI**: BF-026, BF-033. Canonical: **BF-026**.

---

## Summary

| Severity | Count | P0 | P1 | P2 | P3 |
|----------|------:|---:|---:|---:|---:|
| Critical | 1 | 1 | 0 | 0 | 0 |
| Major | 8 | 5 | 3 | 0 | 0 |
| Minor | 6 | 0 | 2 | 4 | 0 |
| Trivial | 1 | 0 | 0 | 0 | 1 |

Every P0/P1 below is assigned to **Dozer** (CEO + Tech Lead; sole owner).

---

## P0 — Blocks relaunch

### [Auth] Default SuperAdmin password in bootstrap seed

**Severity:** Critical  
**Priority:** P0  
**Component:** Authentication  
**Environment:** Production bootstrap (`prisma/seed.ts`)  
**Fingerprint:** `256e21225c4d2b75`  
**Reporter:** auto-triage pipeline  
**Category:** application bug (authorization / security)  
**Confidence:** high

#### Description
Bootstrap seed hashes `ADMIN_PASSWORD` or falls back to `Admin@123456`. QA checklist still flags this as unverified. A public `/admin/login` with a default password is an unauthenticated takeover of the CMS (content, leads, SMTP config).

#### Steps to Reproduce
1. As SuperAdmin bootstrap, `ADMIN_PASSWORD` unset.
2. POST `/api/v1/auth/login` with `admin@dntech.id` / `Admin@123456`.
3. Observe 200 + tokens if production was seeded with the fallback.

#### Expected Behavior
Production refuses to start or seed without a strong `ADMIN_PASSWORD`. Default string is rejected.

#### Actual Behavior
Fallback password is documented and usable.

#### Evidence
- `backend/prisma/seed.ts` line ~13  
- `docs/QA-CHECKLIST-V8.md` Track A: “Admin password changed from default”

#### Frequency
Always, until env is set and password rotated.

#### Suggested Root Cause
Dev convenience leaked into production bootstrap.

#### Related Issues
- QA-CHECKLIST-V8 Track A  
- **Approval:** Create ticket

---

### [Branding] Fake “50+ companies / 50 projects / 30 clients” in seed

**Severity:** Major  
**Priority:** P0 (all visitors; relaunch trust)  
**Component:** Branding / About  
**Fingerprint:** `4e1573d31e1fee2f`  
**Reporter:** auto-triage pipeline  
**Category:** application bug (data handling)  
**Confidence:** high

#### Description
`seed-branding.ts` writes copy that DN Tech has helped **50+ Indonesian companies**, stats **50 proyek selesai**, **30 klien puas**, **5 tahun di industri**. The company has **0 clients** except seed products and Trusted Jurist. Shipping this on relaunch is a trust defect, not a vanity metric.

#### Steps to Reproduce
1. Run `seed-branding`.
2. Open About / branding surfaces that read `BrandContent.story` and `Stat`.
3. Observe inflated claims.

#### Expected Behavior
Copy matches reality: new studio, first-party products, optional one client showcase (Trusted Jurist).

#### Actual Behavior
Enterprise-scale social proof.

#### Evidence
- `backend/scripts/seed-branding.ts` story + stats array  
- User constraint: 0 clients except seed products

#### Suggested Root Cause
Seed written for a future narrative, never gated for launch honesty.

#### Related Issues
Cluster A: BF-022, BF-023, BF-024, BF-032, BF-034  
**Approval:** Create ticket (parent of cluster A)

---

### [Products] dnPeople seed: fictional testimonials + “ratusan perusahaan”

**Severity:** Major  
**Priority:** P0  
**Component:** Product Catalog  
**Fingerprint:** `d16714a7defb33f2`  
**Near-dup:** `1950233c894ed5b4` (description traction copy)  
**Reporter:** auto-triage pipeline  
**Category:** application bug (data handling)  
**Confidence:** high

#### Description
Flagship product page seeds named-role quotes (HR Director / People Manager / CEO) with fabricated companies, plus description “Ratusan perusahaan … sudah pakai dnPeople”. `customerCount` is honestly “Soft launch”, but use-case and testimonial JSON contradict that. Avatars hit missing CDN URLs (`ab6984f14945d616`).

#### Steps to Reproduce
1. Seed dnPeople; open `/products/dnpeople`.
2. Read description, use-case quotes, testimonials block.
3. Observe invented social proof and likely broken avatar images.

#### Expected Behavior
Soft-launch copy: product exists, no fake logos/quotes. Showcase Trusted Jurist only if that client consented.

#### Actual Behavior
SaaS-with-hundreds-of-customers story.

#### Evidence
- `backend/scripts/seed-dnpeople-product.ts` `USE_CASES`, `TESTIMONIALS`, `description`  
- `frontend/src/app/(public)/products/[slug]/page.tsx` renders those JSON fields

#### Suggested Root Cause
Copy deck written as if post-traction; seed not reviewed against 0-client constraint.

#### Related Issues
Parent cluster BF-021  
**Approval:** Create ticket (merge evidence into BF-021 or keep as child)

---

### [Products] Sidebar concatenates “Dipercaya {customerCount} pelanggan”

**Severity:** Major  
**Priority:** P0  
**Component:** Product Catalog  
**Fingerprint:** `141f22afb3c86eee`  
**Reporter:** auto-triage pipeline  
**Category:** application bug (logic error)  
**Confidence:** high

#### Description
Template always prefixes `Dipercaya` and suffixes `pelanggan`. Seed values are statuses (`Soft launch`, `Beta`, `Beta UAT`, `1 client`), so UI reads “Dipercaya Soft launch pelanggan”.

#### Steps to Reproduce
1. Open `/products/dnpeople` (or dnCore, dnShop).
2. Read sticky sidebar under “Tertarik dengan produk ini?”.

#### Expected Behavior
Numeric counts only, or a status badge without “Dipercaya … pelanggan”.

#### Actual Behavior
Broken Indonesian sentence implying customers that do not exist.

#### Evidence
`frontend/src/app/(public)/products/[slug]/page.tsx` ~158

#### Suggested Root Cause
Field used as free-text status; template assumed a number.

#### Related Issues
Cluster A  
**Approval:** Create ticket

---

### [Ops] Production DB push + product seed not verified

**Severity:** Major  
**Priority:** P0  
**Component:** Data Layer / CI-CD  
**Fingerprint:** `d4e363b8f5e5a499`  
**Reporter:** auto-triage pipeline (existing BF-013)  
**Category:** environment issue  
**Confidence:** high

#### Description
Wiki and BUG_FIXES still list production `prisma db push` and `db:seed-products` / `db:seed-dnpeople` as pending. Relaunch without seed means empty `/products` or stale copy.

#### Expected Behavior
VPS has current schema + seven seed products (excluding DOVA, per `seed-all-products.ts`).

#### Actual Behavior
Unverified on VPS.

#### Evidence
- `docs/BUG_FIXES.md` BF-013  
- `company-wiki/docs/products/dntech/00_INDEX.md`

**Approval:** Retry/verify on VPS; do not close until a screenshot of `/products` matches seed.

---

### [Email] SMTP live send not verified

**Severity:** Major  
**Priority:** P0  
**Component:** Email / Leads  
**Fingerprint:** `9884ba9dc25a60a7`  
**Reporter:** auto-triage pipeline (existing BF-014)  
**Category:** environment issue  
**Confidence:** medium (needs inbox proof)

#### Description
North-star for relaunch is inbound leads. Contact uses `POST /leads` (MultiStepForm). If SMTP is skipped or failing, Dozer never sees inquiries.

#### Steps to Reproduce
1. Submit `/contact` golden path.
2. Check `info@dntech.id` and `EmailLog` within 2 minutes.

#### Expected Behavior
Admin notification + optional welcome email, log status `sent`.

#### Actual Behavior
Historically unverified; EmailService can skip in some configs.

#### Evidence
- `docs/BUG_FIXES.md` BF-014  
- `docs/QA-CHECKLIST-V8.md` Track A  
- `backend/src/services/EmailService.ts`

**Approval:** Create ticket; treat as release gate.

---

## P1 — This sprint (relaunch week)

### [Testimonials] Empty page still claims enterprise clients

**Severity:** Major  
**Priority:** P1  
**Component:** Testimonials  
**Fingerprint:** `4b7dfaf3cbdaf9fa`  
**Category:** application bug (usability / copy)  
**Confidence:** high

Meta + H1 body: “klien enterprise … di seluruh Indonesia” even when the list is empty. CTA: “Bergabung dengan klien kami yang puas.” Footer still links here.

**Approval:** Create ticket (cluster A)

---

### [About] Client-side fetch bypasses production API resolver

**Severity:** Major  
**Priority:** P1  
**Component:** About  
**Fingerprint:** `7430e298b7947926`  
**Category:** application bug (integration)  
**Confidence:** medium (depends on `getApiUrl()` in browser)

`AboutPageContent` uses `fetch(getApiUrl('/settings'))` in `useEffect` instead of `fetchPublicApi*` SSR (the BF-016–BF-020 class). About can be empty/wrong on production while other pages work.

**Approval:** Create ticket (cluster B)

---

### [Footer] Primary links omit Produk

**Severity:** Minor  
**Priority:** P1  
**Component:** Shared/Platform  
**Fingerprint:** `ac646150cac03db8`  
**Category:** application bug (usability)

Header has Produk; footer `primaryLinks` skips `/products`. For a 0-client relaunch, products **are** the proof. Missing footer link hides the catalog.

**Approval:** Create ticket

---

### [Homepage] Empty testimonials titled “Apa Kata Klien Kami”

**Severity:** Minor  
**Priority:** P1  
**Component:** Landing/Home  
**Fingerprint:** `f9b3edb4666149ae`  
**Category:** application bug (usability)

Coming-soon card is honest; the heading is not. Prefer “Belum ada testimoni publik” or hide the section until a real quote exists.

**Approval:** Create ticket (cluster A)

---

## P2 / P3

### [E2E] Navigation locator still English `/services/i`

**Severity:** Minor  
**Priority:** P2  
**Component:** Test Infrastructure  
**Fingerprint:** `f06ebc8452056ccc`  
**Category:** test bug (bad selector)  
**Confidence:** high

`navigation.spec.ts` clicks `getByRole('link', { name: /services/i })`. Header label is **Layanan**. Historical canvas: BF-026 (12/12 fail).

**Approval:** Create ticket (cluster C) — fix test, do not change nav to English.

---

### [E2E] Contact spec asserts `textarea[name=message]` on step 0

**Severity:** Minor  
**Priority:** P2  
**Component:** Test Infrastructure  
**Fingerprint:** `060c5e08e896acb2`  
**Category:** test bug (wrong assertion)  
**Confidence:** high

`/contact` mounts `MultiStepForm`. Message field exists only on step 1. Step 0 has name/email only. Spec will fail if Playwright runs against the real contact page.

**Approval:** Create ticket (cluster C)

---

### [Leads] Duplicate ternary always `status: 'new'`

**Severity:** Minor  
**Priority:** P2  
**Component:** API Layer / Leads  
**Fingerprint:** `f69d494c9e93db0b`  
**Category:** application bug (logic error)

`status: isDuplicate ? 'new' : 'new'` in `LeadService.createLead`. Duplicate is only noted in `notes`. Harmless but dead logic; admin cannot filter dupes by status.

**Approval:** Create ticket or dismiss as fill-in

---

### [Design] Decorative star ratings (existing BF-015)

**Severity:** Trivial  
**Priority:** P3  
**Component:** Testimonials  
**Fingerprint:** `23daea217888b110`  
**Category:** application bug (usability)

No review API. For 0-client relaunch, hide ratings entirely.

**Approval:** Dismiss until real reviews exist

---

## Dedup vs existing register

| ID | Status | Action |
|----|--------|--------|
| BF-013 | Open (ops) | Keep; fingerprint `d4e363b8f5e5a499` |
| BF-014 | Open (SMTP) | Keep; fingerprint `9884ba9dc25a60a7` |
| BF-015 | Open (stars) | Keep; P3 |
| BF-016–BF-020 | Fixed in code | Do not reopen unless production still empty |

New IDs BF-021–BF-033 are **suggestions**. Do not auto-close anything.

---

## Suggested GitHub labels (after approval)

`bug`, `severity:*`, `component:*`, `failure-category:*`, `fingerprint:<hash>`, `relaunch`

Assignee for all P0/P1: **Dozer**.

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
