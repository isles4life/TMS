namespace TMS.Application.Services.Maintenance;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMS.Domain.Entities.Maintenance;
using TMS.Domain.Repositories;

/// <summary>
/// Service for vendor management
/// </summary>
public class VendorService
{
    private readonly IVendorRepository _vendorRepository;

    public VendorService(IVendorRepository vendorRepository)
    {
        _vendorRepository = vendorRepository;
    }

    /// <summary>
    /// Create a new vendor
    /// </summary>
    public async Task<Vendor> CreateVendorAsync(
        string vendorName,
        VendorType vendorType,
        string? contactName = null,
        string? email = null,
        string? phone = null,
        string? addressLine1 = null,
        string? city = null,
        string? state = null,
        string? zipCode = null)
    {
        var vendor = new Vendor
        {
            VendorName = vendorName,
            VendorType = vendorType,
            ContactName = contactName,
            Email = email,
            Phone = phone,
            AddressLine1 = addressLine1,
            City = city,
            State = state,
            ZipCode = zipCode,
            Status = VendorStatus.Active
        };

        return await _vendorRepository.AddAsync(vendor);
    }

    /// <summary>
    /// Get vendor by ID
    /// </summary>
    public async Task<Vendor?> GetVendorByIdAsync(Guid vendorId)
    {
        return await _vendorRepository.GetByIdAsync(vendorId);
    }

    /// <summary>
    /// Get vendor by code
    /// </summary>
    public async Task<Vendor?> GetVendorByCodeAsync(string vendorCode)
    {
        return await _vendorRepository.GetByVendorCodeAsync(vendorCode);
    }

    /// <summary>
    /// Get all vendors
    /// </summary>
    public async Task<List<Vendor>> GetAllVendorsAsync()
    {
        return await _vendorRepository.GetAllAsync();
    }

    /// <summary>
    /// Get active vendors only
    /// </summary>
    public async Task<List<Vendor>> GetActiveVendorsAsync()
    {
        return await _vendorRepository.GetActiveVendorsAsync();
    }

    /// <summary>
    /// Get vendors by type
    /// </summary>
    public async Task<List<Vendor>> GetVendorsByTypeAsync(VendorType vendorType)
    {
        return await _vendorRepository.GetByTypeAsync(vendorType);
    }

    /// <summary>
    /// Get preferred vendors
    /// </summary>
    public async Task<List<Vendor>> GetPreferredVendorsAsync()
    {
        return await _vendorRepository.GetPreferredVendorsAsync();
    }

    /// <summary>
    /// Update vendor
    /// </summary>
    public async Task<Vendor> UpdateVendorAsync(Vendor vendor)
    {
        return await _vendorRepository.UpdateAsync(vendor);
    }

    /// <summary>
    /// Update vendor rating
    /// </summary>
    public async Task<Vendor> UpdateVendorRatingAsync(Guid vendorId, decimal rating)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId);
        if (vendor == null)
            throw new InvalidOperationException($"Vendor {vendorId} not found");

        vendor.UpdateRating(rating);
        return await _vendorRepository.UpdateAsync(vendor);
    }

    /// <summary>
    /// Mark vendor as preferred
    /// </summary>
    public async Task<Vendor> SetPreferredVendorAsync(Guid vendorId, bool isPreferred = true)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId);
        if (vendor == null)
            throw new InvalidOperationException($"Vendor {vendorId} not found");

        vendor.IsPreferred = isPreferred;
        return await _vendorRepository.UpdateAsync(vendor);
    }

    /// <summary>
    /// Deactivate vendor
    /// </summary>
    public async Task<Vendor> DeactivateVendorAsync(Guid vendorId, string reason)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId);
        if (vendor == null)
            throw new InvalidOperationException($"Vendor {vendorId} not found");

        vendor.Deactivate(reason);
        return await _vendorRepository.UpdateAsync(vendor);
    }

    /// <summary>
    /// Reactivate vendor
    /// </summary>
    public async Task<Vendor> ReactivateVendorAsync(Guid vendorId)
    {
        var vendor = await _vendorRepository.GetByIdAsync(vendorId);
        if (vendor == null)
            throw new InvalidOperationException($"Vendor {vendorId} not found");

        vendor.Reactivate();
        return await _vendorRepository.UpdateAsync(vendor);
    }

    /// <summary>
    /// Delete vendor
    /// </summary>
    public async Task DeleteVendorAsync(Guid vendorId)
    {
        await _vendorRepository.DeleteAsync(vendorId);
    }
}
