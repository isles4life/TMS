namespace TMS.Domain.Entities.Compliance;

using System;
using TMS.Domain.Common;
using TMS.Domain.Entities.Drivers;

/// <summary>
/// Compliance alert for driver/vehicle expirations and requirements
/// </summary>
public class ComplianceAlert : BaseEntity
{
    public Guid? DriverId { get; set; }
    public Driver? Driver { get; set; }
    
    public Guid? VehicleId { get; set; }
    
    public ComplianceAlertType AlertType { get; set; }
    public ComplianceAlertSeverity Severity { get; set; }
    public ComplianceAlertStatus Status { get; set; } = ComplianceAlertStatus.Active;
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    
    /// <summary>
    /// Days until due/expiration
    /// </summary>
    public int? DaysUntilDue => DueDate.HasValue 
        ? (int)(DueDate.Value.Date - DateTime.UtcNow.Date).TotalDays 
        : null;
    
    public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow;
    
    /// <summary>
    /// Whether notification has been sent
    /// </summary>
    public bool NotificationSent { get; set; }
    public DateTime? NotificationSentAt { get; set; }
    
    /// <summary>
    /// When alert should trigger (days before due date)
    /// </summary>
    public int AlertDaysBefore { get; set; } = 30;
    
    public bool IsAcknowledged { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public string? AcknowledgedBy { get; set; }
    
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }
    
    /// <summary>
    /// Acknowledge the alert
    /// </summary>
    public void Acknowledge(string acknowledgedBy)
    {
        IsAcknowledged = true;
        AcknowledgedAt = DateTime.UtcNow;
        AcknowledgedBy = acknowledgedBy;
    }
    
    /// <summary>
    /// Resolve the alert
    /// </summary>
    public void Resolve(string notes)
    {
        Status = ComplianceAlertStatus.Resolved;
        ResolvedAt = DateTime.UtcNow;
        ResolutionNotes = notes;
    }
    
    /// <summary>
    /// Dismiss the alert
    /// </summary>
    public void Dismiss()
    {
        Status = ComplianceAlertStatus.Dismissed;
    }
}

/// <summary>
/// Types of compliance alerts
/// </summary>
public enum ComplianceAlertType
{
    // Driver Related
    CDLExpiration = 0,
    MedicalCardExpiration = 1,
    DrugTestDue = 2,
    BackgroundCheckDue = 3,
    TrainingCertificationExpiration = 4,
    HazMatEndorsementExpiration = 5,
    
    // Vehicle Related
    VehicleInspectionDue = 10,
    VehicleRegistrationExpiration = 11,
    InsuranceExpiration = 12,
    IFTAFilingDue = 13,
    EmissionsTestDue = 14,
    
    // HOS Related
    HOSViolation = 20,
    RestPeriodRequired = 21,
    BreakRequired = 22,
    
    // Safety Related
    SafetyRatingLow = 30,
    CSAScoreHigh = 31,
    AccidentReportDue = 32,
    
    // Other
    Other = 99
}

/// <summary>
/// Severity levels for compliance alerts
/// </summary>
public enum ComplianceAlertSeverity
{
    Info = 0,
    Warning = 1,
    Critical = 2,
    Urgent = 3
}

/// <summary>
/// Status of compliance alert
/// </summary>
public enum ComplianceAlertStatus
{
    Active = 0,
    Acknowledged = 1,
    Resolved = 2,
    Dismissed = 3,
    Expired = 4
}

/// <summary>
/// Driver qualification file for maintaining DOT required documents
/// </summary>
public class DriverQualificationFile : BaseEntity
{
    public Guid DriverId { get; set; }
    public Driver? Driver { get; set; }
    
