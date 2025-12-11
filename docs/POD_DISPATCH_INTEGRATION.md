# POD-Dispatch Workflow Integration - Implementation Guide

## Overview

This guide details the complete integration of the Proof of Delivery (POD) system with the TMS Dispatch workflow. The integration is **event-driven** using real-time SignalR notifications for seamless status updates.

---

## Architecture

```
Dispatch Service → Triggers POD Creation → PODHub → Real-time Updates
                                         ↓
                                      Frontend
                                    (Components)
```

### Data Flow

1. **Load Delivered**: DispatchService marks load as "Delivered"
2. **POD Auto-Creation**: System creates POD in Draft status
3. **SignalR Broadcast**: PODHub notifies all connected clients
4. **UI Update**: Dispatch board refreshes with POD status
5. **Driver Notification**: Driver receives POD capture prompt
6. **POD Completion**: Driver captures photos and signature
7. **Load Finalization**: Upon POD completion, load marked as "Completed"

---

## Backend Implementation

### 1. Load Entity Updated ✅

**File**: `backend/src/Domain/Entities/Loads/Load.cs`

```csharp
public class Load : BaseEntity
{
    // ... existing properties ...
    
    // Proof of Delivery reference
    public string? ProofOfDeliveryId { get; set; }
    public ProofOfDelivery? ProofOfDelivery { get; set; }
}
```

### 2. PODHub Created ✅

**File**: `backend/src/API/Hubs/PODHub.cs`

Methods for real-time notifications:
- `NotifyPODCreated(podId, loadId, driverId)`
- `NotifyPODSigned(podId, recipientName, deliveryDateTime)`
- `NotifyPODCompleted(podId, loadId)`
- `SubscribeToPOD(podId)` / `UnsubscribeFromPOD(podId)`
- `SubscribeToDriverUpdates(driverId)` / `UnsubscribeFromDriverUpdates(driverId)`

### 3. Endpoints Broadcast Events ✅

**File**: `backend/src/API/Endpoints/ProofOfDeliveryEndpoints.cs`

Each endpoint now broadcasts to SignalR:

```csharp
// Create endpoint broadcasts PODCreated
await _hubContext.Clients.Group($"driver-{dto.DriverId}")
    .SendAsync("PODCreated", result.Id, dto.LoadId, dto.DriverId);

// Sign endpoint broadcasts PODSigned
await _hubContext.Clients.Group($"pod-{id}")
    .SendAsync("PODSigned", id, dto.RecipientName, result.DeliveryDateTime);

// Complete endpoint broadcasts PODCompleted
await _hubContext.Clients.Group($"pod-{id}")
    .SendAsync("PODCompleted", id, result.LoadId);
```

### 4. Hub Registered in Program.cs ✅

**File**: `backend/src/API/Program.cs`

```csharp
// Register SignalR hubs
app.MapHub<TMS.API.Hubs.PODHub>("/hubs/pod");
```

### 5. Trigger POD Creation in DispatchService

**File**: `backend/src/Application/Services/DispatchService.cs` (To be updated)

Add this method to create POD when load is delivered:

```csharp
public async Task<ProofOfDeliveryDto> CreatePODForDeliveredLoadAsync(
    string loadId,
    string tripId,
    string driverId,
    string? deliveryLocation = null,
    decimal? latitude = null,
    decimal? longitude = null)
{
    // Validate load exists and is marked as delivered
    var load = await _context.Loads.FindAsync(loadId);
    if (load == null)
        throw new KeyNotFoundException($"Load {loadId} not found");

    if (load.Status != LoadStatus.Delivered)
        throw new InvalidOperationException("Load must be marked as Delivered before creating POD");

    // Check if POD already exists
    if (load.ProofOfDeliveryId != null)
        throw new InvalidOperationException("POD already exists for this load");

    // Create POD
    var createPodDto = new CreateProofOfDeliveryDto
    {
        loadId = loadId,
        tripId = tripId,
        driverId = driverId,
        deliveryLocation = deliveryLocation,
        deliveryLatitude = latitude,
        deliveryLongitude = longitude,
        estimatedDeliveryDateTime = load.DeliveryDateTime
    };

    var pod = await _proofOfDeliveryService.CreateProofOfDeliveryAsync(createPodDto);

    // Link POD to load
    load.ProofOfDeliveryId = pod.Id;
    await _context.SaveChangesAsync();

    return pod;
}
```

