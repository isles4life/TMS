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

        // Create test loads - 15 comprehensive loads with various statuses
        var loads = new List<Load>();
        var loadStatuses = new[] { LoadStatus.Booked, LoadStatus.Dispatched, LoadStatus.InTransit, LoadStatus.Delivered, LoadStatus.Completed };
        
        // Define pickup and delivery city pairs
        var cityPairs = new (string pickupCity, string pickupState, double pickupLat, double pickupLon, 
                             string deliveryCity, string deliveryState, double deliveryLat, double deliveryLon)[]
        {
            ("Boise", "ID", 43.6150, -116.2023, "Seattle", "WA", 47.6062, -122.3321),
            ("Seattle", "WA", 47.6062, -122.3321, "Portland", "OR", 45.5152, -122.6784),
            ("Portland", "OR", 45.5152, -122.6784, "Sacramento", "CA", 38.5816, -121.4944),
            ("Sacramento", "CA", 38.5816, -121.4944, "Los Angeles", "CA", 34.0522, -118.2437),
            ("Los Angeles", "CA", 34.0522, -118.2437, "Las Vegas", "NV", 36.1699, -115.1398),
            ("Las Vegas", "NV", 36.1699, -115.1398, "Phoenix", "AZ", 33.4484, -112.0742),
            ("Phoenix", "AZ", 33.4484, -112.0742, "Albuquerque", "NM", 35.0853, -106.6504),
            ("Salt Lake City", "UT", 40.7608, -111.8910, "Denver", "CO", 39.7392, -104.9903),
            ("Denver", "CO", 39.7392, -104.9903, "Cheyenne", "WY", 41.1400, -104.8202),
            ("Cheyenne", "WY", 41.1400, -104.8202, "Billings", "MT", 45.7833, -103.2807)
        };

        for (int i = 1; i <= 15; i++)
        {
            var cityPair = cityPairs[(i - 1) % cityPairs.Length];
            var status = loadStatuses[(i - 1) % loadStatuses.Length];
            var driverAssigned = (i % 3 == 0) ? drivers[(i - 1) % drivers.Count].Id : (Guid?)null;
            var tractorAssigned = (i % 3 == 0) ? tractors[(i - 1) % tractors.Count].Id : (Guid?)null;
            var trailerAssigned = (i % 3 == 0) ? trailers[(i - 1) % trailers.Count].Id : (Guid?)null;

            var pickupTime = DateTime.UtcNow.AddHours(i * 2);
            var deliveryTime = pickupTime.AddHours(16 + (i % 8));
            var pickedUpTime = (status != LoadStatus.Booked) ? pickupTime.AddHours(1 + (i % 3)) : (DateTime?)null;
            var deliveredTime = (status == LoadStatus.Delivered || status == LoadStatus.Completed) 
                ? deliveryTime.AddHours(-(i % 2)).AddMinutes(-(i % 30))
                : (DateTime?)null;

            var load = new Load
            {
                Id = Guid.NewGuid(),
                LoadNumber = $"LOAD-{i:D3}",
                CarrierId = carrier.Id,
                CustomerId = Guid.NewGuid(),
                LoadType = LoadType.PowerOnly,
                Status = status,
                PickupLocation = new Address
                {
                    Street = $"{100 + i} Pickup Ln",
                    City = cityPair.pickupCity,
                    State = cityPair.pickupState,
                    PostalCode = "12345",
                    Country = "USA",
                    Latitude = cityPair.pickupLat,
                    Longitude = cityPair.pickupLon
                },
                PickupDateTime = pickupTime,
                DeliveryLocation = new Address
                {
                    Street = $"{200 + i} Delivery Ave",
                    City = cityPair.deliveryCity,
                    State = cityPair.deliveryState,
                    PostalCode = "54321",
                    Country = "USA",
                    Latitude = cityPair.deliveryLat,
                    Longitude = cityPair.deliveryLon
                },
                DeliveryDateTime = deliveryTime,
                BaseRate = 1500m + (i * 100),
                FuelSurcharge = 150m + (i * 10),
                AccessorialCharges = (i % 2 == 0) ? 50m + (i * 5) : 0,
                DriverId = driverAssigned,
                TractorId = tractorAssigned,
                TrailerId = trailerAssigned,
                PickedUpAt = pickedUpTime,
                DeliveredAt = deliveredTime,
                CreatedAt = DateTime.UtcNow.AddDays(-(i / 3))
            };

            loads.Add(load);
        }

        context.Loads.AddRange(loads);
        await context.SaveChangesAsync();

        // Create check calls for loads with assigned drivers
        var checkCalls = new List<CheckCall>();
        foreach (var load in loads.Where(l => l.DriverId.HasValue))
        {
            // 2-3 check calls per load
            for (int j = 1; j <= (load.Id.GetHashCode() % 2) + 2; j++)
            {
                var checkCallTime = load.PickupDateTime.AddHours(j * 4);
                checkCalls.Add(new CheckCall
                {
                    Id = Guid.NewGuid(),
                    LoadId = load.Id,
                    DriverId = load.DriverId.Value,
                    CheckInTime = checkCallTime,
                    ContactMethod = (j % 3 == 0) ? "App" : ((j % 3 == 1) ? "Phone" : "Text"),
                    Notes = $"Check call #{j} - Status update from driver",
                    Latitude = (decimal)(load.PickupLocation.Latitude + (j * 0.5)),
                    Longitude = (decimal)(load.PickupLocation.Longitude + (j * 0.5)),
                    Location = $"Mile Marker {j * 50}",
                    CreatedAt = checkCallTime
                });
            }
        }

        if (checkCalls.Any())
        {
            context.CheckCalls.AddRange(checkCalls);
            await context.SaveChangesAsync();
        }

        // Create load status history for loads with non-Booked status
        var statusHistory = new List<LoadStatusHistory>();
        foreach (var load in loads.Where(l => l.Status != LoadStatus.Booked))
        {
            var currentTime = load.CreatedAt;
            
            statusHistory.Add(new LoadStatusHistory
            {
                Id = Guid.NewGuid(),
                LoadId = load.Id,
                PreviousStatus = LoadStatus.Booked,
                NewStatus = LoadStatus.Dispatched,
                ChangedAt = currentTime.AddMinutes(30),
                Reason = "Load dispatched to driver",
                CreatedAt = currentTime.AddMinutes(30)
            });

            if (load.Status != LoadStatus.Dispatched)
            {
                statusHistory.Add(new LoadStatusHistory
                {
                    Id = Guid.NewGuid(),
                    LoadId = load.Id,
                    PreviousStatus = LoadStatus.Dispatched,
                    NewStatus = LoadStatus.InTransit,
                    ChangedAt = load.PickupDateTime.AddMinutes(15),
                    Reason = "Load picked up and in transit",
                    CreatedAt = load.PickupDateTime.AddMinutes(15)
                });
            }

            if (load.Status == LoadStatus.Delivered || load.Status == LoadStatus.Completed)
            {
                statusHistory.Add(new LoadStatusHistory
                {
                    Id = Guid.NewGuid(),
                    LoadId = load.Id,
                    PreviousStatus = LoadStatus.InTransit,
                    NewStatus = LoadStatus.Delivered,
                    ChangedAt = load.DeliveryDateTime.AddMinutes(-30),
                    Reason = "Load delivered to customer",
                    CreatedAt = load.DeliveryDateTime.AddMinutes(-30)
                });
            }

            if (load.Status == LoadStatus.Completed)
            {
                statusHistory.Add(new LoadStatusHistory
                {
                    Id = Guid.NewGuid(),
                    LoadId = load.Id,
                    PreviousStatus = LoadStatus.Delivered,
                    NewStatus = LoadStatus.Completed,
                    ChangedAt = load.DeliveryDateTime.AddHours(1),
                    Reason = "Load marked as completed",
                    CreatedAt = load.DeliveryDateTime.AddHours(1)
                });
            }
        }

        if (statusHistory.Any())
        {
            context.LoadStatusHistories.AddRange(statusHistory);
            await context.SaveChangesAsync();
        }
    }
}
