namespace TMS.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TMS.Application.DTOs;
using TMS.Domain.Entities.Loads;
using TMS.Domain.Entities.Drivers;
using TMS.Infrastructure.Persistence;

public class DispatchService : IDispatchService
{
    private readonly ILogger<DispatchService> _logger;
    private readonly TMSDbContext _context;

    public DispatchService(ILogger<DispatchService> logger, TMSDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task<List<DriverMatchResponse>> FindBestMatchesAsync(Guid loadId, int maxMatches = 5)
    {
        _logger.LogInformation("Finding best driver matches for load {LoadId}", loadId);

        // Fetch load from database
        var load = await _context.Loads.FindAsync(loadId);
        if (load == null)
        {
            _logger.LogWarning("Load {LoadId} not found", loadId);
            return new List<DriverMatchResponse>();
        }

        var loadPickupLat = load.PickupLocation.Latitude;
        var loadPickupLon = load.PickupLocation.Longitude;

        // Fetch available drivers from database
        var availableDrivers = await _context.DriverAvailabilities
            .Include(d => d.Driver)
            .Where(d => d.Status == AvailabilityStatus.Available)
            .ToListAsync();

        var matches = new List<DriverMatchResponse>();

        foreach (var driver in availableDrivers)
        {
            var driverLat = (double)(driver.Latitude ?? 0m);
            var driverLon = (double)(driver.Longitude ?? 0m);
            
            var distanceMiles = CalculateDistance((double)loadPickupLat, (double)loadPickupLon, driverLat, driverLon);
            var hoursWorkedToday = driver.HoursWorkedToday;
            var hoursAvailable = 11m - hoursWorkedToday;
            var proximityScore = CalculateProximityScore(distanceMiles);
            var availabilityScore = CalculateAvailabilityScore(hoursAvailable);
            var onTimeRate = driver.OnTimeDeliveryRate;
            var acceptanceRate = driver.AcceptanceRate;
            var performanceScore = CalculatePerformanceScore(
                onTimeRate, 
                acceptanceRate, 
                driver.CompletedLoadsCount
            );

            var totalScore = (proximityScore * 0.4m) + (availabilityScore * 0.3m) + (performanceScore * 0.3m);

            matches.Add(new DriverMatchResponse
            {
                DriverId = driver.DriverId,
                DriverName = driver.Driver.FirstName + " " + driver.Driver.LastName,
                DriverPhone = driver.Driver.PhoneNumber,
                TractorId = driver.AssignedTractorId,
                TractorNumber = driver.AssignedTractorId.HasValue ? $"T-{driver.AssignedTractorId.ToString().Substring(0, Math.Min(8, driver.AssignedTractorId.ToString().Length))}" : null,
                TrailerId = driver.AssignedTrailerId,
                TrailerNumber = driver.AssignedTrailerId.HasValue ? $"TR-{driver.AssignedTrailerId.ToString().Substring(0, Math.Min(8, driver.AssignedTrailerId.ToString().Length))}" : null,
                TotalScore = totalScore,
                ProximityScore = proximityScore,
                AvailabilityScore = availabilityScore,
                PerformanceScore = performanceScore,
                DistanceFromPickupMiles = distanceMiles,
                AvailabilityStatus = driver.Status.ToString(),
                HoursAvailable = hoursAvailable,
                OnTimeRate = onTimeRate,
                AcceptanceRate = acceptanceRate,
                CurrentLocation = driver.CurrentLocation != null ? 
                    $"{driver.CurrentLocation.City}, {driver.CurrentLocation.State}" : "Unknown",
                IsRecommended = totalScore >= 80
            });
        }

        var topMatches = matches
            .OrderByDescending(m => m.TotalScore)
            .Take(maxMatches)
            .ToList();

        _logger.LogInformation("Found {Count} matches for load {LoadId}", topMatches.Count, loadId);
        return topMatches;
    }

    public async Task<DispatchResponse> AssignLoadAsync(DispatchRequest request)
    {
        _logger.LogInformation("Assigning load {LoadId} to driver {DriverId}", request.LoadId, request.DriverId);

        // Fetch entities from database
        var load = await _context.Loads.FindAsync(request.LoadId);
        var driver = await _context.Drivers.FindAsync(request.DriverId);
        
        if (load == null || driver == null)
        {
            throw new InvalidOperationException("Load or Driver not found");
        }

        // Create dispatch entity
        var dispatch = new Dispatch
        {
            Id = Guid.NewGuid(),
            LoadId = request.LoadId,
            DriverId = request.DriverId,
            TractorId = request.TractorId,
            TrailerId = request.TrailerId,
            Status = DispatchStatus.Pending,
            Method = request.Method == "AutoMatch" ? DispatchMethod.AutoMatched : DispatchMethod.Manual,
            AssignedAt = DateTime.UtcNow,
            AssignedByUserId = request.AssignedByUserId,
            Notes = request.Notes,
            ProximityScore = request.ProximityScore,
            AvailabilityScore = request.AvailabilityScore,
            PerformanceScore = request.PerformanceScore,
            TotalScore = request.TotalScore,
            CreatedAt = DateTime.UtcNow
        };

        _context.Dispatches.Add(dispatch);

        // Update driver availability to OnDuty
        var driverAvailability = await _context.DriverAvailabilities
            .FirstOrDefaultAsync(d => d.DriverId == request.DriverId);
        
        if (driverAvailability != null)
        {
            driverAvailability.Status = AvailabilityStatus.OnDuty;
            driverAvailability.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return new DispatchResponse
        {
            Id = dispatch.Id,
            LoadId = dispatch.LoadId,
            LoadNumber = load.LoadNumber,
            DriverId = dispatch.DriverId,
            DriverName = $"{driver.FirstName} {driver.LastName}",
            DriverPhone = driver.PhoneNumber,
            TractorId = dispatch.TractorId,
            TractorNumber = dispatch.TractorId.HasValue ? $"T-{dispatch.TractorId.ToString().Substring(0, Math.Min(8, dispatch.TractorId.ToString().Length))}" : null,
            TrailerId = dispatch.TrailerId,
            TrailerNumber = dispatch.TrailerId.HasValue ? $"TR-{dispatch.TrailerId.ToString().Substring(0, Math.Min(8, dispatch.TrailerId.ToString().Length))}" : null,
            Status = dispatch.Status.ToString(),
            Method = dispatch.Method.ToString(),
            AssignedAt = dispatch.AssignedAt,
            Notes = dispatch.Notes
        };
    }

    public async Task<DispatchResponse> AcceptDispatchAsync(Guid dispatchId)
    {
        _logger.LogInformation("Driver accepting dispatch {DispatchId}", dispatchId);

        var dispatch = await _context.Dispatches
            .Include(d => d.Load)
            .Include(d => d.Driver)
            .FirstOrDefaultAsync(d => d.Id == dispatchId);
            
        if (dispatch == null)
        {
            throw new InvalidOperationException($"Dispatch {dispatchId} not found");
        }

        dispatch.Status = DispatchStatus.Accepted;
        dispatch.AcceptedAt = DateTime.UtcNow;
        dispatch.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new DispatchResponse
        {
            Id = dispatch.Id,
            LoadId = dispatch.LoadId,
            LoadNumber = dispatch.Load.LoadNumber,
            DriverId = dispatch.DriverId,
            DriverName = $"{dispatch.Driver.FirstName} {dispatch.Driver.LastName}",
            DriverPhone = dispatch.Driver.PhoneNumber,
            Status = dispatch.Status.ToString(),
            Method = dispatch.Method.ToString(),
            AssignedAt = dispatch.AssignedAt,
            AcceptedAt = dispatch.AcceptedAt,
            Notes = dispatch.Notes
        };
    }

    public async Task<DispatchResponse> RejectDispatchAsync(Guid dispatchId, string reason)
    {
        _logger.LogInformation("Driver rejecting dispatch {DispatchId}: {Reason}", dispatchId, reason);

        var dispatch = await _context.Dispatches
            .Include(d => d.Load)
            .Include(d => d.Driver)
            .FirstOrDefaultAsync(d => d.Id == dispatchId);
        if (dispatch == null)
        {
            throw new InvalidOperationException($"Dispatch {dispatchId} not found");
        }

        dispatch.Status = DispatchStatus.Rejected;
        dispatch.RejectedAt = DateTime.UtcNow;
        dispatch.RejectionReason = reason;
        dispatch.UpdatedAt = DateTime.UtcNow;

        // Return driver to Available status
        var driverAvailability = await _context.DriverAvailabilities
            .FirstOrDefaultAsync(d => d.DriverId == dispatch.DriverId);
        
        if (driverAvailability != null)
        {
            driverAvailability.Status = AvailabilityStatus.Available;
            driverAvailability.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return new DispatchResponse
        {
            Id = dispatch.Id,
            LoadId = dispatch.LoadId,
            LoadNumber = dispatch.Load.LoadNumber,
            DriverId = dispatch.DriverId,
            DriverName = $"{dispatch.Driver.FirstName} {dispatch.Driver.LastName}",
            Status = dispatch.Status.ToString(),
            Method = dispatch.Method.ToString(),
            AssignedAt = dispatch.AssignedAt
        };
    }

    public async Task<List<DispatchResponse>> GetActiveDispatchesAsync(Guid? driverId = null)
    {
        var query = _context.Dispatches
            .Include(d => d.Load)
            .Include(d => d.Driver)
            .Where(d => d.Status == DispatchStatus.Pending || d.Status == DispatchStatus.Accepted);

        if (driverId.HasValue)
        {
            query = query.Where(d => d.DriverId == driverId.Value);
        }

        var dispatches = await query.Select(d => new DispatchResponse
        {
            Id = d.Id,
            LoadId = d.LoadId,
            LoadNumber = d.Load.LoadNumber,
            DriverId = d.DriverId,
            DriverName = d.Driver.FirstName + " " + d.Driver.LastName,
            DriverPhone = d.Driver.PhoneNumber,
            TractorId = d.TractorId,
            TractorNumber = d.TractorId.HasValue ? $"T-{d.TractorId.ToString().Substring(0, Math.Min(8, d.TractorId.ToString().Length))}" : null,
            TrailerId = d.TrailerId,
            TrailerNumber = d.TrailerId.HasValue ? $"TR-{d.TrailerId.ToString().Substring(0, Math.Min(8, d.TrailerId.ToString().Length))}" : null,
            Status = d.Status.ToString(),
            Method = d.Method.ToString(),
            AssignedAt = d.AssignedAt,
            AcceptedAt = d.AcceptedAt,
            Notes = d.Notes,
            TotalScore = d.TotalScore
        }).ToListAsync();

        return dispatches;
    }

    public async Task<DriverAvailabilityResponse> UpdateDriverAvailabilityAsync(DriverAvailabilityRequest request)
    {
        _logger.LogInformation("Updating availability for driver {DriverId}", request.DriverId);

        var driverAvailability = await _context.DriverAvailabilities
            .Include(d => d.Driver)
            .FirstOrDefaultAsync(d => d.DriverId == request.DriverId);
            
        if (driverAvailability == null)
        {
            var driver = await _context.Drivers.FindAsync(request.DriverId);
            if (driver == null)
            {
                throw new InvalidOperationException("Driver not found");
            }

            driverAvailability = new DriverAvailability
            {
                Id = Guid.NewGuid(),
                DriverId = request.DriverId,
                Status = Enum.Parse<AvailabilityStatus>(request.Status),
                HoursWorkedToday = 0,
                HoursWorkedThisWeek = 0,
                OnTimeDeliveryRate = 100,
                AcceptanceRate = 100,
                CompletedLoadsCount = 0,
                CreatedAt = DateTime.UtcNow
            };
            _context.DriverAvailabilities.Add(driverAvailability);
        }

        driverAvailability.Status = Enum.Parse<AvailabilityStatus>(request.Status);
        driverAvailability.Latitude = request.Latitude;
        driverAvailability.Longitude = request.Longitude;
        driverAvailability.LastLocationUpdate = DateTime.UtcNow;
        driverAvailability.UpdatedAt = DateTime.UtcNow;

        if (request.CurrentCity != null && request.CurrentState != null)
        {
            driverAvailability.CurrentLocation = new Domain.ValueObjects.Address
            {
                City = request.CurrentCity,
                State = request.CurrentState,
                Street = "",
                PostalCode = "",
                Country = "USA",
                Latitude = (double)(request.Latitude ?? 0),
                Longitude = (double)(request.Longitude ?? 0)
            };
        }

        await _context.SaveChangesAsync();

        var hoursAvailable = 11m - driverAvailability.HoursWorkedToday;
        var hoursAvailableWeek = 60m - driverAvailability.HoursWorkedThisWeek;

        return new DriverAvailabilityResponse
        {
            Id = driverAvailability.Id,
            DriverId = driverAvailability.DriverId,
            DriverName = $"{driverAvailability.Driver.FirstName} {driverAvailability.Driver.LastName}",
            Status = driverAvailability.Status.ToString(),
            CurrentLocation = driverAvailability.CurrentLocation != null ? 
                $"{driverAvailability.CurrentLocation.City}, {driverAvailability.CurrentLocation.State}" : "Unknown",
            HoursAvailableToday = hoursAvailable,
            HoursAvailableThisWeek = Math.Max(0, hoursAvailableWeek),
            OnTimeDeliveryRate = driverAvailability.OnTimeDeliveryRate,
            LastLocationUpdate = driverAvailability.LastLocationUpdate
        };
    }

    public decimal CalculateProximityScore(decimal distanceMiles)
    {
        // Closer is better, exponential decay
        if (distanceMiles <= 0) return 100;
        if (distanceMiles >= 500) return 0;

        return Math.Max(0, 100 - (distanceMiles / 5));
    }

    public decimal CalculateAvailabilityScore(decimal hoursAvailable)
    {
        // More hours available is better
        if (hoursAvailable >= 11) return 100;
        if (hoursAvailable <= 0) return 0;

        return (hoursAvailable / 11) * 100;
    }

    public decimal CalculatePerformanceScore(decimal onTimeRate, decimal acceptanceRate, int completedLoads)
    {
        var onTimeWeight = 0.5m;
        var acceptanceWeight = 0.3m;
        var experienceWeight = 0.2m;

        var experienceScore = Math.Min(100, completedLoads * 2);  // Max at 50 loads

        return (onTimeRate * onTimeWeight) + (acceptanceRate * acceptanceWeight) + (experienceScore * experienceWeight);
    }

    private decimal CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        // Haversine formula for distance calculation
        const double R = 3959; // Earth radius in miles

        var lat1Rad = lat1 * (Math.PI / 180);
        var lat2Rad = lat2 * (Math.PI / 180);
        var deltaLat = (lat2 - lat1) * (Math.PI / 180);
        var deltaLon = (lon2 - lon1) * (Math.PI / 180);

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return (decimal)(R * c);
    }


}
