using System;
using System.Collections.Generic;

namespace TMS.Application.DTOs.Equipment;

/// <summary>
/// DTO for Power Only tractor response
/// </summary>
public class PowerOnlyTractorResponse
{
    public Guid Id { get; set; }
    public string UnitNumber { get; set; } = string.Empty;
    public string VIN { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal CurrentMileage { get; set; }
}

/// <summary>
/// DTO for creating a Power Only tractor
/// </summary>
public class CreatePowerOnlyTractorRequest
{
    public string UnitNumber { get; set; } = string.Empty;
    public string VIN { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
}