Modify the existing delivery completion method:

```csharp
public async Task CompleteDeliveryAsync(string loadId, CompleteDeliveryDto dto)
{
    var load = await _context.Loads.FindAsync(loadId);
    if (load == null)
        throw new KeyNotFoundException();

    // ... existing validation ...

    // Mark load as delivered
    load.Status = LoadStatus.Delivered;
    load.DeliveredAt = DateTime.UtcNow;

    // AUTO-CREATE POD
    if (string.IsNullOrEmpty(load.ProofOfDeliveryId))
    {
        try
        {
            var pod = await CreatePODForDeliveredLoadAsync(
                loadId,
                load.TripId,
                load.DriverId,
                dto.DeliveryLocation,
                dto.Latitude,
                dto.Longitude
            );
            
            // POD will be created in Draft status, awaiting driver action
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to create POD for load {loadId}: {ex.Message}");
            // Don't fail the delivery if POD creation fails
        }
    }

    await _context.SaveChangesAsync();
}
```

---

## Frontend Implementation

### 1. POD SignalR Service ✅

**File**: `frontend/libs/core/src/lib/services/pod-signalr.service.ts`

Provides real-time listening:
- Connects to `/hubs/pod`
- Listens for: PODCreated, PODSigned, PODCompleted, PhotosAdded
- Provides subscriptions to specific PODs or drivers
- Auto-reconnect with exponential backoff

Usage:

```typescript
constructor(private podSignalR: PODSignalRService) {
  // Listen for POD events
  this.podSignalR.getPODStatusChanged().subscribe(event => {
    if (event.type === 'created') {
      console.log(`POD created for load: ${event.loadId}`);
    }
  });

  // Check connection state
  this.podSignalR.getConnectionState().subscribe(state => {
    console.log(`POD Hub connection: ${state}`);
  });
}
```

### 2. Dispatch-POD Integration Service ✅

**File**: `frontend/libs/core/src/lib/services/dispatch-pod-integration.service.ts`

High-level integration methods:

```typescript
// Create POD when load is delivered
await this.integration.createPODForDelivery(
  loadId,
  tripId,
  driverId,
  deliveryLocation,
  latitude,
  longitude
);

// Get POD for a load
this.integration.checkPODForLoad(loadId).subscribe(pod => {
  if (pod) {
    console.log(`POD Status: ${pod.status}`);
  }
});

// Batch get PODs for dispatch board
this.integration.getPODsForLoads(loadIds).subscribe(podMap => {
  podMap.forEach((pod, loadId) => {
    // Update UI with POD data
  });
});

// Listen for POD creation events
this.integration.getPODCreatedForLoad().subscribe(event => {
  console.log(`POD ${event.podId} created for load ${event.loadId}`);
  // Refresh dispatch board
});

// Listen for POD completion events
this.integration.getPODCompletedForLoad().subscribe(event => {
  console.log(`POD ${event.podId} completed for load ${event.loadId}`);
  // Update load status to Completed
});
```

### 3. POD Status Badge Component ✅

**File**: `frontend/libs/features/dispatch/src/lib/components/pod-status-badge/`

Displays POD status in dispatch board:

```html
<tms-pod-status-badge 
  [podId]="dispatch.podId"
  [podStatus]="dispatch.podStatus"
  [driverId]="dispatch.driverId"
  [loadId]="dispatch.loadId"
  (viewPOD)="viewPODDetails($event)"
  (capturePOD)="startPODCapture($event)">
</tms-pod-status-badge>
```

### 4. Update Dispatch Board Component

**File**: `frontend/libs/features/dispatch/src/lib/components/dispatch-board/`

