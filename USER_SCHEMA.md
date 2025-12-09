# User Authentication Schema

## User Entity

**Location**: `backend/src/Domain/Entities/Users/User.cs`

### Properties

| Property | Type | Constraints | Description |
|----------|------|-----------|-------------|
| `Id` | Guid | PK, auto-generated | Primary key, unique identifier |
| `Email` | string | Required, Unique, Max 255 | User's email address |
| `PasswordHash` | string | Required | SHA256-hashed password |
| `FirstName` | string | Required, Max 100 | User's first name |
| `LastName` | string | Required, Max 100 | User's last name |
| `Role` | string | Default: "User", Max 50 | User's role (User, Admin, etc.) |
| `IsActive` | bool | Default: true | Account activation status |
| `CreatedAt` | DateTime | Required | Account creation timestamp |
| `LastLoginAt` | DateTime? | Nullable | Last successful login timestamp |
| `CarrierId` | Guid? | FK, Nullable | Associated carrier (optional) |

### Database Table: users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP,
    carrier_id UUID,
    
    FOREIGN KEY (carrier_id) REFERENCES carriers(id),
    CONSTRAINT unique_email UNIQUE(email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_carrier_id ON users(carrier_id);
```

## Authentication Models

### DTOs (Data Transfer Objects)

#### LoginRequest
```csharp
public class LoginRequest
{
    public string Email { get; set; }        // User email
    public string Password { get; set; }     // Plain text password (hashed server-side)
}
```

#### LoginResponse
```csharp
public class LoginResponse
{
    public bool Success { get; set; }        // Operation success
    public string Message { get; set; }      // Status message
    public string Token { get; set; }        // JWT or auth token
    public UserDto User { get; set; }        // User details (non-sensitive)
}
```

#### RegisterRequest
```csharp
public class RegisterRequest
{
    public string Email { get; set; }        // User email (must be unique)
    public string Password { get; set; }     // Min 6 characters
    public string FirstName { get; set; }    // First name
    public string LastName { get; set; }     // Last name
}
```

#### UserDto
```csharp
public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; }
    public Guid? CarrierId { get; set; }
}
```

## Authentication Flow

### Login Flow

```
1. User submits email + password via LoginComponent
   ↓
2. HTTP POST /api/auth/login
   ↓
3. LoginCommand handler:
   a) Query User by email
   b) Verify password hash (VerifyPassword)
   c) Check IsActive status
   d) Update LastLoginAt timestamp
   e) Generate auth token (GenerateToken)
   ↓
4. Return LoginResponse with token + UserDto
   ↓
5. Frontend stores token + user in localStorage
   ↓
6. AuthInterceptor attaches token to subsequent requests
   ↓
7. Routes protected by AuthGuard
```

### Registration Flow

```
1. User submits registration form via RegisterComponent
   ↓
2. HTTP POST /api/auth/register
   ↓
3. RegisterCommand handler:
   a) Check email uniqueness (FirstOrDefaultAsync)
   b) Create new User entity
   c) Hash password (HashPassword)
   d) Set Role = "User", IsActive = true
   e) Save to database
   f) Generate auth token
   ↓
4. Return LoginResponse with token + UserDto
   ↓
5. Frontend stores token + user in localStorage
   ↓
6. Redirect to dashboard
```

### Protected Route Access

```
1. User navigates to protected route (e.g., /dashboard)
   ↓
2. AuthGuard.canActivate() checks:
   a) Is authentication token present?
   b) Is currentUser$ set in AuthService?
   ↓
3. If authenticated: allow access
   ↓
4. If not authenticated: redirect to /login with returnUrl
   ↓
5. After login, AuthGuard redirects back to returnUrl
```

## Password Security

### Current Implementation
- **Algorithm**: SHA256 with Base64 encoding
- **Location**: `IPasswordService.HashPassword()`
- **Flow**:
  1. Convert password string to bytes
  2. Hash with SHA256
  3. Encode result as Base64 string
  4. Store in database

### Verification
- **Location**: `IPasswordService.VerifyPassword()`
- **Flow**:
  1. Hash provided password with SHA256
  2. Compare with stored hash
  3. Return true if match, false otherwise

### Example
```csharp
// Hashing
string password = "MyPassword123";
string hash = passwordService.HashPassword(password);
// hash = "base64encodedSHA256..."

