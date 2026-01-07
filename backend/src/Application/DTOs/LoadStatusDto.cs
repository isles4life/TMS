namespace TMS.Application.DTOs;

using System;
using System.Collections.Generic;

/// <summary>
/// DTO for load status history records
/// </summary>
public class LoadStatusHistoryDto
{
    public Guid Id { get; set; }
    public Guid LoadId { get; set; }
    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public Guid? ChangedByUserId { get; set; }
    public string? ChangedByUserName { get; set; }
    public string? Reason { get; set; }
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsAutomatic { get; set; }
}

/// <summary>
/// Request to change load status
/// </summary>
public class ChangeLoadStatusRequest
{
    public string NewStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsAutomatic { get; set; }
}

/// <summary>
/// Response containing valid next states for a load
/// </summary>
public class LoadStatusTransitionsDto
{
    public Guid LoadId { get; set; }
    public string CurrentStatus { get; set; } = string.Empty;
    public List<string> ValidNextStatuses { get; set; } = new();
}
