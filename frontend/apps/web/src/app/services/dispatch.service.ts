import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';

export interface DispatchRequest {
  loadId: string;
  driverId: string;
  tractorId?: string;
  trailerId?: string;
  method: 'Manual' | 'AutoMatched' | 'DriverRequested';
  notes?: string;
}

export interface DispatchResponse {
  id: string;
  loadId: string;
  driverId: string;
  driverName?: string;
  tractorId?: string;
  trailerId?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'InProgress' | 'Completed' | 'Cancelled';
  method: 'Manual' | 'AutoMatched' | 'DriverRequested';
  assignedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  proximityScore?: number;
  availabilityScore?: number;
  performanceScore?: number;
  totalScore?: number;
  notes?: string;
}

export interface DriverMatchResponse {
  driverId: string;
  driverName: string;
  driverPhone?: string;
  tractorId?: string;
  tractorNumber?: string;
  trailerId?: string;
  trailerNumber?: string;
  totalScore: number;
  proximityScore: number;
  availabilityScore: number;
  performanceScore: number;
  distanceFromPickupMiles: number;
  hoursAvailable: number;
  onTimeDeliveryRate: number;
  acceptanceRate: number;
  completedLoadsCount: number;
  currentLocation?: string;
  status: 'Available' | 'OnDuty' | 'OffDuty' | 'OnBreak' | 'Maintenance' | 'OutOfService';
  isRecommended: boolean;
}

export interface DriverAvailabilityRequest {
  driverId: string;
  status: 'Available' | 'OnDuty' | 'OffDuty' | 'OnBreak' | 'Maintenance' | 'OutOfService';
  latitude?: number;
  longitude?: number;
  currentLocation?: string;
  hoursWorkedToday?: number;
  hoursWorkedThisWeek?: number;
}

export interface DriverAvailabilityResponse {
  driverId: string;
  driverName: string;
  status: string;
  latitude?: number;
  longitude?: number;
  currentLocation?: string;
  hoursWorkedToday: number;
  hoursWorkedThisWeek: number;
  hoursAvailable: number;
  onTimeDeliveryRate: number;
  acceptanceRate: number;
  completedLoadsCount: number;
  lastLocationUpdate?: Date;
}

