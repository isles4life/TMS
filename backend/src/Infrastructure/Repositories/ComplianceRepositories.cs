namespace TMS.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities.Compliance;
using TMS.Domain.Repositories;
using TMS.Infrastructure.Persistence;

/// <summary>
/// Repository implementation for HOS operations
/// </summary>
public class HOSRepository : IHOSRepository
{
    private readonly TMSDbContext _context;

    public HOSRepository(TMSDbContext context)
    {
        _context = context;
    }

    public async Task<HOSLog?> GetByIdAsync(Guid id)
    {
        return await _context.HOSLogs
            .Include(l => l.Driver)
            .Include(l => l.Violations)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<List<HOSLog>> GetByDriverIdAsync(Guid driverId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.HOSLogs
            .Include(l => l.Violations)
            .Where(l => l.DriverId == driverId);

        if (startDate.HasValue)
            query = query.Where(l => l.StartTime >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(l => l.StartTime <= endDate.Value);

        return await query
            .OrderBy(l => l.StartTime)
            .ToListAsync();
    }

    public async Task<HOSLog?> GetActiveLogAsync(Guid driverId)
    {
        return await _context.HOSLogs
            .Include(l => l.Driver)
            .Where(l => l.DriverId == driverId && l.EndTime == null)
            .OrderByDescending(l => l.StartTime)
            .FirstOrDefaultAsync();
    }

    public async Task<List<HOSLog>> GetRecentLogsAsync(Guid driverId, int days = 8)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        return await _context.HOSLogs
            .Include(l => l.Violations)
            .Where(l => l.DriverId == driverId && l.StartTime >= startDate)
            .OrderBy(l => l.StartTime)
            .ToListAsync();
    }

    public async Task<HOSLog> AddAsync(HOSLog log)
    {
        _context.HOSLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task UpdateAsync(HOSLog log)
    {
        _context.HOSLogs.Update(log);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var log = await _context.HOSLogs.FindAsync(id);
        if (log != null)
        {
            _context.HOSLogs.Remove(log);
            await _context.SaveChangesAsync();
        }
    }

    // Violations
    public async Task<HOSViolation?> GetViolationByIdAsync(Guid id)
    {
        return await _context.HOSViolations
            .Include(v => v.Driver)
            .Include(v => v.HOSLog)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<List<HOSViolation>> GetViolationsByDriverIdAsync(Guid driverId, bool includeResolved = false)
    {
        var query = _context.HOSViolations
            .Include(v => v.HOSLog)
            .Where(v => v.DriverId == driverId);

        if (!includeResolved)
            query = query.Where(v => !v.IsResolved);

        return await query
            .OrderByDescending(v => v.ViolationDateTime)
            .ToListAsync();
    }

    public async Task<List<HOSViolation>> GetUnresolvedViolationsAsync()
    {
        return await _context.HOSViolations
            .Include(v => v.Driver)
            .Include(v => v.HOSLog)
            .Where(v => !v.IsResolved)
            .OrderByDescending(v => v.ViolationDateTime)
            .ToListAsync();
    }

    public async Task<HOSViolation> AddViolationAsync(HOSViolation violation)
    {
        _context.HOSViolations.Add(violation);
        await _context.SaveChangesAsync();
        return violation;
    }

    public async Task UpdateViolationAsync(HOSViolation violation)
    {
        _context.HOSViolations.Update(violation);
        await _context.SaveChangesAsync();
    }
}

/// <summary>
/// Repository implementation for compliance operations
/// </summary>
public class ComplianceRepository : IComplianceRepository
{
    private readonly TMSDbContext _context;

    public ComplianceRepository(TMSDbContext context)
    {
        _context = context;
    }

    // Compliance Alerts
    public async Task<ComplianceAlert?> GetAlertByIdAsync(Guid id)
    {
        return await _context.ComplianceAlerts
            .Include(a => a.Driver)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<List<ComplianceAlert>> GetActiveAlertsAsync()
    {
        return await _context.ComplianceAlerts
            .Include(a => a.Driver)
            .Where(a => a.Status == ComplianceAlertStatus.Active)
            .OrderBy(a => a.DueDate)
            .ToListAsync();
    }

    public async Task<List<ComplianceAlert>> GetAlertsByDriverIdAsync(Guid driverId)
    {
        return await _context.ComplianceAlerts
            .Where(a => a.DriverId == driverId)
            .OrderBy(a => a.DueDate)
            .ToListAsync();
    }

    public async Task<List<ComplianceAlert>> GetAlertsByTypeAsync(ComplianceAlertType type)
    {
        return await _context.ComplianceAlerts
            .Include(a => a.Driver)
            .Where(a => a.AlertType == type && a.Status == ComplianceAlertStatus.Active)
            .OrderBy(a => a.DueDate)
            .ToListAsync();
    }

    public async Task<List<ComplianceAlert>> GetOverdueAlertsAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.ComplianceAlerts
            .Include(a => a.Driver)
            .Where(a => a.DueDate.HasValue && a.DueDate.Value < now 
                       && a.Status == ComplianceAlertStatus.Active)
            .OrderBy(a => a.DueDate)
            .ToListAsync();
    }

    public async Task<ComplianceAlert> AddAlertAsync(ComplianceAlert alert)
    {
        _context.ComplianceAlerts.Add(alert);
        await _context.SaveChangesAsync();
        return alert;
    }

    public async Task UpdateAlertAsync(ComplianceAlert alert)
    {
        _context.ComplianceAlerts.Update(alert);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAlertAsync(Guid id)
    {
        var alert = await _context.ComplianceAlerts.FindAsync(id);
        if (alert != null)
        {
            _context.ComplianceAlerts.Remove(alert);
            await _context.SaveChangesAsync();
        }
    }

    // Driver Qualification Files
    public async Task<DriverQualificationFile?> GetQualificationFileByIdAsync(Guid id)
    {
        return await _context.DriverQualificationFiles
            .Include(f => f.Driver)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<List<DriverQualificationFile>> GetQualificationFilesByDriverIdAsync(Guid driverId)
    {
        return await _context.DriverQualificationFiles
            .Where(f => f.DriverId == driverId)
            .OrderBy(f => f.ExpirationDate)
            .ToListAsync();
    }

    public async Task<List<DriverQualificationFile>> GetExpiringDocumentsAsync(int daysAhead = 30)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);
        return await _context.DriverQualificationFiles
            .Include(f => f.Driver)
            .Where(f => f.ExpirationDate <= cutoffDate && f.ExpirationDate >= DateTime.UtcNow)
            .OrderBy(f => f.ExpirationDate)
            .ToListAsync();
    }

    public async Task<DriverQualificationFile> AddQualificationFileAsync(DriverQualificationFile file)
    {
        _context.DriverQualificationFiles.Add(file);
        await _context.SaveChangesAsync();
        return file;
    }

    public async Task UpdateQualificationFileAsync(DriverQualificationFile file)
    {
        _context.DriverQualificationFiles.Update(file);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteQualificationFileAsync(Guid id)
    {
        var file = await _context.DriverQualificationFiles.FindAsync(id);
        if (file != null)
        {
            _context.DriverQualificationFiles.Remove(file);
            await _context.SaveChangesAsync();
        }
    }

    // Driver Safety Scores
    public async Task<DriverSafetyScore?> GetLatestSafetyScoreAsync(Guid driverId)
    {
        return await _context.DriverSafetyScores
            .Include(s => s.Driver)
            .Where(s => s.DriverId == driverId)
            .OrderByDescending(s => s.CalculatedDate)
            .FirstOrDefaultAsync();
    }

    public async Task<List<DriverSafetyScore>> GetSafetyScoresByDriverIdAsync(Guid driverId)
    {
        return await _context.DriverSafetyScores
            .Where(s => s.DriverId == driverId)
            .OrderByDescending(s => s.CalculatedDate)
            .ToListAsync();
    }

    public async Task<List<DriverSafetyScore>> GetAllLatestSafetyScoresAsync()
    {
        return await _context.DriverSafetyScores
            .Include(s => s.Driver)
            .GroupBy(s => s.DriverId)
            .Select(g => g.OrderByDescending(s => s.CalculatedDate).First())
            .ToListAsync();
    }

    public async Task<DriverSafetyScore> AddSafetyScoreAsync(DriverSafetyScore score)
    {
        _context.DriverSafetyScores.Add(score);
        await _context.SaveChangesAsync();
        return score;
    }

    // FMCSA Data
    public async Task<FMCSASMSData?> GetLatestSMSDataAsync(string dotNumber)
    {
        return await _context.FMCSASMSData
            .Where(d => d.DOTNumber == dotNumber)
            .OrderByDescending(d => d.DataDate)
            .FirstOrDefaultAsync();
    }

    public async Task<FMCSASMSData> AddSMSDataAsync(FMCSASMSData data)
    {
        _context.FMCSASMSData.Add(data);
        await _context.SaveChangesAsync();
        return data;
    }
}
