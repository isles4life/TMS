using System;
using System.Collections.Generic;

namespace TMS.Domain.Entities.Drivers;

using TMS.Domain.Common;
using TMS.Domain.ValueObjects;
using TMS.Domain.Entities.Companies;
using TMS.Domain.Entities.Trips;

/// <summary>
/// Driver entity with CDL and compliance tracking
/// </summary>
public class Driver : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string CDLNumber { get; set; } = string.Empty;
    public DateTime CDLExpiryDate { get; set; }
    public Address Address { get; set; } = new();
    public DateTime HireDate { get; set; }
    public DriverStatus Status { get; set; } = DriverStatus.Active;
    public Guid CarrierId { get; set; }

    // Navigation
    public Carrier? Carrier { get; set; }
    public ICollection<Trip> Trips { get; set; } = [];
    public ICollection<ComplianceDocument> ComplianceDocuments { get; set; } = [];
}

public enum DriverStatus
{
    Active,
    Inactive,
    OnLeave,
    Terminated
}
