# Authentication Setup - Complete Guide

## Overview
This guide covers the complete authentication implementation using PostgreSQL, JWT tokens, and role-based access control.

## Prerequisites
- PostgreSQL running on `localhost:5432`
- .NET 8 SDK installed
- Node.js 18+ and npm installed
- Angular CLI v17+

## Backend Setup

### 1. Database Configuration

**Connection String** (in `Program.cs`):
```
Server=localhost;Port=5432;Database=tms_db;User Id=postgres;Password=postgres;
```

To use a different PostgreSQL instance, update the connection string in:
- `backend/src/API/Program.cs` (line 37)

### 2. Create Database Migrations

Run these commands in the `backend/src/API` directory:

```bash
# Add migration for User authentication
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj

# Apply migration to database
dotnet ef database update
```

This creates:
- `tms_db` PostgreSQL database
- `users` table with schema:
  - `id` (UUID, primary key)
  - `email` (varchar(255), unique)
  - `password_hash` (text)
  - `first_name` (varchar(100))
  - `last_name` (varchar(100))
  - `role` (varchar(50), default 'User')
  - `is_active` (boolean, default true)
  - `created_at` (timestamp)
  - `last_login_at` (timestamp, nullable)
  - `carrier_id` (UUID, nullable, foreign key)

### 3. Seed Test User

When the backend starts, it automatically seeds a test user if the database is empty:
- **Email**: `test@example.com`
- **Password**: `password123`
- **Role**: User
- **Status**: Active

To manually create additional users, use the Register endpoint.

### 4. Backend Services

#### PasswordService (`TMS.Infrastructure.Services.AuthServices.cs`)
- `HashPassword(password)`: SHA256 hash with Base64 encoding
- `VerifyPassword(password, hash)`: Compares password hash

#### TokenService (`TMS.Infrastructure.Services.AuthServices.cs`)
- `GenerateToken(userId)`: Currently returns placeholder token
- **TODO**: Implement JWT token generation using System.IdentityModel.Tokens.Jwt

**Future JWT Implementation**:
```csharp
var tokenHandler = new JwtSecurityTokenHandler();
var key = Encoding.ASCII.GetBytes(jwtSecret);
var tokenDescriptor = new SecurityTokenDescriptor
{
    Subject = new ClaimsIdentity(new[] 
    {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        new Claim(ClaimTypes.Email, email),
        new Claim(ClaimTypes.Role, role)
    }),
    Expires = DateTime.UtcNow.AddHours(24),
    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
        SecurityAlgorithms.HmacSha256Signature)
};
var token = tokenHandler.CreateToken(tokenDescriptor);
return tokenHandler.WriteToken(token);
```

### 5. API Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "token": "token_[userId]_[ticks]",
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "User",
    "carrierId": null
  }
}

Error 400: Email already registered
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "token": "token_[userId]_[ticks]",
  "user": {
    "id": "guid",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "User",
    "carrierId": null
  }
}

Error 401: Invalid credentials
```

## Frontend Setup

### 1. Environment Configuration

Update proxy in `frontend/apps/web/proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### 2. Components

#### LoginComponent (`src/app/pages/auth/login.component.ts`)
- Route: `/login`
- Features:
  - Email and password form validation
  - Error handling and display
  - Loading state during authentication
  - Stores token and user in localStorage
  - Redirects to `/dashboard` on success

#### RegisterComponent (`src/app/pages/auth/register.component.ts`)
- Route: `/register`
- Features:
  - Form validation (email, passwords match, min length)
  - First name and last name fields
  - Password confirmation
  - Error handling
  - Redirects to `/dashboard` on success
  - Link to login page for existing users

#### AuthService (`src/app/services/auth.service.ts`)
```typescript
// Login
authService.login(email, password).subscribe({
  next: (response) => {
    // User logged in, currentUser$ updated, localStorage populated
  },
  error: (error) => {
    // Handle login error
  }
});

// Register
authService.register(email, password, firstName, lastName).subscribe({
  next: () => {
    // User registered and logged in
  },
  error: (error) => {
    // Handle registration error
  }
});

// Logout
authService.logout();

// Check authentication status
authService.isAuthenticated(); // boolean

// Get current user
authService.getCurrentUser(); // User | null

// Get token
authService.getToken(); // string | null

// Subscribe to user changes
authService.currentUser$.subscribe(user => {
  // React to user changes
});
```

### 3. AuthInterceptor (`src/app/interceptors/auth.interceptor.ts`)

Automatically attaches JWT token to all HTTP requests:
```
Authorization: Bearer {token}
```

Registered in `main.ts`:
```typescript
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

### 4. AuthGuard (`src/app/guards/auth.guard.ts`)

Protects routes requiring authentication. Usage in routes:
```typescript
{ 
  path: 'dashboard', 
  component: DashboardPage,
  canActivate: [AuthGuard]
}
```

Routes with AuthGuard:
- `/dashboard` ✓
- `/load-board` ✓
- `/load-details` ✓
- `/settings` ✓

Routes without guard (accessible to all):
- `/login`
- `/register`
- `/` (redirects to dashboard, which requires auth)

### 5. Storage

Auth data stored in `localStorage`:
```javascript
// Token
localStorage.getItem('auth_token')

