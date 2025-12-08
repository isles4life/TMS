using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs.Equipment;

namespace TMS.Application.Commands.Equipment;

/// <summary>
/// Command to create a new Power Only tractor
/// </summary>
public class CreatePowerOnlyTractorCommand : IRequest<PowerOnlyTractorResponse>
{
    public Guid CarrierId { get; set; }
    public CreatePowerOnlyTractorRequest Request { get; set; } = new();
}

/// <summary>
/// Command handler for creating Power Only tractors
/// </summary>
public class CreatePowerOnlyTractorHandler : IRequestHandler<CreatePowerOnlyTractorCommand, PowerOnlyTractorResponse>
{
    public async Task<PowerOnlyTractorResponse> Handle(CreatePowerOnlyTractorCommand request, CancellationToken cancellationToken)
    {
        var tractorId = Guid.NewGuid();
        
        await Task.CompletedTask;
        return new PowerOnlyTractorResponse
        {
            Id = tractorId,
            UnitNumber = request.Request.UnitNumber,
            VIN = request.Request.VIN,
            LicensePlate = request.Request.LicensePlate,
            Make = request.Request.Make,
            Model = request.Request.Model,
            Year = request.Request.Year,
            Status = "Active",
            CurrentMileage = 0m
        };
    }
}

/// <summary>
/// Command to update Power Only tractor details
/// </summary>
public class UpdatePowerOnlyTractorCommand : IRequest<PowerOnlyTractorResponse>
{
    public Guid TractorId { get; set; }
    public PowerOnlyTractorResponse Request { get; set; } = new();
}

/// <summary>
/// Command handler for updating Power Only tractors
/// </summary>
public class UpdatePowerOnlyTractorHandler : IRequestHandler<UpdatePowerOnlyTractorCommand, PowerOnlyTractorResponse>
{
    public async Task<PowerOnlyTractorResponse> Handle(UpdatePowerOnlyTractorCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        var result = new PowerOnlyTractorResponse
        {
            Id = request.TractorId,
            UnitNumber = request.Request.UnitNumber,
            VIN = request.Request.VIN,
            LicensePlate = request.Request.LicensePlate,
            Make = request.Request.Make,
            Model = request.Request.Model,
            Year = request.Request.Year,
            Status = request.Request.Status,
            CurrentMileage = request.Request.CurrentMileage
        };
        return result;
    }
}

