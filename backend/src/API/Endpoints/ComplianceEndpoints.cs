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
/// Compliance alert and driver qualification endpoints
/// </summary>
public static class ComplianceEndpoints
{
    public static void MapComplianceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/compliance")
            .WithTags("Compliance & Safety");

        // ===== COMPLIANCE ALERTS =====

        // Create alert
        group.MapPost("/alerts", async (
            [FromBody] CreateComplianceAlertRequest request,
            ComplianceService service) =>
        {
            try
            {
                var alert = await service.CreateAlertAsync(
                    request.AlertType,
                    request.Severity,
                    request.Title,
                    request.Description,
                    request.DriverId,
                    request.VehicleId,
                    request.DueDate,
                    request.ExpirationDate);

                var response = MapToAlertResponse(alert);
                return ApiResponse<ComplianceAlertResponse>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<ComplianceAlertResponse>.CreateFailure($"Failed to create alert: {ex.Message}");
            }
        })
        .WithName("CreateComplianceAlert")
        .WithSummary("Create a new compliance alert");

        // Get all active alerts
        group.MapGet("/alerts", async (ComplianceService service) =>
        {
            try
            {
                var alerts = await service.GetActiveAlertsAsync();
                var response = alerts.Select(MapToAlertResponse).ToList();
                return ApiResponse<List<ComplianceAlertResponse>>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<ComplianceAlertResponse>>.CreateFailure($"Failed to get alerts: {ex.Message}");
            }
        })
        .WithName("GetActiveAlerts")
        .WithSummary("Get all active compliance alerts");

        // Get alerts for driver
        group.MapGet("/alerts/driver/{driverId:guid}", async (
            Guid driverId,
            ComplianceService service) =>
        {
            try
            {
                var alerts = await service.GetDriverAlertsAsync(driverId);
                var response = alerts.Select(MapToAlertResponse).ToList();
                return ApiResponse<List<ComplianceAlertResponse>>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<ComplianceAlertResponse>>.CreateFailure($"Failed to get driver alerts: {ex.Message}");
            }
        })
        .WithName("GetDriverAlerts")
        .WithSummary("Get all alerts for a specific driver");

        // Get overdue alerts
        group.MapGet("/alerts/overdue", async (ComplianceService service) =>
        {
            try
            {
                var alerts = await service.GetOverdueAlertsAsync();
                var response = alerts.Select(MapToAlertResponse).ToList();
                return ApiResponse<List<ComplianceAlertResponse>>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<ComplianceAlertResponse>>.CreateFailure($"Failed to get overdue alerts: {ex.Message}");
            }
        })
        .WithName("GetOverdueAlerts")
        .WithSummary("Get all overdue compliance alerts");

        // Acknowledge alert
        group.MapPost("/alerts/{alertId:guid}/acknowledge", async (
            Guid alertId,
            [FromBody] AcknowledgeAlertRequest request,
            ComplianceService service) =>
        {
            try
            {
                var alert = await service.AcknowledgeAlertAsync(alertId, request.AcknowledgedBy);
                var response = MapToAlertResponse(alert);
                return ApiResponse<ComplianceAlertResponse>.CreateSuccess(response);
            }
            catch (InvalidOperationException ex)
            {
                return ApiResponse<ComplianceAlertResponse>.CreateFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiResponse<ComplianceAlertResponse>.CreateFailure($"Failed to acknowledge alert: {ex.Message}");
            }
        })
        .WithName("AcknowledgeAlert")
        .WithSummary("Acknowledge a compliance alert");

        // Resolve alert
        group.MapPost("/alerts/{alertId:guid}/resolve", async (
            Guid alertId,
            [FromBody] ResolveAlertRequest request,
            ComplianceService service) =>
        {
            try
            {
                var alert = await service.ResolveAlertAsync(alertId, request.ResolutionNotes);
                var response = MapToAlertResponse(alert);
                return ApiResponse<ComplianceAlertResponse>.CreateSuccess(response);
            }
            catch (InvalidOperationException ex)
            {
                return ApiResponse<ComplianceAlertResponse>.CreateFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiResponse<ComplianceAlertResponse>.CreateFailure($"Failed to resolve alert: {ex.Message}");
            }
        })
        .WithName("ResolveAlert")
        .WithSummary("Resolve a compliance alert");

        // Dismiss alert
        group.MapPost("/alerts/{alertId:guid}/dismiss", async (
            Guid alertId,
            ComplianceService service) =>
        {
            try
            {
                var alert = await service.DismissAlertAsync(alertId);
                var response = MapToAlertResponse(alert);
                return ApiResponse<ComplianceAlertResponse>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<ComplianceAlertResponse>.CreateFailure($"Failed to dismiss alert: {ex.Message}");
            }
        })
        .WithName("DismissAlert")
        .WithSummary("Dismiss a compliance alert");

