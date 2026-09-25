# DOVA Chain — Bundle Feature
## Software Design Document (Frontend)

**Status:** Implementation-ready frontend design, dependent on backend bundle support  
**Author:** Dozer  
**Last verified:** 2026-09-15  
**Repository:** `dova/`  
**Audience:** Frontend team and backend integrator

> In the audited commit, DOVA has no bundle entity, migration, service, controller, or route. This document designs the addition of bundle functionality on top of the existing platform. The **proposed** sections depend on a backend contract; FE must not call bundle endpoints before the backend provides them.

---

## 1. CURRENT PROJECT BASELINE

### 1.1 Actual stack

| Area | Implementation in the repository |
|---|---|
| Monorepo | npm workspaces: `shared`, `apps/backend`, `apps/frontend` |
| Frontend | Next.js `^16.0.0`, React `^19.0.0`, TypeScript |
| Routing | Next.js **Pages Router** (`apps/frontend/src/pages`) |
| State | React Context API: `AuthContext`, `CartContext`, `ToastContext` |
| HTTP | native `fetch` through `apps/frontend/src/lib/api.ts` |
| Styling | CSS: `globals.css`, `mobile-first.css`, `dashboard-redesign.css` |
| Image | `ProductImage` with catalog fallback; not `next/image` |
| Backend | NestJS REST API |
| Shared contract | package `dova-shared` |
| Test | Jest + TypeScript; not Vitest/RTL |
| Payment | Paystack through the backend; local/mock flow is also supported |

Do not add React Query, Zustand, Tailwind, React Hook Form, Zod, Axios, or `next/image` merely because the old document mentioned them. New dependencies must be agreed upon because they change the project baseline.

### 1.2 Frontend structure reference

```text
apps/frontend/src/
├── components/       # Layout, ProductCard, ProductImage, Loading, Toast, dashboard UI
├── context/           # AuthContext, CartContext, ToastContext
├── lib/               # api.ts, auth-session.ts, payment.ts
├── pages/             # Pages Router
│   ├── index.tsx
│   ├── products.tsx
│   ├── products/[id].tsx
│   ├── cart.tsx
│   ├── checkout.tsx
│   ├── customer/...
│   └── admin.tsx
└── styles/
```

Bundle components should follow this pattern, for example:

```text
components/bundles/BundleCard.tsx
components/bundles/BundleQuantitySelector.tsx
components/bundles/BundleContents.tsx
pages/bundles.tsx
pages/bundles/[id].tsx
```

Add bundle types to `shared/src/index.ts` after the backend DTO is agreed upon; avoid a separate frontend contract.

### 1.3 Existing platform API

All backend routes are under `/api/v1`. `api()` calls `/api/gateway` through `NEXT_PUBLIC_API_URL` (default), sends credentials/bearer tokens, refreshes on 401, and throws `ApiError`.

| Use case | Method | Path | Auth |
|---|---:|---|---|
| Categories | GET | `/categories` | public |
| Product list | GET | `/products?search=&categoryId=&page=&limit=` | public |
| Product detail | GET | `/products/:id` | public |
| Current cart | GET | `/cart` | customer JWT |
| Add product | POST | `/cart/add` | customer JWT |
| Update cart line | PUT | `/cart/items/:id` | customer JWT |
| Remove cart line | DELETE | `/cart/items/:id` | customer JWT |
| Create order | POST | `/orders` | customer JWT |
| Customer orders/detail | GET | `/orders`, `/orders/:id` | customer JWT |
| Payment config | GET | `/payments/config` | public |
| Initialize/verify payment | POST/GET | `/payments/initialize`, `/payments/verify` | customer JWT |

The current cart contains single-product `CartItem` records: `product`, `quantity`, `subtotal`, and `deliverySlot` (`morning`/`evening`). The cart badge counts line items, not total quantity. Checkout supports `pickup` (NGN 3,000 minimum) and `delivery` (NGN 5,000 minimum); an address is required for delivery.

The current admin area is a single `/admin` page with dashboard, suppliers, products, orders, users, contacts, and feedback tabs. There is no `/admin/bundles` page or bundle admin API yet.

---

## 2. SCOPE BUNDLE FEATURE

### 2.1 In scope

