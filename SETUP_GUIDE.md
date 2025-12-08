# TMS Development Setup Guide

## 1. Prerequisites

### Windows
- Visual Studio 2022 Community (with .NET 8 workload)
- OR: .NET 8 SDK (download from dotnet.microsoft.com)
- Node.js 20+ LTS
- SQL Server 2019+ or SQL Server Express
- Git

### macOS/Linux
- .NET 8 SDK
- Node.js 20+ LTS
- PostgreSQL or Docker
- Git

## 2. Backend Setup

### Clone and Restore Dependencies

```bash
cd backend
dotnet restore
```

### Database Configuration

#### Option A: SQL Server (Local)

1. Ensure SQL Server is running
2. Update `src/API/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=TMS;User Id=sa;Password=YourPassword123!;Encrypt=false;"
   }
   ```

3. Apply migrations:
   ```bash
   dotnet ef database update --project src/Infrastructure --startup-project src/API
   ```

#### Option B: SQL Server (Docker)

```bash
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourPassword123!' \
  -p 1433:1433 --name tms-sqlserver \
  mcr.microsoft.com/mssql/server:2022-latest
```

### Run Backend

```bash
dotnet build
dotnet run --project src/API
```

Backend will be available at: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

### Run Tests

```bash
dotnet test tests/TMS.API.Tests.csproj
```

## 3. Frontend Setup

### Install Dependencies

```bash
cd frontend/apps/web
npm install
```

### Development Server

```bash
npm start
```

App will be available at: `http://localhost:4200`

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## 4. Docker Setup

### Build and Run All Services

```bash
cd deploy

# Build images
docker-compose build

# Run services
docker-compose up

# Run in background
docker-compose up -d
```

Services will be available at:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`
- SQL Server: localhost:1433
- Redis: localhost:6379

### Stop Services

```bash
docker-compose down

# Also remove volumes
docker-compose down -v
```

## 5. IDE Configuration

### Visual Studio Code

**Extensions to Install:**
- C# Dev Kit
- .NET Runtime Installer
- Swagger Viewer
- Angular Language Service
- Angular Schematics

**Workspace Settings** (`.vscode/settings.json`):
```json
{
  "omnisharp.enableRoslynAnalyzers": true,
  "omnisharp.enableEditorConfigSupport": true,
  "[csharp]": {
    "editor.defaultFormatter": "ms-vscode.csharp",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

### Visual Studio 2022

1. Open `backend/TMS.sln`
2. Tools → NuGet Package Manager → Package Manager Console
3. Set Default Project to `TMS.API`
4. Run: `Update-Database`

## 6. Environment Variables

### Backend (.env or appsettings.Development.json)

```json
{
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-chars-here!",
    "Issuer": "tms-api",
    "Audience": "tms-app"
  },
  "Redis": {
    "Connection": "localhost:6379"
  }
}
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 7. Database Seeding

### Create Seed Data

Create `backend/src/Infrastructure/Persistence/Seeding/DbInitializer.cs`:

```csharp
public static async Task SeedAsync(TMSDbContext context)
{
    if (context.Carriers.Any()) return;

    var carrier = new Carrier
    {
        CompanyName = "Test Carrier Inc",
        MC_Number = "MC123456",
        DOT_Number = "DOT987654",
        EIN = "12-3456789",
        // ... set other properties
    };

    context.Carriers.Add(carrier);
    await context.SaveChangesAsync();
}
```

## 8. CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '8.0.x'
      - run: cd backend && dotnet build && dotnet test
```

## 9. Troubleshooting

### Backend Issues

**Port 5000 Already in Use:**
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
dotnet run --project src/API -- --urls "http://localhost:5001"
```

**Database Connection Error:**
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure database user has proper permissions

### Frontend Issues

**Angular Module Not Found:**
```bash
npm install
ng serve --poll=2000  # Use polling for file changes
```

**CORS Errors:**
- Backend CORS policy needs to allow frontend origin
- Check `Program.cs` CORS configuration

## 10. Next Steps

1. **Implement Database Layer**: Create repositories and implement data access
2. **Add Authentication**: Implement JWT-based authentication
3. **Connect Frontend**: Wire up Angular services to backend API
4. **Add Load Board Integrations**: Implement Truckstop, DAT connectors
5. **Real-time Updates**: Add SignalR for live tracking
6. **Mobile App**: Build React Native mobile client

## 11. Resources

- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [Angular Documentation](https://angular.io/docs)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [MediatR Documentation](https://github.com/jbogard/MediatR/wiki)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Support

For issues or questions, open an issue on GitHub or contact the development team.
