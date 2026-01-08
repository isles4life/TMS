namespace TMS.API.Endpoints;

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using TMS.Application.DTOs.Compliance;
using TMS.Application.Services.Compliance;
using TMS.Domain.Common;
using TMS.Domain.Entities.Compliance;

/// <summary>
/// HOS (Hours of Service) management endpoints
/// </summary>
public static class HOSEndpoints
{
    public static void MapHOSEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/hos")
            .WithTags("HOS - Hours of Service");

        // Start a new HOS log
        group.MapPost("/logs/start", async (
            [FromBody] StartHOSLogRequest request,
            HOSService service) =>
        {
            try
            {
                var log = await service.StartLogAsync(
                    request.DriverId,
                    request.Status,
                    request.Location,
                    request.Latitude,
                    request.Longitude,
                    request.VehicleId,
                    request.Odometer);

                var response = MapToLogResponse(log);
                return Results.Ok(ApiResponse<HOSLogResponse>.CreateSuccess(response));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure(ex.Message));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure($"Failed to start HOS log: {ex.Message}"));
            }
        })
        .WithName("StartHOSLog")
        .WithSummary("Start a new HOS log entry");

        // Complete current HOS log
        group.MapPost("/logs/complete", async (
            [FromBody] CompleteHOSLogRequest request,
            HOSService service) =>
        {
            try
            {
                var log = await service.CompleteLogAsync(request.DriverId, request.Notes);
                var response = MapToLogResponse(log);
                return Results.Ok(ApiResponse<HOSLogResponse>.CreateSuccess(response));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure(ex.Message));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure($"Failed to complete HOS log: {ex.Message}"));
            }
        })
        .WithName("CompleteHOSLog")
        .WithSummary("Complete the current active HOS log");

        // Change driver status
        group.MapPost("/logs/change-status", async (
            [FromBody] ChangeStatusRequest request,
            HOSService service) =>
        {
            try
            {
                var log = await service.ChangeStatusAsync(
                    request.DriverId,
                    request.NewStatus,
                    request.Location,
                    request.Latitude,
                    request.Longitude);

                var response = MapToLogResponse(log);
                return Results.Ok(ApiResponse<HOSLogResponse>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure($"Failed to change status: {ex.Message}"));
            }
        })
        .WithName("ChangeDriverStatus")
        .WithSummary("Change driver status (completes current and starts new log)");

        // Get HOS summary for driver
        group.MapGet("/summary/{driverId}", async (
            Guid driverId,
            [FromQuery] string driverName,
            HOSService service) =>
        {
            try
            {
                var summary = await service.GetCurrentSummaryAsync(driverId, driverName ?? "Unknown");
                var response = MapToSummaryResponse(summary);
                return Results.Ok(ApiResponse<HOSSummaryResponse>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<HOSSummaryResponse>.CreateFailure($"Failed to get HOS summary: {ex.Message}"));
            }
        })
        .WithName("GetHOSSummary")
        .WithSummary("Get current HOS summary for a driver");

        // Check if driver can drive
        group.MapGet("/can-drive/{driverId}", async (
            Guid driverId,
            HOSService service) =>
        {
            try
            {
                var (canDrive, reason) = await service.CanDriverDriveAsync(driverId);
                var response = new { CanDrive = canDrive, Reason = reason };
                return Results.Ok(ApiResponse<object>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<object>.CreateFailure($"Failed to check drive eligibility: {ex.Message}"));
            }
        })
        .WithName("CanDriverDrive")
        .WithSummary("Check if driver can start driving");

        // Get HOS logs for driver
        group.MapGet("/logs/driver/{driverId}", async (
            Guid driverId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            HOSService service) =>
        {
            try
            {
                var logs = await service.GetLogsAsync(driverId, startDate, endDate);
                var response = logs.Select(MapToLogResponse).ToList();
                return Results.Ok(ApiResponse<List<HOSLogResponse>>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<List<HOSLogResponse>>.CreateFailure($"Failed to get HOS logs: {ex.Message}"));
            }
        })
        .WithName("GetDriverHOSLogs")
        .WithSummary("Get HOS logs for a driver within date range");

        // Get HOS log by ID
        group.MapGet("/logs/{logId}", async (
            Guid logId,
            HOSService service) =>
        {
            try
            {
                var log = await service.GetLogByIdAsync(logId);
                if (log == null)
                    return Results.NotFound(ApiResponse<HOSLogResponse>.CreateFailure("HOS log not found"));

                var response = MapToLogResponse(log);
                return Results.Ok(ApiResponse<HOSLogResponse>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure($"Failed to get HOS log: {ex.Message}"));
            }
        })
        .WithName("GetHOSLogById")
        .WithSummary("Get a specific HOS log by ID");

        // Edit HOS log
        group.MapPut("/logs/{logId}", async (
            Guid logId,
            [FromBody] EditHOSLogRequest request,
            HOSService service) =>
        {
            try
            {
                var log = await service.EditLogAsync(logId, request.EditReason, request.NewStartTime, request.NewEndTime);
                var response = MapToLogResponse(log);
                return Results.Ok(ApiResponse<HOSLogResponse>.CreateSuccess(response));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure(ex.Message));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<HOSLogResponse>.CreateFailure($"Failed to edit HOS log: {ex.Message}"));
            }
        })
        .WithName("EditHOSLog")
        .WithSummary("Edit an existing HOS log");

        // Certify daily logs
        group.MapPost("/logs/certify/{driverId}", async (
            Guid driverId,
            [FromQuery] DateTime date,
            HOSService service) =>
        {
            try
            {
                await service.CertifyDailyLogsAsync(driverId, date);
                return Results.Ok(ApiResponse<object>.CreateSuccess(new { Message = "Daily logs certified successfully" }));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<object>.CreateFailure($"Failed to certify logs: {ex.Message}"));
            }
        })
        .WithName("CertifyDailyLogs")
        .WithSummary("Certify HOS logs for a specific day");

        // Get violations for driver
        group.MapGet("/violations/driver/{driverId}", async (
            Guid driverId,
            [FromQuery] bool includeResolved,
            HOSService service) =>
        {
            try
            {
                var violations = await service.GetViolationsAsync(driverId, includeResolved);
                var response = violations.Select(MapToViolationResponse).ToList();
                return Results.Ok(ApiResponse<List<HOSViolationResponse>>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<List<HOSViolationResponse>>.CreateFailure($"Failed to get violations: {ex.Message}"));
            }
        })
        .WithName("GetDriverViolations")
        .WithSummary("Get HOS violations for a driver");

        // Get all unresolved violations
        group.MapGet("/violations/unresolved", async (HOSService service) =>
        {
            try
            {
                var violations = await service.GetUnresolvedViolationsAsync();
                var response = violations.Select(MapToViolationResponse).ToList();
                return Results.Ok(ApiResponse<List<HOSViolationResponse>>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<List<HOSViolationResponse>>.CreateFailure($"Failed to get violations: {ex.Message}"));
            }
        })
        .WithName("GetUnresolvedViolations")
        .WithSummary("Get all unresolved HOS violations");

        // Resolve violation
        group.MapPost("/violations/{violationId}/resolve", async (
            Guid violationId,
            [FromBody] ResolveViolationRequest request,
            HOSService service) =>
        {
            try
            {
                var violation = await service.ResolveViolationAsync(violationId, request.ResolutionNotes);
                var response = MapToViolationResponse(violation);
                return Results.Ok(ApiResponse<HOSViolationResponse>.CreateSuccess(response));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(ApiResponse<HOSViolationResponse>.CreateFailure(ex.Message));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<HOSViolationResponse>.CreateFailure($"Failed to resolve violation: {ex.Message}"));
            }
        })
        .WithName("ResolveHOSViolation")
        .WithSummary("Resolve a HOS violation");

        // Delete HOS log
        group.MapDelete("/logs/{logId}", async (
            Guid logId,
            HOSService service) =>
        {
            try
            {
                await service.DeleteLogAsync(logId);
                return Results.Ok(ApiResponse<object>.CreateSuccess(new { Message = "HOS log deleted successfully" }));
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(ApiResponse<object>.CreateFailure(ex.Message));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ApiResponse<object>.CreateFailure($"Failed to delete HOS log: {ex.Message}"));
            }
        })
        .WithName("DeleteHOSLog")
        .WithSummary("Delete a HOS log (only if not certified)");
    }

    // Mapping helpers
    private static HOSLogResponse MapToLogResponse(HOSLog log)
    {
        return new HOSLogResponse(
            log.Id,
            log.DriverId,
            log.Driver?.FirstName + " " + log.Driver?.LastName,
            log.StartTime,
            log.EndTime,
            log.Status,
            log.DurationMinutes,
            log.Location,
            log.Latitude,
            log.Longitude,
            log.Notes,
            log.VehicleId,
            log.Odometer,
            log.Source,
            log.IsEdited,
            log.EditedAt,
            log.EditReason,
            log.IsCertified,
            log.CertifiedAt,
            log.IsActive()
        );
    }

    private static HOSSummaryResponse MapToSummaryResponse(HOSSummary summary)
    {
        return new HOSSummaryResponse(
            summary.DriverId,
            summary.DriverName,
            summary.CalculatedAt,
            summary.CurrentStatus,
            summary.CurrentStatusSince,
            summary.HoursDrivenToday,
            summary.HoursAvailableDrive,
            summary.HoursOnDutyToday,
            summary.HoursAvailableOnDuty,
            summary.HoursInCycle,
            summary.HoursAvailableCycle,
            summary.TimeUntilBreakRequired,
            summary.LastRestPeriod,
            summary.IsInViolation,
            summary.ActiveViolations
        );
    }

    private static HOSViolationResponse MapToViolationResponse(HOSViolation violation)
    {
        return new HOSViolationResponse(
            violation.Id,
            violation.DriverId,
            violation.Driver?.FirstName + " " + violation.Driver?.LastName,
            violation.HOSLogId,
            violation.ViolationDateTime,
            violation.ViolationType,
            violation.Severity,
            violation.Description,
            violation.ActualValue,
            violation.LimitValue,
            violation.OverageAmount,
            violation.IsResolved,
            violation.ResolvedAt,
            violation.ResolutionNotes
        );
    }
}

