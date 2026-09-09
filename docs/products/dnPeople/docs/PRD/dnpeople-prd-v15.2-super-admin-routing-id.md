# dnPeople SUPER_ADMIN Landing & Admin Console Routing
## Product Requirements Document (PRD) v15.2

**Bahasa:** Bahasa Indonesia  
**Mata Uang:** IDR (Rp)  
**Tanggal:** 10 Agustus 2026  
**Status:** Enhancement Ready  
**Owner:** PT. Dozer Napitupulu Technology (DN Tech)  
**Module:** Admin Console v15.2 (Admin-First Landing)  

---

## 1. Ringkasan Eksekutif

**Problem:** DN Tech staff (SUPER_ADMIN) login ke `hris.dntech.id` → land di customer dashboard by default → perlu klik submenu "admin-console" untuk akses vendor operations. UX tidak optimal untuk vendor ops.

**Solusi:** Implement **role-based redirect** + **admin-first landing** — SUPER_ADMIN login → straight to `/admin` (vendor console). COMPANY_ADMIN + EMPLOYEE → `/dashboard` (customer console). Clear separation of concerns.

**Impact:**
- ✅ DN Tech staff faster to vendor operations (0 extra clicks)
- ✅ Clear workspace isolation (vendor ≠ customer)
- ✅ Better access control (prevent customer admins from admin console)
- ✅ Professional UX for vendor ops

**Timeline:** 1 minggu (Aug 10-17, 2026)  
**Go-live target:** Aug 18, 2026 (before v16.0 start)

---

## 2. Objectives & Scope

### 2.1 Tujuan

✅ **SUPER_ADMIN redirect** — Auto-route to `/admin` on login  
✅ **Admin-first landing** — Admin console as primary for vendor staff (not secondary feature)  
✅ **Role isolation** — SUPER_ADMIN workspace separate from customer workspace  
✅ **Access control** — Only SUPER_ADMIN can access `/admin`; customer admins blocked  
✅ **First-login setup** — Optional: onboard new DN Tech staff to admin console  
✅ **Clear navigation** — Admin sidebar + customer sidebar (different layouts)  

### 2.2 Scope v15.2

✅ **Role detection** — Identify SUPER_ADMIN at login time  
✅ **Auto-redirect logic** — Route based on role (backend + frontend)  
✅ **Access control enforcement** — 401/403 for unauthorized access  
✅ **Admin layout improvements** — Header, sidebar, workspace context  
✅ **First-login flow** (optional) — Welcome admin to vendor console  
✅ **Route guards** — Protect `/admin/*` routes  
✅ **Mobile responsive** — Admin layout on small screens  

❌ Out-of-Scope v15.2
❌ New admin features (covered in v15.0 + v16.0)  
❌ SSO vendor-specific config  
❌ Admin role levels (Super / Regular / Limited) — single SUPER_ADMIN for MVP  
❌ Workspace switching across organizations  

---

## 3. User Personas

### 3.1 SUPER_ADMIN (DN Tech Vendor Staff)

**Workflow:**
1. Navigate to `hris.dntech.id`
2. Login with DN Tech email (e.g., dozer@dntech.id)
3. **Auto-redirect to `/admin`** (no extra clicks)
4. See admin dashboard with: company directory, KPIs, operations tools
5. Can impersonate customer, manage billing, view audit logs
6. Cannot access `/dashboard` (customer view)

**Needs:**
- ✅ Straight-to-admin UX
- ✅ Clear "Vendor Console" branding (not customer view)
- ✅ Quick access to operations (customers, billing, support)

### 3.2 COMPANY_ADMIN (Customer Org Lead)

**Workflow:**
1. Navigate to `hris.dntech.id`
2. Login with customer email (e.g., admin@customer.com)
3. Land on `/dashboard` (customer view)
4. Cannot access `/admin` (403 Forbidden)

**Needs:**
- ✅ Blocked from vendor console (no accidental exposure)
- ✅ Normal customer experience (no confusion)

### 3.3 Employee / Manager

Same as COMPANY_ADMIN (routed to `/dashboard`)

---

## 4. Technical Requirements

### 4.1 Role-Based Redirect

**At Login (Backend)**
```
POST /auth/login
  email, password
  ↓
  Validate credentials
  ↓
  Check role in JWT/DB:
    - IF role = SUPER_ADMIN → include flag isAdmin: true
    - ELSE → include flag isAdmin: false
  ↓
  Return JWT + { user: { role, isAdmin, companyId } }
```

