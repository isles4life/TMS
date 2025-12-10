namespace TMS.Domain.Entities.Tracking;

using System;
using TMS.Domain.Common;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Loads;

/// <summary>
/// Represents a driver's GPS location update for real-time tracking
/// </summary>
public class DriverLocation : BaseEntity
{
    public Guid DriverId { get; set; }
    public Guid? DispatchId { get; set; }
    
    // Location data
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal Accuracy { get; set; } // Meters
    
    // Movement data
    public decimal SpeedMph { get; set; }
    public decimal Heading { get; set; } // Compass bearing 0-360
    
    // Context
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    
    // Metadata
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public string? Source { get; set; } // GPS, Mobile app, Telematics device, etc.
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public Driver? Driver { get; set; }
    public Dispatch? Dispatch { get; set; }
}

/// <summary>
/// Geofence alert for zone entry/exit
/// </summary>
public class GeofenceAlert : BaseEntity
{
    public Guid DriverLocationId { get; set; }
    public Guid DispatchId { get; set; }
    public GeofenceAlertType AlertType { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    
    // Alert details
    public DateTime AlertedAt { get; set; } = DateTime.UtcNow;
    public bool IsAcknowledged { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    
    // Navigation
    public DriverLocation? DriverLocation { get; set; }
    public Dispatch? Dispatch { get; set; }
}

public enum GeofenceAlertType
{
    PickupZoneEntered,
    PickupZoneExited,
    DeliveryZoneEntered,
    DeliveryZoneExited,
    GeofenceEntered,
    GeofenceExited
}