        // Check expiring documents and create alerts
        group.MapPost("/alerts/check-expiring", async (
            [FromQuery] int daysAhead,
            ComplianceService service) =>
        {
            try
            {
                await service.CheckExpiringDocumentsAsync(daysAhead);
                return ApiResponse<object>.CreateSuccess(new { Message = "Checked for expiring documents and created alerts" });
            }
            catch (Exception ex)
            {
                return ApiResponse<object>.CreateFailure($"Failed to check expiring documents: {ex.Message}");
            }
        })
        .WithName("CheckExpiringDocuments")
        .WithSummary("Check for expiring documents and create alerts");

        // ===== DRIVER QUALIFICATION FILES =====

        // Add qualification file
        group.MapPost("/qualifications", async (
            [FromBody] AddQualificationFileRequest request,
            ComplianceService service) =>
        {
            try
            {
                var file = await service.AddQualificationFileAsync(
                    request.DriverId,
                    request.DocumentType,
                    request.DocumentNumber,
                    request.IssueDate,
                    request.ExpirationDate,
                    request.IssuingAuthority,
                    request.IssuingState,
                    request.DocumentPath,
                    request.Notes);

                var response = MapToQualificationResponse(file);
                return ApiResponse<DriverQualificationFileResponse>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<DriverQualificationFileResponse>.CreateFailure($"Failed to add qualification file: {ex.Message}");
            }
        })
        .WithName("AddQualificationFile")
        .WithSummary("Add a driver qualification file");

        // Get all qualification files for driver
        group.MapGet("/qualifications/driver/{driverId:guid}", async (
            Guid driverId,
            ComplianceService service) =>
        {
            try
            {
                var files = await service.GetDriverQualificationFilesAsync(driverId);
                var response = files.Select(MapToQualificationResponse).ToList();
                return ApiResponse<List<DriverQualificationFileResponse>>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<DriverQualificationFileResponse>>.CreateFailure($"Failed to get qualification files: {ex.Message}");
            }
        })
        .WithName("GetDriverQualificationFiles")
        .WithSummary("Get all qualification files for a driver");

        // Verify qualification file
        group.MapPost("/qualifications/{fileId:guid}/verify", async (
            Guid fileId,
            [FromBody] VerifyQualificationRequest request,
            ComplianceService service) =>
        {
            try
            {
                var file = await service.VerifyQualificationFileAsync(fileId, request.VerifiedBy);
                var response = MapToQualificationResponse(file);
                return ApiResponse<DriverQualificationFileResponse>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<DriverQualificationFileResponse>.CreateFailure($"Failed to verify qualification file: {ex.Message}");
            }
        })
        .WithName("VerifyQualificationFile")
        .WithSummary("Verify a driver qualification file");

        // Update qualification file
        group.MapPut("/qualifications/{fileId:guid}", async (
            Guid fileId,
            [FromBody] UpdateQualificationFileRequest request,
            ComplianceService service) =>
        {
            try
            {
                var file = await service.UpdateQualificationFileAsync(
                    fileId,
                    request.NewExpirationDate,
                    request.NewDocumentPath,
                    request.Notes);

                var response = MapToQualificationResponse(file);
                return ApiResponse<DriverQualificationFileResponse>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<DriverQualificationFileResponse>.CreateFailure($"Failed to update qualification file: {ex.Message}");
            }
        })
        .WithName("UpdateQualificationFile")
        .WithSummary("Update a driver qualification file");

        // Delete qualification file
        group.MapDelete("/qualifications/{fileId:guid}", async (
            Guid fileId,
            ComplianceService service) =>
        {
            try
            {
                await service.DeleteQualificationFileAsync(fileId);
                return ApiResponse<object>.CreateSuccess(new { Message = "Qualification file deleted successfully" });
            }
            catch (Exception ex)
            {
                return ApiResponse<object>.CreateFailure($"Failed to delete qualification file: {ex.Message}");
            }
        })
        .WithName("DeleteQualificationFile")
        .WithSummary("Delete a driver qualification file");

        // ===== SAFETY SCORES =====

        // Calculate safety score
        group.MapPost("/safety-scores/calculate", async (
            [FromBody] CalculateSafetyScoreRequest request,
            SafetyScoringService service) =>
        {
            try
            {
                var score = await service.CalculateSafetyScoreAsync(
                    request.DriverId,
                    request.PeriodStart,
                    request.PeriodEnd);

                var response = MapToSafetyScoreResponse(score);
                return ApiResponse<DriverSafetyScoreResponse>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<DriverSafetyScoreResponse>.CreateFailure($"Failed to calculate safety score: {ex.Message}");
            }
        })
        .WithName("CalculateSafetyScore")
        .WithSummary("Calculate safety score for a driver over a period");

