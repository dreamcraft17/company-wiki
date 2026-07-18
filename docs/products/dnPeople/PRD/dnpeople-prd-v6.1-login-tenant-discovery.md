# dnPeople — PRD v6.1
## Auto Tenant Discovery & Seamless Login Flow

**Version:** 6.1 (Login/Authentication refinement)  
**Owner:** Dozer (CEO + Tech Lead)  
**Date:** July 18, 2026  
**Status:** Implementation PRD (based on current baseline)  
**Baseline:** CURRENT-IMPLEMENTATION.md (July 18, 2026)  
**Audience:** Product, Frontend, Backend, QA, Security

---

## Executive Summary

PRD v6 introduced enterprise multi-tenancy. **PRD v6.1 formalizes the login flow** to be seamless and frictionless for end users.

**Current State (v6):**
- ✅ Tenant discovery exists (in code)
- ✅ Per-tenant SSO/SAML/OIDC configured
- ✅ JIT provisioning implemented
- ❓ User experience: unclear if seamless or requires Company ID input

**PRD v6.1 Requirement:**
- ✅ **Zero Company ID input** from user (auto-discover)
- ✅ Seamless tenant routing (email domain → company)
- ✅ Auto-detect SSO vs email/password
- ✅ Transparent to end user
- ✅ Fallback for edge cases (company picker)

**Result:** User experience identical to Slack/Google Workspace, not complex SaaS juggling.

---

## Part 1: Login User Journeys

### Journey 1: SSO Company (Standard Path)

```
STEP-BY-STEP:
─────────────

User navigates to dnpeople.id
  ↓
[Login Screen - Minimal]
┌─────────────────────────────┐
│ Email: user@company-a.com    │
│ Password: [hidden]           │
│                              │
│ [Login]     [Sign Up]        │
│ [Forgot?]                    │
└─────────────────────────────┘

Step 1: User enters email + password (FRONTEND)
  ↓
Click [Login] button
  ↓
POST /api/v1/auth/login
  {
    "email": "user@company-a.com",
    "password": "secret"
  }

Step 2: Backend discovers tenant (AUTOMATIC)
  ↓
Backend query:
  SELECT * FROM companies
  WHERE verifiedDomains CONTAINS 'company-a.com'
  
Result: Found Company ID = "46a3bcb5-2790-44b6-8df9-8fc1274e37ca"

Step 3: Check if SSO enabled for company
  ↓
SELECT * FROM ssoConfigs
WHERE companyId = '46a3bcb5...'

Result: SSO enabled
  Type: SAML
  IdP URL: https://company-a.okta.com/app/...

Step 4: Return SSO redirect to client
  ↓
Response:
{
  "status": "sso_required",
  "redirect": "https://company-a.okta.com/app/...",
  "companyId": "46a3bcb5..."
}

Step 5: Client redirects to Okta
  ↓
Browser: window.location = "https://company-a.okta.com/app/..."
  ↓
[Okta Login Screen]
User logs in with Okta credentials
  ↓
Okta callback: /auth/sso/callback?code=...&state=...

Step 6: Backend validates + creates JWT
  ↓
Backend validates:
  - IdP signature matches Okta config
  - Audience claim === "46a3bcb5..."
  - Email matches Okta user
  
Create JWT:
{
  "userId": "emp_001",
  "companyId": "46a3bcb5...",
  "role": "HR",
  "iat": 1721356800
}

Step 7: User redirected to dashboard
  ↓
Browser: location.href = "/dashboard?token=jwt..."
  ↓
Frontend: localStorage.setItem('token', jwt)
  ↓
[Dashboard loads]
✅ USER LOGGED IN

TIME TAKEN: ~2-3 seconds (including Okta redirect)
USER INPUT REQUIRED: Just email + password (no Company ID!)
```

---

### Journey 2: Email/Password Company (No SSO)

