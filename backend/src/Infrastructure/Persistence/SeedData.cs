namespace TMS.Infrastructure.Persistence;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities;
using TMS.Domain.Entities.Companies;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Equipment;
using TMS.Domain.Entities.Loads;
using TMS.Domain.ValueObjects;

/// <summary>
/// Seeds initial test data for the TMS database
/// </summary>
public static class SeedData
{
    public static async Task InitializeAsync(TMSDbContext context)
    {
        // Only seed if database is empty
        if (context.Carriers.Any() || context.Drivers.Any())
            return;

        // Create a test carrier
        var carrier = new Carrier
        {
            Id = Guid.NewGuid(),
            CompanyName = "Test Carrier Inc",
            MC_Number = "MC-123456",
            DOT_Number = "DOT-789012",
            EIN = "12-3456789",
            Address = new Address
            {
                Street = "123 Main St",
                City = "Boise",
                State = "ID",
                PostalCode = "83702",
                Country = "USA",
                Latitude = 43.6150,
                Longitude = -116.2023
            },
            PhoneNumber = "208-555-0000",
            Email = "contact@testcarrier.com",
            RegistrationDate = DateTime.UtcNow,
            InsuranceInfo = new InsuranceInfo
            {
                Provider = "ABC Insurance",
                PolicyNumber = "POL-123456",
                CoverageAmount = 1000000m,
                ExpiryDate = DateTime.UtcNow.AddYears(1)
            },
            CreatedAt = DateTime.UtcNow
        };

        context.Carriers.Add(carrier);
        await context.SaveChangesAsync();

        // Create test drivers
        var drivers = new List<Driver>
        {
            new Driver
            {
                Id = Guid.NewGuid(),
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@testcarrier.com",
                PhoneNumber = "+1-555-0101",
                CDLNumber = "CDL-001",
                CDLExpiryDate = DateTime.UtcNow.AddYears(4),
                Address = new Address
                {
                    Street = "101 Driver Lane",
                    City = "Boise",
                    State = "ID",
                    PostalCode = "83702",
                    Country = "USA",
                    Latitude = 43.6150,
                    Longitude = -116.2023
                },
                HireDate = DateTime.UtcNow.AddYears(-2),
                Status = DriverStatus.Active,
                CarrierId = carrier.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Driver
            {
                Id = Guid.NewGuid(),
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@testcarrier.com",
                PhoneNumber = "+1-555-0102",
                CDLNumber = "CDL-002",
                CDLExpiryDate = DateTime.UtcNow.AddYears(3),
                Address = new Address
                {
                    Street = "102 Driver Ave",
                    City = "Seattle",
                    State = "WA",
                    PostalCode = "98101",
                    Country = "USA",
                    Latitude = 47.6062,
                    Longitude = -122.3321
                },
                HireDate = DateTime.UtcNow.AddYears(-1),
                Status = DriverStatus.Active,
                CarrierId = carrier.Id,
                CreatedAt = DateTime.UtcNow
            },
            new Driver
            {
                Id = Guid.NewGuid(),
                FirstName = "Mike",
                LastName = "Johnson",
                Email = "mike.johnson@testcarrier.com",
                PhoneNumber = "+1-555-0103",
                CDLNumber = "CDL-003",
                CDLExpiryDate = DateTime.UtcNow.AddYears(2),
                Address = new Address
                {
                    Street = "103 Driver Rd",
                    City = "Salt Lake City",
                    State = "UT",
                    PostalCode = "84101",
                    Country = "USA",
                    Latitude = 40.7608,
                    Longitude = -111.8910
                },
                HireDate = DateTime.UtcNow.AddMonths(-6),
                Status = DriverStatus.Active,
                CarrierId = carrier.Id,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Drivers.AddRange(drivers);
        await context.SaveChangesAsync();

        // Create driver availability records
        var availabilities = new List<DriverAvailability>
        {
            new DriverAvailability
            {
                Id = Guid.NewGuid(),
                DriverId = drivers[0].Id,
                Status = AvailabilityStatus.Available,
                Latitude = 43.6150m,
                Longitude = -116.2023m,
                CurrentLocation = new Address
                {
                    Street = "101 Driver Lane",
                    City = "Boise",
                    State = "ID",
                    PostalCode = "83702",
                    Country = "USA",
                    Latitude = 43.6150,
                    Longitude = -116.2023
                },
                HoursWorkedToday = 4,
                HoursWorkedThisWeek = 28,
                OnTimeDeliveryRate = 98,
                AcceptanceRate = 95,
                CompletedLoadsCount = 45,
                CreatedAt = DateTime.UtcNow
            },
            new DriverAvailability
            {
                Id = Guid.NewGuid(),
                DriverId = drivers[1].Id,
                Status = AvailabilityStatus.Available,
                Latitude = 47.6062m,
                Longitude = -122.3321m,
                CurrentLocation = new Address
                {
                    Street = "102 Driver Ave",
                    City = "Seattle",
                    State = "WA",
                    PostalCode = "98101",
                    Country = "USA",
                    Latitude = 47.6062,
                    Longitude = -122.3321
                },
                HoursWorkedToday = 6,
                HoursWorkedThisWeek = 35,
                OnTimeDeliveryRate = 96,
                AcceptanceRate = 92,
                CompletedLoadsCount = 38,
                CreatedAt = DateTime.UtcNow
            },
            new DriverAvailability
            {
                Id = Guid.NewGuid(),
                DriverId = drivers[2].Id,
                Status = AvailabilityStatus.Available,
                Latitude = 40.7608m,
                Longitude = -111.8910m,
                CurrentLocation = new Address
                {
                    Street = "103 Driver Rd",
                    City = "Salt Lake City",
                    State = "UT",
                    PostalCode = "84101",
                    Country = "USA",
                    Latitude = 40.7608,
                    Longitude = -111.8910
                },
                HoursWorkedToday = 8,
                HoursWorkedThisWeek = 42,
                OnTimeDeliveryRate = 94,
                AcceptanceRate = 88,
                CompletedLoadsCount = 52,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.DriverAvailabilities.AddRange(availabilities);
        await context.SaveChangesAsync();

        // Create test tractors
        var tractors = new List<PowerOnlyTractor>
        {
            new PowerOnlyTractor
            {
                Id = Guid.NewGuid(),
                UnitNumber = "T-001",
                VIN = "1HG1Z57851U102186",
                LicensePlate = "TRACTOR1",
                Year = 2022,
                Make = "Volvo",
                Model = "VNL 760",
                InServiceDate = DateTime.UtcNow.AddYears(-2),
                Status = EquipmentStatus.Active,
                CarrierId = carrier.Id,
                FuelCapacity = 300m,
                CurrentMileage = 150000m,
                CreatedAt = DateTime.UtcNow
            },
            new PowerOnlyTractor
            {
                Id = Guid.NewGuid(),
                UnitNumber = "T-002",
                VIN = "2HG1Z57852U102187",
                LicensePlate = "TRACTOR2",
                Year = 2022,
                Make = "Volvo",
                Model = "VNL 760",
                InServiceDate = DateTime.UtcNow.AddYears(-2),
                Status = EquipmentStatus.Active,
                CarrierId = carrier.Id,
                FuelCapacity = 300m,
                CurrentMileage = 145000m,
                CreatedAt = DateTime.UtcNow
            },
            new PowerOnlyTractor
            {
                Id = Guid.NewGuid(),
                UnitNumber = "T-003",
                VIN = "3HG1Z57853U102188",
                LicensePlate = "TRACTOR3",
                Year = 2023,
                Make = "Volvo",
                Model = "VNL 760",
                InServiceDate = DateTime.UtcNow.AddYears(-1),
                Status = EquipmentStatus.Active,
                CarrierId = carrier.Id,
                FuelCapacity = 300m,
                CurrentMileage = 85000m,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.PowerOnlyTractors.AddRange(tractors);
        await context.SaveChangesAsync();

        // Create test trailers
        var trailers = new List<Trailer>
        {
            new Trailer
            {
                Id = Guid.NewGuid(),
                TrailerNumber = "TR-001",
                VIN = "1HG1Z57851U102286",
                LicensePlate = "TRAILER1",
                Year = 2021,
                Make = "Wabash",
                AxleCount = 2,
                Capacity = 45000m,
                InServiceDate = DateTime.UtcNow.AddYears(-3),
                Status = TrailerStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new Trailer
            {
                Id = Guid.NewGuid(),
                TrailerNumber = "TR-002",
                VIN = "2HG1Z57852U102287",
                LicensePlate = "TRAILER2",
                Year = 2021,
                Make = "Wabash",
                AxleCount = 2,
                Capacity = 45000m,
                InServiceDate = DateTime.UtcNow.AddYears(-3),
                Status = TrailerStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new Trailer
            {
                Id = Guid.NewGuid(),
                TrailerNumber = "TR-003",
                VIN = "3HG1Z57853U102288",
                LicensePlate = "TRAILER3",
                Year = 2022,
                Make = "Great Dane",
                AxleCount = 2,
                Capacity = 45000m,
                InServiceDate = DateTime.UtcNow.AddYears(-2),
                Status = TrailerStatus.Available,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Trailers.AddRange(trailers);
        await context.SaveChangesAsync();

        // Create test loads
        var loads = new List<Load>
        {
            new Load
            {
                Id = Guid.NewGuid(),
                LoadNumber = "LOAD-001",
                CarrierId = carrier.Id,
                CustomerId = Guid.NewGuid(),
                LoadType = LoadType.PowerOnly,
                Status = LoadStatus.Booked,
                PickupLocation = new Address
                {
                    Street = "100 Pickup Ln",
                    City = "Boise",
                    State = "ID",
                    PostalCode = "83702",
                    Country = "USA",
                    Latitude = 43.6150,
                    Longitude = -116.2023
                },
                PickupDateTime = DateTime.UtcNow.AddHours(2),
                DeliveryLocation = new Address
                {
                    Street = "200 Delivery Ave",
                    City = "Seattle",
                    State = "WA",
                    PostalCode = "98101",
                    Country = "USA",
                    Latitude = 47.6062,
                    Longitude = -122.3321
                },
                DeliveryDateTime = DateTime.UtcNow.AddHours(18),
                BaseRate = 1500m,
                FuelSurcharge = 150m,
                AccessorialCharges = 50m,
                CreatedAt = DateTime.UtcNow
            },
            new Load
            {
                Id = Guid.NewGuid(),
                LoadNumber = "LOAD-002",
                CarrierId = carrier.Id,
                CustomerId = Guid.NewGuid(),
                LoadType = LoadType.PowerOnly,
                Status = LoadStatus.Booked,
                PickupLocation = new Address
                {
                    Street = "101 Pickup Ln",
                    City = "Seattle",
                    State = "WA",
                    PostalCode = "98101",
                    Country = "USA",
                    Latitude = 47.6062,
                    Longitude = -122.3321
                },
                PickupDateTime = DateTime.UtcNow.AddHours(1),
                DeliveryLocation = new Address
                {
                    Street = "201 Delivery Ave",
                    City = "Salt Lake City",
                    State = "UT",
                    PostalCode = "84101",
                    Country = "USA",
                    Latitude = 40.7608,
                    Longitude = -111.8910
                },
                DeliveryDateTime = DateTime.UtcNow.AddHours(15),
                BaseRate = 2000m,
                FuelSurcharge = 200m,
                AccessorialCharges = 100m,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Loads.AddRange(loads);
        await context.SaveChangesAsync();
    }
}
