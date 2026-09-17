---
owner: Dozer
status: review-required
canonical: false
last_reviewed: 2026-09-17
review_cadence: quarterly
---

# dnPeople — Evidence Timeline Implementation (P0 Exception & Evidence Layer, Phase 1)

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

## Not done this phase

Flagged as follow-up, not silently skipped:

- **Policy versioning + acknowledgement.** `CompanyPolicy` (schema.prisma) has only a free-text `version` string — edits overwrite content in place with no history, and there is no acknowledgement-per-employee model anywhere in the schema. This needs new Prisma models and a migration; it's the other half of the same P0 item and the natural next slice of this feature.
- **Cross-cutting "reason required" enforcement.** Today it's ad hoc per-route Zod `.min()` validation (`corrections.ts`, `acceptances.ts`, `employees.ts`, `admin.ts`, `talentMatrix.ts`, `payments.ts`) — no shared mechanism guarantees a sensitive mutation always requires a reason.
- **`entityType` naming normalization.** ~15 call sites write inconsistent casing/naming to `AuditLog` (e.g. lowercase `employee` vs. capitalized `Payroll`, `attendance_correction` vs. `Payslip`). Cosmetic tech debt today because the aggregation service already knows each exact string, but it will bite the next person adding a new audited entity.

## How to verify

```bash
cd backend && npm test            # expect 191 passing
npx tsc --noEmit                  # backend
cd ../frontend && npx tsc --noEmit
```

Manual: open `/audit`, click any row — a before/after diff should expand below it. Open any employee's lifecycle panel from `/employees`, scroll to **"Riwayat & Bukti"** — an employee with at least one attendance correction and one profile edit should show both, merged chronologically with the correction showing one entry (not a duplicate for its approval).
