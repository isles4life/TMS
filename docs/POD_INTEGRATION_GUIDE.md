# POD System Integration Guide

## Overview

This guide explains how to integrate the new Proof of Delivery (POD) system with existing TMS workflows, particularly the dispatch and load completion processes.

## Integration Points

### 1. Load Delivery Completion Trigger

When a load transitions to "Delivered" status, automatically create a POD record:

**Location**: `Application/Services/DispatchService.cs`

```csharp
// Add to CompleteDeliveryAsync method
public async Task CompleteDeliveryAsync(string loadId, CompleteDeliveryDto dto)
{
    // ... existing load completion logic ...
    
    // Create POD record for this delivery
    var podDto = new CreateProofOfDeliveryDto
    {
        tripId = load.TripId,
        loadId = loadId,
        driverId = load.DriverId,
        deliveryLocation = dto.DeliveryLocation,
        deliveryLatitude = dto.DeliveryLatitude,
        deliveryLongitude = dto.DeliveryLongitude,
        estimatedDeliveryDateTime = load.EstimatedDeliveryDateTime
    };
    
    var pod = await _proofOfDeliveryService.CreateProofOfDeliveryAsync(podDto);
    
    // Store POD ID for driver reference
    load.ProofOfDeliveryId = pod.Id; // Add this property to Load entity
}
```

### 2. Driver Dashboard Integration

Add POD actions to driver dashboard:

**Location**: `frontend/libs/features/drivers/src/lib/components/driver-dashboard/`

```typescript
// In driver-dashboard.component.ts
getDriverPendingPODs(driverId: string): void {
  this.podService.getByDriverId(driverId).subscribe(pods => {
    this.pendingPODs = pods.filter(p => p.status !== 3); // Not completed
  });
}

startPODCapture(loadId: string): void {
  this.podService.getByLoadId(loadId).subscribe(pod => {
    this.router.navigate(['/dispatch/pod/capture', pod.id]);
  });
}
```

### 3. Dispatch Board Updates

Add POD status column to dispatch board:

**Location**: `frontend/libs/features/dispatch/src/lib/components/dispatch-board/`

```typescript
// Add to dispatch board data columns
{
  header: 'POD Status',
  field: 'podStatus',
  width: '100px',
  sortable: true,
  filterPlaceholder: 'Filter POD...'
}

// Fetch POD status for each dispatch row
loadDispatchWithPODs(): void {
  this.dispatchService.getAllDispatch().subscribe(dispatches => {
    dispatches.forEach(dispatch => {
      this.podService.getByLoadId(dispatch.loadId).subscribe(
        pod => {
          dispatch.podStatus = this.getPODStatus(pod?.status);
          dispatch.podId = pod?.id;
        },
        () => {
          dispatch.podStatus = 'No POD';
        }
      );
    });
    this.dispatches = dispatches;
  });
}

getPODStatus(status: number): string {
  const statuses = ['Draft', 'Pending', 'Signed', 'Completed'];
  return statuses[status] || 'Unknown';
}
```

### 4. Real-Time Notifications

Add SignalR integration for POD status updates:

**Location**: `API/Hubs/PODHub.cs` (Create new)

```csharp
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TMS.API.Hubs
{
    public class PODHub : Hub
    {
        public async Task NotifyPODCreated(string podId, string loadId)
        {
            await Clients.All.SendAsync("PODCreated", podId, loadId);
        }

        public async Task NotifyPODSigned(string podId, string recipientName)
        {
            await Clients.All.SendAsync("PODSigned", podId, recipientName);
        }

        public async Task NotifyPODCompleted(string podId)
        {
            await Clients.All.SendAsync("PODCompleted", podId);
        }

        public async Task SubscribeToPOD(string podId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"pod-{podId}");
        }

        public async Task UnsubscribeFromPOD(string podId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"pod-{podId}");
        }
    }
}
```

Register in Program.cs:
```csharp
app.MapHub<TMS.API.Hubs.PODHub>("/hubs/pod");
```

### 5. Update Endpoints to Broadcast Events

**Location**: `API/Endpoints/ProofOfDeliveryEndpoints.cs`

Add after each significant operation:

```csharp
private static async Task<IResult> SignProofOfDelivery(
    string id,
    SignProofOfDeliveryDto dto,
    IProofOfDeliveryService service,
    IHubContext<TMS.API.Hubs.PODHub> hubContext) // Add parameter
{
    try
    {
        var result = await service.SignProofOfDeliveryAsync(id, dto);
        
        // Broadcast to connected clients
        await hubContext.Clients.Group($"pod-{id}")
            .SendAsync("PODSigned", id, dto.RecipientName);
        
        return Results.Ok(result);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
}
```

### 6. Frontend SignalR Integration

**Location**: `libs/core/src/lib/services/proof-of-delivery.service.ts`

Add SignalR connection:

```typescript
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class ProofOfDeliveryService {
  private hubConnection: HubConnection | null = null;
  private podStatusChanged$ = new Subject<any>();

  constructor(private http: HttpClient) {
    this.initializeSignalR();
  }

  private initializeSignalR(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/hubs/pod')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('PODCreated', (podId, loadId) => {
      this.podStatusChanged$.next({ type: 'created', podId, loadId });
    });

    this.hubConnection.on('PODSigned', (podId, recipientName) => {
      this.podStatusChanged$.next({ type: 'signed', podId, recipientName });
    });

    this.hubConnection.on('PODCompleted', (podId) => {
      this.podStatusChanged$.next({ type: 'completed', podId });
    });

    this.hubConnection.start().catch(err => console.error(err));
  }

  getPODStatusChanged() {
    return this.podStatusChanged$.asObservable();
  }

  subscribeToPOD(podId: string): void {
    this.hubConnection?.invoke('SubscribeToPOD', podId)
      .catch(err => console.error(err));
  }

  unsubscribeFromPOD(podId: string): void {
    this.hubConnection?.invoke('UnsubscribeFromPOD', podId)
      .catch(err => console.error(err));
  }
}
```

