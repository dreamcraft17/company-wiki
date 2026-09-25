# DOVA Chain — Bundle Feature
## Product Requirements Document + Software Requirements Specification (Frontend)

**Status:** Product requirements for estimation and implementation planning  
**Author:** Dozer  
**Last verified against repository:** 2026-09-15  
**Repository:** `dova/`  
**Audience:** Product, frontend, backend, and QA teams

> Important: the audited DOVA repository does not currently contain bundle database models, migrations, backend services, controllers, API routes, or frontend pages. This document describes the target feature on top of the existing marketplace. Bundle requirements marked **proposed** require backend agreement before implementation.

---

## 1. PRODUCT OVERVIEW

DOVA is an agricultural marketplace where customers purchase products from verified suppliers. A bundle is a curated package containing multiple products sold as one cart line at a bundle price.

### 1.1 Problem

Customers currently add products one by one. Curated bundles can simplify discovery, communicate value, and increase basket size, but the current cart and order contracts support product items only.

### 1.2 Goals

- Let customers discover and inspect curated bundles.
- Let customers add a bundle to the existing cart and checkout flow.
- Let admins manage bundle composition, price, image, and active status.
- Preserve current authentication, cart, order, fulfillment, and Paystack behavior.
- Provide clear loading, empty, error, out-of-stock, and access-denied states.

### 1.3 Non-goals for MVP

- Customer-created bundles.
- Bundle ratings/reviews.
- Bundle analytics/performance dashboards.
- Supplier storefront links from bundle contents.
- Tax or delivery-fee calculations not already supported by the platform.
- A separate Buy Now/payment flow.
- Multi-image galleries unless the backend contract explicitly supports them.

---

## 2. CURRENT PRODUCT BASELINE

| Area | Current implementation |
|---|---|
| Frontend | Next.js `^16.0.0`, React `^19.0.0`, TypeScript |
| Router | Next.js Pages Router |
| State | React Context: `AuthContext`, `CartContext`, `ToastContext` |
| HTTP | Native `fetch` through `apps/frontend/src/lib/api.ts` |
| Styling | Existing CSS files, including `globals.css` and `mobile-first.css` |
| Images | `ProductImage` with catalog fallbacks |
| Tests | Jest + TypeScript |
| Backend | NestJS REST API |
| Shared types | `shared/src/index.ts` through `dova-shared` |
| Payment | Paystack initialized and verified through the backend |

The frontend does not currently use React Query, Zustand, Tailwind, Axios, React Hook Form, Zod, Vitest, or `next/image`. The bundle implementation should follow the current patterns unless a dependency change is explicitly approved.

Existing customer routes include `/`, `/products`, `/products/[id]`, `/cart`, `/checkout`, and customer order/profile pages. The existing admin experience is a tabbed `/admin` page; there is no bundle tab or separate bundle route yet.

---

## 3. USERS AND USER STORIES

### Customer

- As a customer, I want to see available bundles so that I can find a convenient product package.
- As a customer, I want to see bundle contents, price, savings, and availability before adding it.
- As a customer, I want to add a bundle to my cart with a delivery slot.
- As a customer, I want bundles and regular products to coexist in one cart and order.
- As a customer, I want clear feedback when a bundle is unavailable, invalid, or cannot be added.

### Admin

- As an admin, I want to create a bundle from existing products.
- As an admin, I want to edit its details, contents, price, image, and active status.
- As an admin, I want to see the calculated regular total and savings before saving.
- As an admin, I want to remove or deactivate a bundle that is no longer sellable.

---

## 4. CUSTOMER REQUIREMENTS

### 4.1 Bundle listing — proposed route `/bundles`

The page must:

- be publicly accessible;
- show a page heading and concise value proposition;
- load bundles from the backend, never from permanent hard-coded mock data;
- support search and category filtering only when those query parameters are supported;
- support pagination using `page` and `limit`;
- use a responsive grid consistent with the existing product listing;
- provide loading skeletons, empty state, error state, and retry;
- link each bundle to `/bundles/{id}`.

Do not add price range, rating, best-seller, seasonal, or infinite-scroll controls until the backend provides the required data and query contract.

Recommended initial page size: 24, matching the existing product page.

### 4.2 Bundle card

Each card should show, when supplied by the API:

- bundle image with fallback;
- name and short description;
- bundle price in NGN;
- combined regular price and savings;
- availability/out-of-stock status;
- optional category or featured indicator.

