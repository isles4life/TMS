import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private api = inject(ApiService);

  getAllDrivers(): Observable<Driver[]> {
    return this.api.get<Driver[]>('drivers');
  }

  getDriverById(id: string): Observable<Driver> {
    return this.api.get<Driver>(`drivers/${id}`);
  }

  createDriver(driver: Partial<Driver>): Observable<Driver> {
    return this.api.post<Driver>('drivers', driver);
  }

  updateDriver(id: string, driver: Partial<Driver>): Observable<Driver> {
    return this.api.put<Driver>(`drivers/${id}`, driver);
  }
}
