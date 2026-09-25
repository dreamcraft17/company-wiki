# DOVA Chain — Bundle Feature
## Software Design Document (Backend)

**Status:** Backend design for estimation and implementation planning  
**Author:** Dozer  
**Last verified against repository:** 2026-09-15  
**Repository:** `dova/`  
**Audience:** Backend, frontend, database, and QA teams

> Important: the audited repository has no bundle tables, migrations, service, controller, DTO, or route. This document defines the target backend design. Proposed bundle contracts must be agreed with FE before implementation and must preserve existing product/cart/order behavior.

---

## 1. CURRENT BACKEND BASELINE

| Area | Current implementation |
|---|---|
| Runtime | Node.js 20, TypeScript |
| Framework | NestJS `^11.0.0` |
| HTTP | NestJS on Express, global prefix `/api/v1` |
| Validation | Global `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })` |
| Database | PostgreSQL via `pg` and handwritten SQL migrations |
| Local mode | `USE_IN_MEMORY=true` uses `AppStateService`; no PostgreSQL/Redis required |
| Cache | Optional Redis via `RedisService`; unavailable Redis is non-fatal |
| Auth | JWT access/refresh tokens, httpOnly cookies, bearer support |
| Authorization | global JWT/integration guards plus `@Roles()` and `@Public()` decorators |
| Security | Helmet, CORS, throttling, raw body for Paystack webhook |
| Uploads | local filesystem under `/uploads/`; product image upload limit 5MB |
| Payments | Paystack service with test/mock configuration |
| API contract | hand-maintained OpenAPI object in `src/openapi-spec.ts` |

This is a modular monolith. Do not introduce a standalone bundle microservice, RPC/event bus, Prisma, or an inventory service for the MVP.

### 1.1 Relevant source files

```text
apps/backend/src/app.module.ts              # module and global providers
apps/backend/src/app.controller.ts          # current REST endpoints
apps/backend/src/app.service.ts             # application orchestration
apps/backend/src/admin.service.ts           # existing admin operations
apps/backend/src/database.service.ts        # pg queries and row mapping
apps/backend/src/cart.service.ts            # in-memory cart behavior
apps/backend/src/order.service.ts           # order creation logic
apps/backend/src/auth.dto.ts                # class-validator DTOs
apps/backend/src/auth.decorators.ts         # Public/Roles/current-user decorators
apps/backend/src/openapi-spec.ts            # public OpenAPI document
database/migrations/                         # SQL migration files
shared/src/index.ts                          # shared Product/Cart/Order types
```

---

## 2. DESIGN OBJECTIVES AND BOUNDARIES

### Objectives

- Store admin-managed bundles in PostgreSQL when database mode is enabled.
- Support the existing in-memory mode for local UI demos and tests.
- Treat a bundle as one sellable cart line while retaining component information for fulfillment and order history.
- Calculate availability and savings consistently and validate them server-side.
- Reuse the current JWT, role, cart, order, stock, and Paystack flows.
- Expose a documented REST contract for FE.

### MVP boundaries

- Bundle logic lives inside the main NestJS application.
- PostgreSQL transactions are used for bundle/order writes in database mode.
- Redis caching is optional and must never be required for correctness.
- No stock reservation on cart add unless a separate reservation model is implemented and approved.
- No bundle ratings, reviews, analytics, alternative products, discount-code engine, or supplier storefront API.

---

## 3. PROPOSED DOMAIN MODEL

### 3.1 Bundle

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

Use the existing `categories` table through `category_id` where a bundle category is required. Do not introduce a separate hard-coded bundle category enum until product/category ownership is agreed.

### 3.2 Bundle content

```ts
type BundleContent = {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  position: number;
};
```

`quantity` should support the same precision rules as the marketplace if fractional kg/L products can be included. If bundles are intentionally integer-only, enforce that in both DTO and SQL. Duplicate `product_id` values within one bundle must be rejected.

### 3.3 Read model

```ts
type BundleComputed = {
  individualTotal: number;
  savingsAmount: number;
  savingsPercentage: number;
  availableQuantity: number;
  isOutOfStock: boolean;
};

type BundleDetail = Bundle & {
  contents: Array<BundleContent & {
    product: Product;
  }>;
  computed: BundleComputed;
};
```

Prices and stock in this read model must be derived from current product rows unless the final business decision selects snapshots. `bundlePrice` is the admin-set selling price.

---

## 4. DATABASE DESIGN (PROPOSED MIGRATION)

The existing schema uses `gen_random_uuid()`, `snake_case` columns, `NUMERIC`, and numbered SQL migrations. Add a new migration after `008_ai_chat.sql`; do not edit an already-applied migration.

