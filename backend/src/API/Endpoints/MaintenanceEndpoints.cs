namespace TMS.API.Endpoints;

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using TMS.Application.DTOs.Maintenance;
using TMS.Application.Services.Maintenance;
using TMS.Domain.Common;
using TMS.Domain.Entities.Maintenance;

/// <summary>
/// Maintenance scheduling and PM management endpoints
/// </summary>
public static class MaintenanceEndpoints
{
    public static void MapMaintenanceEndpoints(this IEndpointRouteBuilder app)
    {
        var scheduleGroup = app.MapGroup("/api/maintenance/schedules")
            .WithTags("Maintenance Schedules");

        var recordGroup = app.MapGroup("/api/maintenance/records")
            .WithTags("Maintenance Records");

        var vendorGroup = app.MapGroup("/api/maintenance/vendors")
            .WithTags("Vendors");

        // ===== MAINTENANCE SCHEDULES =====

        scheduleGroup.MapPost("/", async (
            [FromBody] CreateMaintenanceScheduleRequest request,
            MaintenanceSchedulingService service) =>
        {
            try
            {
                var schedule = await service.CreateScheduleAsync(
                    request.TractorId,
                    request.TrailerId,
                    request.ScheduleName,
                    request.Description,
                    request.ScheduleType,
                    request.MileageInterval,
                    request.DaysInterval,
                    request.EngineHoursInterval,
                    request.LastServiceMileage,
                    request.LastServiceDate,
                    request.LastServiceEngineHours,
                    request.CurrentMileage,
                    request.CurrentEngineHours,
                    request.NotificationDaysBefore);

                return ApiResponse<MaintenanceScheduleResponse>.CreateSuccess(MapToScheduleResponse(schedule));
            }
            catch (Exception ex)
            {
                return ApiResponse<MaintenanceScheduleResponse>.CreateFailure($"Failed to create schedule: {ex.Message}");
            }
        })
        .WithName("CreateMaintenanceSchedule")
        .WithSummary("Create a new maintenance schedule");

        scheduleGroup.MapGet("/tractor/{tractorId:guid}", async (
            Guid tractorId,
            MaintenanceSchedulingService service) =>
        {
            try
            {
                var schedules = await service.GetTractorSchedulesAsync(tractorId);
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateSuccess(
                    schedules.Select(MapToScheduleResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateFailure($"Failed to get schedules: {ex.Message}");
            }
        })
        .WithName("GetTractorSchedules")
        .WithSummary("Get all schedules for a vehicle");

        scheduleGroup.MapGet("/trailer/{trailerId:guid}", async (
            Guid trailerId,
            MaintenanceSchedulingService service) =>
        {
            try
            {
                var schedules = await service.GetTrailerSchedulesAsync(trailerId);
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateSuccess(
                    schedules.Select(MapToScheduleResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateFailure($"Failed to get schedules: {ex.Message}");
            }
        })
        .WithName("GetTrailerSchedules")
        .WithSummary("Get all schedules for equipment");

        scheduleGroup.MapGet("/overdue", async (MaintenanceSchedulingService service) =>
        {
            try
            {
                var schedules = await service.GetOverdueSchedulesAsync();
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateSuccess(
                    schedules.Select(MapToScheduleResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateFailure($"Failed to get overdue schedules: {ex.Message}");
            }
        })
        .WithName("GetOverdueSchedules")
        .WithSummary("Get all overdue maintenance schedules");

        scheduleGroup.MapGet("/due-soon", async (
            [FromQuery] int daysAhead,
            MaintenanceSchedulingService service) =>
        {
            try
            {
                var schedules = await service.GetSchedulesDueSoonAsync(daysAhead);
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateSuccess(
                    schedules.Select(MapToScheduleResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<MaintenanceScheduleResponse>>.CreateFailure($"Failed to get due soon schedules: {ex.Message}");
            }
        })
        .WithName("GetSchedulesDueSoon")
        .WithSummary("Get schedules due soon");

        scheduleGroup.MapPut("/{scheduleId:guid}/status", async (
            Guid scheduleId,
            [FromBody] UpdateMaintenanceScheduleRequest request,
            MaintenanceSchedulingService service) =>
        {
            try
            {
                var schedule = await service.UpdateCurrentStatusAsync(
                    scheduleId,
                    request.CurrentMileage,
                    request.CurrentEngineHours);

                if (request.IsActive.HasValue)
                {
                    schedule = request.IsActive.Value 
                        ? await service.ActivateScheduleAsync(scheduleId)
                        : await service.DeactivateScheduleAsync(scheduleId);
                }

                return ApiResponse<MaintenanceScheduleResponse>.CreateSuccess(MapToScheduleResponse(schedule));
            }
            catch (Exception ex)
            {
                return ApiResponse<MaintenanceScheduleResponse>.CreateFailure($"Failed to update schedule: {ex.Message}");
            }
        })
        .WithName("UpdateScheduleStatus")
        .WithSummary("Update schedule current status");

        scheduleGroup.MapDelete("/{scheduleId:guid}", async (
            Guid scheduleId,
            MaintenanceSchedulingService service) =>
        {
            try
            {
                await service.DeleteScheduleAsync(scheduleId);
                return ApiResponse<object>.CreateSuccess(new { Message = "Schedule deleted successfully" });
            }
            catch (Exception ex)
            {
                return ApiResponse<object>.CreateFailure($"Failed to delete schedule: {ex.Message}");
            }
        })
        .WithName("DeleteSchedule")
        .WithSummary("Delete a maintenance schedule");

        // ===== MAINTENANCE RECORDS =====

        recordGroup.MapPost("/", async (
            [FromBody] CreateMaintenanceRecordRequest request,
            MaintenanceRecordService service) =>
        {
            try
            {
                var record = await service.CreateRecordAsync(
                    request.TractorId,
                    request.TrailerId,
                    request.MaintenanceScheduleId,
                    request.VendorId,
                    request.RecordType,
                    request.Description,
                    request.ServiceDate,
                    request.MileageAtService,
                    request.EngineHoursAtService,
                    request.WorkOrderNumber);

                return ApiResponse<MaintenanceRecordResponse>.CreateSuccess(MapToRecordResponse(record));
            }
            catch (Exception ex)
            {
                return ApiResponse<MaintenanceRecordResponse>.CreateFailure($"Failed to create record: {ex.Message}");
            }
        })
        .WithName("CreateMaintenanceRecord")
        .WithSummary("Create a new maintenance record");

        recordGroup.MapGet("/{recordId:guid}", async (
            Guid recordId,
            MaintenanceRecordService service) =>
        {
            try
            {
                var record = await service.GetRecordByIdAsync(recordId);
                if (record == null)
                    return ApiResponse<MaintenanceRecordResponse>.CreateFailure("Record not found");

                return ApiResponse<MaintenanceRecordResponse>.CreateSuccess(MapToRecordResponse(record));
            }
            catch (Exception ex)
            {
                return ApiResponse<MaintenanceRecordResponse>.CreateFailure($"Failed to get record: {ex.Message}");
            }
        })
        .WithName("GetMaintenanceRecord")
        .WithSummary("Get maintenance record by ID");

        recordGroup.MapGet("/tractor/{tractorId:guid}", async (
            Guid tractorId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            MaintenanceRecordService service) =>
        {
            try
            {
                var records = await service.GetTractorRecordsAsync(tractorId, startDate, endDate);
                return ApiResponse<List<MaintenanceRecordResponse>>.CreateSuccess(
                    records.Select(MapToRecordResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<MaintenanceRecordResponse>>.CreateFailure($"Failed to get records: {ex.Message}");
            }
        })
        .WithName("GetTractorRecords")
        .WithSummary("Get maintenance records for a vehicle");

        recordGroup.MapPost("/{recordId:guid}/start", async (
            Guid recordId,
            [FromQuery] string? technicianName,
            MaintenanceRecordService service) =>
        {
            try
            {
                var record = await service.StartWorkAsync(recordId, technicianName);
                return ApiResponse<MaintenanceRecordResponse>.CreateSuccess(MapToRecordResponse(record));
            }
            catch (Exception ex)
            {
                return ApiResponse<MaintenanceRecordResponse>.CreateFailure($"Failed to start work: {ex.Message}");
            }
        })
        .WithName("StartMaintenanceWork")
        .WithSummary("Start work on a maintenance record");

        recordGroup.MapPost("/{recordId:guid}/complete", async (
            Guid recordId,
            [FromBody] CompleteMaintenanceRecordRequest request,
            MaintenanceRecordService service) =>
        {
            try
            {
                var record = await service.CompleteRecordAsync(
                    recordId,
                    request.LaborCost,
                    request.PartsCost,
                    request.Notes);

                return ApiResponse<MaintenanceRecordResponse>.CreateSuccess(MapToRecordResponse(record));
            }
            catch (Exception ex)
            {
                return ApiResponse<MaintenanceRecordResponse>.CreateFailure($"Failed to complete record: {ex.Message}");
            }
        })
        .WithName("CompleteMaintenanceRecord")
        .WithSummary("Complete a maintenance record");

        recordGroup.MapGet("/scheduled", async (MaintenanceRecordService service) =>
        {
            try
            {
                var records = await service.GetScheduledRecordsAsync();
                return ApiResponse<List<MaintenanceRecordResponse>>.CreateSuccess(
                    records.Select(MapToRecordResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<MaintenanceRecordResponse>>.CreateFailure($"Failed to get scheduled records: {ex.Message}");
            }
        })
        .WithName("GetScheduledRecords")
        .WithSummary("Get all scheduled maintenance records");

        // ===== VENDORS =====

        vendorGroup.MapPost("/", async (
            [FromBody] CreateVendorRequest request,
            VendorService service) =>
        {
            try
            {
                var vendor = await service.CreateVendorAsync(
                    request.VendorName,
                    request.VendorType,
                    request.ContactName,
                    request.Email,
                    request.Phone,
                    request.AddressLine1,
                    request.City,
                    request.State,
                    request.ZipCode);

                return ApiResponse<VendorResponse>.CreateSuccess(MapToVendorResponse(vendor));
            }
            catch (Exception ex)
            {
                return ApiResponse<VendorResponse>.CreateFailure($"Failed to create vendor: {ex.Message}");
            }
        })
        .WithName("CreateVendor")
        .WithSummary("Create a new vendor");

        vendorGroup.MapGet("/", async (VendorService service) =>
        {
            try
            {
                var vendors = await service.GetAllVendorsAsync();
                return ApiResponse<List<VendorResponse>>.CreateSuccess(
                    vendors.Select(MapToVendorResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<VendorResponse>>.CreateFailure($"Failed to get vendors: {ex.Message}");
            }
        })
        .WithName("GetAllVendors")
        .WithSummary("Get all vendors");

        vendorGroup.MapGet("/active", async (VendorService service) =>
        {
            try
            {
                var vendors = await service.GetActiveVendorsAsync();
                return ApiResponse<List<VendorResponse>>.CreateSuccess(
                    vendors.Select(MapToVendorResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<VendorResponse>>.CreateFailure($"Failed to get active vendors: {ex.Message}");
            }
        })
        .WithName("GetActiveVendors")
        .WithSummary("Get active vendors");

        vendorGroup.MapGet("/preferred", async (VendorService service) =>
        {
            try
            {
                var vendors = await service.GetPreferredVendorsAsync();
                return ApiResponse<List<VendorResponse>>.CreateSuccess(
                    vendors.Select(MapToVendorResponse).ToList());
            }
            catch (Exception ex)
            {
                return ApiResponse<List<VendorResponse>>.CreateFailure($"Failed to get preferred vendors: {ex.Message}");
            }
        })
        .WithName("GetPreferredVendors")
        .WithSummary("Get preferred vendors");

        vendorGroup.MapPost("/{vendorId:guid}/rating", async (
            Guid vendorId,
            [FromBody] UpdateVendorRatingRequest request,
            VendorService service) =>
        {
            try
            {
                var vendor = await service.UpdateVendorRatingAsync(vendorId, request.Rating);
                return ApiResponse<VendorResponse>.CreateSuccess(MapToVendorResponse(vendor));
            }
            catch (Exception ex)
            {
                return ApiResponse<VendorResponse>.CreateFailure($"Failed to update rating: {ex.Message}");
            }
        })
        .WithName("UpdateVendorRating")
        .WithSummary("Update vendor rating");

        vendorGroup.MapPost("/{vendorId:guid}/deactivate", async (
            Guid vendorId,
            [FromQuery] string reason,
            VendorService service) =>
        {
            try
            {
                var vendor = await service.DeactivateVendorAsync(vendorId, reason);
                return ApiResponse<VendorResponse>.CreateSuccess(MapToVendorResponse(vendor));
            }
            catch (Exception ex)
            {
                return ApiResponse<VendorResponse>.CreateFailure($"Failed to deactivate vendor: {ex.Message}");
            }
        })
        .WithName("DeactivateVendor")
        .WithSummary("Deactivate a vendor");
    }

    // Mapping helpers
    private static MaintenanceScheduleResponse MapToScheduleResponse(MaintenanceSchedule schedule)
    {
        return new MaintenanceScheduleResponse(
            schedule.Id,
            schedule.TractorId,
            schedule.TrailerId,
            schedule.ScheduleName,
            schedule.Description,
            schedule.ScheduleType,
            schedule.MileageInterval,
            schedule.DaysInterval,
            schedule.EngineHoursInterval,
            schedule.LastServiceMileage,
            schedule.LastServiceDate,
            schedule.LastServiceEngineHours,
            schedule.CurrentMileage,
            schedule.CurrentEngineHours,
            schedule.NextServiceDueDate,
            schedule.NextServiceDueMileage,
            schedule.NextServiceDueEngineHours,
            schedule.DaysUntilDue,
            schedule.MileageUntilDue,
            schedule.IsOverdue,
            schedule.ShouldNotify,
            schedule.IsActive,
            schedule.NotificationDaysBefore,
            schedule.CreatedAt,
            schedule.UpdatedAt
        );
    }

    private static MaintenanceRecordResponse MapToRecordResponse(Domain.Entities.Maintenance.MaintenanceRecord record)
    {
        return new MaintenanceRecordResponse(
            record.Id,
            record.MaintenanceScheduleId,
            record.TractorId,
            record.TrailerId,
            record.VendorId,
            record.Vendor?.VendorName,
            record.RecordType,
            record.WorkOrderNumber,
            record.Description,
            record.ServiceDate,
            record.CompletedDate,
            record.MileageAtService,
            record.EngineHoursAtService,
            record.Status,
            record.LaborCost,
            record.PartsCost,
            record.TotalCost,
            record.TechnicianName,
            record.Notes,
            record.CreatedAt,
            record.UpdatedAt
        );
    }

    private static VendorResponse MapToVendorResponse(Vendor vendor)
    {
        return new VendorResponse(
            vendor.Id,
            vendor.VendorName,
            vendor.VendorCode,
            vendor.VendorType,
            vendor.Status,
            vendor.ContactName,
            vendor.Email,
            vendor.Phone,
            vendor.Website,
            vendor.AddressLine1,
            vendor.AddressLine2,
            vendor.City,
            vendor.State,
            vendor.ZipCode,
            vendor.Country,
            vendor.TaxId,
            vendor.ServiceCapabilities,
            vendor.Rating,
            vendor.TotalJobsCompleted,
            vendor.AverageCompletionTime,
            vendor.PaymentTermsDays,
            vendor.HasInsurance,
            vendor.InsuranceExpirationDate,
            vendor.LastServiceDate,
            vendor.IsPreferred,
            vendor.IsAvailable,
            vendor.Notes,
            vendor.CreatedAt,
            vendor.UpdatedAt
        );
    }
}
