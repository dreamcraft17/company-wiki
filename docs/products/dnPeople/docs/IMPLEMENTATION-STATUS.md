# dnPeople — Implementation Status

> Terakhir diperbarui: **10 Juli 2026**  
> Referensi: PRD/SRS/SDD v3.0 di `company-wiki/docs/products/dnPeople/PRD/`

## Ringkasan

| MVP | Target | Status |
|-----|--------|--------|
| MVP 1 (Q3 2026) | Employee DB, org, attendance, leave, payroll, dashboard, RBAC, audit | **Done** |
| MVP 2 (Q4 2026) | Shift, OT, claim, loan, advanced attendance, docs, announcements, calendar, approvals, reports | **Done (core)** |
| MVP 3 | Recruitment, onboarding, performance, training | Not started |
| MVP 4 | Analytics, integrations, mobile, multi-company | Not started |

**Typecheck:** Backend ✅ · Frontend ✅ (Juli 10, 2026)

---

## MVP 1 — Modul

| Area | Status |
|------|--------|
| Auth JWT + RBAC + lockout | Done |
| Employee CRUD + tax info | Done |
| Org (dept/position/level/location) | Done |
| Attendance clock in/out | Done |
| Leave + permissions | Done |
| Payroll BPJS + PPh 21 | Done |
| Dashboard + basic reports + audit | Done |

---

## MVP 2 — Modul

| Fitur | Status | Catatan |
|-------|--------|---------|
| Shift management + assignment | Done | API + UI admin |
| Overtime request & approval | Done | Multiplier weekday/weekend/holiday; masuk payroll |
| Reimbursement / claim | Done | Approve → include payroll → PAID |
| Employee loan (kasbon) | Done | Cicilan auto-deduct saat finalize payroll |
| Advanced attendance (GPS/geofence) | Done | Validasi radius work location; method GPS/QR/SELFIE |
| Attendance correction workflow | Done | Approve menulis ulang attendance record |
| Document management | Done | Company docs + contract expiry reminder |
| Internal announcements | Done | Pin + priority |
| Employee engagement (survey) | Done | API create/publish/respond/results (UI minimal via API) |
| Advanced reports | Done | Turnover, overtime by dept, leave usage |
| Calendar HR | Done | Holidays, leave, shifts, birthdays, contracts |
| Approval workflow inbox | Done | Unified inbox + approval rules CRUD |
| National holiday calendar | Done | `/calendar/holidays` |

### Partial / next polish

| Item | Catatan |
|------|---------|
| Survey UI page | API ready; frontend page belum dedicated |
| File upload binary | URL-based (bukan multipart S3) |
| QR/selfie capture UI | Field API siap; kamera/QR scanner belum |
| Email notifications | Belum |
| Export Excel/PDF | Belum |

---

## API surface (MVP 2 baru)

```
/shifts, /shifts/assignments
/overtime
/corrections
/claims
/loans
/documents/company|employee|contracts/expiring
/announcements
/surveys
/calendar, /calendar/holidays
/approvals/inbox, /approvals/rules
/reports/turnover|overtime|leave-usage
```

## Frontend routes (MVP 2)

`/approvals` `/shifts` `/overtime` `/claims` `/loans` `/corrections` `/documents` `/announcements` `/calendar` `/reports`

---

## Cara verifikasi

```bash
cd dnpeople && docker compose up -d
cd backend && npx prisma db push && npm run db:seed && npm run dev
cd frontend && npm run dev
```

---

*Last Updated: July 10, 2026*
