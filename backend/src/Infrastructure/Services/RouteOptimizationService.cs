namespace TMS.Infrastructure.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TMS.Application.DTOs;
using TMS.Application.Services;

/// <summary>
/// Route optimization service with HERE Maps API integration
/// Falls back to Haversine calculations when API is unavailable
/// </summary>
public class RouteOptimizationService : IRouteOptimizationService
{
    private readonly ILogger<RouteOptimizationService> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string? _hereApiKey;
    private const double EARTH_RADIUS_MILES = 3959.0;
    
    // Average MPG by vehicle type
    private readonly Dictionary<string, double> _vehicleMpg = new()
    {
        { "truck", 6.5 },      // Class 8 tractor
        { "van", 14.0 },       // Cargo van
        { "car", 25.0 }        // Standard car
    };

    public RouteOptimizationService(
        ILogger<RouteOptimizationService> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        _hereApiKey = configuration["HereMaps:ApiKey"];
        
        if (string.IsNullOrEmpty(_hereApiKey))
        {
            _logger.LogWarning("HERE Maps API key not configured. Using fallback calculations.");
        }
    }

    public async Task<RouteResponse> CalculateRouteAsync(RouteRequest request)
    {
        _logger.LogInformation(
            "Calculating route from ({OriginLat}, {OriginLng}) to ({DestLat}, {DestLng})",
            request.OriginLatitude, request.OriginLongitude,
            request.DestinationLatitude, request.DestinationLongitude);

        // Try HERE Maps API first if configured
        if (!string.IsNullOrEmpty(_hereApiKey))
        {
            try
            {
                return await CalculateRouteViaHereAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "HERE Maps API call failed, falling back to Haversine calculation");
            }
        }