### 7. Dispatch Component Updates

Listen for POD status changes:

```typescript
// In dispatch-board.component.ts
ngOnInit(): void {
  this.loadDispatch();
  
  // Listen for POD status changes
  this.podService.getPODStatusChanged().subscribe(change => {
    if (change.type === 'signed') {
      this.showNotification(`POD signed by ${change.recipientName}`);
      this.refreshDispatchBoard();
    } else if (change.type === 'completed') {
      this.showNotification('POD completed and finalized');
      this.refreshDispatchBoard();
    }
  });
}
```

### 8. Entity Model Updates

Add POD reference to Load entity:

**Location**: `Domain/Entities/Loads/Load.cs`

```csharp
public class Load : BaseEntity
{
    // ... existing properties ...
    
    public string? ProofOfDeliveryId { get; set; }
    public ProofOfDelivery? ProofOfDelivery { get; set; }
    
    // ... rest of class ...
}
```

Update DbContext:

```csharp
// In TMSDbContext.cs OnModelCreating
modelBuilder.Entity<Load>()
    .HasOne(l => l.ProofOfDelivery)
    .WithMany()
    .HasForeignKey(p => p.LoadId)
    .OnDelete(DeleteBehavior.Cascade);
```

### 9. Reporting Integration

Add POD data to delivery reports:

**Location**: `Application/Services/ReportService.cs`

```csharp
public async Task<DeliveryReportDto> GenerateDeliveryReportAsync(
    DateTime startDate,
    DateTime endDate)
{
    var pods = await _podRepository.GetByDateRangeAsync(startDate, endDate);
    
    var report = new DeliveryReportDto
    {
        TotalDeliveries = pods.Count,
        OnTimeDeliveries = pods.Count(p => p.IsOnTime == true),
        OnTimePercentage = pods.Count(p => p.IsOnTime == true) / (double)pods.Count,
        AverageDeliveryTime = pods.Average(p => 
            (p.DeliveryDateTime - p.CreatedAt)?.TotalMinutes ?? 0),
        ProofsOfDelivery = pods
            .Select(p => new PODReportItemDto
            {
                PODId = p.Id,
                LoadId = p.LoadId,
                RecipientName = p.RecipientName,
                DeliveryDateTime = p.DeliveryDateTime,
                PhotoCount = p.Photos.Count,
                IsOnTime = p.IsOnTime
            })
            .ToList()
    };
    
    return report;
}
```

## Implementation Checklist

- [ ] Add POD creation trigger in DispatchService
- [ ] Add ProofOfDeliveryId to Load entity
- [ ] Update DbContext with relationship
- [ ] Create PODHub for SignalR
- [ ] Update endpoints to broadcast events
- [ ] Add SignalR integration to frontend service
- [ ] Update dispatch board to show POD status
- [ ] Add POD subscription logic to components
- [ ] Create notification service
- [ ] Add reporting integration
- [ ] Test full workflow end-to-end
- [ ] Update user documentation
- [ ] Deploy to staging
- [ ] Perform UAT
- [ ] Deploy to production

## Testing Scenarios

### Scenario 1: Complete Delivery with POD
1. Load marked as "Out for Delivery"
2. POD created automatically
3. Driver sees pending POD in dashboard
4. Driver captures photos and signature
5. POD signed and completed
6. Load status updates to "Completed"
7. Dispatch board reflects POD completion

### Scenario 2: Multiple Photos
1. Driver uploads 5 photos
2. System validates file size limits
3. GPS metadata captured for each
4. All photos visible in review step
5. POD completes with photo evidence

### Scenario 3: Late Delivery
1. Load has EstimatedDeliveryDateTime
2. POD created with delivery time
3. IsOnTime calculated as false
4. Report shows late delivery
5. Dashboard flags with warning badge

### Scenario 4: Real-Time Updates
1. Driver signs POD
2. SignalR broadcasts "PODSigned" event
3. Dispatcher sees status change immediately
4. No page refresh needed
5. Notification appears in dashboard

## Performance Considerations

- Filter POD queries by date range for large datasets
- Implement pagination for POD history lists
- Cache frequently accessed POD counts
- Use lazy loading for photo data
- Consider archiving old PODs (90+ days)

## Security Considerations

- Validate photo uploads server-side
- Scan uploaded files for malware
- Verify POD ownership before allowing edits
- Log all POD modifications for audit trail
- Encrypt signature data in transit (HTTPS required)
- Require authentication for all POD operations

## Rollback Plan

If issues arise:

1. Disable POD creation trigger in DispatchService
2. Keep POD UI components but disable navigation
3. Keep database tables intact
4. Archive affected PODs
5. Manual recovery procedure:
   - Restore from backup
   - Revert migrations
   - Redeploy previous version

## Support Contact

For questions or issues with POD system integration, contact the TMS development team.

---

**Version**: 1.0
**Created**: December 2024
**Last Updated**: December 2024
