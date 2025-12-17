namespace TMS.Domain.Entities.Loads;

using System;
using TMS.Domain.Common;
using TMS.Domain.Entities.Drivers;

/// <summary>
/// Represents a driver check-in call for a load
/// Tracks communication, location updates, and shipment status from driver
/// </summary>
public class CheckCall : BaseEntity
{
    /// <summary>
    /// The load this check call is for
    /// </summary>
    public Guid LoadId { get; set; }

    /// <summary>
    /// The driver who made the check call
    /// </summary>
    public Guid DriverId { get; set; }

    /// <summary>
    /// When the check call was made
    /// </summary>
    public DateTime CheckInTime { get; set; }

    /// <summary>
    /// How the driver contacted (Phone, Email, App, Text)
    /// </summary>
    public string ContactMethod { get; set; } = "Phone";

    /// <summary>
    /// Driver's current location description
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// GPS Latitude of check-in location
    /// </summary>
    public decimal? Latitude { get; set; }

    /// <summary>
    /// GPS Longitude of check-in location
    /// </summary>
    public decimal? Longitude { get; set; }

    /// <summary>
    /// Whether the truck is empty
    /// </summary>
    public bool IsTruckEmpty { get; set; }

    /// <summary>
    /// Current trailer temperature in Fahrenheit
    /// </summary>
    public int? TrailerTemperature { get; set; }

    /// <summary>
    /// Estimated time of arrival at destination
    /// </summary>
    public string? ETA { get; set; }

    /// <summary>
    /// Additional notes from the driver
    /// </summary>
    public string? Notes { get; set; }

    // Navigation Properties
    public Load? Load { get; set; }
    public Driver? Driver { get; set; }
}