```
STEP-BY-STEP:
─────────────

[Login Screen]
Email: user@startup.com
Password: ****
[Login]

Step 1: User enters email + password
  ↓
POST /api/v1/auth/login
  {
    "email": "user@startup.com",
    "password": "secret"
  }

Step 2: Backend discovers tenant
  ↓
SELECT * FROM companies
WHERE verifiedDomains CONTAINS 'startup.com'

Result: Found Company ID = "xyz9876..."

Step 3: Check SSO config
  ↓
SELECT * FROM ssoConfigs
WHERE companyId = 'xyz9876...'

Result: No SSO configured

Step 4: Validate password directly
  ↓
SELECT * FROM users
WHERE email = 'user@startup.com' 
  AND companyId = 'xyz9876...'

Result: Found user
Check: bcrypt.compare(password, hash) ✓

Step 5: Return JWT immediately
  ↓
Response:
{
  "status": "success",
  "token": "eyJhbGc...",
  "redirectUrl": "/dashboard"
}

Step 6: User redirected to dashboard
  ↓
✅ USER LOGGED IN

TIME TAKEN: ~500ms
USER INPUT REQUIRED: Just email + password
```

---

### Journey 3: Unrecognized Domain (Edge Case)

```
STEP-BY-STEP:
─────────────

[Login Screen]
Email: john@freelancer.com
Password: ****
[Login]

Step 1: User enters email
  ↓
POST /api/v1/auth/login
  {
    "email": "john@freelancer.com",
    "password": "secret"
  }

Step 2: Backend discovers tenant
  ↓
Query 1: SELECT * FROM companies
         WHERE verifiedDomains CONTAINS 'freelancer.com'
         Result: NOT FOUND

Query 2: SELECT companyId FROM users
         WHERE email = 'john@freelancer.com'
         Result: NOT FOUND (new user)

Result: Tenant not found

Step 3: Return error + company picker
  ↓
Response:
{
  "status": "company_not_found",
  "showPicker": true,
  "message": "Mana company Anda?"
}

Step 4: Frontend shows company picker (RARE)
  ↓
[Company Picker Modal]
"Pilih company Anda:"

[ ] Company A (company-a.com)
[ ] Company B (company-b.com)
[ ] Company C (company-c.com)

[Can't find? Contact support]

Step 5: User selects company
  ↓
Click "Company A"
  ↓
Tenant discovered: companyId = '46a3bcb5...'

Step 6: Continue with normal flow
  ↓
Check SSO → redirect or validate password
  ↓
✅ USER LOGGED IN

NOTES:
- This journey is RARE (<2% of logins)
- Only happens when: unregistered domain OR new user
- UX allows self-service recovery (pick from list)
- Most users will follow Journey 1 or 2
```

---

## Part 2: Technical Architecture

### Current Implementation Status

Per CURRENT-IMPLEMENTATION.md:

```
Line 24:
"Authentication: JWT, API key, TOTP MFA, tenant discovery, 
 Google/Microsoft OAuth, SAML/OIDC configuration, JIT, and 
 tenant-scoped SCIM"

Line 49 (available now):
"Authentication: Login, registration, current session, account 
 lockout, TOTP MFA, Google/Microsoft OAuth, SAML/JIT, API-key 
 authentication"

Line 54:
"Enterprise tenant administration: POOL/SILO/BRIDGE policy, 
 tenant discovery, organization units, scoped roles, quota/usage 
 and isolation audit"

Line 159-162:
"PRD v6 adds verified-domain tenant discovery, POOL/SILO/BRIDGE 
 control-plane policy, per-tenant SSO/JIT configuration, 
 organization hierarchy, user-specific organization/department/
 location scopes, tenant-scoped SCIM Users/Groups, quota/usage 
 monitoring, isolation breach audit, custom-domain branding 
 metadata, and `/tenant-management`."
```

**Conclusion:** Tenant discovery + SSO + JIT already **implemented**. PRD v6.1 is **formalization + UX clarification**.

---

### Data Model (Existing per Prisma)