        // Fallback to Haversine calculation
        return CalculateRouteFallback(request);
    }

    public async Task<RouteDistance> GetDistanceAndDurationAsync(
        double originLat, 
        double originLng, 
        double destLat, 
        double destLng,
        string vehicleType = "truck")
    {
        var request = new RouteRequest
        {
            OriginLatitude = originLat,
            OriginLongitude = originLng,
            DestinationLatitude = destLat,
            DestinationLongitude = destLng,
            VehicleType = vehicleType
        };

        var route = await CalculateRouteAsync(request);
        
        return new RouteDistance
        {
            DistanceMiles = route.DistanceMiles,
            DistanceKilometers = route.DistanceKilometers,
            DurationMinutes = route.DurationMinutes,
            TrafficDelayMinutes = route.TrafficDelayMinutes
        };
    }

    public async Task<DateTime> CalculateETAAsync(
        double originLat, 
        double originLng, 
        double destLat, 
        double destLng,
        DateTime departureTime)
    {
        var request = new RouteRequest
        {
            OriginLatitude = originLat,
            OriginLongitude = originLng,
            DestinationLatitude = destLat,
            DestinationLongitude = destLng,
            DepartureTime = departureTime
        };

        var route = await CalculateRouteAsync(request);
        return departureTime.AddMinutes(route.DurationMinutes);
    }

    public async Task<MultiStopRouteResponse> CalculateMultiStopRouteAsync(MultiStopRouteRequest request)
    {
        _logger.LogInformation("Calculating multi-stop route with {WaypointCount} waypoints", 
            request.Waypoints.Count);

        var response = new MultiStopRouteResponse
        {
            OptimizedOrder = request.OptimizeWaypointOrder 
                ? OptimizeWaypointOrder(request.Waypoints)
                : request.Waypoints
        };

        var departureTime = request.DepartureTime ?? DateTime.UtcNow;
        var totalDistance = 0.0;
        var totalDuration = 0;
        var totalFuelCost = 0m;

        // Calculate route between each consecutive pair of waypoints
        for (int i = 0; i < response.OptimizedOrder.Count - 1; i++)
        {
            var origin = response.OptimizedOrder[i];
            var destination = response.OptimizedOrder[i + 1];

            var legRequest = new RouteRequest
            {
                OriginLatitude = origin.Latitude,
                OriginLongitude = origin.Longitude,
                DestinationLatitude = destination.Latitude,
                DestinationLongitude = destination.Longitude,
                VehicleType = request.VehicleType,
                DepartureTime = departureTime.AddMinutes(totalDuration),
                OptimizationMode = request.OptimizationMode
            };

            var legRoute = await CalculateRouteAsync(legRequest);
            response.Legs.Add(legRoute);

            totalDistance += legRoute.DistanceMiles;
            totalDuration += legRoute.DurationMinutes;
            totalFuelCost += legRoute.Summary.EstimatedFuelCost;

            // Add service time at destination
            if (destination.ServiceTimeMinutes.HasValue)
            {
                totalDuration += destination.ServiceTimeMinutes.Value;
            }
        }

        response.TotalDistanceMiles = totalDistance;
        response.TotalDurationMinutes = totalDuration;
        response.TotalFuelCost = totalFuelCost;
        response.EstimatedCompletionTime = departureTime.AddMinutes(totalDuration);

        return response;
    }

    public async Task<List<RouteResponse>> GetAlternativeRoutesAsync(
        RouteRequest request,
        int maxAlternatives = 3)
    {
        var routes = new List<RouteResponse>();

        // Primary route
        routes.Add(await CalculateRouteAsync(request));

        // Alternative 1: Fastest (if not already)
        if (request.OptimizationMode != "fastest")
        {
            var fastestRequest = request with { OptimizationMode = "fastest" };
            routes.Add(await CalculateRouteAsync(fastestRequest));
        }

        // Alternative 2: Shortest distance
        if (request.OptimizationMode != "shortest")
        {
            var shortestRequest = request with { OptimizationMode = "shortest" };
            routes.Add(await CalculateRouteAsync(shortestRequest));
        }

        // Alternative 3: Avoid tolls
        if (!request.AvoidTolls && routes.Count < maxAlternatives + 1)
        {
            var noTollsRequest = request with { AvoidTolls = true };
            routes.Add(await CalculateRouteAsync(noTollsRequest));
        }

        return routes.Take(maxAlternatives + 1).ToList();
    }

    public async Task<FuelCostEstimate> CalculateFuelCostAsync(
        double distanceMiles,
        string vehicleType,
        decimal fuelPricePerGallon)
    {
        var mpg = _vehicleMpg.GetValueOrDefault(vehicleType.ToLower(), 6.5);
        var fuelConsumption = distanceMiles / mpg;
        var totalCost = (decimal)fuelConsumption * fuelPricePerGallon;

        return await Task.FromResult(new FuelCostEstimate
        {
            DistanceMiles = distanceMiles,
            FuelConsumptionGallons = fuelConsumption,
            FuelPricePerGallon = fuelPricePerGallon,
            TotalFuelCost = Math.Round(totalCost, 2),
            AverageMPG = mpg,
            VehicleType = vehicleType
        });
    }

    #region Private Methods

    private async Task<RouteResponse> CalculateRouteViaHereAsync(RouteRequest request)
    {
        var origin = $"{request.OriginLatitude},{request.OriginLongitude}";
        var destination = $"{request.DestinationLatitude},{request.DestinationLongitude}";
        
        var url = $"https://router.hereapi.com/v8/routes?" +
                  $"origin={origin}&" +
                  $"destination={destination}&" +
                  $"transportMode={request.VehicleType}&" +
                  $"return=polyline,summary,instructions&" +
                  $"apiKey={_hereApiKey}";

        if (request.AvoidTolls)
            url += "&avoid[features]=tollRoad";

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var hereResponse = JsonSerializer.Deserialize<HereRouteResponse>(json);

        return MapHereResponseToRouteResponse(hereResponse!, request.DepartureTime);
    }

    private RouteResponse CalculateRouteFallback(RouteRequest request)
    {
        var distance = CalculateHaversineDistance(
            request.OriginLatitude,
            request.OriginLongitude,
            request.DestinationLatitude,
            request.DestinationLongitude);

        // Estimate duration based on average truck speed (50 mph)
        var averageSpeedMph = request.VehicleType.ToLower() switch
        {
            "truck" => 50.0,
            "van" => 55.0,
            "car" => 60.0,
            _ => 50.0
        };

        var durationHours = distance / averageSpeedMph;
        var durationMinutes = (int)(durationHours * 60);

        var departureTime = request.DepartureTime ?? DateTime.UtcNow;
        var eta = departureTime.AddMinutes(durationMinutes);

        // Calculate fuel cost
        var mpg = _vehicleMpg.GetValueOrDefault(request.VehicleType.ToLower(), 6.5);
        var fuelConsumption = distance / mpg;
        var fuelCost = (decimal)fuelConsumption * 3.50m; // Assume $3.50/gallon

        return new RouteResponse
        {
            RouteId = Guid.NewGuid().ToString(),
            DistanceMiles = Math.Round(distance, 2),
            DistanceKilometers = Math.Round(distance * 1.60934, 2),
            DurationMinutes = durationMinutes,
            TrafficDelayMinutes = 0,
            EstimatedArrivalTime = eta,
            TollCost = 0,
            Summary = new RouteSummary
            {
                OptimizationMode = request.OptimizationMode,
                FuelConsumptionGallons = Math.Round(fuelConsumption, 2),
                EstimatedFuelCost = Math.Round(fuelCost, 2),
                RestStopsRequired = (int)(durationHours / 4), // Rest stop every 4 hours
                Warnings = new List<string> 
                { 
                    "Calculated using direct distance. Actual route may vary." 
                }
            }
        };
    }

    private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var lat1Rad = lat1 * (Math.PI / 180);
        var lat2Rad = lat2 * (Math.PI / 180);
        var deltaLat = (lat2 - lat1) * (Math.PI / 180);
        var deltaLon = (lon2 - lon1) * (Math.PI / 180);

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return EARTH_RADIUS_MILES * c;
    }

    private List<RouteWaypoint> OptimizeWaypointOrder(List<RouteWaypoint> waypoints)
    {
        // Simple nearest-neighbor optimization
        // For production, use more sophisticated algorithms (genetic, ant colony, etc.)
        
        if (waypoints.Count <= 2)
            return waypoints;

        var optimized = new List<RouteWaypoint> { waypoints[0] }; // Start with origin
        var remaining = waypoints.Skip(1).Take(waypoints.Count - 2).ToList();
        var destination = waypoints.Last();

        while (remaining.Any())
        {
            var current = optimized.Last();
            var nearest = remaining
                .OrderBy(w => CalculateHaversineDistance(
                    current.Latitude, current.Longitude,
                    w.Latitude, w.Longitude))
                .First();

            optimized.Add(nearest);
            remaining.Remove(nearest);
        }

        optimized.Add(destination); // End with destination
        return optimized;
    }

    private RouteResponse MapHereResponseToRouteResponse(HereRouteResponse hereResponse, DateTime? departureTime)
    {
        var route = hereResponse.Routes.FirstOrDefault();
        if (route == null)
            throw new InvalidOperationException("No route found in HERE Maps response");

        var section = route.Sections.FirstOrDefault();
        var summary = section?.Summary ?? new HereSummary();
        
        var distanceKm = summary.Length / 1000.0;
        var distanceMiles = distanceKm * 0.621371;
        var durationMinutes = summary.Duration / 60;

        var departure = departureTime ?? DateTime.UtcNow;
        var eta = departure.AddMinutes(durationMinutes);

        return new RouteResponse
        {
            RouteId = route.Id ?? Guid.NewGuid().ToString(),
            DistanceMiles = Math.Round(distanceMiles, 2),
            DistanceKilometers = Math.Round(distanceKm, 2),
            DurationMinutes = durationMinutes,
            TrafficDelayMinutes = 0,
            EstimatedArrivalTime = eta,
            TollCost = 0,
            Summary = new RouteSummary
            {
                OptimizationMode = "fastest",
                FuelConsumptionGallons = Math.Round(distanceMiles / 6.5, 2),
                EstimatedFuelCost = Math.Round((decimal)(distanceMiles / 6.5) * 3.50m, 2),
                RestStopsRequired = durationMinutes / 240, // Every 4 hours
                Warnings = new List<string>()
            }
        };
    }

    #endregion

    #region HERE Maps Response Models

    private class HereRouteResponse
    {
        public List<HereRoute> Routes { get; set; } = new();
    }

    private class HereRoute
    {
        public string? Id { get; set; }
        public List<HereSection> Sections { get; set; } = new();
    }

    private class HereSection
    {
        public HereSummary Summary { get; set; } = new();
        public List<HereInstruction> Instructions { get; set; } = new();
    }

    private class HereSummary
    {
        public int Duration { get; set; } // seconds
        public int Length { get; set; } // meters
    }

    private class HereInstruction
    {
        public string Text { get; set; } = string.Empty;
        public int Distance { get; set; }
    }

    #endregion
}
