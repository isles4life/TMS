namespace TMS.Application.DTOs.Maintenance;

using System;
using System.Collections.Generic;
using TMS.Domain.Entities.Maintenance;

// ========== MAINTENANCE SCHEDULE DTOs ==========

public record CreateMaintenanceScheduleRequest(
    Guid? TractorId,
    Guid? TrailerId,
    string ScheduleName,
    string Description,
    MaintenanceScheduleType ScheduleType,
    int? MileageInterval = null,
    int? DaysInterval = null,
    int? EngineHoursInterval = null,
    decimal? LastServiceMileage = null,
    DateTime? LastServiceDate = null,
    decimal? LastServiceEngineHours = null,
    decimal CurrentMileage = 0,
    decimal? CurrentEngineHours = null,
    int NotificationDaysBefore = 7
);

public record UpdateMaintenanceScheduleRequest(
    decimal? CurrentMileage = null,
    decimal? CurrentEngineHours = null,
    bool? IsActive = null
);

public record MaintenanceScheduleResponse(
    Guid Id,
    Guid? TractorId,
    Guid? TrailerId,
    string ScheduleName,
    string Description,
    MaintenanceScheduleType ScheduleType,
    int? MileageInterval,
    int? DaysInterval,
    int? EngineHoursInterval,
    decimal? LastServiceMileage,
    DateTime? LastServiceDate,
    decimal? LastServiceEngineHours,
    decimal CurrentMileage,
    decimal? CurrentEngineHours,
    DateTime? NextServiceDueDate,
    decimal? NextServiceDueMileage,
    decimal? NextServiceDueEngineHours,
    int? DaysUntilDue,
    decimal? MileageUntilDue,
    bool IsOverdue,
    bool ShouldNotify,
    bool IsActive,
    int NotificationDaysBefore,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record AddMaintenanceTaskRequest(
    string TaskName,
    string Description,
    MaintenanceTaskCategory Category,
    decimal? EstimatedCost = null,
    int? EstimatedDurationMinutes = null,
    bool IsRequired = true,
    int SortOrder = 0,
    string? Notes = null
);

public record MaintenanceTaskResponse(
    Guid Id,
    Guid MaintenanceScheduleId,
    string TaskName,
    string Description,
    MaintenanceTaskCategory Category,
    decimal? EstimatedCost,
    int? EstimatedDurationMinutes,
    bool IsRequired,
    int SortOrder,
    string? Notes
);

// ========== MAINTENANCE RECORD DTOs ==========

public record CreateMaintenanceRecordRequest(
    Guid? TractorId,
    Guid? TrailerId,
    Guid? MaintenanceScheduleId,
    Guid? VendorId,
    MaintenanceRecordType RecordType,
    string Description,
    DateTime ServiceDate,
    decimal? MileageAtService = null,
    decimal? EngineHoursAtService = null,
    string? WorkOrderNumber = null
);

public record CompleteMaintenanceRecordRequest(
    decimal LaborCost,
    decimal PartsCost,
    string? Notes = null
);

public record UpdateMaintenanceRecordRequest(
    DateTime? ServiceDate = null,
    MaintenanceRecordStatus? Status = null,
    decimal? MileageAtService = null,
    decimal? EngineHoursAtService = null,
    string? TechnicianName = null,
    string? Notes = null
);

public record MaintenanceRecordResponse(
    Guid Id,
    Guid? MaintenanceScheduleId,
    Guid? TractorId,
    Guid? TrailerId,
    Guid? VendorId,
    string? VendorName,
    MaintenanceRecordType RecordType,
    string WorkOrderNumber,
    string Description,
    DateTime ServiceDate,
    DateTime? CompletedDate,
    decimal? MileageAtService,
    decimal? EngineHoursAtService,
    MaintenanceRecordStatus Status,
    decimal LaborCost,
    decimal PartsCost,
    decimal TotalCost,
    string? TechnicianName,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record AddMaintenanceRecordItemRequest(
    string ItemType,
    string Description,
    decimal Quantity = 1,
    decimal UnitCost = 0,
    string? PartNumber = null,
    string? Notes = null
);

public record MaintenanceRecordItemResponse(
    Guid Id,
    Guid MaintenanceRecordId,
    string ItemType,
    string Description,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost,
    string? PartNumber,
    string? Notes
);

// ========== VENDOR DTOs ==========

public record CreateVendorRequest(
    string VendorName,
    VendorType VendorType,
    string? VendorCode = null,
    string? ContactName = null,
    string? Email = null,
    string? Phone = null,
    string? Website = null,
    string? AddressLine1 = null,
    string? AddressLine2 = null,
    string? City = null,
    string? State = null,
    string? ZipCode = null,
    string? Country = "USA",
    string? TaxId = null,
    string? ServiceCapabilities = null,
    int PaymentTermsDays = 30
);

public record UpdateVendorRequest(
    string? VendorName = null,
    VendorType? VendorType = null,
    VendorStatus? Status = null,
    string? ContactName = null,
    string? Email = null,
    string? Phone = null,
    string? Website = null,
    string? AddressLine1 = null,
    string? City = null,
    string? State = null,
    string? ZipCode = null,
    string? ServiceCapabilities = null,
    bool? IsPreferred = null,
    string? Notes = null
);

public record VendorResponse(
    Guid Id,
    string VendorName,
    string? VendorCode,
    VendorType VendorType,
    VendorStatus Status,
    string? ContactName,
    string? Email,
    string? Phone,
    string? Website,
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? ZipCode,
    string? Country,
    string? TaxId,
    string? ServiceCapabilities,
    decimal? Rating,
    int TotalJobsCompleted,
    decimal? AverageCompletionTime,
    int PaymentTermsDays,
    bool HasInsurance,
    DateTime? InsuranceExpirationDate,
    DateTime? LastServiceDate,
    bool IsPreferred,
    bool IsAvailable,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record UpdateVendorRatingRequest(
    decimal Rating
);

// ========== ANALYTICS DTOs ==========

public record MaintenanceCostSummaryRequest(
    DateTime? StartDate = null,
    DateTime? EndDate = null
);

public record MaintenanceCostSummaryResponse(
    decimal TotalCost,
    decimal LaborCost,
    decimal PartsCost,
    int RecordCount,
    DateTime? StartDate,
    DateTime? EndDate
);
