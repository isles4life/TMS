import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Equipment {
  id: string;
  type: string;
  unitNumber: string;
  vin: string;
  status: string;
  year: number;
  make: string;
  model: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private api = inject(ApiService);

  getAllEquipment(): Observable<Equipment[]> {
    return this.api.get<Equipment[]>('equipment/power-only');
  }

  getEquipmentById(id: string): Observable<Equipment> {
    return this.api.get<Equipment>(`equipment/power-only/${id}`);
  }

  createEquipment(equipment: Partial<Equipment>): Observable<Equipment> {
    return this.api.post<Equipment>('equipment/power-only', equipment);
  }

  updateEquipment(id: string, equipment: Partial<Equipment>): Observable<Equipment> {
    return this.api.put<Equipment>(`equipment/power-only/${id}`, equipment);
  }
}
