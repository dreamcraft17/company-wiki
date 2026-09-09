# dnPeople SUPER_ADMIN Landing & Admin Console Routing
## System Design Document (SDD) v15.2

**Bahasa:** Bahasa Indonesia  
**Tanggal:** 10 Agustus 2026  
**Status:** Ready for Implementation

---

## 1. ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────┐
│  Frontend (Next.js 16)               │
│  ├─ /login (common login page)       │
│  ├─ /admin (admin console)           │
│  ├─ /dashboard (customer dashboard)  │
│  └─ Auth middleware (route guard)    │
└─────────────┬──────────────────────┘
              │ JWT + isAdmin flag
              │
┌─────────────▼──────────────────────┐
│  Backend (Express 5)                │
│  ├─ POST /auth/login (isAdmin flag)│
│  ├─ GET /auth/me (return isAdmin)   │
│  ├─ @Auth('SUPER_ADMIN') middleware │
│  └─ Audit logging (all access)      │
└─────────────┬──────────────────────┘
              │
┌─────────────▼──────────────────────┐
│  Database (PostgreSQL)              │
│  ├─ users.role (SUPER_ADMIN | ...)  │
│  ├─ audit_log (access events)       │
│  └─ users.first_login_admin_seen(?) │
└──────────────────────────────────┘
```

---

## 2. IMPLEMENTATION DETAILS

### 2.1 Backend - JWT & isAdmin Flag

**File:** `backend/src/services/AuthService.ts`

```typescript
class AuthService {
  async login(email: string, password: string) {
    // Validate credentials
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      throw new Error('Invalid credentials');
    }

    // Determine isAdmin flag
    const isAdmin = user.role === 'SUPER_ADMIN';

