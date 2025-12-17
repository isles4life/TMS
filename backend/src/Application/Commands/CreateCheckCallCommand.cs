namespace TMS.Application.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;
using TMS.Domain.Entities.Loads;

/// <summary>
/// Command to create a new check call for a load
/// </summary>
public class CreateCheckCallCommand : IRequest<CheckCallDto>
{
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public string ContactMethod { get; set; } = "Phone";
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsTruckEmpty { get; set; }
    public int? TrailerTemperature { get; set; }
    public string? ETA { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Command handler for creating check calls
/// </summary>
public class CreateCheckCallHandler : IRequestHandler<CreateCheckCallCommand, CheckCallDto>
{
    public async Task<CheckCallDto> Handle(CreateCheckCallCommand request, CancellationToken cancellationToken)
    {
        // In production, you would:
        // 1. Validate that the load exists
        // 2. Validate that the driver exists
        // 3. Create the CheckCall entity
        // 4. Save to database via repository
        // 5. Return the DTO

        // For now, returning mock data that follows the pattern
        var checkCall = new CheckCall
        {
            Id = Guid.NewGuid(),
            LoadId = request.LoadId,
            DriverId = request.DriverId,
            CheckInTime = DateTime.UtcNow,
            ContactMethod = request.ContactMethod,
            Location = request.Location,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IsTruckEmpty = request.IsTruckEmpty,
            TrailerTemperature = request.TrailerTemperature,
            ETA = request.ETA,
            Notes = request.Notes
        };

        var dto = new CheckCallDto
        {
            Id = checkCall.Id,
            LoadId = checkCall.LoadId,
            DriverId = checkCall.DriverId,
            DriverName = "John Doe", // This would come from the driver entity
            CheckInTime = checkCall.CheckInTime,
            ContactMethod = checkCall.ContactMethod,
            Location = checkCall.Location,
            Latitude = checkCall.Latitude,
            Longitude = checkCall.Longitude,
            IsTruckEmpty = checkCall.IsTruckEmpty,
            TrailerTemperature = checkCall.TrailerTemperature,
            ETA = checkCall.ETA,
            Notes = checkCall.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await Task.CompletedTask;
        return dto;
    }
}
