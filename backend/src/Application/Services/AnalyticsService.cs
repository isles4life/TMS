using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TMS.Application.DTOs.Analytics;
using TMS.Domain.Entities.Loads;
using TMS.Infrastructure.Persistence;

namespace TMS.Application.Services;

/// <summary>
/// Service for analytics and KPI calculations
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    private readonly ILogger<AnalyticsService> _logger;
    private readonly TMSDbContext _context;

    public AnalyticsService(ILogger<AnalyticsService> logger, TMSDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task<KPIDashboardResponse> GetKPIDashboardAsync(AnalyticsRequest request)
    {
        _logger.LogInformation("Generating KPI dashboard for {StartDate} to {EndDate}", 
            request.StartDate, request.EndDate);

        var response = new KPIDashboardResponse
        {
            GeneratedAt = DateTime.UtcNow,
            Metrics = await CalculateKPIMetricsAsync(request.StartDate, request.EndDate),
            RevenueTrend = await GetRevenueTrendAsync(request.StartDate, request.EndDate, request.TimeGrouping ?? "daily"),
            OnTimeDeliveryTrend = await GetOnTimeDeliveryTrendAsync(request.StartDate, request.EndDate, request.TimeGrouping ?? "daily"),
            TopDrivers = await GetTopDriversAsync(10, request.StartDate, request.EndDate),
            EquipmentStats = await GetEquipmentUtilizationStatsAsync(request.StartDate, request.EndDate)
        };

        return response;
    }

    private async Task<KPIMetrics> CalculateKPIMetricsAsync(DateTime startDate, DateTime endDate)
    {
        var loads = await _context.Loads
            .Include(l => l.ProofOfDelivery)
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync();

        var pods = loads.Where(l => l.ProofOfDelivery != null).Select(l => l.ProofOfDelivery!).ToList();
        var completedLoads = loads.Where(l => l.Status == LoadStatus.Completed).ToList();

        var drivers = await _context.DriverAvailabilities
            .Include(d => d.Driver)
            .ToListAsync();

        var equipment = await _context.PowerOnlyTractors.ToListAsync();

        // Calculate delivery performance
        var totalDeliveries = pods.Count;
        var onTimeDeliveries = pods.Count(p => p.IsOnTime == true);
        var lateDeliveries = totalDeliveries - onTimeDeliveries;
        var onTimePercentage = totalDeliveries > 0 ? (decimal)onTimeDeliveries / totalDeliveries * 100 : 0;

        // Calculate driver utilization
        var activeDrivers = drivers.Count(d => d.Status == Domain.Entities.Drivers.AvailabilityStatus.OnDuty);
        var availableDrivers = drivers.Count(d => d.Status == Domain.Entities.Drivers.AvailabilityStatus.Available);
        var avgHoursWorked = drivers.Any() ? drivers.Average(d => d.HoursWorkedToday) : 0;
        var driverUtilization = drivers.Any() ? (decimal)activeDrivers / drivers.Count * 100 : 0;

        // Calculate equipment utilization  
        var activeVehicles = equipment.Count(e => e.Status == Domain.Entities.Equipment.EquipmentStatus.Active);
        var availableVehicles = equipment.Count(e => e.Status == Domain.Entities.Equipment.EquipmentStatus.Active);
        var equipmentUtilization = equipment.Any() ? (decimal)activeVehicles / equipment.Count * 100 : 0;

        // Calculate financial metrics
        var totalRevenue = completedLoads.Sum(l => l.TotalRevenue);
        var totalMiles = 0m; // TODO: Calculate from trip mileage or route optimization data
        var revenuePerMile = totalMiles > 0 ? totalRevenue / totalMiles : 0;
        var avgLoadRate = completedLoads.Any() ? completedLoads.Average(l => l.TotalRevenue) : 0;

        // Calculate load metrics
        var totalLoads = loads.Count;
        var inProgressLoads = loads.Count(l => l.Status == LoadStatus.InTransit || l.Status == LoadStatus.DriverEnRoute);
        var cancelledLoads = loads.Count(l => l.Status == LoadStatus.Cancelled);

        return new KPIMetrics
        {
            // Delivery Performance
            OnTimeDeliveryPercentage = Math.Round(onTimePercentage, 2),
            TotalDeliveries = totalDeliveries,
            OnTimeDeliveries = onTimeDeliveries,
            LateDeliveries = lateDeliveries,

            // Driver Metrics
            DriverUtilizationPercentage = Math.Round(driverUtilization, 2),
            ActiveDrivers = activeDrivers,
            AvailableDrivers = availableDrivers,
            AverageHoursWorkedPerDriver = Math.Round(avgHoursWorked, 2),

            // Equipment Metrics
            EquipmentUtilizationPercentage = Math.Round(equipmentUtilization, 2),
            ActiveVehicles = activeVehicles,
            AvailableVehicles = availableVehicles,
            AverageLoadedMilesPerVehicle = totalMiles > 0 && equipment.Any() ? Math.Round((decimal)totalMiles / equipment.Count, 2) : 0,
            AverageEmptyMilesPerVehicle = 0, // TODO: Calculate from location tracking

            // Financial Metrics
            TotalRevenue = Math.Round(totalRevenue, 2),
            RevenuePerMile = Math.Round(revenuePerMile, 2),
            AverageLoadRate = Math.Round(avgLoadRate, 2),
            TotalMilesDriven = Math.Round((decimal)totalMiles, 2),

            // Load Metrics
            TotalLoads = totalLoads,
            CompletedLoads = completedLoads.Count,
            InProgressLoads = inProgressLoads,
            CancelledLoads = cancelledLoads,
            LoadAcceptanceRate = 95.0m, // TODO: Calculate from dispatch data

            // Safety Metrics
            SafetyIncidents = 0, // TODO: Implement safety incident tracking
            IncidentRate = 0
        };
    }

    public async Task<decimal> CalculateOnTimeDeliveryPercentageAsync(DateTime startDate, DateTime endDate)
    {
        var pods = await _context.ProofsOfDelivery
            .Where(p => p.CreatedAt >= startDate && p.CreatedAt <= endDate)
            .ToListAsync();

        if (pods.Count == 0) return 0;

        var onTimeCount = pods.Count(p => p.IsOnTime == true);
        return Math.Round((decimal)onTimeCount / pods.Count * 100, 2);
    }

    public async Task<decimal> CalculateDriverUtilizationAsync(DateTime startDate, DateTime endDate)
    {
        var drivers = await _context.DriverAvailabilities.ToListAsync();
        if (drivers.Count == 0) return 0;

        var activeDrivers = drivers.Count(d => d.Status == Domain.Entities.Drivers.AvailabilityStatus.OnDuty);
        return Math.Round((decimal)activeDrivers / drivers.Count * 100, 2);
    }

    public async Task<decimal> CalculateEquipmentUtilizationAsync(DateTime startDate, DateTime endDate)
    {
        var equipment = await _context.PowerOnlyTractors.ToListAsync();
        if (equipment.Count == 0) return 0;

        var activeEquipment = equipment.Count(e => e.Status == Domain.Entities.Equipment.EquipmentStatus.Active);
        return Math.Round((decimal)activeEquipment / equipment.Count * 100, 2);
    }

    public async Task<RevenueBreakdown> GetRevenueBreakdownAsync(DateTime startDate, DateTime endDate)
    {
        var loads = await _context.Loads
            .Where(l => l.Status == LoadStatus.Completed)
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync();

        var totalRevenue = loads.Sum(l => l.TotalRevenue);

        return new RevenueBreakdown
        {
            TotalRevenue = Math.Round(totalRevenue, 2),
            LineHaulRevenue = Math.Round(loads.Sum(l => l.BaseRate), 2),
            FuelSurcharge = Math.Round(loads.Sum(l => l.FuelSurcharge), 2),
            AccessorialCharges = Math.Round(loads.Sum(l => l.AccessorialCharges), 2),
            RevenueByCustomer = new Dictionary<string, decimal>(),
            RevenueByLane = new Dictionary<string, decimal>()
        };
    }

    public async Task<List<DriverPerformance>> GetTopDriversAsync(int count, DateTime startDate, DateTime endDate)
    {
        var dispatches = await _context.Dispatches
            .Include(d => d.Driver)
            .Include(d => d.Load)
            .ThenInclude(l => l!.ProofOfDelivery)
            .Where(d => d.AssignedAt >= startDate && d.AssignedAt <= endDate)
            .Where(d => d.Status == Domain.Entities.Loads.DispatchStatus.Completed)
            .ToListAsync();

        var driverGroups = dispatches
            .GroupBy(d => d.DriverId)
            .Select(g => new DriverPerformance
            {
                DriverId = g.Key,
                DriverName = g.First().Driver != null ? $"{g.First().Driver.FirstName} {g.First().Driver.LastName}" : "Unknown",
                CompletedLoads = g.Count(),
                OnTimeDeliveryRate = g.Count(d => d.Load?.ProofOfDelivery?.IsOnTime == true) > 0 
                    ? Math.Round((decimal)g.Count(d => d.Load?.ProofOfDelivery?.IsOnTime == true) / g.Count() * 100, 2) 
                    : 0,
                TotalMiles = 0m, // TODO: Calculate from trip data
                Revenue = Math.Round(g.Sum(d => d.Load?.TotalRevenue ?? 0), 2),
                SafetyScore = 95.0m, // TODO: Calculate from safety incidents
                OverallScore = 0
            })
            .ToList();

        // Calculate overall score
        foreach (var driver in driverGroups)
        {
            driver.OverallScore = (driver.OnTimeDeliveryRate * 0.4m) + 
                                  (driver.SafetyScore * 0.3m) + 
                                  (Math.Min(driver.CompletedLoads * 2, 100) * 0.3m);
        }

        return driverGroups.OrderByDescending(d => d.OverallScore).Take(count).ToList();
    }

    public async Task<List<EquipmentUtilization>> GetEquipmentUtilizationStatsAsync(DateTime startDate, DateTime endDate)
    {
        var dispatches = await _context.Dispatches
            .Include(d => d.Tractor)
            .Include(d => d.Load)
            .Where(d => d.AssignedAt >= startDate && d.AssignedAt <= endDate)
            .Where(d => d.TractorId != null)
            .ToListAsync();

        var equipmentGroups = dispatches
            .GroupBy(d => d.TractorId!.Value)
            .Select(g => new
            {
                EquipmentId = g.Key,
                Tractor = g.First().Tractor,
                Loads = g.ToList()
            })
            .ToList();

        var results = new List<EquipmentUtilization>();

        foreach (var group in equipmentGroups)
        {
            var totalMiles = 0m; // TODO: Calculate from trip data
            var loadedMiles = totalMiles * 0.75m; // Estimate 75% loaded
            var emptyMiles = totalMiles * 0.25m;
            var revenue = group.Loads.Sum(d => d.Load?.TotalRevenue ?? 0);

            results.Add(new EquipmentUtilization
            {
                EquipmentId = group.EquipmentId,
                EquipmentNumber = group.Tractor?.UnitNumber ?? "Unknown",
                EquipmentType = "Tractor",
                UtilizationPercentage = 75.0m, // TODO: Calculate actual utilization
                LoadedMiles = Math.Round(loadedMiles, 2),
                EmptyMiles = Math.Round(emptyMiles, 2),
                TotalMiles = Math.Round(totalMiles, 2),
                TripsCompleted = group.Loads.Count,
                Revenue = Math.Round(revenue, 2),
                RevenuePerMile = totalMiles > 0 ? Math.Round(revenue / totalMiles, 2) : 0
            });
        }

        return results.OrderByDescending(e => e.Revenue).ToList();
    }

    public async Task<List<TrendDataPoint>> GetRevenueTrendAsync(DateTime startDate, DateTime endDate, string grouping = "daily")
    {
        var loads = await _context.Loads
            .Where(l => l.Status == LoadStatus.Completed)
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync();

        var trendData = new List<TrendDataPoint>();

        switch (grouping.ToLower())
        {
            case "daily":
                trendData = loads
                    .GroupBy(l => l.CreatedAt.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new TrendDataPoint
                    {
                        Date = g.Key,
                        Value = Math.Round(g.Sum(l => l.TotalRevenue), 2),
                        Label = g.Key.ToString("MMM dd")
                    })
                    .ToList();
                break;

            case "weekly":
                trendData = loads
                    .GroupBy(l => GetWeekStart(l.CreatedAt))
                    .OrderBy(g => g.Key)
                    .Select(g => new TrendDataPoint
                    {
                        Date = g.Key,
                        Value = Math.Round(g.Sum(l => l.TotalRevenue), 2),
                        Label = $"Week of {g.Key:MMM dd}"
                    })
                    .ToList();
                break;

            case "monthly":
                trendData = loads
                    .GroupBy(l => new DateTime(l.CreatedAt.Year, l.CreatedAt.Month, 1))
                    .OrderBy(g => g.Key)
                    .Select(g => new TrendDataPoint
                    {
                        Date = g.Key,
                        Value = Math.Round(g.Sum(l => l.TotalRevenue), 2),
                        Label = g.Key.ToString("MMM yyyy")
                    })
                    .ToList();
                break;
        }

        return trendData;
    }

    public async Task<List<TrendDataPoint>> GetOnTimeDeliveryTrendAsync(DateTime startDate, DateTime endDate, string grouping = "daily")
    {
        var pods = await _context.ProofsOfDelivery
            .Where(p => p.CreatedAt >= startDate && p.CreatedAt <= endDate)
            .ToListAsync();

        var trendData = new List<TrendDataPoint>();

        switch (grouping.ToLower())
        {
            case "daily":
                trendData = pods
                    .GroupBy(p => p.CreatedAt.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new TrendDataPoint
                    {
                        Date = g.Key,
                        Value = g.Any() ? Math.Round((decimal)g.Count(p => p.IsOnTime == true) / g.Count() * 100, 2) : 0,
                        Label = g.Key.ToString("MMM dd")
                    })
                    .ToList();
                break;

            case "weekly":
                trendData = pods
                    .GroupBy(p => GetWeekStart(p.CreatedAt))
                    .OrderBy(g => g.Key)
                    .Select(g => new TrendDataPoint
                    {
                        Date = g.Key,
                        Value = g.Any() ? Math.Round((decimal)g.Count(p => p.IsOnTime == true) / g.Count() * 100, 2) : 0,
                        Label = $"Week of {g.Key:MMM dd}"
                    })
                    .ToList();
                break;

            case "monthly":
                trendData = pods
                    .GroupBy(p => new DateTime(p.CreatedAt.Year, p.CreatedAt.Month, 1))
                    .OrderBy(g => g.Key)
                    .Select(g => new TrendDataPoint
                    {
                        Date = g.Key,
                        Value = g.Any() ? Math.Round((decimal)g.Count(p => p.IsOnTime == true) / g.Count() * 100, 2) : 0,
                        Label = g.Key.ToString("MMM yyyy")
                    })
                    .ToList();
                break;
        }

        return trendData;
    }

    public async Task<OperationalEfficiency> GetOperationalEfficiencyAsync(DateTime startDate, DateTime endDate)
    {
        var loads = await _context.Loads
            .Include(l => l.ProofOfDelivery)
            .Where(l => l.Status == LoadStatus.Completed)
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .ToListAsync();

        var completedWithPOD = loads.Where(l => l.ProofOfDelivery != null).ToList();

        // Calculate average delivery time
        var avgDeliveryTime = completedWithPOD.Any() 
            ? completedWithPOD
                .Where(l => l.ProofOfDelivery!.DeliveryDateTime.HasValue)
                .Average(l => (l.ProofOfDelivery!.DeliveryDateTime!.Value - l.CreatedAt).TotalHours)
            : 0;

        return new OperationalEfficiency
        {
            AverageLoadTime = 45.0m, // TODO: Calculate from tracking data
            AverageDeliveryTime = Math.Round((decimal)avgDeliveryTime, 2),
            AverageTurnAroundTime = Math.Round((decimal)avgDeliveryTime + 2.0m, 2),
            EmptyMilePercentage = 25.0m, // TODO: Calculate from tracking data
            FuelEfficiencyMPG = 6.5m, // Industry average for trucks
            CostPerMile = 1.75m // TODO: Calculate from cost data
        };
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-1 * diff).Date;
    }
}
