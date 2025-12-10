namespace TMS.API.Endpoints;

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using TMS.Application.DTOs;
using TMS.Application.Services;

public static class TrackingEndpoints
{
    public static void RegisterTrackingEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tracking")
            .RequireAuthorization();

        // Location updates
        group.MapPost("/location", UpdateDriverLocation);
        group.MapGet("/location/{driverId}", GetLatestDriverLocation);
        group.MapGet("/location/{driverId}/history", GetDriverLocationHistory);

        // Active trackers
        group.MapGet("/active", GetActiveTrackers);

        // Geofence alerts
        group.MapGet("/alerts", GetPendingAlerts);
        group.MapPost("/alerts/{alertId}/acknowledge", AcknowledgeAlert);

        // Batch updates
        group.MapPost("/location/batch", BatchUpdateLocations);
    }

    private static async Task<IResult> UpdateDriverLocation(
        DriverLocationUpdateRequest request,
        ITrackingService trackingService)
    {
        try
        {
            var response = await trackingService.UpdateDriverLocationAsync(request);
            return Results.Ok(new { success = true, data = response });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetLatestDriverLocation(
        Guid driverId,
        ITrackingService trackingService)
    {
        try
        {
            var location = await trackingService.GetLatestDriverLocationAsync(driverId);
            if (location == null)
            {
                return Results.NotFound(new { success = false, error = "No location found" });
            }

            return Results.Ok(new { success = true, data = location });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetDriverLocationHistory(
        Guid driverId,
        int lastMinutes = 60,
        ITrackingService trackingService = null!)
    {
        try
        {
            var history = await trackingService.GetDriverLocationHistoryAsync(driverId, lastMinutes);
            return Results.Ok(new { success = true, data = history, count = history.Count });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetActiveTrackers(
        ITrackingService trackingService)
    {
        try
        {
            var trackers = await trackingService.GetActiveTrackersAsync();
            return Results.Ok(new { success = true, data = trackers, count = trackers.Count });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetPendingAlerts(
        ITrackingService trackingService)
    {
        try
        {
            var alerts = await trackingService.GetPendingAlertsAsync();
            return Results.Ok(new { success = true, data = alerts, count = alerts.Count });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> AcknowledgeAlert(
        Guid alertId,
        ITrackingService trackingService)
    {
        try
        {
            var alert = await trackingService.AcknowledgeAlertAsync(alertId);
            return Results.Ok(new { success = true, data = alert });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> BatchUpdateLocations(
        BatchLocationUpdateRequest request,
        ITrackingService trackingService)
    {
        try
        {
            var results = new System.Collections.Generic.List<DriverLocationResponse>();

            foreach (var location in request.Locations)
            {
                location.DriverId = request.DriverId;
                var response = await trackingService.UpdateDriverLocationAsync(location);
                results.Add(response);
            }

            return Results.Ok(new { success = true, data = results, count = results.Count });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }
}
