# TMS Backend API Documentation

## Overview
The TMS API is built with .NET 8 using a Clean Architecture approach with Domain, Application, Infrastructure, and API layers.

## Architecture

### Layers
- **Domain**: Core business entities and value objects
- **Application**: Business logic, commands, queries, and DTOs using MediatR
- **Infrastructure**: Database access, external service integrations, caching
- **API**: ASP.NET Core minimal APIs with OpenAPI/Swagger documentation

## Power Only Module

### Entities
- **PowerOnlyTractor**: Tractor unit for power-only loads
- **Load**: Load assignment with pickup/delivery locations and pricing
- **Driver**: Driver profiles with CDL and compliance tracking
- **Trip**: Individual movement tracking

### API Endpoints

#### Create Load
```
POST /api/v1/power-only/loads
Content-Type: application/json

{
  "customerId": "guid",
  "pickupStreet": "123 Main St",
  "pickupCity": "Chicago",
  "pickupState": "IL",
  "pickupPostalCode": "60601",
  "pickupDateTime": "2024-01-15T08:00:00Z",
  "deliveryStreet": "456 Oak Ave",
  "deliveryCity": "Detroit",
  "deliveryState": "MI",
  "deliveryPostalCode": "48201",
  "deliveryDateTime": "2024-01-15T18:00:00Z",
  "baseRate": 2500.00,
  "fuelSurcharge": 300.00,
  "accessorialCharges": 150.00
}
```

#### Get Loads
```
GET /api/v1/power-only/loads?carrierId=guid&status=Booked&pageNumber=1&pageSize=50
```

#### Assign Load
```
POST /api/v1/power-only/loads/{loadId}/assign
Content-Type: application/json

{
  "driverId": "guid",
  "tractorId": "guid",
  "trailerId": "guid" (optional)
}
```

## Database Schema

The system uses EF Core with SQL Server for persistence. Key tables:
- Carriers
- Drivers
- PowerOnlyTractors
- Trailers
- Loads
- Trips
- Documents
- ComplianceDocuments
- MaintenanceRecords

## Authentication & Security

- JWT-based authentication (to be implemented)
- Role-based access control (Carrier Admin, Dispatcher, Driver)
- Request validation and sanitization

## Extensibility

The system is designed for easy addition of new equipment types (Dry Van, Reefer, Flatbed, etc.):

1. Create new equipment entity inheriting from `BaseEntity`
2. Add DbSet to `TMSDbContext`
3. Create module-specific DTOs and endpoints
4. Extend the API with new minimal API routes

## Integration Points

- MCP (Motor Carrier Platform) integration hooks
- Load board connectors (Truckstop, DAT, NextLoad)
- Webhook system for real-time updates
- External accounting system integrations
