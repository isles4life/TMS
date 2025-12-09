# Quick Start - Authentication Testing

## 1. Prerequisites Check
- [ ] PostgreSQL running on localhost:5432
- [ ] .NET 8 SDK installed
- [ ] Node.js 18+ installed
- [ ] Terminal/PowerShell open in project root

## 2. Backend Setup (5 minutes)

```powershell
# Navigate to API
cd backend/src/API

# Run migrations to create database and tables
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj
dotnet ef database update

# Start backend (port 5000)
dotnet run

# Expected output:
# - "LIFECYCLE: ApplicationStarted"
# - "Seeded test user: test@example.com / password123"
# - Swagger at http://localhost:5000/swagger
```

**Note**: Keep this terminal open - backend must run while testing

## 3. Frontend Setup (2 minutes) - NEW TERMINAL

```powershell
# Navigate to frontend
cd frontend

# Start Angular dev server (port 4200)
npm start

# Once built, open browser to http://localhost:4200
```

**Note**: Keep this terminal open - frontend must run while testing

## 4. Test Login (1 minute)

1. Open `http://localhost:4200/login` in browser
2. Enter credentials:
   - **Email**: test@example.com
   - **Password**: password123
3. Click "Sign in"
4. ✓ Should redirect to `/dashboard`

## 5. Test Registration (1 minute)

1. Go to `http://localhost:4200/register`
2. Fill form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Password123
   - Confirm: Password123
3. Click "Create Account"
4. ✓ Should redirect to `/dashboard`
5. ✓ Can now login with new account

## 6. Verify Token Storage (1 minute)

1. Open DevTools (F12) → Application → LocalStorage
2. ✓ Should see `auth_token` and `current_user`
3. Open Console (F12 → Console) and run:
   ```javascript
   localStorage.getItem('auth_token')
   localStorage.getItem('current_user')
   ```

## 7. Verify Token in Requests (1 minute)

1. Open DevTools (F12) → Network tab
2. Navigate to any page (e.g., dashboard)
3. Click any API request (e.g., load-board)
4. Look at Request Headers
5. ✓ Should see: `Authorization: Bearer token_[userId]_[ticks]`

## 8. Test Protected Routes (1 minute)

1. Open DevTools Console and run:
   ```javascript
   localStorage.removeItem('auth_token')
   localStorage.removeItem('current_user')
   ```
2. Refresh page (F5)
3. ✓ Should redirect to `/login` with `?returnUrl=/dashboard`
4. Login again
5. ✓ Should redirect back to `/dashboard`

## API Endpoints (for manual testing)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Status Check

Run this in PowerShell to verify setup:

```powershell
# Check PostgreSQL
psql -U postgres -c "SELECT version();"

# Check .NET SDK
dotnet --version

# Check Node.js
node --version
npm --version

# Check ports (should show running services)
netstat -ano | findstr :5000
netstat -ano | findstr :4200
netstat -ano | findstr :5432
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Verify PostgreSQL is running: `psql -U postgres` |
| Migration errors | Delete database: `dotnet ef database drop`, then re-run migrations |
| Login returns 401 | Check test user seeded in backend console output |
| Can't find API endpoints | Check backend is running on :5000 and frontend proxy is configured |
| Token not in headers | Check AuthInterceptor in main.ts and token in localStorage |
| Stuck on login page | Check browser console (F12) for errors, verify backend logs |

## File Locations

- Backend: `backend/src/API/`
- Frontend: `frontend/apps/web/src/`
- Auth components: `frontend/apps/web/src/app/pages/auth/`
- Auth services: `frontend/apps/web/src/app/services/`
- Auth guard: `frontend/apps/web/src/app/guards/`
- Swagger: http://localhost:5000/swagger
- Login page: http://localhost:4200/login
- Register: http://localhost:4200/register

## Next: Production Considerations

After testing, consider:
1. ✓ Implement real JWT tokens (see AUTHENTICATION_SETUP.md)
2. ✓ Add password complexity validation
3. ✓ Enable CORS restrictions
4. ✓ Use httpOnly cookies instead of localStorage
5. ✓ Add rate limiting
6. ✓ Enable HTTPS
