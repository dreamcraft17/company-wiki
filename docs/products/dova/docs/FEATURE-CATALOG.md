# DOVA — Feature Catalog

**UpdatedAt:** August 26, 2026  
**Release:** v0.5.0 (HEAD `00c8601`) · staging live  
**Spec:** Aggressive 4W PRD/SRS/SDD  

## How to read

| Status | Meaning |
|--------|---------|
| **Available** | In codebase (UI + API). Deployed on staging or ready to deploy. |
| **Conditional** | Wired but needs keys / ops acceptance / business sign-off. |
| **Out of MVP** | Not in current product scope — do not promise. |

## Commerce

| Feature | Status | Notes |
|---------|--------|-------|
| Catalog browse / search / detail | Available | ₦ pricing · litres for liquid categories |
| Cart | Available | Per-item delivery slot (morning/evening) · qty cap |
| Checkout pickup / delivery | Available | Min ₦3k / ₦5k · modal login for guests |
| Paystack initialize / verify / webhook | Conditional | Mock without keys; live keys on VPS |
| Order history / profile / re-order | Available | `/customer/history`, `/customer/profile` |
| Complete payment (pending orders) | Available | v0.4.0 |

## Auth

| Feature | Status | Notes |
|---------|--------|-------|
| Customer / supplier register + login | Available | |
| Remember Me | Available | localStorage + extended refresh TTL (v0.5.0) |
| Cross-origin Bearer + cookies | Available | Staging subdomains |
| Email OTP verification | Out of MVP | Migration + UI scaffolded; **disabled** (v0.5.0) |
| Password reset | Out of MVP | |

## Supplier

| Feature | Status | Notes |
|---------|--------|-------|
| Registration + CAC / gov ID / address docs | Available | Pending until admin approve |
| Product CRUD + image upload | Available | JPG/PNG/WEBP ≤5 MB |
| Product hide/restore tabs | Available | v0.4.0 |
| Stock adjust | Available | Decreases on purchase |
| Order fulfillment statuses | Available | |

## Admin

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard stats | Available | |
| Supplier approve / reject | Available | Postgres fix v0.5.0 (`00c8601`) |
| Users — list + **full management** | Available | View/edit/role/reset password/active toggle (v0.5.0) |
| Products — Available / Low Stock / Hidden tabs | Available | v0.4.0 |
| Orders | Available | |
| Contacts inbox | Available | From public contact form |
| Feedback moderation | Available | Native board |

## Public / brand

| Feature | Status | Notes |
|---------|--------|-------|
| Home (Startup hero) | Available | |
| About / Contact / Footer | Available | Contact persisted |
| Mobile hamburger + responsive | Available | |
| Native feedback / roadmap / changelog | Available | `/feedback` — replaces FeedLog (v0.4.0) |

## Out of MVP

Password reset, enforced email verification, reviews API, wishlist, discounts, courier tracking, full E2E Playwright suite, live monitoring.