```typescript
import { DispatchPODIntegrationService } from '@tms/core/services';
import { PODSignalRService } from '@tms/core/services';

export class DispatchBoardComponent implements OnInit, OnDestroy {
  dispatches: DispatchDto[] = [];

  constructor(
    private dispatchService: DispatchService,
    private podIntegration: DispatchPODIntegrationService,
    private podSignalR: PODSignalRService
  ) {}

  ngOnInit(): void {
    this.loadDispatchBoard();
    this.listenToPODUpdates();
  }

  private loadDispatchBoard(): void {
    this.dispatchService.getAllDispatch().subscribe(dispatches => {
      this.dispatches = dispatches;
      
      // Fetch POD status for each dispatch
      const loadIds = dispatches.map(d => d.loadId);
      this.podIntegration.getPODsForLoads(loadIds).subscribe(podMap => {
        this.dispatches.forEach(dispatch => {
          const pod = podMap.get(dispatch.loadId);
          if (pod) {
            dispatch.podId = pod.id;
            dispatch.podStatus = pod.status;
            dispatch.podRecipient = pod.recipientName;
          }
        });
      });
    });
  }

  private listenToPODUpdates(): void {
    // Subscribe to POD creation events
    this.podIntegration.getPODCreatedForLoad().subscribe(event => {
      const dispatch = this.dispatches.find(d => d.loadId === event.loadId);
      if (dispatch) {
        dispatch.podId = event.podId;
        dispatch.podStatus = 0; // Draft
        this.showNotification(`POD created for load ${event.loadId}`);
      }
    });

    // Subscribe to POD completion events
    this.podIntegration.getPODCompletedForLoad().subscribe(event => {
      const dispatch = this.dispatches.find(d => d.loadId === event.loadId);
      if (dispatch) {
        dispatch.podStatus = 3; // Completed
        this.showNotification(`POD completed for load ${event.loadId}`);
        // Update load status to Completed
        this.updateLoadStatus(event.loadId, 'Completed');
      }
    });

    // Subscribe to real-time POD status changes
    this.podSignalR.getPODStatusChanged().subscribe(event => {
      if (event.type === 'signed') {
        const dispatch = this.dispatches.find(d => d.podId === event.podId);
        if (dispatch) {
          dispatch.podStatus = 2; // Signed
          dispatch.podRecipient = event.recipientName;
        }
      }
    });
  }

  viewPODDetails(podId: string): void {
    this.router.navigate(['/dispatch/pod', podId]);
  }

  startPODCapture(podId: string): void {
    this.router.navigate(['/dispatch/pod/capture', podId]);
  }

  private showNotification(message: string): void {
    // Use your notification service
    console.log(message);
  }

  private updateLoadStatus(loadId: string, status: string): void {
    this.dispatchService.updateLoadStatus(loadId, status).subscribe(() => {
      this.loadDispatchBoard(); // Refresh
    });
  }

  ngOnDestroy(): void {
    this.podIntegration.dispose();
  }
}
```

---

## Database Migration

After updating the Load entity, create a new migration:

```bash
cd backend/src/API
dotnet ef migrations add AddProofOfDeliveryToLoad
dotnet ef database update
```

The migration will add the `ProofOfDeliveryId` nullable foreign key column to the Loads table.

---

## API Endpoints for Integration

### Check if POD exists for a load
```
GET /api/proof-of-delivery/load/{loadId}
Response: ProofOfDeliveryDto or 404
```

### Get pending PODs (incomplete)
```
GET /api/proof-of-delivery/pending/all
Response: ProofOfDeliveryListDto[]
```

### Get driver's POD history
```
GET /api/proof-of-delivery/driver/{driverId}?startDate=2024-01-01&endDate=2024-12-31
Response: ProofOfDeliveryListDto[]
```

---

## Event Flow Diagrams

### POD Creation Flow
```
Load Status Changed to "Delivered"
        ↓
DispatchService.CompleteDeliveryAsync()
        ↓
CreatePODForDeliveredLoadAsync()
        ↓
ProofOfDeliveryService.CreateProofOfDeliveryAsync()
        ↓
PODHub.NotifyPODCreated()  ← SignalR Broadcast
        ↓
Frontend (Dispatch Board) Receives Event
        ↓
UI Updates with POD Status Badge
        ↓
Driver Sees POD in Dashboard
```

