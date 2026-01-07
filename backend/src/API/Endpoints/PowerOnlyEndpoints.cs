using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using TMS.Application.Commands.PowerOnly;
using TMS.Application.DTOs.PowerOnly;
using TMS.Application.Queries.PowerOnly;
using TMS.Domain.Common;

namespace TMS.API.Endpoints;

/// <summary>
/// Power Only load endpoints
/// </summary>
public static class PowerOnlyEndpoints
{
    public static void RegisterPowerOnlyEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1/power-only")
            .WithName("PowerOnly");

        group.MapPost("/loads", CreatePowerOnlyLoad)
            .WithName("CreatePowerOnlyLoad")
            .WithDescription("Create a new Power Only load");

        group.MapGet("/loads", GetPowerOnlyLoads)
            .WithName("GetPowerOnlyLoads")
            .WithDescription("Get Power Only loads for a carrier");

        group.MapGet("/loads/{loadId}", GetPowerOnlyLoadById)
            .WithName("GetPowerOnlyLoadById")
            .WithDescription("Get a specific Power Only load by ID");

        group.MapPost("/loads/{loadId}/assign", AssignPowerOnlyLoad)
            .WithName("AssignPowerOnlyLoad")
            .WithDescription("Assign driver and equipment to a Power Only load");

        group.MapPut("/loads/{loadId}/status", UpdateLoadStatus)
            .WithName("UpdateLoadStatus")
            .WithDescription("Update the status of a Power Only load");
    }

    /// <summary>
    /// Create a new Power Only load
    /// </summary>
    private static async Task<IResult> CreatePowerOnlyLoad(
        IMediator mediator,
        CreatePowerOnlyLoadRequest request,
        Guid? carrierId = null,
        CancellationToken cancellationToken = default)
    {
        carrierId ??= Guid.NewGuid();
        var command = new CreatePowerOnlyLoadCommand
        {
            CarrierId = carrierId.Value,
            Request = request
        };

        var result = await mediator.Send(command, cancellationToken);
        return Results.Created($"/api/v1/power-only/loads/{result.Id}", 
            ApiResponse<PowerOnlyLoadResponse>.CreateSuccess(result));
    }

    /// <summary>
    /// Get Power Only loads for a carrier
    /// </summary>
    private static async Task<IResult> GetPowerOnlyLoads(
        IMediator mediator,
        Guid? carrierId = null,
        string? status = null,
        int pageNumber = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        carrierId ??= Guid.NewGuid(); // Default to a new Guid if not provided
        var query = new GetPowerOnlyLoadsQuery
        {
            CarrierId = carrierId.Value,
            Status = status,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await mediator.Send(query, cancellationToken);
        return Results.Ok(ApiResponse<List<PowerOnlyLoadResponse>>.CreateSuccess(result));
    }

    /// <summary>
    /// Get a specific Power Only load
    /// </summary>
    private static async Task<IResult> GetPowerOnlyLoadById(
        IMediator mediator,
        Guid loadId,
        CancellationToken cancellationToken)
    {
        var query = new GetPowerOnlyLoadByIdQuery { LoadId = loadId };
        var result = await mediator.Send(query, cancellationToken);
        return Results.Ok(ApiResponse<PowerOnlyLoadResponse>.CreateSuccess(result));
    }

    /// <summary>
    /// Assign equipment and driver to a load
    /// </summary>
    private static async Task<IResult> AssignPowerOnlyLoad(
        IMediator mediator,
        Guid loadId,
        AssignPowerOnlyLoadRequest request,
        Guid? carrierId = null,
        CancellationToken cancellationToken = default)
    {
        carrierId ??= Guid.NewGuid();
        request.LoadId = loadId;
        var command = new AssignPowerOnlyLoadCommand
        {
            CarrierId = carrierId.Value,
            Request = request
        };

        var result = await mediator.Send(command, cancellationToken);
        return Results.Ok(ApiResponse<PowerOnlyLoadResponse>.CreateSuccess(result));
    }

    /// <summary>
    /// Update load status
    /// </summary>
    private static async Task<IResult> UpdateLoadStatus(
        Guid loadId,
        UpdateLoadStatusRequest request,
        CancellationToken cancellationToken)
    {
        // TODO: Implement status update
        return Results.Ok(ApiResponse.CreateSuccess());
    }
}

public class UpdateLoadStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
