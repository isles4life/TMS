namespace TMS.Domain.Entities;

using System;
using System.Collections.Generic;
using TMS.Domain.Common;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Equipment;
using TMS.Domain.Entities.Loads;

/// <summary>
/// Generic document entity for audit trails and compliance
/// </summary>
public class Document : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public byte[] Content { get; set; } = [];
    public string DocumentType { get; set; } = string.Empty;
    public Guid? LoadId { get; set; }
    public Guid? DriverId { get; set; }

    public Load? Load { get; set; }
    public Driver? Driver { get; set; }
}

/// <summary>
/// Trailer entity (attached to Power Only loads)
/// </summary>
public class Trailer : BaseEntity
{
    public string TrailerNumber { get; set; } = string.Empty;
    public string VIN { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Make { get; set; } = string.Empty;
    public int AxleCount { get; set; }
    public decimal Capacity { get; set; } // in pounds
    public DateTime InServiceDate { get; set; }
    public TrailerStatus Status { get; set; } = TrailerStatus.Available;

    public ICollection<Load> Loads { get; set; } = [];
}

public enum TrailerStatus
{
    Available,
    InUse,
    Maintenance,
    Retired
}

/// <summary>
/// Maintenance records for equipment
/// </summary>
public class MaintenanceRecord : BaseEntity
{
    public Guid EquipmentId { get; set; }
    public string MaintenanceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ServiceDate { get; set; }
    public decimal Cost { get; set; }
    public string ServiceProvider { get; set; } = string.Empty;

    public PowerOnlyTractor? Equipment { get; set; }
}

/// <summary>
/// Compliance documents (CDL, Insurance, etc.)
/// </summary>
public class ComplianceDocument : BaseEntity
{
    public Guid DriverId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsExpiringSoon => (ExpiryDate - DateTime.UtcNow).TotalDays <= 30;

    public Driver? Driver { get; set; }
}
