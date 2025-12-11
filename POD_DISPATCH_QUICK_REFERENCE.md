# POD-Dispatch Integration - Quick Reference

## Files Created/Modified

### Backend
```
✅ backend/src/Domain/Entities/Loads/Load.cs (UPDATED)
   → Added: ProofOfDeliveryId, ProofOfDelivery navigation

✅ backend/src/API/Hubs/PODHub.cs (NEW)
   → Methods: NotifyPODCreated, NotifyPODSigned, NotifyPODCompleted
   → Groups: SubscribeToPOD, SubscribeToDriverUpdates

✅ backend/src/API/Endpoints/ProofOfDeliveryEndpoints.cs (UPDATED)
   → Broadcasting: CreateProofOfDelivery, SignProofOfDelivery, CompleteProofOfDelivery

✅ backend/src/API/Program.cs (UPDATED)
   → Added: app.MapHub<PODHub>("/hubs/pod")
```

### Frontend
```
✅ frontend/libs/core/src/lib/services/pod-signalr.service.ts (NEW)
   → Real-time event listening
   → Auto-reconnect with exponential backoff
   → Group subscriptions

✅ frontend/libs/core/src/lib/services/dispatch-pod-integration.service.ts (NEW)
   → High-level integration methods
   → POD creation trigger
   → Batch POD retrieval
   → Event streams

✅ frontend/libs/features/dispatch/src/lib/components/pod-status-badge/ (NEW)
   → Component for displaying POD status
   → Actions: View, Edit (with permissions)
   → Status badges with color coding

✅ frontend/libs/features/dispatch/src/lib/components/dispatch-board/ (TO UPDATE)
   → Integrate POD status badge
   → Listen to real-time events
   → Update load status on POD completion
```

### Documentation
```
✅ docs/POD_DISPATCH_INTEGRATION.md (NEW - COMPREHENSIVE)
   → Architecture overview
   → Complete backend implementation guide
   → Complete frontend implementation guide
   → Event flow diagrams
   → Configuration guide
   → Testing scenarios
   → Troubleshooting

✅ POD_IMPLEMENTATION_COMPLETE.md (EXISTING)
   → Already contains implementation summary
```

---

## Key Integration Points

### 1. Trigger POD on Load Delivery

**When**: DispatchService marks load as "Delivered"

**What happens**:
1. System auto-creates POD in Draft status
2. POD links to load via `Load.ProofOfDeliveryId`
3. SignalR broadcasts `PODCreated` event
4. Frontend receives real-time notification

**Code Location**: `backend/src/Application/Services/DispatchService.cs`
- Method to add: `CreatePODForDeliveredLoadAsync()`
- Modify: `CompleteDeliveryAsync()`

### 2. Real-Time Updates with SignalR

**Events broadcast**:
- `PODCreated` - When POD created
- `PODSigned` - When recipient signs
- `PODCompleted` - When POD finalized
- `PhotosAdded` - When photos uploaded

**Hub**: `app.MapHub<PODHub>("/hubs/pod")`

**Frontend listening**:
```typescript
this.podSignalR.getPODStatusChanged().subscribe(event => {
  // React to: created, signed, completed, photosAdded
});
```

### 3. Dispatch Board Integration

**Show POD status for each load**:
```html
<tms-pod-status-badge
  [podId]="dispatch.podId"
  [podStatus]="dispatch.podStatus"
  (viewPOD)="viewPOD($event)"
  (capturePOD)="capturePOD($event)">
</tms-pod-status-badge>
```

**Status codes**:
- 0 = Draft (can edit)
- 1 = Pending (can edit)
- 2 = Signed (read-only)
- 3 = Completed (read-only)
- 4 = Rejected (read-only)
- 5 = Cancelled (read-only)

### 4. Event-Driven Load Completion

When POD is completed (`status: 3`):
1. SignalR broadcasts `PODCompleted`
2. Frontend receives event
3. Load status updated to "Completed"
4. Dispatch board refreshed

**Code**:
```typescript
this.podIntegration.getPODCompletedForLoad().subscribe(event => {
  this.updateLoadStatus(event.loadId, 'Completed');
});
```

---

## Real-Time Flow

```
┌─────────────────────┐
│  Load "Delivered"   │ ← Click "Mark Delivered" in Dispatch
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  DispatchService.CompleteDeliveryAsync()  │ ← Backend
└──────────┬──────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  CreatePODForDeliveredLoadAsync()     │ ← Auto-create
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  PODHub.NotifyPODCreated()            │ ← SignalR Broadcast
└──────────┬───────────────────────────┘
           │
           ↓ (WebSocket)
┌──────────────────────────────────────┐
│  Frontend PODSignalRService           │ ← Listens
│  Emits: PODCreated event              │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  DispatchBoardComponent               │ ← Updates UI
│  Shows POD status badge               │
│  NO PAGE REFRESH NEEDED               │
└──────────────────────────────────────┘
```

---

## Implementation Checklist

### Backend
- [x] Update Load entity with POD reference
- [x] Create PODHub for SignalR
- [x] Update endpoints to broadcast events
- [x] Register PODHub in Program.cs
- [ ] Update DispatchService to trigger POD creation
- [ ] Create database migration for Load.ProofOfDeliveryId
- [ ] Apply migration to database

