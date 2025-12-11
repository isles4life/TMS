namespace TMS.API.Endpoints;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Threading.Tasks;
using TMS.Application.DTOs;
using TMS.Application.Services;

public static class RouteEndpoints
{
    public static void RegisterRouteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/routes")
            .WithTags("Route Optimization")
            .WithOpenApi();

        group.MapPost("/calculate", CalculateRoute)
            .WithName("CalculateRoute")
            .WithDescription("Calculate optimized route between two points");

        group.MapGet("/distance", GetDistance)
            .WithName("GetDistance")
            .WithDescription("Get distance and duration between two coordinates");

        group.MapGet("/eta", GetETA)
            .WithName("GetETA")
            .WithDescription("Calculate estimated time of arrival");

        group.MapPost("/multi-stop", CalculateMultiStopRoute)
            .WithName("CalculateMultiStopRoute")
            .WithDescription("Calculate optimized multi-stop route");

        group.MapPost("/alternatives", GetAlternativeRoutes)
            .WithName("GetAlternativeRoutes")
            .WithDescription("Get alternative routes with different optimization criteria");

        group.MapGet("/fuel-cost", CalculateFuelCost)
            .WithName("CalculateFuelCost")
            .WithDescription("Calculate estimated fuel cost for a route");

        group.MapGet("/fuel-price", GetFuelPriceByZip)
            .WithName("GetFuelPriceByZip")
            .WithDescription("Lookup fuel price per gallon by zip code");
    }

    private static async Task<IResult> CalculateRoute(
        RouteRequest request,
        IRouteOptimizationService routeService)
    {
        try
        {
            var route = await routeService.CalculateRouteAsync(request);
            return Results.Ok(new { success = true, data = route });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetDistance(
        double originLat,
        double originLng,
        double destLat,
        double destLng,
        string vehicleType,
        IRouteOptimizationService routeService)
    {
        try
        {
            var distance = await routeService.GetDistanceAndDurationAsync(
                originLat, originLng, destLat, destLng, vehicleType);
            
            return Results.Ok(new { success = true, data = distance });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetETA(
        double originLat,
        double originLng,
        double destLat,
        double destLng,
        DateTime departureTime,
        IRouteOptimizationService routeService)
    {
        try
        {
            var eta = await routeService.CalculateETAAsync(
                originLat, originLng, destLat, destLng, departureTime);
            
            return Results.Ok(new { 
                success = true, 
                data = new { 
                    estimatedArrivalTime = eta,
                    departureTime = departureTime,
                    travelTimeMinutes = (int)(eta - departureTime).TotalMinutes
                }
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> CalculateMultiStopRoute(
        MultiStopRouteRequest request,
        IRouteOptimizationService routeService)
    {
        try
        {
            var route = await routeService.CalculateMultiStopRouteAsync(request);
            return Results.Ok(new { success = true, data = route });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetAlternativeRoutes(
        RouteRequest request,
        int maxAlternatives,
        IRouteOptimizationService routeService)
    {
        try
        {
            var routes = await routeService.GetAlternativeRoutesAsync(request, maxAlternatives);
            return Results.Ok(new { success = true, data = routes });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> CalculateFuelCost(
        double distanceMiles,
        string vehicleType,
        decimal fuelPricePerGallon,
        IRouteOptimizationService routeService)
    {
        try
        {
            var fuelCost = await routeService.CalculateFuelCostAsync(
                distanceMiles, vehicleType, fuelPricePerGallon);
            
            return Results.Ok(new { success = true, data = fuelCost });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }

    private static async Task<IResult> GetFuelPriceByZip(
        string zipCode,
        string? fuelType,
        IRouteOptimizationService routeService)
    {
        try
        {
            var priceInfo = await routeService.GetFuelPriceByZipAsync(zipCode, fuelType ?? "diesel");
            return Results.Ok(new { success = true, data = priceInfo });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { success = false, error = ex.Message });
        }
    }
}