**At Frontend Route (Next.js)**
```
Middleware / Layout check:
  - IF auth.isAdmin === true → redirect /admin
  - ELSE IF auth.role in [COMPANY_ADMIN, HR, MANAGER, EMPLOYEE] 
    → redirect /dashboard
  - ELSE → redirect /login
```

### 4.2 Access Control Enforcement

**API Level:**
```
GET /api/v1/admin/* routes
  Middleware: @Auth('SUPER_ADMIN')
  → if role !== SUPER_ADMIN → 403 Forbidden
```

**Frontend Level:**
```
Route guards on:
  - /admin (and all /admin/*)
  - Only accessible if auth.isAdmin === true
  - Redirect to /dashboard otherwise
```

### 4.3 Layout Separation

**Admin Layout** (`/admin`)
- Header: "dnPeople Vendor Control Panel" (not "Dashboard")
- Sidebar: Company Directory, Billing, Support, Audit, Health, etc.
- Footer: Vendor-specific info
- Workspace indicator: "Vendor Console"

**Customer Layout** (`/dashboard`)
- Header: "dnPeople Dashboard"
- Sidebar: Employee, Payroll, Talent, Organization, etc.
- Footer: Customer info
- Workspace indicator: "Company ABC"

**Never mix:** Customer user cannot see admin layout

---

## 5. Detailed Workflows

### 5.1 Login → Redirect → Admin

```
1. User navigates to hris.dntech.id
2. Redirected to /login (if not authenticated)
3. User enters email + password
4. Backend validates:
   - Email: dozer@dntech.id
   - Password: ✓
   - Role query: SELECT role FROM users WHERE email = ?
   - Result: role = "SUPER_ADMIN"
5. Backend returns JWT:
   {
     token: "eyJhbGc...",
     user: {
       id: "admin-001",
       email: "dozer@dntech.id",
       name: "Dozer Fernando",
       role: "SUPER_ADMIN",
       companyId: "dntech",
       isAdmin: true  ← KEY FLAG
     }
   }
6. Frontend auth context stores token + user
7. Auth middleware checks: if isAdmin === true
8. Redirect to /admin (via router.push('/admin'))
9. Admin dashboard loads:
   - KPI cards (MRR, active companies, etc)
   - Company directory
   - Operations tools
10. User is now in vendor console
```

### 5.2 Login → Redirect → Dashboard (Customer)

```
1. User navigates to hris.dntech.id
2. Redirected to /login (if not authenticated)
3. User enters email + password
4. Backend validates:
   - Email: admin@customer.com
   - Password: ✓
   - Role query: SELECT role FROM users WHERE email = ?
   - Result: role = "COMPANY_ADMIN"
5. Backend returns JWT:
   {
     token: "eyJhbGc...",
     user: {
       id: "user-123",
       email: "admin@customer.com",
       name: "Budi Santoso",
       role: "COMPANY_ADMIN",
       companyId: "company-abc",
       isAdmin: false  ← KEY FLAG
     }
   }
6. Frontend auth context stores token + user
7. Auth middleware checks: if isAdmin === true
   - NO, isAdmin = false
   - Check if role in [COMPANY_ADMIN, HR, MANAGER, EMPLOYEE]
   - YES
   - Redirect to /dashboard (via router.push('/dashboard'))
9. Customer dashboard loads (employees, payroll, talent, etc)
10. User is now in customer console
```

### 5.3 Unauthorized Access Attempt

```
1. Customer admin (admin@customer.com, COMPANY_ADMIN) 
   navigates to https://hris.dntech.id/admin
2. Frontend route guard checks:
   - auth.isAdmin === true?
   - NO, isAdmin = false
3. Redirect to /dashboard (or /login if no auth)
4. Never renders admin page

Alternative (if tried to bypass):
  GET /api/v1/admin/companies HTTP/1.1
  Authorization: Bearer {customer_token}
  ↓
  Backend middleware check:
    @Auth('SUPER_ADMIN') fails
    role from token = COMPANY_ADMIN (not SUPER_ADMIN)
  ↓
  Response: 403 Forbidden
    { error: "Unauthorized. Admin access required." }
```

---

## 6. UI/UX Changes

### 6.1 Login Page (Minor)

**Current:** Generic login  
**New:** Check if email domain matches DN Tech (optional enhancement)
- If email = `@dntech.id` → show hint "Vendor Console"
- If email = `@customer.com` → show hint "Customer Dashboard"

### 6.2 Admin Header (Improvement)

