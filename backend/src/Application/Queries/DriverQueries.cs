using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs.Drivers;

namespace TMS.Application.Queries.Drivers;

/// <summary>
/// Query to get drivers for a carrier
/// </summary>
public class GetDriversQuery : IRequest<List<DriverResponse>>
{
    public Guid CarrierId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

/// <summary>
/// Query handler for retrieving drivers
/// </summary>
public class GetDriversHandler : IRequestHandler<GetDriversQuery, List<DriverResponse>>
{
    public async Task<List<DriverResponse>> Handle(GetDriversQuery request, CancellationToken cancellationToken)
    {
        var mockDrivers = new List<DriverResponse>
        {
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                PhoneNumber = "+1-555-0101",
                CDLNumber = "IL123456789",
                CDLExpiryDate = DateTime.UtcNow.AddYears(2),
                Status = "Active"
            },
            new()
            {
                Id = Guid.NewGuid(),
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@example.com",
                PhoneNumber = "+1-555-0102",
                CDLNumber = "IL987654321",
                CDLExpiryDate = DateTime.UtcNow.AddYears(1),
                Status = "Active"
            }
        };
        
        await Task.CompletedTask;
        return mockDrivers;
    }
}

/// <summary>
/// Query to get a single driver by ID
/// </summary>
public class GetDriverByIdQuery : IRequest<DriverResponse>
{
    public Guid DriverId { get; set; }
}

/// <summary>
/// Query handler for retrieving a single driver
/// </summary>
public class GetDriverByIdHandler : IRequestHandler<GetDriverByIdQuery, DriverResponse>
{
    public async Task<DriverResponse> Handle(GetDriverByIdQuery request, CancellationToken cancellationToken)
    {
        var mockDriver = new DriverResponse
        {
            Id = request.DriverId,
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            PhoneNumber = "+1-555-0101",
            CDLNumber = "IL123456789",
            CDLExpiryDate = DateTime.UtcNow.AddYears(2),
            Status = "Active"
        };
        
        await Task.CompletedTask;
        return mockDriver;
    }
}
