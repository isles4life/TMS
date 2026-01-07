import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CheckCallService } from '../../../../../core/src/lib/services/check-call.service';
import { CheckCall } from '../../../../../core/src/lib/models/check-call.model';
import { CheckCallFormComponent } from './check-call-form/check-call-form.component';

@Component({
  selector: 'tms-check-call-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="header-row">
            <div class="title-section">
              <mat-icon>phone_in_talk</mat-icon>
              <span>Check Calls</span>
              <mat-chip [highlighted]="true">{{ checkCalls().length }}</mat-chip>
            </div>
            <button mat-raised-button color="primary" (click)="openCheckCallDialog()">
              <mat-icon>add</mat-icon>
              New Check Call
            </button>
          </div>
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        @if (loading()) {
          <div class="loading-state">
            <mat-icon>sync</mat-icon>
            <p>Loading check calls...</p>
          </div>
        } @else if (checkCalls().length === 0) {
          <div class="empty-state">
            <mat-icon>phone_disabled</mat-icon>
            <p>No check calls recorded yet</p>
            <button mat-stroked-button color="primary" (click)="openCheckCallDialog()">
              Record First Check Call
            </button>
          </div>
        } @else {
          <div class="check-call-list">
            @for (checkCall of checkCalls(); track checkCall.id) {
              <div class="check-call-item">
                <div class="check-call-header">
                  <div class="time-location">
                    <div class="time">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ checkCall.checkInTime | date:'short' }}</span>
                    </div>
                    <div class="location">
                      <mat-icon>location_on</mat-icon>
                      <span>{{ checkCall.currentLocation || 'Location not provided' }}</span>
                    </div>
                  </div>
                  <mat-chip [class]="'status-' + getStatusClass(checkCall)">
                    {{ getStatusLabel(checkCall) }}
                  </mat-chip>
                </div>
                
                <div class="check-call-details">
                  @if (checkCall.latitude && checkCall.longitude) {
                    <div class="detail-item">
                      <mat-icon>gps_fixed</mat-icon>
                      <span>{{ checkCall.latitude.toFixed(6) }}, {{ checkCall.longitude.toFixed(6) }}</span>
                    </div>
                  }
                  
                  @if (checkCall.estimatedArrivalTime) {
                    <div class="detail-item">
                      <mat-icon>event</mat-icon>
                      <span>ETA: {{ checkCall.estimatedArrivalTime | date:'short' }}</span>
                    </div>
                  }
                  
                  @if (checkCall.delayMinutes && checkCall.delayMinutes > 0) {
                    <div class="detail-item warning">
                      <mat-icon>warning</mat-icon>
                      <span>Delayed {{ checkCall.delayMinutes }} minutes</span>
                    </div>
                  }
                  
                  @if (checkCall.trailerTemperature) {
                    <div class="detail-item">
                      <mat-icon>thermostat</mat-icon>
                      <span>{{ checkCall.trailerTemperature }}°F</span>
                    </div>
                  }
                  
                  @if (checkCall.fuelLevel) {
                    <div class="detail-item">
                      <mat-icon>local_gas_station</mat-icon>
                      <span>Fuel: {{ checkCall.fuelLevel }}%</span>
                    </div>
                  }
                </div>
                
                @if (checkCall.notes) {
                  <div class="check-call-notes">
                    <mat-icon>notes</mat-icon>
                    <p>{{ checkCall.notes }}</p>
                  </div>
                }
                
                @if (checkCall.delayReason) {
                  <div class="delay-reason">
                    <strong>Delay Reason:</strong> {{ checkCall.delayReason }}
                  </div>
                }
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 1rem 0;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      mat-icon {
        color: var(--primary-color);
      }
      
      span {
        font-size: 1.25rem;
        font-weight: 500;
      }
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--muted-color);
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .check-call-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .check-call-item {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      background: var(--surface-color);
      transition: box-shadow 0.2s;
      
      &:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    }

    .check-call-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .time-location {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .time, .location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--text-secondary);
      }
      
      span {
        font-size: 0.9rem;
      }
    }

    .location {
      font-weight: 500;
    }

    mat-chip {
      &.status-on-time {
        background-color: var(--success-color);
        color: white;
      }
      
      &.status-delayed {
        background-color: var(--warning-color);
        color: white;
      }
      
      &.status-breakdown {
        background-color: var(--error-color);
        color: white;
      }
    }

    .check-call-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--text-secondary);
      }
      
      &.warning {
        color: var(--warning-color);
        
        mat-icon {
          color: var(--warning-color);
        }
      }
    }

    .check-call-notes {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--background-color);
      border-radius: 4px;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--text-secondary);
        flex-shrink: 0;
      }
      
      p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.5;
      }
    }

    .delay-reason {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: var(--warning-bg);
      border-left: 3px solid var(--warning-color);
      font-size: 0.9rem;
      
      strong {
        color: var(--warning-color);
      }
    }
  `]
})
export class CheckCallListComponent implements OnInit {
  @Input({ required: true }) loadId!: string;
  @Input({ required: true }) driverId!: string;

  checkCalls = signal<CheckCall[]>([]);
  loading = signal(false);

  constructor(
    private checkCallService: CheckCallService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCheckCalls();
  }

  loadCheckCalls() {
    this.loading.set(true);
    this.checkCallService.getLoadCheckCalls(this.loadId).subscribe({
      next: (checkCalls: CheckCall[]) => {
        this.checkCalls.set(checkCalls);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.warn('Check calls unavailable for this load:', error.message || error);
        this.checkCalls.set([]); // Set empty array to show empty state
        this.loading.set(false);
      }
    });
  }

  openCheckCallDialog() {
    const dialogRef = this.dialog.open(CheckCallFormComponent, {
      width: '600px',
      data: { loadId: this.loadId, driverId: this.driverId }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCheckCalls();
      }
    });
  }

  getStatusClass(checkCall: CheckCall): string {
    if (checkCall.equipmentIssue || checkCall.safetyIssue) return 'breakdown';
    if (checkCall.delayMinutes && checkCall.delayMinutes > 15) return 'delayed';
    return 'on-time';
  }

  getStatusLabel(checkCall: CheckCall): string {
    if (checkCall.equipmentIssue) return 'Equipment Issue';
    if (checkCall.safetyIssue) return 'Safety Issue';
    if (checkCall.delayMinutes && checkCall.delayMinutes > 15) return 'Delayed';
    return 'On Time';
  }
}
