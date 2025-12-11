using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace TMS.API.Hubs;

/// <summary>
/// SignalR hub for real-time Proof of Delivery updates
/// Enables dispatch team to see POD status changes in real-time
/// </summary>
public class PODHub : Hub
{
    /// <summary>
    /// Notify all connected clients that a POD was created
    /// </summary>
    public async Task NotifyPODCreated(string podId, string loadId, string driverId)
    {
        await Clients.All.SendAsync("PODCreated", new { podId, loadId, driverId });
    }

    /// <summary>
    /// Notify clients that a POD was signed by recipient
    /// </summary>
    public async Task NotifyPODSigned(string podId, string recipientName, DateTime deliveryDateTime)
    {
        await Clients.All.SendAsync("PODSigned", new { podId, recipientName, deliveryDateTime });
    }

    /// <summary>
    /// Notify clients that a POD was completed and finalized
    /// </summary>
    public async Task NotifyPODCompleted(string podId, string loadId)
    {
        await Clients.All.SendAsync("PODCompleted", new { podId, loadId });
    }

    /// <summary>
    /// Notify clients that photos were added to a POD
    /// </summary>
    public async Task NotifyPhotosAdded(string podId, int photoCount)
    {
        await Clients.All.SendAsync("PhotosAdded", new { podId, photoCount });
    }

    /// <summary>
    /// Subscribe to updates for a specific POD
    /// </summary>
    public async Task SubscribeToPOD(string podId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"pod-{podId}");
    }

    /// <summary>
    /// Unsubscribe from updates for a specific POD
    /// </summary>
    public async Task UnsubscribeFromPOD(string podId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"pod-{podId}");
    }

    /// <summary>
    /// Subscribe to dispatch updates for a driver
    /// </summary>
    public async Task SubscribeToDriverUpdates(string driverId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"driver-{driverId}");
    }

    /// <summary>
    /// Unsubscribe from dispatch updates for a driver
    /// </summary>
    public async Task UnsubscribeFromDriverUpdates(string driverId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"driver-{driverId}");
    }
}
