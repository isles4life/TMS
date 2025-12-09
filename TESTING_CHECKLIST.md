# Getting Started Checklist

## ✅ Pre-Flight Checks (5 minutes)

- [ ] PostgreSQL is installed and running on localhost:5432
- [ ] .NET 8 SDK is installed (`dotnet --version`)
- [ ] Node.js 18+ is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] Project folder accessible: c:\Users\cable\OneDrive\Desktop\TMS
- [ ] Two PowerShell windows open or ready to open

## ✅ Backend Setup (5 minutes)

**Terminal 1: Backend**

- [ ] Navigate to backend: `cd backend/src/API`
- [ ] Create migration: 
  ```powershell
  dotnet ef migrations add AddUserAuthentication --project ../Infrastructure/TMS.Infrastructure.csproj
  ```
- [ ] Apply migration: `dotnet ef database update`
  - [ ] Wait for "Successfully updated database"
- [ ] Start backend: `dotnet run`
  - [ ] Wait for "LIFECYCLE: ApplicationStarted"
  - [ ] Look for "Seeded test user: test@example.com / password123"
  - [ ] Confirm: "Listening on http://localhost:5000"
- [ ] **Keep this terminal open**

## ✅ Frontend Setup (2 minutes)

**Terminal 2: Frontend (NEW TERMINAL)**

- [ ] Navigate to frontend: `cd frontend`
- [ ] Start frontend: `npm start`
  - [ ] Wait for Angular build to complete
  - [ ] Look for "ng serve" listening on port 4200
  - [ ] Browser may auto-open or navigate to http://localhost:4200
- [ ] **Keep this terminal open**

## ✅ Test 1: Login (1 minute)

**Browser**

