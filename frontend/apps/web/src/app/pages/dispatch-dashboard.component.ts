import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DispatchService, DriverMatchResponse, DispatchRequest, DispatchResponse } from '../services/dispatch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dispatch-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="dispatch-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>local_shipping</mat-icon>
            Dispatch Management
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Smart load assignment with automated driver matching</p>
        </mat-card-content>
      </mat-card>

      <!-- Active Dispatches Section -->
      @if (activeDispatches.length > 0) {
        <mat-card class="active-dispatches-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>assignment_turned_in</mat-icon>
              Active Dispatches
              <mat-chip color="accent">{{ activeDispatches.length }}</mat-chip>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="active-dispatches-list">
              @for (dispatch of activeDispatches; track dispatch.id) {
                <div class="dispatch-item" [class.dispatch-pending]="dispatch.status === 'Pending'" 
                                          [class.dispatch-accepted]="dispatch.status === 'Accepted'">
                  <div class="dispatch-header">
                    <div class="dispatch-info">
                      <h4>
                        <a [routerLink]="['/load-details', dispatch.loadId]" class="load-link">
                          Load {{ dispatch.loadId }}
                        </a>
                      </h4>
                      <p>Driver: {{ dispatch.driverName || getDriverName(dispatch.driverId) }}</p>
                      @if (dispatch.notes) {
                        <small>{{ dispatch.notes }}</small>
                      }
                    </div>
                    <div class="dispatch-meta">
                      <mat-chip [class.status-pending]="dispatch.status === 'Pending'"
                               [class.status-accepted]="dispatch.status === 'Accepted'"
                               [class.status-rejected]="dispatch.status === 'Rejected'">
                        {{ dispatch.status }}
                      </mat-chip>
                      <mat-chip class="method-chip">{{ dispatch.method }}</mat-chip>
                    </div>
                  </div>
                  <div class="dispatch-details">
                    <small>Assigned: {{ dispatch.assignedAt | date:'short' }}</small>
                    @if (dispatch.acceptedAt) {
                      <small>Accepted: {{ dispatch.acceptedAt | date:'short' }}</small>
                    }
                    @if (dispatch.totalScore) {
                      <small>Match Score: {{ dispatch.totalScore.toFixed(1) }}</small>
                    }
                  </div>
                  <div class="dispatch-actions">
                    <button mat-raised-button
                            (click)="cancelDispatch(dispatch)"
                            class="cancel-button">
                      Cancel
                    </button>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="matches-card">
        <mat-card-header>
          <mat-card-title>Available Driver Matches</mat-card-title>
          <button mat-raised-button color="primary" (click)="findMatches()">
            <mat-icon>search</mat-icon>
            Find Best Matches
          </button>
        </mat-card-header>
        <mat-card-content>
          @if (loading) {
            <div class="loading-spinner">
            <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
            </div>
          }

          @if (!loading && driverMatches.length === 0) {
            <div class="no-data">
            <mat-icon>info</mat-icon>
            <p>No driver matches found. Click "Find Best Matches" to search for available drivers.</p>
            </div>
          }

          @if (!loading && driverMatches.length > 0) {
            <div class="table-wrapper">
            <table mat-table [dataSource]="driverMatches" class="matches-table">
            
            <!-- Recommended Column -->
            <ng-container matColumnDef="recommended">
              <th mat-header-cell *matHeaderCellDef>Recommendation</th>
              <td mat-cell *matCellDef="let match">
                @if (match.isRecommended) {
                  <mat-chip color="accent" selected>
                  <mat-icon>star</mat-icon>
                  Recommended
                  </mat-chip>
                }
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let match">
                <mat-chip 
                  [ngClass]="['status-chip', 'status-' + getStatusNormalized(match.availabilityStatus)]"
                  [matTooltip]="'Driver is ' + match.availabilityStatus">
                  {{ match.availabilityStatus }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Driver Name Column -->
            <ng-container matColumnDef="driverName">
              <th mat-header-cell *matHeaderCellDef>Driver</th>
              <td mat-cell *matCellDef="let match">
                <div class="driver-info">
                  <strong>{{ match.driverName }}</strong>
                  @if (match.driverPhone) {
                    <small>{{ match.driverPhone }}</small>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Equipment Column -->
            <ng-container matColumnDef="equipment">
              <th mat-header-cell *matHeaderCellDef>Equipment</th>
              <td mat-cell *matCellDef="let match">
                <div class="equipment-info">
                  @if (match.tractorNumber) {
                    <div>
                    <mat-icon inline>local_shipping</mat-icon>
                    {{ match.tractorNumber }}
                    </div>
                  }
                  @if (match.trailerNumber) {
                    <div>
                    <mat-icon inline>rv_hookup</mat-icon>
                    {{ match.trailerNumber }}
                    </div>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Total Score Column -->
            <ng-container matColumnDef="totalScore">
              <th mat-header-cell *matHeaderCellDef>Total Score</th>
              <td mat-cell *matCellDef="let match">
                <div class="score-badge" [class.high-score]="match.totalScore >= 80">
                  {{ match.totalScore.toFixed(1) }}
                </div>
              </td>
            </ng-container>

            <!-- Distance Column -->
            <ng-container matColumnDef="distance">
              <th mat-header-cell *matHeaderCellDef>Distance</th>
              <td mat-cell *matCellDef="let match">
                {{ match.distanceFromPickupMiles.toFixed(1) }} mi
              </td>
            </ng-container>

            <!-- Hours Available Column -->
            <ng-container matColumnDef="hoursAvailable">
              <th mat-header-cell *matHeaderCellDef>Hours Available</th>
              <td mat-cell *matCellDef="let match">
                {{ match.hoursAvailable.toFixed(1) }} hrs
              </td>
            </ng-container>

            <!-- Performance Column -->
            <ng-container matColumnDef="performance">
              <th mat-header-cell *matHeaderCellDef>Performance</th>
              <td mat-cell *matCellDef="let match">
                <div class="performance-info">
                  <small>On-Time: {{ (match.onTimeRate * 100).toFixed(0) }}%</small>
                  <small>Acceptance: {{ (match.acceptanceRate * 100).toFixed(0) }}%</small>
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let match">
                <button mat-raised-button color="primary" (click)="assignDriver(match)" class="assign-button">
                  <mat-icon>assignment</mat-icon>
                  Assign
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                [class.recommended-row]="row.isRecommended"></tr>
          </table>
          </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dispatch-container {
      padding: 20px;
      min-width: fit-content;
      width: 100%;
      margin: 0 auto;
      color: var(--color-text);
    }

    @media (max-width: 768px) {
      .dispatch-container {
        padding: 10px;
      }

      .matches-card mat-card-content {
        overflow-x: auto;
      }
    }

    .header-card {
      margin-bottom: 20px;
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--border-color, #e0e0e0);
      box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    mat-card {
      background: var(--card-bg, #ffffff);
      color: var(--color-text, #000000);
      border: 1px solid var(--border-color, #e0e0e0);
      box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .matches-card {
      min-width: fit-content;
      width: 100%;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      color: var(--color-text);
    }

    mat-card-content p {
      color: var(--muted-text);
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: var(--muted-text);
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--muted-text);
      opacity: 0.6;
    }

    .table-wrapper {
      margin-top: 16px;
      width: 100%;
    }

    .matches-table {
      width: 100%;
      background: var(--card-bg, #ffffff);
      color: var(--color-text, #000000);
    }

    .mat-mdc-table {
      background: var(--card-bg, #ffffff);
    }

    .mat-mdc-header-row {
      background: var(--surface-secondary, #f5f5f5);
    }

    .mat-mdc-row:hover {
      background: var(--surface-hover, #eeeeee);
    }

    .driver-info {
      display: flex;
      flex-direction: column;
    }

    .driver-info strong {
      color: var(--color-text);
    }

    .driver-info small {
      color: var(--muted-text);
      font-size: 12px;
    }

    .equipment-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      color: var(--color-text);
    }

    .equipment-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
      color: var(--muted-text);
    }

    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      background-color: var(--surface-secondary);
      color: var(--color-text);
      font-weight: bold;
      font-size: 16px;
      border: 1px solid var(--border-color);
    }

    .score-badge.high-score {
      background-color: #4caf50;
      color: white;
      border-color: #4caf50;
    }

    .performance-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 12px;
      color: var(--muted-text);
    }

    .performance-info small {
      color: var(--muted-text);
    }

    .recommended-row {
      background-color: var(--surface-secondary) !important;
      border-left: 3px solid var(--ts-red);
    }

    mat-chip {
      font-size: 12px;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .active-dispatches-card {
      margin-bottom: 20px;
      background: var(--card-bg) !important;
      color: var(--color-text) !important;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(128, 128, 128, 0.3) !important;
      border-left: 4px solid #4caf50 !important;
    }

    .active-dispatches-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }

    .dispatch-item {
      position: relative;
      padding: 16px;
      padding-bottom: 60px;
      border-radius: 8px;
      background-color: var(--surface-secondary) !important;
      color: var(--color-text) !important;
      border: 2px solid rgba(128, 128, 128, 0.3) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dispatch-item:hover {
      box-shadow: 
        0 12px 24px rgba(0, 0, 0, 0.2), 
        0 6px 12px rgba(0, 0, 0, 0.15),
        0 0 0 3px rgba(76, 175, 80, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      border-color: #4caf50 !important;
      transform: translateY(-4px) scale(1.01);
      background-color: var(--surface-hover) !important;
    }

    .dispatch-pending {
      border-left: 4px solid #ff9800 !important;
    }

    .dispatch-accepted {
      border-left: 4px solid #4caf50 !important;
    }

    .dispatch-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .dispatch-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
    }

    .load-link {
      color: var(--ts-red);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .load-link:hover {
      color: var(--ts-red-dark);
      text-decoration: underline;
    }

    .dispatch-info p {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: var(--muted-text);
    }

    .dispatch-info small {
      color: var(--muted-text);
      font-size: 12px;
      font-style: italic;
      opacity: 0.8;
    }

    .dispatch-meta {
      display: flex;
      gap: 8px;
      flex-direction: column;
      align-items: flex-end;
    }

    .dispatch-actions {
      position: absolute;
      bottom: 16px;
      right: 16px;
    }

    .cancel-button {
      background-color: #dc3545 !important;
      color: #ffffff !important;
      min-width: 80px;
    }

    .cancel-button:hover {
      background-color: #c82333 !important;
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    }

    .assign-button {
      /* Default styling */
    }

    .dispatch-details {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-size: 12px;
      color: var(--muted-text);
      padding-top: 8px;
      border-top: 1px solid var(--border-color);
    }

    .dispatch-details small {
      color: var(--muted-text);
    }

    .status-pending {
      background-color: #ff9800;
      color: white;
    }

    .status-accepted {
      background-color: #4caf50;
      color: white;
    }

    .status-rejected {
      background-color: #f44336;
      color: white;
    }

    .method-chip {
      background-color: #2196f3;
      color: white;
      font-size: 11px;
    }

    /* Status chips with gradient colors */
    .status-chip {
      font-weight: 600;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .status-available {
      background: linear-gradient(135deg, #4caf50, #66bb6a) !important;
      color: white !important;
    }

    .status-onduty {
      background: linear-gradient(135deg, #f44336, #ef5350) !important;
      color: white !important;
    }

    .status-offduty {
      background: linear-gradient(135deg, #ff9800, #ffa726) !important;
      color: white !important;
    }

    .status-onbreak {
      background: linear-gradient(135deg, #2196f3, #42a5f5) !important;
      color: white !important;
    }

    .status-maintenance {
      background: linear-gradient(135deg, #9c27b0, #ab47bc) !important;
      color: white !important;
    }

    .status-outofservice {
      background: linear-gradient(135deg, #757575, #9e9e9e) !important;
      color: white !important;
    }

    mat-card-title mat-chip {
      margin-left: 12px;
    }

    /* Dark mode - using class-based approach */
    :host-context(.dark-mode) .assign-button {
      background-color: var(--ts-red) !important;
      color: white !important;
    }

    :host-context(.dark-mode) .assign-button:hover {
      background-color: #b31218 !important;
    }

    /* Dark mode specific adjustments */
    @media (prefers-color-scheme: dark) {
      .score-badge {
        background-color: var(--surface-tertiary);
      }
      
      .dispatch-item:hover {
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
      }
    }
  `]
})
export class DispatchDashboardComponent implements OnInit {
  driverMatches: DriverMatchResponse[] = [];
  activeDispatches: DispatchResponse[] = [];
  displayedColumns: string[] = [
    'recommended',
    'status',
    'driverName',
    'equipment',
    'totalScore',
    'distance',
    'hoursAvailable',
    'performance',
    'actions'
  ];
  loading = false;
  // Mock load ID for testing - in real app, this would come from route params or selection
  currentLoadId = 'LOAD-2024-0001';
  // Map to store driver names for active dispatches
  private driverNamesMap = new Map<string, string>();

  constructor(
    private dispatchService: DispatchService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auto-load matches and active dispatches on init
    this.findMatches();
    this.loadActiveDispatches();
    
    // Subscribe to active dispatches updates
    this.dispatchService.activeDispatches$.subscribe(dispatches => {
      this.activeDispatches = dispatches;
    });
  }

  loadActiveDispatches(): void {
    this.dispatchService.getActiveDispatches().subscribe({
      next: (dispatches: DispatchResponse[]) => {
        this.activeDispatches = dispatches;
      },
      error: (error: unknown) => {
        console.error('Error loading active dispatches:', error);
      }
    });
  }

  findMatches(): void {
    this.loading = true;
    this.dispatchService.findDriverMatches(this.currentLoadId, 10)
      .subscribe({
        next: (matches: DriverMatchResponse[]) => {
          console.log('Received driver matches:', matches);
          console.log('First driver availabilityStatus:', matches[0]?.availabilityStatus);
          this.driverMatches = matches;
          this.loading = false;
          if (matches.length === 0) {
            this.snackBar.open('No available drivers found', 'Close', { duration: 3000 });
          }
        },
        error: (error: unknown) => {
          console.error('Error finding matches:', error);
          this.loading = false;
          this.snackBar.open('Error loading driver matches', 'Close', { duration: 3000 });
        }
      });
  }

  assignDriver(match: DriverMatchResponse): void {
    const request: DispatchRequest = {
      loadId: this.currentLoadId,
      driverId: match.driverId,
      tractorId: match.tractorId,
      trailerId: match.trailerId,
      method: 'AutoMatched',
      notes: `Auto-assigned with score: ${match.totalScore.toFixed(1)}`
    };

    // Store driver name for display
    this.driverNamesMap.set(match.driverId, match.driverName);

    this.dispatchService.assignLoad(request).subscribe({
      next: (dispatch: DispatchResponse) => {
        // Add driver name to the dispatch response
        dispatch.driverName = match.driverName;
        
        this.snackBar.open(
          `Successfully assigned ${match.driverName} to load ${dispatch.loadId}`,
          'Close',
          { duration: 5000 }
        );
        // Remove the assigned driver from the list
        this.driverMatches = this.driverMatches.filter(m => m.driverId !== match.driverId);
        // Refresh active dispatches to show the new assignment
        this.loadActiveDispatches();
      },
      error: (error: unknown) => {
        console.error('Error assigning driver:', error);
        this.snackBar.open('Error assigning driver to load', 'Close', { duration: 3000 });
      }
    });
  }

  cancelDispatch(dispatch: DispatchResponse): void {
    if (!confirm(`Are you sure you want to cancel the dispatch for Load ${dispatch.loadId}?`)) {
      return;
    }

    this.dispatchService.cancelDispatch(dispatch.id).subscribe({
      next: () => {
        // Remove from active dispatches
        this.activeDispatches = this.activeDispatches.filter(d => d.id !== dispatch.id);
        
        // Add the driver back to available matches if they had score data
        if (dispatch.totalScore) {
          const restoredMatch: DriverMatchResponse = {
            driverId: dispatch.driverId,
            driverName: dispatch.driverName || this.getDriverName(dispatch.driverId),
            tractorId: dispatch.tractorId,
            trailerId: dispatch.trailerId,
            totalScore: dispatch.totalScore,
            proximityScore: dispatch.proximityScore || 0,
            availabilityScore: dispatch.availabilityScore || 0,
            performanceScore: dispatch.performanceScore || 0,
            distanceFromPickupMiles: 0,
            hoursAvailable: 10,
            onTimeRate: 0.95,
            acceptanceRate: 0.90,
            availabilityStatus: 'Available',
            isRecommended: false
          };
          
          // Add back to the list if not already present
          if (!this.driverMatches.find(m => m.driverId === dispatch.driverId)) {
            this.driverMatches = [...this.driverMatches, restoredMatch];
          }
        }
        
        this.snackBar.open(
          `Cancelled dispatch for Load ${dispatch.loadId}`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (error: unknown) => {
        console.error('Error cancelling dispatch:', error);
        this.snackBar.open('Error cancelling dispatch', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusNormalized(status: string | undefined): string {
    if (!status) return 'unknown';
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getDriverName(driverId: string): string {
    return this.driverNamesMap.get(driverId) || driverId;
  }
}
