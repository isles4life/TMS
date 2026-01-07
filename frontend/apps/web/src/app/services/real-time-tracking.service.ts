import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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

  private driverLocationHistorySubject = new BehaviorSubject<DriverLocationUpdate[]>([]);
  public driverLocationHistory$ = this.driverLocationHistorySubject.asObservable();

  // Track mock update intervals for cleanup
  private mockWatchIntervals: Map<string, any> = new Map();

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
    // Clear all mock watch intervals
    this.mockWatchIntervals.forEach(interval => clearInterval(interval));
    this.mockWatchIntervals.clear();

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

    // Driver location history
    this.connection.on('DriverLocationHistory', (history: DriverLocationUpdate[]) => {
      this.ngZone.run(() => {
        this.driverLocationHistorySubject.next(history);
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
      // Simulate watching with mock data
      this.simulateMockDriverUpdates(driverId);
      return;
    }

    await this.connection.invoke('WatchDriver', driverId);
  }

  /**
   * Simulate real-time updates for a watched driver (mock data)
   */
  private simulateMockDriverUpdates(driverId: string): void {
    // Clear any existing interval for this driver
    if (this.mockWatchIntervals.has(driverId)) {
      clearInterval(this.mockWatchIntervals.get(driverId));
    }

    const tracker = this.activeTrackersSubject.value.find(t => t.driverId === driverId);
    if (!tracker) return;

    // Simulate location updates every 5 seconds
    let updateCount = 0;
    const maxUpdates = 10; // Stop after 10 updates (50 seconds)
    
    const interval = setInterval(() => {
      if (updateCount >= maxUpdates) {
        clearInterval(interval);
        this.mockWatchIntervals.delete(driverId);
        return;
      }

      // Simulate movement by slightly adjusting coordinates and speed
      const speedVariation = Math.random() * 10 - 5; // -5 to +5 mph
      const latVariation = (Math.random() - 0.5) * 0.01; // Small lat change
      const lngVariation = (Math.random() - 0.5) * 0.01; // Small lng change

      const update: DriverLocationUpdate = {
        id: `update-${Date.now()}`,
        driverId: tracker.driverId,
        driverName: tracker.driverName,
        latitude: tracker.latitude + latVariation,
        longitude: tracker.longitude + lngVariation,
        speedMph: Math.max(0, tracker.speedMph + speedVariation),
        heading: tracker.status === 'OnDuty' ? Math.floor(Math.random() * 360) : 0,
        address: tracker.pickupLocation || 'Unknown',
        city: tracker.pickupLocation?.split(',')[0] || 'Unknown',
        state: tracker.pickupLocation?.split(',')[1]?.trim() || 'Unknown',
        recordedAt: new Date(),
        dispatchId: tracker.dispatchId,
        loadNumber: tracker.loadNumber
      };

      this.ngZone.run(() => {
        this.driverLocationUpdatedSubject.next(update);
      });

      updateCount++;
    }, 5000); // Update every 5 seconds

    // Store the interval so we can clear it later
    this.mockWatchIntervals.set(driverId, interval);
  }

  /**
   * Stop watching a specific driver
   */
  async stopWatchingDriver(driverId: string): Promise<void> {
    // Clear mock interval if it exists
    if (this.mockWatchIntervals.has(driverId)) {
      clearInterval(this.mockWatchIntervals.get(driverId));
      this.mockWatchIntervals.delete(driverId);
      return;
    }

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
      // Load mock history data when not connected
      this.loadMockDriverHistory(driverId, lastMinutes);
      return;
    }

    await this.connection.invoke('GetDriverHistory', driverId, lastMinutes);
  }

  /**   * Load mock driver location history for demonstration
   */
  private loadMockDriverHistory(driverId: string, lastMinutes: number): void {
    const now = new Date();
    const mockHistory: DriverLocationUpdate[] = [];
    
    // Generate location points every 5 minutes for the requested time period
    const dataPoints = Math.min(lastMinutes / 5, 20); // Max 20 points
    
    // Define a route path (simulating a trip from pickup to delivery)
    const routeCoordinates = [
      { lat: 40.7128, lng: -74.0060, city: 'New York', state: 'NY', speed: 0 },
      { lat: 40.7580, lng: -73.9855, city: 'New York', state: 'NY', speed: 35 },
      { lat: 40.8448, lng: -73.8648, city: 'Bronx', state: 'NY', speed: 55 },
      { lat: 41.0534, lng: -73.5387, city: 'Stamford', state: 'CT', speed: 62 },
      { lat: 41.3083, lng: -72.9279, city: 'New Haven', state: 'CT', speed: 65 },
      { lat: 41.7658, lng: -72.6734, city: 'Hartford', state: 'CT', speed: 60 },
      { lat: 42.1015, lng: -72.5898, city: 'Springfield', state: 'MA', speed: 58 },
      { lat: 42.3601, lng: -71.0589, city: 'Boston', state: 'MA', speed: 45 },
      { lat: 42.3736, lng: -71.1097, city: 'Cambridge', state: 'MA', speed: 30 },
      { lat: 42.3770, lng: -71.1167, city: 'Cambridge', state: 'MA', speed: 0 }
    ];

    for (let i = 0; i < dataPoints; i++) {
      const minutesAgo = lastMinutes - (i * (lastMinutes / dataPoints));
      const timestamp = new Date(now.getTime() - minutesAgo * 60000);
      const routeIndex = Math.floor((i / dataPoints) * (routeCoordinates.length - 1));
      const location = routeCoordinates[routeIndex];
      
      mockHistory.push({
        id: `hist-${driverId}-${i}`,
        driverId: driverId,
        driverName: this.getDriverNameById(driverId),
        latitude: location.lat,
        longitude: location.lng,
        speedMph: location.speed,
        heading: this.calculateHeading(i, dataPoints),
        address: `${Math.floor(Math.random() * 9999)} Main St`,
        city: location.city,
        state: location.state,
        recordedAt: timestamp,
        dispatchId: `DSP-${5500 + parseInt(driverId.split('-')[1] || '0')}`,
        loadNumber: `LB-${4820 + parseInt(driverId.split('-')[1] || '0')}`
      });
    }

    // Sort by time (oldest first)
    mockHistory.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
    
    this.driverLocationHistorySubject.next(mockHistory);
  }

  /**
   * Get driver name by ID from active trackers
   */
  private getDriverNameById(driverId: string): string {
    const trackers = this.activeTrackersSubject.value;
    const tracker = trackers.find(t => t.driverId === driverId);
    return tracker?.driverName || 'Unknown Driver';
  }

  /**
   * Calculate heading based on progress through route
   */
  private calculateHeading(index: number, total: number): number {
    // Simplified heading calculation (0-360 degrees)
    // Generally northeast direction for this route
    const progress = index / total;
    return Math.floor(30 + progress * 15); // 30-45 degrees (northeast)
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
    // Try SignalR first, fall back to HTTP
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('AcknowledgeAlert', alertId);
        // Remove from local state
        this.removeAlertFromState(alertId);
        return;
      } catch (error) {
        console.warn('SignalR acknowledge failed, trying HTTP:', error);
      }
    }

    // Fall back to HTTP
    try {
      await this.acknowledgeAlertHttp(alertId).toPromise();
      // Remove from local state after successful acknowledgment
      this.removeAlertFromState(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert via HTTP:', error);
      throw new Error('Failed to acknowledge alert');
    }
  }

  /**
   * Remove alert from local state after acknowledgment
   */
  private removeAlertFromState(alertId: string): void {
    const currentAlerts = this.pendingAlertsSubject.value;
    const updatedAlerts = currentAlerts.filter(alert => alert.id !== alertId);
    this.pendingAlertsSubject.next(updatedAlerts);
    console.log(`Alert ${alertId} removed from state. Remaining: ${updatedAlerts.length}`);
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
    return this.http.post<void>(`${this.apiUrl}/alerts/${alertId}/acknowledge`, {}).pipe(
      catchError(error => {
        console.warn('Backend offline, simulating alert acknowledgement:', error);
        // In offline mode, just return success
        // The UI will update optimistically
        return of(void 0);
      })
    );
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
