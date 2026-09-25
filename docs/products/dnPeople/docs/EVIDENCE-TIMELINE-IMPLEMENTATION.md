---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-17
review_cadence: quarterly
---

# dnPeople — Evidence Timeline Implementation (P0 Exception & Evidence Layer)

> **Author:** Dozer
> **Date:** 2026-09-17

**Implemented:** 17 September 2026 (commit `09eca19`)
**Specification:** `company-wiki/docs/products/dnPeople/docs/PRODUCT-RESEARCH-DIFFERENTIATION-2026-09-17.md` — P0 category #1, "People Evidence & Compliance": *"Saat ada sengketa atau audit, HR bisa menunjukkan kronologi dan bukti."*

## Why

The positioning doc argues dnPeople shouldn't compete as a generic "all-in-one HRIS" feature checklist — it should sell three outcomes, one of which is: **every HR decision has evidence — who changed what, based on what data, with whose approval.** Auditing this required piecing together four different tables by hand; nothing showed it as one timeline, and one source (`AuditLog.oldValues`/`newValues`) was captured but never rendered anywhere in the UI at all.

This phase builds the evidence/approval timeline, before/after, and actor parts of that P0 item. **Policy versioning and acknowledgement — also named in the same P0 item — is explicitly not built** (see [Not done](#not-done-this-phase)).

## Fixed

`/audit` (`frontend/src/app/(app)/audit/page.tsx`) already received `oldValues`/`newValues` from the backend on every request — only the CSV export (`backend/src/routes/audit.ts`) ever displayed them. The on-screen table silently dropped that data. Audit rows are now clickable and expand to show a diff of only the fields that actually changed (old → new), via a new shared component:

- `frontend/src/components/AuditDiff.tsx` — takes `before`/`after` (arbitrary JSON), renders only the differing keys, `"—"` for null/undefined.

## Added

### Backend

**`backend/src/services/evidenceTimeline.service.ts`** — `getEmployeeEvidenceTimeline(companyId, employeeId)` aggregates 4 previously-scattered sources into one normalized, chronological list per employee:

| Source | Model(s) | What it contributes |
|---|---|---|
| Profile | `AuditLog` (`entityType` in `employee`, `employee_access`, `employee_contact`, `employee_bank_account`, `employee_family`, `employee_education`, `employee_tax_info`, `probation_review`) | Field-level before/after on any profile edit |
| Attendance | `AttendanceCorrection` + its approve/reject `AuditLog` entry | Reason, evidence URL, original vs. corrected clock times, approver |
| Leave | `LeaveRequest` (status ≠ `PENDING`) | Approval reason, approver, decided dates |
| Payroll | `Payroll` → `AuditLog` (`entityType: 'Payroll'`) | `FINALIZE` / `MARK_PAID` actions with actor |

Each entry is normalized to:

```ts
interface EvidenceEntry {
  id: string;
  timestamp: Date;
  category: 'profile' | 'attendance' | 'leave' | 'payroll';
  action: string;
  actor: { id: string | null; name: string } | null;
  reason: string | null;
  before: unknown;
  after: unknown;
  sourceType: string;
  sourceId: string;
}
```

**Key implementation detail:** `AuditLog` entries for attendance corrections and payroll are keyed by the **record's own id**, not the employee's id (e.g. `corrections.ts` writes `entityId: correction.id`, `payroll.ts` writes `entityId: payroll.id`). So each of those two sources is a two-step join — find the employee's records in that domain first, then pull `AuditLog` rows by those record ids — rather than one flat query filtered by `employeeId`.

A related detail: `LeaveRequest.approvedById` and `AttendanceCorrection.approvedById` are plain scalar columns with no Prisma relation to `User`. Actor names for those two sources are resolved via one batched `prisma.user.findMany({ where: { id: { in: [...] } } })` call rather than a `include`.

**New route:** `GET /employees/:id/evidence-timeline` (`backend/src/routes/employees.ts`), gated by the `employees:view` permission (read-only, same gate as the other lifecycle sub-resources), company-scoped via `companyScope(req)`.

### Frontend

**`frontend/src/components/EmployeeLifecyclePanel.tsx`** — new "Riwayat & Bukti" section (alongside the existing Transisi Status / Evaluasi Probation sections), fetching the endpoint above and rendering each entry as a row with a category badge (Profil / Absensi / Cuti / Payroll), action, timestamp, actor, reason, and a click-to-expand `AuditDiff` for the before/after payload.

### Tests

**`backend/src/__tests__/evidenceTimeline.test.ts`** — 5 new tests (mocking `prisma`, same pattern as `dokuSnap.test.ts`):

1. Profile `AuditLog` entries normalize correctly (actor name, before/after).
2. An `AttendanceCorrection` + its approve/reject `AuditLog` entry merge into **one** timeline entry, not two.
3. Leave/correction approver names resolve via the batched `User` lookup (no relation to join on).
4. Entries from different sources sort together correctly, newest first.
5. When an employee has no correction/payroll records at all, no wasted follow-up `AuditLog` query fires for those domains.

Backend suite: **186 → 191 passing** (`npm test` in `backend/`).

## Not done in Phase 1 — closed in Phase 2

All 3 gaps flagged above are now built (same date, `20260917110000_reason_and_policy_versioning` + `20260917100000_normalize_entity_type_casing` migrations):

### 1. `entityType` naming normalization

Exactly 4 outliers existed (confirmed via full-repo grep, not the ~15 originally estimated): `'Payroll'`, `'Payslip'`, `'AttendanceImport'`, `'PayslipFile'` (PascalCase, everything else was already `snake_case`). Renamed at every write site (`payroll.ts`, `signedPayslip.ts`, `attendance.ts`, `files.ts`, `evidenceTimeline.service.ts`) and every read-side filter (`attendance.ts` import-history queries). A migration backfills historical rows so past audit entries stay queryable:

```sql
UPDATE audit_logs SET entity_type = 'payroll' WHERE entity_type = 'Payroll';
UPDATE audit_logs SET entity_type = 'payslip' WHERE entity_type = 'Payslip';
UPDATE audit_logs SET entity_type = 'attendance_import' WHERE entity_type = 'AttendanceImport';
UPDATE audit_logs SET entity_type = 'payslip_file' WHERE entity_type = 'PayslipFile';
```

This was a live bug, not cosmetic: `/audit`'s entityType filter dropdown had a hardcoded `<option value="payroll">` that matched **zero** rows before the rename (actual stored value was `'Payroll'`). The dropdown (`frontend/src/app/(app)/audit/page.tsx`) now lists the full, real set of ~22 entity types instead of 3 hardcoded guesses.

### 2. Reason-required enforcement

`AuditLog` gained a `reason String?` column. `evidenceTimeline.service.ts` no longer hardcodes `reason: null` for `AuditLog`-sourced entries — it reads `log.reason`.

`backend/src/services/audit.service.ts` gained a `SENSITIVE_ACTIONS` registry (`entityType` → action names that must carry a reason) and `writeAuditLogRequired` now throws `AppError(400, 'REASON_REQUIRED', ...)` **before touching the database** when a registered action's reason is missing or blank:

```ts
const SENSITIVE_ACTIONS: Record<string, string[]> = {
  employee: ['STATUS_TRANSITION'],
  employee_access: ['UPDATE_ROLE'],
  attendance_correction: ['REJECT'],
};
```

Deliberately narrower than first planned — investigated each candidate before gating rather than guessing:
- `employee` `DELETE` was left **out**: it has no reason field anywhere in its request today and uses `writeAuditLogSafe` (best-effort, never throws by design) — gating it would need a frontend change first, not just a flag flip.
- `attendance_correction` `APPROVE` was left **out**: only `REJECT` genuinely needs justification; approving is self-explanatory, and neither previously collected a reason, so adding one only where the review requires it avoids inventing an unnecessary field.
- `staffAccounts.ts` was left out entirely: its actions (`CREATE`/`UPDATE`/`RESET_PASSWORD`) aren't specific enough to gate without product input on which changes actually need a reason.

`writeAuditLogSafe` was **not** modified to gate — its contract (never throws) is preserved.

Call sites now thread a real reason into the audit call instead of dropping it on the floor: `employees.ts` (`PUT /:id/access` — new required `reason` field; `STATUS_TRANSITION` already required one via Zod but it was silently discarded before), `corrections.ts` (`POST /:id/reject` — reason already required by Zod, now passed through). Frontend: `EmployeeLifecyclePanel.tsx` has a required "Alasan perubahan akses" input; `corrections/page.tsx`'s reject action now prompts for a reason via `window.prompt` before submitting.

### 3. Policy versioning + acknowledgement

New models:

```prisma
model PolicyVersion {
  id, policyId, version, title, content, publishedAt, publishedById, createdAt
  // one row per published revision of a CompanyPolicy
}
model PolicyAcknowledgement {
  id, policyVersionId, employeeId, acknowledgedAt
  @@unique([policyVersionId, employeeId])  // idempotent — re-acknowledging is a no-op, not an error
}
```

`backend/src/routes/policies.ts`:
- `POST /` creates the first `PolicyVersion` snapshot alongside the `CompanyPolicy`.
- `PATCH /:id` bumps `CompanyPolicy.version` (parse trailing numeric segment, increment — `bumpVersion()`) and inserts a new `PolicyVersion` row **only when `content` actually changes**; a title/category-only edit doesn't create a new version.
- `GET /:id/versions` — version history (`policies:*`).
- `POST /:id/acknowledge` — self-service, any authenticated employee, no special permission. Acknowledges the **latest** version via `upsert` on the unique constraint (idempotent).
- `GET /:id/acknowledgements` — who has/hasn't acknowledged the latest version, with a completion count (`policies:*`).

Existing `CompanyPolicy` rows got a backfilled `PolicyVersion` (their current `version`/`content`) as part of the migration, so version history isn't empty for policies that predate this feature.

`evidenceTimeline.service.ts` gained a 5th category, `'policy'`, sourced from `PolicyAcknowledgement` joined through `PolicyVersion` for the title/version.

`frontend/src/app/(app)/policies/page.tsx` — expanding a policy now shows an "Saya sudah membaca & memahami kebijakan ini" acknowledge button (any employee), plus a version-history list and per-version acknowledgement roster for admins.

### Tests

Suite grew **191 → 197**: `audit.service.test.ts` (+2: reason-required fail-fast, success paths), `evidenceTimeline.test.ts` (+1: policy category entry), `policyVersion.test.ts` (new: `bumpVersion` numeric/non-numeric cases, acknowledgement upsert idempotency).

## How to verify

```bash
cd backend && npm test            # expect 197 passing
npx tsc --noEmit                  # backend
cd ../frontend && npx tsc --noEmit
```

Manual: open `/audit`, confirm the entityType filter now returns rows for Payroll/Payslip/AttendanceImport. Edit a policy's content and confirm a new version appears in its history while the old content is still retrievable via `GET /:id/versions`. Acknowledge a policy twice as the same employee and confirm no error and no duplicate row. Try `PUT /employees/:id/access` without a `reason` and confirm a `400 REASON_REQUIRED`.

**Deploy note:** this phase ships 2 new migrations (`20260917100000_normalize_entity_type_casing`, `20260917110000_reason_and_policy_versioning`) — run `npm run db:migrate` on the VPS deploy step.