- Bundle listing for customers.
- Bundle details and contents.
- Add bundles to the cart.
- Display bundles alongside regular products in cart/checkout.
- Admin create, edit, activate/deactivate, and delete operations.
- Bundle price, combined regular price, savings, availability, and responsive/accessibility/loading/error states.

### 2.2 Out of scope MVP

- Bundle ratings/reviews; the repository has no review model/API.
- Supplier storefront links from bundle contents; there is no public route yet.
- Bundle performance/analytics; there is no metrics endpoint.
- Buy-now that bypasses the cart; use the existing cart + checkout flow.
- Customer build-your-own bundles.
- Multi-image gallery/carousel unless the backend explicitly provides the contract.

---

## 3. TARGET ROUTES (PROPOSED)

| Route | Page | Access |
|---|---|---|
| `/bundles` | list, search/filter/sort | public |
| `/bundles/[id]` | details and contents | public |
| `/admin` `bundles` tab or `/admin/bundles` | bundle management | admin |
| `/admin/bundles/new` | create | admin |
| `/admin/bundles/[id]/edit` | edit | admin |

Add a `Bundles` link to `Layout` only after the list endpoint is available. The smallest option is a new tab in `pages/admin.tsx`, consistent with the current admin area.

---

## 4. COMPONENT DESIGN

### 4.1 Customer component tree

```text
BundlesPage
├── PageHeader
├── BundleFilters (SearchInput, CategorySelect, SortSelect)
├── BundleGrid (loading, empty, error/retry, BundleCard[])
└── Pagination

BundleDetailPage
├── Breadcrumb
├── BundleHero (BundleImage, BundleDetails, PriceBlock, QuantitySelector, AddToCart)
├── BundleContents
└── RelatedBundles (optional, only if API supports it)

CartPage
├── ProductCartItem (existing)
├── BundleCartItem (new)
├── CartSummary (existing contract)
└── Checkout link (existing)
```

BundleCarousel, ratings, reviews, delivery-fee, and tax line items are not needed because they are not part of the current platform.

### 4.2 BundleCard

```ts
export type BundleCardItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  bundlePrice: number;
  individualTotal: number;
  savingsAmount: number;
  savingsPercentage: number;
  availableQuantity: number;
  categoryName?: string;
  isFeatured?: boolean;
};

type BundleCardProps = {
  bundle: BundleCardItem;
  variant?: 'featured' | 'grid';
};
```

Follow the `ProductCard` pattern: the card is a `Link` to `/bundles/{id}`. If the card has an Add to Cart action, do not place a `button` inside the `Link`; use an `article` wrapper with separate link and button elements.

Rendering:

- Format NGN with `toLocaleString('en-NG')` and the `₦` prefix.
- Display individual total/savings only when provided by the backend.
- `availableQuantity === 0` disables the CTA and displays “Out of stock”.
- Use `ProductImage` or the catalog image fallback when `imageUrl` is empty.
- Use concise, descriptive alt text such as `Bundle ${name}`.
- CTAs must be at least 44px; loading should follow the existing `Loading` component/style.

### 4.3 Quantity selector

```ts
type BundleQuantitySelectorProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};
```

Bundle quantity is an integer by default. Clamp it to `1..max`, prevent NaN on blur, and disable it while a request is in progress. `max` must come from the backend; do not hard-code `10`.

### 4.4 Bundle contents

```ts
type BundleContentItem = {
  productId: string;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
};
```

Desktop may use a table; mobile should use stacked cards. Link to `/products/{productId}` only when `productId` is provided. Do not create supplier/review links without an existing route/API.

---

## 5. PROPOSED API CONTRACT FOR BACKEND

This contract is **not yet available** in the repository. Backend and FE must agree on field names, pagination, validation, and status codes before fetch code is written.

### 5.1 Customer API

```text
GET  /api/v1/bundles?page=1&limit=24&search=&categoryId=&sort=
GET  /api/v1/bundles/:id
POST /api/v1/cart/add-bundle
     { "bundleId": "...", "quantity": 1, "deliverySlot": "morning" }
```

Rekomendasi response list/detail:

```ts
type BundleListResponse = {
  data: BundleCardItem[];
  pagination: { page: number; limit: number; total: number; totalPages?: number };
};

type BundleDetail = BundleCardItem & {
  contents: BundleContentItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};
```

The backend must determine whether cart/order responses use this discriminator:

