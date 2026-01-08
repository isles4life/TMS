namespace TMS.Application.Services.Maintenance;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities.Maintenance;
using TMS.Domain.Repositories;

/// <summary>
/// Service for maintenance records and work orders
/// </summary>
public class MaintenanceRecordService
{
    private readonly IMaintenanceRecordRepository _recordRepository;
    private readonly IVendorRepository _vendorRepository;

    public MaintenanceRecordService(
        IMaintenanceRecordRepository recordRepository,
        IVendorRepository vendorRepository)
    {
        _recordRepository = recordRepository;
        _vendorRepository = vendorRepository;
    }

    /// <summary>
    /// Create a new maintenance record
    /// </summary>
    public async Task<MaintenanceRecord> CreateRecordAsync(
        Guid? tractorId,
        Guid? trailerId,
        Guid? scheduleId,
        Guid? vendorId,
        MaintenanceRecordType recordType,
        string description,
        DateTime serviceDate,
        decimal? mileageAtService = null,
        decimal? engineHoursAtService = null,
        string? workOrderNumber = null)
    {
        if (!tractorId.HasValue && !trailerId.HasValue)
            throw new ArgumentException("Either tractorId or trailerId must be provided");

        // Generate work order number if not provided
        if (string.IsNullOrEmpty(workOrderNumber))
        {
            workOrderNumber = $"WO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        }

        var record = new MaintenanceRecord
        {
            TractorId = tractorId,
            TrailerId = trailerId,
            MaintenanceScheduleId = scheduleId,
            VendorId = vendorId,
            RecordType = recordType,
            WorkOrderNumber = workOrderNumber,
            Description = description,
            ServiceDate = serviceDate,
            MileageAtService = mileageAtService,
            EngineHoursAtService = engineHoursAtService,
            Status = MaintenanceRecordStatus.Scheduled
        };

        return await _recordRepository.AddAsync(record);
    }

    /// <summary>
    /// Get maintenance record by ID
    /// </summary>
    public async Task<MaintenanceRecord?> GetRecordByIdAsync(Guid recordId)
    {
        return await _recordRepository.GetByIdAsync(recordId);
    }

    /// <summary>
    /// Get maintenance record by work order number
    /// </summary>
    public async Task<MaintenanceRecord?> GetRecordByWorkOrderAsync(string workOrderNumber)
    {
        return await _recordRepository.GetByWorkOrderNumberAsync(workOrderNumber);
    }

    /// <summary>
    /// Get all maintenance records for a tractor
    /// </summary>
    public async Task<List<MaintenanceRecord>> GetTractorRecordsAsync(
        Guid tractorId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        return await _recordRepository.GetByTractorIdAsync(tractorId, startDate, endDate);
    }

    /// <summary>
    /// Get all maintenance records for equipment
    /// </summary>
    public async Task<List<MaintenanceRecord>> GetTrailerRecordsAsync(
        Guid trailerId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        return await _recordRepository.GetByTrailerIdAsync(trailerId, startDate, endDate);
    }

    /// <summary>
    /// Get all maintenance records for a vendor
    /// </summary>
    public async Task<List<MaintenanceRecord>> GetVendorRecordsAsync(
        Guid vendorId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        return await _recordRepository.GetByVendorIdAsync(vendorId, startDate, endDate);
    }

    /// <summary>
    /// Get all scheduled maintenance records
    /// </summary>
    public async Task<List<MaintenanceRecord>> GetScheduledRecordsAsync()
    {
        return await _recordRepository.GetScheduledRecordsAsync();
    }

    /// <summary>
    /// Get records by status
    /// </summary>
    public async Task<List<MaintenanceRecord>> GetRecordsByStatusAsync(MaintenanceRecordStatus status)
    {
        return await _recordRepository.GetByStatusAsync(status);
    }

    /// <summary>
    /// Start work on a maintenance record
    /// </summary>
    public async Task<MaintenanceRecord> StartWorkAsync(Guid recordId, string? technicianName = null)
    {
        var record = await _recordRepository.GetByIdAsync(recordId);
        if (record == null)
            throw new InvalidOperationException($"Maintenance record {recordId} not found");

        if (record.Status != MaintenanceRecordStatus.Scheduled)
            throw new InvalidOperationException($"Cannot start work on record with status {record.Status}");

        record.Status = MaintenanceRecordStatus.InProgress;
        if (!string.IsNullOrEmpty(technicianName))
            record.TechnicianName = technicianName;

        return await _recordRepository.UpdateAsync(record);
    }

    /// <summary>
    /// Complete a maintenance record
    /// </summary>
    public async Task<MaintenanceRecord> CompleteRecordAsync(
        Guid recordId,
        decimal laborCost,
        decimal partsCost,
        string? notes = null)
    {
        var record = await _recordRepository.GetByIdAsync(recordId);
        if (record == null)
            throw new InvalidOperationException($"Maintenance record {recordId} not found");

        record.Complete(DateTime.UtcNow, laborCost, partsCost);
        
        if (!string.IsNullOrEmpty(notes))
            record.Notes = notes;

        // Update vendor rating if vendor is assigned
        if (record.VendorId.HasValue)
        {
            var vendor = await _vendorRepository.GetByIdAsync(record.VendorId.Value);
            if (vendor != null)
            {
                vendor.LastServiceDate = DateTime.UtcNow;
                await _vendorRepository.UpdateAsync(vendor);
            }
        }

        return await _recordRepository.UpdateAsync(record);
    }

    /// <summary>
    /// Cancel a maintenance record
    /// </summary>
    public async Task<MaintenanceRecord> CancelRecordAsync(Guid recordId, string reason)
    {
        var record = await _recordRepository.GetByIdAsync(recordId);
        if (record == null)
            throw new InvalidOperationException($"Maintenance record {recordId} not found");

        record.Cancel(reason);
        return await _recordRepository.UpdateAsync(record);
    }

    /// <summary>
    /// Add line items to a maintenance record
    /// </summary>
    public async Task<MaintenanceRecord> AddLineItemsAsync(Guid recordId, List<MaintenanceRecordItem> items)
    {
        var record = await _recordRepository.GetByIdAsync(recordId);
        if (record == null)
            throw new InvalidOperationException($"Maintenance record {recordId} not found");

        record.Items.AddRange(items);
        
        // Update costs based on items
        record.LaborCost = items.Where(i => i.ItemType == "Labor").Sum(i => i.TotalCost);
        record.PartsCost = items.Where(i => i.ItemType != "Labor").Sum(i => i.TotalCost);

        return await _recordRepository.UpdateAsync(record);
    }

    /// <summary>
    /// Get maintenance cost summary for a tractor
    /// </summary>
    public async Task<decimal> GetTractorMaintenanceCostAsync(
        Guid tractorId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        return await _recordRepository.GetTotalCostByTractorAsync(tractorId, startDate, endDate);
    }

    /// <summary>
    /// Get maintenance cost summary for a vendor
    /// </summary>
    public async Task<decimal> GetVendorCostAsync(
        Guid vendorId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        return await _recordRepository.GetTotalCostByVendorAsync(vendorId, startDate, endDate);
    }

    /// <summary>
    /// Get most expensive maintenance records
    /// </summary>
    public async Task<List<MaintenanceRecord>> GetMostExpensiveRecordsAsync(int count = 10)
    {
        return await _recordRepository.GetMostExpensiveRecordsAsync(count);
    }

    /// <summary>
    /// Get all maintenance records
    /// </summary>
    public async Task<List<MaintenanceRecord>> GetAllRecordsAsync(
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        return await _recordRepository.GetAllAsync(startDate, endDate);
    }

    /// <summary>
    /// Update maintenance record
    /// </summary>
    public async Task<MaintenanceRecord> UpdateRecordAsync(MaintenanceRecord record)
    {
        return await _recordRepository.UpdateAsync(record);
    }

    /// <summary>
    /// Delete maintenance record
    /// </summary>
    public async Task DeleteRecordAsync(Guid recordId)
    {
        await _recordRepository.DeleteAsync(recordId);
    }
}
