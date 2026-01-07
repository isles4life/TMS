import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { RealTimeTrackingService, ActiveTracker, GeofenceAlert } from '../services/real-time-tracking.service';
import { RouteOptimizerCardComponent } from '../components/route-optimizer-card.component';

@Component({
  selector: 'app-live-tracking-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule,
    RouteOptimizerCardComponent
  ],
  template: `
    <div class="tracking-dashboard">
      <div class="dashboard-header">
        <h1>Live Driver Tracking</h1>
        <div class="header-actions">
          <mat-chip-set>
            <mat-chip 
              [highlighted]="isConnected" 
              [attr.aria-label]="isConnected ? 'Connected' : 'Disconnected'">
              <mat-icon>{{ isConnected ? 'cloud_done' : 'cloud_off' }}</mat-icon>
              {{ isConnected ? 'Connected' : 'Disconnected' }}
            </mat-chip>
          </mat-chip-set>
          <button mat-raised-button color="primary" (click)="toggleTracking()">
            <mat-icon>{{ isTracking ? 'pause_circle' : 'play_circle' }}</mat-icon>
            {{ isTracking ? 'Pause' : 'Start' }} Tracking
          </button>
        </div>
      </div>

      <app-route-optimizer-card
        [defaultOrigin]="activeTrackers[0] ? { lat: activeTrackers[0].latitude, lng: activeTrackers[0].longitude } : undefined">
      </app-route-optimizer-card>

      <!-- Active Trackers Grid -->
      <mat-card class="trackers-card">
        <mat-card-header>
          <mat-card-title>
            Active Drivers
            @if (activeTrackers.length > 0) {
              <mat-chip class="tracker-badge">
                {{ activeTrackers.length }}
              </mat-chip>
            }
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (isLoading) {
            <div class="loading-spinner">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading tracker data...</p>
            </div>
          }

          @if (!isLoading && activeTrackers.length === 0) {
            <div class="empty-state">
              <mat-icon>location_off</mat-icon>
              <p>No active drivers being tracked</p>
            </div>
          }

          @if (!isLoading && activeTrackers.length > 0) {
            <div class="trackers-grid">
              @for (tracker of activeTrackers; track tracker.id) {
                <mat-card class="tracker-card">
              <mat-card-header>
                <div class="tracker-header">
                  <div class="driver-info">
                    <h3>{{ tracker.driverName }}</h3>
                    <p class="phone">{{ tracker.driverPhone }}</p>
                  </div>
                  <mat-chip 
                    [ngClass]="'status-' + tracker.status.toLowerCase()"
                    class="status-chip">
                    {{ tracker.status }}
                  </mat-chip>
                </div>
              </mat-card-header>

              <mat-card-content class="tracker-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">Speed</span>
                    <span class="value">{{ tracker.speedMph | number: '1.0-0' }} mph</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Load</span>
                    <span class="value">{{ tracker.loadNumber || 'N/A' }}</span>
                  </div>
                </div>

                @if (tracker.loadNumber) {
                  <div class="detail-row">
                    <div class="detail-item">
                      <span class="label">Pickup</span>
                      <span class="value">{{ tracker.pickupLocation }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Delivery</span>
                      <span class="value">{{ tracker.deliveryLocation }}</span>
                    </div>
                  </div>
                }

                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">Coordinates</span>
                    <span class="value">{{ tracker.latitude | number: '1.4-4' }}, {{ tracker.longitude | number: '1.4-4' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">ETA</span>
                    <span class="value">{{ tracker.eta_minutes }} min</span>
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">Last Update</span>
                    <span class="value">{{ tracker.lastUpdated | date: 'short' }}</span>
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="viewDriverHistory(tracker.driverId)">
                  <mat-icon>history</mat-icon>
                  History
                </button>
                <button mat-button (click)="watchDriver(tracker.driverId)">
                  <mat-icon>visibility</mat-icon>
                  Watch
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
        </mat-card-content>
      </mat-card>

      <!-- Geofence Alerts -->
      @if (pendingAlerts.length > 0) {
        <mat-card class="alerts-card">
          <mat-card-header>
            <mat-card-title [matBadge]="pendingAlerts.length" matBadgeColor="warn">
              Geofence Alerts
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="alerts-list">
              @for (alert of pendingAlerts; track alert.id) {
                <div class="alert-item">
                  <div class="alert-content">
                    <div class="alert-driver">{{ alert.driverName }}</div>
                    <div class="alert-zone">{{ alert.zoneName }}</div>
                    <mat-chip class="alert-type">{{ alert.alertType }}</mat-chip>
                    <mat-chip [color]="alert.isAcknowledged ? 'accent' : 'warn'">
                      {{ alert.isAcknowledged ? 'Acknowledged' : 'Pending' }}
                    </mat-chip>
                  </div>
                  <div class="alert-actions">
                    <button 
                      mat-icon-button 
                      [disabled]="alert.isAcknowledged"
                      (click)="acknowledgeAlert(alert.id)"
                      matTooltip="Acknowledge alert">
                      <mat-icon>check_circle</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Connection Status -->
      @if (!isConnected) {
        <div class="connection-status">
          <mat-icon>error_outline</mat-icon>
          <p>Real-time tracking not connected. Some features may be unavailable.</p>
          <button mat-button (click)="reconnect()">Reconnect</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .tracking-dashboard {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      color: var(--color-text);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;

      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--color-text);
      }
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .tracker-badge {
      margin-left: 12px;
    }

    .trackers-card {
      margin-bottom: 20px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    .trackers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }

    .tracker-card {
      background: var(--card-bg);
      color: var(--color-text);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);

      mat-card-header {
        margin-bottom: 16px;
      }

      .tracker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .driver-info {
          h3 {
            margin: 0 0 4px 0;
            font-size: 18px;
          }

          .phone {
            margin: 0;
            font-size: 12px;
            opacity: 0.9;
          }
        }

        .status-chip {
          font-weight: 500;

          &.status-onduty {
            background-color: var(--chip-bg);
            color: var(--accent-green, var(--chip-text));
          }

          &.status-offduty {
            background-color: var(--chip-bg);
            color: var(--accent-red);
          }

          &.status-onbreak {
            background-color: var(--chip-bg);
            color: var(--accent-amber, var(--chip-text));
          }
        }
      }
    }

    .tracker-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 12px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .label {
        font-weight: 500;
        opacity: 0.7;
        font-size: 10px;
        text-transform: uppercase;
      }

      .value {
        font-weight: 600;
        font-size: 13px;
      }
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;

      p {
        margin: 0;
        color: var(--muted-text);
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--muted-text);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        opacity: 0.55;
        color: var(--muted-text);
      }

      p {
        margin: 0;
        font-size: 16px;
      }
    }

    .alerts-card {
      margin-bottom: 20px;
      border-left: 4px solid var(--accent-red);
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: var(--card-bg);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs, 0 2px 6px rgba(0,0,0,0.08));

      .alert-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;

        .alert-driver {
          font-weight: 600;
          min-width: 150px;
          color: var(--color-text);
        }

        .alert-zone {
          flex: 1;
          color: var(--muted-text);
        }

        .alert-type {
          font-size: 11px;
          background: var(--chip-bg);
          color: var(--chip-text);
        }
      }

      .alert-actions {
        margin-left: 12px;
      }
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--card-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--accent-amber, #ffb74d);
      box-shadow: var(--shadow-sm);
      margin-bottom: 20px;

      mat-icon {
        color: var(--accent-amber, #ffb74d);
      }

      p {
        margin: 0;
        flex: 1;
        color: var(--color-text);
      }
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 12px;
    }
  `]
})
export class LiveTrackingDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTrackers: ActiveTracker[] = [];
  pendingAlerts: GeofenceAlert[] = [];
  isConnected = false;
  isTracking = false;
  isLoading = true;

  constructor(
    private readonly trackingService: RealTimeTrackingService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeTracking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.trackingService.disconnect();
  }

  private async initializeTracking(): Promise<void> {
    try {
      await this.trackingService.connect();
      this.isConnected = true;
      this.startTracking();
    } catch (error) {
      console.warn('Using mock tracking data:', error);
      this.isConnected = false;
      // Still start tracking to show mock data
      this.startTracking();
      this.snackBar.open('Using demo tracking data (backend offline)', 'OK', {duration: 5000});
    }
  }

  toggleTracking(): void {
    if (this.isTracking) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
  }

  private startTracking(): void {
    this.isLoading = true;
    this.isTracking = true;

    this.trackingService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        this.isConnected = connected;
      });

    this.trackingService.activeTrackers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(trackers => {
        this.activeTrackers = trackers;
        this.isLoading = false;
      });

    this.trackingService.pendingAlerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.pendingAlerts = alerts;
      });

    this.trackingService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.snackBar.open(`Tracking error: ${error}`, 'Close', {duration: 5000});
      });

    this.trackingService.watchAllTrackers();
    this.trackingService.getPendingAlerts();
  }

  private stopTracking(): void {
    this.isTracking = false;
    this.trackingService.stopWatchingAllTrackers();
  }

  watchDriver(driverId: string): void {
    this.trackingService.watchDriver(driverId);
    this.snackBar.open('Now watching driver', 'Close', {duration: 3000});
  }

  viewDriverHistory(driverId: string): void {
    this.trackingService.getDriverHistory(driverId, 60);
    this.snackBar.open('Loading driver history...', 'Close', {duration: 2000});
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await this.trackingService.acknowledgeAlert(alertId);
      this.snackBar.open('Alert acknowledged', 'Close', {duration: 2000});
    } catch {
      this.snackBar.open('Failed to acknowledge alert', 'Close', {duration: 3000});
    }
  }

  async reconnect(): Promise<void> {
    try {
      await this.trackingService.connect();
      this.isConnected = true;
      this.snackBar.open('Reconnected to tracking service', 'Close', {duration: 3000});
    } catch {
      this.snackBar.open('Failed to reconnect', 'Close', {duration: 3000});
    }
  }
}
