# DOVA Chain — Bundle Feature
## Product Requirements Document + Software Requirements Specification (Backend)

**Status:** Requirements for backend estimation and contract review  
**Author:** Dozer  
**Last verified against repository:** 2026-09-15  
**Repository:** `dova/`  
**Audience:** Product, backend, frontend, database, and QA teams

> Important: bundle functionality is not implemented in the audited DOVA repository. There are no bundle tables, migrations, DTOs, services, controllers, routes, or shared types. This document defines the required backend work and the decisions that must be completed before FE integration.

---

## 1. PRODUCT CONTEXT

DOVA is a Nigerian agricultural marketplace using NGN, verified suppliers, customer carts, fulfillment selection, orders, and Paystack payments. Bundles are admin-curated packages of existing products sold as a single customer-facing offer.

### Problem

Customers currently add products individually. Admins need a controlled way to package related products at a bundle price while preserving product-level stock and supplier fulfillment.

### Goals

- Store and manage bundles without developer changes for every new package.
- Calculate bundle savings and availability consistently.
- Add bundles to the existing customer cart and checkout.
- Deduct component stock atomically when an order is created.
- Preserve product order history, supplier fulfillment, authentication, and payment behavior.
- Support both PostgreSQL production mode and the existing in-memory development/test mode.

### Non-goals for MVP

- Standalone bundle microservice or event bus.
- Stock reservation at cart-add time.
- Alternative/substitute products.
- Ratings/reviews, analytics, recommendations, or discount-code integration.
- New tax or delivery-fee engine.
- Customer-created bundles.

---

## 2. CURRENT SYSTEM CONSTRAINTS

- NestJS 11 monolithic application under `apps/backend/src`.
- Global API prefix `/api/v1`.
- PostgreSQL access uses `pg` and numbered handwritten SQL migrations.
- `USE_IN_MEMORY=true` uses `AppStateService`; local UI demos do not require PostgreSQL or Redis.
- Redis is optional and unavailable Redis must not break the API.
- Global `ValidationPipe` uses `whitelist`, `transform`, and `forbidNonWhitelisted`.
- JWT access/refresh authentication supports httpOnly cookies and bearer tokens.
- Admin authorization uses `@Roles('admin')`; customer cart/order routes use `@Roles('customer')`.
- Existing product catalog reads use public/integration-key rules; storefront requests do not need a partner key.
- Product quantities and order/cart quantities support up to two decimal places for weight/volume products.
- Existing order creation deducts product stock and writes `stock_adjustments` in database mode.
- Paystack is initialized and verified through existing payment services/controllers.

Do not assume Prisma, TypeORM, a separate inventory service, mandatory Redis, or NestJS microservice boundaries.

---

## 3. FUNCTIONAL REQUIREMENTS

### FR-001 — Bundle creation

An admin can create a bundle containing:

- name;
- description;
- optional existing category reference;
- optional public image URL or backend-supported upload;
- positive NGN bundle price;
- active/inactive status;
- optional featured flag;
- at least two distinct products if that business rule is confirmed;
- positive quantity for each component;
- optional display position for component ordering.

The backend must validate all fields and reject unknown fields through the existing validation pipeline.

### FR-002 — Bundle update and status

An admin can edit bundle metadata, price, image, featured flag, and contents. An admin can activate/deactivate a bundle without losing its data. Deletion should be a safe deactivation once the bundle is referenced by cart or order history.

### FR-003 — Customer discovery

Public customers can list active bundles with agreed pagination and search/category parameters. Inactive bundles must not appear in customer list/detail responses.

### FR-004 — Bundle detail

The detail response includes bundle metadata, component products, component quantities, current product prices, computed regular total, savings, and availability.

### FR-005 — Availability

For each component, available bundle units are calculated as:

```text
floor(component.stock_quantity / component.quantity_in_bundle)
```

Bundle availability is the minimum value across all components. Missing, inactive, or zero-stock components make the bundle unavailable.

### FR-006 — Add to cart

A verified customer can add a bundle as one cart line. The backend validates active status, contents, quantity, delivery slot, and current availability. MVP does not reserve stock when the cart is updated.

### FR-007 — Cart read model

Cart responses distinguish product and bundle lines. Bundle lines include bundle name, current bundle price, quantity, subtotal, delivery slot, and enough content data for cart/checkout display.

### FR-008 — Order creation

At order creation, the backend revalidates bundle contents, prices, availability, fulfillment data, and minimum order amount. It creates an immutable bundle snapshot, deducts all component stock atomically, writes stock adjustments, and clears the cart only after success.

### FR-009 — Payment compatibility

The bundle total must flow through the existing order and Paystack initialization/verification process. Bundle support must not create a second payment path.

### FR-010 — In-memory mode

When `USE_IN_MEMORY=true`, bundle list/detail/admin/cart/order behavior must either be implemented in `AppStateService` or the feature must be explicitly disabled with a documented response. It must not silently behave differently from PostgreSQL mode.

---

## 4. DATA REQUIREMENTS

### Bundle record

```ts
type BundleStatus = 'active' | 'inactive';

type Bundle = {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  imageUrl?: string;
  bundlePrice: number;
  isFeatured: boolean;
  status: BundleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
```

### Bundle content record

```ts
type BundleContent = {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  position: number;
};
```

Use the existing `categories` and `products` tables. Add a new numbered migration; never edit an already-applied migration.

Required database rules:

- bundle name is non-empty;
- bundle price is greater than zero;
- bundle status is `active` or `inactive`;
- content quantity is greater than zero;
- `(bundle_id, product_id)` is unique;
- deleting a product referenced by a bundle is restricted;
- deleting a bundle cascades only to bundle-content rows;
- historical order snapshots remain readable.

