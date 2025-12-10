namespace TMS.Application.DTOs;

using System;
using System.Collections.Generic;

/// <summary>
/// Request to update driver's current location
/// </summary>
public class DriverLocationUpdateRequest
{
    public Guid DriverId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal SpeedMph { get; set; } = 0;
    public decimal Heading { get; set; } = 0;
    public decimal Accuracy { get; set; } = 10; // Meters, default 10m
    public string? Source { get; set; } = "Mobile";
    public Guid? DispatchId { get; set; }
}

/// <summary>
/// Response with driver's current location
/// </summary>
public class DriverLocationResponse
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal SpeedMph { get; set; }
    public decimal Heading { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public DateTime RecordedAt { get; set; }
    public Guid? DispatchId { get; set; }
    public string? LoadNumber { get; set; }
}

/// <summary>
/// Real-time tracking dashboard data
/// </summary>
public class ActiveTrackerResponse
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal SpeedMph { get; set; }
    public string Status { get; set; } = string.Empty; // OnDuty, OffDuty, OnBreak
    public Guid? DispatchId { get; set; }
    public string? LoadNumber { get; set; }
    public string? PickupLocation { get; set; }
    public string? DeliveryLocation { get; set; }
    public int ETA_Minutes { get; set; }
    public DateTime LastUpdated { get; set; }
}

/// <summary>
/// Geofence alert response
/// </summary>
public class GeofenceAlertResponse
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public Guid DispatchId { get; set; }
    public string AlertType { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public DateTime AlertedAt { get; set; }
    public bool IsAcknowledged { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
}

/// <summary>
/// Batch location updates from telematics
/// </summary>
public class BatchLocationUpdateRequest
{
    public Guid DriverId { get; set; }
    public List<DriverLocationUpdateRequest> Locations { get; set; } = new();
}
