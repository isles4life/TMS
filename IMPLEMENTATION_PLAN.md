# Critical Features Implementation Plan

## Current Status & Architecture Overview

### Existing Stack:
- **Backend:** .NET (C#) with layered architecture (API, Application, Domain, Infrastructure)
- **Frontend:** Angular 17 with standalone components, Material Design, SCSS
- **Database:** (SQL-based, assumed from .NET patterns)
- **Current Entities:** Load, Carrier, Driver, Equipment, Trips, Users, Companies, Tracking

### Existing Load Status Enum:
```csharp
public enum LoadStatus
{
    Booked,      // Current basic status
    // Need to expand this
}
```

---

## Phase 1 Implementation Schedule (Next 1-3 months)

### Priority Order (Based on Impact + Effort):

#### 1. **Check Call System** ⭐ START HERE
- **Effort:** Medium | **Impact:** Very High | **Risk:** Low
- **Description:** Track driver check-ins with location, status, ETA, temperature
- **Backend Tasks:**
  - Create `CheckCall` entity
  - Create `CheckCallCommand` for creating check calls
  - Create `CheckCallQuery` for retrieving check calls
  - Create database migration
  - Create API endpoints (POST, GET)
- **Frontend Tasks:**
  - Create check call form component
  - Create check call history view
  - Add to load details page
- **Timeline:** 1 week

#### 2. **Shipment/Load State Machine** ⭐ CRITICAL
- **Effort:** Medium | **Impact:** Very High | **Risk:** Low
- **Description:** Implement lifecycle: Pending → Booked → Assigned → InTransit → Delivered
- **Backend Tasks:**
  - Expand `LoadStatus` enum
  - Create state transition logic
  - Create `ChangeLoadStatusCommand`
  - Add validation for state transitions
  - Add audit logging for state changes
- **Frontend Tasks:**
  - Add status indicator to load board
  - Add status change buttons/options
  - Add status timeline view
- **Timeline:** 1 week

#### 3. **Carrier Bouncing System** ⭐ HIGH-VALUE
- **Effort:** Low | **Impact:** High | **Risk:** Low
- **Description:** Track when carriers reject/bounce from loads
- **Backend Tasks:**
  - Create `CarrierBounce` entity
  - Create `BounceCarrierCommand`
  - Create `BounceHistoryQuery`
  - Add API endpoints
- **Frontend Tasks:**
  - Add "Bounce Carrier" button to dispatch page
  - Show bounce history and reasons
  - Track bounce metrics per carrier
- **Timeline:** 3-4 days

#### 4. **Polymorphic Notes System** ⭐ HIGH-VALUE
- **Effort:** Low | **Impact:** High | **Risk:** Low
- **Description:** Attach notes to any entity (loads, carriers, drivers, etc.)
- **Backend Tasks:**
  - Create `Note` entity with polymorphic relationships
  - Create `AddNoteCommand`
  - Create `GetNotesQuery`
  - Support attached-to: Load, Carrier, Driver, etc.
- **Frontend Tasks:**
  - Add notes section to all entity detail pages
  - Add note input component
  - Show note history with user/timestamp
- **Timeline:** 4-5 days

#### 5. **Facility Management** ⭐ HIGH-VALUE
- **Effort:** Medium | **Impact:** High | **Risk:** Low
- **Description:** Manage pickup/delivery facilities, warehouse locations
- **Backend Tasks:**
  - Create `Facility` entity
  - Create `FacilityContact` entity
  - Create CRUD commands/queries
  - Create database migrations
  - Create API endpoints
- **Frontend Tasks:**
  - Create facility management page
  - Create facility form component
  - Link facilities to loads/stops
- **Timeline:** 1 week

---

## Phase 1 Implementation (Detailed)

### Week 1-2: Check Call System

#### Backend Implementation:

**1. Create CheckCall Entity**
```csharp
// Location: Domain/Entities/Loads/CheckCall.cs
public class CheckCall : BaseEntity
{
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public DateTime CheckInTime { get; set; }
    public string ContactMethod { get; set; } // "Phone", "Email", "App"
    public string? Location { get; set; }     // Current location description
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsTruckEmpty { get; set; }    // Truck empty status
    public int? TrailerTemperature { get; set; }
    public string? ETA { get; set; }           // Estimated Time of Arrival
    public string? Notes { get; set; }         // Driver notes
    
    // Navigation
    public Load? Load { get; set; }
    public Driver? Driver { get; set; }
}
```

**2. Create Application Commands/Queries**
```csharp
// Location: Application/Commands/CheckCalls/CreateCheckCallCommand.cs
public class CreateCheckCallCommand : IRequest<CheckCallDto>
{
    public Guid LoadId { get; set; }
    public Guid DriverId { get; set; }
    public string ContactMethod { get; set; }
    public string? Location { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsTruckEmpty { get; set; }
    public int? TrailerTemperature { get; set; }
    public string? ETA { get; set; }
    public string? Notes { get; set; }
}

// Location: Application/Queries/CheckCalls/GetLoadCheckCallsQuery.cs
public class GetLoadCheckCallsQuery : IRequest<List<CheckCallDto>>
{
    public Guid LoadId { get; set; }
}
```

**3. Create Handlers**
```csharp
// Location: Application/Commands/CheckCalls/CreateCheckCallCommandHandler.cs
public class CreateCheckCallCommandHandler : IRequestHandler<CreateCheckCallCommand, CheckCallDto>
{
    public async Task<CheckCallDto> Handle(CreateCheckCallCommand request, CancellationToken cancellationToken)
    {
        var checkCall = new CheckCall
        {
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
        
        await _repository.AddAsync(checkCall, cancellationToken);
        return MapToDto(checkCall);
    }
}
```

**4. Create API Endpoints**
```csharp
// Location: API/Endpoints/CheckCallEndpoints.cs
public static void MapCheckCallEndpoints(this WebApplication app)
{
    var group = app.MapGroup("/api/loads/{loadId}/check-calls")
        .WithName("CheckCalls")
        .WithOpenApi();

    group.MapPost("/", CreateCheckCall)
        .WithName("CreateCheckCall")
        .WithOpenApi();

    group.MapGet("/", GetLoadCheckCalls)
        .WithName("GetLoadCheckCalls")
        .WithOpenApi();
}

private static async Task<IResult> CreateCheckCall(
    Guid loadId,
    CreateCheckCallCommand command,
    ISender sender)
{
    command.LoadId = loadId;
    var result = await sender.Send(command);
    return Results.Created($"/api/loads/{loadId}/check-calls/{result.Id}", result);
}

private static async Task<IResult> GetLoadCheckCalls(
    Guid loadId,
    ISender sender)
{
    var result = await sender.Send(new GetLoadCheckCallsQuery { LoadId = loadId });
    return Results.Ok(result);
}
```

**5. Database Migration**
```sql
-- Location: Infrastructure/Migrations/AddCheckCallsTable.sql
CREATE TABLE CheckCalls (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    LoadId UNIQUEIDENTIFIER NOT NULL,
    DriverId UNIQUEIDENTIFIER NOT NULL,
    CheckInTime DATETIME NOT NULL,
    ContactMethod NVARCHAR(50) NOT NULL,
    Location NVARCHAR(500),
    Latitude DECIMAL(9, 6),
    Longitude DECIMAL(9, 6),
    IsTruckEmpty BIT NOT NULL,
    TrailerTemperature INT,
    ETA NVARCHAR(100),
    Notes NVARCHAR(1000),
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    FOREIGN KEY (LoadId) REFERENCES Loads(Id),
    FOREIGN KEY (DriverId) REFERENCES Drivers(Id)
);

CREATE INDEX IX_CheckCalls_LoadId ON CheckCalls(LoadId);
CREATE INDEX IX_CheckCalls_DriverId ON CheckCalls(DriverId);
```

#### Frontend Implementation:

**1. Create Check Call Form Component**
```typescript
// Location: apps/web/src/app/components/check-call-form.component.ts
@Component({
  selector: 'app-check-call-form',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <mat-icon>call_received</mat-icon>
          Log Check Call
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>Contact Method</mat-label>
            <mat-select formControlName="contactMethod">
              <mat-option value="Phone">Phone</mat-option>
              <mat-option value="Email">Email</mat-option>
              <mat-option value="App">App</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>Current Location</mat-label>
            <input matInput formControlName="location" placeholder="e.g., I-75 near Atlanta">
          </mat-form-field>

          <mat-slide-toggle formControlName="isTruckEmpty">
            Truck Empty?
          </mat-slide-toggle>

          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>Trailer Temperature</mat-label>
            <input matInput type="number" formControlName="trailerTemperature" placeholder="°F">
          </mat-form-field>

          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>ETA</mat-label>
            <input matInput type="text" formControlName="eta" placeholder="2 hours">
          </mat-form-field>

          <mat-form-field appearance="outline" floatLabel="always">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit">
            <mat-icon>save</mat-icon>
            Log Check Call
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-form-field, mat-slide-toggle {
      display: block;
      margin-bottom: 16px;
    }
  `]
})
export class CheckCallFormComponent {
  form = this.fb.group({
    contactMethod: ['Phone', Validators.required],
    location: ['', Validators.required],
    isTruckEmpty: [false],
    trailerTemperature: [null],
    eta: [''],
    notes: ['']
  });

