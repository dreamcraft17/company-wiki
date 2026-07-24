# DOVA — Feature Catalog

**UpdatedAt:** July 24, 2026  
**Snapshot:** MVP codebase 100% complete · ops launch Conditional  
**Spec:** Aggressive 4W PRD/SRS/SDD  

## How to read

| Status | Meaning |
|--------|---------|
| **Available** | In codebase (UI + API). Needs deploy/UAT for customer use. |
| **Conditional** | Wired but needs keys / staging / ops acceptance. |
| **Out of MVP** | Not in current product scope — do not promise. |

## Commerce

| Feature | Status | Notes |
|---------|--------|-------|
| Catalog browse / search / detail | Available | ₦ pricing |
| Cart | Available | Mobile-first |
| Checkout pickup / delivery | Available | Min ₦3k / ₦5k |
| Paystack initialize / verify / webhook | Conditional | Mock without keys |
| Order history | Available | |

## Supplier

| Feature | Status | Notes |
|---------|--------|-------|
| Registration + CAC / gov ID / address docs | Available | Pending until admin approve |
| Product CRUD + image upload | Available | JPG/PNG/WEBP ≤5 MB |
| Stock adjust | Available | Decreases on purchase |
| Order fulfillment statuses | Available | |

## Admin

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard stats | Available | |
| Supplier approve / reject | Available | Email if Resend set |
| Users / products / orders | Available | |
| Contacts inbox | Available | From public contact form |

## Public / brand

| Feature | Status | Notes |
|---------|--------|-------|
| Home (Startup hero) | Available | |
| About / Contact / Footer | Available | Contact persisted |
| Mobile hamburger | Available | |

## Out of MVP

Password reset, email verification, reviews API, wishlist, discounts, courier tracking, full E2E Playwright suite, live monitoring.
