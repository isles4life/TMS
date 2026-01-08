namespace TMS.Domain.Entities.Maintenance;

using System;
using System.Collections.Generic;
using TMS.Domain.Common;
using TMS.Domain.Entities;
using TMS.Domain.Entities.Equipment;

/// <summary>
/// Preventative maintenance schedule for vehicles/equipment
/// </summary>
public class MaintenanceSchedule : BaseEntity
{
    public Guid? TractorId { get; set; }
    public PowerOnlyTractor? Tractor { get; set; }
    
    public Guid? TrailerId { get; set; }
    public Trailer? Trailer { get; set; }
    
    public string ScheduleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public MaintenanceScheduleType ScheduleType { get; set; }
    
    /// <summary>
    /// Mileage interval (for mileage-based schedules)
    /// </summary>
    public int? MileageInterval { get; set; }
    
    /// <summary>
    /// Time interval in days (for time-based schedules)
    /// </summary>
    public int? DaysInterval { get; set; }
    
    /// <summary>
    /// Engine hours interval (for hour-based schedules)
    /// </summary>
    public int? EngineHoursInterval { get; set; }
    
    /// <summary>
    /// Last service mileage
    /// </summary>
    public decimal? LastServiceMileage { get; set; }
    
    /// <summary>
    /// Last service date
    /// </summary>
    public DateTime? LastServiceDate { get; set; }
    
    /// <summary>
    /// Last service engine hours
    /// </summary>
    public decimal? LastServiceEngineHours { get; set; }
    
    /// <summary>
    /// Current vehicle mileage
    /// </summary>
    public decimal CurrentMileage { get; set; }
    
    /// <summary>
    /// Current engine hours
    /// </summary>
    public decimal? CurrentEngineHours { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Days before due to send first notification
    /// </summary>
    public int NotificationDaysBefore { get; set; } = 7;
    
    public List<MaintenanceTask> Tasks { get; set; } = new();
    public List<MaintenanceRecord> MaintenanceRecords { get; set; } = new();
    
    /// <summary>
    /// Calculate next service due date
    /// </summary>
    public DateTime? NextServiceDueDate
    {
        get
        {
            if (ScheduleType == MaintenanceScheduleType.TimeBased && LastServiceDate.HasValue && DaysInterval.HasValue)
            {
                return LastServiceDate.Value.AddDays(DaysInterval.Value);
            }
            return null;
        }
    }
    
    /// <summary>
    /// Calculate next service due mileage
    /// </summary>
    public decimal? NextServiceDueMileage
    {
        get
        {
            if (ScheduleType == MaintenanceScheduleType.MileageBased && LastServiceMileage.HasValue && MileageInterval.HasValue)
            {
                return LastServiceMileage.Value + MileageInterval.Value;
            }
            return null;
        }
    }
    
    /// <summary>
    /// Calculate next service due engine hours
    /// </summary>
    public decimal? NextServiceDueEngineHours
    {
        get
        {
            if (ScheduleType == MaintenanceScheduleType.EngineHoursBased && LastServiceEngineHours.HasValue && EngineHoursInterval.HasValue)
            {
                return LastServiceEngineHours.Value + EngineHoursInterval.Value;
            }
            return null;
        }
    }
    
    /// <summary>
    /// Check if maintenance is overdue
    /// </summary>
    public bool IsOverdue
    {
        get
        {
            return ScheduleType switch
            {
                MaintenanceScheduleType.MileageBased => NextServiceDueMileage.HasValue && CurrentMileage >= NextServiceDueMileage.Value,
                MaintenanceScheduleType.TimeBased => NextServiceDueDate.HasValue && DateTime.UtcNow.Date >= NextServiceDueDate.Value.Date,
                MaintenanceScheduleType.EngineHoursBased => NextServiceDueEngineHours.HasValue && CurrentEngineHours >= NextServiceDueEngineHours.Value,
                _ => false
            };
        }
    }
    
    /// <summary>
    /// Check if notification should be sent
    /// </summary>
    public bool ShouldNotify
    {
        get
        {
            return ScheduleType switch
            {
                MaintenanceScheduleType.MileageBased => NextServiceDueMileage.HasValue && CurrentMileage >= (NextServiceDueMileage.Value - (MileageInterval ?? 0) * 0.1m),
                MaintenanceScheduleType.TimeBased => NextServiceDueDate.HasValue && DateTime.UtcNow.Date >= NextServiceDueDate.Value.AddDays(-NotificationDaysBefore).Date,
                MaintenanceScheduleType.EngineHoursBased => NextServiceDueEngineHours.HasValue && CurrentEngineHours >= (NextServiceDueEngineHours.Value - (EngineHoursInterval ?? 0) * 0.1m),
                _ => false
            };
        }
    }
    
    /// <summary>
    /// Days until due (for time-based schedules)
    /// </summary>
    public int? DaysUntilDue
    {
        get
        {
            if (ScheduleType == MaintenanceScheduleType.TimeBased && NextServiceDueDate.HasValue)
            {
                return (int)(NextServiceDueDate.Value.Date - DateTime.UtcNow.Date).TotalDays;
            }
            return null;
        }
    }
    
    /// <summary>
    /// Mileage until due (for mileage-based schedules)
    /// </summary>
    public decimal? MileageUntilDue
    {
        get
        {
            if (ScheduleType == MaintenanceScheduleType.MileageBased && NextServiceDueMileage.HasValue)
            {
                return NextServiceDueMileage.Value - CurrentMileage;
            }
            return null;
        }
    }
    
    /// <summary>
    /// Update last service information
    /// </summary>
    public void UpdateLastService(decimal? mileage = null, DateTime? date = null, decimal? engineHours = null)
    {
        if (mileage.HasValue)
            LastServiceMileage = mileage.Value;
        
        if (date.HasValue)
            LastServiceDate = date.Value;
        
        if (engineHours.HasValue)
            LastServiceEngineHours = engineHours.Value;
    }
}

/// <summary>
/// Maintenance task/checklist item
/// </summary>
public class MaintenanceTask : BaseEntity
{
    public Guid MaintenanceScheduleId { get; set; }
    public MaintenanceSchedule? MaintenanceSchedule { get; set; }
    
