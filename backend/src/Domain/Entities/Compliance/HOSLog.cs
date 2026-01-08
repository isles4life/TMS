namespace TMS.Domain.Entities.Compliance;

using System;
using System.Collections.Generic;
using TMS.Domain.Common;
using TMS.Domain.Entities.Drivers;

/// <summary>
/// Hours of Service (HOS) log entry for driver duty status
/// Complies with FMCSA regulations (49 CFR Part 395)
/// </summary>
public class HOSLog : BaseEntity
{
    public Guid DriverId { get; set; }
    public Driver? Driver { get; set; }
    
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public HOSStatus Status { get; set; }
    
    /// <summary>
    /// Duration in minutes
    /// </summary>
    public int DurationMinutes => EndTime.HasValue 
        ? (int)(EndTime.Value - StartTime).TotalMinutes 
        : 0;
    
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    
    public string? Notes { get; set; }
    public string? VehicleId { get; set; }
    public decimal? Odometer { get; set; }
    
    /// <summary>
    /// Source of the log entry (Manual, ELD, GPS)
    /// </summary>
    public HOSLogSource Source { get; set; } = HOSLogSource.Manual;
    
    /// <summary>
    /// Whether this entry has been edited after creation
    /// </summary>
    public bool IsEdited { get; set; }
    public DateTime? EditedAt { get; set; }
    public string? EditReason { get; set; }
    
    /// <summary>
    /// Certify that the driver logged this entry
    /// </summary>
    public bool IsCertified { get; set; }
    public DateTime? CertifiedAt { get; set; }
    
    /// <summary>
    /// Navigation to any violations detected for this log entry
    /// </summary>
    public ICollection<HOSViolation> Violations { get; set; } = [];
    
    /// <summary>
    /// Check if this log entry is currently active (no end time)
    /// </summary>
    public bool IsActive() => !EndTime.HasValue;
    
    /// <summary>
    /// Complete the current log entry
    /// </summary>
    public void Complete(DateTime endTime)
    {
        if (EndTime.HasValue)
            throw new InvalidOperationException("This log entry has already been completed.");
        
        if (endTime <= StartTime)
            throw new ArgumentException("End time must be after start time.", nameof(endTime));
        
        EndTime = endTime;
    }
    
    /// <summary>
    /// Mark this entry as edited
    /// </summary>
    public void MarkAsEdited(string reason)
    {
        IsEdited = true;
        EditedAt = DateTime.UtcNow;
        EditReason = reason;
    }
    
    /// <summary>
    /// Certify this log entry
    /// </summary>
    public void Certify()
    {
        IsCertified = true;
        CertifiedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// HOS duty status types per FMCSA regulations
/// </summary>
public enum HOSStatus
{
    /// <summary>
    /// Off-Duty (not working)
    /// </summary>
    OffDuty = 0,
    
    /// <summary>
    /// Sleeper Berth (resting in vehicle)
    /// </summary>
    SleeperBerth = 1,
    
    /// <summary>
    /// Driving (operating the vehicle)
    /// </summary>
    Driving = 2,
    
    /// <summary>
    /// On-Duty Not Driving (working but not driving)
    /// </summary>
    OnDutyNotDriving = 3,
    
    /// <summary>
    /// Personal Conveyance (off-duty operation for personal reasons)
    /// </summary>
    PersonalConveyance = 4,
    
    /// <summary>
    /// Yard Move (moving vehicle on private property)
    /// </summary>
    YardMove = 5
}

/// <summary>
/// Source of HOS log entry
/// </summary>
public enum HOSLogSource
{
    Manual = 0,
    ELD = 1,
    GPS = 2,
    Automatic = 3
}

/// <summary>
/// HOS violation entity for tracking regulatory violations
/// </summary>
public class HOSViolation : BaseEntity
{
    public Guid DriverId { get; set; }
    public Driver? Driver { get; set; }
    
    public Guid? HOSLogId { get; set; }
    public HOSLog? HOSLog { get; set; }
    
    public DateTime ViolationDateTime { get; set; }
    public HOSViolationType ViolationType { get; set; }
    public HOSViolationSeverity Severity { get; set; }
    
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// Actual value that caused violation (e.g., 12 hours driven)
    /// </summary>
    public decimal ActualValue { get; set; }
    
    /// <summary>
    /// Maximum allowed value (e.g., 11 hours)
    /// </summary>
    public decimal LimitValue { get; set; }
    
    /// <summary>
    /// Amount over the limit
    /// </summary>
    public decimal OverageAmount => ActualValue - LimitValue;
    
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }
    
    /// <summary>
    /// Resolve the violation
    /// </summary>
    public void Resolve(string notes)
    {
        IsResolved = true;
        ResolvedAt = DateTime.UtcNow;
        ResolutionNotes = notes;
    }
}

/// <summary>
/// Types of HOS violations per FMCSA regulations
/// </summary>
public enum HOSViolationType
{
    /// <summary>
    /// Exceeded 11-hour driving limit
    /// </summary>
    DrivingLimit11Hour = 0,
    
