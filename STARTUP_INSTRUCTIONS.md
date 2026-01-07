# TMS Application - Startup Guide

## Quick Start

Run these commands in two separate PowerShell windows:

### Terminal 1 - Frontend:
```powershell
& "C:\Users\cable\OneDrive\Desktop\TMS\start-frontend.ps1"
```

### Terminal 2 - Backend:
```powershell
& "C:\Users\cable\OneDrive\Desktop\TMS\start-backend.ps1"
```

Then open browser to: http://localhost:4200

---

## Architecture

- **Frontend**: Served from production build using `serve` package
  - Location: C:\Users\cable\OneDrive\Desktop\TMS\frontend\dist\tms-web
  - Port: 4200
  - Server: npx serve (static HTTP server with SPA support)

- **Backend API**: .NET 8 Core API
  - Location: C:\Users\cable\OneDrive\Desktop\TMS\backend\src\API
  - Port: 5000
  - Database: SQLite (embedded)

---

## Features

✓ Auto-restart on crash
✓ SPA routing support
✓ Production-optimized builds
✓ CORS enabled
✓ Database seeding

---

## Endpoints

- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health (if available)

---

## Troubleshooting

### Port already in use:
```powershell
# Find process using port
netstat -ano | findstr :4200
# Kill process
taskkill /PID <PID> /F
```

### Clear node cache:
```powershell
rm -r "C:\Users\cable\OneDrive\Desktop\TMS\frontend\node_modules\.vite"
rm -r "C:\Users\cable\OneDrive\Desktop\TMS\frontend\.angular"
```

### Rebuild:
```powershell
cd "C:\Users\cable\OneDrive\Desktop\TMS\frontend"
npx ng build tms-web --configuration production
```
