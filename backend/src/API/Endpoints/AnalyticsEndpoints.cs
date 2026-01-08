using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using TMS.Application.DTOs;
using TMS.Application.DTOs.Analytics;
using TMS.Application.Services;
using TMS.Domain.Common;

namespace TMS.API.Endpoints;

/// <summary>
/// Analytics and KPI endpoints
/// </summary>
public static class AnalyticsEndpoints
{
    public static void MapAnalyticsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/analytics")
            .WithTags("Analytics")
            .WithOpenApi();

        group.MapPost("/kpi-dashboard", GetKPIDashboard)
            .WithName("GetKPIDashboard")
            .WithSummary("Get comprehensive KPI dashboard with metrics, trends, and performance data");

        group.MapGet("/metrics/otd", GetOnTimeDeliveryPercentage)
            .WithName("GetOnTimeDeliveryPercentage")
            .WithSummary("Calculate on-time delivery percentage for date range");

        group.MapGet("/metrics/driver-utilization", GetDriverUtilization)
            .WithName("GetDriverUtilization")
            .WithSummary("Calculate driver utilization percentage");

        group.MapGet("/metrics/equipment-utilization", GetEquipmentUtilization)
            .WithName("GetEquipmentUtilization")
            .WithSummary("Calculate equipment utilization percentage");

        group.MapPost("/revenue/breakdown", GetRevenueBreakdown)
            .WithName("GetRevenueBreakdown")
            .WithSummary("Get revenue breakdown by category");

        group.MapPost("/drivers/top", GetTopDrivers)
            .WithName("GetTopDrivers")
            .WithSummary("Get top performing drivers");

        group.MapPost("/equipment/utilization", GetEquipmentUtilizationStats)
            .WithName("GetEquipmentUtilizationStats")
            .WithSummary("Get equipment utilization statistics");

        group.MapPost("/trends/revenue", GetRevenueTrend)
            .WithName("GetRevenueTrend")
            .WithSummary("Get revenue trend data over time");

        group.MapPost("/trends/otd", GetOnTimeDeliveryTrend)
            .WithName("GetOnTimeDeliveryTrend")
            .WithSummary("Get on-time delivery trend data over time");

        group.MapPost("/efficiency", GetOperationalEfficiency)
            .WithName("GetOperationalEfficiency")
            .WithSummary("Get operational efficiency metrics");
    }

    /// <summary>
    /// Get comprehensive KPI dashboard
    /// </summary>
    private static async Task<IResult> GetKPIDashboard(
        [FromBody] AnalyticsRequest request,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var dashboard = await analyticsService.GetKPIDashboardAsync(request);
            return Results.Ok(ApiResponse<KPIDashboardResponse>.CreateSuccess(dashboard));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<KPIDashboardResponse>.CreateFailure($"Failed to generate dashboard: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get on-time delivery percentage
    /// </summary>
    private static async Task<IResult> GetOnTimeDeliveryPercentage(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;

            var percentage = await analyticsService.CalculateOnTimeDeliveryPercentageAsync(start, end);
            return Results.Ok(ApiResponse<decimal>.CreateSuccess(percentage));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<decimal>.CreateFailure($"Failed to calculate OTD: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get driver utilization percentage
    /// </summary>
    private static async Task<IResult> GetDriverUtilization(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;

            var percentage = await analyticsService.CalculateDriverUtilizationAsync(start, end);
            return Results.Ok(ApiResponse<decimal>.CreateSuccess(percentage));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<decimal>.CreateFailure($"Failed to calculate driver utilization: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get equipment utilization percentage
    /// </summary>
    private static async Task<IResult> GetEquipmentUtilization(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;

            var percentage = await analyticsService.CalculateEquipmentUtilizationAsync(start, end);
            return Results.Ok(ApiResponse<decimal>.CreateSuccess(percentage));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<decimal>.CreateFailure($"Failed to calculate equipment utilization: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get revenue breakdown
    /// </summary>
    private static async Task<IResult> GetRevenueBreakdown(
        [FromBody] AnalyticsRequest request,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var breakdown = await analyticsService.GetRevenueBreakdownAsync(request.StartDate, request.EndDate);
            return Results.Ok(ApiResponse<RevenueBreakdown>.CreateSuccess(breakdown));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<RevenueBreakdown>.CreateFailure($"Failed to get revenue breakdown: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get top performing drivers
    /// </summary>
    private static async Task<IResult> GetTopDrivers(
        [FromBody] AnalyticsRequest request,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var count = request.Count ?? 10;
            var drivers = await analyticsService.GetTopDriversAsync(count, request.StartDate, request.EndDate);
            return Results.Ok(ApiResponse<List<DriverPerformance>>.CreateSuccess(drivers));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<List<DriverPerformance>>.CreateFailure($"Failed to get top drivers: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get equipment utilization stats
    /// </summary>
    private static async Task<IResult> GetEquipmentUtilizationStats(
        [FromBody] AnalyticsRequest request,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var stats = await analyticsService.GetEquipmentUtilizationStatsAsync(request.StartDate, request.EndDate);
            return Results.Ok(ApiResponse<List<EquipmentUtilization>>.CreateSuccess(stats));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<List<EquipmentUtilization>>.CreateFailure($"Failed to get equipment stats: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get revenue trend data
    /// </summary>
    private static async Task<IResult> GetRevenueTrend(
        [FromBody] AnalyticsRequest request,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var grouping = request.TimeGrouping ?? "daily";
            var trend = await analyticsService.GetRevenueTrendAsync(request.StartDate, request.EndDate, grouping);
            return Results.Ok(ApiResponse<List<TrendDataPoint>>.CreateSuccess(trend));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<List<TrendDataPoint>>.CreateFailure($"Failed to get revenue trend: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get on-time delivery trend data
    /// </summary>
    private static async Task<IResult> GetOnTimeDeliveryTrend(
        [FromBody] AnalyticsRequest request,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var grouping = request.TimeGrouping ?? "daily";
            var trend = await analyticsService.GetOnTimeDeliveryTrendAsync(request.StartDate, request.EndDate, grouping);
            return Results.Ok(ApiResponse<List<TrendDataPoint>>.CreateSuccess(trend));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<List<TrendDataPoint>>.CreateFailure($"Failed to get OTD trend: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get operational efficiency metrics
    /// </summary>
    private static async Task<IResult> GetOperationalEfficiency(
        [FromBody] AnalyticsRequest request,
        [FromServices] IAnalyticsService analyticsService)
    {
        try
        {
            var efficiency = await analyticsService.GetOperationalEfficiencyAsync(request.StartDate, request.EndDate);
            return Results.Ok(ApiResponse<OperationalEfficiency>.CreateSuccess(efficiency));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ApiResponse<OperationalEfficiency>.CreateFailure($"Failed to get efficiency metrics: {ex.Message}"));
        }
    }
}