### Cart/order compatibility

Current `cart_items.product_id` and `order_items.product_id` are required. A migration must coordinate nullable `bundle_id`, the exactly-one-of-product-or-bundle rule, query changes, and shared type changes. Do not ship only the database column change.

Recommended order snapshot fields: bundle id, bundle name, bundle price, component product id/name, component quantity, price at order time, and supplier id.

---

## 5. API REQUIREMENTS

All paths are relative to `/api/v1`.

### Customer API

```text
GET  /bundles?page=1&limit=24&search=&categoryId=&sort=
GET  /bundles/:id
POST /cart/add-bundle
     { bundleId, quantity, deliverySlot }
```

Recommended list response:

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 24, "total": 0 }
}
```

Customer bundle reads are public. Bundle cart mutation requires a customer JWT. Recommended errors: 400 invalid input, 404 not found, 409 inactive/out-of-stock/conflicting stock state.

### Admin API

```text
GET    /admin/bundles?search=&categoryId=&status=&page=&limit=
GET    /admin/bundles/:id
POST   /admin/bundles
PUT    /admin/bundles/:id
PUT    /admin/bundles/:id/active
DELETE /admin/bundles/:id
```

Admin routes require `@Roles('admin')`. The API must return public-safe fields to customers and may include management fields only for admins.

### Compatibility option

The team must choose one approach:

1. Add optional mutually exclusive `bundleId` to the existing `CartAddDto`; or
2. Keep `POST /cart/add` unchanged and add `POST /cart/add-bundle`.

The separate endpoint is recommended for the first release because it minimizes risk to the existing product flow. In both approaches, `GET /cart`, cart updates/removal, `POST /orders`, customer order history, admin order views, supplier fulfillment, and OpenAPI must be updated together.

---

## 6. BUSINESS RULES

### Pricing

```text
individualTotal = Σ(product.price × content.quantity)
savingsAmount = individualTotal − bundlePrice
savingsPercentage = savingsAmount / individualTotal × 100
```

The bundle price is admin-defined. Server-side calculations are authoritative. Decide whether a bundle with negative savings is rejected or displayed without a savings badge; rejection is recommended.

### Stock and transactions

- No stock reservation on cart add in MVP.
- Final stock validation happens inside the order transaction.
- Lock relevant cart and product rows before calculating/deducting stock.
- Deduct every component required by `bundle quantity × content quantity`.
- Roll back the entire transaction if any component is unavailable.
- Write one purchase stock adjustment per affected product.
- Define cancellation/refund stock restoration before exposing cancellation that can affect bundle stock.

### Fulfillment

The existing fulfillment types remain `pickup` and `delivery`. Existing minimums remain NGN 3,000 for pickup and NGN 5,000 for delivery. Decide whether bundle components can come from multiple suppliers; if yes, preserve supplier ids and existing supplier-order status behavior.

---

## 7. SECURITY AND OPERATIONAL REQUIREMENTS

- Use parameterized `pg` queries.
- Keep admin/customer authorization on backend guards; frontend checks are not security controls.
- Do not expose `createdBy`, internal storage paths, or secrets in public bundle responses.
- Recalculate all money, stock, and availability values server-side.
- Use existing Helmet, CORS, throttling, JWT, integration-key, and Paystack webhook protections.
- Bundle writes must be auditable through normal application logs where appropriate.
- Redis may optimize reads later but must not be required for correctness.
- Migration must work with the project migration runner and both staging/production PostgreSQL environments.

---

## 8. TESTING AND QA REQUIREMENTS

### Unit

- DTO validation and unknown-field rejection;
- pricing and savings calculations;
- integer/fractional availability calculations;
- duplicate/missing/inactive component rejection;
- status and authorization rules;
- cart merge behavior for identical bundle lines.

### Integration

- public list/detail returns active bundles only;
- admin CRUD requires admin role;
- customer add requires customer role and valid delivery slot;
- product and bundle lines are returned together;
- mixed order creation is atomic;
- insufficient component stock rolls back all changes;
- historical bundle snapshot is unchanged after later edits;
- Paystack receives the server-calculated order total;
- PostgreSQL and in-memory modes have equivalent observable behavior.

### Required commands

```bash
npm run typecheck -w apps/backend
npm run test:backend
npm run test:unit
npm run build
```

---

## 9. DELIVERY PLAN AND OPEN DECISIONS

### Delivery phases

1. Contract: agree shared types, endpoint shape, status codes, stock and snapshot rules.
2. Persistence: migration, indexes, row mappers, and seed data.
3. Domain/API: bundle service, DTOs, controller, admin authorization, OpenAPI.
4. Cart/order: union item support, atomic stock deduction, snapshots, fulfillment compatibility.
5. In-memory mode: local/test implementation.
6. QA: unit/integration tests, typecheck, build, and staging smoke test.

### Decisions required

- Snapshot versus live component prices and contents.
- Integer versus fractional bundle content quantities.
- One bundle order line with snapshot versus expanded component order lines.
- Stock deduction at order creation versus payment confirmation.
- Whether inactive products make a bundle unavailable.
- Whether bundles can mix with regular products in one order.
- Whether delivery slot is stored per cart line or per order.
- Whether bundle categories reuse the existing categories table.
- Whether one public image is sufficient for MVP.
- Whether admin deletion is always soft deactivation.

**Final status:** Ready for backend estimation and product/FE contract review. Implementation is not complete until schema, API, cart/order integration, in-memory behavior, OpenAPI, seed data, and tests are delivered together.