    public string TaskName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public MaintenanceTaskCategory Category { get; set; }
    
    public decimal? EstimatedCost { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    
    public bool IsRequired { get; set; } = true;
    public int SortOrder { get; set; }
    
    public string? Notes { get; set; }
}

/// <summary>
/// Maintenance record for completed service
/// </summary>
public class MaintenanceRecord : BaseEntity
{
    public Guid? MaintenanceScheduleId { get; set; }
    public MaintenanceSchedule? MaintenanceSchedule { get; set; }
    
    public Guid? TractorId { get; set; }
    public PowerOnlyTractor? Tractor { get; set; }
    
    public Guid? TrailerId { get; set; }
    public Trailer? Trailer { get; set; }
    
    public Guid? VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    
    public MaintenanceRecordType RecordType { get; set; }
    
    public string WorkOrderNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public DateTime ServiceDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    
    public decimal? MileageAtService { get; set; }
    public decimal? EngineHoursAtService { get; set; }
    
    public MaintenanceRecordStatus Status { get; set; } = MaintenanceRecordStatus.Scheduled;
    
    public decimal LaborCost { get; set; }
    public decimal PartsCost { get; set; }
    public decimal TotalCost => LaborCost + PartsCost;
    
    public string? TechnicianName { get; set; }
    public string? Notes { get; set; }
    
    public List<MaintenanceRecordItem> Items { get; set; } = new();
    
    /// <summary>
    /// Mark as completed
    /// </summary>
    public void Complete(DateTime completedDate, decimal laborCost, decimal partsCost)
    {
        Status = MaintenanceRecordStatus.Completed;
        CompletedDate = completedDate;
        LaborCost = laborCost;
        PartsCost = partsCost;
    }
    
    /// <summary>
    /// Mark as cancelled
    /// </summary>
    public void Cancel(string reason)
    {
        Status = MaintenanceRecordStatus.Cancelled;
        Notes = $"Cancelled: {reason}";
    }
}

/// <summary>
/// Line item for maintenance record
/// </summary>
public class MaintenanceRecordItem : BaseEntity
{
    public Guid MaintenanceRecordId { get; set; }
    public MaintenanceRecord? MaintenanceRecord { get; set; }
    
    public string ItemType { get; set; } = string.Empty; // "Labor", "Part", "Fluid", etc.
    public string Description { get; set; } = string.Empty;
    
    public decimal Quantity { get; set; } = 1;
    public decimal UnitCost { get; set; }
    public decimal TotalCost => Quantity * UnitCost;
    
    public string? PartNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Maintenance schedule types
/// </summary>
public enum MaintenanceScheduleType
{
    MileageBased = 0,
    TimeBased = 1,
    EngineHoursBased = 2,
    EventBased = 3
}

/// <summary>
/// Maintenance task categories
/// </summary>
public enum MaintenanceTaskCategory
{
    Inspection = 0,
    OilChange = 1,
    TireRotation = 2,
    BrakeService = 3,
    FluidCheck = 4,
    FilterReplacement = 5,
    BeltReplacement = 6,
    BatteryService = 7,
    TuneUp = 8,
    SafetyInspection = 9,
    DOTInspection = 10,
    Other = 99
}

/// <summary>
/// Maintenance record types
/// </summary>
public enum MaintenanceRecordType
{
    PreventativeMaintenance = 0,
    RepairWork = 1,
    Inspection = 2,
    Recall = 3,
    Warranty = 4,
    Emergency = 5
}

/// <summary>
/// Maintenance record status
/// </summary>
public enum MaintenanceRecordStatus
{
    Scheduled = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3,
    OnHold = 4
}
