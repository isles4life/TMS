import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface DriverLocationUpdate {
  id: string;
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speedMph: number;
  heading: number;
  address?: string;
  city?: string;
  state?: string;
  recordedAt: Date;
  dispatchId?: string;
  loadNumber?: string;
}

export interface ActiveTracker {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  latitude: number;
  longitude: number;
  speedMph: number;
  status: string;
  dispatchId?: string;
  loadNumber?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  eta_minutes: number;
  lastUpdated: Date;
}

export interface GeofenceAlert {
  id: string;
  driverId: string;
  driverName: string;
  dispatchId: string;
  alertType: string;
  zoneName: string;
  alertedAt: Date;
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeTrackingService {
  private readonly http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);
  
  private readonly apiUrl = 'http://localhost:5000/api/tracking';
  private readonly hubUrl = 'http://localhost:5000/hubs/tracking';
  
  private connection: signalR.HubConnection | null = null;
  private connectionStateSubject = new BehaviorSubject<boolean>(false);
  public connectionState$ = this.connectionStateSubject.asObservable();
  
  // Observable streams for various events
  private driverLocationUpdatedSubject = new Subject<DriverLocationUpdate>();
  public driverLocationUpdated$ = this.driverLocationUpdatedSubject.asObservable();
  
  private activeTrackersSubject = new BehaviorSubject<ActiveTracker[]>([]);
  public activeTrackers$ = this.activeTrackersSubject.asObservable();
  
  private pendingAlertsSubject = new BehaviorSubject<GeofenceAlert[]>([]);
  public pendingAlerts$ = this.pendingAlertsSubject.asObservable();
  
  private pickupZoneAlertSubject = new Subject<any>();
  public pickupZoneAlert$ = this.pickupZoneAlertSubject.asObservable();
  
  private deliveryZoneAlertSubject = new Subject<any>();
  public deliveryZoneAlert$ = this.deliveryZoneAlertSubject.asObservable();
  
  private errorSubject = new Subject<string>();
  public error$ = this.errorSubject.asObservable();

  /**
   * Initialize SignalR connection
   */
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => this.getAuthToken()
      })
      .withAutomaticReconnect()
      .build();

    this.setupEventHandlers();

    try {
      await this.connection.start();
      this.ngZone.run(() => this.connectionStateSubject.next(true));
      console.log('SignalR connected for real-time tracking');
    } catch (err) {
      console.error('SignalR connection error:', err);
      this.ngZone.run(() => this.connectionStateSubject.next(false));
      throw err;
    }
  }

  /**
   * Disconnect from SignalR
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connectionStateSubject.next(false);
    }
  }

  /**
   * Setup event listeners for SignalR messages
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Driver location updated
    this.connection.on('DriverLocationUpdated', (location: DriverLocationUpdate) => {
      this.ngZone.run(() => {
        this.driverLocationUpdatedSubject.next(location);
      });
    });

    // Active trackers list
    this.connection.on('ActiveTrackers', (trackers: ActiveTracker[]) => {
      this.ngZone.run(() => {
        this.activeTrackersSubject.next(trackers);
      });
    });

    // Pending alerts
    this.connection.on('PendingAlerts', (alerts: GeofenceAlert[]) => {
      this.ngZone.run(() => {
        this.pendingAlertsSubject.next(alerts);
      });
    });

    // Geofence alerts
    this.connection.on('PickupZoneAlert', (alert: any) => {
      this.ngZone.run(() => {
        this.pickupZoneAlertSubject.next(alert);
      });
    });

    this.connection.on('DeliveryZoneAlert', (alert: any) => {
      this.ngZone.run(() => {
        this.deliveryZoneAlertSubject.next(alert);
      });
    });

    this.connection.on('AlertAcknowledged', (alert: GeofenceAlert) => {
      this.ngZone.run(() => {
        const currentAlerts = this.pendingAlertsSubject.value;
        const index = currentAlerts.findIndex(a => a.id === alert.id);
        if (index > -1) {
          currentAlerts[index] = alert;
          this.pendingAlertsSubject.next([...currentAlerts]);
        }
      });
    });

    // Error handling
    this.connection.on('Error', (error: any) => {
      this.ngZone.run(() => {
        this.errorSubject.next(error.message || 'Unknown error');
      });
    });
  }

  /**
   * Update driver location (send to hub)
   */
  async updateDriverLocation(driverId: string, latitude: number, longitude: number, 
    speedMph: number = 0, dispatchId?: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to tracking hub');
    }

    await this.connection.invoke('UpdateDriverLocation', {
      driverId,
      latitude,
      longitude,
      speedMph,
      dispatchId
    });
  }

  /**
   * Watch a specific driver's location updates
   */
  async watchDriver(driverId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to tracking hub');
    }

    await this.connection.invoke('WatchDriver', driverId);
  }

  /**
   * Stop watching a specific driver
   */
  async stopWatchingDriver(driverId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    await this.connection.invoke('StopWatchingDriver', driverId);
  }

  /**
   * Get all active trackers
   */
  async getActiveTrackers(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to tracking hub');
    }

    await this.connection.invoke('GetActiveTrackers');
  }

  /**
   * Watch all active trackers
   */
  async watchAllTrackers(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to tracking hub');
    }

    await this.connection.invoke('WatchAllTrackers');
  }

  /**
   * Stop watching all trackers
   */
  async stopWatchingAllTrackers(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    await this.connection.invoke('StopWatchingAllTrackers');
  }

  /**
   * Get driver location history
   */
  async getDriverHistory(driverId: string, lastMinutes: number = 60): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to tracking hub');
    }

    await this.connection.invoke('GetDriverHistory', driverId, lastMinutes);
  }

  /**
   * Get pending geofence alerts
   */
  async getPendingAlerts(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to tracking hub');
    }

    await this.connection.invoke('GetPendingAlerts');
  }

  /**
   * Acknowledge a geofence alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to tracking hub');
    }

    await this.connection.invoke('AcknowledgeAlert', alertId);
  }

  /**
   * Get latest driver location (HTTP)
   */
  getLatestDriverLocation(driverId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/location/${driverId}`);
  }

  /**
   * Get driver location history (HTTP)
   */
  getDriverLocationHistory(driverId: string, lastMinutes: number = 60): Observable<any> {
    return this.http.get(`${this.apiUrl}/location/${driverId}/history?lastMinutes=${lastMinutes}`);
  }

  /**
   * Get active trackers (HTTP)
   */
  getActiveTrackersHttp(): Observable<any> {
    return this.http.get(`${this.apiUrl}/active`);
  }

  /**
   * Get pending alerts (HTTP)
   */
  getPendingAlertsHttp(): Observable<any> {
    return this.http.get(`${this.apiUrl}/alerts`);
  }

  /**
   * Acknowledge alert (HTTP)
   */
  acknowledgeAlertHttp(alertId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/alerts/${alertId}/acknowledge`, {});
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    const token = localStorage.getItem('token');
    return token || '';
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}
