# dnPeople — Current Implementation Snapshot

**Date:** July 10, 2026  
**Repo:** `dnpeople`  
**Version:** 0.2.0 (MVP 1 + MVP 2)

---

## MVP 1 — live

Auth, employees, org, attendance, leave, permissions, payroll (BPJS/PPh 21), dashboard, reports dasar, audit.

## MVP 2 — live

| Module | Backend | Frontend |
|--------|---------|----------|
| Shifts | ✅ | ✅ `/shifts` |
| Overtime | ✅ (+ payroll) | ✅ `/overtime` |
| Claims | ✅ (+ payroll) | ✅ `/claims` |
| Loans | ✅ (+ payroll deduct) | ✅ `/loans` |
| Geofence attendance | ✅ | partial (API fields) |
| Attendance correction | ✅ | ✅ `/corrections` |
| Documents + contract expiry | ✅ | ✅ `/documents` |
| Announcements | ✅ | ✅ `/announcements` |
| Surveys | ✅ API | API only |
| Calendar + holidays | ✅ | ✅ `/calendar` |
| Approval inbox | ✅ | ✅ `/approvals` |
| Advanced reports | ✅ | ✅ `/reports` |

## Stack

Next.js 16 · Express 5 · Prisma · PostgreSQL (`:5433`) · API `:4100` · Web `:3001`

## Demo

- `admin@dnpeople.id` / `Admin123!`
- `budi@dnpeople.id` / `Employee123!`

## Sync docs

```bash
cp dnpeople/docs/*.md company-wiki/docs/products/dnPeople/docs/
cp dnpeople/README.md company-wiki/docs/products/dnPeople/README.md
```

---

*Last Updated: July 10, 2026*
