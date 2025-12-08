using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs.PowerOnly;
using TMS.Domain.Entities.Loads;

namespace TMS.Application.Queries.PowerOnly;

/// <summary>
/// Query to get Power Only loads for a carrier
/// </summary>
public class GetPowerOnlyLoadsQuery : IRequest<List<PowerOnlyLoadResponse>>
{
    public Guid CarrierId { get; set; }
    public string? Status { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

/// <summary>
/// Query handler for retrieving Power Only loads
/// </summary>
public class GetPowerOnlyLoadsHandler : IRequestHandler<GetPowerOnlyLoadsQuery, List<PowerOnlyLoadResponse>>
{
    public async Task<List<PowerOnlyLoadResponse>> Handle(GetPowerOnlyLoadsQuery request, CancellationToken cancellationToken)
    {
        var mockLoads = new List<PowerOnlyLoadResponse>
        {
            new()
            {
                Id = Guid.NewGuid(),
                LoadNumber = "PO-20241208-0001",
                Status = "Booked",
                PickupAddress = "Chicago, IL",
                DeliveryAddress = "Dallas, TX",
                PickupDateTime = DateTime.UtcNow.AddHours(2),
                DeliveryDateTime = DateTime.UtcNow.AddHours(26),
                TotalRevenue = 1700m
            },
            new()
            {
                Id = Guid.NewGuid(),
                LoadNumber = "PO-20241208-0002",
                Status = "Dispatched",
                PickupAddress = "Atlanta, GA",
                DeliveryAddress = "Miami, FL",
                PickupDateTime = DateTime.UtcNow.AddHours(4),
                DeliveryDateTime = DateTime.UtcNow.AddHours(12),
                DriverName = "John Doe",
                TractorNumber = "CAT-123",
                TotalRevenue = 1320m
            }
        };
        
        await Task.CompletedTask;
        return mockLoads;
    }
}

/// <summary>
/// Query to get a single Power Only load by ID
/// </summary>
public class GetPowerOnlyLoadByIdQuery : IRequest<PowerOnlyLoadResponse>
{
    public Guid LoadId { get; set; }
}

/// <summary>
/// Query handler for retrieving a single Power Only load
/// </summary>
public class GetPowerOnlyLoadByIdHandler : IRequestHandler<GetPowerOnlyLoadByIdQuery, PowerOnlyLoadResponse>
{
    public async Task<PowerOnlyLoadResponse> Handle(GetPowerOnlyLoadByIdQuery request, CancellationToken cancellationToken)
    {
        var mockLoad = new PowerOnlyLoadResponse
        {
            Id = request.LoadId,
            LoadNumber = "PO-20241208-0001",
            Status = "Booked",
            PickupAddress = "Chicago, IL",
            DeliveryAddress = "Dallas, TX",
            PickupDateTime = DateTime.UtcNow.AddHours(2),
            DeliveryDateTime = DateTime.UtcNow.AddHours(26),
            TotalRevenue = 1700m
        };
        
        await Task.CompletedTask;
        return mockLoad;
    }
}