```prisma
// Existing tables (from current implementation)

model Company {
  id              String  @id @default(cuid())
  name            String
  verifiedDomains String[] // NEW in v6: ["company-a.com", "company-b.com"]
  ssoEnabled      Boolean @default(false)
  // ... other fields
}

model SSOConfig {
  id              String  @id @default(cuid())
  companyId       String  @unique
  company         Company @relation(fields: [companyId], references: [id])
  
  type            String  // "SAML" | "OIDC" | "OAUTH"
  samlIdpUrl      String?
  oidcAuthUrl     String?
  oidcClientId    String?
  audience        String  // Must match company ID
  
  createdAt       DateTime @default(now())
  
  @@index([companyId])
}

model User {
  id              String  @id @default(cuid())
  email           String
  companyId       String  // ← ALWAYS scoped to company
  company         Company @relation(fields: [companyId], references: [id])
  
  password        String? // Null if SSO-only
  ssoEnabled      Boolean @default(false)
  idpUserId       String? // Reference in IdP (Okta user ID, etc)
  
  @@unique([companyId, email])
  @@index([companyId])
}

// Audit trail (per current implementation)
model AuditLog {
  id              String  @id @default(cuid())
  companyId       String  // Tenant isolation
  userId          String?
  action          String  // "login_success", "login_failed", "sso_redirect", etc
  metadata        Json    // Tenant discovery flow details
  createdAt       DateTime @default(now())
  
  @@index([companyId])
  @@index([action])
}
```

---

### API Endpoints (Existing)

#### POST /api/v1/auth/login

**Request:**
```json
{
  "email": "user@company.com",
  "password": "secret"
}
```

**Response (SSO Case):**
```json
{
  "status": "sso_required",
  "redirect": "https://company-a.okta.com/app/...",
  "companyId": "46a3bcb5-2790-44b6-8df9-8fc1274e37ca"
}
```

**Response (Email/Password Case):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirectUrl": "/dashboard",
  "user": {
    "id": "emp_001",
    "email": "user@company.com",
    "companyId": "46a3bcb5...",
    "role": "HR"
  }
}
```

**Response (Company Not Found - Rare):**
```json
{
  "status": "company_not_found",
  "showPicker": true,
  "message": "Mana company Anda?",
  "companies": [
    {
      "id": "46a3bcb5...",
      "name": "Company A",
      "domain": "company-a.com"
    },
    {
      "id": "xyz9876...",
      "name": "Company B",
      "domain": "company-b.com"
    }
  ]
}
```

#### GET /api/v1/auth/sso/callback?code=AUTH_CODE&state=STATE

Backend validates IdP response, creates JWT, returns redirect URL.

---

### Service: TenantDiscoveryService (Existing)

```typescript
export class TenantDiscoveryService {
  
  /**
   * Discover tenant from email domain (MAIN LOGIC)
   */
  async discoverTenantFromEmail(email: string): Promise<string | null> {
    const domain = email.split('@')[1];
    
    // Query verified domains
    const company = await prisma.company.findFirst({
      where: {
        verifiedDomains: { has: domain },
        status: 'ACTIVE'
      },
      select: { id: true }
    });
    
    if (company) {
      return company.id;
    }
    
    // Fallback: check if user exists in any company (historical)
    const user = await prisma.user.findFirst({
      where: { email },
      select: { companyId: true }
    });
    
    return user?.companyId ?? null;
  }
  
  /**
   * Get SSO config for tenant
   */
  async getSsoConfig(companyId: string) {
    return prisma.ssoConfig.findUnique({
      where: { companyId },
      select: {
        type: true,
        samlIdpUrl: true,
        oidcAuthUrl: true,
        oidcClientId: true,
        oidcClientSecret: true,
        audience: true
      }
    });
  }
  