```sql
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  bundle_price NUMERIC(12,2) NOT NULL CHECK (bundle_price > 0),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  position INT NOT NULL DEFAULT 0,
  UNIQUE (bundle_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_bundles_status_created
  ON bundles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bundles_category_status
  ON bundles(category_id, status);
CREATE INDEX IF NOT EXISTS idx_bundle_contents_bundle
  ON bundle_contents(bundle_id, position);
CREATE INDEX IF NOT EXISTS idx_bundle_contents_product
  ON bundle_contents(product_id);
```

### 4.1 Cart/order extension

The current database has `cart_items.product_id NOT NULL` and `order_items.product_id NOT NULL`. Supporting bundle lines requires a coordinated migration and shared-type change.

Recommended shape:

```sql
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES bundles(id) ON DELETE RESTRICT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES bundles(id) ON DELETE RESTRICT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_contents_snapshot JSONB;
```

Then replace the product-only constraints only after all queries and code paths are updated:

```sql
-- Final constraint must allow exactly one of product_id or bundle_id.
CHECK (num_nonnulls(product_id, bundle_id) = 1)
```

Do not apply this migration until the team has decided whether order storage uses one bundle order line with a snapshot or expanded component order lines. Existing supplier fulfillment currently expects product-based `order_items`, so this is a breaking design decision.

### 4.2 Snapshot recommendation

At order creation, store the bundle name, bundle price, component product ids/names, component quantities, component prices, and supplier ids in `bundle_contents_snapshot`. This protects order history from later bundle edits. Stock deduction should use the validated current contents at the same transaction boundary.

---

## 5. SERVICE AND MODULE DESIGN

### 5.1 BundleService (proposed)

Add a focused `BundleService` and `BundleController`, then register them in `AppModule` or a small `BundleModule` imported by `AppModule`. Keep database access in `DatabaseService` or a dedicated bundle repository that uses the existing `pg` pool.

Responsibilities:

- validate and create/update bundle metadata and contents;
- list active customer bundles;
- retrieve bundle detail;
- compute savings and availability;
- activate/deactivate and soft-delete behavior;
- validate bundle eligibility before cart/order operations.

Suggested methods:

```ts
listCustomerBundles(query: BundleListQuery): Promise<BundleListResponse>;
getCustomerBundle(id: string): Promise<BundleDetail>;
listAdminBundles(query: AdminBundleListQuery): Promise<BundleListResponse>;
getAdminBundle(id: string): Promise<BundleDetail>;
createBundle(actorId: string, dto: CreateBundleDto): Promise<BundleDetail>;
updateBundle(actorId: string, id: string, dto: UpdateBundleDto): Promise<BundleDetail>;
setBundleActive(actorId: string, id: string, active: boolean): Promise<{ id: string; status: BundleStatus }>;
deleteBundle(actorId: string, id: string): Promise<{ id: string; status: 'inactive' }>;
```

### 5.2 Pricing and availability

```text
individualTotal = Σ(product.price × content.quantity)
savingsAmount = individualTotal − bundle.bundlePrice
savingsPercentage = individualTotal > 0
  ? savingsAmount / individualTotal × 100
  : 0
availableQuantity = MIN(floor(product.stockQuantity / content.quantity))
```

If a component is inactive, missing, or has zero stock, the bundle is unavailable. Decide whether negative savings are allowed; recommended behavior is to expose `savingsAmount = 0` and an explicit `hasSavings` flag, or reject bundle prices above the individual total during admin write.

All calculations must use decimal-safe numeric handling and return JSON numbers consistent with existing `Number(...)` mapping. The database remains the source of truth.

### 5.3 Cart and order integration

Do not reserve stock on `POST /cart/add-bundle` in MVP. At add:

1. Verify the bundle is active.
2. Verify contents exist and availability can satisfy the requested quantity.
3. Upsert one bundle cart line.
4. Return the complete cart read model.

At order creation, use one database transaction:

1. Lock the customer cart lines and relevant product rows (`FOR UPDATE`).
2. Re-read active bundle contents, prices, and stock.
3. Validate fulfillment data and minimum order amount.
4. Recalculate totals server-side.
5. Create order and bundle snapshot/order line(s).
6. Deduct component stock atomically.
7. Insert `stock_adjustments` for every deducted product.
8. Clear the cart and commit.

If any component fails validation or stock is insufficient, roll back the whole transaction and return a clear 400/409 error. Do not silently partially fulfill a bundle.

---

## 6. API DESIGN (PROPOSED)

All paths are relative to `/api/v1`. The current public catalog routes use `@Public()` plus integration-key behavior; customer cart/order routes use JWT; admin routes use `@Roles('admin')`.

### 6.1 Customer routes

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

Recommended error meanings: 400 invalid input, 404 bundle not found, 409 inactive/out-of-stock/conflicting stock state.

