# dnPeople SUPER_ADMIN Landing & Admin Console Routing
## Software Requirements Specification (SRS) v15.2

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 10 Agustus 2026  
**Status:** Ready for Implementation  

---

## 1. FUNCTIONAL REQUIREMENTS

### FR1: SUPER_ADMIN Auto-Redirect to Admin Console

**Description:** When SUPER_ADMIN logs in, automatically redirect to `/admin` instead of `/dashboard`

**Priority:** P0

**Acceptance Criteria:**

**FR1.1 — Backend: Add isAdmin Flag to JWT**
- [ ] On POST /auth/login, after credential validation
- [ ] Query role from database: `SELECT role FROM users WHERE email = ?`
- [ ] If role = 'SUPER_ADMIN' → set `isAdmin: true` in JWT payload
- [ ] If role ≠ 'SUPER_ADMIN' → set `isAdmin: false` in JWT payload
- [ ] Return JWT in response body: `{ token, user: { role, isAdmin, ... } }`
- [ ] isAdmin flag included in every JWT token

**FR1.2 — Frontend: Detect isAdmin and Redirect**
- [ ] After login, frontend receives JWT + user object
- [ ] Auth context stores: `auth.isAdmin` (boolean)
- [ ] In auth middleware or layout component:
  ```
  IF auth.isAdmin === true:
    redirect('/admin')
  ELSE IF auth.role in ['COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']:
    redirect('/dashboard')
  ELSE:
    redirect('/login')
  ```
- [ ] Redirect happens within 500ms (no lag)
- [ ] User sees admin dashboard (or customer dashboard) without extra clicks

**FR1.3 — Verify No Manual Navigation Needed**
- [ ] SUPER_ADMIN login flow: email → password → click "Login" → auto-land on `/admin`
- [ ] No intermediate page (no "Welcome" or "Choose workspace")
- [ ] Confirmation: "Logged in as Vendor" or similar badge on admin page

**Acceptance Criteria:**
- [ ] SUPER_ADMIN login → `/admin` within 1s
- [ ] COMPANY_ADMIN login → `/dashboard` within 1s
- [ ] Admin token includes `isAdmin: true`
- [ ] Customer token includes `isAdmin: false`

**API Endpoint:**
```
POST /api/v1/auth/login
  Body: { email, password }
  Response (200): {
    token: "eyJhbGc...",
    user: {
      id, email, name, role,
      companyId, isAdmin  ← NEW FLAG
    }
  }

GET /api/v1/auth/me
  Response (200): { 
    id, email, name, role, companyId, isAdmin
  }
```

---

### FR2: Route Guards - Protect Admin Console

**Description:** Prevent non-SUPER_ADMIN from accessing `/admin` and `/admin/*` routes

**Priority:** P0

**Acceptance Criteria:**

**FR2.1 — Frontend Route Guard**
- [ ] Route `/admin` is protected
- [ ] Route `/admin/companies`, `/admin/billing`, etc all protected
- [ ] If user tries to access `/admin` without auth:
  - [ ] Redirect to `/login`
  - [ ] Show message: "Login required to access admin console"
- [ ] If user tries to access `/admin` with customer token (isAdmin = false):
  - [ ] Redirect to `/dashboard`
  - [ ] Show warning: "You do not have access to vendor console"
- [ ] If user tries to access `/admin` with SUPER_ADMIN token (isAdmin = true):
  - [ ] Allow access, render admin console

**FR2.2 — Backend Route Guard**
- [ ] Middleware `@Auth('SUPER_ADMIN')` on all `/api/v1/admin/*` endpoints
- [ ] If request has token but role ≠ SUPER_ADMIN:
  - [ ] Response 403 Forbidden: `{ error: "Unauthorized. Admin role required." }`
  - [ ] Log attempt in audit log (security event)
- [ ] If request has no token or invalid token:
  - [ ] Response 401 Unauthorized: `{ error: "Authentication required." }`

**FR2.3 — Deep Link Protection**
- [ ] Direct URL: `https://hris.dntech.id/admin/companies/abc123`
- [ ] If no auth: redirect `/login`
- [ ] If customer token: redirect `/dashboard`
- [ ] If SUPER_ADMIN token: load page
- [ ] No rendering of admin UI for unauthorized users

**Acceptance Criteria:**
- [ ] Customer admin cannot view admin console (redirect + no data leak)
- [ ] Customer admin cannot call admin APIs (403 on backend)
- [ ] SUPER_ADMIN can access all admin routes + APIs
- [ ] Unauthorized attempts logged to audit table

**API Endpoint (Example):**
```
GET /api/v1/admin/companies
  Authorization: Bearer {token}
  
  Backend check:
    - Parse JWT, extract role
    - IF role !== SUPER_ADMIN:
      Response (403): { error: "Unauthorized. Admin role required." }
    - ELSE:
      Continue, return companies list

  Audit log:
    - If 403: log { action: "unauthorized_access", resource: "admin_companies", user_id, timestamp }
```

---

### FR3: Layout Separation - Admin vs Customer

**Description:** Different layouts for admin console vs customer dashboard (header, sidebar, branding)

**Priority:** P1

