namespace TMS.Application.Commands;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;
using TMS.Domain.Entities.Loads;

/// <summary>
/// Command to change the status of a load
/// </summary>
public class ChangeLoadStatusCommand : IRequest<LoadStatusHistoryDto>
{
    public Guid LoadId { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsAutomatic { get; set; }
    public Guid? UserId { get; set; }
}

/// <summary>
/// Handler for changing load status with state machine validation
/// </summary>
public class ChangeLoadStatusHandler : IRequestHandler<ChangeLoadStatusCommand, LoadStatusHistoryDto>
{
    /// <summary>
    /// Validates state transitions based on business rules
    /// </summary>
    private bool IsValidTransition(LoadStatus current, LoadStatus next)
    {
        // Define valid state transitions
        var validTransitions = new Dictionary<LoadStatus, List<LoadStatus>>
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

        return validTransitions.ContainsKey(current) && validTransitions[current].Contains(next);
    }

    public async Task<LoadStatusHistoryDto> Handle(ChangeLoadStatusCommand request, CancellationToken cancellationToken)
    {
        // In production: 
        // 1. Fetch load from database
        // 2. Validate status transition
        // 3. Create status history record
        // 4. Update load status
        // 5. Save to database
        // 6. Trigger events/notifications

        // Mock current status
        var currentStatus = LoadStatus.Dispatched;
        var newStatus = Enum.Parse<LoadStatus>(request.NewStatus);

        // Validate transition
        if (!IsValidTransition(currentStatus, newStatus))
        {
            throw new InvalidOperationException(
                $"Invalid status transition from {currentStatus} to {newStatus}");
        }

        var historyRecord = new LoadStatusHistoryDto
        {
            Id = Guid.NewGuid(),
            LoadId = request.LoadId,
            PreviousStatus = currentStatus.ToString(),
            NewStatus = request.NewStatus,
            ChangedAt = DateTime.UtcNow,
            ChangedByUserId = request.UserId ?? Guid.NewGuid(),
            ChangedByUserName = "System User",
            Reason = request.Reason,
            Location = request.Location,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IsAutomatic = request.IsAutomatic
        };

        await Task.CompletedTask;
        return historyRecord;
    }
}
