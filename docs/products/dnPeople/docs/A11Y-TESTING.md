# dnPeople — Accessibility Testing (WCAG 2.2 AA)

**Target:** WCAG 2.2 Level AA (practical default for Indonesia + EU EAA alignment)  
**Updated:** 21 Agustus 2026  
**App:** https://hris.dntech.id · marketing + auth shell

> Automated axe scans catch ~30–40% of issues. Pair with keyboard + screen reader passes before major releases.

---

## 1. Automated tests (CI)

| Suite | Path | What it checks |
|-------|------|----------------|
| Public pages axe | `frontend/e2e/tests/a11y/public-pages.spec.ts` | 9 halaman publik — WCAG 2.2 AA tags |
| Keyboard & landmarks | `frontend/e2e/tests/a11y/keyboard.spec.ts` | `lang=id`, skip link, `<main>`, login labels |
| Interactive states | `frontend/e2e/tests/a11y/interactive-states.spec.ts` | Dropdown `aria-expanded`, mobile nav + axe |

**CI:** `.github/workflows/a11y.yml` — runs on push/PR to `main`.

### Run locally

```bash
cd dnpeople/frontend
npm ci
npx playwright install --with-deps chromium
npm run build
CI=true npm run test:a11y
```

Dev server mode (hot reload):

```bash
# terminal 1
npm run dev

# terminal 2
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:a11y
```

UI mode:

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:a11y:ui
```

Reports: `frontend/playwright-report/` after a run.

---

## 2. Halaman yang di-scan (public)

| Halaman | Path |
|---------|------|
| Landing | `/welcome` |
| Login | `/login` |
| Signup | `/signup` |
| Pricing | `/pricing` |
| FAQ | `/faq` |
| Contact | `/contact` |
| Demo | `/demo` |
| Privacy | `/legal/privacy` |
| Terms | `/legal/terms` |

**Belum di-automate (butuh login):** `/dashboard`, `/billing`, `/admin/*` — tambahkan di fase 2 dengan fixture auth.

---

## 3. Perbaikan a11y yang sudah ada di repo

| Item | WCAG | Implementasi |
|------|------|--------------|
| Bahasa halaman | 3.1.1 | `<html lang="id">` di root layout |
| Skip link | 2.4.1 | `SkipToMain` → `#main-content` |
| Main landmark | 1.3.1 | `id="main-content" tabIndex={-1}` di Marketing/App/Admin shell + login |
| Login labels | 1.3.1 / 3.3.2 | `htmlFor` + `id` pada email/password/MFA |
| Login heading | 1.3.1 | `<h1>Masuk</h1>` |
| Fitur dropdown Escape | 2.1.1 | `keydown` Escape menutup menu Fitur |

---

## 4. Manual checklist (setiap release mayor)

### Keyboard

- [ ] Tab order logis di `/login`, `/welcome`, `/dashboard`
- [ ] Focus ring terlihat (jangan `outline: none` tanpa pengganti)
- [ ] Escape menutup modal/dropdown; fokus kembali ke trigger
- [ ] Form signup + billing bisa diisi keyboard saja

### Screen reader (spot-check)

| AT | OS | Prioritas halaman |
|----|-----|-------------------|
| VoiceOver | macOS Safari | Login, dashboard, billing |
| NVDA | Windows | Payroll, employees |

- [ ] Judul halaman diumumkan saat navigasi
- [ ] Heading outline tidak loncat level
- [ ] Error form terhubung ke input (`aria-describedby` / `role="alert"`)

### WCAG 2.2 — belum di-cover axe penuh

Manual verify:

- [ ] **2.4.11 Focus not obscured** — sticky header tidak menutupi fokus
- [ ] **2.5.7 Dragging movements** — ada alternatif keyboard jika ada drag UI
- [ ] **2.5.8 Target size** — tombol icon min ~24×24px (mobile nav sudah `min-h-11`)

---

## 5. Menambah halaman ke scan

Edit `frontend/e2e/helpers/a11y.ts` → array `PUBLIC_A11Y_PAGES`, atau buat spec baru untuk authenticated routes:

```typescript
test('dashboard axe (authenticated)', async ({ page }, testInfo) => {
  await page.goto('/login');
  // ... login fixture ...
  await page.goto('/dashboard');
  await checkAccessibility(page, testInfo);
});
```

---

## 6. Suppress rule (hati-hati)

Hanya dengan justifikasi + issue tracker:

```typescript
await checkAccessibility(page, testInfo, {
  exclude: ['#third-party-widget'],
  disableRules: ['frame-title'], // PROJ-xxx: iframe chat pihak ketiga
});
```

---

## 7. Related

- Helper: `frontend/e2e/helpers/a11y.ts`
- Config: `frontend/playwright.config.ts`
- Error telemetry redaction: `backend/src/instrumentation.ts`
- CI utama: `.github/workflows/ci.yml`