The card must use accessible links and buttons. Do not nest an Add to Cart button inside a `Link`. Touch targets should be at least 44px.

### 4.3 Bundle detail — proposed route `/bundles/[id]`

The page must show:

- breadcrumb or back navigation;
- one public bundle image for MVP;
- name, description, bundle price, regular total, savings, and availability;
- integer quantity selector constrained to `1..availableQuantity`;
- delivery-slot selection using the existing `morning`/`evening` values;
- Add to Cart action;
- a contents section listing product name, quantity/unit, and optional unit price;
- links to `/products/{productId}` when a content item includes a product id.

The page must handle guest, non-customer, loading, not-found, out-of-stock, and API-error states. A guest follows the existing product-detail login pattern. Supplier, review, and “Notify Me” actions are not required until their backend contracts exist.

### 4.4 Cart and checkout

Bundle support must extend the current cart rather than replace it.

- Product and bundle lines must be distinguishable through a `type` discriminator.
- A bundle line shows bundle name, quantity, price/subtotal, delivery slot, remove action, and optional expandable contents.
- Quantity updates and removal use the existing cart line endpoints after backend support is added.
- The cart badge continues to count distinct line items.
- Checkout keeps the existing `pickup` and `delivery` fulfillment choices.
- Existing minimums remain: NGN 3,000 for pickup and NGN 5,000 for delivery.
- Delivery name, phone, and address rules remain unchanged.
- The order summary must render both item types.
- Payment continues through the existing order creation and Paystack initialization/verification flow.

---

## 5. ADMIN REQUIREMENTS

### 5.1 Bundle management

The admin UI may be implemented as a new `bundles` tab in `/admin` or as separate routes. The choice must be made before implementation; the tab is the smallest change and matches the current admin architecture.

The list must provide:

- name;
- category, if supported;
- bundle price;
- number of contents;
- active/inactive status;
- availability, if returned by the API;
- edit, activate/deactivate, and delete actions;
- confirmation before delete/deactivation when appropriate.

Pagination, search, and filters must map only to real backend query parameters. A performance view is out of scope.

### 5.2 Create/edit form

Minimum proposed fields:

- `name`;
- `description`;
- `categoryId`, once the category taxonomy is agreed;
- `imageUrl` or an upload flow defined by the backend;
- `bundlePrice` in NGN;
- `contents`, with product id and quantity;
- `isFeatured`, only if homepage featuring is supported;
- active status.

Validation requirements:

- name is required;
- bundle price is positive;
- contents contain no duplicate products;
- contents contain at least two products if required by business rules;
- quantity is positive and follows the backend unit/precision rules;
- backend validation errors are shown inline or through the existing toast system;
- submit is disabled while saving and duplicate submissions are prevented.

The form may preview:

```ts
const individualTotal = selectedProducts.reduce(
  (sum, item) => sum + item.product.price * item.quantity,
  0,
);
const savingsAmount = individualTotal - bundlePrice;
const savingsPercentage = individualTotal > 0
  ? (savingsAmount / individualTotal) * 100
  : 0;
```

The backend remains the source of truth for price, stock, savings, and checkout validation.

---

## 6. PROPOSED API REQUIREMENTS

These endpoints do not exist in the audited repository and must be implemented/documented by the backend team.

### Customer bundle endpoints

```text
GET  /api/v1/bundles?page=1&limit=24&search=&categoryId=&sort=
GET  /api/v1/bundles/:id
POST /api/v1/cart/add-bundle
     { "bundleId": "...", "quantity": 1, "deliverySlot": "morning" }
```

Recommended list response:

```ts
type BundleListResponse = {
  data: BundleCardItem[];
  pagination: { page: number; limit: number; total: number; totalPages?: number };
};
```

### Admin bundle endpoints

```text
GET    /api/v1/admin/bundles?search=&categoryId=&active=&page=&limit=
GET    /api/v1/admin/bundles/:id
POST   /api/v1/admin/bundles
PUT    /api/v1/admin/bundles/:id
PUT    /api/v1/admin/bundles/:id/active
DELETE /api/v1/admin/bundles/:id
```

Recommended write payload:

```ts
type BundleWritePayload = {
  name: string;
  description?: string;
  categoryId?: string;
  imageUrl?: string;
  bundlePrice: number;
  isFeatured?: boolean;
  contents: Array<{ productId: string; quantity: number }>;
};
```

