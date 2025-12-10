namespace TMS.Application.DTOs;

using System;
using System.Collections.Generic;

public class DispatchRequest
{
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public Guid? TractorId { get; set; }
    public Guid? TrailerId { get; set; }
    public string? Notes { get; set; }
    public string Method { get; set; } = "Manual";
    public Guid AssignedByUserId { get; set; }
    public decimal? ProximityScore { get; set; }
    public decimal? AvailabilityScore { get; set; }
    public decimal? PerformanceScore { get; set; }
    public decimal? TotalScore { get; set; }
}

public class DispatchResponse
{
    public Guid Id { get; set; }
    public Guid LoadId { get; set; }
    public string LoadNumber { get; set; } = string.Empty;
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public Guid? TractorId { get; set; }
    public string? TractorNumber { get; set; }
    public Guid? TrailerId { get; set; }
    public string? TrailerNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public string? Notes { get; set; }
    public decimal? TotalScore { get; set; }
}

public class AutoDispatchRequest
{
    public Guid LoadId { get; set; }
    public int MaxMatches { get; set; } = 5;
    public decimal MinProximityMiles { get; set; } = 100;
    public bool RequireEquipmentMatch { get; set; } = true;
}

public class DriverMatchResponse
{
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public Guid? TractorId { get; set; }
    public string? TractorNumber { get; set; }
    public Guid? TrailerId { get; set; }
    public string? TrailerNumber { get; set; }
    
    // Scoring details
    public decimal TotalScore { get; set; }
    public decimal ProximityScore { get; set; }
    public decimal AvailabilityScore { get; set; }
    public decimal PerformanceScore { get; set; }
    
    // Match details
    public decimal DistanceFromPickupMiles { get; set; }
    public string AvailabilityStatus { get; set; } = string.Empty;
    public decimal HoursAvailable { get; set; }
    public decimal OnTimeRate { get; set; }
    public decimal AcceptanceRate { get; set; }
    
    // Current location
    public string? CurrentLocation { get; set; }
    public bool IsRecommended { get; set; }
}

public class DriverAvailabilityRequest
{
    public Guid DriverId { get; set; }
    public string Status { get; set; } = "Available";
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? CurrentCity { get; set; }
    public string? CurrentState { get; set; }
}

public class DriverAvailabilityResponse
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? AvailableFrom { get; set; }
    public string? CurrentLocation { get; set; }
    public decimal HoursAvailableToday { get; set; }
    public decimal HoursAvailableThisWeek { get; set; }
    public decimal OnTimeDeliveryRate { get; set; }
    public DateTime? LastLocationUpdate { get; set; }
}
