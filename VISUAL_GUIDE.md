# Authentication System - Visual Guide

## Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER OPENS BROWSER                         │
│                 http://localhost:4200/login                     │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│               LOGIN PAGE LOADS                                   │
│  - Email field                                                   │
│  - Password field                                                │
│  - "Sign in" button                                              │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│               USER ENTERS CREDENTIALS                            │
│  - Email: test@example.com                                       │
│  - Password: password123                                         │
│  - Clicks "Sign in" button                                       │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  LOGIN COMPONENT CALLS                                           │
│  AuthService.login(email, password)                             │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  HTTP POST REQUEST (VIA AUTH INTERCEPTOR)                       │
│  POST http://localhost:5000/api/auth/login                      │
│  Headers:                                                        │
│    Content-Type: application/json                               │
│  Body:                                                           │
│    { "email": "test@example.com", "password": "password123" }   │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
                    [NETWORK REQUEST]
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND: AuthEndpoints                              │
│  - Receives LoginRequest                                         │
│  - Sends LoginCommand via MediatR                               │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND: LoginCommandHandler                        │
│  1. Query Users table for email                                  │
│  2. Verify password hash (SHA256)                               │
│  3. Check IsActive status                                        │
│  4. Update LastLoginAt timestamp                                 │
│  5. Generate token (PasswordService)                             │
│  6. Create UserDto response                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND DATABASE (PostgreSQL)                       │
│  Users Table:                                                    │
│  ┌─────────────────────────────────────────┐                    │
│  │ id | email | password_hash | last_login │                    │
│  ├─────────────────────────────────────────┤                    │
│  │ 123| test@ | hash... | 2024-01-15 10:30│ ← UPDATED          │
│  └─────────────────────────────────────────┘                    │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              HTTP RESPONSE (200 OK)                              │
│  {                                                               │
│    "success": true,                                              │
│    "message": "Login successful",                                │
│    "token": "token_123456_9876543210",                          │
│    "user": {                                                     │
│      "id": "123456",                                             │
│      "email": "test@example.com",                               │
│      "firstName": "Test",                                        │
│      "lastName": "User",                                         │
│      "role": "User"                                              │
│    }                                                             │
│  }                                                               │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: AuthService receives response                        │
│  1. Store token in localStorage['auth_token']                   │
│  2. Store user in localStorage['current_user']                  │
│  3. Update currentUser$ BehaviorSubject                          │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: LoginComponent                                        │
│  1. Redirects to /dashboard                                      │
│  2. AuthGuard checks authentication (✅ PASS)                   │
│  3. DashboardComponent loads                                     │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              DASHBOARD DISPLAYS                                  │
│  - User is logged in                                             │
│  - Any API calls now include auth token via AuthInterceptor     │
│  - LocalStorage has token for future sessions                   │
└─────────────────────────────────────────────────────────────────┘
```

## Registration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER OPENS BROWSER                         │
│               http://localhost:4200/register                    │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│               REGISTER PAGE LOADS                                │
│  - First Name field                                              │
│  - Last Name field                                               │
│  - Email field                                                   │
│  - Password field                                                │
│  - Confirm Password field                                        │
│  - "Create Account" button                                       │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│               USER FILLS FORM                                    │
│  - First Name: John                                              │
│  - Last Name: Doe                                                │
│  - Email: john@example.com                                      │
│  - Password: Password123                                         │
│  - Confirm Password: Password123                                 │
│  - Clicks "Create Account" button                                │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  REGISTER COMPONENT CALLS                                       │
│  AuthService.register(email, password, firstName, lastName)     │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  HTTP POST REQUEST (VIA AUTH INTERCEPTOR)                       │
│  POST http://localhost:5000/api/auth/register                   │
│  Headers:                                                        │
│    Content-Type: application/json                               │
│  Body:                                                           │
│    {                                                             │
│      "email": "john@example.com",                               │
│      "password": "Password123",                                  │
│      "firstName": "John",                                        │
│      "lastName": "Doe"                                           │
│    }                                                             │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND: RegisterCommandHandler                     │
│  1. Check email not already used                                 │
│  2. Create new User entity                                       │
│  3. Hash password (SHA256)                                       │
│  4. Set Role = "User", IsActive = true                          │
│  5. Save to database                                             │
│  6. Generate token                                               │
│  7. Create UserDto response                                      │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND DATABASE (PostgreSQL)                       │
│  Users Table:                                                    │
│  ┌──────────────────────────────────────────┐                   │
│  │ id | email | password_hash | created_at  │                   │
│  ├──────────────────────────────────────────┤                   │
│  │ 456| john@ | hash... | 2024-01-15 10:40 │ ← NEW RECORD      │
│  └──────────────────────────────────────────┘                   │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              HTTP RESPONSE (201 CREATED)                         │
│  {                                                               │
│    "success": true,                                              │
│    "message": "User registered successfully",                    │
│    "token": "token_456789_9876543210",                          │
│    "user": {                                                     │
│      "id": "456789",                                             │
│      "email": "john@example.com",                               │
│      "firstName": "John",                                        │
│      "lastName": "Doe",                                          │
│      "role": "User"                                              │
│    }                                                             │
│  }                                                               │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: AuthService receives response                        │
│  1. Store token in localStorage['auth_token']                   │
│  2. Store user in localStorage['current_user']                  │
│  3. Update currentUser$ BehaviorSubject                          │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: RegisterComponent                                     │
│  1. Redirects to /dashboard                                      │
│  2. ✅ USER CAN NOW LOGIN                                       │
│  3. ✅ TOKEN PERSISTS IN LOCALSTORAGE                           │
└─────────────────────────────────────────────────────────────────┘
```

