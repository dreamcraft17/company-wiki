# DOVA API — Integrator Guide

> **Status:** Active · **Last updated:** 2026-09-06 · **Author:** Dozer  
> **Audience:** official integrators (storefront BFF, issued partner keys)  
> **Version:** `v1` (contract 1.1.0 — integration key required)

This is the **private** HTTP contract. Import [OpenAPI](https://api.dova.dntech.id/api/v1/openapi.json) only with `X-Api-Key`. Storefront: [dova.dntech.id](https://dova.dntech.id) (browser talks to `/api/gateway`, not the API host).

## 01 — Base URL

Every JSON endpoint is under **`/api/v1`**.

| Environment | Base |
|-------------|------|
| Production | `https://api.dova.dntech.id/api/v1` |
| Local | `http://localhost:3000/api/v1` |

Discover the API (requires `X-Api-Key` except `/health`):

```http
GET /api/v1
```

```json
{
  "service": "dova-api",
  "version": "v1",
  "health": "/api/v1/health",
  "openapi": "/api/v1/openapi.json"
}
```

Product images are **not** under `/api/v1`. Use the `imageUrl` returned on a product (often `{host}/uploads/...`).

---

## 02 — What you can integrate

| You are | Typical flow |
|---------|----------------|
| **Official storefront** | Next.js `/api/gateway` adds the storefront integration key. Customers then use JWT for cart/checkout. |
| **Issued partner (e.g. Botpress)** | Same REST host with a **separate** `X-Api-Key` Dozer issues. Then JWT for that customer. |
| **Anonymous internet** | `401` on catalog, OpenAPI, auth, contact. `GET /health` and Paystack webhook only. |

Every JSON call except **GET `/health`** and **POST `/payments/webhook`** must send:

```
X-Api-Key: <issued secret>
```

Customer, supplier, and admin still use **JWT** (`Authorization: Bearer`) **in addition** to the integration key. Keys live in `DOVA_INTEGRATION_KEYS` (`name:secret,...`). Never put a key in `NEXT_PUBLIC_*`.

---

## 03 — Authentication

1. Send `X-Api-Key` (official client).
2. `POST /api/v1/auth/login` (or register).
3. Read `accessToken` from the JSON body.
4. Send both headers on private customer routes:

```
Authorization: Bearer <accessToken>
```

Access tokens last **15 minutes**. Refresh with `POST /api/v1/auth/refresh` and body `{ "refreshToken": "..." }` (or the `refreshToken` cookie). Prefer Bearer over cookies when your app is not on `dova.dntech.id`.

**Roles**

| Role | Can call (still need `X-Api-Key`) |
|------|----------|
| *(JWT none)* | Auth register/login/OTP, catalog, OpenAPI, contact, feedback reads — **with integration key** |
| Infra | `GET /health` (no key). Paystack `POST /payments/webhook` (HMAC, no key) |
| `customer` | Cart, orders, payments initialize/verify, profile |
| `supplier` | Own products and supplier orders (account must be **approved**) |
| `admin` | `/api/v1/admin/*` |

Missing integration key or JWT → **401**. Wrong role → **403**.

### Register a customer

```http
POST /api/v1/auth/send-registration-code
Content-Type: application/json

{ "email": "ada@company.com", "fullName": "Ada Okonkwo" }
```

A 6-digit code is emailed. (On localhost without Resend, the API process logs `[Reg OTP] email: 123456`.)

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Ada Okonkwo",
  "email": "ada@company.com",
  "password": "password123",
  "confirmPassword": "password123",
  "code": "123456",
  "rememberMe": true
}
```

Response includes `user`, `accessToken`, `refreshToken`, and `message`. Passwords are never returned.

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "ada@company.com", "password": "password123" }
```

---

## 04 — Errors

JSON (Nest):

```json
{ "statusCode": 400, "message": "Invalid verification code", "error": "Bad Request" }
```

