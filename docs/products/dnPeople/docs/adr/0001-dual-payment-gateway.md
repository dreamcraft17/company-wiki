---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-15
review_cadence: annual
---

# ADR 0001: Dual Payment Gateway (Xendit + Midtrans)

> **Author:** Dozer  
> **Date:** 2026-08-23

- **Status:** Accepted
- **Deciders:** Dozer (CEO + Tech Lead)

## Context

dnPeople billing perlu hosted checkout untuk subscription invoice (IDR, e-wallet, VA, QRIS). Satu vendor saja menimbulkan risiko outage dan ketergantungan negosiasi. Tim sudah mengintegrasikan Midtrans (SNAP) dan Xendit (Invoice v2).

Constraints:

- Bukan core IP — PCI scope minimal (hosted checkout)
- Satu active provider per environment pada satu waktu
- Webhook + return-url sync harus idempotent

## Decision

1. **Buy both** Xendit dan Midtrans; **satu active provider** via feature flag `platform:active-payment-provider` (DB) dengan fallback env `PAYMENT_PROVIDER`.
2. **`PaymentService.initiatePayment`** routes by provider; explicit `provider` param allowed for subscription API.
3. **`syncPaymentByOrderId`** branches by `payment.paymentProvider` (Xendit hosted status vs Midtrans status API).
4. Refunds gateway-paid invoices **only** via Payment Management (`PaymentRefund` + gateway API), not invoice-centric admin refund.

## Consequences

### Positive

- Failover path: switch provider via admin without redeploy
- Idempotency: advisory lock + partial unique index on pending payments
- Indonesia payment method coverage from both vendors

### Negative / trade-offs

- Dual code paths to maintain (webhooks, sync, frontend SNAP vs redirect)
- Migration away from either vendor requires data export + cutover window
- Two sets of sandbox credentials and webhook URLs

## Alternatives considered

| Option | Pros | Cons | Why rejected |
|--------|------|------|--------------|
| Xendit only | Simpler codebase | Single vendor risk | Rejected — Midtrans already integrated |
| Build internal PG | Full control | PCI, compliance, cost | Rejected — not core IP |
| Stripe primary | Global | Weak IDR local methods | Superseded by Xendit |

## Reversibility

- Provider switch: update feature flag + verify webhooks; existing `Payment` rows retain `paymentProvider`.
- Removing a gateway: deprecate flag value, migrate pending payments, archive routes after 90 days.

## References

- [xendit/XENDIT-PAYMENT-SETUP.md](../xendit/XENDIT-PAYMENT-SETUP.md)
- [PG/README.md](../PG/README.md)
- `backend/src/lib/paymentProviderConfig.ts`
- `backend/src/lib/paymentSync.ts`
