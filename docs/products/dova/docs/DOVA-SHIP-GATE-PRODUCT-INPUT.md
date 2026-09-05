# DOVA — Ship Gate: Supplier Product Input

> **Status:** Active · **Date:** 2026-09-03 · **Author:** Dozer  
> **Method:** Zero-hallucination map + ship-gate (audit only, no deploy)  
> **Scope:** Supplier Add / Edit Product (`/supplier` tab **Add Product**) and `POST` / `PUT` `/api/v1/suppliers/products`  
> **Out of scope:** Customer quantity on the product detail page (`products/[id].tsx`) unless that slice is gated separately  
> **Verdict:** **SHIP WITH CAUTION** — no critical auth or SQL issues in this slice

This document records the 2026-09-03 audit. It does not change production. It does not replace the existing security checklist assessment in the same folder.

---

## 01 — End state

An approved supplier can create and update a listing (name, description, price, stock, category, image file or URL) without unauthenticated writes, SQL injection, or path-traversal uploads. Remaining gaps are listed in section 05.

**Done looks like:** those gaps closed, or explicitly accepted, then a restage of Add Product (JPG + rejected URL).

---

## 02 — Stack (this slice)

| Layer | [KNOWN] |
|-------|---------|
| Storefront | Next.js, `apps/frontend/src/pages/supplier.tsx` |
| API client | `apps/frontend/src/lib/api.ts` (Bearer + cookies) |
| API | NestJS, `AppController`, `ProductDto`, `UploadStorageService` |
| DB | PostgreSQL via `pg`, parameterized `INSERT` / `UPDATE` |
| Auth | JWT 15m, `@Roles('supplier')`, approved supplier only |

Not used here: Supabase RLS, LLM APIs.

---

## 03 — Code map

Request path:

- Supplier form (`supplier.tsx`)
- `FormData` `POST` / `PUT` `/suppliers/products`
- `AppController` (`@Roles`, throttle 30/min, `FileInterceptor` 5 MB)
- `applyProductImage` (file save or URL check)
- `AppService.addSupplierProduct` / `updateSupplierProduct`
- `supplierFor` (status must be approved)
- `validateProduct` then `DatabaseService.createSupplierProduct` / `updateSupplierProduct`

| Tag | Fact |
|-----|--------|
| [KNOWN] | Filename on disk is `randomUUID` + mime extension, not `originalname` |
| [KNOWN] | Magic-byte check for JPG / PNG / WEBP in `file-validation.ts` |
| [KNOWN] | `ProductDto`: name/description min length 2, price min 1000 NGN, quantity integer min 1 |
| [INFERRED] | Invalid `categoryId` fails on Postgres FK when DB is on (no in-process category check on the DB path) |
| [UNKNOWN] | Production `UPLOAD_DIR` vs nginx `/uploads/` mapping — not verified on the VPS this pass |

---

## 04 — Ship gate results

Scan date: 2026-09-03. Categories outside this slice are SKIP.

| ID | Result | Severity | Note |
|----|--------|----------|------|
| SEC-02 | PASS | Critical | JWT + supplier role + approved profile (`supplierFor`) |
| SEC-06 | PASS with gaps | High | class-validator on `ProductDto`; no `@MaxLength`, `categoryId` is string not UUID |
| SEC-07 | PASS | High | 30 requests / 60s on create and update |
| SEC-13 | PASS | High | No `eval` / `dangerouslySetInnerHTML` |
| SEC-16 file | PASS | High | Type, 5 MB, UUID path |
| SEC-16 URL | FAIL | High | `assertExternalImageUrl` only allows http/https. Private/link-local hosts are not blocked (SSRF if anything fetches the URL later) |
| SEC-05 | PASS | Critical | Mutations use Authorization Bearer |
| DB-03 | PASS | Critical | `$1` through `$7` placeholders |
| CODE-04 | PASS | High | `submitBusy` and error message on catch |
| CODE-05 | FAIL | High | `GET /suppliers/products` returns the full list |
| FE labels | ADVISORY | — | Labels present; no `htmlFor` / `id`; no client 5 MB check |
| FE stock | ADVISORY | — | Restock uses `window.prompt`; `NaN` is ignored |
| AI-* | SKIP | — | No LLM on this path |
| SEC-01 / 17 / 18 | PASS | Critical | No secrets in the form; `.env` gitignored |

**Verdict:** SHIP WITH CAUTION. Not CLEAR TO SHIP until section 05 items 1–2 are fixed or accepted.

---

## 05 — Must fix or accept before treating as clear

- **Image URL SSRF:** block loopback, link-local, and metadata IPs in `assertExternalImageUrl`, or remove the URL field and accept file upload only. File: `apps/backend/src/file-validation.ts` (approx. lines 62-72).
- **DTO caps:** `@MaxLength` on name and description; `@IsUUID()` on `categoryId`. File: `apps/backend/src/auth.dto.ts` (`ProductDto`).
- **Optional:** reject files over 5 MB in the browser before upload; paginate `GET /suppliers/products`.

---

## 06 — Manual confirmations (not automated)

- [ ] HTTPS on `dova.dntech.id` / `api.dova.dntech.id`
- [ ] Staging: add product with a valid JPG
- [ ] Staging: add product with a private or `javascript:` URL is rejected
- [ ] `UPLOAD_DIR` on the VPS is the same tree nginx serves for `/uploads/products/`
- [ ] `supplier-docs` is not world-readable if that is policy

---

## 07 — Stories (implementation, not done in this audit)

| # | What | Acceptance |
|---|------|------------|
| 1 | Harden `assertExternalImageUrl` | Private IPs rejected in unit tests |
| 2 | Tighten `ProductDto` | Overlong name and non-UUID category return 400 |
| 3 | Client 5 MB check | Oversize file never starts the request |

---

## 08 — Related docs

- `DOVA-SECURITY-CHECKLIST-ASSESSMENT.md`
- `DOVA-BUG-TRIAGE.md`
- `API Documention.md`

*Author: Dozer · 2026-09-03*