### Cart/order contract decision

The backend must decide whether to extend shared types with a union such as:

```ts
type CartItem =
  | { id: string; type: 'product'; product: Product; quantity: number; subtotal: number; deliverySlot: DeliverySlot }
  | { id: string; type: 'bundle'; bundle: BundleDetail; quantity: number; subtotal: number; deliverySlot: DeliverySlot };
```

The backend must also define stock behavior, price snapshot behavior, mixed product/bundle orders, and whether `deliverySlot` applies per line or per order.

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Accessibility

- All controls are keyboard accessible with logical tab order.
- Form labels are associated with inputs.
- Focus indicators are visible.
- Error and success messages use `aria-live` where appropriate.
- Color contrast meets WCAG AA for normal text.
- Quantity controls work without mouse-only interaction.
- Images have concise, meaningful alt text.

### Responsive behavior

- Use the existing mobile-first CSS patterns.
- Mobile: one-column cards and stacked detail/form layouts.
- Tablet: two-column grids where space permits.
- Desktop: three or four-column listing based on the existing container width.
- Avoid fixed heights that clip descriptions or controls.

### Performance

- Use existing loading skeleton patterns.
- Use the existing image fallback and lazy-loading behavior where available.
- Do not promise WebP conversion, 50KB image limits, or specific FCP/LCP targets until hosting/image infrastructure supports them.
- Bundle list/detail requests should avoid duplicate calls and should not block unrelated layout rendering.

### Security

- Use `api()` so credentials and token refresh behavior remain consistent.
- Customer and admin authorization is enforced by the backend; frontend guards are UX only.
- Never expose integration keys, Paystack secrets, or other secrets through `NEXT_PUBLIC_*`.
- Do not trust client-side savings, price, quantity, or availability calculations.

---

## 8. ACCEPTANCE CRITERIA

### Customer

- A public bundle list loads from the real API and supports the agreed filters/pagination.
- A customer can open bundle details and see accurate contents and pricing.
- A customer can select a valid quantity and delivery slot.
- Add to Cart sends the agreed payload and refreshes `CartContext` on success.
- Product and bundle lines render together in cart and checkout.
- Existing fulfillment minimums and Paystack payment flow remain intact.
- Guest, non-customer, out-of-stock, empty, error, and not-found states are usable.

### Admin

- Only admins can access bundle management.
- Admin can create/edit/activate/deactivate/delete according to the final API contract.
- Product selection prevents duplicates and invalid quantities.
- Savings preview updates when contents or price changes.
- Backend errors and saving states are visible.

### Quality

- Shared types compile.
- `npm run typecheck` passes.
- Jest tests cover core bundle/card/quantity/cart behavior.
- Mobile and desktop responsive QA is complete.
- No permanent mock endpoint or unsupported UI control remains.

---

## 9. RELEASE PHASING

### Phase 0 — Contract and backend dependency

- Decide price/content snapshot behavior.
- Decide stock and availability calculation.
- Decide cart/order union shape.
- Implement backend schema, migration, service, controller, OpenAPI, and seed data.
- Add shared types.

### Phase 1 — Frontend MVP

- Bundle list and detail pages.
- Bundle card, contents, quantity selector, loading/error states.
- Add bundle to cart.
- Product + bundle cart and checkout rendering.
- Admin list/create/edit/status/delete UI.

### Phase 2 — Optional enhancements

- Homepage featured bundles.
- Related bundle recommendations.
- Multi-image gallery.
- Reviews, supplier links, and analytics after their APIs exist.

---

## 10. OPEN PRODUCT DECISIONS

The following decisions block a final frontend/backend contract:

1. Are bundle contents and prices snapshotted, or do they follow current product prices?
2. Is bundle availability the minimum available stock across all contents?
3. Does a bundle consume stock at order creation or payment confirmation?
4. Can bundles be mixed with regular products in one order?
5. Does `deliverySlot` apply per cart line or per order?
6. Is one image sufficient for MVP?
7. Should admin use a tab in `/admin` or separate routes?
8. Which bundle categories and featured rules are supported?

Until these are answered, FE can build presentation-level UI but should not lock request payloads or production behavior.

---

**Final status:** Ready for product/engineering estimation. Full implementation depends on the backend bundle contract and shared type changes.