**Before:**
```
┌─────────────────────────────────┐
│ dnPeople Dashboard              │
└─────────────────────────────────┘
```

**After:**
```
┌──────────────────────────────────────────┐
│ dnPeople Vendor Control Panel    [Theme] │
│ (Vendor Console)                 [Logout]│
└──────────────────────────────────────────┘
```

**Key:** Label clearly as "Vendor Console" (not generic Dashboard)

### 6.3 Workspace Context Badge

**Admin Console Header:**
```
┌─────────────────────────────────┐
│ ⚙️  VENDOR CONSOLE              │
│ You are viewing vendor operations│
│ [Company Directory] [Billing]    │
└─────────────────────────────────┘
```

**Customer Dashboard Header:**
```
┌─────────────────────────────────┐
│ 👥 PT ABC Indonesia              │
│ You are viewing customer data    │
│ [Employees] [Payroll]           │
└─────────────────────────────────┘
```

---

## 7. Success Criteria

### Functional

✅ SUPER_ADMIN login → auto-redirect to `/admin` within 1s  
✅ COMPANY_ADMIN login → auto-redirect to `/dashboard` within 1s  
✅ Customer admin cannot access `/admin` (404 or 403)  
✅ Direct URL `/admin` without auth → redirect `/login`  
✅ Direct URL `/admin` with customer token → 403 Forbidden  
✅ Admin logout → redirect `/login` (not `/dashboard`)  
✅ Page refresh in `/admin` → stays in `/admin` (auth persists)  
✅ Mobile: admin layout responsive on all screen sizes  

### Security

✅ SUPER_ADMIN role strictly enforced (backend + frontend)  
✅ No auth bypass (all `/admin` endpoints have @Auth('SUPER_ADMIN'))  
✅ Customer data isolated from vendor console (no leakage)  
✅ Logout clears auth + redirect `/login`  

### Performance

✅ Redirect happens within 500ms (no lag)  
✅ Admin dashboard loads < 2s  
✅ No permission errors during normal use  

---

## 8. Timeline

| Phase | Duration | Deliverables |
|-------|----------|---------------|
| **Analysis & Design** | 1 day (Aug 10) | Flow diagram, role matrix, route guards spec |
| **Backend Implementation** | 2 days (Aug 11-12) | isAdmin flag in JWT, @Auth('SUPER_ADMIN') middleware |
| **Frontend Implementation** | 2 days (Aug 13-14) | Redirect logic, route guards, layout separation |
| **Testing** | 1 day (Aug 15) | E2E tests, access control, mobile responsive |
| **Deployment** | 1 day (Aug 16-17) | Staging → Production |
| **Go-Live** | 1 day (Aug 18) | Monitor, fix any issues |

**Total:** 1 week (Aug 10-18, 2026)

---

## 9. Rollback Plan

**If issues post-deployment:**
1. Disable redirect logic via feature flag `ADMIN_REDIRECT_ENABLED` (default: true)
2. Set to false → everyone lands on `/dashboard` (fallback behavior)
3. Revert if critical issues
4. No data loss (only routing change)

---

## 10. Assumptions & Dependencies

**Assumptions:**
- SUPER_ADMIN role already exists in database
- JWT token generation already working (v15.0+)
- Auth middleware infrastructure available (Express)
- Next.js Route Guards / Middleware available

**Dependencies:**
- PostgreSQL (user roles table)
- Express backend (JWT + auth middleware)
- Next.js frontend (routing + middleware)
- Auth infrastructure (existing, no new build)

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **SUPER_ADMIN** | DN Tech vendor staff; can manage all customers, billing, operations |
| **Admin Console** | Vendor operations UI at `/admin` (only for SUPER_ADMIN) |
| **Customer Dashboard** | User-facing UI at `/dashboard` (for COMPANY_ADMIN, HR, MANAGER, EMPLOYEE) |
| **Role-Based Redirect** | Auto-route users to correct workspace based on role |
| **Workspace Isolation** | Vendor console ≠ customer console (separate UIs, permissions, data) |
| **isAdmin flag** | JWT claim indicating SUPER_ADMIN role |
| **Route guard** | Frontend middleware blocking unauthorized access to `/admin/*` |

---

**Approved by:** Dozer Fernando Saroha Daniel Napitupulu (CEO + Tech Lead)  
**Version:** 1.0 (Ready for SRS)  
**Last Updated:** 10 Agustus 2026  
**Next:** SRS v15.2 (detailed requirements + test cases)