```ts
type CartItem =
  | { id: string; type: 'product'; product: Product; quantity: number; subtotal: number; deliverySlot: DeliverySlot }
  | { id: string; type: 'bundle'; bundle: BundleDetail; quantity: number; subtotal: number; deliverySlot: DeliverySlot };
```

> Recommendation: keep the existing cart endpoints and add a `type` discriminator. Do not silently change `CartItem.product`, because the current cart, checkout, order history, and shared types depend on the product structure.

### 5.2 Admin API

```text
GET    /api/v1/admin/bundles?search=&categoryId=&active=&page=&limit=
GET    /api/v1/admin/bundles/:id
POST   /api/v1/admin/bundles
PUT    /api/v1/admin/bundles/:id
PUT    /api/v1/admin/bundles/:id/active
DELETE /api/v1/admin/bundles/:id
```

Rekomendasi payload:

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

Combined regular price, savings, and availability should be calculated by the backend. FE may calculate a form preview, but the backend remains the source of truth and must validate again.

### 5.3 Auth/error behavior

- Customer endpoints require JWT; admin endpoints require the `admin` role.
- FE must always use `api()` from `lib/api.ts`, not direct fetch calls.
- Handle 401 with session refresh/login redirect; 403 as an access error; 404 as not found; and 400/409 as validation/stock conflicts.
- Never put integration keys, Paystack secrets, or other secrets in `NEXT_PUBLIC_*`.

---

## 6. PAGE BEHAVIOR

### 6.1 `/bundles`

Follow the `pages/products.tsx` pattern: local `useState` + `useEffect`, approximately 300ms search debounce, `page`/`limit` pagination, loading skeleton, error, and retry. A default `limit` of 24 is recommended.

Render only filters supported by the backend: `search`, `categoryId`, and `sort` when available. Do not show price range, rating, best-seller, seasonal, or infinite-scroll controls without corresponding backend parameters/data.

### 6.2 `/bundles/[id]`

1. Read `id` from `useRouter()` after the router is ready.
2. GET detail bundle.
3. Display image, name, description, price, savings, availability, and contents.
4. Guests follow the product-detail login pattern.
5. Non-customers receive a message that the cart is for customers only.
6. Validate quantity and `deliverySlot` (`morning`/`evening`) before POST.
7. On success, `await refreshCart()` and call `showToast()`.
8. Do not use React Query invalidation because the project does not use React Query.

### 6.3 Cart and checkout

Bundles must coexist with product items; do not replace the existing cart with a bundle-only model.

- `BundleCartItem`: name, quantity, price/subtotal, delivery slot, remove, and optional expandable contents.
- Update/remove uses the existing cart endpoints once the backend supports bundle line items.
- Checkout retains pickup/delivery, NGN 3,000/5,000 minimums, delivery fields, and the Paystack flow.
- Order summary distinguishes items through the `type` discriminator.
- Payment continues through `startOrderPayment()` and `/payments/initialize`; bundles do not create a second payment flow.

---

## 7. ADMIN UI

Use `pages/admin.tsx`, `RequireAuth roles={['admin']}`, `DashboardShell`, and the existing dashboard CSS.

### 7.1 Bundle list

Display name, category when available, bundle price, contents count, active/inactive status, availability when available, and edit/activate/deactivate/delete actions. Search/filter/pagination must use only real backend parameters. There is no performance view in the MVP.

### 7.2 Create/edit form

Minimum fields: `name`, `description`, `categoryId` once taxonomy is defined, `imageUrl`/upload according to the backend, `bundlePrice`, `contents` (at least 2 if required by business rules), `isFeatured` when supported, and active status.

Use controlled inputs like the existing pages. Do not add React Hook Form/Zod without a dependency decision. Display backend errors, disable submit while busy, and prevent duplicate submissions.

Preview calculation:

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

The preview is not the source of truth for checkout pricing.

---

## 8. STATE AND DATA FLOW

```text
Page useEffect → api() → local useState
                         ↓
               set page state
                         ↓
     cart mutation → useCart().refresh()
                         ↓
                    Toast feedback
```

- `AuthContext`: current user/session.
- `CartContext`: cart badge and customer cart refresh.
- `ToastContext`: feedback.
- Page-local state: list/detail, filters, pagination, form, busy/error.
- `BundleFilterContext` is not needed unless filters are shared across pages.
- There is no global TTL cache in the current implementation.

