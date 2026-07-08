# AUTH FLOW REVISED - TENANT SLUG SIMPLIFIED
## Registration & Login Architecture untuk dnPeople

**Version:** 1.1 Revised (aligned with codebase)  
**Date:** June 2026 · **Implementation sync:** 3 Juli 2026  
**Status:** Implemented

> ### ✅ Status Implementasi (Jul 2026)
> | Fitur | Status | Catatan |
> |-------|--------|---------|
> | Login email + password (tanpa slug) | ✅ | `POST /auth/login` |
> | Register — slug **auto-generate** dari nama perusahaan | ✅ | `POST /auth/register` — field `slug` opsional |
> | JWT access + refresh token | ✅ | |
> | 2FA TOTP + OTP di login page | ✅ | `/settings/2fa`, LoginPage OTP step |
> | Google SSO | ✅ | `POST /auth/sso/login` |
> | OAuth2 client_credentials | ✅ | Machine-to-machine |
> | Login throttling | ✅ | 5 attempts / 15 min lockout |
> | Forgot / reset password | ✅ | |
>
> **Live status:** [`12-PROJECT-STATUS.md`](12-PROJECT-STATUS.md)

---

## 📌 KONSEP YANG BENAR

### Tenant Slug TIDAK Harus di URL
- ✅ Tenant slug adalah identifier internal yang disimpan di database
- ✅ Hanya PT/organisasi yang tahu slug mereka
- ✅ User hanya perlu tahu email/username mereka
- ✅ Sistem otomatis detect slug dari email/user record

### Flow Yang Benar:
```
REGISTRATION (PT/Admin melakukan registrasi)
└─ Input: Nama Perusahaan + Admin Email + Password
   └─ Slug: AUTO-GENERATE dari nama perusahaan (opsional override via API)
   └─ Hasil: Tenant dibuat dengan slug unik

LOGIN (User login)
└─ Input: Email + Password (HANYA ITU) [+ OTP jika 2FA aktif]
   └─ Sistem: Query slug dari user.tenant_id → database
   └─ Hasil: User login ke tenant mereka
```

---

## 1. REGISTRATION FLOW

### 1.1 Simple Registration Page

```
┌─────────────────────────────────────┐
│   CLOUDCRP - Create New Account     │
├─────────────────────────────────────┤
│                                     │
│  Company Name:                      │
│  [_____________________]            │
│                                     │
│  Company Slug (ID unik):            │
│  [_____________________]            │
│  * Hanya huruf, angka, hyphen       │
│  * Contoh: "pt-abc-indonesia"       │
│                                     │
│  Admin Email:                       │
│  [_____________________]            │
│                                     │
│  Admin Password:                    │
│  [_____________________]            │
│                                     │
│  [ Create Account ]                 │
│                                     │
└─────────────────────────────────────┘
```

### 1.2 Registration API

```typescript
// POST /api/v1/auth/register

Request Body:
{
  "companyName": "PT ABC Indonesia",
  "slug": "pt-abc-indonesia",
  "adminEmail": "admin@abc.com",
  "adminPassword": "SecurePassword123"
}

Response (201):
{
  "success": true,
  "message": "Tenant created successfully",
  "tenant": {
    "id": "uuid-tenant-123",
    "name": "PT ABC Indonesia",
    "slug": "pt-abc-indonesia",
    "createdAt": "2024-06-28T10:00:00Z"
  },
  "user": {
    "id": "uuid-user-123",
    "email": "admin@abc.com",
    "role": "ADMIN"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Errors:
- 409 Conflict: Slug sudah digunakan
- 400 Bad Request: Email sudah terdaftar
- 400 Bad Request: Slug format invalid
```

### 1.3 Database Schema untuk Registration

```sql
-- Tenant Master Table (shared database)
CREATE TABLE tenant_master (
  id UUID PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Table (shared database - semua user dari semua tenant)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenant_master(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'USER',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id, email) -- Email unik per tenant
);

-- Contoh Data:
INSERT INTO tenant_master (id, slug, name)
VALUES ('t1', 'pt-abc-indonesia', 'PT ABC Indonesia');

INSERT INTO users (id, tenant_id, email, password_hash, role)
VALUES ('u1', 't1', 'admin@abc.com', 'hashed_password', 'ADMIN');
```

