namespace TMS.Application.Services.Compliance;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities.Compliance;
using TMS.Domain.Repositories;

/// <summary>
/// Service for calculating and managing driver safety scores
/// </summary>
public class SafetyScoringService
{
    private readonly IComplianceRepository _complianceRepository;
    private readonly IHOSRepository _hosRepository;

    // Scoring weights (total = 100)
    private const decimal WEIGHT_ACCIDENTS = 30m;
    private const decimal WEIGHT_VIOLATIONS = 25m;
    private const decimal WEIGHT_HOS_COMPLIANCE = 20m;
    private const decimal WEIGHT_INSPECTIONS = 15m;
    private const decimal WEIGHT_DRIVING_BEHAVIOR = 10m;

    public SafetyScoringService(
        IComplianceRepository complianceRepository,
        IHOSRepository hosRepository)
    {
        _complianceRepository = complianceRepository;
        _hosRepository = hosRepository;
    }

    /// <summary>
    /// Calculate comprehensive safety score for a driver over a period
    /// </summary>
    public async Task<DriverSafetyScore> CalculateSafetyScoreAsync(
        Guid driverId,
        DateTime periodStart,
        DateTime periodEnd)
    {
        // Get violations for the period
        var violations = await _hosRepository.GetViolationsByDriverIdAsync(driverId, includeResolved: true);
        var periodViolations = violations
            .Where(v => v.ViolationDateTime >= periodStart && v.ViolationDateTime <= periodEnd)
            .ToList();

        // Get HOS logs for compliance score
        var hosLogs = await _hosRepository.GetByDriverIdAsync(driverId, periodStart, periodEnd);

        // Calculate component scores
        var accidentScore = CalculateAccidentScore(0); // TODO: Get actual accident data
        var violationScore = CalculateViolationScore(periodViolations.Count);
        var hosComplianceScore = CalculateHOSComplianceScore(periodViolations);
        var inspectionScore = CalculateInspectionScore(0, 0); // TODO: Get actual inspection data
        var drivingBehaviorScore = CalculateDrivingBehaviorScore(0, 0, 0); // TODO: Get telematics data

        // Calculate overall score (weighted average)
        var overallScore = (
            accidentScore * WEIGHT_ACCIDENTS +
            violationScore * WEIGHT_VIOLATIONS +
            hosComplianceScore * WEIGHT_HOS_COMPLIANCE +
            inspectionScore * WEIGHT_INSPECTIONS +
            drivingBehaviorScore * WEIGHT_DRIVING_BEHAVIOR
        ) / 100m;

        // Calculate miles driven
        var milesDriven = 0m; // TODO: Calculate from trip data

        var safetyScore = new DriverSafetyScore
        {
            DriverId = driverId,
            CalculatedDate = DateTime.UtcNow,
            PeriodStartDate = periodStart,
            PeriodEndDate = periodEnd,
            OverallScore = Math.Round(overallScore, 2),
            AccidentScore = Math.Round(accidentScore, 2),
            ViolationScore = Math.Round(violationScore, 2),
            HOSComplianceScore = Math.Round(hosComplianceScore, 2),
            InspectionScore = Math.Round(inspectionScore, 2),
            DrivingBehaviorScore = Math.Round(drivingBehaviorScore, 2),
            AccidentCount = 0, // TODO: Get from accidents table
            ViolationCount = 0, // TODO: Get from violations table
            HOSViolationCount = periodViolations.Count,
            InspectionCount = 0, // TODO: Get from inspections
            HardBrakingCount = 0, // TODO: Get from telematics
            SpeedingCount = 0, // TODO: Get from telematics
            IdleTimeMinutes = 0, // TODO: Get from telematics
            MilesDriven = milesDriven
        };

        await _complianceRepository.AddSafetyScoreAsync(safetyScore);
        return safetyScore;
    }

