using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMS.Application.DTOs.Analytics;

namespace TMS.Application.Services;

/// <summary>
/// Service interface for analytics and KPI calculations
/// </summary>
public interface IAnalyticsService
{
    /// <summary>
    /// Get comprehensive KPI dashboard data
    /// </summary>
    Task<KPIDashboardResponse> GetKPIDashboardAsync(AnalyticsRequest request);
    
    /// <summary>
    /// Calculate on-time delivery percentage for date range
    /// </summary>
    Task<decimal> CalculateOnTimeDeliveryPercentageAsync(DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Calculate driver utilization metrics
    /// </summary>
    Task<decimal> CalculateDriverUtilizationAsync(DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Calculate equipment utilization metrics
    /// </summary>
    Task<decimal> CalculateEquipmentUtilizationAsync(DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Get revenue breakdown for period
    /// </summary>
    Task<RevenueBreakdown> GetRevenueBreakdownAsync(DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Get top performing drivers
    /// </summary>
    Task<List<DriverPerformance>> GetTopDriversAsync(int count, DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Get equipment utilization stats
    /// </summary>
    Task<List<EquipmentUtilization>> GetEquipmentUtilizationStatsAsync(DateTime startDate, DateTime endDate);
    
    /// <summary>
    /// Get trend data for revenue
    /// </summary>
    Task<List<TrendDataPoint>> GetRevenueTrendAsync(DateTime startDate, DateTime endDate, string grouping = "daily");
    
    /// <summary>
    /// Get trend data for on-time delivery
    /// </summary>
    Task<List<TrendDataPoint>> GetOnTimeDeliveryTrendAsync(DateTime startDate, DateTime endDate, string grouping = "daily");
    
    /// <summary>
    /// Get operational efficiency metrics
    /// </summary>
    Task<OperationalEfficiency> GetOperationalEfficiencyAsync(DateTime startDate, DateTime endDate);
}