| HTTP | Meaning |
|------|---------|
| 400 | Bad body, OTP, min order, payment amount mismatch |
| 401 | Not logged in or bad Paystack webhook signature |
| 403 | Authenticated but wrong role |
| 404 | Product / order / payment not found |
| 429 | Rate limited |

**Money:** request/response amounts are **naira** (NGN). Paystack charges in **kobo** (×100) on their side.

**Minimum order:** pickup **₦3,000**, delivery **₦5,000**. Below that, create-order returns **400**.

### Rate limits (per IP, 60s window)

| Limit | Endpoints |
|-------|-----------|
| 10 | login, register, send-registration-code, verify-otp, reset-password |
| 5 | resend-otp, forgot-password |
| 20 | refresh |
| 10 | supplier register |
| 100 | most other routes |
| none | `POST /api/v1/payments/webhook` |

---

## 05 — Catalog (no auth)

```http
GET /api/v1/health
GET /api/v1/categories
GET /api/v1/products?search=&categoryId=&page=1&limit=20
GET /api/v1/products/{id}
```

`GET /products` response:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Fresh Tomatoes",
      "description": "...",
      "price": 25000,
      "stockQuantity": 10,
      "categoryId": "uuid",
      "categoryName": "Vegetables",
      "supplierName": "…",
      "imageUrl": "https://api.dova.dntech.id/uploads/…",
      "isActive": true
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 40 }
}
```

---

## 06 — Customer checkout

All of these need `Authorization: Bearer`.

| Method | Path | Body |
|--------|------|------|
| GET | `/api/v1/cart` | — |
| POST | `/api/v1/cart/add` | `productId`, `quantity` (1 or more), `deliverySlot`: morning or evening |
| PUT | `/api/v1/cart/items/{id}` | optional `quantity`, `deliverySlot` |
| DELETE | `/api/v1/cart/items/{id}` | — |
| POST | `/api/v1/orders` | `deliveryName`, `deliveryPhone`; optional `fulfillmentType` (pickup or delivery), `deliveryAddress` |
| GET | `/api/v1/orders` | — |
| GET | `/api/v1/orders/{id}` | — |
| POST | `/api/v1/payments/initialize` | `orderId`, `amount` (must equal order total) |
| GET | `/api/v1/payments/verify?reference=` | — |

Initialize response:

```json
{
  "authorization_url": "https://checkout.paystack.com/…",
  "reference": "DOVA-…",
  "mode": "paystack"
}
```

`mode` is `paystack`, `paystack_test`, or `mock` (no secret key on the server). Send the user to `authorization_url`, then call verify.

`POST /api/v1/payments/webhook` is for **Paystack**, not for your app. Do not call it from a client.

Profile: `GET/PATCH /api/v1/auth/me`, `POST /api/v1/auth/change-password`.

---

## 07 — Other routes (same API)

| Area | Prefix | Auth |
|------|--------|------|
| Contact form | `POST /api/v1/contact` | Public |
| Supplier apply | `POST /api/v1/suppliers/register` (multipart, file field `verificationDocs`) | Public |
| Supplier ops | `/api/v1/suppliers/products`, `/orders` | `supplier` |
| Admin | `/api/v1/admin/...` | `admin` |
| Feedback board | `/api/v1/feedback/...` | Mix of public and JWT |

---

## 08 — Copy-paste

```bash
BASE=https://api.dova.dntech.id/api/v1

curl -sf "$BASE/" 
curl -sf "$BASE/health"
curl -sf "$BASE/products?limit=5"

# After login, export ACCESS_TOKEN from the JSON
curl -sf "$BASE/auth/me" -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 09 — Support

- Production health: `GET https://api.dova.dntech.id/api/v1/health`  
- OpenAPI: `GET https://api.dova.dntech.id/api/v1/openapi.json`  
- QA Postman list (internal): [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md)

*Author: Dozer · 2026-09-01*
