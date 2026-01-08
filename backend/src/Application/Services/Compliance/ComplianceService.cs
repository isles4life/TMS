namespace TMS.Application.Services.Compliance;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities.Compliance;
using TMS.Domain.Repositories;

/// <summary>
/// Service for managing compliance alerts and driver qualifications
/// </summary>
public class ComplianceService
{
    private readonly IComplianceRepository _complianceRepository;

    public ComplianceService(IComplianceRepository complianceRepository)
    {
        _complianceRepository = complianceRepository;
    }

    // ========== Compliance Alerts ==========

    /// <summary>
    /// Create a new compliance alert
    /// </summary>
    public async Task<ComplianceAlert> CreateAlertAsync(
        ComplianceAlertType alertType,
        ComplianceAlertSeverity severity,
        string title,
        string description,
        Guid? driverId = null,
        Guid? vehicleId = null,
        DateTime? dueDate = null,
        DateTime? expirationDate = null,
        int alertDaysBefore = 30)
    {
        var alert = new ComplianceAlert
        {
            AlertType = alertType,
            Severity = severity,
            Title = title,
            Description = description,
            DriverId = driverId,
            VehicleId = vehicleId,
            DueDate = dueDate,
            ExpirationDate = expirationDate,
            AlertDaysBefore = alertDaysBefore,
            Status = ComplianceAlertStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        return await _complianceRepository.AddAlertAsync(alert);
    }

    /// <summary>
    /// Get all active alerts
    /// </summary>
    public async Task<List<ComplianceAlert>> GetActiveAlertsAsync()
    {
        return await _complianceRepository.GetActiveAlertsAsync();
    }

    /// <summary>
    /// Get alerts for a specific driver
    /// </summary>
    public async Task<List<ComplianceAlert>> GetDriverAlertsAsync(Guid driverId)
    {
        return await _complianceRepository.GetAlertsByDriverIdAsync(driverId);
    }

    /// <summary>
    /// Get overdue alerts
    /// </summary>
    public async Task<List<ComplianceAlert>> GetOverdueAlertsAsync()
    {
        return await _complianceRepository.GetOverdueAlertsAsync();
    }

    /// <summary>
    /// Acknowledge an alert
    /// </summary>
    public async Task<ComplianceAlert> AcknowledgeAlertAsync(Guid alertId, string acknowledgedBy)
    {
        var alert = await _complianceRepository.GetAlertByIdAsync(alertId);
        if (alert == null)
        {
            throw new InvalidOperationException("Alert not found.");
        }

        alert.Acknowledge(acknowledgedBy);
        await _complianceRepository.UpdateAlertAsync(alert);
        return alert;
    }

    /// <summary>
    /// Resolve an alert
    /// </summary>
    public async Task<ComplianceAlert> ResolveAlertAsync(Guid alertId, string resolutionNotes)
    {
        var alert = await _complianceRepository.GetAlertByIdAsync(alertId);
        if (alert == null)
        {
            throw new InvalidOperationException("Alert not found.");
        }

        alert.Resolve(resolutionNotes);
        await _complianceRepository.UpdateAlertAsync(alert);
        return alert;
    }

    /// <summary>
    /// Dismiss an alert
    /// </summary>
    public async Task<ComplianceAlert> DismissAlertAsync(Guid alertId)
    {
        var alert = await _complianceRepository.GetAlertByIdAsync(alertId);
        if (alert == null)
        {
            throw new InvalidOperationException("Alert not found.");
        }

        alert.Dismiss();
        await _complianceRepository.UpdateAlertAsync(alert);
        return alert;
    }

    /// <summary>
    /// Check and create alerts for expiring documents
    /// </summary>
    public async Task<List<ComplianceAlert>> CheckExpiringDocumentsAsync(int daysAhead = 30)
    {
        var expiringDocs = await _complianceRepository.GetExpiringDocumentsAsync(daysAhead);
        var newAlerts = new List<ComplianceAlert>();

        foreach (var doc in expiringDocs)
        {
            // Check if alert already exists
            var existingAlerts = await _complianceRepository.GetAlertsByDriverIdAsync(doc.DriverId);
            var hasExistingAlert = existingAlerts.Any(a =>
                a.AlertType == GetAlertTypeForDocument(doc.DocumentType) &&
                a.Status == ComplianceAlertStatus.Active);

            if (!hasExistingAlert)
            {
                var severity = doc.DaysUntilExpiration switch
                {
                    <= 7 => ComplianceAlertSeverity.Urgent,
                    <= 14 => ComplianceAlertSeverity.Critical,
                    <= 30 => ComplianceAlertSeverity.Warning,
                    _ => ComplianceAlertSeverity.Info
                };

                var alert = await CreateAlertAsync(
                    alertType: GetAlertTypeForDocument(doc.DocumentType),
                    severity: severity,
                    title: $"{doc.DocumentType} Expiring Soon",
                    description: $"{doc.DocumentType} {doc.DocumentNumber} expires in {doc.DaysUntilExpiration} days.",
                    driverId: doc.DriverId,
                    dueDate: doc.ExpirationDate,
                    expirationDate: doc.ExpirationDate
                );

                newAlerts.Add(alert);
            }
        }

        return newAlerts;
    }

    // ========== Driver Qualification Files ==========

    /// <summary>
    /// Add a qualification file for a driver
    /// </summary>
    public async Task<DriverQualificationFile> AddQualificationFileAsync(
        Guid driverId,
        QualificationDocumentType documentType,
        string documentNumber,
        DateTime issueDate,
        DateTime expirationDate,
        string issuingAuthority,
        string issuingState,
        string? documentPath = null,
        string? notes = null)
    {
        var file = new DriverQualificationFile
        {
            DriverId = driverId,
            DocumentType = documentType,
            DocumentNumber = documentNumber,
            IssueDate = issueDate,
            ExpirationDate = expirationDate,
            IssuingAuthority = issuingAuthority,
            IssuingState = issuingState,
            DocumentPath = documentPath,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };

        return await _complianceRepository.AddQualificationFileAsync(file);
    }

    /// <summary>
    /// Get all qualification files for a driver
    /// </summary>
    public async Task<List<DriverQualificationFile>> GetDriverQualificationFilesAsync(Guid driverId)
    {
        return await _complianceRepository.GetQualificationFilesByDriverIdAsync(driverId);
    }

    /// <summary>
    /// Verify a qualification file
    /// </summary>
    public async Task<DriverQualificationFile> VerifyQualificationFileAsync(Guid fileId, string verifiedBy)
    {
        var file = await _complianceRepository.GetQualificationFileByIdAsync(fileId);
        if (file == null)
        {
            throw new InvalidOperationException("Qualification file not found.");
        }

        file.Verify(verifiedBy);
        await _complianceRepository.UpdateQualificationFileAsync(file);
        return file;
    }

    /// <summary>
    /// Update a qualification file
    /// </summary>
    public async Task<DriverQualificationFile> UpdateQualificationFileAsync(
        Guid fileId,
        DateTime? newExpirationDate = null,
        string? newDocumentPath = null,
        string? notes = null)
    {
        var file = await _complianceRepository.GetQualificationFileByIdAsync(fileId);
        if (file == null)
        {
            throw new InvalidOperationException("Qualification file not found.");
        }

        if (newExpirationDate.HasValue)
        {
            file.ExpirationDate = newExpirationDate.Value;
        }

        if (!string.IsNullOrEmpty(newDocumentPath))
        {
            file.DocumentPath = newDocumentPath;
        }

        if (!string.IsNullOrEmpty(notes))
        {
            file.Notes = notes;
        }

        await _complianceRepository.UpdateQualificationFileAsync(file);
        return file;
    }

    /// <summary>
    /// Delete a qualification file
    /// </summary>
    public async Task DeleteQualificationFileAsync(Guid fileId)
    {
        await _complianceRepository.DeleteQualificationFileAsync(fileId);
    }

    // ========== Helper Methods ==========

    private ComplianceAlertType GetAlertTypeForDocument(QualificationDocumentType documentType)
    {
        return documentType switch
        {
            QualificationDocumentType.CDL => ComplianceAlertType.CDLExpiration,
            QualificationDocumentType.MedicalCard => ComplianceAlertType.MedicalCardExpiration,
            QualificationDocumentType.DrugTest => ComplianceAlertType.DrugTestDue,
            QualificationDocumentType.BackgroundCheck => ComplianceAlertType.BackgroundCheckDue,
            QualificationDocumentType.HazMatEndorsement => ComplianceAlertType.HazMatEndorsementExpiration,
            _ => ComplianceAlertType.Other
        };
    }
}