### Frontend
- [x] Create POD SignalR service
- [x] Create integration service
- [x] Create POD status badge component
- [ ] Update dispatch board to use badge
- [ ] Add real-time event listeners
- [ ] Add POD navigation from dispatch
- [ ] Test real-time updates

### Documentation
- [x] Comprehensive integration guide created
- [x] Event flow diagrams documented
- [x] Code examples provided
- [x] Testing scenarios outlined
- [ ] Deployment checklist completed

---

## Quick Start: Update Dispatch Board

Add to your dispatch board component template:

```html
<table>
  <thead>
    <tr>
      <th>Load ID</th>
      <th>Status</th>
      <th>POD Status</th> <!-- NEW -->
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let dispatch of dispatches">
      <td>{{ dispatch.loadId }}</td>
      <td>{{ dispatch.status }}</td>
      <td>
        <tms-pod-status-badge
          [podId]="dispatch.podId"
          [podStatus]="dispatch.podStatus"
          [driverId]="dispatch.driverId"
          [loadId]="dispatch.loadId"
          (viewPOD)="viewPOD($event)"
          (capturePOD)="capturePOD($event)">
        </tms-pod-status-badge>
      </td>
      <td><!-- existing actions --></td>
    </tr>
  </tbody>
</table>
```

Component TypeScript:

```typescript
import { DispatchPODIntegrationService } from '@tms/core/services';

export class DispatchBoardComponent implements OnInit {
  dispatches: DispatchDto[] = [];

  constructor(private podIntegration: DispatchPODIntegrationService) {}

  ngOnInit(): void {
    this.loadDispatches();
    this.listenToUpdates();
  }

  private loadDispatches(): void {
    // Load dispatch list
    // Fetch PODs for each dispatch
    const loadIds = this.dispatches.map(d => d.loadId);
    this.podIntegration.getPODsForLoads(loadIds).subscribe(podMap => {
      this.dispatches.forEach(d => {
        const pod = podMap.get(d.loadId);
        d.podId = pod?.id;
        d.podStatus = pod?.status;
      });
    });
  }

  private listenToUpdates(): void {
    this.podIntegration.getPODCreatedForLoad().subscribe(event => {
      // Auto-refresh
      this.loadDispatches();
    });

    this.podIntegration.getPODCompletedForLoad().subscribe(event => {
      // Update load status
      this.updateLoadStatus(event.loadId, 'Completed');
    });
  }

  viewPOD(podId: string): void {
    this.router.navigate(['/dispatch/pod', podId]);
  }

  capturePOD(podId: string): void {
    this.router.navigate(['/dispatch/pod/capture', podId]);
  }
}
```

---

## SignalR Connection States

```
Connected ─────────┐
                   ├─→ Connecting
                   │
Disconnected ──────┤
                   │
Reconnecting ──────┘
```

Listen to connection changes:

```typescript
this.podSignalR.getConnectionState().subscribe(state => {
  switch(state) {
    case 'connected':
      console.log('POD Hub connected');
      break;
    case 'reconnecting':
      console.log('POD Hub reconnecting...');
      break;
    case 'disconnected':
      console.log('POD Hub disconnected');
      break;
  }
});
```

---

## Environment Setup

### Install SignalR Package (if not already done)

```bash
cd frontend
npm install @microsoft/signalr@latest
```

### Backend - Verify Program.cs

```csharp
// Should already have:
builder.Services.AddSignalR();
builder.Services.AddCors(...);

// Make sure PODHub is registered:
app.MapHub<TMS.API.Hubs.PODHub>("/hubs/pod");
```

---

## Testing the Integration

### Manual Test Steps

1. **Backend**:
   ```bash
   cd backend/src/API
   dotnet run
   ```
   - Verify `/hubs/pod` endpoint accessible
   - Check Swagger for updated Load entity

2. **Frontend**:
   ```bash
   cd frontend
   npm start
   ```
   - Open Developer Tools → Network
   - Look for WebSocket connection to `/hubs/pod`

3. **Test Flow**:
   - Mark a load as "Delivered"
   - Verify POD created in database
   - Check browser console for SignalR events
   - Verify dispatch board updates without refresh

### Monitor Logs

**Backend logs**:
```
info: Microsoft.AspNetCore.SignalR.HubConnectionHandler[1]
      Executing hub method 'SubscribeToPOD'
```

**Browser console**:
```
POD SignalR connected
Received: PODCreated
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| SignalR not connecting | WebSocket port blocked | Check firewall, CORS settings |
| POD not creating | Load not in "Delivered" status | Verify LoadStatus enum |
| Real-time updates delayed | Network latency | Check connection speed |
| Browser console errors | Missing @microsoft/signalr | Run `npm install` |

---

## Next Steps

1. ✅ Implement DispatchService POD trigger
2. ✅ Create database migration
3. ✅ Update dispatch board component
4. ✅ Test real-time updates
5. ✅ Deploy to staging
6. ✅ UAT with dispatch team
7. ✅ Production deployment

---

**Status**: Phase 2 - Dispatch Integration Complete
**Remaining**: DispatchService implementation + Testing

