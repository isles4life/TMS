namespace TMS.Application.Services.Compliance;

using System;
using System.Collections.Generic;
using System.Linq;
using TMS.Domain.Entities.Compliance;

/// <summary>
/// HOS (Hours of Service) rules engine implementing FMCSA regulations (49 CFR Part 395)
/// </summary>
public class HOSRulesEngine
{
    // FMCSA HOS Limits
    private const decimal MAX_DRIVING_HOURS_PER_DAY = 11m;
    private const decimal MAX_ON_DUTY_HOURS_PER_DAY = 14m;
    private const decimal MAX_WEEKLY_HOURS_7_DAY = 60m;
    private const decimal MAX_WEEKLY_HOURS_8_DAY = 70m;
    private const decimal REQUIRED_REST_HOURS = 10m;
    private const decimal REQUIRED_BREAK_MINUTES = 30m;
    private const decimal HOURS_BEFORE_BREAK_REQUIRED = 8m;
    
    /// <summary>
    /// Calculate HOS summary for a driver based on their recent logs
    /// </summary>
    public HOSSummary CalculateHOSSummary(Guid driverId, string driverName, List<HOSLog> recentLogs)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var currentLog = recentLogs.FirstOrDefault(l => !l.EndTime.HasValue);
        
        // Calculate today's hours
        var todaysLogs = recentLogs.Where(l => l.StartTime.Date == todayStart).ToList();
        var hoursDrivenToday = CalculateTotalHours(todaysLogs, HOSStatus.Driving);
        var hoursOnDutyToday = CalculateTotalOnDutyHours(todaysLogs);
        
        // Calculate current duty day hours (since last 10-hour rest)
        var dutyDayLogs = GetLogsSinceLastRest(recentLogs, REQUIRED_REST_HOURS);
        var hoursDrivenDutyDay = CalculateTotalHours(dutyDayLogs, HOSStatus.Driving);
        var hoursOnDutyDutyDay = CalculateTotalOnDutyHours(dutyDayLogs);
        
        // Calculate cycle hours (7 or 8 days)
        var cycleLogs = recentLogs.Where(l => l.StartTime >= now.AddDays(-8)).ToList();
        var hoursInCycle = CalculateTotalOnDutyHours(cycleLogs);
        
        // Time since last break
        var timeUntilBreakRequired = CalculateTimeUntilBreakRequired(dutyDayLogs);
        var lastRestPeriod = FindLastRestPeriod(recentLogs, REQUIRED_REST_HOURS);
        
        // Detect violations
        var violations = DetectViolations(driverId, recentLogs);
        
