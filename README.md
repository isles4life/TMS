# TMS - Transportation Management System

A market-leading, enterprise-grade Transportation Management System built with .NET 8 and Angular.

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- SQL Server (or Docker)
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend
dotnet build
dotnet run --project src/API
```

API will be available at `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

### Frontend Setup

```bash
cd frontend/apps/web
npm install
npm start
```

App will be available at `http://localhost:4200`

### Docker Deployment

```bash
cd deploy
docker-compose up
```

## Architecture

- **Backend**: .NET 8 with Clean Architecture
- **Frontend**: Angular 17 with Material Design
- **Database**: SQL Server with EF Core
- **Caching**: Redis
- **API**: RESTful with OpenAPI/Swagger
- **Patterns**: CQRS, Dependency Injection, Repository Pattern

## Features

### Implemented
- Power Only equipment type module
- Load management (create, assign, track)
- Driver and equipment management
- Compliance document tracking
- RESTful API with Swagger documentation
- Angular Material UI components

### Planned
- Load board integrations (Truckstop, DAT, NextLoad)
- Real-time tracking
- Accounting and settlement
- Advanced reporting
- Mobile app
- Third-party equipment types (Dry Van, Reefer, Flatbed)

## Project Structure

```
tms/
├── backend/
│   ├── src/
│   │   ├── Domain/           # Business entities
│   │   ├── Application/      # Commands, Queries, DTOs
│   │   ├── Infrastructure/   # Data access, integrations
│   │   └── API/              # HTTP endpoints
│   └── tests/
├── frontend/
│   ├── apps/
│   │   └── web/              # Main Angular app
│   └── libs/
│       ├── ui/               # Shared UI components
│       ├── core/             # Services, models
│       └── features/         # Feature modules
├── docs/
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture decisions
│   └── ui/                   # UI guidelines
└── deploy/
    ├── docker-compose.yml
    ├── Dockerfile.*
    └── nginx.conf
```

## API Documentation

See `docs/api/README.md` for complete API reference.

## Architecture Documentation

See `docs/architecture/ARCHITECTURE.md` for system design and extensibility patterns.

## Contributing

Follow Clean Architecture principles:
1. Business logic in Domain layer
2. Use cases in Application layer
3. Infrastructure isolation
4. Dependency injection
5. Comprehensive testing

## License

Copyright © 2024. All rights reserved.
