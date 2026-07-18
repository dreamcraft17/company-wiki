# dnPeople — Checklist Kepatuhan UU PDP (ringkas)

**UpdatedAt:** 19 Juli 2026  
**Status:** Internal readiness checklist (bukan opini hukum formal)  

| # | Kontrol | Status kode / proses | Verifikasi ops |
|---|---------|----------------------|----------------|
| 1 | Dasar pemrosesan data karyawan jelas (kontrak / consent HR) | Proses customer | [ ] Legal review |
| 2 | Minimasi data — field sensitif dienkripsi (salary, NPWP, rekening) | AES-256-GCM di backend | [ ] Key di secret manager |
| 3 | Akses berbasis peran (HR tanpa payroll, Finance terbatas) | RBAC + row scope | [ ] UAT role matrix |
| 4 | Audit trail append-only + redaksi secret di log | Immutable audit + Sentry redact | [ ] Sample audit export |
| 5 | Unduhan file/payslip ber-auth + tercatat | `/files`, `PAYSLIP_DOWNLOAD` | [ ] Spot-check |
| 6 | Retensi & penghapusan — soft delete + prosedur offboarding | Soft delete model; playbook offboarding | [ ] Policy retensi tertulis |
| 7 | Transfer ke data pribadi (akses / koreksi) via HR workflow | Employee self + HR panel | [ ] Prosedur DSAR |
| 8 | Transfer lintas negara / subprocessors (S3, SMTP, IdP, Sentry) | Env-configurable | [ ] DPA vendor |
| 9 | Insiden keamanan — kontak + SLA critical | SLA-SUPPORT-POLICY | [ ] Tabletop drill |
| 10 | Password / sesi — hashing, lockout, reset 1 jam, cookie httpOnly | Implemented | [ ] Pen-test |

**Catatan:** Checklist ini melengkapi, tidak menggantikan, review counsel untuk pernyataan publik UU PDP.
