using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using TMS.Application.Commands.Drivers;
using TMS.Application.DTOs.Drivers;
using TMS.Application.Queries.Drivers;
using TMS.Domain.Common;

namespace TMS.API.Endpoints;

/// <summary>
/// Driver management endpoints
/// </summary>
public static class DriverEndpoints
{
    public static void RegisterDriverEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/drivers")
            .WithName("Drivers");

        group.MapPost("", CreateDriver)
            .WithName("CreateDriver")
            .WithDescription("Create a new driver profile");

        group.MapGet("", GetDrivers)
            .WithName("GetDrivers")
            .WithDescription("Get all drivers for a carrier");

        group.MapGet("/{driverId}", GetDriverById)
            .WithName("GetDriverById")
            .WithDescription("Get a specific driver");

        group.MapPut("/{driverId}", UpdateDriver)
            .WithName("UpdateDriver")
            .WithDescription("Update driver profile");
    }

    private static async Task<IResult> CreateDriver(
        IMediator mediator,
        CreateDriverRequest request,
        Guid? carrierId = null,
        CancellationToken cancellationToken = default)
    {
        carrierId ??= Guid.NewGuid();
        var command = new CreateDriverCommand
        {
            CarrierId = carrierId.Value,
            Request = request
        };

        var result = await mediator.Send(command, cancellationToken);
        return Results.Created($"/api/drivers/{result.Id}",
            ApiResponse<DriverResponse>.CreateSuccess(result));
    }

    private static async Task<IResult> GetDrivers(
        IMediator mediator,
        Guid? carrierId = null,
        int pageNumber = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        carrierId ??= Guid.NewGuid();
        var query = new GetDriversQuery
        {
            CarrierId = carrierId.Value,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await mediator.Send(query, cancellationToken);
        return Results.Ok(ApiResponse<List<DriverResponse>>.CreateSuccess(result));
    }

    private static async Task<IResult> GetDriverById(
        IMediator mediator,
        Guid driverId,
        CancellationToken cancellationToken = default)
    {
        var query = new GetDriverByIdQuery { DriverId = driverId };
        var result = await mediator.Send(query, cancellationToken);
        return Results.Ok(ApiResponse<DriverResponse>.CreateSuccess(result));
    }

    private static async Task<IResult> UpdateDriver(
        IMediator mediator,
        Guid driverId,
        DriverResponse request,
        CancellationToken cancellationToken = default)
    {
        var command = new UpdateDriverCommand
        {
            DriverId = driverId,
            Request = request
        };

        var result = await mediator.Send(command, cancellationToken);
        return Results.Ok(ApiResponse<DriverResponse>.CreateSuccess(result));
    }
}
