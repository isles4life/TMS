namespace TMS.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TMS.Application.DTOs;
using TMS.Domain.Entities.Tracking;
using TMS.Infrastructure.Persistence;

public interface ITrackingService
{
    Task<DriverLocationResponse> UpdateDriverLocationAsync(DriverLocationUpdateRequest request);
    Task<DriverLocationResponse?> GetLatestDriverLocationAsync(Guid driverId);
    Task<List<ActiveTrackerResponse>> GetActiveTrackersAsync();
    Task<List<DriverLocationResponse>> GetDriverLocationHistoryAsync(Guid driverId, int lastMinutes = 60);
    Task<GeofenceAlertResponse> CreateGeofenceAlertAsync(Guid driverLocationId, Guid dispatchId, string alertType, string zoneName);
    Task<List<GeofenceAlertResponse>> GetPendingAlertsAsync();
    Task<GeofenceAlertResponse> AcknowledgeAlertAsync(Guid alertId);
    decimal CalculateDistanceBetweenPoints(double lat1, double lon1, double lat2, double lon2);
    Task<bool> IsWithinGeofenceAsync(double driverLat, double driverLon, double zoneLat, double zoneLon, decimal radiusMiles);
}

public class TrackingService : ITrackingService
{
    private readonly ILogger<TrackingService> _logger;
    private readonly TMSDbContext _context;
    private readonly IRouteOptimizationService _routeService;
    private const decimal MilesToMeters = 1609.34m;
    private const decimal EarthRadiusMiles = 3959m;

    public TrackingService(
        ILogger<TrackingService> logger, 
        TMSDbContext context,
        IRouteOptimizationService routeService)
    {
        _logger = logger;
        _context = context;
        _routeService = routeService;
    }

