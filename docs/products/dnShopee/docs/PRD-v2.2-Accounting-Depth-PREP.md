# dnShop Finance — Persiapan PRD v2.2 (Accounting Depth)

| | |
|---|---|
| **Dokumen** | Briefing kerja untuk menulis PRD / SRS / SDD **v2.2** |
| **Tanggal** | 10 Agustus 2026 |
| **Status** | **IMPLEMENTED** — lihat [`prd/v2.2/`](../PRD/v2.2/) · [`V22-PRODUCTION-CHECKLIST.md`](./V22-PRODUCTION-CHECKLIST.md) · commit `6b27974`+ |
| **Owner** | Dozer (CEO + Tech Lead) · DN Tech |
| **Baseline produk** | v1.0 + v2.0 Pembukuan + UI2 + SOPI v2.1 (kode shipped) |
| **Prod** | `https://shop.dntech.id` · `https://api.shop.dntech.id` |
| **Brief lama** | [`NEXT-PRD-BRIEF.md`](./NEXT-PRD-BRIEF.md) — kini mengarah ke **v3.0**; dokumen ini = arsip constraint v2.2 |

---

## 0. Batas keras (baca dulu)

### Arti “tidak menyentuh” di dokumen ini

**Bukan** larangan pakai data hasil sync Shopee.  
**Artinya:** kerja v2.2 **tidak boleh mengganggu** jalur Shopee OpenAPI official yang sudah ada (OAuth, cron order/income, webhook, token refresh, partner env).

| Boleh | Jangan |
|-------|--------|
| Baca orders / inventory / journal yang **sudah** di DB (dari mock **atau** live sync) | Rewrite / pecah kontrak `shopee-client`, webhook HMAC, OAuth callback |
| Trigger COGS / laporan dari event internal setelah data tersimpan | Ubah payload/signature webhook atau rate-limit partner demi fitur accounting |
| Fitur jalan di demo/mock **dan** toko live (kalau partner sudah aktif) | Buat fitur accounting yang **merusak** sync existing saat di-deploy |
| Tambah job/modul **baru** di samping pipeline Shopee | “Sekalian bersihin” OAuth / partner cutover di epic accounting |

### Wajib

- Fokus PRD v2.2 = **kedalaman akuntansi & laporan seller**.
- Regresi wajib: seed demo + mock sync **tetap hijau**; path live sync (jika env partner terisi) **tidak regress**.
- Setiap story: jika menyentuh file di jalur Shopee, alasan harus “consume data / hook non-breaking”, bukan “ganti integrasi”.

### Di luar fokus produk v2.2 (jalur terpisah)

| Item | Alasan |
|------|--------|
| Remedi partner profile / trial seller / proof PDF | Ops → [`sopi/…remediation-plan…`](../sopi/dnshop-shopee-partner-remediation-plan-id.md) |
| Rework besar OAuth / webhook / credential | Bukan accounting depth; risiko ganggu OpenAPI |
| Multi-marketplace (Tokopedia, dll.) | → v3.0 |
| Mobile app / white-label firm accounting | Out of product focus |

> **Satu kalimat:** v2.2 = **olah data toko jadi laporan & HPP lebih dalam**, tanpa **merusak atau mengganggu** integrasi Shopee OpenAPI yang sudah jalan.

---

## 1. Kenapa v2.2 sekarang?

| Fakta (10 Agu 2026) | Implikasi |
|---------------------|-----------|
| Stack go-live + pembukuan dasar **sudah di repo & prod** | Jangan ulangi OAuth / cron / webhook sebagai “fitur baru” |
| Partner live masih conditional (`partner_configured` bisa false) | Accounting **tidak boleh** bergantung wajib ke partner live; tapi **juga** tidak boleh rusak kalau live nanti aktif |
| Seller sudah punya CoA, journal, P&L, BS, audit | Gap: **arus kas, HPP, ekspor akuntansi, e-Faktur dari jurnal** |
| Differentiator = pembukuan bonus seller | Vertikal accounting kasih value tanpa tunggu / tanpa ganggu partner track |

---

## 2. Outcome yang harus dijanjikan PRD

Seller dengan pembukuan aktif dapat:

1. **Laporan Arus Kas** (indirect) dari journal yang sudah *posted*
2. **HPP / COGS otomatis** dari pergerakan stok + order delivered
3. **Ekspor / mapping** ke MYOB · Jurnal · Accurate (minimal CSV + CoA map)
4. **e-Faktur XML** dari **journal posted** (extend tax module)
5. Semua itu **kompatibel** dengan toko demo/mock **dan** toko yang sync dari OpenAPI (tanpa mengubah kontrak API Shopee)

**Bukan outcome v2.2:** rewrite integrasi Shopee / partner cutover sebagai epic utama.

---

