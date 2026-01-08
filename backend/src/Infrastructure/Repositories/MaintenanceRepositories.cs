namespace TMS.Infrastructure.Repositories;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities.Maintenance;
using TMS.Domain.Repositories;
using TMS.Infrastructure.Persistence;

/// <summary>
/// Repository implementation for maintenance schedules
/// </summary>
public class MaintenanceScheduleRepository : IMaintenanceScheduleRepository
{
    private readonly TMSDbContext _context;

    public MaintenanceScheduleRepository(TMSDbContext context)
    {
        _context = context;
    }

    public async Task<MaintenanceSchedule?> GetByIdAsync(Guid id)
    {
        return await _context.MaintenanceSchedules
            .Include(s => s.Tractor)
            .Include(s => s.Trailer)
            .Include(s => s.Tasks)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<MaintenanceSchedule>> GetByTractorIdAsync(Guid tractorId)
    {
        return await _context.MaintenanceSchedules
            .Include(s => s.Tasks)
            .Where(s => s.TractorId == tractorId)
            .ToListAsync();
    }

    public async Task<List<MaintenanceSchedule>> GetByTrailerIdAsync(Guid trailerId)
    {
        return await _context.MaintenanceSchedules
            .Include(s => s.Tasks)
            .Where(s => s.TrailerId == trailerId)
            .ToListAsync();
    }

    public async Task<List<MaintenanceSchedule>> GetActiveSchedulesAsync()
    {
        return await _context.MaintenanceSchedules
            .Include(s => s.Tractor)
            .Include(s => s.Trailer)
            .Include(s => s.Tasks)
            .Where(s => s.IsActive)
            .ToListAsync();
    }

    public async Task<List<MaintenanceSchedule>> GetOverdueSchedulesAsync()
    {
        var schedules = await GetActiveSchedulesAsync();
        return schedules.Where(s => s.IsOverdue).ToList();
    }

    public async Task<List<MaintenanceSchedule>> GetSchedulesDueSoonAsync(int daysAhead = 7)
    {
        var schedules = await GetActiveSchedulesAsync();
        return schedules.Where(s => s.ShouldNotify).ToList();
    }

    public async Task<MaintenanceSchedule> AddAsync(MaintenanceSchedule schedule)
    {
        _context.MaintenanceSchedules.Add(schedule);
        await _context.SaveChangesAsync();
        return schedule;
    }

    public async Task<MaintenanceSchedule> UpdateAsync(MaintenanceSchedule schedule)
    {
        _context.MaintenanceSchedules.Update(schedule);
        await _context.SaveChangesAsync();
        return schedule;
    }

    public async Task DeleteAsync(Guid id)
    {
        var schedule = await _context.MaintenanceSchedules.FindAsync(id);
        if (schedule != null)
        {
            _context.MaintenanceSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
        }
    }
}

/// <summary>
/// Repository implementation for maintenance records
/// </summary>
public class MaintenanceRecordRepository : IMaintenanceRecordRepository
{
    private readonly TMSDbContext _context;

    public MaintenanceRecordRepository(TMSDbContext context)
    {
        _context = context;
    }

    public async Task<MaintenanceRecord?> GetByIdAsync(Guid id)
    {
        return await _context.MaintenanceRecordsNew
            .Include(r => r.Tractor)
            .Include(r => r.Trailer)
            .Include(r => r.Vendor)
            .Include(r => r.MaintenanceSchedule)
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<MaintenanceRecord?> GetByWorkOrderNumberAsync(string workOrderNumber)
    {
        return await _context.MaintenanceRecordsNew
            .Include(r => r.Tractor)
            .Include(r => r.Trailer)
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.WorkOrderNumber == workOrderNumber);
    }

