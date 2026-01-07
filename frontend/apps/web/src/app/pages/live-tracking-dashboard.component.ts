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
import { RealTimeTrackingService, ActiveTracker, GeofenceAlert, DriverLocationUpdate } from '../services/real-time-tracking.service';
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
                <mat-card class="tracker-card" [ngClass]="{'watching': isWatching(tracker.driverId)}">
              <mat-card-header>
                <div class="tracker-header">
                  <div class="driver-info">
                    <h3>
                      {{ tracker.driverName }}
                      @if (isWatching(tracker.driverId)) {
                        <mat-icon class="watching-icon" matTooltip="Live tracking active">visibility</mat-icon>
                      }
                    </h3>
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
                <button 
                  mat-button 
                  [color]="isWatching(tracker.driverId) ? 'warn' : 'primary'"
                  (click)="watchDriver(tracker.driverId)">
                  <mat-icon>{{ isWatching(tracker.driverId) ? 'visibility_off' : 'visibility' }}</mat-icon>
                  {{ isWatching(tracker.driverId) ? 'Unwatch' : 'Watch' }}
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

      <!-- Driver History Panel -->
      @if (showHistoryPanel && driverHistory.length > 0) {
        <mat-card class="history-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Driver Location History
              <mat-chip class="history-badge">{{ driverHistory.length }} points</mat-chip>
            </mat-card-title>
            <button mat-icon-button (click)="closeHistoryPanel()" class="close-button">
              <mat-icon>close</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="history-list">
              @for (location of driverHistory; track location.id) {
                <div class="history-item">
                  <div class="history-time">
                    {{ location.recordedAt | date: 'short' }}
                  </div>
                  <div class="history-details">
                    <div class="history-location">
                      <mat-icon>place</mat-icon>
                      <span>{{ location.city }}, {{ location.state }}</span>
                    </div>
                    <div class="history-address">{{ location.address }}</div>
                    <div class="history-meta">
                      <mat-chip class="speed-chip">
                        <mat-icon>speed</mat-icon>
                        {{ location.speedMph }} mph
                      </mat-chip>
                      @if (location.loadNumber) {
                        <mat-chip class="load-chip">
                          <mat-icon>local_shipping</mat-icon>
                          {{ location.loadNumber }}
                        </mat-chip>
                      }
                    </div>
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
      gap: 20px;
    }

    .tracker-card {
      background: var(--card-bg);
      color: var(--color-text);
      border: 3px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15), 
        0 2px 6px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 5px;
        background: linear-gradient(180deg, var(--ts-red) 0%, #b31218 100%);
        opacity: 0.8;
        transition: all 0.3s;
      }

      &.watching {
        border-color: #10b981;
        box-shadow: 
          0 6px 16px rgba(16, 185, 129, 0.2), 
          0 3px 8px rgba(16, 185, 129, 0.15),
          0 0 0 3px rgba(16, 185, 129, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
        animation: pulse-watching 2s ease-in-out infinite;

        &::before {
          background: linear-gradient(180deg, #10b981 0%, #059669 100%);
          width: 6px;
          opacity: 1;
        }
      }

      &:hover {
        box-shadow: 
          0 12px 24px rgba(0, 0, 0, 0.2), 
          0 6px 12px rgba(0, 0, 0, 0.15),
          0 0 0 3px rgba(215, 25, 32, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
        border-color: var(--ts-red);
        transform: translateY(-4px) scale(1.01);

        &::before {
          width: 6px;
          opacity: 1;
        }
      }

      mat-card-header {
        margin-bottom: 16px;
        padding-left: 8px;
        background: linear-gradient(135deg, 
          var(--card-bg) 0%, 
          var(--surface-secondary) 50%,
          var(--card-bg) 100%);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .tracker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .driver-info {
          h3 {
            margin: 0 0 4px 0;
            font-size: 19px;
            font-weight: 800;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            gap: 8px;

            .watching-icon {
              color: #10b981;
              font-size: 20px;
              width: 20px;
              height: 20px;
              animation: pulse-icon 1.5s ease-in-out infinite;
            }
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
      padding-left: 8px;
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

    .history-card {
      margin-bottom: 20px;
      background: var(--card-bg);
      border: 3px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15), 
        0 2px 6px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 5px;
        background: linear-gradient(180deg, var(--ts-red) 0%, #b31218 100%);
        opacity: 0.8;
      }

      mat-card-header {
        padding: 20px 24px 16px 28px;
        background: linear-gradient(135deg, 
          var(--card-bg) 0%, 
          var(--surface-secondary) 50%,
          var(--card-bg) 100%);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border-bottom: 2px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 20px;
        font-weight: 800;
        color: var(--color-text);
        flex: 1;

        mat-icon {
          color: var(--ts-red);
        }

        .history-badge {
          margin-left: 8px;
          background: var(--ts-red);
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
      }

      .close-button {
        mat-icon {
          color: var(--muted-text);
        }

        &:hover mat-icon {
          color: var(--ts-red);
        }
      }
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 500px;
      overflow-y: auto;
      padding: 4px;
    }

    .history-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--card-bg);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        border-color: var(--ts-red);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .history-time {
        font-weight: 700;
        color: var(--ts-red);
        min-width: 130px;
        font-size: 13px;
      }

      .history-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .history-location {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--color-text);

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--ts-red);
          }
        }

        .history-address {
          color: var(--muted-text);
          font-size: 13px;
          padding-left: 26px;
        }

        .history-meta {
          display: flex;
          gap: 8px;
          padding-left: 26px;

          .speed-chip, .load-chip {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            height: 28px;
            padding: 0 10px;

            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }

          .speed-chip {
            background: #10b981;
            color: white;
          }

          .load-chip {
            background: #3b82f6;
            color: white;
          }
        }
      }
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 12px;
    }

    @keyframes pulse-watching {
      0%, 100% {
        box-shadow: 
          0 6px 16px rgba(16, 185, 129, 0.2), 
          0 3px 8px rgba(16, 185, 129, 0.15),
          0 0 0 3px rgba(16, 185, 129, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }
      50% {
        box-shadow: 
          0 8px 20px rgba(16, 185, 129, 0.3), 
          0 4px 10px rgba(16, 185, 129, 0.2),
          0 0 0 5px rgba(16, 185, 129, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
    }

    @keyframes pulse-icon {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.1);
      }
    }
  `]
})
export class LiveTrackingDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTrackers: ActiveTracker[] = [];
  pendingAlerts: GeofenceAlert[] = [];
  driverHistory: DriverLocationUpdate[] = [];
  selectedDriverId: string | null = null;
  showHistoryPanel = false;
  isConnected = false;
  isTracking = false;
  isLoading = true;
  watchedDriverIds: Set<string> = new Set();

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

    this.trackingService.driverLocationHistory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(history => {
        this.driverHistory = history;
        if (history.length > 0) {
          this.showHistoryPanel = true;
        }
      });

    // Subscribe to real-time driver location updates
    this.trackingService.driverLocationUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        // Update the tracker in the activeTrackers array
        const index = this.activeTrackers.findIndex(t => t.driverId === update.driverId);
        if (index !== -1) {
          this.activeTrackers[index] = {
            ...this.activeTrackers[index],
            latitude: update.latitude,
            longitude: update.longitude,
            speedMph: update.speedMph,
            lastUpdated: update.recordedAt
          };
          this.activeTrackers = [...this.activeTrackers]; // Trigger change detection
          
          // Show notification for watched driver
          this.snackBar.open(
            `${update.driverName} location updated - ${update.speedMph.toFixed(0)} mph`, 
            'Close', 
            {duration: 3000}
          );
        }
      });

    this.trackingService.watchAllTrackers();
    this.trackingService.getPendingAlerts();
  }

  private stopTracking(): void {
    this.isTracking = false;
    this.trackingService.stopWatchingAllTrackers();
  }

  watchDriver(driverId: string): void {
    if (this.watchedDriverIds.has(driverId)) {
      // Unwatch
      this.trackingService.stopWatchingDriver(driverId);
      this.watchedDriverIds.delete(driverId);
      this.snackBar.open('Stopped watching driver', 'Close', {duration: 2000});
    } else {
      // Watch
      this.trackingService.watchDriver(driverId);
      this.watchedDriverIds.add(driverId);
      this.snackBar.open('Now watching driver for live updates', 'Close', {duration: 3000});
    }
  }

  isWatching(driverId: string): boolean {
    return this.watchedDriverIds.has(driverId);
  }

  viewDriverHistory(driverId: string): void {
    this.selectedDriverId = driverId;
    this.trackingService.getDriverHistory(driverId, 60);
    this.snackBar.open('Loading driver history...', 'Close', {duration: 2000});
  }

  closeHistoryPanel(): void {
    this.showHistoryPanel = false;
    this.driverHistory = [];
    this.selectedDriverId = null;
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
