# TMS Architecture

## Clean Architecture Principles

This TMS implementation follows Clean Architecture (also known as Onion Architecture), ensuring:

1. **Independence of UI**: The business logic doesn't depend on the UI framework (Angular, WPF, Console, etc.)
2. **Independence of Database**: The business logic doesn't depend on ORM or database implementation
3. **Independence of External Frameworks**: The architecture is not tied to specific frameworks
4. **Testability**: Business logic can be tested in isolation

## Layer Responsibilities

### Domain Layer (`TMS.Domain`)
- Contains all business entities
- Value objects (Address, InsuranceInfo)
- Enums and constants
- **No dependencies** on any other layer
- Pure business rules and logic

### Application Layer (`TMS.Application`)
- Use cases (Commands, Queries)
- DTOs for input/output
- Business logic orchestration
- **Depends on**: Domain only
- Uses MediatR for CQRS pattern

### Infrastructure Layer (`TMS.Infrastructure`)
- Database access (EF Core)
- External service implementations
- Caching (Redis)
- Repository implementations
- **Depends on**: Domain and Application
- Configuration for data access

### API Layer (`TMS.API`)
- HTTP endpoints (minimal APIs)
- Request/response handling
- Dependency injection setup
- **Depends on**: All other layers
- Framework-agnostic business logic

## Data Flow

```
API Request
  ↓
Endpoint (minimal API)
  ↓
Mediator (CQRS)
  ↓
Handler (Application)
  ↓
Domain Logic
  ↓
Repository/Infrastructure
  ↓
Database
```

## CQRS Pattern

Commands (writes):
- `CreatePowerOnlyLoadCommand`
- `AssignPowerOnlyLoadCommand`

Queries (reads):
- `GetPowerOnlyLoadsQuery`
- `GetPowerOnlyLoadByIdQuery`

Each handler is isolated and testable.

## Dependency Injection

All dependencies are injected at the API layer startup:
```csharp
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(...));
builder.Services.AddDbContext<TMSDbContext>(...);
builder.Services.AddScoped<ILoadRepository, LoadRepository>();
```

## Extensibility Model

### Adding a New Equipment Type

1. Create entity: `src/Domain/Entities/Equipment/DryVanTractor.cs`
2. Add to DbContext: `DbSet<DryVanTractor> DryVanTractors`
3. Create DTOs: `src/Application/DTOs/DryVanTractorDTOs.cs`
4. Create Commands/Queries in Application layer
5. Add endpoints: `src/API/Endpoints/DryVanEndpoints.cs`
6. Register in Program.cs

### Adding a New Integration

1. Create interface: `src/Domain/Interfaces/ILoadboardConnector.cs`
2. Implement in Infrastructure: `src/Infrastructure/Integrations/LoadboardConnector.cs`
3. Register service: `builder.Services.AddScoped<ILoadboardConnector, LoadboardConnector>()`
4. Use in Command/Query handlers

## Database Migrations

```bash
# Add migration
dotnet ef migrations add MigrationName --project src/Infrastructure --startup-project src/API

# Update database
dotnet ef database update --project src/Infrastructure --startup-project src/API
```

## Testing Strategy

- **Unit Tests**: Test Domain logic and business rules
- **Application Tests**: Test Commands and Queries
- **Integration Tests**: Test with real database
- **API Tests**: Test endpoints and response envelopes

```
tests/
  Domain.Tests/
  Application.Tests/
  API.Tests/
```

## Performance Considerations

- Caching layer (Redis) for frequently accessed data
- Async/await throughout for scalability
- Database indexing on Load status and Driver fields
- Pagination for list endpoints
