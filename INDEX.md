# TMS Project Index

## Project Overview

**Transportation Management System (TMS)** - An enterprise-grade, market-leading TMS platform for the trucking industry built with .NET 8 and Angular 17.

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Scaffold Complete - Ready for Implementation

---

## 📁 Directory Structure

```
tms/
├── README.md                          # Main project overview
├── SETUP_GUIDE.md                    # Development setup instructions
├── CONTRIBUTING.md                   # Contribution guidelines
├── spec.md                           # Original specification
│
├── backend/
│   ├── TMS.sln                       # .NET solution file
│   ├── tsconfig.json                 # TypeScript config (for documentation)
│   │
│   ├── src/
│   │   ├── Domain/                   # Domain layer (entities, value objects)
│   │   │   ├── Common/
│   │   │   │   ├── BaseEntity.cs     # Base entity with audit fields
│   │   │   │   └── ApiResponse.cs    # Standard response envelope
│   │   │   ├── Entities/
│   │   │   │   ├── SupportingEntities.cs  # Document, Trailer, Maintenance, Compliance
│   │   │   │   ├── Companies/
│   │   │   │   │   └── Carrier.cs    # Carrier (trucking company) entity
│   │   │   │   ├── Drivers/
│   │   │   │   │   └── Driver.cs     # Driver profile with CDL tracking
│   │   │   │   ├── Equipment/
│   │   │   │   │   └── PowerOnlyTractor.cs  # Power Only tractor entity
│   │   │   │   ├── Loads/
│   │   │   │   │   └── Load.cs       # Load/shipment entity
│   │   │   │   └── Trips/
│   │   │   │       └── Trip.cs       # Trip tracking entity
│   │   │   └── ValueObjects/
│   │   │       └── Address.cs        # Shared Address value object
│   │   │
│   │   ├── Application/              # Application layer (use cases, DTOs)
│   │   │   ├── DTOs/
│   │   │   │   ├── PowerOnlyLoadDTOs.cs     # Load request/response DTOs
│   │   │   │   ├── PowerOnlyTractorDTOs.cs  # Equipment DTOs
│   │   │   │   └── DriverDTOs.cs            # Driver DTOs
│   │   │   ├── Commands/
│   │   │   │   └── PowerOnlyLoadCommands.cs # CQRS commands with handlers
│   │   │   └── Queries/
│   │   │       └── PowerOnlyLoadQueries.cs  # CQRS queries with handlers
│   │   │
│   │   ├── Infrastructure/           # Infrastructure layer (data access, external services)
│   │   │   └── Persistence/
│   │   │       └── TMSDbContext.cs   # EF Core database context
│   │   │
│   │   └── API/                      # API layer (HTTP endpoints)
│   │       ├── Program.cs            # Application startup & configuration
│   │       ├── appsettings.json      # Configuration (DB, JWT, Redis)
│   │       ├── Endpoints/
│   │       │   ├── PowerOnlyEndpoints.cs    # Power Only load endpoints
│   │       │   ├── EquipmentEndpoints.cs   # Equipment management endpoints
│   │       │   └── DriverEndpoints.cs      # Driver management endpoints
│   │       └── EndpointExtensions.cs       # Health check & extension methods
│   │
│   ├── tests/
│   │   └── TMS.API.Tests.csproj     # API and integration tests
│   │
│   └── .csproj files                 # NuGet project files for each layer
│
├── frontend/
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── package.json                  # NPM dependencies
│   │
│   ├── apps/
│   │   └── web/
│   │       ├── package.json          # Frontend app dependencies
│   │       └── src/
│   │           ├── app.component.ts  # Root app component with Material toolbar
│   │           └── main.ts           # Angular bootstrap
│   │
│   └── libs/
│       ├── ui/                       # Shared UI components
│       │   └── (Material-based reusable components)
│       │
│       ├── core/                     # Core services and models
│       │   └── src/
│       │       └── services/
│       │           ├── power-only.service.ts    # Power Only load service
│       │           ├── driver.service.ts        # Driver management service
│       │           └── equipment.service.ts     # Equipment management service
│       │
│       └── features/                 # Feature modules
│           ├── dispatch/
│           │   └── power-only-dashboard.component.ts  # Load dashboard
│           ├── drivers/              # Driver management feature
│           ├── equipment/            # Equipment management feature
│           ├── accounting/           # Settlement & billing feature
│           └── integrations/         # Third-party integrations feature
│
├── docs/
│   ├── README.md                     # Documentation home
│   ├── api/
│   │   ├── README.md                 # API documentation
│   │   └── ENDPOINTS.yaml            # Endpoint specifications
│   ├── architecture/
│   │   └── ARCHITECTURE.md           # System design & patterns
│   └── ui/
│       └── (UI guidelines & component specs)
│
└── deploy/
    ├── docker-compose.yml            # Multi-container orchestration
    ├── Dockerfile.backend            # Backend container
    ├── Dockerfile.frontend           # Frontend container
    └── nginx.conf                    # Reverse proxy & static serving
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
dotnet build
dotnet run --project src/API
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### Frontend
```bash
cd frontend/apps/web
npm install
npm start
# App: http://localhost:4200
```

### Docker
```bash
cd deploy
docker-compose up
# Frontend: http://localhost:4200
# Backend: http://localhost:5000
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

