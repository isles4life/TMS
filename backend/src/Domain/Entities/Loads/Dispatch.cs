namespace TMS.Domain.Entities.Loads;

using System;
using TMS.Domain.Common;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Equipment;

/// <summary>
/// Dispatch assignment linking loads to drivers and equipment
/// </summary>
public class Dispatch : BaseEntity
{
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public Guid? TractorId { get; set; }
    public Guid? TrailerId { get; set; }
    
    public DispatchStatus Status { get; set; } = DispatchStatus.Pending;
    public DispatchMethod Method { get; set; } = DispatchMethod.Manual;
    
    // Assignment details
    public DateTime AssignedAt { get; set; }
    public Guid AssignedByUserId { get; set; }
    public string? Notes { get; set; }
    
    // Acceptance tracking
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    
    // Auto-dispatch scoring
    public decimal? ProximityScore { get; set; }
    public decimal? AvailabilityScore { get; set; }
    public decimal? PerformanceScore { get; set; }
    public decimal? TotalScore { get; set; }
    
    // Navigation properties
    public Load? Load { get; set; }
    public Driver? Driver { get; set; }
    public PowerOnlyTractor? Tractor { get; set; }
    public Trailer? Trailer { get; set; }
}

public enum DispatchStatus
{
    Pending,           // Awaiting driver acceptance
    Accepted,          // Driver accepted
    Rejected,          // Driver rejected
    InProgress,        // Load in progress
    Completed,         // Load delivered
    Cancelled          // Dispatch cancelled
}

public enum DispatchMethod
{
    Manual,            // Manually assigned by dispatcher
    AutoMatched,       // Auto-assigned by matching algorithm
    DriverRequested    // Driver requested the load
}
