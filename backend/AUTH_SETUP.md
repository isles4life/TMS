# TMS Authentication Setup

## Overview
The TMS application now includes JWT-based authentication with a PostgreSQL database.

## Architecture

### Backend Components

1. **User Entity** (`Domain/Entities/Users/User.cs`)
   - Email (unique)
   - PasswordHash (SHA256)
   - FirstName, LastName
   - Role (Admin, Manager, Driver, Dispatcher, etc.)
   - CarrierId (optional - links to carrier)
   - IsActive, CreatedAt, LastLoginAt

2. **Authentication DTOs** (`Application/DTOs/AuthDTOs.cs`)
   - `LoginRequest`: email, password
   - `RegisterRequest`: email, password, firstName, lastName
   - `LoginResponse`: success, message, token, user
   - `UserDto`: user information to return

3. **Auth Commands** (`Application/Commands/Auth/AuthCommands.cs`)
   - `LoginCommand`: processes login requests
   - `RegisterCommand`: processes registration requests

4. **Auth Services** (`Infrastructure/Services/AuthServices.cs`)
   - `PasswordService`: SHA256 hashing and verification
   - `TokenService`: JWT token generation

5. **Auth Endpoints** (`API/Endpoints/AuthEndpoints.cs`)
   - `POST /api/auth/login`
   - `POST /api/auth/register`

## Database Setup

### PostgreSQL Connection String
Update your connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=5432;Database=tms_db;User Id=postgres;Password=your_password;"
  }
}
```

### EF Core Migrations
```bash
cd backend/src/API

# Create initial migration
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj

# Apply migrations
dotnet ef database update
```

## API Usage

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Manager",
    "carrierId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

## Frontend Integration

### Store Token
```typescript
// After successful login
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### Add Token to Requests
```typescript
// In api.service.ts
private addAuthHeader(headers: HttpHeaders): HttpHeaders {
  const token = localStorage.getItem('authToken');
  if (token) {
    return headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}
```

## Security Considerations

1. **Password Hashing**: Passwords are hashed using SHA256
2. **CORS**: Currently allows all origins - restrict in production
3. **Token Expiration**: Set via TokenService (default: 1440 minutes)
4. **Email Uniqueness**: Enforced via database constraint

## Next Steps

1. Implement JWT token validation middleware
2. Add role-based authorization
3. Create password reset functionality
4. Add email verification
5. Implement refresh tokens
6. Add audit logging for authentication events