## 3. Baseline yang sudah ada (jangan di-rebuild)

Pakai sebagai fondasi; jangan tulis ulang sebagai epic baru.

| Area | Status | Dipakai v2.2 untuk… |
|------|--------|---------------------|
| Journal CRUD + post/reverse + audit | Done | Sumber Cash Flow & e-Faktur |
| CoA SAK EMKM | Done | Mapping COGS + export accounting |
| P&L / Trial Balance / Balance Sheet | Done | Konsistensi laporan baru |
| Inventory + stock movements | Done | Input COGS |
| Orders / payments / settlements (DB) | Done | Trigger COGS / konteks laporan |
| Shopee sync / webhook / OAuth (existing) | Done | **Sumber data** — treat as black box stabil |
| Tax module + e-Faktur XML (v1) | Done | Extend → dari journal posted |
| Demo shop + seed | Done | UAT tanpa ganggu path live |
| Tier Free / Starter | Done | Gate fitur lanjutan jika perlu |
| UI2 ops desk | Done | Surface laporan baru di `/journal/*` & `/reports` |

Detail: [`STATUS.md`](./STATUS.md) · [`FEATURE-CATALOG.md`](./FEATURE-CATALOG.md) · [`CURRENT-IMPLEMENTATION.md`](./CURRENT-IMPLEMENTATION.md).

---

## 4. In scope — epics untuk dipecah di PRD

### E1 — Cash Flow Statement (P0)

| | |
|---|---|
| **Apa** | Laporan arus kas metode **indirect** per toko, periode custom |
| **Sumber** | Posted journal entries + klasifikasi akun (operating / investing / financing) |
| **UI** | `/journal/cf` (atau setara) + export CSV/PDF |
| **API (internal dnShop)** | `GET /shops/:shopId/journals/cash-flow?date_from=&date_to=` |
| **AC singkat** | Given toko punya ≥N entri posted, When user buka periode, Then operating/investing/financing + ending cash match rekonsil bank (toleransi di PRD) |
| **Non-gangguan** | Tidak memanggil / mengubah endpoint Shopee; hanya baca journal internal |

### E2 — COGS / HPP dari inventori (P0)

| | |
|---|---|
| **Apa** | Auto-journal HPP saat order *delivered* / settle (aturan bisnis di PRD) |
| **Metode** | Mulai **average cost** (FIFO = opsi P1 jika perlu) |
| **Akun** | Debit HPP (5xxx) · Credit Persediaan (1xxx) — mapping dari CoA toko |
| **Idempotensi** | 1 order → maks 1 COGS entry (atau reverse+repost terkontrol) |
| **AC singkat** | Given order delivered + stok punya cost, When job/hook COGS jalan, Then P&L punya HPP dan journal seimbang |
| **Non-gangguan** | Hook setelah data order **sudah** di DB; jangan ubah response/shape sync Shopee. Boleh subscribe event internal (`order_updated`, sync complete) tanpa mengubah publisher Shopee |

### E3 — Export ke software akuntansi (P1)

| | |
|---|---|
| **Apa** | Mapping CoA dnShop → kode akun eksternal + unduh CSV/XLSX siap import |
| **Target awal** | Accurate · Jurnal (Mekari) · MYOB (urutan prioritas di PRD) |
| **Minimal** | Template mapping per toko + export journal lines + opening TB |
| **Opsional P1.5** | Upload API pihak ketiga (Accurate/Jurnal) — terpisah dari Shopee |
| **AC singkat** | Given mapping tersimpan, When export periode X, Then file valid di-import (checklist UAT) |

### E4 — e-Faktur dari journal posted (P1)

| | |
|---|---|
| **Apa** | Generate XML e-Faktur dari PPN yang sudah di journal posted |
| **Extend** | Modul tax v1 yang sudah ada |
| **AC singkat** | Given PPN journal posted, When generate XML, Then lolos schema DJP (versi di-lock di PRD) |

### E5 — UX & help pembukuan lanjutan (P2)

| | |
|---|---|
| **Apa** | Empty states, copy seller-friendly, checklist tutup buku |
| **Bukan** | Redesign shell UI2 / panel Shopee connect |

---

## 5. Out of scope (eksplisit di PRD)

- Rework / breaking change pada OAuth, webhook, cron sync, token refresh Shopee
- Remedi profil partner / trial seller / proof PDF (ops terpisah)
- Tokopedia / Lazada / TikTok Shop
- Payroll, aset tetap kompleks, konsolidasi multi-entity
- Mobile native
- Redesign onboarding / email / tier v2.1 sebagai epic utama

---

## 6. Model data & isolasi dari OpenAPI