### POD Completion Flow
```
Driver Captures Photos
        ↓
Driver Signs POD
        ↓
PODHub.NotifyPODSigned()  ← SignalR Broadcast
        ↓
Frontend Receives "PODSigned" Event
        ↓
UI Updates Status to "Signed"
        ↓
Driver Completes POD
        ↓
PODHub.NotifyPODCompleted()  ← SignalR Broadcast
        ↓
Frontend Receives "PODCompleted" Event
        ↓
System Updates Load Status to "Completed"
        ↓
Dispatch Board Refreshes
```

---

## Configuration

### Backend - appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.AspNetCore.SignalR": "Information"
    }
  },
  "ProofOfDelivery": {
    "AutoCreateOnDeliver": true,
    "MaxPhotoSizeBytes": 10485760,
    "MaxTotalPhotoSizeBytes": 104857600
  }
}
```

### Frontend - environment.ts

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
  signalRUrl: 'http://localhost:5000',
  pod: {
    hubUrl: '/hubs/pod',
    reconnectDelay: [0, 0, 3000, 5000, 10000, 15000]
  }
};
```

---

## Error Handling

### POD Already Exists
- System prevents duplicate POD creation
- User receives error message
- Existing POD is used instead

### POD Creation Fails
- Load still marked as Delivered
- Administrator notified
- Manual POD creation option available

### SignalR Connection Lost
- Frontend auto-reconnects with exponential backoff
- Connection state indicator shown to user
- Manual refresh available

### Driver Doesn't Capture POD
- Pending POD visible on dispatch board
- Escalation workflow triggers after 24 hours
- Manager can force load completion if needed

---

## Testing Scenarios

### Scenario 1: POD Auto-Creation
1. ✅ Load in "InTransit" status
2. ✅ Click "Mark Delivered"
3. ✅ POD created automatically in Draft status
4. ✅ SignalR notification received
5. ✅ Driver sees POD in dashboard

### Scenario 2: Real-Time Status Updates
1. ✅ Open dispatch board on computer
2. ✅ Driver captures photos on phone
3. ✅ Computer receives SignalR event instantly
4. ✅ POD status updates without page refresh

### Scenario 3: Offline Handling
1. ✅ Driver loses internet connection
2. ✅ POD capture saved locally
3. ✅ Connection restored
4. ✅ Changes sync to server
5. ✅ Dispatch board receives notification

---

## Performance Optimization

### Database Queries
- Eager load POD photos with `.Include()`
- Use indexes on LoadId, DriverId, TripId
- Pagination for POD history lists

### SignalR Optimization
- Use Hub Groups for targeted broadcasts
- Minimize payload size for events
- Implement message compression

### Frontend Optimization
- Lazy load POD components
- Virtual scrolling for dispatch board
- Cache POD status locally

---

## Security Considerations

### Authentication
- All endpoints require valid JWT token
- SignalR connection requires authentication
- User roles determine visibility

### Authorization
- Drivers can only view own PODs
- Dispatchers can view all PODs
- Managers have full access

### Data Privacy
- Photos transmitted securely (HTTPS/WSS)
- Signatures encrypted at rest
- Audit trail maintained

---

## Deployment Checklist

- [ ] Backend database migration applied
- [ ] PODHub registered in SignalR
- [ ] DispatchService updated with POD trigger
- [ ] Frontend SignalR service created
- [ ] Dispatch board component updated
- [ ] POD status badge component added
- [ ] Integration service tests passed
- [ ] End-to-end workflow tested
- [ ] Staging environment validated
- [ ] Production deployment scheduled

---

## Support & Troubleshooting

### POD Not Creating
1. Check load status is "Delivered"
2. Verify DispatchService method called
3. Check database connection
4. Review application logs

### SignalR Not Connecting
1. Verify `/hubs/pod` endpoint registered
2. Check CORS configuration
3. Verify WebSocket support enabled
4. Check firewall rules

### Real-Time Updates Not Appearing
1. Verify SignalR connection active
2. Check browser console for errors
3. Verify event handlers subscribed
4. Check network tab for messages

---

**Last Updated**: December 2024
**Status**: Ready for Implementation
**Next Phase**: Production Deployment