**Acceptance Criteria:**

**FR3.1 — Admin Console Layout**
- [ ] Header shows: "dnPeople Vendor Control Panel" (NOT "Dashboard")
- [ ] Workspace badge: "⚙️ VENDOR CONSOLE" or "Vendor Operations"
- [ ] Sidebar items: Company Directory, Billing, Support, Audit, Health, Flags, etc
- [ ] Footer (optional): Vendor-specific info (API status, system health)
- [ ] Logo: dnPeople (vendor version)
- [ ] No customer-specific data visible

**FR3.2 — Customer Dashboard Layout**
- [ ] Header shows: "dnPeople Dashboard" (or "PT ABC Indonesia")
- [ ] Workspace badge: "👥 [Company Name]" or similar
- [ ] Sidebar items: Employees, Payroll, Talent, Organization, Help, etc
- [ ] No admin operations visible (no "Customers" or "Billing Settings")
- [ ] Logo: dnPeople (customer version, optional)

**FR3.3 — No Layout Mixing**
- [ ] Admin layout + customer data = never happens
- [ ] Customer layout + admin data = never happens
- [ ] Clear visual distinction between workspaces

**Acceptance Criteria:**
- [ ] Admin sidebar looks different from customer sidebar (visually distinct)
- [ ] Admin header says "Vendor Console" (not generic Dashboard)
- [ ] Customer header says company name (not "Vendor")
- [ ] No data leakage (admin can't see customer-specific views)

**Component Examples:**
```
// Admin Layout
<AdminLayout>
  <Header title="dnPeople Vendor Control Panel" badge="Vendor Console" />
  <Sidebar items={adminNavItems} />
  <Main>{children}</Main>
</AdminLayout>

// Customer Layout
<CustomerLayout>
  <Header title={companyName} badge={`${companyName} Dashboard`} />
  <Sidebar items={customerNavItems} />
  <Main>{children}</Main>
</CustomerLayout>
```

---

### FR4: Session Persistence - Refresh & Logout

**Description:** Auth persists correctly on page refresh; logout returns to login

**Priority:** P0

**Acceptance Criteria:**

**FR4.1 — Page Refresh**
- [ ] User logged in as SUPER_ADMIN, on `/admin`
- [ ] User refreshes page (F5 or Ctrl+R)
- [ ] Frontend checks auth context:
  - [ ] JWT still valid (stored in localStorage/cookie)
  - [ ] isAdmin flag still true
  - [ ] Redirect check: "Should go to /admin?" → YES (isAdmin = true)
- [ ] Admin page re-renders (no logout on refresh)

**FR4.2 — Logout**
- [ ] User on `/admin`, clicks "Logout"
- [ ] POST /auth/logout (or just clear token client-side)
- [ ] Clear JWT from localStorage/cookie
- [ ] Auth context updates: `auth.isAdmin = null`, `auth.token = null`
- [ ] Redirect to `/login`
- [ ] Cannot access `/admin` anymore (redirect to `/login`)

**FR4.3 — Token Expiry**
- [ ] JWT expires after X hours (e.g., 8h)
- [ ] User on `/admin`, token expires
- [ ] Next API call receives 401 Unauthorized
- [ ] Frontend catches 401, clears auth, redirects `/login`
- [ ] User must login again

**Acceptance Criteria:**
- [ ] Refresh on `/admin` keeps user in `/admin` (no logout)
- [ ] Logout sends user to `/login` (not `/dashboard`)
- [ ] Expired token handled gracefully (redirect `/login`)

---

### FR5: First-Login Admin Welcome (Optional)

**Description:** Optional: Show welcome screen to new SUPER_ADMIN on first login

**Priority:** P2

**Acceptance Criteria:**

**FR5.1 — First-Login Detection**
- [ ] User has `isAdmin = true`
- [ ] Check flag in database: `users.first_login_admin_seen` (boolean)
- [ ] If false: show welcome screen
- [ ] If true: skip welcome, go to dashboard

**FR5.2 — Welcome Screen**
- [ ] Title: "Welcome to Vendor Console!"
- [ ] Explanation: "You are now viewing dnPeople vendor operations."
- [ ] Key sections:
  - Company Directory (manage all customers)
  - Billing (invoices, subscriptions, refunds)
  - Support (customer tickets)
  - Analytics (MRR, churn, etc)
- [ ] Button: "Get Started" → navigate `/admin`
- [ ] On click: set `first_login_admin_seen = true` in DB

**FR5.3 — Skip Option**
- [ ] "Skip for now" link → go to dashboard (don't show again)
- [ ] Set flag to true

**Acceptance Criteria:**
- [ ] First SUPER_ADMIN login shows welcome screen (once)
- [ ] Subsequent logins skip welcome
- [ ] Welcome is informational, not blocking

---

### FR6: Email Domain Detection (Optional)

**Description:** Optional: Hint on login page based on email domain

**Priority:** P3

**Acceptance Criteria:**

**FR6.1 — Vendor Email Domain**
- [ ] User enters email: `dozer@dntech.id`
- [ ] Login page shows hint: "🔧 Logging in to Vendor Console"
- [ ] Styling: different background color (e.g., blue)

**FR6.2 — Customer Email Domain**
- [ ] User enters email: `admin@customer.com`
- [ ] Login page shows hint: "👥 Logging in to Customer Dashboard"
- [ ] Styling: different background color (e.g., gray)

**Acceptance Criteria:**
- [ ] Hint displays on email input (optional, nice-to-have)
- [ ] Helps users understand which workspace they're entering
- [ ] Does NOT enforce login (still works regardless of domain)

---

### FR7: Audit Logging - Access & Redirects

**Description:** Log all admin console access attempts (success + failed)

**Priority:** P1

**Acceptance Criteria:**

**FR7.1 — Successful Admin Login**
- [ ] Event: SUPER_ADMIN successful login
- [ ] Log entry: `{ action: "admin_login", user_id, timestamp, ip, user_agent }`
- [ ] Also triggers: existing login audit (no duplication)

**FR7.2 — Failed Access Attempt**
- [ ] Customer admin tries to access `/api/v1/admin/companies`
- [ ] Request rejected (403 Forbidden)
- [ ] Log entry: `{ action: "unauthorized_admin_access", user_id, role, attempted_resource, timestamp, ip }`
- [ ] Security alert (optional): if multiple failed attempts → flag suspicious

**FR7.3 — Logout**
- [ ] Event: SUPER_ADMIN logout
- [ ] Log entry: `{ action: "admin_logout", user_id, session_duration, timestamp }`

**Acceptance Criteria:**
- [ ] All admin access logged (successful + failed)
- [ ] Audit trail immutable (cannot be deleted)
- [ ] HR/compliance can query audit logs

---

## 2. NON-FUNCTIONAL REQUIREMENTS

### NFR1: Performance
- Redirect: < 500ms
- Admin dashboard load: < 2s
- No permission errors on valid access

### NFR2: Security
- SUPER_ADMIN strictly enforced (backend + frontend)
- No auth bypass possible
- Customer data isolated (no leakage)
- All unauthorized access logged

### NFR3: Reliability
- Auth persists on refresh (session stability)
- Logout is reliable (clears all auth)
- Token expiry handled gracefully

### NFR4: Usability
- Clear workspace indication (admin ≠ customer)
- No confusion between roles
- Fast redirect (perceived as instant)

---

## 3. Acceptance Test Cases

| Test # | Scenario | Expected Result | Status |
|--------|----------|-----------------|--------|
| 1 | SUPER_ADMIN login | Auto-redirect to `/admin` | - |
| 2 | COMPANY_ADMIN login | Auto-redirect to `/dashboard` | - |
| 3 | Direct URL `/admin` (no auth) | Redirect to `/login` | - |
| 4 | Direct URL `/admin` (customer token) | Redirect to `/dashboard` | - |
| 5 | Direct URL `/admin` (SUPER_ADMIN token) | Render admin page | - |
| 6 | API call: GET /api/v1/admin/* (customer token) | 403 Forbidden | - |
| 7 | API call: GET /api/v1/admin/* (SUPER_ADMIN token) | 200 OK | - |
| 8 | Page refresh on `/admin` | Stay on `/admin` (no logout) | - |
| 9 | Click Logout on `/admin` | Redirect to `/login` | - |
| 10 | Logout customer on `/dashboard` | Redirect to `/login` | - |
| 11 | Token expires (8h) | Next API call → 401 → redirect `/login` | - |
| 12 | Admin header shows "Vendor Console" | ✅ Header displays correctly | - |
| 13 | Customer header shows company name | ✅ Header displays correctly | - |
| 14 | Unauthorized access logged to audit | ✅ Audit entry created | - |
| 15 | Mobile `/admin` | Responsive layout, all features work | - |
| 16 | Mobile `/dashboard` | Responsive layout, all features work | - |
| 17 | Multiple SUPER_ADMIN logins | All redirect to `/admin` | - |
| 18 | Session persistence (local storage) | Auth persists after browser restart | - |

---

## 4. API Changes

### Modified Endpoint

```
POST /api/v1/auth/login
  Body: { email, password }
  Response (200): {
    token: "eyJhbGc...",
    user: {
      id: "admin-001",
      email: "dozer@dntech.id",
      name: "Dozer Fernando",
      role: "SUPER_ADMIN",
      companyId: "dntech",
      isAdmin: true  ← NEW FIELD
    }
  }
```

### New Endpoint (Optional - First Login Check)

```
GET /api/v1/auth/first-login-admin
  Authorization: Bearer {token}
  Response (200): {
    first_login_seen: false|true
  }

POST /api/v1/auth/first-login-admin-complete
  Authorization: Bearer {token}
  Response (200): { status: "ok" }
```

### Existing Endpoints - Add Middleware

```
GET /api/v1/admin/*
  Middleware: @Auth('SUPER_ADMIN')  ← Enforce SUPER_ADMIN role
  
  If role !== SUPER_ADMIN:
    Response (403): { error: "Unauthorized. Admin role required." }
  
  If role === SUPER_ADMIN:
    Continue to handler
```

---

**Version:** 1.0 (Ready for SDD)  
**Last Updated:** 10 Agustus 2026