```
  [ Shopee OpenAPI — existing, jangan diganggu ]
           │  OAuth / cron / webhook (as-is)
           ▼
  [ DB dnShop: orders, inventory, journals, … ]
           │  baca / hook internal saja
           ▼
  [ v2.2: Cash Flow · COGS · Export · e-Faktur ]
```

**Aturan produk:**

1. Fitur v2.2 **feature-complete** di demo/mock.
2. Fitur v2.2 **tetap benar** jika toko sync live (data masuk lewat pipeline existing).
3. Deploy v2.2 **tidak** boleh merusak `POST /webhooks/shopee`, OAuth callback, atau sync cron.

---

## 7. NFR yang harus masuk PRD

| Area | Target usulan (kunci di PRD) |
|------|------------------------------|
| Latency Cash Flow / COGS report | p95 &lt; 3s untuk toko ≤5k journal lines / periode |
| Akurasi COGS | Debit=credit 100%; cost basis terdokumentasi |
| Isolasi toko | Query by `shopId` + RBAC `journal` / `reports` |
| Audit | Auto-COGS & export masuk audit log |
| Idempotensi | Job COGS & export aman di-retry |
| Non-regression Shopee | Smoke: health, webhook path, sync mock/live setelah deploy |
| Deploy | Tanpa Docker; update `DEPLOY-VPS.md` jika ada migration |

---

## 8. Success metrics (usulan — finalisasi di PRD)

| Metric | Target kasar | Window |
|--------|--------------|--------|
| Toko generate Cash Flow ≥1×/bulan | ≥40% toko dengan ≥20 journal posted/bln | +8 minggu |
| Order delivered punya COGS journal | ≥80% | +8 minggu |
| Export Accurate/Jurnal sukses (UAT) | ≥10 toko uji | +12 minggu |
| Regresi demo/mock | 100% seed path hijau | Setiap release |
| Regresi jalur Shopee existing | Smoke sync/webhook lulus | Setiap release |

---

## 9. Risiko & mitigasi

| Risiko | Mitigasi |
|--------|----------|
| COGS salah → laba menyesatkan | Default average; flag estimasi; reverse; UAT seed known-cost |
| Mapping CoA ≠ Accurate/Jurnal | Template + custom map; jangan janji sync 2-arah di v2.2 |
| e-Faktur schema DJP berubah | Pin versi schema; adapter layer |
| Accidental breaking change di modul Shopee | Code review gate: diff di `shopee-*` / webhook harus justified + smoke test |
| Performa laporan besar | Snapshot / async job (pola reports existing) |

---

## 10. Outline dokumen formal (setelah brief ini di-sign-off)

1. **PRD v2.2** — problem, goals, E1–E5, metrics, in/out + **non-gangguan OpenAPI** (§0)
2. **SRS v2.2** — AC Given/When/Then per epic
3. **SDD v2.2** — schema COGS/cash-flow, jobs, export formats; diagram batas modul Shopee
4. Update **STATUS.md** / **FEATURE-CATALOG.md** setelah ship

Checklist story:

| # | Pertanyaan |
|---|------------|
| 1 | AC testable di demo/mock? |
| 2 | Tetap benar jika data berasal dari sync live? |
| 3 | Diff tidak merusak OAuth / webhook / cron Shopee? |
| 4 | RBAC + isolasi `shopId`? |
| 5 | Audit trail mutasi finansial? |
| 6 | Failure path + retry/idempotent? |
| 7 | Migration + seed + smoke Shopee path? |

---

## 11. Jalur terpisah (jangan campur ke epic accounting)

| Jalur | Dokumen / aksi |
|-------|----------------|
| Partner verification | `sopi/dnshop-shopee-partner-remediation-plan-id.md` |
| Isi `SHOPEE_PARTNER_ID` / key di prod | Ops `.env` + pm2 — tidak diblokir v2.2, tapi **bukan** story PRD accounting |
| Hardening OpenAPI setelah partner approve | PRD terpisah (mis. v2.3) bila perlu |
| Multi-marketplace | **v3.0** |

---

## 12. Definisi “siap tulis PRD”

- [ ] Owner setuju fokus **Accounting Depth** + aturan **non-gangguan** OpenAPI (§0)
- [ ] Prioritas E1–E5 dikunci (P0/P1/P2)
- [ ] Metode COGS awal (average vs FIFO) diputuskan
- [ ] Software akuntansi prioritas #1 dipilih (Accurate / Jurnal / MYOB)
- [ ] Metric §8 diedit jadi angka final
- [ ] File PRD formal dibuat di `prd/` (disarankan `prd/v2.2/`)

---

## 13. Satu kalimat penutup

> **PRD v2.2** memperdalam pembukuan (arus kas, HPP, ekspor akuntansi, e-Faktur) di atas data toko yang sudah ada — **tanpa mengganggu** jalur Shopee OpenAPI official yang sudah berjalan.
