namespace TMS.API.Hubs;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TMS.Application.DTOs;
using TMS.Application.Services;

/// <summary>
/// SignalR hub for real-time driver tracking
/// Manages WebSocket connections for live location updates
/// </summary>
// [Authorize] // TODO: Re-enable after JWT validation is configured for SignalR
public class TrackingHub : Hub
{
    private readonly ITrackingService _trackingService;
    private readonly ILogger<TrackingHub> _logger;

    public TrackingHub(ITrackingService trackingService, ILogger<TrackingHub> logger)
    {
        _trackingService = trackingService;
        _logger = logger;
    }

    /// <summary>
    /// Called when a driver connects to start tracking
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Client sends location update (from mobile app or GPS device)
    /// Broadcasts to all connected clients tracking this driver
    /// </summary>
    public async Task UpdateDriverLocation(DriverLocationUpdateRequest request)
    {
        try
        {
            _logger.LogInformation("Location update from driver {DriverId}: {Lat},{Lon}", 
                request.DriverId, request.Latitude, request.Longitude);

            var locationResponse = await _trackingService.UpdateDriverLocationAsync(request);

            // Broadcast to all clients watching this driver
            await Clients.All.SendAsync("DriverLocationUpdated", locationResponse);

            // Check geofence conditions if there's an active dispatch
            if (request.DispatchId.HasValue)
            {
                await CheckGeofenceConditions(request.DispatchId.Value, request.DriverId, 
                    request.Latitude, request.Longitude);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating driver location");
            await Clients.Caller.SendAsync("Error", new { message = "Failed to update location" });
        }
    }

    /// <summary>
    /// Subscribe to real-time updates for a specific driver
    /// </summary>
    public async Task WatchDriver(Guid driverId)
    {
        try
        {
            _logger.LogInformation("Client {ConnectionId} watching driver {DriverId}", 
                Context.ConnectionId, driverId);

            var latestLocation = await _trackingService.GetLatestDriverLocationAsync(driverId);
            if (latestLocation != null)
            {
                await Clients.Caller.SendAsync("DriverLocationUpdated", latestLocation);
            }

            // Add to a driver-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"driver_{driverId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error watching driver");
            await Clients.Caller.SendAsync("Error", new { message = "Failed to watch driver" });
        }
    }

    /// <summary>
    /// Stop watching a specific driver
    /// </summary>
    public async Task StopWatchingDriver(Guid driverId)
    {
        _logger.LogInformation("Client {ConnectionId} stopped watching driver {DriverId}", 
            Context.ConnectionId, driverId);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"driver_{driverId}");
    }

    /// <summary>
    /// Request all active trackers for dashboard
    /// </summary>
    public async Task GetActiveTrackers()
    {
        try
        {
            var trackers = await _trackingService.GetActiveTrackersAsync();
            await Clients.Caller.SendAsync("ActiveTrackers", trackers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching active trackers");
            await Clients.Caller.SendAsync("Error", new { message = "Failed to fetch trackers" });
        }
    }

    /// <summary>
    /// Subscribe to all active tracker updates
    /// </summary>
    public async Task WatchAllTrackers()
    {
        _logger.LogInformation("Client {ConnectionId} watching all trackers", Context.ConnectionId);
        await Groups.AddToGroupAsync(Context.ConnectionId, "all_trackers");

        var trackers = await _trackingService.GetActiveTrackersAsync();
        await Clients.Caller.SendAsync("ActiveTrackers", trackers);
    }

    /// <summary>
    /// Stop watching all trackers
    /// </summary>
    public async Task StopWatchingAllTrackers()
    {
        _logger.LogInformation("Client {ConnectionId} stopped watching all trackers", Context.ConnectionId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "all_trackers");
    }

    /// <summary>
    /// Get location history for a driver
    /// </summary>
    public async Task GetDriverHistory(Guid driverId, int lastMinutes = 60)
    {
        try
        {
            var history = await _trackingService.GetDriverLocationHistoryAsync(driverId, lastMinutes);
            await Clients.Caller.SendAsync("DriverLocationHistory", history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching driver history");
            await Clients.Caller.SendAsync("Error", new { message = "Failed to fetch history" });
        }
    }

    /// <summary>
    /// Get pending geofence alerts
    /// </summary>
    public async Task GetPendingAlerts()
    {
        try
        {
            var alerts = await _trackingService.GetPendingAlertsAsync();
            await Clients.Caller.SendAsync("PendingAlerts", alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching alerts");
            await Clients.Caller.SendAsync("Error", new { message = "Failed to fetch alerts" });
        }
    }

    /// <summary>
    /// Acknowledge a geofence alert
    /// </summary>
    public async Task AcknowledgeAlert(Guid alertId)
    {
        try
        {
            var alert = await _trackingService.AcknowledgeAlertAsync(alertId);
            await Clients.All.SendAsync("AlertAcknowledged", alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acknowledging alert");
            await Clients.Caller.SendAsync("Error", new { message = "Failed to acknowledge alert" });
        }
    }

    /// <summary>
    /// Check geofence conditions for pickup/delivery zones
    /// </summary>
    private async Task CheckGeofenceConditions(Guid dispatchId, Guid driverId, 
        double latitude, double longitude)
    {
        try
        {
            // TODO: Fetch load pickup/delivery locations from database
            // For now, using test values
            const double pickupLat = 43.6150;
            const double pickupLon = -116.2023;
            const double deliveryLat = 47.6062;
            const double deliveryLon = -122.3321;
            const decimal geofenceRadiusMiles = 0.5m; // 0.5 mile radius

            var isNearPickup = await _trackingService.IsWithinGeofenceAsync(
                latitude, longitude, pickupLat, pickupLon, geofenceRadiusMiles);

            var isNearDelivery = await _trackingService.IsWithinGeofenceAsync(
                latitude, longitude, deliveryLat, deliveryLon, geofenceRadiusMiles);

            if (isNearPickup)
            {
                _logger.LogInformation("Driver {DriverId} near pickup zone", driverId);
                await Clients.All.SendAsync("PickupZoneAlert", 
                    new { driverId, dispatchId, message = "Driver approaching pickup zone" });
            }

            if (isNearDelivery)
            {
                _logger.LogInformation("Driver {DriverId} near delivery zone", driverId);
                await Clients.All.SendAsync("DeliveryZoneAlert", 
                    new { driverId, dispatchId, message = "Driver approaching delivery zone" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking geofence conditions");
        }
    }
}