// User object
localStorage.getItem('current_user')
```

To clear auth:
```typescript
authService.logout();
// or manually:
localStorage.removeItem('auth_token');
localStorage.removeItem('current_user');
```

## Testing the Authentication Flow

### 1. Start Backend
```bash
cd backend/src/API
dotnet run
```
- Runs on `http://localhost:5000`
- Swagger docs at `http://localhost:5000/swagger`
- Auto-migrates database
- Seeds test user on first run

### 2. Start Frontend
```bash
cd frontend
npm start
```
- Runs on `http://localhost:4200`
- Proxies API calls to backend

### 3. Test Login Flow
1. Navigate to `http://localhost:4200/login`
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign in"
4. Should redirect to `/dashboard`
5. Verify token in browser `localStorage`:
   ```javascript
   localStorage.getItem('auth_token')
   ```

### 4. Test Registration Flow
1. Navigate to `http://localhost:4200/register`
2. Fill in form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `securePassword123`
   - Confirm Password: `securePassword123`
3. Click "Create Account"
4. Should redirect to `/dashboard`

### 5. Test Protected Routes
1. Log out: Check localStorage becomes empty
2. Try accessing `/dashboard` directly
3. Should redirect to `/login` with `?returnUrl=/dashboard`
4. After login, should redirect back to dashboard

### 6. Test Automatic Token Attachment
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to any protected route
4. Check HTTP requests to `/api/*`
5. Verify `Authorization: Bearer {token}` header in requests

## Security Considerations

### Current Implementation
✓ Password hashing: SHA256 with Base64 encoding
✓ CORS: Configured for development (AllowAll)
✓ Route protection: AuthGuard on protected routes
✓ Token storage: localStorage (client-side)

### Recommended Enhancements
- [ ] Implement JWT tokens (currently placeholder)
- [ ] Add token refresh mechanism
- [ ] Use httpOnly cookies instead of localStorage
- [ ] Implement password complexity requirements
- [ ] Add rate limiting to auth endpoints
- [ ] Implement email verification for registration
- [ ] Add role-based authorization checks
- [ ] Implement logout on all devices
- [ ] Add two-factor authentication
- [ ] Monitor suspicious login attempts

### CORS Configuration (Production)
Update in `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecific", builder =>
    {
        builder.WithOrigins("https://yourdomain.com")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

## Troubleshooting

### Database Connection Failed
```
Error: "could not translate host name "localhost" to address"
```
- Ensure PostgreSQL is running
- Verify connection string in Program.cs
- Check PostgreSQL is listening on port 5432

### Migration Errors
```bash
# Delete and reset migrations
dotnet ef database drop
dotnet ef migrations remove
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj
dotnet ef database update
```

### Login Returns 401
1. Verify test user was seeded: check backend console output
2. Try resetting database and rerunning migrations
3. Test API directly with curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Token Not Attached to Requests
1. Check AuthInterceptor is registered in main.ts
2. Verify token exists in localStorage
3. Check DevTools Network tab for Authorization header

### AuthGuard Not Redirecting to Login
1. Ensure AuthGuard is applied to routes in app.routes.ts
2. Check AuthService.isAuthenticated() returns false
3. Verify localStorage is cleared

## Next Steps

1. **Implement JWT Tokens**
   - Install NuGet: `System.IdentityModel.Tokens.Jwt`
   - Add JWT secret to appsettings.json
   - Update TokenService.GenerateToken()

2. **Add Email Verification**
   - Send verification email on registration
   - Add email_verified column to User entity

3. **Implement Refresh Tokens**
   - Add RefreshToken entity
   - Add /api/auth/refresh endpoint
   - Update AuthService to refresh expired tokens

4. **Role-Based Authorization**
   - Create role-based authorization attributes
   - Implement role checks in endpoints and components

5. **Add User Profile Management**
   - Create /api/auth/profile endpoint
   - Allow users to update their information
   - Add change password functionality

6. **Database Backups**
   - Set up PostgreSQL backup schedule
   - Document recovery procedures

## Files Modified

### Backend
- `backend/src/Domain/Entities/Users/User.cs` - User entity
- `backend/src/Application/DTOs/AuthDTOs.cs` - Auth data transfer objects
- `backend/src/Application/Commands/AuthCommands.cs` - Login/Register commands with handlers
- `backend/src/Infrastructure/Services/AuthServices.cs` - Password and token services
- `backend/src/Infrastructure/Persistence/TMSDbContext.cs` - Added Users DbSet
- `backend/src/API/Endpoints/AuthEndpoints.cs` - Auth API endpoints
- `backend/src/API/Program.cs` - DbContext registration, service registration, seeding

### Frontend
- `frontend/apps/web/src/main.ts` - AuthInterceptor registration
- `frontend/apps/web/src/app/pages/auth/login.component.ts` - Login form
- `frontend/apps/web/src/app/pages/auth/register.component.ts` - Registration form
- `frontend/apps/web/src/app/services/auth.service.ts` - Auth state management
- `frontend/apps/web/src/app/guards/auth.guard.ts` - Route protection
- `frontend/apps/web/src/app/interceptors/auth.interceptor.ts` - Token injection
- `frontend/apps/web/src/app/app.routes.ts` - Route configuration with guards

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs in terminal
3. Check browser console (F12 > Console)
4. Check browser Network tab for HTTP responses
5. Review swagger documentation at `http://localhost:5000/swagger`
