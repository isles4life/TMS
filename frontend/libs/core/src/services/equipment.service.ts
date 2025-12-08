import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Equipment {
  id: string;
  unitNumber: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: string;
  currentMileage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = 'http://localhost:5000/api/v1/equipment';

  constructor(private http: HttpClient) {}

  getPowerOnlyTractors(carrierId: string): Observable<ApiResponse<Equipment[]>> {
    return this.http.get<ApiResponse<Equipment[]>>(`${this.apiUrl}/power-only?carrierId=${carrierId}`);
  }

  getTractorById(tractorId: string): Observable<ApiResponse<Equipment>> {
    return this.http.get<ApiResponse<Equipment>>(`${this.apiUrl}/power-only/${tractorId}`);
  }

  createTractor(tractor: any): Observable<ApiResponse<Equipment>> {
    return this.http.post<ApiResponse<Equipment>>(`${this.apiUrl}/power-only`, tractor);
  }

  updateTractor(tractorId: string, tractor: any): Observable<ApiResponse<Equipment>> {
    return this.http.put<ApiResponse<Equipment>>(`${this.apiUrl}/power-only/${tractorId}`, tractor);
  }

  deleteTractor(tractorId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/power-only/${tractorId}`);
  }

  getAvailableTractors(carrierId: string): Observable<ApiResponse<Equipment[]>> {
    return this.http.get<ApiResponse<Equipment[]>>(`${this.apiUrl}/power-only/available?carrierId=${carrierId}`);
  }
}