    /// <summary>
    /// Calculate accident score (0-100, higher is better)
    /// </summary>
    private decimal CalculateAccidentScore(int accidentCount)
    {
        // No accidents = 100
        // 1 accident = 70
        // 2 accidents = 40
        // 3+ accidents = 0
        return accidentCount switch
        {
            0 => 100m,
            1 => 70m,
            2 => 40m,
            _ => 0m
        };
    }

    /// <summary>
    /// Calculate violation score (0-100, higher is better)
    /// </summary>
    private decimal CalculateViolationScore(int violationCount)
    {
        // No violations = 100
        // Deduct 15 points per violation
        var score = 100m - (violationCount * 15m);
        return Math.Max(0, score);
    }

    /// <summary>
    /// Calculate HOS compliance score (0-100, higher is better)
    /// </summary>
    private decimal CalculateHOSComplianceScore(List<HOSViolation> violations)
    {
        if (!violations.Any())
            return 100m;

        // Start at 100, deduct points based on severity
        var score = 100m;

        foreach (var violation in violations)
        {
            var deduction = violation.Severity switch
            {
                HOSViolationSeverity.Minor => 5m,
                HOSViolationSeverity.Moderate => 10m,
                HOSViolationSeverity.Serious => 20m,
                HOSViolationSeverity.Critical => 30m,
                _ => 0m
            };

            score -= deduction;
        }

        return Math.Max(0, score);
    }

    /// <summary>
    /// Calculate inspection score (0-100, higher is better)
    /// </summary>
    private decimal CalculateInspectionScore(int inspectionCount, int violationsFound)
    {
        if (inspectionCount == 0)
            return 85m; // Default score if no inspections

        // Perfect inspections = 100
        // Each violation found reduces score
        var violationRate = (decimal)violationsFound / inspectionCount;
        var score = 100m - (violationRate * 50m);

        return Math.Max(0, Math.Min(100, score));
    }

    /// <summary>
    /// Calculate driving behavior score based on telematics (0-100, higher is better)
    /// </summary>
    private decimal CalculateDrivingBehaviorScore(
        int hardBrakingCount,
        int speedingCount,
        int excessiveIdleMinutes)
    {
        var score = 100m;

        // Deduct for hard braking (aggressive driving)
        score -= hardBrakingCount * 2m;

        // Deduct for speeding events
        score -= speedingCount * 3m;

        // Deduct for excessive idling (1 point per 100 minutes)
        score -= (excessiveIdleMinutes / 100m);

        return Math.Max(0, score);
    }

    /// <summary>
    /// Get safety score trend for a driver
    /// </summary>
    public async Task<List<DriverSafetyScore>> GetSafetyScoreTrendAsync(
        Guid driverId,
        int months = 6)
    {
        var scores = await _complianceRepository.GetSafetyScoresByDriverIdAsync(driverId);
        var cutoffDate = DateTime.UtcNow.AddMonths(-months);

        return scores
            .Where(s => s.CalculatedDate >= cutoffDate)
            .OrderBy(s => s.CalculatedDate)
            .ToList();
    }

    /// <summary>
    /// Get top performing drivers by safety score
    /// </summary>
    public async Task<List<DriverSafetyScore>> GetTopSafetyPerformersAsync(int count = 10)
    {
        var allScores = await _complianceRepository.GetAllLatestSafetyScoresAsync();

        return allScores
            .OrderByDescending(s => s.OverallScore)
            .Take(count)
            .ToList();
    }

    /// <summary>
    /// Get drivers needing safety intervention (low scores)
    /// </summary>
    public async Task<List<DriverSafetyScore>> GetDriversNeedingInterventionAsync(
        decimal scoreThreshold = 60m)
    {
        var allScores = await _complianceRepository.GetAllLatestSafetyScoresAsync();

        return allScores
            .Where(s => s.OverallScore < scoreThreshold)
            .OrderBy(s => s.OverallScore)
            .ToList();
    }
}