    public async Task<List<MaintenanceRecord>> GetByTractorIdAsync(Guid tractorId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MaintenanceRecordsNew
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .Where(r => r.TractorId == tractorId);

        if (startDate.HasValue)
            query = query.Where(r => r.ServiceDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(r => r.ServiceDate <= endDate.Value);

        return await query.OrderByDescending(r => r.ServiceDate).ToListAsync();
    }

    public async Task<List<MaintenanceRecord>> GetByTrailerIdAsync(Guid trailerId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MaintenanceRecordsNew
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .Where(r => r.TrailerId == trailerId);

        if (startDate.HasValue)
            query = query.Where(r => r.ServiceDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(r => r.ServiceDate <= endDate.Value);

        return await query.OrderByDescending(r => r.ServiceDate).ToListAsync();
    }

    public async Task<List<MaintenanceRecord>> GetByVendorIdAsync(Guid vendorId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MaintenanceRecordsNew
            .Include(r => r.Tractor)
            .Include(r => r.Trailer)
            .Include(r => r.Items)
            .Where(r => r.VendorId == vendorId);

        if (startDate.HasValue)
            query = query.Where(r => r.ServiceDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(r => r.ServiceDate <= endDate.Value);

        return await query.OrderByDescending(r => r.ServiceDate).ToListAsync();
    }

    public async Task<List<MaintenanceRecord>> GetByStatusAsync(MaintenanceRecordStatus status)
    {
        return await _context.MaintenanceRecordsNew
            .Include(r => r.Tractor)
            .Include(r => r.Trailer)
            .Include(r => r.Vendor)
            .Where(r => r.Status == status)
            .OrderBy(r => r.ServiceDate)
            .ToListAsync();
    }

    public async Task<List<MaintenanceRecord>> GetScheduledRecordsAsync()
    {
        return await GetByStatusAsync(MaintenanceRecordStatus.Scheduled);
    }

    public async Task<List<MaintenanceRecord>> GetAllAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MaintenanceRecordsNew
            .Include(r => r.Tractor)
            .Include(r => r.Trailer)
            .Include(r => r.Vendor)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(r => r.ServiceDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(r => r.ServiceDate <= endDate.Value);

        return await query.OrderByDescending(r => r.ServiceDate).ToListAsync();
    }

    public async Task<MaintenanceRecord> AddAsync(MaintenanceRecord record)
    {
        _context.MaintenanceRecordsNew.Add(record);
        await _context.SaveChangesAsync();
        return record;
    }

    public async Task<MaintenanceRecord> UpdateAsync(MaintenanceRecord record)
    {
        _context.MaintenanceRecordsNew.Update(record);
        await _context.SaveChangesAsync();
        return record;
    }

    public async Task DeleteAsync(Guid id)
    {
        var record = await _context.MaintenanceRecordsNew.FindAsync(id);
        if (record != null)
        {
            _context.MaintenanceRecordsNew.Remove(record);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<decimal> GetTotalCostByTractorAsync(Guid tractorId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MaintenanceRecordsNew
            .Where(r => r.TractorId == tractorId && r.Status == MaintenanceRecordStatus.Completed);

        if (startDate.HasValue)
            query = query.Where(r => r.ServiceDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(r => r.ServiceDate <= endDate.Value);

        return await query.SumAsync(r => r.TotalCost);
    }

    public async Task<decimal> GetTotalCostByVendorAsync(Guid vendorId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MaintenanceRecordsNew
            .Where(r => r.VendorId == vendorId && r.Status == MaintenanceRecordStatus.Completed);

        if (startDate.HasValue)
            query = query.Where(r => r.ServiceDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(r => r.ServiceDate <= endDate.Value);

        return await query.SumAsync(r => r.TotalCost);
    }

    public async Task<List<MaintenanceRecord>> GetMostExpensiveRecordsAsync(int count = 10)
    {
        return await _context.MaintenanceRecordsNew
            .Include(r => r.Tractor)
            .Include(r => r.Trailer)
            .Include(r => r.Vendor)
            .Where(r => r.Status == MaintenanceRecordStatus.Completed)
            .OrderByDescending(r => r.TotalCost)
            .Take(count)
            .ToListAsync();
    }
}

/// <summary>
/// Repository implementation for vendors
/// </summary>
public class VendorRepository : IVendorRepository
{
    private readonly TMSDbContext _context;

    public VendorRepository(TMSDbContext context)
    {
        _context = context;
    }

    public async Task<Vendor?> GetByIdAsync(Guid id)
    {
        return await _context.Vendors.FindAsync(id);
    }

    public async Task<Vendor?> GetByVendorCodeAsync(string vendorCode)
    {
        return await _context.Vendors
            .FirstOrDefaultAsync(v => v.VendorCode == vendorCode);
    }

    public async Task<List<Vendor>> GetAllAsync()
    {
        return await _context.Vendors.ToListAsync();
    }

    public async Task<List<Vendor>> GetActiveVendorsAsync()
    {
        return await _context.Vendors
            .Where(v => v.Status == VendorStatus.Active)
            .ToListAsync();
    }

    public async Task<List<Vendor>> GetByTypeAsync(VendorType vendorType)
    {
        return await _context.Vendors
            .Where(v => v.VendorType == vendorType && v.Status == VendorStatus.Active)
            .ToListAsync();
    }

    public async Task<List<Vendor>> GetPreferredVendorsAsync()
    {
        return await _context.Vendors
            .Where(v => v.IsPreferred && v.Status == VendorStatus.Active)
            .OrderBy(v => v.VendorName)
            .ToListAsync();
    }

    public async Task<Vendor> AddAsync(Vendor vendor)
    {
        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();
        return vendor;
    }

    public async Task<Vendor> UpdateAsync(Vendor vendor)
    {
        _context.Vendors.Update(vendor);
        await _context.SaveChangesAsync();
        return vendor;
    }

    public async Task DeleteAsync(Guid id)
    {
        var vendor = await _context.Vendors.FindAsync(id);
        if (vendor != null)
        {
            _context.Vendors.Remove(vendor);
            await _context.SaveChangesAsync();
        }
    }
}
