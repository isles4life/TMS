namespace TMS.Domain.Repositories;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMS.Domain.Entities.Compliance;

/// <summary>
/// Repository interface for HOS (Hours of Service) operations
/// </summary>
public interface IHOSRepository
{
    Task<HOSLog?> GetByIdAsync(Guid id);
    Task<List<HOSLog>> GetByDriverIdAsync(Guid driverId, DateTime? startDate = null, DateTime? endDate = null);
    Task<HOSLog?> GetActiveLogAsync(Guid driverId);
    Task<List<HOSLog>> GetRecentLogsAsync(Guid driverId, int days = 8);
    Task<HOSLog> AddAsync(HOSLog log);
    Task UpdateAsync(HOSLog log);
    Task DeleteAsync(Guid id);
    
    // Violations
    Task<HOSViolation?> GetViolationByIdAsync(Guid id);
    Task<List<HOSViolation>> GetViolationsByDriverIdAsync(Guid driverId, bool includeResolved = false);
    Task<List<HOSViolation>> GetUnresolvedViolationsAsync();
    Task<HOSViolation> AddViolationAsync(HOSViolation violation);
    Task UpdateViolationAsync(HOSViolation violation);
}

/// <summary>
/// Repository interface for compliance alerts and driver qualifications
/// </summary>
public interface IComplianceRepository
{
    // Compliance Alerts
    Task<ComplianceAlert?> GetAlertByIdAsync(Guid id);
    Task<List<ComplianceAlert>> GetActiveAlertsAsync();
    Task<List<ComplianceAlert>> GetAlertsByDriverIdAsync(Guid driverId);
    Task<List<ComplianceAlert>> GetAlertsByTypeAsync(ComplianceAlertType type);
    Task<List<ComplianceAlert>> GetOverdueAlertsAsync();
    Task<ComplianceAlert> AddAlertAsync(ComplianceAlert alert);
    Task UpdateAlertAsync(ComplianceAlert alert);
    Task DeleteAlertAsync(Guid id);
    
    // Driver Qualification Files
    Task<DriverQualificationFile?> GetQualificationFileByIdAsync(Guid id);
    Task<List<DriverQualificationFile>> GetQualificationFilesByDriverIdAsync(Guid driverId);
    Task<List<DriverQualificationFile>> GetExpiringDocumentsAsync(int daysAhead = 30);
    Task<DriverQualificationFile> AddQualificationFileAsync(DriverQualificationFile file);
    Task UpdateQualificationFileAsync(DriverQualificationFile file);
    Task DeleteQualificationFileAsync(Guid id);
    
    // Driver Safety Scores
    Task<DriverSafetyScore?> GetLatestSafetyScoreAsync(Guid driverId);
    Task<List<DriverSafetyScore>> GetSafetyScoresByDriverIdAsync(Guid driverId);
    Task<List<DriverSafetyScore>> GetAllLatestSafetyScoresAsync();
    Task<DriverSafetyScore> AddSafetyScoreAsync(DriverSafetyScore score);
    
    // FMCSA Data
    Task<FMCSASMSData?> GetLatestSMSDataAsync(string dotNumber);
    Task<FMCSASMSData> AddSMSDataAsync(FMCSASMSData data);
}
