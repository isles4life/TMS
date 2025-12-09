# Quick Reference - Commands to Run

## Start Everything (3 Easy Steps)

### Step 1: Start PostgreSQL (if not running)
```powershell
# Windows - PostgreSQL Service (if installed as service)
Start-Service postgresql-x64-15

# Or use pgAdmin to start
```

### Step 2: Backend - Terminal 1 (5 minutes setup, then runs)
```powershell
cd c:\Users\cable\OneDrive\Desktop\TMS\backend\src\API

# Run migrations and seed database (FIRST TIME ONLY)
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj
dotnet ef database update

# Start backend (keep running)
dotnet run

# Expected: Backend running on http://localhost:5000
```

### Step 3: Frontend - Terminal 2 (2 minutes setup, then runs)
```powershell
cd c:\Users\cable\OneDrive\Desktop\TMS\frontend

# Start frontend dev server (keep running)
npm start

# Expected: Frontend running on http://localhost:4200
```

## Now Test

### Test 1: Login
```
1. Open http://localhost:4200/login
2. Email: test@example.com
3. Password: password123
4. Click "Sign in"
5. ✅ Should go to dashboard
```

### Test 2: Register
```
1. Open http://localhost:4200/register
2. Fill form:
   - First: John
   - Last: Doe
   - Email: john@example.com
   - Password: Password123
   - Confirm: Password123
3. Click "Create Account"
4. ✅ Should go to dashboard
5. ✅ Can login with new account
```

### Test 3: Token Verification
```powershell
# In browser Console (F12 > Console):
localStorage.getItem('auth_token')
localStorage.getItem('current_user')
```

## Maintenance Commands

### View Database Users
```bash
psql -U postgres -d tms_db -c "SELECT email, first_name, last_name, is_active FROM users;"
```

### Reset Database (DELETE ALL DATA!)
```powershell
cd backend/src/API
dotnet ef database drop
dotnet ef database update
# This recreates empty database and seeds test user again
```

### Rollback to Before Authentication
```powershell
cd backend/src/API
dotnet ef migrations remove
dotnet ef database drop
```

### Check Backend is Running
```powershell
curl http://localhost:5000/swagger
```

### Check Frontend is Running
```powershell
curl http://localhost:4200
```

## API Testing (curl)

### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body
```

### Register
```powershell
$body = @{
    email = "newuser@example.com"
    password = "SecurePassword123"
    firstName = "Jane"
    lastName = "Smith"
} | ConvertTo-Json

curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d $body
```

## Troubleshooting Commands

### PostgreSQL not running?
```powershell
# Check if PostgreSQL service exists
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Start service
Start-Service postgresql-x64-15

# Or use command line
psql -U postgres
# If this works, PostgreSQL is running
```

### Migrations failed?
```powershell
cd backend/src/API
dotnet ef migrations list
dotnet ef migrations remove
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj
dotnet ef database update
```

### Backend won't start?
```powershell
cd backend/src/API
dotnet build
# Check for compilation errors
```

### Frontend won't start?
```powershell
cd frontend
npm ci
# Reinstall dependencies
npm start
```

### Clear frontend cache
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm start
```

## Port Checks

### View what's running on ports
```powershell
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :4200  # Frontend
netstat -ano | findstr :5432  # PostgreSQL
```

### Kill process on port (if needed)
```powershell
# Kill backend on :5000
$processId = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }

# Kill frontend on :4200
$processId = (Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue).OwningProcess
if ($processId) { Stop-Process -Id $processId -Force }
```

## URLs Reference

| Purpose | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Login | http://localhost:4200/login |
| Register | http://localhost:4200/register |
| Dashboard | http://localhost:4200/dashboard |
| Backend | http://localhost:5000 |
| Swagger API Docs | http://localhost:5000/swagger |
| Login API | POST http://localhost:5000/api/auth/login |
| Register API | POST http://localhost:5000/api/auth/register |
| PostgreSQL | localhost:5432 (psql) |

## Test Credentials

| Purpose | Email | Password |
|---------|-------|----------|
| Test User (seeded on first run) | test@example.com | password123 |

## File Locations

| Purpose | Location |
|---------|----------|
| Backend API | `backend/src/API/Program.cs` |
| Frontend Config | `frontend/apps/web/src/main.ts` |
| Auth Docs | `AUTHENTICATION_SETUP.md` |
| Quick Start | `QUICK_START.md` |
| Schema Reference | `USER_SCHEMA.md` |
| Implementation Summary | `IMPLEMENTATION_COMPLETE.md` |

## Full Setup (Copy & Paste)

### PowerShell Session 1 (Backend)
```powershell
$projectRoot = "c:\Users\cable\OneDrive\Desktop\TMS"
cd "$projectRoot\backend\src\API"
dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj
dotnet ef database update
dotnet run
# Keep this terminal open, shows backend logs
```

### PowerShell Session 2 (Frontend)
```powershell
$projectRoot = "c:\Users\cable\OneDrive\Desktop\TMS"
cd "$projectRoot\frontend"
npm start
# Keep this terminal open, shows frontend build logs
```

### Browser (Session 3)
```
1. Open http://localhost:4200/login
2. Enter: test@example.com / password123
3. Click Sign in
4. Done! You're in the dashboard
```

## Common Issues Quick Fix

| Issue | Fix |
|-------|-----|
| "Can't connect to database" | Start PostgreSQL: `Start-Service postgresql-x64-15` |
| "Port 5000 already in use" | Kill it: `Stop-Process -Port 5000` (if function exists) |
| "Port 4200 already in use" | Kill it: `Stop-Process -Port 4200` |
| "npm install fails" | Delete node_modules and reinstall: `rm -r node_modules; npm install` |
| "Migrations fail" | Reset: `dotnet ef database drop; dotnet ef database update` |
| "Login always fails" | Check test user was seeded (look in backend console) |

## Next Commands to Run After Testing

### 1. Create Real JWT Tokens (Future)
```powershell
# Install JWT package
cd backend/src/Infrastructure
dotnet add package System.IdentityModel.Tokens.Jwt
cd ../API
# Then update TokenService.GenerateToken() to use JWT
```

### 2. Add Register Page to Navbar (Future)
```
Update frontend sidebar with link to /register
```

### 3. Add Logout Button (Future)
```
Add logout button to dashboard that calls AuthService.logout()
```

---

**That's it! You now have a complete working authentication system.**

For detailed information, see:
- QUICK_START.md - Step-by-step testing
- AUTHENTICATION_SETUP.md - Complete reference
- USER_SCHEMA.md - Technical details
- IMPLEMENTATION_COMPLETE.md - Full summary