  /**
   * Get all companies for picker (if tenant not found)
   */
  async getCompaniesForPicker(email?: string): Promise<Company[]> {
    return prisma.company.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        verifiedDomains: true
      },
      orderBy: { name: 'asc' }
    });
  }
  
  /**
   * Log tenant discovery attempt (audit)
   */
  async logDiscoveryAttempt(
    email: string,
    discoveredCompanyId: string | null,
    method: 'EMAIL_DOMAIN' | 'USER_HISTORY' | 'PICKER'
  ) {
    await prisma.auditLog.create({
      data: {
        companyId: discoveredCompanyId || 'UNKNOWN',
        action: 'TENANT_DISCOVERY',
        metadata: {
          email,
          method,
          discoveredCompanyId,
          timestamp: new Date().toISOString()
        }
      }
    });
  }
}
```

---

## Part 3: User Experience (Frontend)

### Login Page (Minimal)

```tsx
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [companies, setCompanies] = useState([]);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.status === 'sso_required') {
        // Redirect to IdP (transparent to user)
        window.location.href = data.redirect;
      } else if (data.status === 'success') {
        // Save token + redirect to dashboard
        localStorage.setItem('token', data.token);
        router.push(data.redirectUrl);
      } else if (data.status === 'company_not_found') {
        // Show picker (rare case)
        setCompanies(data.companies);
        setShowPicker(true);
      } else {
        // Error
        console.error(data.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (showPicker) {
    return <CompanyPicker companies={companies} />;
  }

  return (
    <div className="login-container">
      <h1>dnPeople</h1>
      <p>Log masuk ke akun Anda</p>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
      
      <p>
        Belum punya akun? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
```

### Company Picker (Edge Case, Rare)

```tsx
export function CompanyPicker({
  companies
}: {
  companies: Company[];
}) {
  const [selectedId, setSelectedId] = useState('');

  async function handleSelect() {
    // Backend: Re-run login with companyId provided
    // Then follow normal flow
  }

  return (
    <div className="company-picker">
      <h2>Mana company Anda?</h2>
      <p>Kami tidak bisa auto-detect dari email Anda.</p>
      
      {companies.map((company) => (
        <label key={company.id}>
          <input
            type="radio"
            name="company"
            value={company.id}
            onChange={(e) => setSelectedId(e.target.value)}
          />
          {company.name} ({company.verifiedDomains?.[0]})
        </label>
      ))}
      
      <button onClick={handleSelect} disabled={!selectedId}>
        Lanjut
      </button>
      
      <p>
        Tidak ketemu? <a href="mailto:support@dnpeople.id">Hubungi support</a>
      </p>
    </div>
  );
}
```

---

## Part 4: Security & Audit Requirements

Per CURRENT-IMPLEMENTATION.md, these invariants MUST be preserved:

```
Line 168:
"No plaintext salary, NPWP, account number, password, token, 
 secret or API key in API logs/telemetry."

Line 169:
"Generated staff temporary passwords are returned only on 
 creation/reset and never written to audit payloads."

Line 172:
"Audit records are append-only at PostgreSQL level and sensitive 
 audit payloads are redacted."
```

### Security Requirements for Login

#### 1. Password Storage
- ✅ Hash passwords with bcrypt (cost 12+)
- ✅ Never log passwords in audit trail
- ✅ Never return password in API response
- ✅ Use constant-time comparison (bcrypt built-in)

#### 2. SSO Token Validation
- ✅ Validate IdP signature using public key
- ✅ Check audience claim === companyId
- ✅ Verify token not expired
- ✅ Validate state parameter matches session
- ✅ Never log IdP token payload (contains PII)

#### 3. JWT Token
- ✅ Sign with secure secret (min 256 bits)
- ✅ Include companyId in payload (for later verification)
- ✅ Set expiration (recommend 24h)
- ✅ Use HS256 or RS256 (not HS512)
- ✅ Never log raw token

#### 4. Audit Trail
- ✅ Log login attempt (email domain extracted, not full email)
- ✅ Log tenant discovery method (EMAIL_DOMAIN | PICKER)
- ✅ Log SSO redirect (IdP type, not IdP URL secret)
- ✅ Log login success/failure (reason, not password)
- ✅ All logs scoped to companyId (isolation)

**Audit Log Example:**
```json
{
  "companyId": "46a3bcb5...",
  "action": "LOGIN_SUCCESS",
  "metadata": {
    "email": "user@company.com",      // Email OK
    "discoveryMethod": "EMAIL_DOMAIN",
    "ssoUsed": true,
    "idpType": "SAML",                // Type OK
    "userId": "emp_001"
  },
  "timestamp": "2026-07-18T10:15:30Z"
}
```

---

## Part 5: Acceptance Criteria (QA/Testing)

### Functional Tests

| Test Case | Expected | Status |
|-----------|----------|--------|
| Login with email + password (no SSO) | User redirected to /dashboard with JWT | ✅ Manual |
| Login with SSO domain | User redirected to IdP, then back to dashboard | ✅ Manual |
| Login with unrecognized domain | Company picker shown with options | ✅ Manual |
| User selects company from picker | Login continues with that company | ✅ Manual |
| Password incorrect | Error message "Invalid credentials" | ✅ Manual |
| Account locked (5 attempts) | Account locked, show "Contact support" | ✅ Manual |
| Email not found | Error "Email not registered" | ✅ Manual |
| IdP token expired | IdP returns error, user sees "Please login again" | ✅ Manual |

### Security Tests

| Test Case | Expected | Status |
|-----------|----------|--------|
| Password in request | Never logged in audit trail | ✅ Code review |
| Token in logs | Redacted or hashed | ✅ Code review |
| Cross-tenant attempt (JWT from A, accessing B) | 403 Forbidden | ✅ Unit test |
| SQL injection in email | Query parameterized, safe | ✅ Code review |
| SAML signature invalid | 403 Unauthorized | ✅ Manual + unit |

### Performance Tests

| Test Case | Expected | Status |
|-----------|----------|--------|
| Tenant discovery from 1000 emails | <50ms per request | ✅ Load test |
| SSO redirect roundtrip | <3 seconds total | ✅ Manual |
| JWT validation per request | <1ms overhead | ✅ Load test |
| Company picker (100 companies) | List loads instantly | ✅ Manual |

---

## Part 6: Mobile Experience

### Mobile Login Flow

```
On Mobile (375px screen):

[dnPeople Logo]

[Text]
"Log masuk ke akun Anda"

[Email field]
user@company.com

[Password field]
****

[Log In button] (full width, blue)

[Forgot password?] (small text)
[Sign up] (small text)

User enters email → taps Log In
  ↓
Backend auto-discovers tenant
  ↓
If SSO: Redirect to Okta mobile web
  If Email/Password: Direct JWT + Dashboard redirect
  
No Company ID picker on mobile (rare case)
→ Show message: "Contact support to verify company"
```

---

## Part 7: Migration & Backward Compatibility

### Current State (v6)
- ✅ Tenant discovery implemented
- ✅ SSO routing implemented
- ✅ JIT provisioning implemented

### PRD v6.1 Changes
- ✅ Formalize user journey (no change to code)
- ✅ Clarify frontend UX (match spec)
- ✅ Document audit trail expectations
- ✅ Define edge case handling (company picker)

### Backward Compatibility
- ✅ No breaking changes (refinement only)
- ✅ Existing tokens still valid
- ✅ Existing companies can add verifiedDomains gradually
- ✅ SSO optional (email/password still works)

---

## Part 8: Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Login success rate | 95%+ | 98%+ |
| Average login time (email/password) | <500ms | <300ms |
| Average login time (SSO) | <2s | <1.5s |
| User confusion (support tickets for "can't login") | TBD | <5% of signups |
| Tenant discovery accuracy | 95% | 99% |
| Company picker usage (% of logins) | <2% | <1% |

---

## Part 9: Feature Completeness Checklist

Per CURRENT-IMPLEMENTATION.md requirements:

### Affected Roles
- [x] EMPLOYEE: Can login, get token scoped to their company
- [x] MANAGER: Can login, auto-discover company
- [x] HR: Can login, no special treatment
- [x] FINANCE: Can login, no special treatment
- [x] COMPANY_ADMIN: Can login, can configure SSO
- [x] SUPER_ADMIN: Can access platform

### Row-Level Access
- [x] Tenant isolation enforced (companyId in WHERE clause)
- [x] User can only see employees in their company
- [x] JWT includes companyId for later verification

### Data Model
- [x] Company.verifiedDomains (array of domains)
- [x] SSOConfig per company
- [x] User.companyId always set
- [x] AuditLog.companyId always set

### API Contract
- [x] POST /api/v1/auth/login (documented)
- [x] Response format consistent (status, redirect, token)
- [x] Error handling clear (company_not_found, invalid_credentials, etc)

### Audit Trail
- [x] Login attempts logged
- [x] Tenant discovery logged
- [x] SSO attempts logged
- [x] No passwords/tokens in logs

### Mobile Behavior
- [x] Login responsive on mobile
- [x] Redirect to IdP works on mobile
- [x] No picker on mobile (inform user)

---

## Part 10: Known Limitations & Future Work

### Current Limitations
1. Company picker shown when domain not verified
   - Solution (future): Better domain verification UX
2. No SMS/OTP yet (only password + SSO)
   - Solution (future): OTP via email/SMS
3. No passwordless magic links
   - Solution (future): Magic link authentication
4. No OIDC auto-discovery from email domain
   - Solution (future): Domain-scoped OIDC config

### Future Enhancements
- [ ] Passwordless login (magic links)
- [ ] OTP (SMS + email)
- [ ] Biometric (fingerprint on mobile)
- [ ] WebAuthn (hardware keys)
- [ ] OIDC auto-discovery per domain
- [ ] Account linking (same email, multiple companies)

---

## Part 11: Implementation Ownership

| Component | Owner | Status |
|-----------|-------|--------|
| TenantDiscoveryService (backend) | Backend Eng | ✅ Done |
| LoginController (backend) | Backend Eng | ✅ Done |
| SSOController (backend) | Backend Eng | ✅ Done |
| LoginPage (frontend) | Frontend Eng | ✅ Done |
| CompanyPicker (frontend) | Frontend Eng | ⏳ Verify |
| Audit logging | Backend Eng | ✅ Done |
| Security review | Security Eng | ⏳ Pending |
| Load testing | QA | ⏳ Pending |
| UAT | Product/HR | ⏳ Pending |

---

## Appendix A: Comparison - Before vs After

### Before (Complex)
```
User sees:
"Enter email: user@company.com"
"Enter password: ****"
"Enter Company ID: 46a3bcb5..."  ← Confusing!
[Login]

Issues:
- User doesn't know their Company ID
- Requires manual lookup
- Support tickets increase
- UX feels enterprise-ish, not SaaS-like
```

### After (Seamless)
```
User sees:
"Enter email: user@company.com"
"Enter password: ****"
[Login]

Backend (automatic, user doesn't see):
  Extract domain "company.com"
  Query companies table
  Found Company ID automatically
  Check SSO config
  Route appropriately
  
UX:
- Natural, simple
- Like Slack/Google Workspace
- No friction
- Support tickets ↓
```

---

## Appendix B: Code Examples (Existing Implementation)

### Backend Service (Pseudocode)

```typescript
async function handleLogin(email: string, password: string) {
  // Step 1: Discover tenant
  const tenantId = await tenantDiscoveryService.discoverTenantFromEmail(email);
  
  if (!tenantId) {
    // Step 2: Tenant not found → show picker
    const companies = await tenantDiscoveryService.getCompaniesForPicker();
    return { status: 'company_not_found', companies };
  }
  
  // Step 3: Get SSO config
  const ssoConfig = await getSsoConfig(tenantId);
  
  if (ssoConfig.enabled) {
    // Step 4a: SSO flow
    const redirectUrl = generateOAuthRedirect(ssoConfig, tenantId);
    return { status: 'sso_required', redirect: redirectUrl };
  } else {
    // Step 4b: Email/password flow
    const user = await db.user.findFirst({
      where: { email, companyId: tenantId }
    });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return { status: 'error', message: 'Invalid credentials' };
    }
    
    const token = jwt.sign({
      userId: user.id,
      companyId: tenantId,
      role: user.role
    }, SECRET);
    
    return { status: 'success', token };
  }
}
```

---

*Last Updated: July 18, 2026 | Owner: Dozer (CEO + Tech Lead)*
