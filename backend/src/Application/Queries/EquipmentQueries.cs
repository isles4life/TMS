using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs.Equipment;

namespace TMS.Application.Queries.Equipment;

/// <summary>
/// Query to get Power Only tractors for a carrier
/// </summary>
public class GetPowerOnlyTractorsQuery : IRequest<List<PowerOnlyTractorResponse>>
{
    public Guid CarrierId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

/// <summary>
/// Query handler for retrieving Power Only tractors
/// </summary>
public class GetPowerOnlyTractorsHandler : IRequestHandler<GetPowerOnlyTractorsQuery, List<PowerOnlyTractorResponse>>
{
    public async Task<List<PowerOnlyTractorResponse>> Handle(GetPowerOnlyTractorsQuery request, CancellationToken cancellationToken)
    {
        var mockTractors = new List<PowerOnlyTractorResponse>
        {
            new()
            {
                Id = Guid.NewGuid(),
                UnitNumber = "CAT-001",
                VIN = "1HGBH41JXMN109186",
                LicensePlate = "CAT001",
                Make = "Freightliner",
                Model = "Cascadia",
                Year = 2022,
                Status = "Active",
                CurrentMileage = 125000m
            },
            new()
            {
                Id = Guid.NewGuid(),
                UnitNumber = "CAT-002",
                VIN = "1HGBH41JXMN109187",
                LicensePlate = "CAT002",
                Make = "Peterbilt",
                Model = "579",
                Year = 2021,
                Status = "Active",
                CurrentMileage = 185000m
            }
        };
        
        await Task.CompletedTask;
        return mockTractors;
    }
}

/// <summary>
/// Query to get a single Power Only tractor by ID
/// </summary>
public class GetPowerOnlyTractorByIdQuery : IRequest<PowerOnlyTractorResponse>
{
    public Guid TractorId { get; set; }
}

/// <summary>
/// Query handler for retrieving a single Power Only tractor
/// </summary>
public class GetPowerOnlyTractorByIdHandler : IRequestHandler<GetPowerOnlyTractorByIdQuery, PowerOnlyTractorResponse>
{
    public async Task<PowerOnlyTractorResponse> Handle(GetPowerOnlyTractorByIdQuery request, CancellationToken cancellationToken)
    {
        var mockTractor = new PowerOnlyTractorResponse
        {
            Id = request.TractorId,
            UnitNumber = "CAT-001",
            VIN = "1HGBH41JXMN109186",
            LicensePlate = "CAT001",
            Make = "Freightliner",
            Model = "Cascadia",
            Year = 2022,
            Status = "Active",
            CurrentMileage = 125000m
        };
        
        await Task.CompletedTask;
        return mockTractor;
    }
}
