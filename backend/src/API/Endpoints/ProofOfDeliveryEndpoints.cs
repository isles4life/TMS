using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMS.Application.DTOs;
using TMS.Application.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using TMS.API.Hubs;

namespace TMS.API.Endpoints;

public static class ProofOfDeliveryEndpoints
{
    private static IHubContext<PODHub>? _hubContext;

    public static void MapProofOfDeliveryEndpoints(this WebApplication app)
    {
        _hubContext = app.Services.GetRequiredService<IHubContext<PODHub>>();
        
        var group = app.MapGroup("/api/proof-of-delivery")
            .WithName("ProofOfDelivery")
            .WithOpenApi();

        group.MapPost("/", CreateProofOfDelivery)
            .WithName("CreateProofOfDelivery")
            .WithOpenApi();

        group.MapPost("/{id}/sign", SignProofOfDelivery)
            .WithName("SignProofOfDelivery")
            .WithOpenApi();

        group.MapPost("/{id}/photos", AddPhoto)
            .WithName("AddPODPhoto")
            .WithOpenApi();

        group.MapPost("/{id}/complete", CompleteProofOfDelivery)
            .WithName("CompleteProofOfDelivery")
            .WithOpenApi();

        group.MapGet("/{id}", GetProofOfDelivery)
            .WithName("GetProofOfDelivery")
            .WithOpenApi();

        group.MapGet("/load/{loadId}", GetByLoadId)
            .WithName("GetProofOfDeliveryByLoadId")
            .WithOpenApi();

        group.MapGet("/driver/{driverId}", GetByDriverId)
            .WithName("GetProofOfDeliveryByDriverId")
            .WithOpenApi();

        group.MapGet("/pending/all", GetPending)
            .WithName("GetPendingProofsOfDelivery")
            .WithOpenApi();
    }

    private static async Task<IResult> CreateProofOfDelivery(
        CreateProofOfDeliveryDto dto,
        IProofOfDeliveryService service)
    {
        try
        {
            var result = await service.CreateProofOfDeliveryAsync(dto);
            
            if (!result.Success)
            {
                return Results.BadRequest(new { errors = result.Errors });
            }

            // Broadcast POD creation event
            if (_hubContext != null && result.Data != null)
            {
                await _hubContext.Clients.Group($"driver-{dto.DriverId}")
                    .SendAsync("PODCreated", result.Data.Id, dto.LoadId, dto.DriverId);
                await _hubContext.Clients.All
                    .SendAsync("PODCreated", result.Data.Id, dto.LoadId, dto.DriverId);
            }
            
            return Results.Created($"/api/proof-of-delivery/{result.Data!.Id}", result.Data);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static async Task<IResult> SignProofOfDelivery(
        string id,
        SignProofOfDeliveryDto dto,
        IProofOfDeliveryService service)
    {
        try
        {
            dto.ProofOfDeliveryId = id;
            var result = await service.SignProofOfDeliveryAsync(dto);
            
            if (!result.Success)
            {
                return Results.BadRequest(new { errors = result.Errors });
            }

            // Broadcast POD signed event
            if (_hubContext != null && result.Data != null)
            {
                await _hubContext.Clients.Group($"pod-{id}")
                    .SendAsync("PODSigned", id, dto.RecipientName, result.Data.DeliveryDateTime);
                await _hubContext.Clients.All
                    .SendAsync("PODSigned", id, dto.RecipientName, result.Data.DeliveryDateTime);
            }
            
            return Results.Ok(result.Data);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static async Task<IResult> AddPhoto(
        string id,
        AddPODPhotoDto dto,
        IProofOfDeliveryService service)
    {
        try
        {
            dto.ProofOfDeliveryId = id;
            var result = await service.AddPhotoAsync(dto);
            
            if (!result.Success)
            {
                return Results.BadRequest(new { errors = result.Errors });
            }

            return Results.Ok(result.Data);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static async Task<IResult> CompleteProofOfDelivery(
        string id,
        CompleteProofOfDeliveryDto dto,
        IProofOfDeliveryService service)
    {
        try
        {
            dto.ProofOfDeliveryId = id;
            var result = await service.CompleteProofOfDeliveryAsync(dto);
            
            // Broadcast POD completed event
            if (_hubContext != null && result.Success && result.Data != null)
            {
                await _hubContext.Clients.Group($"pod-{id}")
                    .SendAsync("PODCompleted", id, result.Data.LoadId);
                await _hubContext.Clients.All
                    .SendAsync("PODCompleted", id, result.Data.LoadId);
            }
            
            return result.Success ? Results.Ok(result.Data) : Results.BadRequest(result.Errors);
        }
        catch (KeyNotFoundException)
        {
            return Results.NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static async Task<IResult> GetProofOfDelivery(
        string id,
        IProofOfDeliveryService service)
    {
        try
        {
            var result = await service.GetProofOfDeliveryAsync(id);
            return result == null ? Results.NotFound() : Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static async Task<IResult> GetByLoadId(
        string loadId,
        IProofOfDeliveryService service)
    {
        try
        {
            var result = await service.GetByLoadIdAsync(loadId);
            return result == null ? Results.NotFound() : Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static async Task<IResult> GetByDriverId(
        string driverId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        IProofOfDeliveryService service)
    {
        try
        {
            var results = await service.GetByDriverIdAsync(driverId, startDate, endDate);
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    private static async Task<IResult> GetPending(IProofOfDeliveryService service)
    {
        try
        {
            var results = await service.GetPendingAsync();
            return Results.Ok(results);
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
