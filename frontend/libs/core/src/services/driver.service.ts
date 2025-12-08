import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cdlNumber: string;
  cdlExpiryDate: Date;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = 'http://localhost:5000/api/v1/drivers';

  constructor(private http: HttpClient) {}

  getDrivers(carrierId: string): Observable<ApiResponse<Driver[]>> {
    return this.http.get<ApiResponse<Driver[]>>(`${this.apiUrl}?carrierId=${carrierId}`);
  }

  getDriverById(driverId: string): Observable<ApiResponse<Driver>> {
    return this.http.get<ApiResponse<Driver>>(`${this.apiUrl}/${driverId}`);
  }

  createDriver(driver: any): Observable<ApiResponse<Driver>> {
    return this.http.post<ApiResponse<Driver>>(this.apiUrl, driver);
  }

  updateDriver(driverId: string, driver: any): Observable<ApiResponse<Driver>> {
    return this.http.put<ApiResponse<Driver>>(`${this.apiUrl}/${driverId}`, driver);
  }

  deleteDriver(driverId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${driverId}`);
  }

  // Compliance checks
  getExpiringDocuments(carrierId: string): Observable<ApiResponse<Driver[]>> {
    return this.http.get<ApiResponse<Driver[]>>(`${this.apiUrl}/compliance/expiring?carrierId=${carrierId}`);
  }
}
