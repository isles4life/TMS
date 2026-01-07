import { Injectable, NgZone } from '@angular/core';
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
  private readonly apiUrl = 'http://localhost:5000/api/tracking';
  private readonly hubUrl = 'http://localhost:5000/hubs/tracking';
  
  constructor(private readonly http: HttpClient, private readonly ngZone: NgZone) {}
  
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
  
  private pickupZoneAlertSubject = new Subject<GeofenceAlert>();
  public pickupZoneAlert$ = this.pickupZoneAlertSubject.asObservable();
  
  private deliveryZoneAlertSubject = new Subject<GeofenceAlert>();
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
      console.warn('SignalR connection error, using mock data:', err);
      this.ngZone.run(() => {
        this.connectionStateSubject.next(false);
        // Load mock data when connection fails
        this.loadMockData();
      });
      throw err;
    }
  }

  /**
   * Load mock seed data for demonstration
   */
  private loadMockData(): void {
    const mockTrackers: ActiveTracker[] = [
      {
        id: 'tracker-001',
        driverId: 'DRV-101',
        driverName: 'Mike Johnson',
        driverPhone: '(555) 123-4567',
        latitude: 40.7128,
        longitude: -74.0060,
        speedMph: 62,
        status: 'OnDuty',
        dispatchId: 'DSP-5501',
        loadNumber: 'LB-4821',
        pickupLocation: 'Boise, ID',
        deliveryLocation: 'Portland, OR',
        eta_minutes: 145,
        lastUpdated: new Date()
      },
      {
        id: 'tracker-002',
        driverId: 'DRV-102',
        driverName: 'Sarah Williams',
        driverPhone: '(555) 234-5678',
        latitude: 34.0522,
        longitude: -118.2437,
        speedMph: 58,
        status: 'OnDuty',
        dispatchId: 'DSP-5502',
        loadNumber: 'LB-4822',
        pickupLocation: 'Dallas, TX',
        deliveryLocation: 'Denver, CO',
        eta_minutes: 218,
        lastUpdated: new Date()
      },
      {
        id: 'tracker-003',
        driverId: 'DRV-103',
        driverName: 'James Brown',
        driverPhone: '(555) 345-6789',
        latitude: 41.8781,
        longitude: -87.6298,
        speedMph: 0,
        status: 'OnBreak',
        dispatchId: 'DSP-5503',
        loadNumber: 'LB-4823',
        pickupLocation: 'Atlanta, GA',
        deliveryLocation: 'Chicago, IL',
        eta_minutes: 35,
        lastUpdated: new Date()
      },
      {
        id: 'tracker-004',
        driverId: 'DRV-104',
        driverName: 'Emily Davis',
        driverPhone: '(555) 456-7890',
        latitude: 29.7604,
        longitude: -95.3698,
        speedMph: 65,
        status: 'OnDuty',
        dispatchId: 'DSP-5504',
        loadNumber: 'LB-6010',
        pickupLocation: 'Houston, TX',
        deliveryLocation: 'Miami, FL',
        eta_minutes: 312,
        lastUpdated: new Date()
      },
      {
        id: 'tracker-005',
        driverId: 'DRV-105',
        driverName: 'Robert Martinez',
        driverPhone: '(555) 567-8901',
        latitude: 33.4484,
        longitude: -112.0740,
        speedMph: 55,
        status: 'OnDuty',
        dispatchId: 'DSP-5505',
        loadNumber: 'LB-6012',
        pickupLocation: 'Phoenix, AZ',
        deliveryLocation: 'Seattle, WA',
        eta_minutes: 425,
        lastUpdated: new Date()
      },
      {
        id: 'tracker-006',
        driverId: 'DRV-106',
        driverName: 'Lisa Anderson',
        driverPhone: '(555) 678-9012',
        latitude: 39.7392,
        longitude: -104.9903,
        speedMph: 0,
        status: 'OffDuty',
        dispatchId: 'DSP-5506',
        loadNumber: '',
        pickupLocation: '',
        deliveryLocation: '',
        eta_minutes: 0,
        lastUpdated: new Date()
      }
    ];

    const mockAlerts: GeofenceAlert[] = [
      {
        id: 'alert-001',
        driverId: 'DRV-102',
        driverName: 'Sarah Williams',
        dispatchId: 'DSP-5502',
        alertType: 'EnteredPickupZone',
        zoneName: 'Dallas Distribution Center',
        alertedAt: new Date(Date.now() - 15 * 60000),
        isAcknowledged: false
      },
      {
        id: 'alert-002',
        driverId: 'DRV-103',
        driverName: 'James Brown',
        dispatchId: 'DSP-5503',
        alertType: 'ApproachingDelivery',
        zoneName: 'Chicago Warehouse',
        alertedAt: new Date(Date.now() - 8 * 60000),
        isAcknowledged: false
      }
    ];

    this.activeTrackersSubject.next(mockTrackers);
    this.pendingAlertsSubject.next(mockAlerts);
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
    this.connection.on('PickupZoneAlert', (alert: GeofenceAlert) => {
      this.ngZone.run(() => {
        this.pickupZoneAlertSubject.next(alert);
      });
    });

    this.connection.on('DeliveryZoneAlert', (alert: GeofenceAlert) => {
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
    this.connection.on('Error', (error: { message?: string }) => {
      this.ngZone.run(() => {
        this.errorSubject.next(error.message || 'Unknown error');
      });
    });
  }

  /**
   * Update driver location (send to hub)
   */
  async updateDriverLocation(driverId: string, latitude: number, longitude: number, 
    speedMph = 0, dispatchId?: string): Promise<void> {
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
  async getDriverHistory(driverId: string, lastMinutes = 60): Promise<void> {
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
  getLatestDriverLocation(driverId: string): Observable<DriverLocationUpdate> {
    return this.http.get<DriverLocationUpdate>(`${this.apiUrl}/location/${driverId}`);
  }

  /**
   * Get driver location history (HTTP)
   */
  getDriverLocationHistory(driverId: string, lastMinutes = 60): Observable<DriverLocationUpdate[]> {
    return this.http.get<DriverLocationUpdate[]>(`${this.apiUrl}/location/${driverId}/history?lastMinutes=${lastMinutes}`);
  }

  /**
   * Get active trackers (HTTP)
   */
  getActiveTrackersHttp(): Observable<ActiveTracker[]> {
    return this.http.get<ActiveTracker[]>(`${this.apiUrl}/active`);
  }

  /**
   * Get pending alerts (HTTP)
   */
  getPendingAlertsHttp(): Observable<GeofenceAlert[]> {
    return this.http.get<GeofenceAlert[]>(`${this.apiUrl}/alerts`);
  }

  /**
   * Acknowledge alert (HTTP)
   */
  acknowledgeAlertHttp(alertId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/alerts/${alertId}/acknowledge`, {});
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
