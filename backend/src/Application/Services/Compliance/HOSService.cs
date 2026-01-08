namespace TMS.Application.Services.Compliance;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities.Compliance;
using TMS.Domain.Repositories;

/// <summary>
/// Service for managing HOS (Hours of Service) logs and violations
/// </summary>
public class HOSService
{
    private readonly IHOSRepository _hosRepository;
    private readonly HOSRulesEngine _rulesEngine;

    public HOSService(IHOSRepository hosRepository, HOSRulesEngine rulesEngine)
    {
        _hosRepository = hosRepository;
        _rulesEngine = rulesEngine;
    }

    /// <summary>
    /// Start a new HOS log entry
    /// </summary>
    public async Task<HOSLog> StartLogAsync(
        Guid driverId,
        HOSStatus status,
        string? location = null,
        decimal? latitude = null,
        decimal? longitude = null,
        string? vehicleId = null,
        decimal? odometer = null,
        HOSLogSource source = HOSLogSource.Manual)
    {
        // Check if there's an active log
        var activeLog = await _hosRepository.GetActiveLogAsync(driverId);
        if (activeLog != null)
        {
            throw new InvalidOperationException(
                $"Driver has an active {activeLog.Status} log. Complete it before starting a new one.");
        }

        var log = new HOSLog
        {
            DriverId = driverId,
            StartTime = DateTime.UtcNow,
            Status = status,
            Location = location,
            Latitude = latitude,
            Longitude = longitude,
            VehicleId = vehicleId,
            Odometer = odometer,
            Source = source,
            CreatedAt = DateTime.UtcNow
        };

        return await _hosRepository.AddAsync(log);
    }

    /// <summary>
    /// Complete the current active HOS log
    /// </summary>
    public async Task<HOSLog> CompleteLogAsync(Guid driverId, string? notes = null)
    {
        var activeLog = await _hosRepository.GetActiveLogAsync(driverId);
        if (activeLog == null)
        {
            throw new InvalidOperationException("No active HOS log found for this driver.");
        }

        activeLog.Complete(DateTime.UtcNow);
        if (!string.IsNullOrEmpty(notes))
        {
            activeLog.Notes = notes;
        }

        await _hosRepository.UpdateAsync(activeLog);

        // Check for violations after completing the log
        await CheckAndRecordViolationsAsync(driverId);

        return activeLog;
    }

    /// <summary>
    /// Change driver status (completes current log and starts new one)
    /// </summary>
    public async Task<HOSLog> ChangeStatusAsync(
        Guid driverId,
        HOSStatus newStatus,
        string? location = null,
        decimal? latitude = null,
        decimal? longitude = null)
    {
        // Complete current log if exists
        var activeLog = await _hosRepository.GetActiveLogAsync(driverId);
        if (activeLog != null)
        {
            activeLog.Complete(DateTime.UtcNow);
            await _hosRepository.UpdateAsync(activeLog);
        }

        // Start new log
        return await StartLogAsync(driverId, newStatus, location, latitude, longitude);
    }

    /// <summary>
    /// Get current HOS summary for a driver
    /// </summary>
    public async Task<HOSSummary> GetCurrentSummaryAsync(Guid driverId, string driverName)
    {
        var recentLogs = await _hosRepository.GetRecentLogsAsync(driverId, days: 8);
        return _rulesEngine.CalculateHOSSummary(driverId, driverName, recentLogs);
    }

    /// <summary>
    /// Check if driver can start driving
    /// </summary>
    public async Task<(bool CanDrive, string? Reason)> CanDriverDriveAsync(Guid driverId)
    {
        var recentLogs = await _hosRepository.GetRecentLogsAsync(driverId, days: 8);
        return _rulesEngine.CanDriverDrive(driverId, recentLogs);
    }

    /// <summary>
    /// Get HOS logs for a driver within date range
    /// </summary>
    public async Task<List<HOSLog>> GetLogsAsync(
        Guid driverId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        return await _hosRepository.GetByDriverIdAsync(driverId, startDate, endDate);
    }