### 1.4 Registration Service (NestJS)

```typescript
// src/modules/auth/auth.service.ts

import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Tenant } from '../tenants/entities/tenant.entity';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(
    companyName: string,
    slug: string,
    adminEmail: string,
    adminPassword: string,
  ) {
    // 1. Validate slug format
    if (!/^[a-z0-9-]{3,50}$/.test(slug)) {
      throw new BadRequestException(
        'Slug hanya boleh berisi huruf kecil, angka, dan hyphen (3-50 karakter)'
      );
    }

    // 2. Check slug already exists
    const existingTenant = await this.tenantRepo.findOne({
      where: { slug },
    });
    
    if (existingTenant) {
      throw new ConflictException('Slug sudah digunakan');
    }

    // 3. Create tenant
    const tenant = this.tenantRepo.create({
      name: companyName,
      slug: slug,
      email: adminEmail,
      isActive: true,
    });

    const savedTenant = await this.tenantRepo.save(tenant);

    // 4. Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // 5. Create admin user
    const user = this.userRepo.create({
      tenantId: savedTenant.id,
      email: adminEmail,
      passwordHash: passwordHash,
      role: 'ADMIN',
      isActive: true,
    });

    const savedUser = await this.userRepo.save(user);

    // 6. Generate tokens
    const tokens = this.generateTokens({
      userId: savedUser.id,
      email: savedUser.email,
      tenantId: savedTenant.id,
      slug: savedTenant.slug,
    });

    return {
      tenant: {
        id: savedTenant.id,
        name: savedTenant.name,
        slug: savedTenant.slug,
      },
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private generateTokens(payload: any) {
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
```

---

## 2. LOGIN FLOW

### 2.1 Simple Login Page

```
┌─────────────────────────────────────┐
│   CLOUDCRP - Login                  │
├─────────────────────────────────────┤
│                                     │
│  Email:                             │
│  [_____________________]            │
│                                     │
│  Password:                          │
│  [_____________________]            │
│                                     │
│  [ Login ]                          │
│                                     │
│  Don't have account? Register here  │
│                                     │
└─────────────────────────────────────┘

Note: TIDAK ADA input untuk tenant/slug!
User hanya butuh email + password.
Sistem otomatis ketemu tenant mereka dari email.
```

### 2.2 Login API

```typescript
// POST /api/v1/auth/login

Request Body (SIMPLE):
{
  "email": "admin@abc.com",
  "password": "SecurePassword123"
}

Response (200):
{
  "success": true,
  "user": {
    "id": "uuid-user-123",
    "email": "admin@abc.com",
    "firstName": "Admin",
    "lastName": "ABC"
  },
  "tenant": {
    "id": "uuid-tenant-123",
    "name": "PT ABC Indonesia",
    "slug": "pt-abc-indonesia"  // Sistem yang provide, bukan user
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}

Errors:
- 401 Unauthorized: Email tidak ditemukan
- 401 Unauthorized: Password salah
- 403 Forbidden: User sudah tidak aktif
- 409 Conflict: Tenant sedang maintenance
```

### 2.3 Login Flow Diagram

```
User: admin@abc.com / password123
         │
         ▼
    ┌────────────────────┐
    │ Query users table  │
    │ WHERE email = ...  │
    └────────┬───────────┘
             │
             ▼
      ┌──────────────────┐
      │ User ditemukan?  │
      └──┬───────────┬───┘
         │           │
        YA           TIDAK
         │           └─→ ❌ 401 Unauthorized
         │
         ▼
    ┌────────────────────────────┐
    │ Verify password dengan     │
    │ bcrypt.compare()           │
    └────────┬───────────────────┘
             │
             ▼
      ┌──────────────────┐
      │ Password benar?  │
      └──┬───────────┬───┘
         │           │
        YA           TIDAK
         │           └─→ ❌ 401 Unauthorized
         │
         ▼
    ┌────────────────────────────┐
    │ Query tenant dari user.    │
    │ tenant_id                  │
    │ SELECT * FROM tenants      │
    │ WHERE id = user.tenant_id  │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ Check tenant is active     │
    └────────┬───────────────────┘
             │
             ▼
      ┌──────────────────┐
      │ Tenant aktif?    │
      └──┬───────────┬───┘
         │           │
        YA           TIDAK
         │           └─→ ❌ 403 Forbidden
         │
         ▼
    ┌────────────────────┐
    │ Generate JWT token │
    │ payload: {         │
    │   userId,          │
    │   tenantId,        │
    │   slug,            │
    │   email,           │
    │   roles            │
    │ }                  │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Return token +     │
    │ user info +        │
    │ tenant info        │
    └────────┬───────────┘
             │
             ▼
        ✅ 200 OK
```

