# dnPeople — SLA & Support Policy

**UpdatedAt:** 19 Juli 2026  
**Status:** Draft operasional untuk soft launch  

## Channel

| Channel | Alamat / sistem | Catatan |
|---------|-----------------|--------|
| Support email | support@dnpeople.id | Harus dimonitor bisnis hours |
| Sales | sales@dnpeople.id | Demo & kontrak |
| Ticketing | Helpscout / Zendesk / Jira Service (pilih satu) | Email-to-ticket |

## SLA respons

| Severity | Definisi | Target respons | Target resolusi |
|----------|----------|----------------|-----------------|
| Critical | Outage, data loss, payslip/PII leak | < 1 jam | < 1 hari kerja |
| High | Fitur inti tidak jalan (login, payroll finalize, absensi) | < 4 jam bisnis | < 2 hari |
| Medium | Bug non-blocking, laporan salah format | < 24 jam bisnis | < 3 hari |
| Low | Pertanyaan, enhancement | < 48 jam bisnis | Best effort |

**Jam bisnis default:** Senin–Jumat 09:00–18:00 WIB (kecuali Enterprise on-call).

## Uptime target

- Soft launch: **99.5%** monthly  
- Public launch target: **99.9%** (setelah monitoring + HA)

## Escalation

1. L1 Support (ticket)  
2. L2 Engineering on-call  
3. Dozer (critical)

## Metrik yang dilacak

- First response time  
- Time to resolve  
- Ticket volume / customer / bulan (perkiraan 2–3)  
- CSAT / NPS post-resolusi  

## Out of scope support

- Customisasi kode di luar kontrak  
- Debugging jaringan customer / IdP pihak ketiga tanpa akses  
- Recovery data di luar RPO backup yang telah diverifikasi
