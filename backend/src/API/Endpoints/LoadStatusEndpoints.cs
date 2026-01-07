using System;
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
/// Load status management endpoints with state machine validation
/// </summary>
public static class LoadStatusEndpoints
{
    public static void RegisterLoadStatusEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/loads/{loadId}/status")
            .WithName("LoadStatus")
            .WithDescription("Load status management with state machine and history tracking");

        group.MapPost("/change", ChangeLoadStatus)
            .WithName("ChangeLoadStatus")
            .WithDescription("Change load status with validation");

        group.MapGet("/history", GetStatusHistory)
            .WithName("GetLoadStatusHistory")
            .WithDescription("Get status change history for a load");

        group.MapGet("/transitions", GetValidTransitions)
            .WithName("GetValidLoadStatusTransitions")
            .WithDescription("Get valid next statuses for current load state");
    }

    private static async Task<IResult> ChangeLoadStatus(
        IMediator mediator,
        Guid loadId,
        ChangeLoadStatusRequest request,
        Guid? userId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var command = new ChangeLoadStatusCommand
            {
                LoadId = loadId,
                NewStatus = request.NewStatus,
                Reason = request.Reason,
                Location = request.Location,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                IsAutomatic = request.IsAutomatic,
                UserId = userId
            };

            var result = await mediator.Send(command, cancellationToken);
            return Results.Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> GetStatusHistory(
        IMediator mediator,
        Guid loadId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetLoadStatusHistoryQuery { LoadId = loadId };
            var result = await mediator.Send(query, cancellationToken);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> GetValidTransitions(
        IMediator mediator,
        Guid loadId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetValidLoadStatusTransitionsQuery { LoadId = loadId };
            var result = await mediator.Send(query, cancellationToken);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }
}
