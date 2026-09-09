# DOVA — Integration API QA pack

> **Author:** Dozer  
> **Date:** 2026-09-09  
> **Audience:** QA (manual API + storefront)  
> **Build under test:** app `21eb77d` or later (`@RequireIntegration` on catalog only)  
> **Contract:** [API Documention.md](./API%20Documention.md) · [DOVA-INTEGRATION-GUIDE.md](./DOVA-INTEGRATION-GUIDE.md)

Handoff this file to QA. Do **not** paste real partner secrets into tickets or screenshots. Use a QA-only `X-Api-Key` from ops.

---

## Gate (read before testing)

| Check | If fail |
|-------|---------|
| Backend is **`21eb77d`+** | Login toast `Integration is not configured` = **old build**. Stop catalog-lock tests; still log the bug. |
| `DOVA_INTEGRATION_KEYS` **set** on API | Catalog `curl` without key still **200** = lock not active (env empty). Mark **blocked**, not pass. |
| `FRONTEND_URL` / `CORS_ORIGINS` includes the storefront origin | Browser catalog 401 while curl-with-key 200 = Origin mismatch. |

**Base**

| Env | API | Storefront |
|-----|-----|------------|
| Production | `https://api.dova.dntech.id/api/v1` | `https://dova.dntech.id` |
| Local | `http://localhost:3000/api/v1` | Next port from `apps/frontend` (`next dev -p 3005` unless changed). `FRONTEND_URL` must match. |

**Accounts** (seed): admin `admin@dova.local` / `admin1234` · supplier `supplier@dova.local` / `supplier1234` · customer = register on storefront.

**Postman variables:** `baseUrl`, `partnerKey` (QA secret), `accessToken`. Collection header `X-Api-Key` = `{{partnerKey}}` **only** on catalog/OpenAPI requests — not on login/cart.

---

## INT-A — Storefront (browser). Must not need `X-Api-Key`

| ID | Steps | Expected | P | Result |
|----|-------|----------|---|---------|
| INT-A1 | Open storefront home / products (logged out) | Product list loads. No toast `Integration is not configured` / `Valid X-Api-Key required` | P0 | |
| INT-A2 | Login customer (or register + login). Wrong password once | Error is credentials, **not** integration | P0 | |
| INT-A3 | Login `admin@dova.local` | Session. No integration toast | P0 | |
| INT-A4 | Login `supplier@dova.local` | Session. Supplier product list/create works (CRUD) | P0 | |
| INT-A5 | Customer: add to cart, change qty, remove line | Cart updates. No 401 `INTEGRATION_REQUIRED` | P0 | |
| INT-A6 | Customer: place order path as far as test env allows (mock/Paystack test) | No integration error on cart/order/payment init | P1 | |
| INT-A7 | DevTools → Network: login + cart requests | No `X-Api-Key` on those calls (Origin is enough for catalog) | P1 | |

**Fail INT-A** = ship blocker for marketplace.

---

## INT-B — External catalog (curl / Postman, no browser Origin)

Set `BASE` and `KEY` (QA partner secret). Do **not** send `Origin: https://dova.dntech.id` unless the case says so (that would fake the storefront).

```bash
BASE=https://api.dova.dntech.id/api/v1   # or local
KEY='<qa-partner-secret>'                 # from ops, not from git
```

| ID | Command / request | Expected | P | Result |
|----|-------------------|----------|---|---------|
| INT-B1 | `GET $BASE/health` no headers | **200** `{ "status": "ok", "service": "dova-api" }` | P0 | |
| INT-B2 | `GET $BASE/` no key | **200** index JSON (`service`, `openapi`) | P1 | |
| INT-B3 | `GET $BASE/products?limit=1` **no** `X-Api-Key` | **401** body `code`: `INTEGRATION_REQUIRED` (message `Valid X-Api-Key required`) | P0 | |
| INT-B4 | `GET $BASE/categories` no key | **401** `INTEGRATION_REQUIRED` | P0 | |
| INT-B5 | `GET $BASE/openapi.json` no key | **401** `INTEGRATION_REQUIRED` | P0 | |
| INT-B6 | `GET $BASE/products?limit=1` header `X-Api-Key: $KEY` | **200** `{ data, pagination }` | P0 | |
| INT-B7 | `GET $BASE/products/{id}` with valid id from B6 + key | **200** product | P0 | |
| INT-B8 | Same as B6 with **wrong** key | **401** `INTEGRATION_REQUIRED` | P0 | |
| INT-B9 | `GET $BASE/products?limit=1` header `Origin: https://dova.dntech.id` (no key) | **200** if production `FRONTEND_URL` includes that origin | P1 | |
| INT-B10 | `GET $BASE/products?limit=1` header `Origin: https://evil.example` (no key) | **401** | P1 | |

Copy-paste B3 / B6:

```bash
curl -sS -w "\nHTTP %{http_code}\n" "$BASE/products?limit=1"

curl -sS -w "\nHTTP %{http_code}\n" -H "X-Api-Key: $KEY" "$BASE/products?limit=1"
```

---

## INT-C — Auth & cart via API (partner does not need key)

| ID | Steps | Expected | P | Result |
|----|-------|----------|---|---------|
| INT-C1 | `POST $BASE/auth/login` JSON `{"email":"x@y.z","password":"nope"}` **no** `X-Api-Key` | **401** invalid credentials (or validation). Response **must not** be `Integration is not configured` | P0 | |
| INT-C2 | `POST $BASE/auth/login` demo supplier, **no** key | **200** + `accessToken` | P0 | |
| INT-C3 | `GET $BASE/auth/me` with Bearer from C2, **no** key | **200** user | P0 | |
| INT-C4 | `GET $BASE/cart` with **customer** Bearer, **no** key | **200** cart (empty ok). Not `INTEGRATION_REQUIRED` | P0 | |
| INT-C5 | `GET $BASE/suppliers/products` with **supplier** Bearer, **no** key | **200** list | P0 | |
| INT-C6 | `GET $BASE/cart` no Bearer | **401** (JWT), not integration | P1 | |
| INT-C7 | `POST $BASE/cart/add` with **admin** Bearer | **403** (not customer). Not integration | P1 | |

Login sample:

```bash
curl -sS -w "\nHTTP %{http_code}\n" \
  -H "Content-Type: application/json" \
  -d '{"email":"supplier@dova.local","password":"supplier1234","rememberMe":false}' \
  "$BASE/auth/login"
```

---

## INT-D — Negative / regression

| ID | Steps | Expected | P | Result |
|----|-------|----------|---|---------|
| INT-D1 | Storefront login after deploy | Never toast `Integration is not configured` | P0 | |
| INT-D2 | `POST $BASE/payments/webhook` without Paystack HMAC (no API key) | **401** signature, not `INTEGRATION_REQUIRED` | P1 | |
| INT-D3 | Contact `POST $BASE/contact` no key | **200/201** or validation **400** — not integration | P2 | |

---

## Pass / fail

**Pass release for this feature** if: all **P0** in INT-A, INT-B (B1–B8), INT-C (C1–C5) pass **and** the gate table is green (`21eb77d`+ and keys set).

**Blocked:** B3 returns **200** → env lock off; report as blocked, do not mark B3 pass.

Log bugs with: env (prod/local), request (method + path + which headers), status, JSON `code` / `message`, screenshot for INT-A.

Related: [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md) (full route list; catalog rows now need partner key or storefront Origin).

*Author: Dozer · 2026-09-09*
