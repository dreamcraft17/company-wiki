# Security Guide (Customer-facing)

**UpdatedAt:** 19 Juli 2026  

## Password
Min 8 karakter; reset self-service TTL 1 jam.

## MFA
`/settings/mfa` — TOTP + QR.

## Session
httpOnly cookie `dnpeople_session`; logout membersihkan sesi.

## Files & payslips
Tidak ada public `/uploads`. Unduh via auth; signed payslip 24 jam.

## Audit
Perubahan sensitif tercatat; export audit di `/audit` (role sesuai).

## Incident
Lihat `SECURITY-INCIDENT-RESPONSE.md`. Laporkan ke support@dnpeople.id.