### 6.2 Admin routes

```text
GET    /admin/bundles?search=&categoryId=&status=&page=&limit=
GET    /admin/bundles/:id
POST   /admin/bundles
PUT    /admin/bundles/:id
PUT    /admin/bundles/:id/active
DELETE /admin/bundles/:id
```

Recommended create/update DTO:

```ts
class CreateBundleDto {
  name!: string;
  description!: string;
  categoryId?: string;
  imageUrl?: string;
  bundlePrice!: number;
  isFeatured?: boolean;
  contents!: Array<{ productId: string; quantity: number; position?: number }>;
}
```

Use `class-validator` decorators and rely on the existing global `ValidationPipe`. Because `forbidNonWhitelisted` is enabled, all accepted fields must be explicitly decorated.

### 6.3 Existing route compatibility

The current API uses:

- `POST /cart/add` with `{ productId, quantity, deliverySlot }`;
- `PUT /cart/items/:id` for quantity/slot updates;
- `POST /orders` for order creation;
- `GET /payments/config`, `POST /payments/initialize`, and `GET/POST /payments/verify` for payment.

Choose one compatibility strategy and document it in OpenAPI:

1. Add `bundleId` as an optional mutually exclusive field to the existing cart DTO; or
2. Add `POST /cart/add-bundle` while keeping the product endpoint unchanged.

The separate endpoint is less disruptive to the current DTO and frontend product flow. In either case, update cart, order, admin-order, supplier-order, and shared types together.

---

## 7. AUTHORIZATION, SECURITY, AND VALIDATION

- Public bundle reads must not expose private admin fields such as `createdBy`.
- Customer cart/bundle mutations require a verified customer according to existing role/session rules.
- Admin mutations require `@Roles('admin')`; frontend guards are not a security boundary.
- Validate that every referenced product exists, is active, and belongs to an eligible catalog state.
- Validate positive bundle price, non-empty name, content quantities, duplicate products, and category references.
- Use parameterized SQL through `pg`; never interpolate user query values.
- Recalculate price, savings, availability, and order totals server-side.
- Use existing throttling, Helmet, CORS, and integration-key behavior.
- Do not put Paystack or integration secrets in response payloads.
- Delete should default to deactivation when historical orders reference the bundle; hard delete is unsafe once bundle history exists.

---

## 8. CACHE AND CONSISTENCY

Redis is optional in DOVA and currently only provides a small wrapper. Bundle correctness must not depend on Redis.

Recommended later optimization:

- cache public active bundle lists/details for a short TTL;
- invalidate after bundle mutation or product price/stock mutation;
- bypass cache for final availability and order validation;
- continue serving correctly if Redis is unavailable.

Do not implement cache invalidation as part of the first migration unless measured performance requires it.

---

## 9. TESTING REQUIREMENTS

Use Jest, the existing test doubles, and the repository's in-memory mode.

### Unit tests

- savings and percentage calculations;
- availability calculation across integer/fractional component quantities;
- duplicate/missing/inactive product validation;
- active/inactive access rules;
- DTO validation and unknown-field rejection;
- cart merge behavior for the same bundle.

### Integration tests

- customer can list/detail only active bundles;
- admin CRUD and status mutation require admin role;
- bundle add requires customer role and valid delivery slot;
- cart can return product and bundle lines;
- mixed cart order creation is atomic;
- insufficient stock rolls back all stock/order/cart changes;
- order snapshot remains stable after bundle edit;
- Paystack initialization still uses the existing order total.

### Commands

```bash
npm run typecheck -w apps/backend
npm run test:backend
npm run test:unit
npm run build
```

---

## 10. IMPLEMENTATION ORDER AND OPEN DECISIONS

Recommended order:

1. Agree bundle/cart/order contract with FE.
2. Add shared types and OpenAPI definitions.
3. Add numbered SQL migration and database row mappers.
4. Implement `BundleService` and customer/admin routes.
5. Integrate cart and order transaction logic.
6. Add in-memory behavior for local mode.
7. Add seed data and tests.
8. Run typecheck, Jest, build, and staging smoke tests.

Decisions required before coding:

- Snapshot versus live component price/content behavior.
- Integer versus fractional bundle content quantities.
- One bundle order line with snapshot versus expanded product order lines.
- Stock deduction at order creation versus payment confirmation.
- Whether inactive products make a bundle unavailable.
- Whether bundles may be mixed with regular products.
- Whether `deliverySlot` is stored per line or per order.
- Whether a bundle category uses the existing `categories` table.
- Whether one image is sufficient for MVP.

---

**Final status:** Ready for backend estimation and contract review. Implementation is not complete until schema, shared types, API, cart/order integration, in-memory mode, and tests are delivered together.
