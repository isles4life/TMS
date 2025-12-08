using System;
using System.Collections.Generic;

namespace TMS.Domain.Entities.Companies;

using TMS.Domain.Common;
using TMS.Domain.ValueObjects;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Loads;

/// <summary>
/// Carrier (trucking company) entity
/// </summary>
public class Carrier : BaseEntity
{
    public string CompanyName { get; set; } = string.Empty;
    public string MC_Number { get; set; } = string.Empty; // Motor Carrier Number
    public string DOT_Number { get; set; } = string.Empty; // Department of Transportation Number
    public string EIN { get; set; } = string.Empty; // Employer Identification Number
    public Address Address { get; set; } = new();
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public InsuranceInfo InsuranceInfo { get; set; } = new();

    // Navigation
    public ICollection<Driver> Drivers { get; set; } = [];
    public ICollection<Equipment.PowerOnlyTractor> Equipment { get; set; } = [];
    public ICollection<Load> Loads { get; set; } = [];
}

public class InsuranceInfo
{
    public string Provider { get; set; } = string.Empty;
    public string PolicyNumber { get; set; } = string.Empty;
    public decimal CoverageAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
}