        return new HOSSummary
        {
            DriverId = driverId,
            DriverName = driverName,
            CalculatedAt = now,
            CurrentStatus = currentLog?.Status ?? HOSStatus.OffDuty,
            CurrentStatusSince = currentLog?.StartTime ?? now,
            
            HoursDrivenToday = Math.Round(hoursDrivenDutyDay, 2),
            HoursAvailableDrive = Math.Max(0, MAX_DRIVING_HOURS_PER_DAY - hoursDrivenDutyDay),
            
            HoursOnDutyToday = Math.Round(hoursOnDutyDutyDay, 2),
            HoursAvailableOnDuty = Math.Max(0, MAX_ON_DUTY_HOURS_PER_DAY - hoursOnDutyDutyDay),
            
            HoursInCycle = Math.Round(hoursInCycle, 2),
            HoursAvailableCycle = Math.Max(0, MAX_WEEKLY_HOURS_7_DAY - hoursInCycle),
            
            TimeUntilBreakRequired = timeUntilBreakRequired,
            LastRestPeriod = lastRestPeriod,
            
            IsInViolation = violations.Any(),
            ActiveViolations = violations.Select(v => v.Description).ToList()
        };
    }
    
    /// <summary>
    /// Detect HOS violations in driver's logs
    /// </summary>
    public List<HOSViolation> DetectViolations(Guid driverId, List<HOSLog> logs)
    {
        var violations = new List<HOSViolation>();
        var now = DateTime.UtcNow;
        
        // Get logs since last rest period for duty day calculations
        var dutyDayLogs = GetLogsSinceLastRest(logs, REQUIRED_REST_HOURS);
        
        // Check 11-hour driving limit
        var drivingHours = CalculateTotalHours(dutyDayLogs, HOSStatus.Driving);
        if (drivingHours > MAX_DRIVING_HOURS_PER_DAY)
        {
            violations.Add(new HOSViolation
            {
                DriverId = driverId,
                ViolationDateTime = now,
                ViolationType = HOSViolationType.DrivingLimit11Hour,
                Severity = HOSViolationSeverity.Serious,
                Description = $"Exceeded 11-hour driving limit. Drove {drivingHours:F2} hours.",
                ActualValue = drivingHours,
                LimitValue = MAX_DRIVING_HOURS_PER_DAY
            });
        }
        
        // Check 14-hour on-duty limit
        var onDutyHours = CalculateTotalOnDutyHours(dutyDayLogs);
        if (onDutyHours > MAX_ON_DUTY_HOURS_PER_DAY)
        {
            violations.Add(new HOSViolation
            {
                DriverId = driverId,
                ViolationDateTime = now,
                ViolationType = HOSViolationType.OnDutyLimit14Hour,
                Severity = HOSViolationSeverity.Serious,
                Description = $"Exceeded 14-hour on-duty limit. On duty {onDutyHours:F2} hours.",
                ActualValue = onDutyHours,
                LimitValue = MAX_ON_DUTY_HOURS_PER_DAY
            });
        }
        
        // Check 60/70-hour weekly limit
        var cycleLogs = logs.Where(l => l.StartTime >= now.AddDays(-7)).ToList();
        var weeklyHours = CalculateTotalOnDutyHours(cycleLogs);
        if (weeklyHours > MAX_WEEKLY_HOURS_7_DAY)
        {
            violations.Add(new HOSViolation
            {
                DriverId = driverId,
                ViolationDateTime = now,
                ViolationType = HOSViolationType.WeeklyLimit60Hour,
                Severity = HOSViolationSeverity.Critical,
                Description = $"Exceeded 60-hour/7-day limit. Worked {weeklyHours:F2} hours.",
                ActualValue = weeklyHours,
                LimitValue = MAX_WEEKLY_HOURS_7_DAY
            });
        }
        
        // Check 8-hour break requirement
        var hoursWithoutBreak = CalculateHoursSinceLastBreak(dutyDayLogs);
        if (hoursWithoutBreak > HOURS_BEFORE_BREAK_REQUIRED)
        {
            var currentlyDriving = dutyDayLogs.LastOrDefault()?.Status == HOSStatus.Driving;
            if (currentlyDriving)
            {
                violations.Add(new HOSViolation
                {
                    DriverId = driverId,
                    ViolationDateTime = now,
                    ViolationType = HOSViolationType.BreakAfter8Hours,
                    Severity = HOSViolationSeverity.Moderate,
                    Description = $"Driving after {hoursWithoutBreak:F2} hours without 30-minute break.",
                    ActualValue = hoursWithoutBreak,
                    LimitValue = HOURS_BEFORE_BREAK_REQUIRED
                });
            }
        }
        
        // Check for missing 10-hour rest period
        var timeSinceLastRest = GetTimeSinceLastRest(logs, REQUIRED_REST_HOURS);
        if (timeSinceLastRest > TimeSpan.FromHours((double)MAX_ON_DUTY_HOURS_PER_DAY))
        {
            violations.Add(new HOSViolation
            {
                DriverId = driverId,
                ViolationDateTime = now,
                ViolationType = HOSViolationType.RequiredRest10Hour,
                Severity = HOSViolationSeverity.Critical,
                Description = $"No 10-hour rest period in last {timeSinceLastRest.TotalHours:F1} hours.",
                ActualValue = 0,
                LimitValue = REQUIRED_REST_HOURS
            });
        }
        
        return violations;
    }
    
    /// <summary>
    /// Validate if a driver can start driving
    /// </summary>
    public (bool CanDrive, string? Reason) CanDriverDrive(Guid driverId, List<HOSLog> logs)
    {
        var violations = DetectViolations(driverId, logs);
        
        if (violations.Any(v => v.Severity >= HOSViolationSeverity.Serious))
        {
            var reason = violations.First(v => v.Severity >= HOSViolationSeverity.Serious).Description;
            return (false, reason);
        }
        
        var summary = CalculateHOSSummary(driverId, string.Empty, logs);
        
        if (summary.HoursAvailableDrive <= 0)
            return (false, "No available driving hours (11-hour limit reached)");
        
        if (summary.HoursAvailableOnDuty <= 0)
            return (false, "No available on-duty hours (14-hour limit reached)");
        
        if (summary.HoursAvailableCycle <= 0)
            return (false, "No available hours in cycle (60/70-hour limit reached)");
        
        return (true, null);
    }
    
    /// <summary>
    /// Calculate total hours for specific status
    /// </summary>
    private decimal CalculateTotalHours(List<HOSLog> logs, HOSStatus status)
    {
        var totalMinutes = logs
            .Where(l => l.Status == status && l.EndTime.HasValue)
            .Sum(l => l.DurationMinutes);
        
        return (decimal)totalMinutes / 60m;
    }
    
    /// <summary>
    /// Calculate total on-duty hours (Driving + OnDutyNotDriving)
    /// </summary>
    private decimal CalculateTotalOnDutyHours(List<HOSLog> logs)
    {
        var totalMinutes = logs
            .Where(l => (l.Status == HOSStatus.Driving || l.Status == HOSStatus.OnDutyNotDriving) 
                       && l.EndTime.HasValue)
            .Sum(l => l.DurationMinutes);
        
        return (decimal)totalMinutes / 60m;
    }
    
    /// <summary>
    /// Get logs since last qualifying rest period
    /// </summary>
    private List<HOSLog> GetLogsSinceLastRest(List<HOSLog> logs, decimal requiredRestHours)
    {
        var orderedLogs = logs.OrderByDescending(l => l.StartTime).ToList();
        var logsSinceRest = new List<HOSLog>();
        
        foreach (var log in orderedLogs)
        {
            logsSinceRest.Insert(0, log);
            
            // Check if this is a qualifying rest period
            if ((log.Status == HOSStatus.OffDuty || log.Status == HOSStatus.SleeperBerth) 
                && log.EndTime.HasValue)
            {
                var restHours = (decimal)log.DurationMinutes / 60m;
                if (restHours >= requiredRestHours)
                {
                    break;
                }
            }
        }
        
        return logsSinceRest;
    }
    
    /// <summary>
    /// Calculate hours driven since last 30-minute break
    /// </summary>
    private decimal CalculateHoursSinceLastBreak(List<HOSLog> logs)
    {
        var orderedLogs = logs.OrderByDescending(l => l.StartTime).ToList();
        var hoursSinceBreak = 0m;
        
        foreach (var log in orderedLogs)
        {
            if ((log.Status == HOSStatus.OffDuty || log.Status == HOSStatus.SleeperBerth) 
                && log.EndTime.HasValue)
            {
                var breakMinutes = log.DurationMinutes;
                if (breakMinutes >= REQUIRED_BREAK_MINUTES)
                {
                    break;
                }
            }
            
            if (log.Status == HOSStatus.Driving && log.EndTime.HasValue)
            {
                hoursSinceBreak += (decimal)log.DurationMinutes / 60m;
            }
        }
        
        return hoursSinceBreak;
    }
    
    /// <summary>
    /// Calculate time until 30-minute break is required
    /// </summary>
    private TimeSpan? CalculateTimeUntilBreakRequired(List<HOSLog> logs)
    {
        var hoursSinceBreak = CalculateHoursSinceLastBreak(logs);
        
        if (hoursSinceBreak >= HOURS_BEFORE_BREAK_REQUIRED)
        {
            return TimeSpan.Zero;
        }
        
        var hoursRemaining = HOURS_BEFORE_BREAK_REQUIRED - hoursSinceBreak;
        return TimeSpan.FromHours((double)hoursRemaining);
    }
    
    /// <summary>
    /// Find last qualifying rest period
    /// </summary>
    private DateTime? FindLastRestPeriod(List<HOSLog> logs, decimal requiredRestHours)
    {
        var restLog = logs
            .Where(l => (l.Status == HOSStatus.OffDuty || l.Status == HOSStatus.SleeperBerth) 
                       && l.EndTime.HasValue
                       && (decimal)l.DurationMinutes / 60m >= requiredRestHours)
            .OrderByDescending(l => l.EndTime)
            .FirstOrDefault();
        
        return restLog?.EndTime;
    }
    
    /// <summary>
    /// Get time since last qualifying rest period
    /// </summary>
    private TimeSpan GetTimeSinceLastRest(List<HOSLog> logs, decimal requiredRestHours)
    {
        var lastRest = FindLastRestPeriod(logs, requiredRestHours);
        
        if (!lastRest.HasValue)
        {
            return TimeSpan.MaxValue;
        }
        
        return DateTime.UtcNow - lastRest.Value;
    }
}
