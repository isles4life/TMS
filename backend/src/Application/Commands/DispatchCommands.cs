namespace TMS.Application.Commands.Dispatch;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;
using TMS.Application.Services;

/// <summary>
/// Command to assign a load to a driver (manual dispatch)
/// </summary>
public class AssignLoadCommand : IRequest<DispatchResponse>
{
    public required DispatchRequest Request { get; set; }
}

public class AssignLoadHandler : IRequestHandler<AssignLoadCommand, DispatchResponse>
{
    private readonly IDispatchService _dispatchService;

    public AssignLoadHandler(IDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    public async Task<DispatchResponse> Handle(AssignLoadCommand request, CancellationToken cancellationToken)
    {
        return await _dispatchService.AssignLoadAsync(request.Request);
    }
}

/// <summary>
/// Command to accept a dispatch assignment (driver action)
/// </summary>
public class AcceptDispatchCommand : IRequest<DispatchResponse>
{
    public Guid DispatchId { get; set; }
}

public class AcceptDispatchHandler : IRequestHandler<AcceptDispatchCommand, DispatchResponse>
{
    private readonly IDispatchService _dispatchService;

    public AcceptDispatchHandler(IDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    public async Task<DispatchResponse> Handle(AcceptDispatchCommand request, CancellationToken cancellationToken)
    {
        return await _dispatchService.AcceptDispatchAsync(request.DispatchId);
    }
}

/// <summary>
/// Command to reject a dispatch assignment (driver action)
/// </summary>
public class RejectDispatchCommand : IRequest<DispatchResponse>
{
    public Guid DispatchId { get; set; }
    public required string Reason { get; set; }
}

public class RejectDispatchHandler : IRequestHandler<RejectDispatchCommand, DispatchResponse>
{
    private readonly IDispatchService _dispatchService;

    public RejectDispatchHandler(IDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    public async Task<DispatchResponse> Handle(RejectDispatchCommand request, CancellationToken cancellationToken)
    {
        return await _dispatchService.RejectDispatchAsync(request.DispatchId, request.Reason);
    }
}

/// <summary>
/// Command to cancel a dispatch assignment
/// </summary>
public class CancelDispatchCommand : IRequest<DispatchResponse>
{
    public Guid DispatchId { get; set; }
}

public class CancelDispatchHandler : IRequestHandler<CancelDispatchCommand, DispatchResponse>
{
    private readonly IDispatchService _dispatchService;

    public CancelDispatchHandler(IDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    public async Task<DispatchResponse> Handle(CancelDispatchCommand request, CancellationToken cancellationToken)
    {
        return await _dispatchService.CancelDispatchAsync(request.DispatchId);
    }
}

/// <summary>
/// Command to update driver availability and location
/// </summary>
public class UpdateDriverAvailabilityCommand : IRequest<DriverAvailabilityResponse>
{
    public required DriverAvailabilityRequest Request { get; set; }
}

public class UpdateDriverAvailabilityHandler : IRequestHandler<UpdateDriverAvailabilityCommand, DriverAvailabilityResponse>
{
    private readonly IDispatchService _dispatchService;

    public UpdateDriverAvailabilityHandler(IDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    public async Task<DriverAvailabilityResponse> Handle(UpdateDriverAvailabilityCommand request, CancellationToken cancellationToken)
    {
        return await _dispatchService.UpdateDriverAvailabilityAsync(request.Request);
    }
}
