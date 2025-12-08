using System;
using System.Collections.Generic;

namespace TMS.Domain.Entities.Trips;

using TMS.Domain.Common;
using TMS.Domain.Entities.Loads;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Equipment;

/// <summary>
/// Trip entity tracking a single movement from pickup to delivery
/// </summary>
public class Trip : BaseEntity
{
    public string TripNumber { get; set; } = string.Empty;
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public Guid TractorId { get; set; }
    public TripStatus Status { get; set; } = TripStatus.Scheduled;
    public DateTime ScheduledStartDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal TotalMiles { get; set; }
    public decimal FuelGallonsUsed { get; set; }

    // Navigation
    public Load? Load { get; set; }
    public Driver? Driver { get; set; }
    public PowerOnlyTractor? Tractor { get; set; }
}

public enum TripStatus
{
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}