// Mock data for offline/demo mode
const MOCK_DRIVER_MATCHES: DriverMatchResponse[] = [
  {
    driverId: 'DRV-001',
    driverName: 'John Martinez',
    driverPhone: '(208) 555-0123',
    tractorId: 'TRC-101',
    tractorNumber: 'TRC-101',
    trailerId: 'TRL-201',
    trailerNumber: 'TRL-201',
    totalScore: 92.5,
    proximityScore: 95.0,
    availabilityScore: 90.0,
    performanceScore: 92.5,
    distanceFromPickupMiles: 15.3,
    hoursAvailable: 10.5,
    onTimeDeliveryRate: 0.96,
    acceptanceRate: 0.92,
    completedLoadsCount: 247,
    currentLocation: 'Boise, ID',
    status: 'Available',
    isRecommended: true
  },
  {
    driverId: 'DRV-002',
    driverName: 'Sarah Thompson',
    driverPhone: '(503) 555-0198',
    tractorId: 'TRC-102',
    tractorNumber: 'TRC-102',
    trailerId: 'TRL-202',
    trailerNumber: 'TRL-202',
    totalScore: 88.3,
    proximityScore: 82.0,
    availabilityScore: 95.0,
    performanceScore: 88.0,
    distanceFromPickupMiles: 45.7,
    hoursAvailable: 11.0,
    onTimeDeliveryRate: 0.94,
    acceptanceRate: 0.88,
    completedLoadsCount: 189,
    currentLocation: 'Nampa, ID',
    status: 'OnDuty',
    isRecommended: false
  },
  {
    driverId: 'DRV-003',
    driverName: 'Mike Anderson',
    driverPhone: '(541) 555-0234',
    tractorId: 'TRC-103',
    tractorNumber: 'TRC-103',
    trailerId: 'TRL-203',
    trailerNumber: 'TRL-203',
    totalScore: 85.7,
    proximityScore: 88.0,
    availabilityScore: 80.0,
    performanceScore: 89.0,
    distanceFromPickupMiles: 32.1,
    hoursAvailable: 8.5,
    onTimeDeliveryRate: 0.95,
    acceptanceRate: 0.85,
    completedLoadsCount: 312,
    currentLocation: 'Meridian, ID',
    status: 'Available',
    isRecommended: false
  },
  {
    driverId: 'DRV-004',
    driverName: 'Lisa Chen',
    driverPhone: '(208) 555-0456',
    tractorId: 'TRC-104',
    tractorNumber: 'TRC-104',
    trailerId: 'TRL-204',
    trailerNumber: 'TRL-204',
    totalScore: 82.1,
    proximityScore: 75.0,
    availabilityScore: 85.0,
    performanceScore: 86.5,
    distanceFromPickupMiles: 68.4,
    hoursAvailable: 9.5,
    onTimeDeliveryRate: 0.91,
    acceptanceRate: 0.82,
    completedLoadsCount: 156,
    currentLocation: 'Caldwell, ID',
    status: 'OnBreak',
    isRecommended: false
  },
  {
    driverId: 'DRV-005',
    driverName: 'Robert Wilson',
    driverPhone: '(509) 555-0789',
    tractorId: 'TRC-105',
    tractorNumber: 'TRC-105',
    trailerId: 'TRL-205',
    trailerNumber: 'TRL-205',
    totalScore: 79.8,
    proximityScore: 70.0,
    availabilityScore: 90.0,
    performanceScore: 79.5,
    distanceFromPickupMiles: 92.6,
    hoursAvailable: 10.0,
    onTimeDeliveryRate: 0.87,
    acceptanceRate: 0.79,
    completedLoadsCount: 98,
    currentLocation: 'Twin Falls, ID',
    status: 'Available',
    isRecommended: false
  },
  {
    driverId: 'DRV-006',
    driverName: 'Jennifer Davis',
    driverPhone: '(208) 555-0321',
    tractorId: 'TRC-106',
    tractorNumber: 'TRC-106',
    trailerId: 'TRL-206',
    trailerNumber: 'TRL-206',
    totalScore: 90.2,
    proximityScore: 92.0,
    availabilityScore: 88.0,
    performanceScore: 90.5,
    distanceFromPickupMiles: 21.8,
    hoursAvailable: 9.0,
    onTimeDeliveryRate: 0.93,
    acceptanceRate: 0.90,
    completedLoadsCount: 203,
    currentLocation: 'Eagle, ID',
    status: 'OnDuty',
    isRecommended: false
  },
  {
    driverId: 'DRV-007',
    driverName: 'David Brown',
    driverPhone: '(801) 555-0654',
    tractorId: 'TRC-107',
    tractorNumber: 'TRC-107',
    trailerId: 'TRL-207',
    trailerNumber: 'TRL-207',
    totalScore: 76.4,
    proximityScore: 68.0,
    availabilityScore: 82.0,
    performanceScore: 79.0,
    distanceFromPickupMiles: 105.2,
    hoursAvailable: 8.0,
    onTimeDeliveryRate: 0.84,
    acceptanceRate: 0.76,
    completedLoadsCount: 134,
    currentLocation: 'Pocatello, ID',
    status: 'Maintenance',
    isRecommended: false
  },
  {
    driverId: 'DRV-008',
    driverName: 'Amanda Garcia',
    driverPhone: '(208) 555-0987',
    tractorId: 'TRC-108',
    tractorNumber: 'TRC-108',
    trailerId: 'TRL-208',
    trailerNumber: 'TRL-208',
    totalScore: 87.6,
    proximityScore: 85.0,
    availabilityScore: 92.0,
    performanceScore: 86.0,
    distanceFromPickupMiles: 38.9,
    hoursAvailable: 10.5,
    onTimeDeliveryRate: 0.92,
    acceptanceRate: 0.86,
    completedLoadsCount: 178,
    currentLocation: 'Kuna, ID',
    status: 'Available',
    isRecommended: false
  }
];

const MOCK_ACTIVE_DISPATCHES: DispatchResponse[] = [
  {
    id: 'DISP-001',
    loadId: 'LB-4821',
    driverId: 'DRV-001',
    tractorId: 'TRC-101',
    trailerId: 'TRL-201',
    status: 'Accepted',
    method: 'AutoMatched',
    assignedAt: new Date('2026-01-07T10:30:00'),
    acceptedAt: new Date('2026-01-07T10:45:00'),
    proximityScore: 95.0,
    availabilityScore: 90.0,
    performanceScore: 92.5,
    totalScore: 92.5,
    notes: 'Auto-assigned with score: 92.5'
  },
  {
    id: 'DISP-002',
    loadId: 'LB-6010',
    driverId: 'DRV-006',
    tractorId: 'TRC-106',
    trailerId: 'TRL-206',
    status: 'Pending',
    method: 'Manual',
    assignedAt: new Date('2026-01-07T14:20:00'),
    notes: 'Manually assigned by dispatcher'
  }
];

