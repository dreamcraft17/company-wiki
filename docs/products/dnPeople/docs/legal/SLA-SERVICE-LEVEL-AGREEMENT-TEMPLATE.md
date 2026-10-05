---
owner: Dozer
status: draft
canonical: false
last_reviewed: 2026-10-05
review_cadence: annual
document_type: customer-contract-attachment
---

# dnPeople HRIS — Service Level Agreement (SLA)

> **Author:** Dozer  
> **Date:** 2026-10-05  
> **Purpose:** Lampiran kontrak / MSA pelanggan berbayar (Starter, Professional, Enterprise). Bukan nasihat hukum.

## Dokumen terkait

| Dokumen | Peran |
|---------|--------|
| [SLA-SUPPORT-POLICY.md](../SLA-SUPPORT-POLICY.md) | Channel support & severity operasional internal |
| [SLA-COMMITMENT-RPO-RTO.md](../SLA-COMMITMENT-RPO-RTO.md) | Komitmen teknik kanonik (RPO/RTO, evidence) |
| [TERMS-OF-SERVICE.md](./TERMS-OF-SERVICE.md) | Syarat layanan induk |
| [SLO.md](../SLO.md) | Target observability engineering |

**Sebelum tanda tangan:** selaraskan angka uptime, backup window, dan response time dengan commitment internal + kapasitas ops aktual. Jika kontrak menetapkan tier berbeda, tier kontrak yang menang untuk pelanggan tersebut.

---

## 1. AVAILABILITY & UPTIME

**Target: 99.5% uptime/bulan** (maksimal 3.6 jam downtime terukur)

- Periode pengukuran: Mon–Fri 08:00–18:00 WIB (jam kerja bisnis)
- Scheduled maintenance: maksimal 4 jam/bulan, jadwal dikirim 5 hari sebelumnya
- Emergency maintenance: tidak terhitung dalam SLA

**Tier diferensiasi:**
- **Starter**: 99.0% uptime (8.7 jam/bulan)
- **Professional**: 99.5% uptime (3.6 jam/bulan)
- **Enterprise**: 99.9% uptime (0.7 jam/bulan)

---

## 2. SUPPORT RESPONSE TIME

| Severity | Response Time | Resolution Target | Jam Operasi |
|----------|--------------|------------------|------------|
| Critical (Payroll tidak bisa running, akses login down) | < 30 menit | 4 jam | 24/7 (Enterprise only) |
| High (Fitur utama error, data inconsistency) | < 2 jam | 8 jam | 08:00–18:00 WIB |
| Medium (Fitur sekunder, UI glitch) | < 8 jam | 24 jam | 08:00–18:00 WIB |
| Low (Enhancement request, minor documentation) | < 24 jam | 72 jam | Jam kerja |

**Channel:** info@dntech.id · sales@dntech.id (kontrak) — detail di [SLA-SUPPORT-POLICY.md](../SLA-SUPPORT-POLICY.md).

---

## 3. PERFORMANCE BASELINE

- **Dashboard load time**: < 3 detik (P95)
- **API response time**: < 500ms (P95) — engineering baseline internal juga memantau P95 < 1s ([SLA-COMMITMENT-RPO-RTO.md](../SLA-COMMITMENT-RPO-RTO.md))
- **Bulk operations** (import 1000+ data): < 5 menit
- **Report generation**: < 2 menit untuk dataset 10k+ records
- **Database query**: < 2 detik (P99)

---

## 4. DATA INTEGRITY & BACKUP

- **Automated backups**: Harian (window operasional saat ini **02:00 UTC** — lihat [SLA-COMMITMENT-RPO-RTO.md](../SLA-COMMITMENT-RPO-RTO.md) dan [RESTORE-DRILL-RUNBOOK.md](../RESTORE-DRILL-RUNBOOK.md))
- **Backup retention**: Minimum 30 hari (GCP/Backblaze)
- **Disaster recovery RTO**: < 4 jam
- **Disaster recovery RPO**: < 1 jam data loss
- **Data export capability**: User bisa export data kapan saja (bulk payroll, employee records)

---

## 5. SECURITY & COMPLIANCE

- **SSL/TLS encryption**: Semua traffic
- **Password policy enforcement**: Minimum 8 char, complexity rules
- **2FA support**: Available untuk admin accounts
- **Audit logging**: Semua transaksi payroll, access logs, data changes (90 hari retention)
- **Penetration testing**: Minimal 1x/tahun
- **Compliance**: GDPR-ready, ready untuk regulation lokal Indonesia

---

## 6. AVAILABILITY MONITORING

- **Uptime status page**: public.dntech.id/status (real-time)
- **Monthly SLA report**: Dikirim hari 1 bulan berikutnya
- **Incident notification**: Email + SMS untuk incidents > 30 menit
- **RCA (Root Cause Analysis)**: Disediakan untuk setiap Critical incident

---

## 7. CREDIT/REMEDY

Jika SLA tidak tercapai:

| Uptime Achievement | Service Credit |
|--------------------|-----------------|
| 99.0–99.49% | 5% monthly fee |
| 98.0–98.99% | 10% monthly fee |
| < 98.0% | 25% monthly fee + review gratis |

**Claim deadline**: 7 hari setelah periode berakhir  
**Max credit/tahun**: 50% dari annual subscription

---

## 8. EXCLUSIONS (TIDAK TERMASUK SLA)

- Downtime akibat customer's infrastructure (network, ISP, corporate firewall)
- Data loss akibat customer tidak melakukan backup manual
- Issues akibat customer menggunakan unsupported browser/devices
- Downtime akibat force majeure (bencana alam, cyber attack terhadap 3rd party)
- Scheduled maintenance (notified sebelumnya)

---

## 9. IMPLEMENTATION NOTES

- **Untuk Starter/Professional**: Monitor via Uptime Robot + Google Analytics
- **Untuk Enterprise**: Custom monitoring + dedicated slack channel + weekly business review
- **Eskalasi**: Support Tier 1 → Tier 2 (development) → Tech Lead (critical only)
- **SLA review**: Quarterly dengan customer, adjustable per kebutuhan

---

## 10. OPTIONAL ADD-ONS

- **24/7 Premium Support**: +Rp 2M/tahun (response < 15 min)
- **Dedicated Account Manager**: +Rp 5M/tahun (advisory + quarterly planning)
- **Custom Report SLA**: +Rp 1M/bulan (custom reports < 48 jam development)
