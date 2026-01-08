namespace TMS.Application.Services.Maintenance;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities.Maintenance;
using TMS.Domain.Repositories;

/// <summary>
/// Service for PM scheduling and maintenance management
/// </summary>
public class MaintenanceSchedulingService
{
    private readonly IMaintenanceScheduleRepository _scheduleRepository;
    private readonly IMaintenanceRecordRepository _recordRepository;

    public MaintenanceSchedulingService(
        IMaintenanceScheduleRepository scheduleRepository,
        IMaintenanceRecordRepository recordRepository)
    {
        _scheduleRepository = scheduleRepository;
        _recordRepository = recordRepository;
    }

    /// <summary>
    /// Create a new maintenance schedule
    /// </summary>
    public async Task<MaintenanceSchedule> CreateScheduleAsync(
        Guid? tractorId,
        Guid? trailerId,
        string scheduleName,
        string description,
        MaintenanceScheduleType scheduleType,
        int? mileageInterval = null,
        int? daysInterval = null,
        int? engineHoursInterval = null,
        decimal? lastServiceMileage = null,
        DateTime? lastServiceDate = null,
        decimal? lastServiceEngineHours = null,
        decimal currentMileage = 0,
        decimal? currentEngineHours = null,
        int notificationDaysBefore = 7)
    {
        if (!tractorId.HasValue && !trailerId.HasValue)
            throw new ArgumentException("Either tractorId or trailerId must be provided");

        var schedule = new MaintenanceSchedule
        {
            TractorId = tractorId,
            TrailerId = trailerId,
            ScheduleName = scheduleName,
            Description = description,
            ScheduleType = scheduleType,
            MileageInterval = mileageInterval,
            DaysInterval = daysInterval,
            EngineHoursInterval = engineHoursInterval,
            LastServiceMileage = lastServiceMileage,
            LastServiceDate = lastServiceDate,
            LastServiceEngineHours = lastServiceEngineHours,
            CurrentMileage = currentMileage,
            CurrentEngineHours = currentEngineHours,
            NotificationDaysBefore = notificationDaysBefore,
            IsActive = true
        };

        return await _scheduleRepository.AddAsync(schedule);
    }

    /// <summary>
    /// Get all schedules for a tractor
    /// </summary>
    public async Task<List<MaintenanceSchedule>> GetTractorSchedulesAsync(Guid tractorId)
    {
        return await _scheduleRepository.GetByTractorIdAsync(tractorId);
    }

    /// <summary>
    /// Get all schedules for a trailer
    /// </summary>
    public async Task<List<MaintenanceSchedule>> GetTrailerSchedulesAsync(Guid trailerId)
    {
        return await _scheduleRepository.GetByTrailerIdAsync(trailerId);
    }

    /// <summary>
    /// Get all overdue maintenance schedules
    /// </summary>
    public async Task<List<MaintenanceSchedule>> GetOverdueSchedulesAsync()
    {
        return await _scheduleRepository.GetOverdueSchedulesAsync();
    }

    /// <summary>
    /// Get schedules due soon (within specified days)
    /// </summary>
    public async Task<List<MaintenanceSchedule>> GetSchedulesDueSoonAsync(int daysAhead = 7)
    {
        return await _scheduleRepository.GetSchedulesDueSoonAsync(daysAhead);
    }

    /// <summary>
    /// Update current mileage/hours for a schedule
    /// </summary>
    public async Task<MaintenanceSchedule> UpdateCurrentStatusAsync(
        Guid scheduleId,
        decimal? currentMileage = null,
        decimal? currentEngineHours = null)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        if (schedule == null)
            throw new InvalidOperationException($"Schedule {scheduleId} not found");

        if (currentMileage.HasValue)
            schedule.CurrentMileage = currentMileage.Value;

        if (currentEngineHours.HasValue)
            schedule.CurrentEngineHours = currentEngineHours.Value;

        return await _scheduleRepository.UpdateAsync(schedule);
    }

    /// <summary>
    /// Record completed maintenance and update schedule
    /// </summary>
    public async Task<MaintenanceSchedule> RecordMaintenanceCompletedAsync(
        Guid scheduleId,
        Guid maintenanceRecordId,
        decimal? mileageAtService = null,
        DateTime? serviceDate = null,
        decimal? engineHoursAtService = null)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        if (schedule == null)
            throw new InvalidOperationException($"Schedule {scheduleId} not found");

        var record = await _recordRepository.GetByIdAsync(maintenanceRecordId);
        if (record == null)
            throw new InvalidOperationException($"Maintenance record {maintenanceRecordId} not found");

        // Update last service information
        schedule.UpdateLastService(
            mileageAtService ?? record.MileageAtService,
            serviceDate ?? record.ServiceDate,
            engineHoursAtService ?? record.EngineHoursAtService
        );

        return await _scheduleRepository.UpdateAsync(schedule);
    }

    /// <summary>
    /// Add tasks to a schedule
    /// </summary>
    public async Task<MaintenanceSchedule> AddTasksAsync(Guid scheduleId, List<MaintenanceTask> tasks)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        if (schedule == null)
            throw new InvalidOperationException($"Schedule {scheduleId} not found");

        schedule.Tasks.AddRange(tasks);
        return await _scheduleRepository.UpdateAsync(schedule);
    }

    /// <summary>
    /// Deactivate a schedule
    /// </summary>
    public async Task<MaintenanceSchedule> DeactivateScheduleAsync(Guid scheduleId)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        if (schedule == null)
            throw new InvalidOperationException($"Schedule {scheduleId} not found");

        schedule.IsActive = false;
        return await _scheduleRepository.UpdateAsync(schedule);
    }

    /// <summary>
    /// Activate a schedule
    /// </summary>
    public async Task<MaintenanceSchedule> ActivateScheduleAsync(Guid scheduleId)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
        if (schedule == null)
            throw new InvalidOperationException($"Schedule {scheduleId} not found");

        schedule.IsActive = true;
        return await _scheduleRepository.UpdateAsync(schedule);
    }

    /// <summary>
    /// Delete a schedule
    /// </summary>
    public async Task DeleteScheduleAsync(Guid scheduleId)
    {
        await _scheduleRepository.DeleteAsync(scheduleId);
    }

    /// <summary>
    /// Get schedule by ID
    /// </summary>
    public async Task<MaintenanceSchedule?> GetScheduleByIdAsync(Guid scheduleId)
    {
        return await _scheduleRepository.GetByIdAsync(scheduleId);
    }

    /// <summary>
    /// Check all schedules and identify those needing service
    /// </summary>
    public async Task<List<MaintenanceSchedule>> CheckAllSchedulesAsync()
    {
        var activeSchedules = await _scheduleRepository.GetActiveSchedulesAsync();
        var needingService = new List<MaintenanceSchedule>();

        foreach (var schedule in activeSchedules)
        {
            if (schedule.IsOverdue || schedule.ShouldNotify)
            {
                needingService.Add(schedule);
            }
        }

        return needingService;
    }
}
