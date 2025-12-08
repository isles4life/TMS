using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs.PowerOnly;
using TMS.Domain.Entities.Loads;

namespace TMS.Application.Commands.PowerOnly;

/// <summary>
/// Command to create a new Power Only load
/// </summary>
public class CreatePowerOnlyLoadCommand : IRequest<PowerOnlyLoadResponse>
{
    public Guid CarrierId { get; set; }
    public CreatePowerOnlyLoadRequest Request { get; set; } = new();
}

/// <summary>
/// Command handler for creating Power Only loads
/// </summary>
public class CreatePowerOnlyLoadHandler : IRequestHandler<CreatePowerOnlyLoadCommand, PowerOnlyLoadResponse>
{
    public async Task<PowerOnlyLoadResponse> Handle(CreatePowerOnlyLoadCommand request, CancellationToken cancellationToken)
    {
        var loadId = Guid.NewGuid();
        var loadNumber = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(10000)}";
        var totalRevenue = request.Request.BaseRate + request.Request.FuelSurcharge + request.Request.AccessorialCharges;
        var pickupAddress = $"{request.Request.PickupCity}, {request.Request.PickupState}";
        var deliveryAddress = $"{request.Request.DeliveryCity}, {request.Request.DeliveryState}";
        
        await Task.CompletedTask;
        return new PowerOnlyLoadResponse
        {
            Id = loadId,
            LoadNumber = loadNumber,
            Status = "Booked",
            PickupAddress = pickupAddress,
            DeliveryAddress = deliveryAddress,
            PickupDateTime = request.Request.PickupDateTime,
            DeliveryDateTime = request.Request.DeliveryDateTime,
            TotalRevenue = totalRevenue
        };
    }
}

/// <summary>
/// Command to assign equipment and driver to a Power Only load
/// </summary>
public class AssignPowerOnlyLoadCommand : IRequest<PowerOnlyLoadResponse>
{
    public Guid CarrierId { get; set; }
    public AssignPowerOnlyLoadRequest Request { get; set; } = new();
}

/// <summary>
/// Command handler for assigning Power Only loads
/// </summary>
public class AssignPowerOnlyLoadHandler : IRequestHandler<AssignPowerOnlyLoadCommand, PowerOnlyLoadResponse>
{
    public async Task<PowerOnlyLoadResponse> Handle(AssignPowerOnlyLoadCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        return new PowerOnlyLoadResponse
        {
            Id = request.Request.LoadId,
            Status = "Dispatched",
            DriverName = "John Doe",
            TractorNumber = "CAT-123"
        };
    }
}
