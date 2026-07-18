# dnPeople — PRD v8.0
## Security & Stability Fixes (Berdasarkan Audit 18 Juli 2026)

**Versi:** 8.0  
**Owner:** Dozer (CEO + Tech Lead)  
**Tanggal:** 18 Juli 2026  
**Tujuan:** Mengatasi 3 P0 + 5 P1 + performance bugs dari audit  
**Status:** **Implemented** di codebase (18 Juli 2026) — lihat CHANGELOG / IMPLEMENTATION-STATUS

---

## Executive Summary

Audit tanggal 18 Juli 2026 menemukan **13 bug kritis + performance issues**:

| Sev | Jumlah | Impact |
|-----|--------|--------|
| **P0** | 3 | Payslip leak, API key elevation, payroll race condition |
| **P1** | 5 | UX & concurrency issues |
| **P2** | 5 | Technical debt |

**Status:** 3 P0 **HARUS DIPERBAIKI** sebelum MVP launch Q3 2026.

---

## Masalah & Solusi

### 🔴 P0-B01: Public `/uploads` Directory (Payslip Leak)

**Masalah:**
```
/uploads adalah express.static PUBLIC
Payslip tersimpan di /uploads/{companyId}/payslips/{filename}
Siapa saja bisa guess URL → akses payslip employee lain tanpa auth
```

**Contoh attack:**
```
GET /uploads/company_abc/payslips/emp_001_july.pdf
GET /uploads/company_abc/payslips/emp_002_july.pdf
GET /uploads/company_abc/payslips/emp_003_july.pdf
↓
Semua payslip terunduh tanpa login
```

**Solusi:**
```
✅ Hapus express.static("/uploads")
✅ Buat authenticated endpoint: GET /api/v1/payroll/:id/payslip.pdf
✅ Gunakan signed URL (AWS S3) atau in-memory PDF dengan auth check
✅ Log akses payslip (audit trail)
```

**Hasil Expected:**
- ✅ Payslip hanya accessible via API dengan JWT
- ✅ Setiap download di-log (siapa, kapan, payslip siapa)
- ✅ Concurrent downloads tidak bisa bypass auth

---

### 🔴 P0-B02: API Keys Always Escalate ke COMPANY_ADMIN

**Masalah:**
```
Backend punya kolom "scopes" untuk API key
Tapi auth middleware TIDAK check scopes
Semua API key = COMPANY_ADMIN access
```

**Contoh attack:**
```
API Key scope: ["attendance:read"]
Tapi bisa: GET /api/v1/payroll (read semua gaji)
         POST /api/v1/payroll/run (run payroll)
         DELETE /api/v1/employees/:id (hapus karyawan)
```

**Solusi:**
```
✅ Enforce scopes di auth middleware
✅ Per-route: define required scope
✅ API key = lowest privilege (default deny)
✅ Scope format: "resource:action" (attendance:read, payroll:write)
```

**Scope Examples:**
```
Attendance read:    ["attendance:read"]
Attendance write:   ["attendance:read", "attendance:write"]
Payroll read:       ["payroll:read"]
Employee read:      ["employee:read"]
Admin:              ["*"] (all scopes)
```

**Hasil Expected:**
- ✅ API key hanya bisa akses yang di-approve
- ✅ Principle of least privilege enforced
- ✅ Audit log track scope usage

---

### 🔴 P0-B03: Payroll Finalize Race Condition (Loan Double-Charge)

**Masalah:**
```
Dua request finalize payroll bersamaan:

Request A:                          Request B:
SELECT id FROM payroll              SELECT id FROM payroll
WHERE status = DRAFT
                                    WHERE status = DRAFT
UPDATE payroll SET status = FINALIZED
WHERE id = xyz
                                    UPDATE payroll SET status = FINALIZED
                                    WHERE id = xyz
                                    
SELECT * FROM loan_deduction        SELECT * FROM loan_deduction
WHERE payroll_id = xyz              WHERE payroll_id = xyz
INSERT loan_deduction (...)         INSERT loan_deduction (...)
INSERT loan_deduction (...)         ← DUPLIKAT! Sama dengan request A
```

**Hasil:**
- Loan dipotong 2x
- Employee gaji berkurang 2x
- Audit hanya catat 1x finalize

**Solusi:**
```
✅ Atomic transaction (semua or nothing)
✅ Lock draft payroll: UPDATE ... WHERE status = DRAFT FOR UPDATE
✅ Calculate all (OT, claims, loans, adjustments) dalam 1 transaction
✅ Idempotent: jika re-finalize, skip (check status dulu)
```

**Pseudocode:**
```
BEGIN TRANSACTION
  UPDATE payroll 
  SET status = 'PROCESSING' 
  WHERE id = ? AND status = 'DRAFT'
  
  IF rows_affected == 0:
    ROLLBACK + throw error "Already finalized"
  
  CALCULATE everything in this transaction:
    - OT deductions
    - Claims
    - Loan installments
    - Tax adjustments
  
  UPDATE payroll 
  SET status = 'FINALIZED', finalized_at = NOW()
  WHERE id = ?
  
COMMIT TRANSACTION
```

