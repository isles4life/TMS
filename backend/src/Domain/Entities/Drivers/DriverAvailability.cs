namespace TMS.Domain.Entities.Drivers;

using System;
using TMS.Domain.Common;
using TMS.Domain.ValueObjects;

/// <summary>
/// Tracks driver availability, current location, and status for dispatch matching
/// </summary>
public class DriverAvailability : BaseEntity
{
    public Guid DriverId { get; set; }
    
    // Availability status
    public AvailabilityStatus Status { get; set; } = AvailabilityStatus.Available;
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    
    // Current location for proximity matching
    public Address? CurrentLocation { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public DateTime? LastLocationUpdate { get; set; }
    
    // Hours of service tracking
    public decimal HoursWorkedToday { get; set; }
    public decimal HoursWorkedThisWeek { get; set; }
    public decimal HoursAvailableToday => Math.Max(0, 11 - HoursWorkedToday);  // 11-hour driving limit
    public decimal HoursAvailableThisWeek => Math.Max(0, 60 - HoursWorkedThisWeek);  // 60-hour/7-day limit
    
    // Equipment assignment
    public Guid? AssignedTractorId { get; set; }
    public Guid? AssignedTrailerId { get; set; }
    
    // Performance metrics for scoring
    public decimal OnTimeDeliveryRate { get; set; } = 100;  // Percentage
    public decimal AcceptanceRate { get; set; } = 100;       // Percentage
    public int CompletedLoadsCount { get; set; }
    
    // Navigation
    public Driver? Driver { get; set; }
}

public enum AvailabilityStatus
{
    Available,         // Ready for dispatch
    OnDuty,           // Currently on a load
    OffDuty,          // Not available
    OnBreak,          // Mandatory rest break
    Maintenance,      // Vehicle maintenance
    OutOfService      // HOS violation or other compliance issue
}
