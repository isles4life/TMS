import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

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
    );
  }

  /**
   * Manually assign a load to a driver
   */
  assignLoad(request: DispatchRequest): Observable<DispatchResponse> {
    return this.http.post<DispatchResponse>(`${this.apiUrl}/assign`, request).pipe(
      tap(() => this.refreshActiveDispatches())
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
      tap(() => this.refreshActiveDispatches())
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
      tap(() => this.refreshActiveDispatches())
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
      tap(dispatches => this.activeDispatchesSubject.next(dispatches))
    );
  }

  /**
   * Update driver availability and location
   */
  updateDriverAvailability(request: DriverAvailabilityRequest): Observable<DriverAvailabilityResponse> {
    return this.http.put<DriverAvailabilityResponse>(
      `${this.apiUrl}/availability`,
      request
    );
  }

  /**
   * Refresh active dispatches from server
   */
  private refreshActiveDispatches(): void {
    this.getActiveDispatches().subscribe();
  }
}