---

## 📋 Key Entities

### Domain Model

| Entity | Purpose | Status |
|--------|---------|--------|
| **Carrier** | Trucking company profile | ✅ Defined |
| **Driver** | Driver profile with CDL/compliance | ✅ Defined |
| **PowerOnlyTractor** | Tractor equipment | ✅ Defined |
| **Trailer** | Trailer equipment | ✅ Defined |
| **Load** | Shipment/load assignment | ✅ Defined |
| **Trip** | Individual movement tracking | ✅ Defined |
| **Document** | File uploads (BoL, POD, etc.) | ✅ Defined |
| **MaintenanceRecord** | Equipment maintenance logs | ✅ Defined |
| **ComplianceDocument** | CDL, insurance expiry tracking | ✅ Defined |

### API Endpoints

#### Power Only Module (First Implementation)
```
POST   /api/v1/power-only/loads
GET    /api/v1/power-only/loads
GET    /api/v1/power-only/loads/{loadId}
POST   /api/v1/power-only/loads/{loadId}/assign
PUT    /api/v1/power-only/loads/{loadId}/status

POST   /api/v1/equipment/power-only
GET    /api/v1/equipment/power-only
GET    /api/v1/equipment/power-only/{equipmentId}
PUT    /api/v1/equipment/power-only/{equipmentId}

POST   /api/v1/drivers
GET    /api/v1/drivers
GET    /api/v1/drivers/{driverId}
PUT    /api/v1/drivers/{driverId}

GET    /health
```

All endpoints return standard envelope:
```json
{
  "success": true,
  "data": { /* response data */ },
  "errors": []
}
```

---

## 🏗️ Architecture

### Clean Architecture (Onion Pattern)
```
┌─────────────────────────────────────────┐
│           API Layer (HTTP)              │ ← Controller/MinimalAPI
├─────────────────────────────────────────┤
│      Application Layer (Use Cases)      │ ← Commands, Queries
├─────────────────────────────────────────┤
│   Infrastructure Layer (Data Access)    │ ← EF Core, Repositories
├─────────────────────────────────────────┤
│     Domain Layer (Business Logic)       │ ← Entities, Rules
└─────────────────────────────────────────┘
```

### Technology Stack
- **Backend**: .NET 8, C#, ASP.NET Core, EF Core
- **Frontend**: Angular 17, TypeScript, Material Design
- **Database**: SQL Server / PostgreSQL
- **Cache**: Redis
- **API**: RESTful with OpenAPI/Swagger
- **Patterns**: CQRS, DI, Repository, Clean Architecture
- **Deployment**: Docker, Docker Compose, Kubernetes-ready

