using System;
using System.Collections.Generic;

namespace TMS.Application.DTOs.Analytics;

/// <summary>
/// DTO for KPI dashboard metrics
/// </summary>
public class KPIDashboardResponse
{
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public KPIMetrics Metrics { get; set; } = new();
    public List<TrendDataPoint> RevenueTrend { get; set; } = new();
    public List<TrendDataPoint> OnTimeDeliveryTrend { get; set; } = new();
    public List<DriverPerformance> TopDrivers { get; set; } = new();
    public List<EquipmentUtilization> EquipmentStats { get; set; } = new();
}

/// <summary>
/// Core KPI metrics
/// </summary>
public class KPIMetrics
{
    // Delivery Performance
    public decimal OnTimeDeliveryPercentage { get; set; }
    public int TotalDeliveries { get; set; }
    public int OnTimeDeliveries { get; set; }
    public int LateDeliveries { get; set; }
    
    // Driver Metrics
    public decimal DriverUtilizationPercentage { get; set; }
    public int ActiveDrivers { get; set; }
    public int AvailableDrivers { get; set; }
    public decimal AverageHoursWorkedPerDriver { get; set; }
    
    // Equipment Metrics
    public decimal EquipmentUtilizationPercentage { get; set; }
    public int ActiveVehicles { get; set; }
    public int AvailableVehicles { get; set; }
    public decimal AverageLoadedMilesPerVehicle { get; set; }
    public decimal AverageEmptyMilesPerVehicle { get; set; }
    
    // Financial Metrics
    public decimal TotalRevenue { get; set; }
    public decimal RevenuePerMile { get; set; }
    public decimal AverageLoadRate { get; set; }
    public decimal TotalMilesDriven { get; set; }
    
    // Load Metrics
    public int TotalLoads { get; set; }
    public int CompletedLoads { get; set; }
    public int InProgressLoads { get; set; }
    public int CancelledLoads { get; set; }
    public decimal LoadAcceptanceRate { get; set; }
    
    // Safety Metrics
    public int SafetyIncidents { get; set; }
    public decimal IncidentRate { get; set; } // Incidents per 100,000 miles
}

/// <summary>
/// Trend data point for charts
/// </summary>
public class TrendDataPoint
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
    public string Label { get; set; } = string.Empty;
}

/// <summary>
/// Driver performance metrics
/// </summary>
public class DriverPerformance
{
    public Guid DriverId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public int CompletedLoads { get; set; }
    public decimal OnTimeDeliveryRate { get; set; }
    public decimal TotalMiles { get; set; }
    public decimal Revenue { get; set; }
    public decimal SafetyScore { get; set; }
    public decimal OverallScore { get; set; }
}

/// <summary>
/// Equipment utilization metrics
/// </summary>
public class EquipmentUtilization
{
    public Guid EquipmentId { get; set; }
    public string EquipmentNumber { get; set; } = string.Empty;
    public string EquipmentType { get; set; } = string.Empty;
    public decimal UtilizationPercentage { get; set; }
    public decimal LoadedMiles { get; set; }
    public decimal EmptyMiles { get; set; }
    public decimal TotalMiles { get; set; }
    public int TripsCompleted { get; set; }
    public decimal Revenue { get; set; }
    public decimal RevenuePerMile { get; set; }
}

/// <summary>
/// Request for analytics with date range
/// </summary>
public class AnalyticsRequest
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? TimeGrouping { get; set; } = "daily"; // daily, weekly, monthly
    public int? Count { get; set; } = 10; // For top N queries
    public List<string>? DriverIds { get; set; }
    public List<string>? EquipmentIds { get; set; }
}

/// <summary>
/// Revenue breakdown by category
/// </summary>
public class RevenueBreakdown
{
    public decimal TotalRevenue { get; set; }
    public decimal LineHaulRevenue { get; set; }
    public decimal FuelSurcharge { get; set; }
    public decimal AccessorialCharges { get; set; }
    public Dictionary<string, decimal> RevenueByCustomer { get; set; } = new();
    public Dictionary<string, decimal> RevenueByLane { get; set; } = new();
}

/// <summary>
/// Operational efficiency metrics
/// </summary>
public class OperationalEfficiency
{
    public decimal AverageLoadTime { get; set; } // Minutes
    public decimal AverageDeliveryTime { get; set; } // Hours
    public decimal AverageTurnAroundTime { get; set; } // Hours
    public decimal EmptyMilePercentage { get; set; }
    public decimal FuelEfficiencyMPG { get; set; }
    public decimal CostPerMile { get; set; }
}