## Protected Route Access Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER NAVIGATES                              │
│                   http://localhost:4200/dashboard               │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│         ANGULAR ROUTER DETECTS ROUTE CHANGE                     │
│              AuthGuard.canActivate() triggers                    │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│           AuthGuard CHECKS AUTHENTICATION                        │
│  ┌──────────────────────────────────────────┐                   │
│  │ Is user authenticated?                   │                   │
│  │ AuthService.isAuthenticated()            │                   │
│  │  - Check localStorage for token          │                   │
│  │  - Check currentUser$ is set             │                   │
│  └──────────────────────────────────────────┘                   │
└──────────────────┬─────────────────────┬──────────────────────┘
                   │                     │
           ✅ YES  │                     │ ❌ NO
                   ↓                     ↓
    ┌──────────────────────────┐  ┌──────────────────────────┐
    │ ROUTE ALLOWED            │  │ REDIRECT TO LOGIN        │
    │ DashboardComponent loads │  │ with returnUrl=          │
    │                          │  │ /dashboard              │
    │ Displays:                │  │                          │
    │ - User data              │  │ Next login redirects     │
    │ - API calls with token   │  │ back to dashboard        │
    │   (via AuthInterceptor)  │  └──────────────────────────┘
    └──────────────────────────┘
```

## Token Attachment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│         COMPONENT MAKES HTTP REQUEST                            │
│  this.http.get('/api/loads')                                    │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│         AUTH INTERCEPTOR INTERCEPTS REQUEST                      │
│  AuthInterceptor.intercept(req, next)                           │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│      INTERCEPTOR CHECKS FOR TOKEN                               │
│  token = AuthService.getToken()                                 │
│  if (token) { ... }                                              │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│      ADDS AUTHORIZATION HEADER                                  │
│  req.clone({                                                     │
│    setHeaders: {                                                 │
│      Authorization: `Bearer ${token}`                           │
│    }                                                             │
│  })                                                              │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│         REQUEST SENT TO BACKEND                                 │
│  GET /api/loads                                                 │
│  Headers:                                                        │
│    Authorization: Bearer token_123456_9876543210              │
│    Content-Type: application/json                               │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│        BACKEND RECEIVES REQUEST WITH TOKEN                      │
│  - Can verify token if needed                                    │
│  - Processes request                                             │
│  - Returns response                                              │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
PROJECT ROOT: c:\Users\cable\OneDrive\Desktop\TMS

BACKEND (C# / .NET 8)
├── backend/src/API/
│   ├── Program.cs ← DbContext, Services, Auth Endpoints
│   ├── Endpoints/AuthEndpoints.cs ← /api/auth/login, register
│   └── bin/, obj/ (compiled)
├── backend/src/Application/
│   ├── Commands/AuthCommands.cs ← LoginCommand, RegisterCommand + Handlers
│   ├── DTOs/AuthDTOs.cs ← LoginRequest, LoginResponse, UserDto
│   └── Queries/
├── backend/src/Domain/
│   ├── Entities/Users/User.cs ← User entity
│   └── Common/
├── backend/src/Infrastructure/
│   ├── Services/AuthServices.cs ← PasswordService, TokenService
│   ├── Persistence/TMSDbContext.cs ← DbContext with Users DbSet
│   └── bin/, obj/ (compiled)
└── backend/TMS.sln

FRONTEND (Angular 17)
├── frontend/apps/web/src/
│   ├── main.ts ← AuthInterceptor registration
│   ├── app/
│   │   ├── pages/auth/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   ├── login.component.scss
│   │   │   ├── register.component.ts
│   │   │   ├── register.component.html
│   │   │   └── register.component.scss
│   │   ├── services/auth.service.ts ← login, register, logout
│   │   ├── guards/auth.guard.ts ← route protection
│   │   ├── interceptors/auth.interceptor.ts ← token attachment
│   │   └── app.routes.ts ← route config with AuthGuard
│   └── styles.scss
├── package.json
├── angular.json
└── proxy.conf.json ← /api → localhost:5000

DOCUMENTATION
├── AUTHENTICATION_SETUP.md ← Comprehensive guide
├── QUICK_START.md ← Testing guide
├── USER_SCHEMA.md ← Technical reference
├── IMPLEMENTATION_COMPLETE.md ← Summary
├── COMMANDS_TO_RUN.md ← Commands list
└── This file (VISUAL_GUIDE.md)
```