// Verifying
bool isValid = passwordService.VerifyPassword("MyPassword123", hash);  // true
bool isInvalid = passwordService.VerifyPassword("WrongPassword", hash); // false
```

## Token Security

### Current Implementation
- **Type**: Placeholder token
- **Format**: `token_{userId}_{DateTime.Ticks}`
- **Storage**: localStorage (client-side)
- **Attachment**: AuthInterceptor adds "Authorization: Bearer {token}" header

### Planned JWT Implementation
- **Type**: JSON Web Token (JWT)
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Claims**:
  - `sub`: User ID (Subject)
  - `email`: User email
  - `role`: User role
  - `exp`: Expiration (24 hours)
  - `iat`: Issued at
- **Refresh Tokens**: Optional separate endpoint
- **Storage**: httpOnly cookies (recommended) or localStorage

## Roles & Permissions

### Current Roles
- **User**: Default role for new users
- **Admin**: Administrative access (future implementation)
- **Driver**: Driver-specific access (future)
- **Dispatcher**: Dispatcher permissions (future)

### Role-Based Access Control (Future)
```csharp
[Authorize(Roles = "Admin")]
public IActionResult AdminOnly() { }

[Authorize(Roles = "User,Driver")]
public IActionResult GeneralUsers() { }
```

## Database Constraints

### Unique Email
```sql
UNIQUE(email)
```
- Ensures each user has unique email
- Prevents duplicate account creation
- Enforced at database level + application level

### Foreign Key: CarrierId
```sql
FOREIGN KEY (carrier_id) REFERENCES carriers(id)
```
- Optional association with Carrier entity
- Allows multi-carrier support
- Null if user not assigned to carrier

### Indexes
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_carrier_id ON users(carrier_id);
```
- Speeds up email lookups (login, registration)
- Speeds up carrier-based queries
- Recommended for production

## Audit Trail

### Timestamps
- **CreatedAt**: Set when user account created
- **LastLoginAt**: Updated on each successful login
- **Future**: Add UpdatedAt, DeletedAt for soft deletes

### Logging
- Authentication attempts logged in backend
- Failed login attempts tracked for rate limiting
- Admin audit trail for sensitive operations

## Security Best Practices

### Implemented ✓
- Password hashing (SHA256)
- Email uniqueness constraint
- Account activation status
- CORS for development
- Route protection with AuthGuard

### Recommended 🔄
- Implement JWT tokens
- Add password complexity validation
- Enable CORS restrictions (production)
- Use httpOnly cookies instead of localStorage
- Implement account lockout after failed attempts
- Add email verification on registration
- Implement refresh token rotation
- Add suspicious activity alerts
- Use HTTPS in production
- Implement rate limiting on auth endpoints

### Advanced (Future)
- Two-factor authentication (2FA)
- Passwordless authentication (WebAuthn)
- Social login (OAuth2)
- Single sign-on (SSO)
- SAML support
- LDAP integration
- Biometric authentication

## Performance Considerations

### Query Optimization
- Email index for login: O(1) lookup
- Carrier ID index for filtering by carrier
- Consider pagination for user lists

### Caching
- Consider caching user permissions
- Cache role definitions
- Invalidate on role changes

### Scalability
- User entity separate from profile data
- Carrier relationship allows multi-tenancy
- Ready for horizontal scaling

## Migration & Rollback

### Apply Migrations
```bash
cd backend/src/API
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj
dotnet ef database update
```

### Rollback Migrations
```bash
# Remove last migration
dotnet ef migrations remove

# Or rollback to specific migration
dotnet ef database update PreviousMigrationName
```

### Reset Database
```bash
# Delete database
dotnet ef database drop

# Recreate with migrations
dotnet ef database update
```

## Monitoring & Debugging

### Check User Count
```sql
SELECT COUNT(*) FROM users;
```

### Check Login History
```sql
SELECT email, last_login_at FROM users ORDER BY last_login_at DESC;
```

### Find Inactive Users
```sql
SELECT email, created_at FROM users WHERE is_active = false;
```

### Check Email Uniqueness
```sql
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
```

## Related Files

- **Entity**: `backend/src/Domain/Entities/Users/User.cs`
- **DTOs**: `backend/src/Application/DTOs/AuthDTOs.cs`
- **Commands**: `backend/src/Application/Commands/AuthCommands.cs`
- **Services**: `backend/src/Infrastructure/Services/AuthServices.cs`
- **DbContext**: `backend/src/Infrastructure/Persistence/TMSDbContext.cs`
- **Endpoints**: `backend/src/API/Endpoints/AuthEndpoints.cs`
- **Frontend Service**: `frontend/apps/web/src/app/services/auth.service.ts`
- **Login Component**: `frontend/apps/web/src/app/pages/auth/login.component.ts`
- **Register Component**: `frontend/apps/web/src/app/pages/auth/register.component.ts`
- **Auth Guard**: `frontend/apps/web/src/app/guards/auth.guard.ts`
- **Auth Interceptor**: `frontend/apps/web/src/app/interceptors/auth.interceptor.ts`