    /// <summary>
    /// Exceeded 14-hour on-duty limit
    /// </summary>
    OnDutyLimit14Hour = 1,
    
    /// <summary>
    /// Exceeded 60-hour/7-day limit
    /// </summary>
    WeeklyLimit60Hour = 2,
    
    /// <summary>
    /// Exceeded 70-hour/8-day limit
    /// </summary>
    WeeklyLimit70Hour = 3,
    
    /// <summary>
    /// Did not take required 30-minute break
    /// </summary>
    RequiredBreak30Min = 4,
    
    /// <summary>
    /// Did not take required 10-hour rest period
    /// </summary>
    RequiredRest10Hour = 5,
    
    /// <summary>
    /// Driving after 8 hours without 30-minute break
    /// </summary>
    BreakAfter8Hours = 6,
    
    /// <summary>
    /// Missing or incomplete log entries
    /// </summary>
    MissingLog = 7,
    
    /// <summary>
    /// Form and manner violation (incorrect logging)
    /// </summary>
    FormAndManner = 8,
    
    /// <summary>
    /// Other HOS violation
    /// </summary>
    Other = 99
}

/// <summary>
/// Severity of HOS violation
/// </summary>
public enum HOSViolationSeverity
{
    /// <summary>
    /// Minor violation (warning)
    /// </summary>
    Minor = 0,
    
    /// <summary>
    /// Moderate violation (requires attention)
    /// </summary>
    Moderate = 1,
    
    /// <summary>
    /// Serious violation (immediate action required)
    /// </summary>
    Serious = 2,
    
    /// <summary>
    /// Critical violation (out of service)
    /// </summary>
    Critical = 3
}

/// <summary>
/// HOS summary for a driver showing current status and available hours
/// </summary>
public class HOSSummary
{
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public DateTime CalculatedAt { get; set; }
    public HOSStatus CurrentStatus { get; set; }
    public DateTime CurrentStatusSince { get; set; }
    
    /// <summary>
    /// Hours driven today
    /// </summary>
    public decimal HoursDrivenToday { get; set; }
    
    /// <summary>
    /// Hours available to drive (11 - driven)
    /// </summary>
    public decimal HoursAvailableDrive { get; set; }
    
    /// <summary>
    /// Hours on duty today
    /// </summary>
    public decimal HoursOnDutyToday { get; set; }
    
    /// <summary>
    /// Hours available on duty (14 - on duty)
    /// </summary>
    public decimal HoursAvailableOnDuty { get; set; }
    
    /// <summary>
    /// Hours in current cycle (7 or 8 days)
    /// </summary>
    public decimal HoursInCycle { get; set; }
    
    /// <summary>
    /// Hours available in cycle (60 or 70 - cycle)
    /// </summary>
    public decimal HoursAvailableCycle { get; set; }
    
    /// <summary>
    /// Time until 30-minute break required
    /// </summary>
    public TimeSpan? TimeUntilBreakRequired { get; set; }
    
    /// <summary>
    /// Time of last rest period
    /// </summary>
    public DateTime? LastRestPeriod { get; set; }
    
    /// <summary>
    /// Is driver currently in violation?
    /// </summary>
    public bool IsInViolation { get; set; }
    
    /// <summary>
    /// Active violations
    /// </summary>
    public List<string> ActiveViolations { get; set; } = [];
}