    /// <summary>
    /// Record a driver's location update
    /// </summary>
    public async Task<DriverLocationResponse> UpdateDriverLocationAsync(DriverLocationUpdateRequest request)
    {
        _logger.LogInformation("Updating location for driver {DriverId}: {Lat},{Lon}", 
            request.DriverId, request.Latitude, request.Longitude);

        var driver = await _context.Drivers
            .FirstOrDefaultAsync(d => d.Id == request.DriverId);

        if (driver == null)
        {
            throw new InvalidOperationException($"Driver {request.DriverId} not found");
        }

        var driverLocation = new DriverLocation
        {
            DriverId = request.DriverId,
            DispatchId = request.DispatchId,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            SpeedMph = request.SpeedMph,
            Heading = request.Heading,
            Accuracy = request.Accuracy,
            Source = request.Source,
            RecordedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.DriverLocations.Add(driverLocation);
        await _context.SaveChangesAsync();

        // Update availability location
        var availability = await _context.DriverAvailabilities
            .FirstOrDefaultAsync(da => da.DriverId == request.DriverId);

        if (availability != null)
        {
            availability.Latitude = (decimal)request.Latitude;
            availability.Longitude = (decimal)request.Longitude;
            availability.LastLocationUpdate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return new DriverLocationResponse
        {
            Id = driverLocation.Id,
            DriverId = driverLocation.DriverId,
            DriverName = $"{driver.FirstName} {driver.LastName}",
            Latitude = driverLocation.Latitude,
            Longitude = driverLocation.Longitude,
            SpeedMph = driverLocation.SpeedMph,
            Heading = driverLocation.Heading,
            Address = driverLocation.Address,
            City = driverLocation.City,
            State = driverLocation.State,
            RecordedAt = driverLocation.RecordedAt,
            DispatchId = driverLocation.DispatchId
        };
    }

    /// <summary>
    /// Get latest location for a driver
    /// </summary>
    public async Task<DriverLocationResponse?> GetLatestDriverLocationAsync(Guid driverId)
    {
        var location = await _context.DriverLocations
            .Include(dl => dl.Driver)
            .Where(dl => dl.DriverId == driverId)
            .OrderByDescending(dl => dl.RecordedAt)
            .FirstOrDefaultAsync();

        if (location == null) return null;

        return new DriverLocationResponse
        {
            Id = location.Id,
            DriverId = location.DriverId,
            DriverName = $"{location.Driver?.FirstName} {location.Driver?.LastName}" ?? "Unknown",
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            SpeedMph = location.SpeedMph,
            Heading = location.Heading,
            Address = location.Address,
            City = location.City,
            State = location.State,
            RecordedAt = location.RecordedAt,
            DispatchId = location.DispatchId
        };
    }

    /// <summary>
    /// Get all active drivers being tracked
    /// </summary>
    public async Task<List<ActiveTrackerResponse>> GetActiveTrackersAsync()
    {
        var activeLocations = await _context.DriverLocations
            .Include(dl => dl.Driver)
            .Include(dl => dl.Dispatch)
                .ThenInclude(d => d!.Load)
            .Where(dl => dl.IsActive && dl.RecordedAt > DateTime.UtcNow.AddMinutes(-15))
            .GroupBy(dl => dl.DriverId)
            .Select(g => g.OrderByDescending(dl => dl.RecordedAt).First())
            .ToListAsync();

        var trackers = new List<ActiveTrackerResponse>();

        foreach (var location in activeLocations)
        {
            var availability = await _context.DriverAvailabilities
                .FirstOrDefaultAsync(da => da.DriverId == location.DriverId);

            // Calculate ETA if dispatch has destination
            int etaMinutes = 0;
            if (location.Dispatch?.Load?.DeliveryLocation != null)
            {
                try
                {
                    var eta = await _routeService.CalculateETAAsync(
                        location.Latitude,
                        location.Longitude,
                        location.Dispatch.Load.DeliveryLocation.Latitude,
                        location.Dispatch.Load.DeliveryLocation.Longitude,
                        DateTime.UtcNow);
                    
                    etaMinutes = (int)(eta - DateTime.UtcNow).TotalMinutes;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to calculate ETA for driver {DriverId}", location.DriverId);
                }
            }

            trackers.Add(new ActiveTrackerResponse
            {
                Id = location.Id,
                DriverId = location.DriverId,
                DriverName = $"{location.Driver?.FirstName} {location.Driver?.LastName}" ?? "Unknown",
                DriverPhone = location.Driver?.PhoneNumber ?? "",
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                SpeedMph = location.SpeedMph,
                Status = availability?.Status.ToString() ?? "Unknown",
                DispatchId = location.DispatchId,
                LoadNumber = location.Dispatch?.Load?.LoadNumber,
                PickupLocation = location.Dispatch?.Load?.PickupLocation?.ToString() ?? "",
                DeliveryLocation = location.Dispatch?.Load?.DeliveryLocation?.ToString() ?? "",
                ETA_Minutes = etaMinutes,
                LastUpdated = location.RecordedAt
            });
        }

        return trackers;
    }

    /// <summary>
    /// Get location history for a driver
    /// </summary>
    public async Task<List<DriverLocationResponse>> GetDriverLocationHistoryAsync(Guid driverId, int lastMinutes = 60)
    {
        var cutoffTime = DateTime.UtcNow.AddMinutes(-lastMinutes);

        var history = await _context.DriverLocations
            .Include(dl => dl.Driver)
            .Where(dl => dl.DriverId == driverId && dl.RecordedAt >= cutoffTime)
            .OrderBy(dl => dl.RecordedAt)
            .ToListAsync();

        return history.Select(location => new DriverLocationResponse
        {
            Id = location.Id,
            DriverId = location.DriverId,
            DriverName = $"{location.Driver?.FirstName} {location.Driver?.LastName}" ?? "Unknown",
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            SpeedMph = location.SpeedMph,
            Heading = location.Heading,
            Address = location.Address,
            City = location.City,
            State = location.State,
            RecordedAt = location.RecordedAt,
            DispatchId = location.DispatchId
        }).ToList();
    }

    /// <summary>
    /// Create geofence alert for pickup/delivery zone
    /// </summary>
    public async Task<GeofenceAlertResponse> CreateGeofenceAlertAsync(Guid driverLocationId, Guid dispatchId, 
        string alertType, string zoneName)
    {
        var alert = new GeofenceAlert
        {
            DriverLocationId = driverLocationId,
            DispatchId = dispatchId,
            AlertType = Enum.Parse<GeofenceAlertType>(alertType),
            ZoneName = zoneName,
            AlertedAt = DateTime.UtcNow,
            IsAcknowledged = false
        };

        _context.GeofenceAlerts.Add(alert);
        await _context.SaveChangesAsync();

        var driverLocation = await _context.DriverLocations
            .Include(dl => dl.Driver)
            .FirstOrDefaultAsync(dl => dl.Id == driverLocationId);

        return new GeofenceAlertResponse
        {
            Id = alert.Id,
            DriverId = alert.DispatchId,
            DriverName = $"{driverLocation?.Driver?.FirstName} {driverLocation?.Driver?.LastName}" ?? "Unknown",
            DispatchId = dispatchId,
            AlertType = alertType,
            ZoneName = zoneName,
            AlertedAt = alert.AlertedAt,
            IsAcknowledged = alert.IsAcknowledged
        };
    }

    /// <summary>
    /// Get pending geofence alerts
    /// </summary>
    public async Task<List<GeofenceAlertResponse>> GetPendingAlertsAsync()
    {
        var alerts = await _context.GeofenceAlerts
            .Include(ga => ga.DriverLocation)
                .ThenInclude(dl => dl!.Driver)
            .Where(ga => !ga.IsAcknowledged)
            .OrderByDescending(ga => ga.AlertedAt)
            .ToListAsync();

        return alerts.Select(alert => new GeofenceAlertResponse
        {
            Id = alert.Id,
            DriverId = alert.DriverLocation?.DriverId ?? Guid.Empty,
            DriverName = $"{alert.DriverLocation?.Driver?.FirstName} {alert.DriverLocation?.Driver?.LastName}" ?? "Unknown",
            DispatchId = alert.DispatchId,
            AlertType = alert.AlertType.ToString(),
            ZoneName = alert.ZoneName,
            AlertedAt = alert.AlertedAt,
            IsAcknowledged = alert.IsAcknowledged,
            AcknowledgedAt = alert.AcknowledgedAt
        }).ToList();
    }

    /// <summary>
    /// Acknowledge a geofence alert
    /// </summary>
    public async Task<GeofenceAlertResponse> AcknowledgeAlertAsync(Guid alertId)
    {
        var alert = await _context.GeofenceAlerts
            .Include(ga => ga.DriverLocation)
                .ThenInclude(dl => dl!.Driver)
            .FirstOrDefaultAsync(ga => ga.Id == alertId);

        if (alert == null)
        {
            throw new InvalidOperationException($"Alert {alertId} not found");
        }

        alert.IsAcknowledged = true;
        alert.AcknowledgedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new GeofenceAlertResponse
        {
            Id = alert.Id,
            DriverId = alert.DriverLocation?.DriverId ?? Guid.Empty,
            DriverName = $"{alert.DriverLocation?.Driver?.FirstName} {alert.DriverLocation?.Driver?.LastName}" ?? "Unknown",
            DispatchId = alert.DispatchId,
            AlertType = alert.AlertType.ToString(),
            ZoneName = alert.ZoneName,
            AlertedAt = alert.AlertedAt,
            IsAcknowledged = alert.IsAcknowledged,
            AcknowledgedAt = alert.AcknowledgedAt
        };
    }

    /// <summary>
    /// Calculate distance between two geographic points using Haversine formula
    /// </summary>
    public decimal CalculateDistanceBetweenPoints(double lat1, double lon1, double lat2, double lon2)
    {
        var lat1Rad = lat1 * (Math.PI / 180);
        var lat2Rad = lat2 * (Math.PI / 180);
        var deltaLat = (lat2 - lat1) * (Math.PI / 180);
        var deltaLon = (lon2 - lon1) * (Math.PI / 180);

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return (decimal)EarthRadiusMiles * (decimal)c;
    }

    /// <summary>
    /// Check if driver is within a geofence radius
    /// </summary>
    public async Task<bool> IsWithinGeofenceAsync(double driverLat, double driverLon, double zoneLat, 
        double zoneLon, decimal radiusMiles)
    {
        var distance = CalculateDistanceBetweenPoints(driverLat, driverLon, zoneLat, zoneLon);
        return distance <= radiusMiles;
    }
}
