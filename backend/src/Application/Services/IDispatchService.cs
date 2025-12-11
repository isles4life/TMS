namespace TMS.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Application.DTOs;

public interface IDispatchService
{
    Task<List<DriverMatchResponse>> FindBestMatchesAsync(Guid loadId, int maxMatches = 5);
    Task<DispatchResponse> AssignLoadAsync(DispatchRequest request);
    Task<DispatchResponse> AcceptDispatchAsync(Guid dispatchId);
    Task<DispatchResponse> RejectDispatchAsync(Guid dispatchId, string reason);
    Task<List<DispatchResponse>> GetActiveDispatchesAsync(Guid? driverId = null);
    Task<DriverAvailabilityResponse> UpdateDriverAvailabilityAsync(DriverAvailabilityRequest request);
    Task<DispatchResponse> CompleteDeliveryAsync(Guid dispatchId, Guid loadId);
    decimal CalculateProximityScore(decimal distanceMiles);
    decimal CalculateAvailabilityScore(decimal hoursAvailable);
    decimal CalculatePerformanceScore(decimal onTimeRate, decimal acceptanceRate, int completedLoads);
}