---

## 📦 NuGet Packages

| Package | Version | Purpose |
|---------|---------|---------|
| EntityFrameworkCore | 8.0.0 | ORM for data access |
| MediatR | 12.1.1 | CQRS implementation |
| Swashbuckle.AspNetCore | 6.4.0 | Swagger/OpenAPI documentation |
| AspNetCore.Authentication.JwtBearer | 8.0.0 | JWT authentication |

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Current)
- ✅ Project scaffolding
- ✅ Domain model definition
- ✅ Base entity and API response
- ✅ Power Only module stubs
- ✅ Docker setup
- ⏳ **Next**: Database migrations, repository implementation

### Phase 2: Core Features (Weeks 2-3)
- Database context implementation
- Repository pattern
- Command/Query handlers
- Unit tests
- Driver and equipment management

### Phase 3: Integration (Weeks 4-5)
- Load board connectors (Truckstop, DAT)
- Real-time tracking
- Webhook system
- Event bus

### Phase 4: Advanced Features (Weeks 6-8)
- Accounting & settlement
- Advanced reporting
- Mobile app
- Additional equipment types

---

## 🧪 Testing Strategy

```
backend/tests/
├── TMS.Domain.Tests/          # Domain logic tests
├── TMS.Application.Tests/     # Command/Query handler tests
└── TMS.API.Tests/             # API endpoint integration tests

frontend/src/
├── app/**/*.spec.ts           # Component and service tests
└── app/shared/**/*.spec.ts    # Shared service tests
```

### Run Tests
```bash
# Backend
cd backend
dotnet test

# Frontend
cd frontend/apps/web
npm test
```

---

## 🔐 Security Considerations

1. **Authentication**: JWT-based with refresh tokens
2. **Authorization**: Role-based access (Admin, Dispatcher, Driver)
3. **Input Validation**: All user inputs validated server-side
4. **SQL Injection**: Parameterized queries via EF Core
5. **CORS**: Restrictive CORS policy
6. **HTTPS**: Required in production
7. **Secrets**: Never commit credentials

---

## 📖 Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| README | `./README.md` | Project overview |
| Setup Guide | `./SETUP_GUIDE.md` | Development environment setup |
| API Docs | `./docs/api/README.md` | API reference & examples |
| Architecture | `./docs/architecture/ARCHITECTURE.md` | System design & patterns |
| Contributing | `./CONTRIBUTING.md` | Code style & workflow |

---

## 🛠️ Development Tools

### Required
- .NET 8 SDK (https://dotnet.microsoft.com/)
- Node.js 20+ LTS (https://nodejs.org/)
- SQL Server or Docker
- Visual Studio 2022 or VS Code

### Recommended Extensions
- C# Dev Kit (VS Code)
- Angular Language Service (VS Code)
- Prettier (Code formatter)
- ESLint (JavaScript linter)
- Swagger Viewer (API documentation)

---

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `backend/src/API/appsettings.json` | Backend configuration (DB, JWT, Redis) |
| `backend/TMS.sln` | Solution file |
| `frontend/package.json` | NPM dependencies |
| `frontend/tsconfig.json` | TypeScript configuration |
| `deploy/docker-compose.yml` | Multi-container setup |

---

## 🤝 Contributing

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Follow code style guidelines
3. Write tests for new features
4. Submit pull request with description

---

## 📞 Support & Questions

- **Issues**: GitHub Issues
- **Documentation**: See `/docs` folder
- **Setup Help**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📄 License

Copyright © 2024. All rights reserved.

---

## ✨ Next Steps

1. **Set up development environment** → [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. **Understand architecture** → [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
3. **Explore API** → [API_README.md](docs/api/README.md)
4. **Start implementing** → Choose a task from Phase 2 roadmap
5. **Follow conventions** → [CONTRIBUTING.md](CONTRIBUTING.md)

**Happy coding! 🚀**