After a mutation: cart mutations update page state and `await refresh()`; admin mutations reload/update the list; customer-facing bundle changes are fetched again on the next visit.

---

## 9. DESIGN, ACCESSIBILITY, AND IMAGES

Follow the existing CSS tokens (`globals.css`) and `mobile-first.css` breakpoints; do not copy the hypothetical Tailwind palette.

- Use semantic headings, connected labels/inputs, visible focus states, and `aria-live` for feedback.
- Buttons must be disabled while busy; error/empty/loading/out-of-stock/unauthorized/forbidden states are required.
- Do not use emoji as the sole indicator of status or important information.
- One public `imageUrl` is sufficient for the MVP. The backend must provide a public URL or a multipart upload endpoint that returns a URL.
- FE must not assume Cloudinary, blur hashes, `next/image`, or an image array without a contract.

---

## 10. TESTING DAN ACCEPTANCE CRITERIA

Use Jest and the repository's existing test patterns.

### 10.1 Behavior tests

- BundleCard renders name, price, savings, and out-of-stock state.
- The quantity selector rejects values `<1` or `>max`.
- Price formatting uses the NGN locale.
- Contents renders populated and empty states.
- Add-to-cart sends `{ bundleId, quantity, deliverySlot }` and calls refresh/toast on success.
- The cart renders products and bundles without breaking the product flow.
- Checkout continues to enforce pickup/delivery minimums and starts the existing Paystack flow.
- Admin rejects non-admins and prevents double submission.

### 10.2 Definition of done

- The backend contract and shared types are merged.
- List/detail works against the real API, not a permanent mock.
- Bundle add/update/remove works correctly in the cart.
- Bundle checkout/order/payment is tested end-to-end.
- `npm run typecheck` and the test suite pass.
- Responsive QA is complete on mobile and desktop.
- No fictional bundle endpoints remain in source code.

---

## 11. IMPLEMENTATION ORDER DAN BLOCKERS

Order: (1) backend schema/migration/DTO/service/controller, (2) OpenAPI + bundle seed data, (3) shared types/API helpers, (4) list/detail, (5) cart/checkout union item, (6) admin UI, (7) tests/typecheck/staging smoke.

Decisions required before FE locks the payload:

- Does a bundle use a price/content snapshot or the latest product prices?
- Is availability calculated from the minimum stock across all contents?
- Does `deliverySlot` apply per line item or per order?
- One image or multiple images?
- Should admin use an `/admin` tab or a separate route?
- Can bundles be mixed with regular products in one order?

Without these decisions, FE can only complete static UI and must not lock the API.

---

## 12. FILES TO ADD/UPDATE

```text
shared/src/index.ts                         # Bundle types + Cart union
apps/frontend/src/pages/bundles.tsx
apps/frontend/src/pages/bundles/[id].tsx
apps/frontend/src/components/bundles/BundleCard.tsx
apps/frontend/src/components/bundles/BundleContents.tsx
apps/frontend/src/components/bundles/BundleQuantitySelector.tsx
apps/frontend/src/components/bundles/BundleForm.tsx
apps/frontend/src/pages/cart.tsx            # product + bundle rendering
apps/frontend/src/pages/checkout.tsx        # product + bundle summary
apps/frontend/src/pages/admin.tsx           # bundle tab, if chosen
apps/frontend/src/styles/globals.css        # only required styles
```

## 13. REPOSITORY REFERENCES

- Baseline: `dova/apps/frontend/package.json`
- API wrapper: `dova/apps/frontend/src/lib/api.ts`
- Providers: `dova/apps/frontend/src/context/`
- Product flows: `dova/apps/frontend/src/pages/products.tsx`, `dova/apps/frontend/src/pages/products/[id].tsx`
- Cart/checkout: `dova/apps/frontend/src/pages/cart.tsx`, `dova/apps/frontend/src/pages/checkout.tsx`
- API routes: `dova/apps/backend/src/catalog-cart.controller.ts`, `payment.controller.ts`, `admin.controller.ts`
- Shared types: `dova/shared/src/index.ts`
- Setup/scripts: `dova/Readme.md`

---

**Final status:** Ready to hand to FE for estimation and implementation planning. Runtime implementation remains blocked until backend bundle contract is available.
