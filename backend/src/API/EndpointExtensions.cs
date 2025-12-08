using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace TMS.API;

/// <summary>
/// Extension methods for registering endpoints
/// </summary>
public static class EndpointExtensions
{
    public static void MapHealthCheck(this WebApplication app)
    {
        app.MapGet("/health", () =>
        {
            Console.WriteLine("HEALTH: handler invoked");
            return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        })
            .WithName("HealthCheck");
    }
}
