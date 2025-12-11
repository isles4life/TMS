namespace TMS.Application.DTOs;

using System;
using System.Collections.Generic;

public class RouteRequest
{
    public double OriginLatitude { get; set; }
    public double OriginLongitude { get; set; }
    public double DestinationLatitude { get; set; }
    public double DestinationLongitude { get; set; }
    public string VehicleType { get; set; } = "truck"; // truck, van, car
    public DateTime? DepartureTime { get; set; }
    public bool AvoidTolls { get; set; }
    public bool AvoidHighways { get; set; }
    public List<string>? AvoidCountries { get; set; }
    public string OptimizationMode { get; set; } = "fastest"; // fastest, shortest, fuelEfficient
}

public class RouteResponse
{
    public string RouteId { get; set; } = string.Empty;
    public double DistanceMiles { get; set; }
    public double DistanceKilometers { get; set; }
    public int DurationMinutes { get; set; }
    public int TrafficDelayMinutes { get; set; }
    public DateTime EstimatedArrivalTime { get; set; }
    public decimal TollCost { get; set; }
    public List<RouteSegment> Segments { get; set; } = new();
    public List<RoutePoint> Polyline { get; set; } = new();
    public RouteSummary Summary { get; set; } = new();
}

public class RouteSegment
{
    public string Instruction { get; set; } = string.Empty;
    public double DistanceMiles { get; set; }
    public int DurationMinutes { get; set; }
    public string RoadName { get; set; } = string.Empty;
    public string ManeuverType { get; set; } = string.Empty; // turn, merge, exit, etc.
}

public class RoutePoint
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class RouteSummary
{
    public string OptimizationMode { get; set; } = string.Empty;
    public double FuelConsumptionGallons { get; set; }
    public decimal EstimatedFuelCost { get; set; }
    public int RestStopsRequired { get; set; }
    public List<string> Warnings { get; set; } = new();
}

public class RouteDistance
{
    public double DistanceMiles { get; set; }
    public double DistanceKilometers { get; set; }
    public int DurationMinutes { get; set; }
    public int TrafficDelayMinutes { get; set; }
}

public class MultiStopRouteRequest
{
    public List<RouteWaypoint> Waypoints { get; set; } = new();
    public string VehicleType { get; set; } = "truck";
    public DateTime? DepartureTime { get; set; }
    public bool OptimizeWaypointOrder { get; set; }
    public string OptimizationMode { get; set; } = "fastest";
}

public class RouteWaypoint
{
    public string LocationId { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public int? ServiceTimeMinutes { get; set; } // Time spent at location
    public DateTime? TimeWindow { get; set; } // Required arrival time
}

public class MultiStopRouteResponse
{
    public List<RouteWaypoint> OptimizedOrder { get; set; } = new();
    public double TotalDistanceMiles { get; set; }
    public int TotalDurationMinutes { get; set; }
    public List<RouteResponse> Legs { get; set; } = new();
    public decimal TotalFuelCost { get; set; }
    public DateTime EstimatedCompletionTime { get; set; }
}

public class FuelCostEstimate
{
    public double DistanceMiles { get; set; }
    public double FuelConsumptionGallons { get; set; }
    public decimal FuelPricePerGallon { get; set; }
    public decimal TotalFuelCost { get; set; }
    public double AverageMPG { get; set; }
    public string VehicleType { get; set; } = string.Empty;
}

public class FuelPriceInfo
{
    public string ZipCode { get; set; } = string.Empty;
    public string FuelType { get; set; } = "diesel"; // diesel or gas
    public decimal PricePerGallon { get; set; }
    public string Source { get; set; } = "config:default";
    public DateTime RetrievedAt { get; set; } = DateTime.UtcNow;
}