  constructor(private fb: FormBuilder, private checkCallService: CheckCallService) {}

  onSubmit() {
    if (this.form.valid) {
      this.checkCallService.createCheckCall(this.form.value).subscribe(
        () => {
          console.log('Check call logged successfully');
          this.form.reset();
        }
      );
    }
  }
}
```

**2. Create Check Call History Component**
```typescript
// Location: apps/web/src/app/components/check-call-history.component.ts
@Component({
  selector: 'app-check-call-history',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <mat-icon>history</mat-icon>
          Check Call History
        </mat-card-title>
      </mat-card-header>
      <mat-list>
        <mat-list-item *ngFor="let call of checkCalls">
          <mat-icon matListItemIcon>call_received</mat-icon>
          <div matListItemTitle>{{ call.contactMethod }} - {{ call.location }}</div>
          <div matListItemLine>{{ call.checkInTime | date:'short' }}</div>
          <div matListItemLine>Truck Empty: {{ call.isTruckEmpty ? 'Yes' : 'No' }} | Temp: {{ call.trailerTemperature }}°F</div>
        </mat-list-item>
      </mat-list>
    </mat-card>
  `
})
export class CheckCallHistoryComponent implements OnInit {
  @Input() loadId!: Guid;
  checkCalls: CheckCall[] = [];

  constructor(private checkCallService: CheckCallService) {}

  ngOnInit() {
    this.loadCheckCalls();
  }

  private loadCheckCalls() {
    this.checkCallService.getLoadCheckCalls(this.loadId).subscribe(
      calls => this.checkCalls = calls
    );
  }
}
```

---

## Next Steps

1. **Start with Check Call System Implementation** (Week 1-2)
   - Create entities and migrations
   - Build command/query handlers
   - Create API endpoints
   - Build Angular components

2. **Implement Load State Machine** (Week 2-3)
   - Expand LoadStatus enum
   - Add state transition validation
   - Create commands/queries
   - Update UI to show load lifecycle

3. **Add Carrier Bouncing** (Week 3)
   - Create CarrierBounce entity
   - Build bounce tracking
   - Add metrics/reporting

4. **Build Polymorphic Notes** (Week 3-4)
   - Design note system
   - Implement for all entities
   - Build note components

5. **Create Facility Management** (Week 4-5)
   - Design facility entities
   - Build CRUD operations
   - Create facility UI

---

## Files to Create/Modify

### Backend:
- [ ] Domain/Entities/Loads/CheckCall.cs
- [ ] Application/Commands/CheckCalls/CreateCheckCallCommand.cs
- [ ] Application/Commands/CheckCalls/CreateCheckCallCommandHandler.cs
- [ ] Application/Queries/CheckCalls/GetLoadCheckCallsQuery.cs
- [ ] Application/Queries/CheckCalls/GetLoadCheckCallsQueryHandler.cs
- [ ] Application/DTOs/CheckCallDto.cs
- [ ] API/Endpoints/CheckCallEndpoints.cs
- [ ] Infrastructure/Migrations/AddCheckCallsTable.sql

### Frontend:
- [ ] apps/web/src/app/components/check-call-form.component.ts
- [ ] apps/web/src/app/components/check-call-history.component.ts
- [ ] apps/web/src/app/services/check-call.service.ts
- [ ] apps/web/src/app/models/check-call.model.ts
- [ ] Add to load-details page

---

## Testing Strategy

- Unit tests for command/query handlers
- Integration tests for API endpoints
- Component tests for Angular forms
- E2E tests for check call workflow

---

*Created: December 17, 2025*
*Target Completion: Phase 1 by January 17, 2026*