    // Generate JWT with isAdmin flag
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        isAdmin: isAdmin  // ← KEY ADDITION
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log login
    await this.auditService.log({
      action: 'login',
      user_id: user.id,
      role: user.role,
      timestamp: new Date(),
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company_id,
        isAdmin: isAdmin  // ← RETURN FLAG
      }
    };
  }

  async getCurrentUser(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      ...decoded,
      isAdmin: decoded.role === 'SUPER_ADMIN'
    };
  }
}
```

**Controller:**

```typescript
export class AuthController {
  @Post('/auth/login')
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  @Get('/auth/me')
  @Auth()  // Requires any valid token
  async getCurrentUser(req: Request, res: Response) {
    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      companyId: req.user.company_id,
      isAdmin: req.user.role === 'SUPER_ADMIN'
    });
  }
}
```

---

### 2.2 Backend - Admin Middleware

**File:** `backend/src/middleware/adminAuth.ts`

```typescript
export function AdminAuth(req: Request, res: Response, next: Function) {
  // Verify token exists
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check SUPER_ADMIN role
    if (decoded.role !== 'SUPER_ADMIN') {
      // Log unauthorized access
      auditService.log({
        action: 'unauthorized_admin_access',
        user_id: decoded.id,
        role: decoded.role,
        attempted_resource: req.path,
        timestamp: new Date(),
        ip_address: req.ip
      });

      return res.status(403).json({
        error: 'Unauthorized. Admin role required.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Decorator version for Express
export const Auth = (requiredRole?: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function(req: Request, res: Response, next: Function) {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Auth required' });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (requiredRole && decoded.role !== requiredRole) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        return originalMethod.call(this, req, res, next);
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
  };
};
```

**Apply to Admin Routes:**

```typescript
// All /admin/* routes protected with SUPER_ADMIN
router.get('/admin/companies', Auth('SUPER_ADMIN'), adminController.listCompanies);
router.post('/admin/impersonate', Auth('SUPER_ADMIN'), adminController.impersonate);
router.get('/admin/dashboard/kpis', Auth('SUPER_ADMIN'), adminController.getKPIs);
// etc...
```

---

### 2.3 Frontend - Auth Context

**File:** `frontend/lib/auth.tsx`

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    companyId: string;
    isAdmin: boolean;  // ← KEY FLAG
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      try {
        const decoded = jwt_decode(storedToken);
        setToken(storedToken);
        setUser(decoded);
      } catch (error) {
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error('Login failed');

    const data = await res.json();
    const { token, user } = data;

    localStorage.setItem('auth_token', token);
    setToken(token);
    setUser(user);

    // REDIRECT LOGIC HAPPENS HERE
    if (user.isAdmin) {
      router.push('/admin');  // ← SUPER_ADMIN → /admin
    } else if (['COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'].includes(user.role)) {
      router.push('/dashboard');  // ← OTHERS → /dashboard
    } else {
      router.push('/login');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}
```

---

### 2.4 Frontend - Route Guards (Middleware)

**File:** `frontend/middleware.ts` (Next.js 13+ middleware)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  // If no token
  if (!token) {
    // Allow only /login
    if (pathname === '/login') return NextResponse.next();
    // Redirect others to /login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded: any = jwtDecode(token);
    const isAdmin = decoded.role === 'SUPER_ADMIN';

    // Admin routes - only SUPER_ADMIN
    if (pathname.startsWith('/admin')) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Dashboard routes - not admin
    if (pathname.startsWith('/dashboard')) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Other routes
    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/']
};
```

---

### 2.5 Frontend - Layout with Auto-Redirect

**File:** `frontend/app/layout.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/auth';

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Auto-redirect based on role
  useEffect(() => {
    if (!auth.user) return; // Not logged in yet

    // SUPER_ADMIN should be on /admin
    if (auth.user.isAdmin && !pathname.startsWith('/admin')) {
      router.push('/admin');
    }

    // Others should be on /dashboard
    if (!auth.user.isAdmin && pathname.startsWith('/admin')) {
      router.push('/dashboard');
    }
  }, [auth.user, pathname, router]);

  // Show loading while checking auth
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </AuthProvider>
  );
}
```

---

### 2.6 Frontend - Admin Layout Component

**File:** `frontend/components/layouts/AdminLayout.tsx`

```typescript
import { useAuth } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // Double-check authorization (defense in depth)
  if (!auth.user?.isAdmin) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar user={auth.user} />
      <div className="flex-1 flex flex-col">
        <AdminHeader user={auth.user} onLogout={auth.logout} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Header:**

```typescript
export default function AdminHeader({ user, onLogout }: any) {
  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-lg font-bold">dnPeople Vendor Control Panel</h1>
        <p className="text-xs text-gray-500">⚙️ Vendor Console</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">Logged in as {user.name}</span>
        <button onClick={onLogout} className="text-red-600 hover:underline">
          Logout
        </button>
      </div>
    </header>
  );
}
```

**Sidebar:**

```typescript
const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Companies', href: '/admin/companies', icon: '🏢' },
  { label: 'Billing', href: '/admin/billing', icon: '💰' },
  { label: 'Support', href: '/admin/support', icon: '💬' },
  { label: 'Audit Log', href: '/admin/audit', icon: '📝' },
  { label: 'Health', href: '/admin/health', icon: '❤️' }
];

export default function AdminSidebar({ user }: any) {
  return (
    <aside className="w-56 bg-gray-900 text-white p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold">DN Tech</h2>
        <p className="text-xs text-gray-400">Vendor Operations</p>
      </div>
      <nav className="space-y-2">
        {ADMIN_NAV_ITEMS.map(item => (
          <a key={item.href} href={item.href} className="block px-4 py-2 hover:bg-gray-800 rounded">
            {item.icon} {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
```

---

### 2.7 Frontend - Customer Layout (for comparison)

**File:** `frontend/components/layouts/CustomerLayout.tsx`

```typescript
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // Double-check NOT admin
  if (auth.user?.isAdmin) {
    return <div>You should be in admin console</div>;
  }

  return (
    <div className="flex h-screen">
      <CustomerSidebar company={auth.user?.companyId} />
      <div className="flex-1 flex flex-col">
        <CustomerHeader user={auth.user} onLogout={auth.logout} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Header (Different from Admin):**

```typescript
export default function CustomerHeader({ user, onLogout }: any) {
  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-lg font-bold">dnPeople Dashboard</h1>
        <p className="text-xs text-gray-500">👥 Customer View</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">Logged in as {user.name}</span>
        <button onClick={onLogout} className="text-red-600 hover:underline">
          Logout
        </button>
      </div>
    </header>
  );
}
```

---

## 3. TESTING STRATEGY

### Unit Tests (Backend)

```typescript
describe('AuthService - isAdmin flag', () => {
  it('should set isAdmin=true for SUPER_ADMIN role', async () => {
    const result = await authService.login('dozer@dntech.id', 'password');
    expect(result.user.isAdmin).toBe(true);
    expect(result.user.role).toBe('SUPER_ADMIN');
  });

  it('should set isAdmin=false for COMPANY_ADMIN role', async () => {
    const result = await authService.login('admin@customer.com', 'password');
    expect(result.user.isAdmin).toBe(false);
    expect(result.user.role).toBe('COMPANY_ADMIN');
  });

  it('should include isAdmin in JWT payload', async () => {
    const result = await authService.login('dozer@dntech.id', 'password');
    const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
    expect(decoded.isAdmin).toBe(true);
  });
});

describe('AdminAuth middleware', () => {
  it('should allow SUPER_ADMIN access', async () => {
    const token = generateToken({ role: 'SUPER_ADMIN', isAdmin: true });
    const req = createMockRequest({ authorization: `Bearer ${token}` });
    
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should deny COMPANY_ADMIN access', async () => {
    const token = generateToken({ role: 'COMPANY_ADMIN', isAdmin: false });
    const req = createMockRequest({ authorization: `Bearer ${token}` });
    
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should log unauthorized access attempt', async () => {
    const token = generateToken({ role: 'COMPANY_ADMIN', isAdmin: false });
    const req = createMockRequest({ authorization: `Bearer ${token}` });
    
    middleware(req, res, next);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'unauthorized_admin_access' })
    );
  });
});
```

### E2E Tests (Frontend)

```typescript
test('SUPER_ADMIN login redirects to /admin', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type=email]', 'dozer@dntech.id');
  await page.fill('input[type=password]', 'password');
  await page.click('button[type=submit]');

  // Should redirect to /admin
  await expect(page).toHaveURL('/admin');
  await expect(page.locator('text=Vendor Control Panel')).toBeVisible();
});

