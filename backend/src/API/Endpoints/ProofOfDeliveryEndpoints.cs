using TMS.Application.DTOs;
using TMS.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace TMS.API.Endpoints;

public static class ProofOfDeliveryEndpoints
{
    public static void MapProofOfDeliveryEndpoints(this WebApplication app)
    {
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
            return Results.Created($"/api/proof-of-delivery/{result.Id}", result);
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

    private static async Task<IResult> SignProofOfDelivery(
        string id,
        SignProofOfDeliveryDto dto,
        IProofOfDeliveryService service)
    {
        try
        {
            var result = await service.SignProofOfDeliveryAsync(id, dto);
            return Results.Ok(result);
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

    private static async Task<IResult> AddPhoto(
        string id,
        AddPODPhotoDto dto,
        IProofOfDeliveryService service)
    {
        try
        {
            var result = await service.AddPhotoAsync(id, dto);
            return Results.Ok(result);
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

    private static async Task<IResult> CompleteProofOfDelivery(
        string id,
        CompleteProofOfDeliveryDto dto,
        IProofOfDeliveryService service)
    {
        try
        {
            var result = await service.CompleteProofOfDeliveryAsync(id, dto);
            return Results.Ok(result);
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