    /// <summary>
    /// Get a specific HOS log by ID
    /// </summary>
    public async Task<HOSLog?> GetLogByIdAsync(Guid logId)
    {
        return await _hosRepository.GetByIdAsync(logId);
    }

    /// <summary>
    /// Edit an existing HOS log entry
    /// </summary>
    public async Task<HOSLog> EditLogAsync(Guid logId, string editReason, DateTime? newStartTime = null, DateTime? newEndTime = null)
    {
        var log = await _hosRepository.GetByIdAsync(logId);
        if (log == null)
        {
            throw new InvalidOperationException("HOS log not found.");
        }

        if (log.IsCertified)
        {
            throw new InvalidOperationException("Cannot edit a certified log entry.");
        }

        log.MarkAsEdited(editReason);

        if (newStartTime.HasValue)
        {
            log.StartTime = newStartTime.Value;
        }

        if (newEndTime.HasValue)
        {
            log.EndTime = newEndTime.Value;
        }

        await _hosRepository.UpdateAsync(log);
        return log;
    }

    /// <summary>
    /// Certify HOS logs for a day
    /// </summary>
    public async Task CertifyDailyLogsAsync(Guid driverId, DateTime date)
    {
        var logs = await _hosRepository.GetByDriverIdAsync(
            driverId,
            date.Date,
            date.Date.AddDays(1).AddTicks(-1));

        foreach (var log in logs.Where(l => !l.IsCertified))
        {
            log.Certify();
            await _hosRepository.UpdateAsync(log);
        }
    }

    /// <summary>
    /// Check for violations and record them
    /// </summary>
    public async Task<List<HOSViolation>> CheckAndRecordViolationsAsync(Guid driverId)
    {
        var recentLogs = await _hosRepository.GetRecentLogsAsync(driverId, days: 8);
        var violations = _rulesEngine.DetectViolations(driverId, recentLogs);

        // Get existing unresolved violations to avoid duplicates
        var existingViolations = await _hosRepository.GetViolationsByDriverIdAsync(driverId, includeResolved: false);

        var newViolations = new List<HOSViolation>();
        foreach (var violation in violations)
        {
            // Check if similar violation already exists
            var isDuplicate = existingViolations.Any(ev =>
                ev.ViolationType == violation.ViolationType &&
                ev.ViolationDateTime.Date == violation.ViolationDateTime.Date);

            if (!isDuplicate)
            {
                var savedViolation = await _hosRepository.AddViolationAsync(violation);
                newViolations.Add(savedViolation);
            }
        }

        return newViolations;
    }

    /// <summary>
    /// Get violations for a driver
    /// </summary>
    public async Task<List<HOSViolation>> GetViolationsAsync(Guid driverId, bool includeResolved = false)
    {
        return await _hosRepository.GetViolationsByDriverIdAsync(driverId, includeResolved);
    }

    /// <summary>
    /// Get all unresolved violations
    /// </summary>
    public async Task<List<HOSViolation>> GetUnresolvedViolationsAsync()
    {
        return await _hosRepository.GetUnresolvedViolationsAsync();
    }

    /// <summary>
    /// Resolve a violation
    /// </summary>
    public async Task<HOSViolation> ResolveViolationAsync(Guid violationId, string resolutionNotes)
    {
        var violation = await _hosRepository.GetViolationByIdAsync(violationId);
        if (violation == null)
        {
            throw new InvalidOperationException("Violation not found.");
        }

        violation.Resolve(resolutionNotes);
        await _hosRepository.UpdateViolationAsync(violation);
        return violation;
    }

    /// <summary>
    /// Delete a HOS log (only if not certified)
    /// </summary>
    public async Task DeleteLogAsync(Guid logId)
    {
        var log = await _hosRepository.GetByIdAsync(logId);
        if (log == null)
        {
            throw new InvalidOperationException("HOS log not found.");
        }

        if (log.IsCertified)
        {
            throw new InvalidOperationException("Cannot delete a certified log entry.");
        }

        await _hosRepository.DeleteAsync(logId);
    }
}