test('COMPANY_ADMIN login redirects to /dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type=email]', 'admin@customer.com');
  await page.fill('input[type=password]', 'password');
  await page.click('button[type=submit]');

  // Should redirect to /dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Customer Dashboard')).toBeVisible();
});

test('COMPANY_ADMIN cannot access /admin', async ({ page }) => {
  // Login as COMPANY_ADMIN
  await page.goto('/login');
  await page.fill('input[type=email]', 'admin@customer.com');
  await page.fill('input[type=password]', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL('/dashboard');

  // Try to navigate to /admin
  await page.goto('/admin');

  // Should redirect back to /dashboard
  await expect(page).toHaveURL('/dashboard');
});

test('Page refresh keeps SUPER_ADMIN on /admin', async ({ page }) => {
  // Login as SUPER_ADMIN
  await page.goto('/login');
  await page.fill('input[type=email]', 'dozer@dntech.id');
  await page.fill('input[type=password]', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL('/admin');

  // Refresh page
  await page.reload();

  // Should still be on /admin
  await expect(page).toHaveURL('/admin');
});

test('Logout from /admin redirects to /login', async ({ page }) => {
  // Login as SUPER_ADMIN
  await page.goto('/login');
  await page.fill('input[type=email]', 'dozer@dntech.id');
  await page.fill('input[type=password]', 'password');
  await page.click('button[type=submit]');
  await page.waitForURL('/admin');

  // Click Logout
  await page.click('button:has-text("Logout")');

  // Should redirect to /login
  await expect(page).toHaveURL('/login');
});
```

---

## 4. DEPLOYMENT CHECKLIST

- [ ] isAdmin flag added to JWT payload (backend)
- [ ] AdminAuth middleware implemented (backend)
- [ ] All `/admin/*` routes protected with @Auth('SUPER_ADMIN')
- [ ] Auth context updated with isAdmin flag (frontend)
- [ ] Route guards implemented (Next.js middleware)
- [ ] AdminLayout component created
- [ ] CustomerLayout component created
- [ ] Header/Sidebar distinct for admin vs customer
- [ ] Unit tests passing (backend + frontend)
- [ ] E2E tests passing (all scenarios in test matrix)
- [ ] Manual testing: 5 login scenarios
- [ ] Performance: redirect < 500ms
- [ ] Security review: no auth bypass
- [ ] Deploy to staging
- [ ] Production deploy (Aug 18)

---

**Version:** 1.0 (Ready for Engineering)  
**Last Updated:** 10 Agustus 2026

