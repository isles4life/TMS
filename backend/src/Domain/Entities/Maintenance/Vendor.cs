namespace TMS.Domain.Entities.Maintenance;

using System;
using TMS.Domain.Common;

/// <summary>
/// Vendor/service provider for maintenance and repairs
/// </summary>
public class Vendor : BaseEntity
{
    public string VendorName { get; set; } = string.Empty;
    public string? VendorCode { get; set; }
    
    public VendorType VendorType { get; set; }
    public VendorStatus Status { get; set; } = VendorStatus.Active;
    
    // Contact Information
    public string? ContactName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    
    // Address
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; } = "USA";
    
    // Business Details
    public string? TaxId { get; set; }
    public string? LicenseNumber { get; set; }
    public DateTime? LicenseExpirationDate { get; set; }
    
    // Service Capabilities
    public string? ServiceCapabilities { get; set; } // Comma-separated list
    public string? SpecialtyAreas { get; set; }
    
    // Rating and Performance
    public decimal? Rating { get; set; } // 0-5 stars
    public int TotalJobsCompleted { get; set; }
    public decimal? AverageCompletionTime { get; set; } // In days
    
    // Payment Terms
    public int PaymentTermsDays { get; set; } = 30; // Net 30
    public string? PaymentMethod { get; set; }
    public string? AccountNumber { get; set; }
    
    // Insurance
    public bool HasInsurance { get; set; }
    public DateTime? InsuranceExpirationDate { get; set; }
    public decimal? InsuranceCoverageAmount { get; set; }
    
    // Notes
    public string? Notes { get; set; }
    
    // Timestamps
    public DateTime? LastServiceDate { get; set; }
    public bool IsPreferred { get; set; }
    
    /// <summary>
    /// Check if vendor is active and not expired
    /// </summary>
    public bool IsAvailable => Status == VendorStatus.Active && 
                               (!LicenseExpirationDate.HasValue || LicenseExpirationDate.Value > DateTime.UtcNow) &&
                               (!InsuranceExpirationDate.HasValue || InsuranceExpirationDate.Value > DateTime.UtcNow);
    
    /// <summary>
    /// Update vendor rating
    /// </summary>
    public void UpdateRating(decimal newRating, int additionalJobs = 1)
    {
        if (Rating.HasValue)
        {
            // Calculate weighted average
            var totalRating = (Rating.Value * TotalJobsCompleted) + newRating;
            TotalJobsCompleted += additionalJobs;
            Rating = totalRating / TotalJobsCompleted;
        }
        else
        {
            Rating = newRating;
            TotalJobsCompleted += additionalJobs;
        }
    }
    
    /// <summary>
    /// Deactivate vendor
    /// </summary>
    public void Deactivate(string reason)
    {
        Status = VendorStatus.Inactive;
        Notes = $"{Notes}\nDeactivated: {reason} on {DateTime.UtcNow:yyyy-MM-dd}";
    }
    
    /// <summary>
    /// Reactivate vendor
    /// </summary>
    public void Reactivate()
    {
        Status = VendorStatus.Active;
        Notes = $"{Notes}\nReactivated on {DateTime.UtcNow:yyyy-MM-dd}";
    }
}

/// <summary>
/// Vendor types
/// </summary>
public enum VendorType
{
    MaintenanceShop = 0,
    DealershipService = 1,
    TireShop = 2,
    BodyShop = 3,
    GlassShop = 4,
    DetailingService = 5,
    TowingService = 6,
    PartSupplier = 7,
    MobileService = 8,
    FleetManagementService = 9,
    Other = 99
}

/// <summary>
/// Vendor status
/// </summary>
public enum VendorStatus
{
    Active = 0,
    Inactive = 1,
    Suspended = 2,
    PendingApproval = 3
}