### 2.4 Login Service (NestJS)

```typescript
// src/modules/auth/auth.service.ts (LOGIN METHOD)

async login(email: string, password: string) {
  // 1. Find user by email
  const user = await this.userRepo.findOne({
    where: { email },
    relations: ['tenant'], // Load tenant relationship
  });

  if (!user) {
    throw new UnauthorizedException('Email atau password salah');
  }

  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Email atau password salah');
  }

  // 3. Check user is active
  if (!user.isActive) {
    throw new ForbiddenException('User sudah tidak aktif');
  }

  // 4. Check tenant is active
  const tenant = user.tenant;
  
  if (!tenant.isActive) {
    throw new ForbiddenException('Tenant sedang tidak aktif');
  }

  // 5. Generate tokens
  const payload = {
    userId: user.id,
    email: user.email,
    tenantId: tenant.id,
    slug: tenant.slug, // Slug diambil dari database
    roles: user.roles || ['USER'],
  };

  const tokens = this.generateTokens(payload);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug, // Sistem yang provide
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 3600,
  };
}
```

### 2.5 Login Controller

```typescript
// src/modules/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // No auth required
  @Post('login')
  @ApiOperation({ summary: 'User login dengan email & password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: { id: 'uuid', email: 'admin@abc.com' },
        tenant: { id: 'uuid', slug: 'pt-abc-indonesia' },
        accessToken: 'jwt...',
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register tenant baru' })
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto.companyName,
      registerDto.slug,
      registerDto.adminEmail,
      registerDto.adminPassword,
    );
  }
}
```

---

## 3. DTO (Data Transfer Objects)

### 3.1 Login DTO

```typescript
// src/modules/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@abc.com',
    description: 'Email address of the user'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'Password'
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
```

### 3.2 Register DTO

```typescript
// src/modules/auth/dto/register.dto.ts

import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'PT ABC Indonesia',
    description: 'Company/Tenant name'
  })
  @IsNotEmpty()
  @MinLength(3)
  companyName: string;

  @ApiProperty({
    example: 'pt-abc-indonesia',
    description: 'Unique tenant slug (lowercase, hyphen, alphanumeric only)'
  })
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]{3,50}$/, {
    message: 'Slug hanya boleh huruf kecil, angka, hyphen (3-50 karakter)'
  })
  slug: string;

  @ApiProperty({
    example: 'admin@abc.com',
    description: 'Admin email'
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'Admin password'
  })
  @IsNotEmpty()
  @MinLength(8)
  adminPassword: string;
}
```

---

## 4. JWT TOKEN STRUCTURE

### 4.1 Access Token (1 hour validity)

```typescript
{
  "sub": "user-uuid-123",           // User ID
  "email": "admin@abc.com",         // User email
  "tenantId": "tenant-uuid-123",    // Tenant ID
  "slug": "pt-abc-indonesia",       // Tenant slug (dari database)
  "roles": ["ADMIN"],               // User roles
  "iat": 1719557400,                // Issued at
  "exp": 1719561000                 // Expires in 1 hour
}
```

### 4.2 Refresh Token (7 days validity)

```typescript
{
  "sub": "user-uuid-123",
  "email": "admin@abc.com",
  "tenantId": "tenant-uuid-123",
  "slug": "pt-abc-indonesia",
  "roles": ["ADMIN"],
  "type": "refresh",
  "iat": 1719557400,
  "exp": 1720162200              // Expires in 7 days
}
```

---

## 5. KEAMANAN

### 5.1 Apa yang TIDAK perlu user input:

