namespace TMS.Application.Queries;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;

/// <summary>
/// Query to get all check calls for a specific load
/// </summary>
public class GetLoadCheckCallsQuery : IRequest<List<CheckCallDto>>
{
    public Guid LoadId { get; set; }
}

/// <summary>
/// Query handler for retrieving check calls by load
/// </summary>
public class GetLoadCheckCallsHandler : IRequestHandler<GetLoadCheckCallsQuery, List<CheckCallDto>>
{
    public async Task<List<CheckCallDto>> Handle(GetLoadCheckCallsQuery request, CancellationToken cancellationToken)
    {
        // In production, you would query the database for check calls matching the LoadId
        // For now, returning mock data
        var mockCheckCalls = new List<CheckCallDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = request.LoadId,
                DriverId = Guid.NewGuid(),
                DriverName = "John Doe",
                CheckInTime = DateTime.UtcNow.AddHours(-2),
                ContactMethod = "Phone",
                Location = "I-75 near Atlanta, GA",
                Latitude = 33.7490m,
                Longitude = -84.3880m,
                IsTruckEmpty = false,
                TrailerTemperature = 68,
                ETA = "2 hours",
                Notes = "Running on schedule",
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = request.LoadId,
                DriverId = Guid.NewGuid(),
                DriverName = "John Doe",
                CheckInTime = DateTime.UtcNow.AddHours(-1),
                ContactMethod = "App",
                Location = "I-75 near Chattanooga, TN",
                Latitude = 35.0456m,
                Longitude = -85.3097m,
                IsTruckEmpty = false,
                TrailerTemperature = 70,
                ETA = "1 hour",
                Notes = "Weather good, no issues",
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            }
        };

        await Task.CompletedTask;
        return mockCheckCalls.OrderByDescending(c => c.CheckInTime).ToList();
    }
}

/// <summary>
/// Query to get all check calls for a specific driver
/// </summary>
public class GetDriverCheckCallsQuery : IRequest<List<CheckCallDto>>
{
    public Guid DriverId { get; set; }
}

/// <summary>
/// Query handler for retrieving check calls by driver
/// </summary>
public class GetDriverCheckCallsHandler : IRequestHandler<GetDriverCheckCallsQuery, List<CheckCallDto>>
{
    public async Task<List<CheckCallDto>> Handle(GetDriverCheckCallsQuery request, CancellationToken cancellationToken)
    {
        // In production, you would query the database for check calls from this driver
        // For now, returning mock data
        var mockCheckCalls = new List<CheckCallDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = Guid.NewGuid(),
                DriverId = request.DriverId,
                DriverName = "John Doe",
                CheckInTime = DateTime.UtcNow.AddHours(-3),
                ContactMethod = "Phone",
                Location = "Highway 95",
                Latitude = 33.7490m,
                Longitude = -84.3880m,
                IsTruckEmpty = false,
                TrailerTemperature = 65,
                ETA = "3 hours",
                Notes = "First load of the day",
                CreatedAt = DateTime.UtcNow.AddHours(-3)
            }
        };

        await Task.CompletedTask;
        return mockCheckCalls.OrderByDescending(c => c.CheckInTime).ToList();
    }
}

/// <summary>
/// Query to get a specific check call by ID
/// </summary>
public class GetCheckCallByIdQuery : IRequest<CheckCallDto?>
{
    public Guid CheckCallId { get; set; }
}

/// <summary>
/// Query handler for retrieving a specific check call
/// </summary>
public class GetCheckCallByIdHandler : IRequestHandler<GetCheckCallByIdQuery, CheckCallDto?>
{
    public async Task<CheckCallDto?> Handle(GetCheckCallByIdQuery request, CancellationToken cancellationToken)
    {
        // In production, you would query the database for the check call by ID
        // For now, returning mock data
        var mockCheckCall = new CheckCallDto
        {
            Id = request.CheckCallId,
            LoadId = Guid.NewGuid(),
            DriverId = Guid.NewGuid(),
            DriverName = "John Doe",
            CheckInTime = DateTime.UtcNow.AddHours(-1),
            ContactMethod = "Phone",
            Location = "I-75 near Atlanta",
            Latitude = 33.7490m,
            Longitude = -84.3880m,
            IsTruckEmpty = false,
            TrailerTemperature = 68,
            ETA = "1 hour",
            Notes = "Everything running smoothly",
            CreatedAt = DateTime.UtcNow.AddHours(-1)
        };

        await Task.CompletedTask;
        return mockCheckCall;
    }
}
