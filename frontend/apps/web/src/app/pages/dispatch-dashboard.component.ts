import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DispatchService, DriverMatchResponse, DispatchRequest } from '../services/dispatch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dispatch-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
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

      <mat-card class="matches-card">
        <mat-card-header>
          <mat-card-title>Available Driver Matches</mat-card-title>
          <button mat-raised-button color="primary" (click)="findMatches()">
            <mat-icon>search</mat-icon>
            Find Best Matches
          </button>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          </div>

          <div *ngIf="!loading && driverMatches.length === 0" class="no-data">
            <mat-icon>info</mat-icon>
            <p>No driver matches found. Click "Find Best Matches" to search for available drivers.</p>
          </div>

          <table mat-table [dataSource]="driverMatches" *ngIf="!loading && driverMatches.length > 0" class="matches-table">
            
            <!-- Recommended Column -->
            <ng-container matColumnDef="recommended">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let match">
                <mat-chip *ngIf="match.isRecommended" color="accent" selected>
                  <mat-icon>star</mat-icon>
                  Recommended
                </mat-chip>
              </td>
            </ng-container>

            <!-- Driver Name Column -->
            <ng-container matColumnDef="driverName">
              <th mat-header-cell *matHeaderCellDef>Driver</th>
              <td mat-cell *matCellDef="let match">
                <div class="driver-info">
                  <strong>{{ match.driverName }}</strong>
                  <small *ngIf="match.driverPhone">{{ match.driverPhone }}</small>
                </div>
              </td>
            </ng-container>

            <!-- Equipment Column -->
            <ng-container matColumnDef="equipment">
              <th mat-header-cell *matHeaderCellDef>Equipment</th>
              <td mat-cell *matCellDef="let match">
                <div class="equipment-info">
                  <div *ngIf="match.tractorNumber">
                    <mat-icon inline>local_shipping</mat-icon>
                    {{ match.tractorNumber }}
                  </div>
                  <div *ngIf="match.trailerNumber">
                    <mat-icon inline>rv_hookup</mat-icon>
                    {{ match.trailerNumber }}
                  </div>
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
                  <small>On-Time: {{ (match.onTimeDeliveryRate * 100).toFixed(0) }}%</small>
                  <small>Acceptance: {{ (match.acceptanceRate * 100).toFixed(0) }}%</small>
                  <small>Loads: {{ match.completedLoadsCount }}</small>
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let match">
                <button mat-raised-button color="primary" (click)="assignDriver(match)">
                  <mat-icon>assignment</mat-icon>
                  Assign
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                [class.recommended-row]="row.isRecommended"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dispatch-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 20px;
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
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
    }

    .matches-table {
      width: 100%;
      margin-top: 16px;
    }

    .driver-info {
      display: flex;
      flex-direction: column;
    }

    .driver-info small {
      color: #666;
      font-size: 12px;
    }

    .equipment-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
    }

    .equipment-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .score-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      background-color: #e0e0e0;
      font-weight: bold;
      font-size: 16px;
    }

    .score-badge.high-score {
      background-color: #4caf50;
      color: white;
    }

    .performance-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 12px;
    }

    .recommended-row {
      background-color: #fff3e0;
    }

    mat-chip {
      font-size: 12px;
    }

    mat-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class DispatchDashboardComponent implements OnInit {
  driverMatches: DriverMatchResponse[] = [];
  displayedColumns: string[] = [
    'recommended',
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
  currentLoadId = '00000000-0000-0000-0000-000000000001';

  constructor(
    private dispatchService: DispatchService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auto-load matches on init
    this.findMatches();
  }

  findMatches(): void {
    this.loading = true;
    this.dispatchService.findDriverMatches(this.currentLoadId, 10)
      .subscribe({
        next: (matches: DriverMatchResponse[]) => {
          this.driverMatches = matches;
          this.loading = false;
          if (matches.length === 0) {
            this.snackBar.open('No available drivers found', 'Close', { duration: 3000 });
          }
        },
        error: (error: any) => {
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

    this.dispatchService.assignLoad(request).subscribe({
      next: (dispatch: any) => {
        this.snackBar.open(
          `Successfully assigned ${match.driverName} to load`,
          'Close',
          { duration: 5000 }
        );
        // Remove the assigned driver from the list
        this.driverMatches = this.driverMatches.filter(m => m.driverId !== match.driverId);
      },
      error: (error: any) => {
        console.error('Error assigning driver:', error);
        this.snackBar.open('Error assigning driver to load', 'Close', { duration: 3000 });
      }
    });
  }
}
