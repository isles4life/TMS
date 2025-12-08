using System;
using System.Collections.Generic;

namespace TMS.Domain.Entities.Equipment;

using TMS.Domain.Common;
using TMS.Domain.Entities.Companies;
using TMS.Domain.Entities.Trips;

/// <summary>
/// Power Only (tractor) equipment entity
/// </summary>
public class PowerOnlyTractor : BaseEntity
{
    public string UnitNumber { get; set; } = string.Empty;
    public string VIN { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public DateTime InServiceDate { get; set; }
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Active;
    public Guid CarrierId { get; set; }
    public decimal FuelCapacity { get; set; } = 150m; // gallons
    public decimal CurrentMileage { get; set; }

    // Navigation
    public Carrier? Carrier { get; set; }
    public ICollection<Trip> Trips { get; set; } = [];
    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = [];
}

public enum EquipmentStatus
{
    Active,
    Maintenance,
    OutOfService,
    Retired
}