- [ ] Open http://localhost:4200/login in browser
- [ ] Verify login page loads with:
  - [ ] Email field
  - [ ] Password field
  - [ ] "Sign in" button
  - [ ] Truckstop branding (#d71920 red button)
- [ ] Enter credentials:
  - [ ] Email: `test@example.com`
  - [ ] Password: `password123`
- [ ] Click "Sign in" button
- [ ] ✅ **Should redirect to /dashboard**
- [ ] **SUCCESS**: Login works!

## ✅ Test 2: Registration (1 minute)

**Browser**

- [ ] Open http://localhost:4200/register
- [ ] Verify registration page loads with:
  - [ ] First Name field
  - [ ] Last Name field
  - [ ] Email field
  - [ ] Password field
  - [ ] Confirm Password field
  - [ ] "Create Account" button
- [ ] Fill form:
  - [ ] First Name: `John`
  - [ ] Last Name: `Doe`
  - [ ] Email: `john@example.com`
  - [ ] Password: `Password123`
  - [ ] Confirm Password: `Password123`
- [ ] Click "Create Account" button
- [ ] ✅ **Should redirect to /dashboard**
- [ ] Log out (refresh browser and clear localStorage if needed)
- [ ] Try logging in with new account:
  - [ ] Email: `john@example.com`
  - [ ] Password: `Password123`
- [ ] ✅ **Should login successfully**
- [ ] **SUCCESS**: Registration works!

## ✅ Test 3: Token Verification (1 minute)

**Browser DevTools**

- [ ] Press F12 to open DevTools
- [ ] Go to "Application" tab (or "Storage" in Firefox)
- [ ] Expand "Local Storage"
- [ ] Click on the http://localhost:4200 entry
- [ ] Verify you see:
  - [ ] `auth_token` - should have value like `token_..._...`
  - [ ] `current_user` - should have JSON object with email, firstName, etc.
- [ ] Open Console tab (F12 > Console)
- [ ] Type: `localStorage.getItem('auth_token')`
  - [ ] ✅ Should print token value
- [ ] Type: `localStorage.getItem('current_user')`
  - [ ] ✅ Should print user object
- [ ] **SUCCESS**: Token storage works!

## ✅ Test 4: Token in Requests (1 minute)

**Browser DevTools**

- [ ] Go to Network tab in DevTools
- [ ] Click any API request (e.g., if you navigate between pages)
- [ ] Select a request that goes to http://localhost:5000/api/...
- [ ] Look at "Headers" section
- [ ] Scroll down to "Request Headers"
- [ ] Verify you see:
  - [ ] `Authorization: Bearer token_..._...`
- [ ] **SUCCESS**: Token auto-attached!

## ✅ Test 5: Protected Routes (1 minute)

**Browser Console**

- [ ] Open Console (F12 > Console)
- [ ] Clear localStorage:
  ```javascript
  localStorage.removeItem('auth_token')
  localStorage.removeItem('current_user')
  ```
- [ ] Refresh page (F5)
- [ ] ✅ Should redirect to /login
- [ ] URL should include returnUrl: `...?returnUrl=%2Fdashboard`
- [ ] Login again with test@example.com/password123
- [ ] ✅ Should redirect back to /dashboard
- [ ] **SUCCESS**: Protected routes work!

## ✅ Database Verification (2 minutes)

**Terminal or pgAdmin**

Option A: Using psql command line
```powershell
psql -U postgres -d tms_db -c "SELECT email, first_name, last_name FROM users;"
```
- [ ] Should show at least test@example.com in results

Option B: Using pgAdmin GUI
- [ ] Open pgAdmin
- [ ] Connect to localhost PostgreSQL
- [ ] Browse to tms_db > Schemas > public > Tables > users
- [ ] Right-click users > View/Edit Data > All Rows
- [ ] ✅ Should see test@example.com and john@example.com (if created)

## ✅ API Testing (Optional - 2 minutes)

**PowerShell**

Test login endpoint:
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $body
```
- [ ] Should return 200 with token and user data

Test Swagger documentation:
- [ ] Open http://localhost:5000/swagger in browser
- [ ] ✅ Should see API documentation
- [ ] Expand /api/auth sections
- [ ] See login and register endpoints

## 🎉 All Tests Passed!

If you've checked all boxes above:

✅ **Authentication system is working!**

You now have:
- ✅ Database with user table
- ✅ Test user for login testing
- ✅ Working login page
- ✅ Working registration page
- ✅ Tokens stored in browser
- ✅ Tokens attached to API requests
- ✅ Protected routes functional
- ✅ Multiple users can register and login

## 📚 Next Steps

### For More Testing:
1. See `QUICK_START.md` for status checks
2. See `COMMANDS_TO_RUN.md` for more commands

### To Understand the System:
1. Read `VISUAL_GUIDE.md` for flow diagrams
2. Read `AUTHENTICATION_SETUP.md` for complete details
3. Read `USER_SCHEMA.md` for database schema

### To Deploy to Production:
1. See `README_AUTH.md` Deployment Checklist
2. Implement JWT tokens (real, not placeholder)
3. Add password complexity requirements
4. Enable CORS restrictions

### To Add Features:
1. Password reset via email
2. Two-factor authentication
3. Social login
4. User profile management
5. Admin dashboard

## 🔧 Troubleshooting During Tests

| Problem | Solution |
|---------|----------|
| Backend won't start | Check PostgreSQL is running: `psql -U postgres` |
| Port 5000 in use | Kill process: `Stop-Process -Port 5000` |
| Port 4200 in use | Kill process: `Stop-Process -Port 4200` |
| Migration failed | Delete DB: `dotnet ef database drop`, then update |
| Frontend won't compile | Delete node_modules: `rm -r node_modules`, then `npm install` |
| Login returns 401 | Check backend logs for "Seeded test user" message |
| Token not in localStorage | Check browser Privacy settings, try Incognito |

## 📞 Support

- Quick fixes: See `COMMANDS_TO_RUN.md`
- Full troubleshooting: See `AUTHENTICATION_SETUP.md`
- Technical details: See `USER_SCHEMA.md`
- Architecture: See `VISUAL_GUIDE.md`

---

## Summary

You're about to complete 10 tests in ~20 minutes to verify a complete authentication system is working.

**Current Status**: Ready to test ✅

**Time Required**: ~20 minutes

**Success Rate**: Should pass all 5+ tests

**Next Action**: Start with Backend Setup (check box 1)

---

**Good luck! Report any issues you find.** 🚀
