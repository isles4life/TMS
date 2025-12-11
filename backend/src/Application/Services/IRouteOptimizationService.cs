namespace TMS.Application.Services;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMS.Application.DTOs;

/// <summary>
/// Service interface for route optimization and distance calculations
/// </summary>
public interface IRouteOptimizationService
{
    /// <summary>
    /// Calculate optimized route between two points
    /// </summary>
    Task<RouteResponse> CalculateRouteAsync(RouteRequest request);
    
    /// <summary>
    /// Calculate distance and duration between two coordinates
    /// </summary>
    Task<RouteDistance> GetDistanceAndDurationAsync(
        double originLat, 
        double originLng, 
        double destLat, 
        double destLng,
        string vehicleType = "truck");
    
    /// <summary>
    /// Get optimized multi-stop route
    /// </summary>
    Task<MultiStopRouteResponse> CalculateMultiStopRouteAsync(MultiStopRouteRequest request);
    
    /// <summary>
    /// Calculate ETA based on current traffic conditions
    /// </summary>
    Task<DateTime> CalculateETAAsync(
        double originLat, 
        double originLng, 
        double destLat, 
        double destLng,
        DateTime departureTime);
    
    /// <summary>
    /// Get alternative routes with different optimization criteria
    /// </summary>
    Task<List<RouteResponse>> GetAlternativeRoutesAsync(
        RouteRequest request,
        int maxAlternatives = 3);
    
    /// <summary>
    /// Calculate fuel cost estimate for route
    /// </summary>
    Task<FuelCostEstimate> CalculateFuelCostAsync(
        double distanceMiles,
        string vehicleType,
        decimal fuelPricePerGallon);

    /// <summary>
    /// Lookup fuel price by zip code
    /// </summary>
    Task<FuelPriceInfo> GetFuelPriceByZipAsync(string zipCode, string fuelType = "diesel");
}