## Component Relationships

```
┌─────────────────┐
│  LoginComponent │ ──┐
│  - Form         │   │
│  - HTTP call    │   │
│  - Redirect     │   │
└─────────────────┘   │
                      │
                      ↓
              ┌────────────────────┐
              │  AuthService       │ ◄─── ┌─────────────────┐
              │  - login()         │      │ AuthInterceptor │
              │  - register()      │      │ - Adds token    │
              │  - logout()        │      │   to all HTTP   │
              │  - currentUser$    │      └─────────────────┘
              │  - localStorage    │
              └────────────────────┘
                      ↑
                      │
    ┌─────────────────┴──────────────────┬──────────────────────┐
    │                                    │                      │
┌───────────────────┐         ┌──────────────────┐    ┌─────────────┐
│  AuthGuard        │         │DashboardComponent│    │LoadBoardPage│
│ - canActivate()   │         │ - Uses data      │    │ - Uses data │
│ - Check auth      │         │ - Protected      │    │ - Protected │
│ - Redirect/allow  │         └──────────────────┘    └─────────────┘
└───────────────────┘
    
        ↑
        │
    Routes

┌─────────────────────────────────────────────────────────────┐
│  BACKEND                                                    │
├─────────────────────────────────────────────────────────────┤
│  /api/auth/login     (AuthEndpoints)                        │
│  /api/auth/register  (AuthEndpoints)                        │
│    ↓                                                         │
│  MediatR (Mediator Pattern)                                 │
│    ↓                                                         │
│  LoginCommand/RegisterCommand (CQRS Commands)              │
│    ↓                                                         │
│  LoginCommandHandler/RegisterCommandHandler                │
│    ├─ AuthServices (PasswordService, TokenService)         │
│    └─ TMSDbContext (PostgreSQL Database)                   │
└─────────────────────────────────────────────────────────────┘
```

## Storage Diagram

```
BROWSER
├── LocalStorage
│   ├── auth_token: "token_123456_9876543210"
│   └── current_user: '{"id":"123456","email":"test@...","firstName":"Test",...}'
├── SessionStorage (not used)
└── Cookies (not used)

SERVER (Node.js)
├── In-memory
│   └── Express session store (not used for JWT)
├── Database
│   └── Redis (not used)
└── Files (not used)

DATABASE (PostgreSQL)
└── tms_db
    └── users table
        ├── id: UUID
        ├── email: string
        ├── password_hash: string
        ├── first_name: string
        ├── last_name: string
        ├── role: string
        ├── is_active: boolean
        ├── created_at: timestamp
        └── last_login_at: timestamp
```

---

**Visual Reference Complete** - Use this guide to understand the flow of data through the authentication system.
