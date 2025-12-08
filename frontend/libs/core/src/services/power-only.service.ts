import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PowerOnlyLoad {
  id: string;
  loadNumber: string;
  status: string;
  totalRevenue: number;
  driverName?: string;
  tractorNumber?: string;
  pickupDateTime: Date;
  deliveryDateTime: Date;
  pickupAddress: string;
  deliveryAddress: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PowerOnlyService {
  private apiUrl = 'http://localhost:5000/api/v1/power-only';

  constructor(private http: HttpClient) {}

  getLoads(carrierId: string, status?: string): Observable<ApiResponse<PowerOnlyLoad[]>> {
    let url = `${this.apiUrl}/loads?carrierId=${carrierId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<ApiResponse<PowerOnlyLoad[]>>(url);
  }

  getLoadById(loadId: string): Observable<ApiResponse<PowerOnlyLoad>> {
    return this.http.get<ApiResponse<PowerOnlyLoad>>(`${this.apiUrl}/loads/${loadId}`);
  }

  createLoad(load: any): Observable<ApiResponse<PowerOnlyLoad>> {
    return this.http.post<ApiResponse<PowerOnlyLoad>>(`${this.apiUrl}/loads`, load);
  }

  assignLoad(loadId: string, assignment: any): Observable<ApiResponse<PowerOnlyLoad>> {
    return this.http.post<ApiResponse<PowerOnlyLoad>>(`${this.apiUrl}/loads/${loadId}/assign`, assignment);
  }

  updateLoadStatus(loadId: string, status: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/loads/${loadId}/status`, { status });
  }
}