    public QualificationDocumentType DocumentType { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    
    public DateTime IssueDate { get; set; }
    public DateTime ExpirationDate { get; set; }
    
    public string IssuingAuthority { get; set; } = string.Empty;
    public string IssuingState { get; set; } = string.Empty;
    
    /// <summary>
    /// File path or URL to document
    /// </summary>
    public string? DocumentPath { get; set; }
    
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? VerifiedBy { get; set; }
    
    public bool IsExpired => ExpirationDate < DateTime.UtcNow;
    public int DaysUntilExpiration => (int)(ExpirationDate.Date - DateTime.UtcNow.Date).TotalDays;
    
    public string? Notes { get; set; }
    
    /// <summary>
    /// Verify the document
    /// </summary>
    public void Verify(string verifiedBy)
    {
        IsVerified = true;
        VerifiedAt = DateTime.UtcNow;
        VerifiedBy = verifiedBy;
    }
}

/// <summary>
/// Types of qualification documents required by DOT
/// </summary>
public enum QualificationDocumentType
{
    CDL = 0,
    MedicalCard = 1,
    DrugTest = 2,
    AlcoholTest = 3,
    BackgroundCheck = 4,
    MVR = 5, // Motor Vehicle Record
    ApplicationForEmployment = 6,
    InquiryToPreviousEmployers = 7,
    RoadTest = 8,
    AnnualReview = 9,
    HazMatEndorsement = 10,
    TankEndorsement = 11,
    DoubleTripleEndorsement = 12,
    PassengerEndorsement = 13,
    Other = 99
}

/// <summary>
/// Driver safety score tracking
/// </summary>
public class DriverSafetyScore : BaseEntity
{
    public Guid DriverId { get; set; }
    public Driver? Driver { get; set; }
    
    public DateTime CalculatedDate { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    
    /// <summary>
    /// Overall safety score (0-100, higher is better)
    /// </summary>
    public decimal OverallScore { get; set; }
    
    // Component scores
    public decimal AccidentScore { get; set; }
    public decimal ViolationScore { get; set; }
    public decimal HOSComplianceScore { get; set; }
    public decimal InspectionScore { get; set; }
    public decimal DrivingBehaviorScore { get; set; }
    
    // Incident counts for the period
    public int AccidentCount { get; set; }
    public int ViolationCount { get; set; }
    public int HOSViolationCount { get; set; }
    public int InspectionCount { get; set; }
    public int HardBrakingCount { get; set; }
    public int SpeedingCount { get; set; }
    public int IdleTimeMinutes { get; set; }
    
    // Miles driven in period
    public decimal MilesDriven { get; set; }
    
    /// <summary>
    /// Safety rating based on score
    /// </summary>
    public SafetyRating GetSafetyRating()
    {
        if (OverallScore >= 90) return SafetyRating.Excellent;
        if (OverallScore >= 80) return SafetyRating.Good;
        if (OverallScore >= 70) return SafetyRating.Fair;
        if (OverallScore >= 60) return SafetyRating.NeedsImprovement;
        return SafetyRating.Poor;
    }
    
    public string? Notes { get; set; }
}

/// <summary>
/// Safety rating categories
/// </summary>
public enum SafetyRating
{
    Poor = 0,
    NeedsImprovement = 1,
    Fair = 2,
    Good = 3,
    Excellent = 4
}

/// <summary>
/// FMCSA SMS (Safety Measurement System) data
/// </summary>
public class FMCSASMSData : BaseEntity
{
    public string DOTNumber { get; set; } = string.Empty;
    public DateTime DataDate { get; set; }
    
    // BASIC scores (0-100, lower is better)
    public decimal? UnsafeDrivingScore { get; set; }
    public decimal? CrashIndicatorScore { get; set; }
    public decimal? HOSComplianceScore { get; set; }
    public decimal? VehicleMaintenanceScore { get; set; }
    public decimal? ControlledSubstancesScore { get; set; }
    public decimal? HazMatComplianceScore { get; set; }
    public decimal? DriverFitnessScore { get; set; }
    
    // Inspection counts
    public int InspectionCount { get; set; }
    public int ViolationCount { get; set; }
    public int OutOfServiceCount { get; set; }
    
    // Percentiles
    public int? UnsafeDrivingPercentile { get; set; }
    public int? CrashIndicatorPercentile { get; set; }
    public int? HOSCompliancePercentile { get; set; }
    
    public DateTime? LastUpdated { get; set; }
    public string? DataSource { get; set; }
}
