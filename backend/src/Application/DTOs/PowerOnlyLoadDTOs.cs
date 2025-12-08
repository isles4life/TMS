using System;
using System.Collections.Generic;

namespace TMS.Application.DTOs.PowerOnly;

/// <summary>
/// DTO for creating a Power Only load
/// </summary>
public class CreatePowerOnlyLoadRequest
{
    public Guid CustomerId { get; set; }
    public string PickupStreet { get; set; } = string.Empty;
    public string PickupCity { get; set; } = string.Empty;
    public string PickupState { get; set; } = string.Empty;
    public string PickupPostalCode { get; set; } = string.Empty;
    public DateTime PickupDateTime { get; set; }
    
    public string DeliveryStreet { get; set; } = string.Empty;
    public string DeliveryCity { get; set; } = string.Empty;
    public string DeliveryState { get; set; } = string.Empty;
    public string DeliveryPostalCode { get; set; } = string.Empty;
    public DateTime DeliveryDateTime { get; set; }
    
    public decimal BaseRate { get; set; }
    public decimal FuelSurcharge { get; set; }
    public decimal AccessorialCharges { get; set; }
}

/// <summary>
/// DTO for Power Only load response
/// </summary>
public class PowerOnlyLoadResponse
{
    public Guid Id { get; set; }
    public string LoadNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public string? DriverName { get; set; }
    public string? TractorNumber { get; set; }
    public DateTime PickupDateTime { get; set; }
    public DateTime DeliveryDateTime { get; set; }
    public string PickupAddress { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
}

/// <summary>
/// DTO for assigning a driver and tractor to a load
/// </summary>
public class AssignPowerOnlyLoadRequest
{
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public Guid TractorId { get; set; }
    public Guid? TrailerId { get; set; }
}
