namespace TMS.Application.DTOs.Compliance;

using System;
using System.Collections.Generic;
using TMS.Domain.Entities.Compliance;

// ========== HOS DTOs ==========

public record StartHOSLogRequest(
    Guid DriverId,
    HOSStatus Status,
    string? Location = null,
    decimal? Latitude = null,
    decimal? Longitude = null,
    string? VehicleId = null,
    decimal? Odometer = null
);

public record CompleteHOSLogRequest(
    Guid DriverId,
    string? Notes = null
);

public record ChangeStatusRequest(
    Guid DriverId,
    HOSStatus NewStatus,
    string? Location = null,
    decimal? Latitude = null,
    decimal? Longitude = null
);

public record EditHOSLogRequest(
    string EditReason,
    DateTime? NewStartTime = null,
    DateTime? NewEndTime = null
);

public record HOSLogResponse(
    Guid Id,
    Guid DriverId,
    string? DriverName,
    DateTime StartTime,
    DateTime? EndTime,
    HOSStatus Status,
    int DurationMinutes,
    string? Location,
    decimal? Latitude,
    decimal? Longitude,
    string? Notes,
    string? VehicleId,
    decimal? Odometer,
    HOSLogSource Source,
    bool IsEdited,
    DateTime? EditedAt,
    string? EditReason,
    bool IsCertified,
    DateTime? CertifiedAt,
    bool IsActive
);

public record HOSSummaryResponse(
    Guid DriverId,
    string DriverName,
    DateTime CalculatedAt,
    HOSStatus CurrentStatus,
    DateTime CurrentStatusSince,
    decimal HoursDrivenToday,
    decimal HoursAvailableDrive,
    decimal HoursOnDutyToday,
    decimal HoursAvailableOnDuty,
    decimal HoursInCycle,
    decimal HoursAvailableCycle,
    TimeSpan? TimeUntilBreakRequired,
    DateTime? LastRestPeriod,
    bool IsInViolation,
    List<string> ActiveViolations
);

public record HOSViolationResponse(
    Guid Id,
    Guid DriverId,
    string? DriverName,
    Guid? HOSLogId,
    DateTime ViolationDateTime,
    HOSViolationType ViolationType,
    HOSViolationSeverity Severity,
    string Description,
    decimal ActualValue,
    decimal LimitValue,
    decimal OverageAmount,
    bool IsResolved,
    DateTime? ResolvedAt,
    string? ResolutionNotes
);

public record ResolveViolationRequest(
    string ResolutionNotes
);

// ========== Compliance Alert DTOs ==========

public record CreateComplianceAlertRequest(
    ComplianceAlertType AlertType,
    ComplianceAlertSeverity Severity,
    string Title,
    string Description,
    Guid? DriverId = null,
    Guid? VehicleId = null,
    DateTime? DueDate = null,
    DateTime? ExpirationDate = null,
    int AlertDaysBefore = 30
);

public record ComplianceAlertResponse(
    Guid Id,
    Guid? DriverId,
    string? DriverName,
    Guid? VehicleId,
    ComplianceAlertType AlertType,
    ComplianceAlertSeverity Severity,
    ComplianceAlertStatus Status,
    string Title,
    string Description,
    DateTime? DueDate,
    DateTime? ExpirationDate,
    int? DaysUntilDue,
    bool IsOverdue,
    bool NotificationSent,
    DateTime? NotificationSentAt,
    bool IsAcknowledged,
    DateTime? AcknowledgedAt,
    string? AcknowledgedBy,
    DateTime? ResolvedAt,
    string? ResolutionNotes
);

public record AcknowledgeAlertRequest(
    string AcknowledgedBy
);

public record ResolveAlertRequest(
    string ResolutionNotes
);

// ========== Driver Qualification DTOs ==========

public record AddQualificationFileRequest(
    Guid DriverId,
    QualificationDocumentType DocumentType,
    string DocumentNumber,
    DateTime IssueDate,
    DateTime ExpirationDate,
    string IssuingAuthority,
    string IssuingState,
    string? DocumentPath = null,
    string? Notes = null
);

public record UpdateQualificationFileRequest(
    DateTime? NewExpirationDate = null,
    string? NewDocumentPath = null,
    string? Notes = null
);

public record DriverQualificationFileResponse(
    Guid Id,
    Guid DriverId,
    string? DriverName,
    QualificationDocumentType DocumentType,
    string DocumentNumber,
    DateTime IssueDate,
    DateTime ExpirationDate,
    string IssuingAuthority,
    string IssuingState,
    string? DocumentPath,
    bool IsVerified,
    DateTime? VerifiedAt,
    string? VerifiedBy,
    bool IsExpired,
    int DaysUntilExpiration,
    string? Notes
);

public record VerifyQualificationRequest(
    string VerifiedBy
);

// ========== Safety Score DTOs ==========

public record DriverSafetyScoreResponse(
    Guid Id,
    Guid DriverId,
    string? DriverName,
    DateTime CalculatedDate,
    DateTime PeriodStartDate,
    DateTime PeriodEndDate,
    decimal OverallScore,
    SafetyRating SafetyRating,
    decimal AccidentScore,
    decimal ViolationScore,
    decimal HOSComplianceScore,
    decimal InspectionScore,
    decimal DrivingBehaviorScore,
    int AccidentCount,
    int ViolationCount,
    int HOSViolationCount,
    int InspectionCount,
    int HardBrakingCount,
    int SpeedingCount,
    int IdleTimeMinutes,
    decimal MilesDriven,
    string? Notes
);

public record CalculateSafetyScoreRequest(
    Guid DriverId,
    DateTime PeriodStart,
    DateTime PeriodEnd
);
