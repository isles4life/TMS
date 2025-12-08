using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using TMS.Application.Commands.Equipment;
using TMS.Application.DTOs.Equipment;
using TMS.Application.Queries.Equipment;
using TMS.Domain.Common;

namespace TMS.API.Endpoints;

/// <summary>
/// Equipment management endpoints
/// </summary>
public static class EquipmentEndpoints
{
    public static void RegisterEquipmentEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/equipment")
            .WithName("Equipment");

        group.MapPost("/power-only", CreatePowerOnlyTractor)
            .WithName("CreatePowerOnlyTractor")
            .WithDescription("Register a new Power Only tractor");

        group.MapGet("/power-only", GetPowerOnlyTractors)
            .WithName("GetPowerOnlyTractors")
            .WithDescription("Get all Power Only tractors for a carrier");

        group.MapGet("/power-only/{equipmentId}", GetPowerOnlyTractorById)
            .WithName("GetPowerOnlyTractorById")
            .WithDescription("Get a specific Power Only tractor");

        group.MapPut("/power-only/{equipmentId}", UpdatePowerOnlyTractor)
            .WithName("UpdatePowerOnlyTractor")
            .WithDescription("Update Power Only tractor details");
    }

    private static async Task<IResult> CreatePowerOnlyTractor(
        IMediator mediator,
        CreatePowerOnlyTractorRequest request,
        Guid? carrierId = null,
        CancellationToken cancellationToken = default)
    {
        carrierId ??= Guid.NewGuid();
        var command = new CreatePowerOnlyTractorCommand
        {
            CarrierId = carrierId.Value,
            Request = request
        };

        var result = await mediator.Send(command, cancellationToken);
        return Results.Created($"/api/equipment/power-only/{result.Id}",
            ApiResponse<PowerOnlyTractorResponse>.CreateSuccess(result));
    }

    private static async Task<IResult> GetPowerOnlyTractors(
        IMediator mediator,
        Guid? carrierId = null,
        int pageNumber = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        carrierId ??= Guid.NewGuid();
        var query = new GetPowerOnlyTractorsQuery
        {
            CarrierId = carrierId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await mediator.Send(query, cancellationToken);
        return Results.Ok(ApiResponse<List<PowerOnlyTractorResponse>>.CreateSuccess(result));
    }

    private static async Task<IResult> GetPowerOnlyTractorById(
        IMediator mediator,
        Guid equipmentId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPowerOnlyTractorByIdQuery { TractorId = equipmentId };
        var result = await mediator.Send(query, cancellationToken);
        return Results.Ok(ApiResponse<PowerOnlyTractorResponse>.CreateSuccess(result));
    }

    private static async Task<IResult> UpdatePowerOnlyTractor(
        IMediator mediator,
        Guid equipmentId,
        PowerOnlyTractorResponse request,
        CancellationToken cancellationToken = default)
    {
        var command = new UpdatePowerOnlyTractorCommand
        {
            TractorId = equipmentId,
            Request = request
        };

        var result = await mediator.Send(command, cancellationToken);
        return Results.Ok(ApiResponse<PowerOnlyTractorResponse>.CreateSuccess(result));
    }
}
