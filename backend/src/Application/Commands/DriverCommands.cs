using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs.Drivers;

namespace TMS.Application.Commands.Drivers;

/// <summary>
/// Command to create a new driver
/// </summary>
public class CreateDriverCommand : IRequest<DriverResponse>
{
    public Guid CarrierId { get; set; }
    public CreateDriverRequest Request { get; set; } = new();
}

/// <summary>
/// Command handler for creating drivers
/// </summary>
public class CreateDriverHandler : IRequestHandler<CreateDriverCommand, DriverResponse>
{
    public async Task<DriverResponse> Handle(CreateDriverCommand request, CancellationToken cancellationToken)
    {
        var driverId = Guid.NewGuid();
        
        await Task.CompletedTask;
        return new DriverResponse
        {
            Id = driverId,
            FirstName = request.Request.FirstName,
            LastName = request.Request.LastName,
            Email = request.Request.Email,
            PhoneNumber = request.Request.PhoneNumber,
            CDLNumber = request.Request.CDLNumber,
            CDLExpiryDate = request.Request.CDLExpiryDate,
            Status = "Active"
        };
    }
}

/// <summary>
/// Command to update driver details
/// </summary>
public class UpdateDriverCommand : IRequest<DriverResponse>
{
    public Guid DriverId { get; set; }
    public DriverResponse Request { get; set; } = new();
}

/// <summary>
/// Command handler for updating drivers
/// </summary>
public class UpdateDriverHandler : IRequestHandler<UpdateDriverCommand, DriverResponse>
{
    public async Task<DriverResponse> Handle(UpdateDriverCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
        var result = new DriverResponse
        {
            Id = request.DriverId,
            FirstName = request.Request.FirstName,
            LastName = request.Request.LastName,
            Email = request.Request.Email,
            PhoneNumber = request.Request.PhoneNumber,
            CDLNumber = request.Request.CDLNumber,
            CDLExpiryDate = request.Request.CDLExpiryDate,
            Status = request.Request.Status
        };
        return result;
    }
}
