import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LoadStatusService } from '../../../../../core/src/lib/services/load-status.service';
import { LoadStatusHistory, LoadStatus } from '../../../../../core/src/lib/models/load-status.model';
import { StatusChangeDialogComponent } from './status-change-dialog/status-change-dialog.component';

@Component({
  selector: 'tms-status-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="header-row">
            <div class="title-section">
              <mat-icon>history</mat-icon>
              <span>Status History</span>
            </div>
            <button mat-raised-button color="primary" (click)="openStatusChangeDialog()">
              <mat-icon>swap_horiz</mat-icon>
              Change Status
            </button>
          </div>
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        @if (loading()) {
          <div class="loading-state">
            <mat-icon>sync</mat-icon>
            <p>Loading status history...</p>
          </div>
        } @else if (statusHistory().length === 0) {
          <div class="empty-state">
            <mat-icon>timeline</mat-icon>
            <p>No status changes recorded</p>
          </div>
        } @else {
          <div class="timeline">
            @for (status of statusHistory(); track status.id; let isFirst = $first; let isLast = $last) {
              <div class="timeline-item" [class.current]="isFirst">
                <div class="timeline-marker" [class]="'status-' + getStatusCategory(status.newStatus)">
                  <mat-icon>{{ getStatusIcon(status.newStatus) }}</mat-icon>
                </div>
                
                <div class="timeline-content">
                  <div class="status-header">
                    <div class="status-info">
                      <h3 [class]="'status-' + getStatusCategory(status.newStatus)">
                        {{ getStatusLabel(status.newStatus) }}
                      </h3>
                      @if (status.previousStatus) {
                        <span class="status-change">
                          from {{ getStatusLabel(status.previousStatus) }}
                        </span>
                      }
                    </div>
                    <div class="status-meta">
                      @if (!status.isAutomaticTransition) {
                        <mat-icon class="manual-icon" matTooltip="Manual change">person</mat-icon>
                      } @else {
                        <mat-icon class="auto-icon" matTooltip="Automatic transition">autorenew</mat-icon>
                      }
                    </div>
                  </div>
                  
                  <div class="status-details">
                    <div class="detail-item">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ status.changedAt | date:'medium' }}</span>
                    </div>
                    
                    <div class="detail-item">
                      <mat-icon>person</mat-icon>
                      <span>{{ status.changedBy }}</span>
                    </div>
                    
                    @if (status.latitude && status.longitude) {
                      <div class="detail-item">
                        <mat-icon>location_on</mat-icon>
                        <span>{{ status.latitude.toFixed(4) }}, {{ status.longitude.toFixed(4) }}</span>
                      </div>
                    }
                  </div>
                  
                  @if (status.reason) {
                    <div class="status-reason">
                      <mat-icon>comment</mat-icon>
                      <p>{{ status.reason }}</p>
                    </div>
                  }
                </div>
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

    .timeline {
      position: relative;
      padding: 1rem 0;
      
      &::before {
        content: '';
        position: absolute;
        left: 28px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--border-color);
      }
    }

    .timeline-item {
      position: relative;
      display: flex;
      gap: 1.5rem;
      padding-bottom: 2rem;
      
      &:last-child {
        padding-bottom: 0;
      }
      
      &.current .timeline-marker {
        box-shadow: 0 0 0 4px var(--surface-color), 0 0 0 8px var(--primary-color);
        animation: pulse 2s infinite;
      }
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 4px var(--surface-color), 0 0 0 8px var(--primary-color);
      }
      50% {
        box-shadow: 0 0 0 4px var(--surface-color), 0 0 0 12px var(--primary-color);
      }
    }

    .timeline-marker {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-color);
      border: 3px solid var(--border-color);
      position: relative;
      z-index: 1;
      
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: white;
      }
      
      &.status-pending {
        background: #6c757d;
        border-color: #5a6268;
      }
      
      &.status-active {
        background: var(--primary-color);
        border-color: var(--primary-dark);
      }
      
      &.status-transit {
        background: #17a2b8;
        border-color: #138496;
      }
      
      &.status-complete {
        background: var(--success-color);
        border-color: var(--success-dark);
      }
      
      &.status-problem {
        background: var(--error-color);
        border-color: var(--error-dark);
      }
    }

    .timeline-content {
      flex: 1;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .status-info {
      h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        
        &.status-pending { color: #6c757d; }
        &.status-active { color: var(--primary-color); }
        &.status-transit { color: #17a2b8; }
        &.status-complete { color: var(--success-color); }
        &.status-problem { color: var(--error-color); }
      }
      
      .status-change {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
    }

    .status-meta {
      .manual-icon {
        color: var(--primary-color);
      }
      
      .auto-icon {
        color: var(--text-secondary);
      }
    }

    .status-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 0.75rem 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
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
    }

    .status-reason {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
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
  `]
})
export class StatusTimelineComponent implements OnInit {
  @Input({ required: true }) loadId!: string;

  statusHistory = signal<LoadStatusHistory[]>([]);
  loading = signal(false);

  constructor(
    private statusService: LoadStatusService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadStatusHistory();
  }

  loadStatusHistory() {
    this.loading.set(true);
    this.statusService.getStatusHistory(this.loadId).subscribe({
      next: (history: LoadStatusHistory[]) => {
        this.statusHistory.set(history);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.warn('Status history unavailable for this load:', error.message || error);
        this.statusHistory.set([]); // Set empty array to show empty state
        this.loading.set(false);
      }
    });
  }

  openStatusChangeDialog() {
    const dialogRef = this.dialog.open(StatusChangeDialogComponent, {
      width: '500px',
      data: { loadId: this.loadId }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStatusHistory();
      }
    });
  }

  getStatusCategory(status: string): string {
    const pending = ['Draft', 'Pending', 'Available'];
    const active = ['Booked', 'Confirmed', 'Dispatched', 'Assigned'];
    const transit = ['EnRoute', 'AtPickup', 'Loading', 'Loaded', 'AtDelivery', 'Unloading'];
    const complete = ['Delivered', 'Completed', 'Invoiced', 'Paid'];
    const problem = ['Delayed', 'OnHold', 'Cancelled', 'Problem'];
    
    if (pending.includes(status)) return 'pending';
    if (active.includes(status)) return 'active';
    if (transit.includes(status)) return 'transit';
    if (complete.includes(status)) return 'complete';
    if (problem.includes(status)) return 'problem';
    
    return 'pending';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Draft: 'edit',
      Pending: 'schedule',
      Available: 'playlist_add',
      Booked: 'check_circle',
      Confirmed: 'verified',
      Dispatched: 'send',
      Assigned: 'assignment',
      EnRoute: 'local_shipping',
      AtPickup: 'location_on',
      Loading: 'upload',
      Loaded: 'inventory',
      AtDelivery: 'place',
      Unloading: 'download',
      Delivered: 'done_all',
      Completed: 'task_alt',
      Invoiced: 'receipt',
      Paid: 'payments',
      Delayed: 'schedule',
      OnHold: 'pause',
      Cancelled: 'cancel',
      Problem: 'error'
    };
    
    return icons[status] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      EnRoute: 'En Route',
      AtPickup: 'At Pickup',
      AtDelivery: 'At Delivery',
      OnHold: 'On Hold'
    };
    
    return labels[status] || status;
  }
}