**Hasil Expected:**
- ✅ Loan tidak double-charge
- ✅ Finalize atomic (all or nothing)
- ✅ Idempotent (safe to retry)

---

### 🟠 P1-B04 & B05: Employee Tidak Bisa Akses Payslip & MFA

**Masalah:**
```
NavBar `/payroll` hanya untuk ADMIN
Employee tidak lihat "Slip Gaji" di menu
Employee tidak bisa setup MFA dari nav (hanya admin yang bisa)
```

**Solusi:**
```
✅ NavBar: Buat `/payroll/my` untuk EMPLOYEE
✅ NavBar: Tambah `/settings/mfa` untuk semua user
✅ Payslip UI: Employee bisa lihat slip sendiri
✅ MFA UI: Semua user bisa setup TOTP
```

**User Journey:**
```
Employee login:
  ↓
NavBar: "Slip Gaji" (new)
  ↓
Click → /payroll/my
  ↓
Lihat payslip bulan ini
  ↓
Download PDF
```

**Hasil Expected:**
- ✅ Employee self-serve payslip access
- ✅ Employee self-serve MFA setup
- ✅ Reduce support tickets

---

### 🟠 P1-B06 & B07: Attendance Import Race & Offline Sync Issues

**Masalah:**
```
Dua upload file attendance bersamaan:
- Dry-run check: OK, no duplicates
- Confirm A + Confirm B
- Kedua insert → duplicate!

Offline sync: upsert tanpa strong concurrency control
```

**Solusi:**
```
✅ Idempotent import: generate unique import token
✅ Resubmit dengan token sama = skip (tidak insert 2x)
✅ Offline sync: strong check pada clock-in time + employee
```

**Hasil Expected:**
- ✅ Attendance import idempotent
- ✅ Offline sync reliable
- ✅ No duplicate attendance records

---

### 🟠 P0-P01: Payroll N+1 Query (Performance)

**Masalah:**
```
Per-employee payroll run:

FOR EACH employee:
  SELECT overtime WHERE employeeId = ?
  SELECT claims WHERE employeeId = ?
  SELECT loans WHERE employeeId = ?
  SELECT adjustments WHERE employeeId = ?
  SELECT variables WHERE employeeId = ?
  ← 5 queries per employee!

100 employees = 500 queries!
```

**Solusi:**
```
✅ Batch query: SELECT OT WHERE employeeId IN (emp1, emp2, ..., emp100)
✅ Group results by employeeId in code
✅ Single loop: calculate per employee using pre-fetched data
```

**Expected:**
- 100 employees = 5 queries (bukan 500)
- Payroll run 10x lebih cepat

---

### 🟠 P1-P02: Unbounded Report Exports

**Masalah:**
```
Export payroll semua tahun:
- Query 5000 records
- Generate Excel 50MB
- Generate PDF 100MB
- Semua sync di HTTP request thread
- Timeout 30 detik → user frustrated
```

**Solusi:**
```
✅ Cap rows: max 1000 per export
✅ Background job: generate, send via email
✅ Stream file: untuk Excel/PDF besar
✅ User lihat status: "Generating..." → "Ready for download"
```

**Hasil Expected:**
- ✅ Exports tidak hang server
- ✅ Large files supported
- ✅ Better UX

---

### 🟠 P1-B08: File Upload Validation Lemah

**Masalah:**
```
Check: extension .xlsx OR mimetype application/vnd.*.spreadsheetml
Tapi attacker bisa:
- Upload .exe dengan mimetype .xlsx
- Upload .jpg dengan extension .xlsx
- No magic byte validation
```

**Solusi:**
```
✅ Check: Extension AND mimetype AND magic bytes
✅ Magic byte untuk Excel: 50 4D 4B (PK)
✅ Reject jika ada perbedaan
```

**Hasil Expected:**
- ✅ File validation robust
- ✅ No malware uploads
- ✅ Safe file storage

---

## Prioritas Perbaikan

```
HARUS (sebelum launch):
  1. P0-B01: Secure payslip download
  2. P0-B02: Enforce API key scopes
  3. P0-B03: Payroll finalize atomic
  4. P0-P01: Fix N+1 payroll queries
  5. P1-B04/B05: Employee nav fix
  6. P1-B06: Import idempotency

SEBAIKNYA (within 1 week):
  7. P1-P02: Report export limits
  8. P1-B08: File validation
  9. P2-B09: JWT security (localStorage)
  10. P2-P05: DB indexes

BISA NANTI (technical debt):
  11. P2-B10: Error UI consistency
  12. P2-B11: Email retry queue
  13. P2-R02: Remove unused Redis
```

---

## Success Criteria

```
✅ /uploads not accessible publicly
✅ API key scopes enforced per route
✅ Payroll finalize atomic (loan not double-charge)
✅ Employee can access own payslip
✅ Employee can setup MFA from nav
✅ Payroll run N queries, not N² 
✅ All P0 bugs fixed + tested
✅ Security review passed
✅ Can launch MVP safely
```

---

*Last Updated: 18 Juli 2026 | Owner: Dozer | Status: Siap untuk SRS*