```
❌ Tenant Slug (di login page)
❌ Tenant ID
❌ Database Schema
❌ Company Information

✅ Yang perlu user input:
  - Email
  - Password
  - Hanya untuk registrasi: Company Name + Slug
```

### 5.2 Validasi

```typescript
// ALWAYS validate di server side
if (!loginDto.email || !loginDto.password) {
  throw new BadRequestException('Email dan password harus diisi');
}

// Email must be valid
if (!isValidEmail(loginDto.email)) {
  throw new BadRequestException('Email format tidak valid');
}

// Password minimum 8 karakter
if (loginDto.password.length < 8) {
  throw new BadRequestException('Password minimal 8 karakter');
}

// Slug hanya bisa di registrasi, tidak boleh di-override di login
if (loginRequest.slug) {
  throw new BadRequestException('Slug tidak boleh di-input saat login');
}
```

### 5.3 Rate Limiting

```typescript
// src/common/guards/rate-limit.guard.ts

// Limit login attempts
- Max 5 failed attempts per 15 minutes
- Lock account untuk 15 menit setelah 5 kali gagal
- Log semua failed login attempts

// Limit registration
- Max 5 registrasi per 1 jam dari IP yang sama
- Validasi email harus unique
```

---

## 6. CONTOH IMPLEMENTASI FRONTEND

### 6.1 Login Component (React)

```tsx
// src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simple request: email + password ONLY
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password,
      });

      // Save tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Save tenant info (from response, NOT user input)
      localStorage.setItem('tenantId', response.data.tenant.id);
      localStorage.setItem('tenantSlug', response.data.tenant.slug); // Dari server
      
      // Redirect ke dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Email atau password salah');
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>dnPeople - Login</h1>
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@abc.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Belum punya akun? <a href="/register">Daftar di sini</a>
      </p>
    </div>
  );
};
```

### 6.2 Register Component (React)

```tsx
// src/pages/Register.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const RegisterPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/register', {
        companyName,
        slug,
        adminEmail,
        adminPassword,
      });

      // Save tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Save tenant info
      localStorage.setItem('tenantId', response.data.tenant.id);
      localStorage.setItem('tenantSlug', response.data.tenant.slug);
      
      // Redirect ke setup wizard
      navigate('/setup');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Slug sudah digunakan');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Format tidak valid');
      } else {
        setError('Registrasi gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>dnPeople - Registrasi</h1>
      
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Nama Perusahaan:</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="PT ABC Indonesia"
            required
          />
        </div>

        <div className="form-group">
          <label>Slug (ID Unik):</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="pt-abc-indonesia"
            pattern="^[a-z0-9-]{3,50}$"
            title="Hanya huruf kecil, angka, dan hyphen (3-50 karakter)"
            required
          />
          <small>Contoh: pt-abc-indonesia, toko-buku-online</small>
        </div>

        <div className="form-group">
          <label>Email Admin:</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@abc.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password (min 8 karakter):</label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="••••••••"
            minLength={8}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Membuat akun...' : 'Daftar'}
        </button>
      </form>

      <p>
        Sudah punya akun? <a href="/login">Login di sini</a>
      </p>
    </div>
  );
};
```

---

## 7. SUMMARY

| Aspek | Sebelumnya (SALAH) | Sekarang (BENAR) |
|-------|-------------------|-----------------|
| **Login Page** | Ada input tenant/slug | TIDAK ada input tenant |
| **User Input** | Email + Slug | Email + Password ONLY |
| **Slug** | Dari URL / User input | Disimpan di database |
| **Cara Identify** | Dari URL subdomain | Dari user.tenant_id |
| **Yang Tahu Slug** | Semua orang (di URL) | Hanya PT (di database) |
| **Security** | Rendah | Tinggi |

---

## 8. QUICK REFERENCE

### Registration
```
POST /api/v1/auth/register
{
  "companyName": "PT ABC",
  "slug": "pt-abc",           // PT decide ini
  "adminEmail": "admin@abc.com",
  "adminPassword": "password"
}
```

### Login
```
POST /api/v1/auth/login
{
  "email": "admin@abc.com",    // User tahu ini
  "password": "password"        // User tahu ini
}
// BUKAN ada slug input!
```

---

**Version:** 1.0 Revised  
**Status:** Correct Implementation  
**Last Updated:** June 2026

