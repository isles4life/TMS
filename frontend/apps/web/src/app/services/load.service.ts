import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Load {
  id: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  rate: number;
  distance: number;
  weight: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadService {
  constructor(private api: ApiService) {}

  getAllLoads(): Observable<Load[]> {
    return this.api.get<Load[]>('poweronly/loads');
  }

  getLoadById(id: string): Observable<Load> {
    return this.api.get<Load>(`poweronly/loads/${id}`);
  }

  createLoad(load: Partial<Load>): Observable<Load> {
    return this.api.post<Load>('poweronly/loads', load);
  }

  assignLoad(loadId: string, assignment: any): Observable<any> {
    return this.api.post<any>(`poweronly/loads/${loadId}/assign`, assignment);
  }
}
