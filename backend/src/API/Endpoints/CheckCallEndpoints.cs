using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using TMS.Application.Commands;
using TMS.Application.DTOs;
using TMS.Application.Queries;

namespace TMS.API.Endpoints;

/// <summary>
/// Check call management endpoints for driver communication tracking
/// </summary>
public static class CheckCallEndpoints
{
    public static void RegisterCheckCallEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/loads/{loadId}/check-calls")
            .WithName("CheckCalls")
            .WithDescription("Driver check-in and communication tracking");

        group.MapPost("", CreateCheckCall)
            .WithName("CreateCheckCall")
            .WithDescription("Log a new check call for a load");

        group.MapGet("", GetLoadCheckCalls)
            .WithName("GetLoadCheckCalls")
            .WithDescription("Get all check calls for a load");

        group.MapGet("/{checkCallId}", GetCheckCallById)
            .WithName("GetCheckCallById")
            .WithDescription("Get a specific check call");
    }

    private static async Task<IResult> CreateCheckCall(
        IMediator mediator,
        Guid loadId,
        CreateUpdateCheckCallRequest request,
        Guid? driverId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (driverId == null || driverId == Guid.Empty)
            {
                return Results.BadRequest("Driver ID is required");
            }

            var command = new CreateCheckCallCommand
            {
                LoadId = loadId,
                DriverId = driverId.Value,
                ContactMethod = request.ContactMethod,
                Location = request.Location,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                IsTruckEmpty = request.IsTruckEmpty,
                TrailerTemperature = request.TrailerTemperature,
                ETA = request.ETA,
                Notes = request.Notes
            };

            var result = await mediator.Send(command, cancellationToken);
            return Results.Created($"/api/loads/{loadId}/check-calls/{result.Id}", result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    private static async Task<IResult> GetLoadCheckCalls(
        IMediator mediator,
        Guid loadId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetLoadCheckCallsQuery { LoadId = loadId };
            var result = await mediator.Send(query, cancellationToken);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    private static async Task<IResult> GetCheckCallById(
        IMediator mediator,
        Guid loadId,
        Guid checkCallId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetCheckCallByIdQuery { CheckCallId = checkCallId };
            var result = await mediator.Send(query, cancellationToken);
            
            if (result == null)
                return Results.NotFound();

            // Verify the check call belongs to the specified load
            if (result.LoadId != loadId)
                return Results.BadRequest("Check call does not belong to this load");

            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }
}
