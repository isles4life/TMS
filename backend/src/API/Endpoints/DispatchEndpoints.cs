namespace TMS.API.Endpoints;

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using MediatR;
using TMS.Application.Commands.Dispatch;
using TMS.Application.Queries.Dispatch;
using TMS.Application.DTOs;

public static class DispatchEndpoints
{
    public static void RegisterDispatchEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/dispatch")
            .WithTags("Dispatch");

        // Auto-dispatch: Find best driver matches for a load
        group.MapGet("/matches/{loadId}", FindMatches)
            .WithName("FindDriverMatches")
            .Produces<DriverMatchResponse[]>(StatusCodes.Status200OK);

        // Manual dispatch: Assign load to driver
        group.MapPost("/assign", AssignLoad)
            .WithName("AssignLoad")
            .Produces<DispatchResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        // Driver accepts dispatch
        group.MapPost("/{dispatchId}/accept", AcceptDispatch)
            .WithName("AcceptDispatch")
            .Produces<DispatchResponse>(StatusCodes.Status200OK);

        // Driver rejects dispatch
        group.MapPost("/{dispatchId}/reject", RejectDispatch)
            .WithName("RejectDispatch")
            .Produces<DispatchResponse>(StatusCodes.Status200OK);

        // Cancel dispatch
        group.MapPost("/{dispatchId}/cancel", CancelDispatch)
            .WithName("CancelDispatch")
            .Produces<DispatchResponse>(StatusCodes.Status200OK);

        // Get active dispatches
        group.MapGet("/active", GetActiveDispatches)
            .WithName("GetActiveDispatches")
            .Produces<DispatchResponse[]>(StatusCodes.Status200OK);

        // Update driver availability
        group.MapPut("/availability", UpdateAvailability)
            .WithName("UpdateDriverAvailability")
            .Produces<DriverAvailabilityResponse>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> FindMatches(Guid loadId, IMediator mediator, int maxMatches = 5)
    {
        var query = new FindDriverMatchesQuery
        {
            LoadId = loadId,
            MaxMatches = maxMatches
        };

        var matches = await mediator.Send(query);
        return Results.Ok(matches);
    }

    private static async Task<IResult> AssignLoad(DispatchRequest request, IMediator mediator)
    {
        if (request.LoadId == Guid.Empty || request.DriverId == Guid.Empty)
        {
            return Results.BadRequest(new { error = "LoadId and DriverId are required" });
        }

        var command = new AssignLoadCommand { Request = request };
        var dispatch = await mediator.Send(command);
        
        return Results.Created($"/api/dispatch/{dispatch.Id}", dispatch);
    }

    private static async Task<IResult> AcceptDispatch(Guid dispatchId, IMediator mediator)
    {
        var command = new AcceptDispatchCommand { DispatchId = dispatchId };
        var dispatch = await mediator.Send(command);
        
        return Results.Ok(dispatch);
    }

    private static async Task<IResult> RejectDispatch(Guid dispatchId, RejectDispatchRequest request, IMediator mediator)
    {
        var command = new RejectDispatchCommand 
        { 
            DispatchId = dispatchId,
            Reason = request.Reason 
        };
        var dispatch = await mediator.Send(command);
        
        return Results.Ok(dispatch);
    }

    private static async Task<IResult> CancelDispatch(Guid dispatchId, IMediator mediator)
    {
        var command = new CancelDispatchCommand { DispatchId = dispatchId };
        var dispatch = await mediator.Send(command);
        
        return Results.Ok(dispatch);
    }

    private static async Task<IResult> GetActiveDispatches(IMediator mediator, Guid? driverId = null)
    {
        var query = new GetActiveDispatchesQuery { DriverId = driverId };
        var dispatches = await mediator.Send(query);
        
        return Results.Ok(dispatches);
    }

    private static async Task<IResult> UpdateAvailability(DriverAvailabilityRequest request, IMediator mediator)
    {
        var command = new UpdateDriverAvailabilityCommand { Request = request };
        var availability = await mediator.Send(command);
        
        return Results.Ok(availability);
    }
}

public class RejectDispatchRequest
{
    public required string Reason { get; set; }
}
