using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.PowerOnly;
using TMS.Domain.Entities.Loads;
using TMS.Infrastructure.Persistence;

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
    private readonly TMSDbContext _db;

    public GetPowerOnlyLoadsHandler(TMSDbContext db)
    {
        _db = db;
    }

    public async Task<List<PowerOnlyLoadResponse>> Handle(GetPowerOnlyLoadsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Loads
            .AsNoTracking()
            .Include(l => l.Driver)
            .Include(l => l.Tractor)
            .Where(l => l.CarrierId == request.CarrierId);

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<LoadStatus>(request.Status, true, out var status))
        {
            query = query.Where(l => l.Status == status);
        }

        var page = Math.Max(1, request.PageNumber);
        var size = Math.Clamp(request.PageSize, 1, 200);

        var loads = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        var results = loads.Select(l => new PowerOnlyLoadResponse
        {
            Id = l.Id,
            LoadNumber = l.LoadNumber,
            Status = l.Status.ToString(),
            TotalRevenue = l.TotalRevenue,
            DriverName = l.Driver != null ? ($"{l.Driver.FirstName} {l.Driver.LastName}") : null,
            TractorNumber = l.Tractor != null ? l.Tractor.UnitNumber : null,
            PickupDateTime = l.PickupDateTime,
            DeliveryDateTime = l.DeliveryDateTime,
            PickupAddress = FormatAddress(l.PickupLocation),
            DeliveryAddress = FormatAddress(l.DeliveryLocation)
        }).ToList();

        return results;
    }

    private static string FormatAddress(TMS.Domain.ValueObjects.Address a)
        => string.IsNullOrWhiteSpace(a.City) || string.IsNullOrWhiteSpace(a.State)
            ? a.Street
            : $"{a.City}, {a.State}";
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
    private readonly TMSDbContext _db;

    public GetPowerOnlyLoadByIdHandler(TMSDbContext db)
    {
        _db = db;
    }

    public async Task<PowerOnlyLoadResponse> Handle(GetPowerOnlyLoadByIdQuery request, CancellationToken cancellationToken)
    {
        var l = await _db.Loads
            .AsNoTracking()
            .Include(x => x.Driver)
            .Include(x => x.Tractor)
            .FirstOrDefaultAsync(x => x.Id == request.LoadId, cancellationToken)
            ?? throw new KeyNotFoundException($"Load {request.LoadId} not found");

        return new PowerOnlyLoadResponse
        {
            Id = l.Id,
            LoadNumber = l.LoadNumber,
            Status = l.Status.ToString(),
            TotalRevenue = l.TotalRevenue,
            DriverName = l.Driver != null ? ($"{l.Driver.FirstName} {l.Driver.LastName}") : null,
            TractorNumber = l.Tractor != null ? l.Tractor.UnitNumber : null,
            PickupDateTime = l.PickupDateTime,
            DeliveryDateTime = l.DeliveryDateTime,
            PickupAddress = FormatAddress(l.PickupLocation),
            DeliveryAddress = FormatAddress(l.DeliveryLocation)
        };
    }

    private static string FormatAddress(TMS.Domain.ValueObjects.Address a)
        => string.IsNullOrWhiteSpace(a.City) || string.IsNullOrWhiteSpace(a.State)
            ? a.Street
            : $"{a.City}, {a.State}";
}