        // Get safety score trend
        group.MapGet("/safety-scores/driver/{driverId:guid}/trend", async (
            Guid driverId,
            [FromQuery] int months,
            SafetyScoringService service) =>
        {
            try
            {
                var scores = await service.GetSafetyScoreTrendAsync(driverId, months);
                var response = scores.Select(MapToSafetyScoreResponse).ToList();
                return ApiResponse<List<DriverSafetyScoreResponse>>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<DriverSafetyScoreResponse>>.CreateFailure($"Failed to get safety score trend: {ex.Message}");
            }
        })
        .WithName("GetSafetyScoreTrend")
        .WithSummary("Get safety score trend over time for a driver");

        // Get top safety performers
        group.MapGet("/safety-scores/top-performers", async (
            [FromQuery] int count,
            SafetyScoringService service) =>
        {
            try
            {
                var performers = await service.GetTopSafetyPerformersAsync(count);
                var response = performers.Select(MapToSafetyScoreResponse).ToList();
                return ApiResponse<List<DriverSafetyScoreResponse>>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<DriverSafetyScoreResponse>>.CreateFailure($"Failed to get top performers: {ex.Message}");
            }
        })
        .WithName("GetTopSafetyPerformers")
        .WithSummary("Get drivers with the highest safety scores");

        // Get drivers needing intervention
        group.MapGet("/safety-scores/intervention-needed", async (
            [FromQuery] decimal threshold,
            SafetyScoringService service) =>
        {
            try
            {
                var drivers = await service.GetDriversNeedingInterventionAsync(threshold);
                var response = drivers.Select(MapToSafetyScoreResponse).ToList();
                return ApiResponse<List<DriverSafetyScoreResponse>>.CreateSuccess(response);
            }
            catch (Exception ex)
            {
                return ApiResponse<List<DriverSafetyScoreResponse>>.CreateFailure($"Failed to get drivers needing intervention: {ex.Message}");
            }
        })
        .WithName("GetDriversNeedingIntervention")
        .WithSummary("Get drivers with safety scores below threshold");
    }

    // Mapping helpers
    private static ComplianceAlertResponse MapToAlertResponse(ComplianceAlert alert)
    {
        return new ComplianceAlertResponse(
            alert.Id,
            alert.DriverId,
            alert.Driver?.FirstName + " " + alert.Driver?.LastName,
            alert.VehicleId,
            alert.AlertType,
            alert.Severity,
            alert.Status,
            alert.Title,
            alert.Description,
            alert.DueDate,
            alert.ExpirationDate,
            alert.DaysUntilDue,
            alert.IsOverdue,
            false, // NotificationSent
            null, // NotificationSentAt
            alert.Status != ComplianceAlertStatus.Active,
            alert.AcknowledgedAt,
            alert.AcknowledgedBy,
            alert.ResolvedAt,
            alert.ResolutionNotes
        );
    }

    private static DriverQualificationFileResponse MapToQualificationResponse(DriverQualificationFile file)
    {
        return new DriverQualificationFileResponse(
            file.Id,
            file.DriverId,
            file.Driver?.FirstName + " " + file.Driver?.LastName,
            file.DocumentType,
            file.DocumentNumber,
            file.IssueDate,
            file.ExpirationDate,
            file.IssuingAuthority,
            file.IssuingState,
            file.DocumentPath,
            file.IsVerified,
            file.VerifiedAt,
            file.VerifiedBy,
            file.IsExpired,
            file.DaysUntilExpiration,
            file.Notes
        );
    }

    private static DriverSafetyScoreResponse MapToSafetyScoreResponse(DriverSafetyScore score)
    {
        return new DriverSafetyScoreResponse(
            score.Id,
            score.DriverId,
            score.Driver?.FirstName + " " + score.Driver?.LastName,
            DateTime.UtcNow, // CalculatedDate
            score.PeriodStartDate,
            score.PeriodEndDate,
            score.OverallScore,
            score.GetSafetyRating(),
            score.AccidentScore,
            score.ViolationScore,
            score.HOSComplianceScore,
            score.InspectionScore,
            score.DrivingBehaviorScore,
            score.AccidentCount,
            score.ViolationCount,
            score.HOSViolationCount,
            score.InspectionCount,
            0, // HardBrakingCount
            0, // SpeedingCount
            0, // IdleTimeMinutes
            score.MilesDriven,
            null // Notes
        );
    }
}
