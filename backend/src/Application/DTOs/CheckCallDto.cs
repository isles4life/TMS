namespace TMS.Application.DTOs;

using System;

/// <summary>
/// DTO for CheckCall entity
/// </summary>
public class CheckCallDto
{
    public Guid Id { get; set; }
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public string? DriverName { get; set; }
    public DateTime CheckInTime { get; set; }
    public string ContactMethod { get; set; } = "Phone";
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsTruckEmpty { get; set; }
    public int? TrailerTemperature { get; set; }
    public string? ETA { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Create/Update CheckCall request
/// </summary>
public class CreateUpdateCheckCallRequest
{
    public string ContactMethod { get; set; } = "Phone";
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsTruckEmpty { get; set; }
    public int? TrailerTemperature { get; set; }
    public string? ETA { get; set; }
    public string? Notes { get; set; }
}
