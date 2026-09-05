# DOVA — AI Backend Requirements (CTO Response)

> **Status:** Draft · **Date:** 2026-09-03 · **Author:** Dozer  
> **Source:** `DOVA_AI_Backend_Requirements-1 (1).docx` (owner: Egegieh Onyekachi Daniel / DOVA Chain)  
> **Audience:** Botpress / DOVA AI build; marketplace engineering

This fills the “LEAVE FOR BACKEND DEVELOPER” blanks in the intake form. It does **not** claim a DOVA AI backend exists today.

---

## 01 — What the Word file is asking for

DOVA **AI** is a **new Botpress chatbot**. The form is correct that there is **no** DOVA AI API, database, or Botpress BFF in production.

The intended path:

Customer → DOVA AI chatbot → Botpress → **new** DOVA AI backend → DOVA Chain and other services.

Checkboxes in sections 22–34 of the form are internally inconsistent (some “required” boxes left blank). Treat the **narrative** and the **checked** commerce/privacy items as the intent, not the blank boxes.

---

## 02 — Existing vs new (mandatory distinction)

| Bucket | What it is |
|--------|------------|
| **Existing (DOVA Chain marketplace)** | Storefront + REST API live at [dova.dntech.id](https://dova.dntech.id) and `https://api.dova.dntech.id/api/v1`. NestJS, PostgreSQL, JWT, Paystack. Docs: [API Documention.md](./API%20Documention.md), OpenAPI `GET /api/v1/openapi.json` (OpenAPI **3.0.3**, not 3.1). |
| **New (must be built for DOVA AI)** | Botpress-facing backend: conversations, messages, AI memory, chat file attachments, Botpress webhooks, WhatsApp channel glue, AI-side support tickets if they are not the marketplace `POST /contact` form. |
| **Third-party** | Paystack (already on marketplace). WhatsApp / Meta / SMS / courier: **not** wired in the marketplace repo. |
| **Required integration** | Chatbot must call **DOVA Chain** for catalog, cart, checkout, orders, payment **verify**. Do not invent a second catalog or a second Paystack “success” flag.

Do **not** replace Botpress with another chatbot platform. Do **not** assume the marketplace Nest app is already a Botpress backend.

---

## 03 — Technical preferences (developer choice)

| Topic | Decision for this stack |
|-------|-------------------------|
| Marketplace API | Keep NestJS + PostgreSQL. Botpress consumes it over HTTPS + JWT. |
| DOVA AI backend | Separate service (recommended). Same Postgres *cluster* is allowed; **separate schemas/tables** for conversations/memory. Do not mix chat rows into marketplace `orders` without a written design. |
| Auth for chatbot users | Prefer **the existing marketplace JWT** after the user logs in (email + password already live). Phone OTP, Google, and Apple are **not** in the marketplace today. |
| Hosting | Same VPS pattern as marketplace unless Botpress Cloud needs only outbound HTTPS. |
| Secrets | Env vars on the server. Never put keys in the Word file or git. |

---

## 04 — Domain and API base URLs (existing)

| Environment | Storefront | API |
|-------------|------------|-----|
| Production | `https://dova.dntech.id` | `https://api.dova.dntech.id/api/v1` |
| Local | `http://localhost:3001` (typical FE) | `http://localhost:3000/api/v1` |
| Staging | TBD (not a second documented public host in the integrator guide) | TBD |

SSL on production marketplace is already in use. Botpress and any new AI API still need HTTPS.

Discovery:

- `GET /api/v1`
- `GET /api/v1/health`
- `GET /api/v1/openapi.json`

---

## 05 — Botpress

| Field | Status |
|-------|--------|
| Workspace / bot name | Dova Chain (from the form) |
| Bot ID, Botpress env, Botpress API key | **Unknown** — owner must paste from Botpress Cloud |
| Integrations | Developer chooses; commerce should go through the **marketplace** REST API, not a parallel product DB |

---

## 06 — Auth: form vs marketplace

| Form asks | Marketplace today |
|-----------|------------------|
| Email + password | Yes (`POST /auth/login`, register + email OTP) |
| Phone + OTP | **No** |
| Google / Apple login | **No** |
| Email verification | Registration uses email OTP |
| Phone verification | Not required in form; **not implemented** |
| Refresh token | Yes (`POST /auth/refresh`, 15-minute access token) |
| Logout | Yes |
| Password reset | Yes (`forgot-password` / `reset-password`) |
| Account deletion | **Not** a documented customer endpoint |
| Customer addresses table | Delivery address is on **order**, not a saved address book API |
| Preferences store | **No** dedicated preferences API |

**Privacy (form §12):** marketplace already scopes cart/orders to the JWT user, not a client-supplied user id. Conversation/memory APIs, when built, must do the same.

---

## 07 — Commerce the chatbot should call (existing)

Integrator detail: [API Documention.md](./API%20Documention.md).

| Need | Existing |
|-------|----------|
| Product search / list / detail / categories / price / stock / images | `GET /categories`, `GET /products`, `GET /products/:id` |
| Cart view / add / update / remove | `GET /cart`, `POST /cart/add`, `PUT /cart/items/:id`, `DELETE /cart/items/:id` |
| Checkout / create order | `POST /orders` (min basket: pickup N3,000 / delivery N5,000) |
| Order list / detail | `GET /orders`, `GET /orders/:id` |
| Payment init / verify / webhook | `POST /payments/initialize`, `GET` or `POST /payments/verify`, `POST /payments/webhook` |
| Delivery courier API, ETA, rider, refunds | **Not** in marketplace. Fulfillment is `pickup` vs `delivery` plus supplier order status (`processing` / `shipped` / `delivered`). |
| Cancel order | Not a first-class customer cancel API in the integrator guide |

**Hard rule from the form:** the chatbot must **never** mark payment successful on its own. Use Paystack verify / webhook, same as the storefront.

---

## 08 — Gaps the form treats as in-scope for DOVA AI

These are **new** unless a later ADR says Botpress Cloud storage is enough:

- Conversations CRUD, rename, archive, search history, clear context, stream message
- AI memory CRUD + categories + link to user/conversation
- Chat file/image attach (marketplace upload is **supplier product images**, not chat)
- WhatsApp receive/send/verify/status/account linking
- Notifications: email + SMS + WhatsApp for registration, OTP, order, payment, delivery, support
- Support tickets inside the chatbot (marketplace has `POST /contact` + admin feedback, not a ticket thread API)
- Admin: usage stats, integration monitoring, audit logs for the **AI** layer
- OpenAPI **3.1** for the **new** AI API (marketplace is 3.0.3)
- Postman collection for the **AI** API (QA list exists for marketplace: [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md))

---

## 09 — Recommended architecture

```
Customer
  -> Botpress (DOVA AI)
       -> DOVA AI backend (new: sessions, memory, WhatsApp, Botpress webhooks)
            -> DOVA Chain API (existing JWT commerce)
                 -> PostgreSQL (marketplace)
                 -> Paystack
```

Do not put Botpress on a path that writes `orders.paid` without Paystack. Do not duplicate product rows for the chatbot.

---

## 10 — Questions before building (form §35)

1. Is Botpress Cloud or self-hosted? Paste Bot ID and API base.
2. Must WhatsApp ship in v1, or after web chat works?
3. Are Google / Apple / phone OTP **must-have** for chatbot launch, or email JWT is enough?
4. Courier name and API for delivery tracking (form says owner already chose; name missing).
5. Refunds: Paystack dashboard only, or chatbot-triggered?
6. Who owns PII in chat transcripts: DOVA Chain, Botpress Cloud, or both (retention days)?
7. One customer account shared by storefront and chatbot, or a separate AI identity?
8. Admin dashboard for AI: reuse marketplace `/admin`, or a new surface?
9. Who pays Botpress, Meta WhatsApp, and SMS?
10. Staging URL for Botpress + AI API (none documented today).

---

## 11 — Related docs

- [API Documention.md](./API%20Documention.md)
- [DOVA-SHIP-GATE-PRODUCT-INPUT.md](./DOVA-SHIP-GATE-PRODUCT-INPUT.md)
- Source Word file: workspace `DOVA_AI_Backend_Requirements-1 (1).docx`

*Author: Dozer · 2026-09-03*
