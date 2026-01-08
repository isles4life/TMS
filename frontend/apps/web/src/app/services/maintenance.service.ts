import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  MaintenanceScheduleResponse,
  CreateMaintenanceScheduleRequest,
  UpdateMaintenanceScheduleRequest,
  MaintenanceRecordResponse,
  CreateMaintenanceRecordRequest,
  CompleteMaintenanceRecordRequest,
  MaintenanceRecordItemRequest,
  VendorResponse,
  CreateVendorRequest,
  UpdateVendorRatingRequest
} from '../models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/maintenance';

  // ============== Maintenance Schedules ==============
  
  createSchedule(request: CreateMaintenanceScheduleRequest): Observable<MaintenanceScheduleResponse> {
    return this.http.post<ApiResponse<MaintenanceScheduleResponse>>(`${this.apiUrl}/schedules`, request)
      .pipe(map(response => response.data!));
  }

  getTractorSchedules(tractorId: string): Observable<MaintenanceScheduleResponse[]> {
    return this.http.get<ApiResponse<MaintenanceScheduleResponse[]>>(`${this.apiUrl}/schedules/tractor/${tractorId}`)
      .pipe(map(response => response.data || []));
  }

  getTrailerSchedules(trailerId: string): Observable<MaintenanceScheduleResponse[]> {
    return this.http.get<ApiResponse<MaintenanceScheduleResponse[]>>(`${this.apiUrl}/schedules/trailer/${trailerId}`)
      .pipe(map(response => response.data || []));
  }

  getOverdueSchedules(): Observable<MaintenanceScheduleResponse[]> {
    return this.http.get<ApiResponse<MaintenanceScheduleResponse[]>>(`${this.apiUrl}/schedules/overdue`)
      .pipe(map(response => response.data || []));
  }

  getSchedulesDueSoon(daysAhead: number = 7): Observable<MaintenanceScheduleResponse[]> {
    const params = new HttpParams().set('daysAhead', daysAhead.toString());
    return this.http.get<ApiResponse<MaintenanceScheduleResponse[]>>(`${this.apiUrl}/schedules/due-soon`, { params })
      .pipe(map(response => response.data || []));
  }

  updateScheduleStatus(scheduleId: string, request: UpdateMaintenanceScheduleRequest): Observable<MaintenanceScheduleResponse> {
    return this.http.put<ApiResponse<MaintenanceScheduleResponse>>(`${this.apiUrl}/schedules/${scheduleId}/status`, request)
      .pipe(map(response => response.data!));
  }

  deleteSchedule(scheduleId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/schedules/${scheduleId}`)
      .pipe(map(() => undefined));
  }

  // ============== Maintenance Records ==============

  createRecord(request: CreateMaintenanceRecordRequest): Observable<MaintenanceRecordResponse> {
    return this.http.post<ApiResponse<MaintenanceRecordResponse>>(`${this.apiUrl}/records`, request)
      .pipe(map(response => response.data!));
  }

  getRecord(recordId: string): Observable<MaintenanceRecordResponse> {
    return this.http.get<ApiResponse<MaintenanceRecordResponse>>(`${this.apiUrl}/records/${recordId}`)
      .pipe(map(response => response.data!));
  }

  getTractorRecords(tractorId: string, startDate?: Date, endDate?: Date): Observable<MaintenanceRecordResponse[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    
    return this.http.get<ApiResponse<MaintenanceRecordResponse[]>>(`${this.apiUrl}/records/tractor/${tractorId}`, { params })
      .pipe(map(response => response.data || []));
  }

  getTrailerRecords(trailerId: string, startDate?: Date, endDate?: Date): Observable<MaintenanceRecordResponse[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    
    return this.http.get<ApiResponse<MaintenanceRecordResponse[]>>(`${this.apiUrl}/records/trailer/${trailerId}`, { params })
      .pipe(map(response => response.data || []));
  }

  getScheduledRecords(): Observable<MaintenanceRecordResponse[]> {
    return this.http.get<ApiResponse<MaintenanceRecordResponse[]>>(`${this.apiUrl}/records/scheduled`)
      .pipe(map(response => response.data || []));
  }

  startWork(recordId: string, technicianName: string): Observable<MaintenanceRecordResponse> {
    const params = new HttpParams().set('technicianName', technicianName);
    return this.http.post<ApiResponse<MaintenanceRecordResponse>>(`${this.apiUrl}/records/${recordId}/start`, null, { params })
      .pipe(map(response => response.data!));
  }

  completeWork(recordId: string, request: CompleteMaintenanceRecordRequest): Observable<MaintenanceRecordResponse> {
    return this.http.post<ApiResponse<MaintenanceRecordResponse>>(`${this.apiUrl}/records/${recordId}/complete`, request)
      .pipe(map(response => response.data!));
  }

  addLineItems(recordId: string, items: MaintenanceRecordItemRequest[]): Observable<MaintenanceRecordResponse> {
    return this.http.post<ApiResponse<MaintenanceRecordResponse>>(`${this.apiUrl}/records/${recordId}/items`, items)
      .pipe(map(response => response.data!));
  }

  // ============== Vendors ==============

  createVendor(request: CreateVendorRequest): Observable<VendorResponse> {
    return this.http.post<ApiResponse<VendorResponse>>(`${this.apiUrl}/vendors`, request)
      .pipe(map(response => response.data!));
  }

  getAllVendors(): Observable<VendorResponse[]> {
    return this.http.get<ApiResponse<VendorResponse[]>>(`${this.apiUrl}/vendors`)
      .pipe(map(response => response.data || []));
  }

  getActiveVendors(): Observable<VendorResponse[]> {
    return this.http.get<ApiResponse<VendorResponse[]>>(`${this.apiUrl}/vendors/active`)
      .pipe(map(response => response.data || []));
  }

  getPreferredVendors(): Observable<VendorResponse[]> {
    return this.http.get<ApiResponse<VendorResponse[]>>(`${this.apiUrl}/vendors/preferred`)
      .pipe(map(response => response.data || []));
  }

  updateVendorRating(vendorId: string, request: UpdateVendorRatingRequest): Observable<VendorResponse> {
    return this.http.post<ApiResponse<VendorResponse>>(`${this.apiUrl}/vendors/${vendorId}/rating`, request)
      .pipe(map(response => response.data!));
  }

  deactivateVendor(vendorId: string, reason: string): Observable<VendorResponse> {
    const params = new HttpParams().set('reason', reason);
    return this.http.post<ApiResponse<VendorResponse>>(`${this.apiUrl}/vendors/${vendorId}/deactivate`, null, { params })
      .pipe(map(response => response.data!));
  }
}
