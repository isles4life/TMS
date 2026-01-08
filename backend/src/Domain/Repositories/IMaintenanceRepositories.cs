namespace TMS.Domain.Repositories;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMS.Domain.Entities.Maintenance;

/// <summary>
/// Repository for maintenance schedules
/// </summary>
public interface IMaintenanceScheduleRepository
{
    Task<MaintenanceSchedule?> GetByIdAsync(Guid id);
    Task<List<MaintenanceSchedule>> GetByTractorIdAsync(Guid tractorId);
    Task<List<MaintenanceSchedule>> GetByTrailerIdAsync(Guid trailerId);
    Task<List<MaintenanceSchedule>> GetActiveSchedulesAsync();
    Task<List<MaintenanceSchedule>> GetOverdueSchedulesAsync();
    Task<List<MaintenanceSchedule>> GetSchedulesDueSoonAsync(int daysAhead = 7);
    Task<MaintenanceSchedule> AddAsync(MaintenanceSchedule schedule);
    Task<MaintenanceSchedule> UpdateAsync(MaintenanceSchedule schedule);
    Task DeleteAsync(Guid id);
}

/// <summary>
/// Repository for maintenance records
/// </summary>
public interface IMaintenanceRecordRepository
{
    Task<MaintenanceRecord?> GetByIdAsync(Guid id);
    Task<MaintenanceRecord?> GetByWorkOrderNumberAsync(string workOrderNumber);
    Task<List<MaintenanceRecord>> GetByTractorIdAsync(Guid tractorId, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<MaintenanceRecord>> GetByTrailerIdAsync(Guid trailerId, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<MaintenanceRecord>> GetByVendorIdAsync(Guid vendorId, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<MaintenanceRecord>> GetByStatusAsync(MaintenanceRecordStatus status);
    Task<List<MaintenanceRecord>> GetScheduledRecordsAsync();
    Task<List<MaintenanceRecord>> GetAllAsync(DateTime? startDate = null, DateTime? endDate = null);
    Task<MaintenanceRecord> AddAsync(MaintenanceRecord record);
    Task<MaintenanceRecord> UpdateAsync(MaintenanceRecord record);
    Task DeleteAsync(Guid id);
    
    // Analytics methods
    Task<decimal> GetTotalCostByTractorAsync(Guid tractorId, DateTime? startDate = null, DateTime? endDate = null);
    Task<decimal> GetTotalCostByVendorAsync(Guid vendorId, DateTime? startDate = null, DateTime? endDate = null);
    Task<List<MaintenanceRecord>> GetMostExpensiveRecordsAsync(int count = 10);
}

/// <summary>
/// Repository for vendors
/// </summary>
public interface IVendorRepository
{
    Task<Vendor?> GetByIdAsync(Guid id);
    Task<Vendor?> GetByVendorCodeAsync(string vendorCode);
    Task<List<Vendor>> GetAllAsync();
    Task<List<Vendor>> GetActiveVendorsAsync();
    Task<List<Vendor>> GetByTypeAsync(VendorType vendorType);
    Task<List<Vendor>> GetPreferredVendorsAsync();
    Task<Vendor> AddAsync(Vendor vendor);
    Task<Vendor> UpdateAsync(Vendor vendor);
    Task DeleteAsync(Guid id);
}
