namespace TMS.Application.Queries.Dispatch;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;
using TMS.Application.Services;

/// <summary>
/// Query to find best driver matches for a load (auto-dispatch)
/// </summary>
public class FindDriverMatchesQuery : IRequest<List<DriverMatchResponse>>
{
    public Guid LoadId { get; set; }
    public int MaxMatches { get; set; } = 5;
}

public class FindDriverMatchesHandler : IRequestHandler<FindDriverMatchesQuery, List<DriverMatchResponse>>
{
    private readonly IDispatchService _dispatchService;

    public FindDriverMatchesHandler(IDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    public async Task<List<DriverMatchResponse>> Handle(FindDriverMatchesQuery request, CancellationToken cancellationToken)
    {
        return await _dispatchService.FindBestMatchesAsync(request.LoadId, request.MaxMatches);
    }
}

/// <summary>
/// Query to get active dispatches
/// </summary>
public class GetActiveDispatchesQuery : IRequest<List<DispatchResponse>>
{
    public Guid? DriverId { get; set; }
}

public class GetActiveDispatchesHandler : IRequestHandler<GetActiveDispatchesQuery, List<DispatchResponse>>
{
    private readonly IDispatchService _dispatchService;

    public GetActiveDispatchesHandler(IDispatchService dispatchService)
    {
        _dispatchService = dispatchService;
    }

    public async Task<List<DispatchResponse>> Handle(GetActiveDispatchesQuery request, CancellationToken cancellationToken)
    {
        return await _dispatchService.GetActiveDispatchesAsync(request.DriverId);
    }
}