@Injectable({
  providedIn: 'root'
})
export class DispatchService {
  private readonly apiUrl = 'http://localhost:5000/api/dispatch';
  private activeDispatchesSubject = new BehaviorSubject<DispatchResponse[]>([]);
  public activeDispatches$ = this.activeDispatchesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Find best driver matches for a load using auto-dispatch algorithm
   */
  findDriverMatches(loadId: string, maxMatches = 5): Observable<DriverMatchResponse[]> {
    return this.http.get<DriverMatchResponse[]>(
      `${this.apiUrl}/matches/${loadId}?maxMatches=${maxMatches}`
    ).pipe(
      catchError(error => {
        console.warn('Backend offline, using mock driver matches:', error);
        // Return mock data sorted by score, limited to maxMatches
        const matches = [...MOCK_DRIVER_MATCHES]
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, maxMatches);
        return of(matches).pipe(delay(500)); // Simulate network delay
      })
    );
  }

  /**
   * Manually assign a load to a driver
   */
  assignLoad(request: DispatchRequest): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>(`${this.apiUrl}/assign`, request).pipe(
      tap(() => this.refreshActiveDispatches()),
      catchError(error => {
        console.warn('Backend offline, simulating assignment:', error);
        // Create mock dispatch response
        const mockDispatch: DispatchResponse = {
          id: `DISP-${Date.now()}`,
          loadId: request.loadId,
          driverId: request.driverId,
          tractorId: request.tractorId,
          trailerId: request.trailerId,
          status: 'Pending',
          method: request.method,
          assignedAt: new Date(),
          notes: request.notes
        };
        
        // Add to mock active dispatches
        MOCK_ACTIVE_DISPATCHES.push(mockDispatch);
        this.activeDispatchesSubject.next([...MOCK_ACTIVE_DISPATCHES]);
        
        return of(mockDispatch).pipe(delay(300));
      })
    );
  }

  /**
   * Driver accepts a dispatch assignment
   */
  acceptDispatch(dispatchId: string): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>(
      `${this.apiUrl}/${dispatchId}/accept`,
      {}
    ).pipe(
      tap(() => this.refreshActiveDispatches()),
      catchError(error => {
        console.warn('Backend offline, simulating acceptance:', error);
        const dispatch = MOCK_ACTIVE_DISPATCHES.find(d => d.id === dispatchId);
        if (!dispatch) {
          return throwError(() => new Error('Dispatch not found'));
        }
        
        dispatch.status = 'Accepted';
        dispatch.acceptedAt = new Date();
        this.activeDispatchesSubject.next([...MOCK_ACTIVE_DISPATCHES]);
        
        return of(dispatch).pipe(delay(300));
      })
    );
  }

  /**
   * Driver rejects a dispatch assignment
   */
  rejectDispatch(dispatchId: string, reason: string): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>(
      `${this.apiUrl}/${dispatchId}/reject`,
      { reason }
    ).pipe(
      tap(() => this.refreshActiveDispatches()),
      catchError(error => {
        console.warn('Backend offline, simulating rejection:', error);
        const dispatch = MOCK_ACTIVE_DISPATCHES.find(d => d.id === dispatchId);
        if (!dispatch) {
          return throwError(() => new Error('Dispatch not found'));
        }
        
        dispatch.status = 'Rejected';
        dispatch.rejectedAt = new Date();
        dispatch.rejectionReason = reason;
        this.activeDispatchesSubject.next([...MOCK_ACTIVE_DISPATCHES]);
        
        return of(dispatch).pipe(delay(300));
      })
    );
  }

  /**
   * Get all active dispatches (optionally filtered by driver)
   */
  getActiveDispatches(driverId?: string): Observable<DispatchResponse[]> {
    const url = driverId 
      ? `${this.apiUrl}/active?driverId=${driverId}`
      : `${this.apiUrl}/active`;
    
    return this.http.get<DispatchResponse[]>(url).pipe(
      tap(dispatches => this.activeDispatchesSubject.next(dispatches)),
      catchError(error => {
        console.warn('Backend offline, using mock active dispatches:', error);
        let dispatches = [...MOCK_ACTIVE_DISPATCHES];
        
        if (driverId) {
          dispatches = dispatches.filter(d => d.driverId === driverId);
        }
        
        this.activeDispatchesSubject.next(dispatches);
        return of(dispatches).pipe(delay(300));
      })
    );
  }

  /**
   * Update driver availability and location
   */
  updateDriverAvailability(request: DriverAvailabilityRequest): Observable<DriverAvailabilityResponse> {
    return this.http.put<DriverAvailabilityResponse>(
      `${this.apiUrl}/availability`,
      request
    ).pipe(
      catchError(error => {
        console.warn('Backend offline, simulating availability update:', error);
        // Create mock availability response
        const mockResponse: DriverAvailabilityResponse = {
          driverId: request.driverId,
          driverName: `Driver ${request.driverId}`,
          status: request.status,
          latitude: request.latitude,
          longitude: request.longitude,
          currentLocation: request.currentLocation || 'Unknown',
          hoursWorkedToday: request.hoursWorkedToday || 0,
          hoursWorkedThisWeek: request.hoursWorkedThisWeek || 0,
          hoursAvailable: 11 - (request.hoursWorkedToday || 0),
          onTimeDeliveryRate: 0.92,
          acceptanceRate: 0.88,
          completedLoadsCount: 150,
          lastLocationUpdate: new Date()
        };
        
        return of(mockResponse).pipe(delay(300));
      })
    );
  }

  /**
   * Refresh active dispatches from server
   */
  private refreshActiveDispatches(): void {
    this.getActiveDispatches().subscribe();
  }
}
