namespace TMS.Application.Queries;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;
using TMS.Domain.Entities.Loads;

/// <summary>
/// Query to get status history for a load
/// </summary>
public class GetLoadStatusHistoryQuery : IRequest<List<LoadStatusHistoryDto>>
{
    public Guid LoadId { get; set; }
}

/// <summary>
/// Handler for retrieving load status history
/// </summary>
public class GetLoadStatusHistoryHandler : IRequestHandler<GetLoadStatusHistoryQuery, List<LoadStatusHistoryDto>>
{
    public async Task<List<LoadStatusHistoryDto>> Handle(GetLoadStatusHistoryQuery request, CancellationToken cancellationToken)
    {
        // In production: query database for status history
        var mockHistory = new List<LoadStatusHistoryDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = request.LoadId,
                PreviousStatus = null,
                NewStatus = "Booked",
                ChangedAt = DateTime.UtcNow.AddDays(-5),
                ChangedByUserName = "Sarah Dispatcher",
                Reason = "Load booked by customer",
                IsAutomatic = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = request.LoadId,
                PreviousStatus = "Booked",
                NewStatus = "AwaitingAssignment",
                ChangedAt = DateTime.UtcNow.AddDays(-4),
                ChangedByUserName = "System",
                Reason = "Automatic transition after booking confirmation",
                IsAutomatic = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = request.LoadId,
                PreviousStatus = "AwaitingAssignment",
                NewStatus = "Assigned",
                ChangedAt = DateTime.UtcNow.AddDays(-3),
                ChangedByUserName = "Mike Dispatcher",
                Reason = "Assigned to driver John Doe, tractor #123",
                IsAutomatic = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = request.LoadId,
                PreviousStatus = "Assigned",
                NewStatus = "Dispatched",
                ChangedAt = DateTime.UtcNow.AddDays(-2),
                ChangedByUserName = "Mike Dispatcher",
                Reason = "Driver dispatched to pickup location",
                Location = "Atlanta, GA",
                Latitude = 33.7490m,
                Longitude = -84.3880m,
                IsAutomatic = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                LoadId = request.LoadId,
                PreviousStatus = "Dispatched",
                NewStatus = "DriverEnRoute",
                ChangedAt = DateTime.UtcNow.AddDays(-1),
                ChangedByUserName = "GPS System",
                Reason = "Driver movement detected via GPS",
                Location = "I-75 near Macon, GA",
                Latitude = 32.8407m,
                Longitude = -83.6324m,
                IsAutomatic = true
            }
        };

        await Task.CompletedTask;
        return mockHistory.OrderByDescending(h => h.ChangedAt).ToList();
    }
}

/// <summary>
/// Query to get valid next statuses for a load
/// </summary>
public class GetValidLoadStatusTransitionsQuery : IRequest<LoadStatusTransitionsDto>
{
    public Guid LoadId { get; set; }
}

/// <summary>
/// Handler for retrieving valid status transitions
/// </summary>
public class GetValidLoadStatusTransitionsHandler : IRequestHandler<GetValidLoadStatusTransitionsQuery, LoadStatusTransitionsDto>
{
    private Dictionary<LoadStatus, List<LoadStatus>> GetValidTransitions()
    {
        return new Dictionary<LoadStatus, List<LoadStatus>>
        {
            [LoadStatus.Draft] = new() { LoadStatus.Pending, LoadStatus.Cancelled },
            [LoadStatus.Pending] = new() { LoadStatus.Booked, LoadStatus.Cancelled },
            [LoadStatus.Booked] = new() { LoadStatus.AwaitingAssignment, LoadStatus.Cancelled, LoadStatus.OnHold },
            [LoadStatus.AwaitingAssignment] = new() { LoadStatus.Assigned, LoadStatus.Cancelled },
            [LoadStatus.Assigned] = new() { LoadStatus.Dispatched, LoadStatus.AwaitingAssignment, LoadStatus.Cancelled },
            [LoadStatus.Dispatched] = new() { LoadStatus.DriverEnRoute, LoadStatus.OnHold, LoadStatus.Cancelled },
            [LoadStatus.DriverEnRoute] = new() { LoadStatus.AtPickup, LoadStatus.Delayed, LoadStatus.Problem },
            [LoadStatus.AtPickup] = new() { LoadStatus.Loading, LoadStatus.Delayed, LoadStatus.Problem },
            [LoadStatus.Loading] = new() { LoadStatus.PickedUp, LoadStatus.Problem },
            [LoadStatus.PickedUp] = new() { LoadStatus.InTransit, LoadStatus.Problem },
            [LoadStatus.InTransit] = new() { LoadStatus.AtStop, LoadStatus.AtDelivery, LoadStatus.Delayed, LoadStatus.Problem },
            [LoadStatus.AtStop] = new() { LoadStatus.InTransit, LoadStatus.Problem },
            [LoadStatus.Delayed] = new() { LoadStatus.InTransit, LoadStatus.AtDelivery, LoadStatus.Problem },
            [LoadStatus.AtDelivery] = new() { LoadStatus.Unloading, LoadStatus.Problem },
            [LoadStatus.Unloading] = new() { LoadStatus.Delivered, LoadStatus.Problem },
            [LoadStatus.Delivered] = new() { LoadStatus.PendingPOD },
            [LoadStatus.PendingPOD] = new() { LoadStatus.PODReceived, LoadStatus.Problem },
            [LoadStatus.PODReceived] = new() { LoadStatus.Invoiced },
            [LoadStatus.Invoiced] = new() { LoadStatus.Completed },
            [LoadStatus.OnHold] = new() { LoadStatus.Booked, LoadStatus.Dispatched, LoadStatus.Cancelled },
            [LoadStatus.Problem] = new() { LoadStatus.InTransit, LoadStatus.AtDelivery, LoadStatus.OnHold, LoadStatus.Cancelled }
        };
    }

    public async Task<LoadStatusTransitionsDto> Handle(GetValidLoadStatusTransitionsQuery request, CancellationToken cancellationToken)
    {
        // In production: fetch current load status from database
        var currentStatus = LoadStatus.Dispatched; // Mock current status

        var transitions = GetValidTransitions();
        var validNextStatuses = transitions.ContainsKey(currentStatus)
            ? transitions[currentStatus].Select(s => s.ToString()).ToList()
            : new List<string>();

        var result = new LoadStatusTransitionsDto
        {
            LoadId = request.LoadId,
            CurrentStatus = currentStatus.ToString(),
            ValidNextStatuses = validNextStatuses
        };

        await Task.CompletedTask;
        return result;
    }
}
