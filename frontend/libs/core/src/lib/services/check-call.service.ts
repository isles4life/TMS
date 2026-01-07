import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CheckCall, CreateCheckCallRequest } from '../models/check-call.model';

@Injectable({
  providedIn: 'root'
})
export class CheckCallService {
  private readonly apiUrl = 'http://localhost:5000/api/loads';

  constructor(private http: HttpClient) {}

  createCheckCall(loadId: string, driverId: string, request: CreateCheckCallRequest): Observable<CheckCall> {
    return this.http.post<CheckCall>(
      `${this.apiUrl}/${loadId}/check-calls?driverId=${driverId}`,
      request
    ).pipe(
      map(checkCall => this.mapCheckCallDates(checkCall))
    );
  }

  getLoadCheckCalls(loadId: string): Observable<CheckCall[]> {
    return this.http.get<CheckCall[]>(
      `${this.apiUrl}/${loadId}/check-calls`
    ).pipe(
      map(checkCalls => checkCalls.map(cc => this.mapCheckCallDates(cc)))
    );
  }

  getCheckCallById(loadId: string, checkCallId: string): Observable<CheckCall> {
    return this.http.get<CheckCall>(
      `${this.apiUrl}/${loadId}/check-calls/${checkCallId}`
    ).pipe(
      map(checkCall => this.mapCheckCallDates(checkCall))
    );
  }

  private mapCheckCallDates(checkCall: any): CheckCall {
    return {
      ...checkCall,
      checkInTime: new Date(checkCall.checkInTime),
      createdAt: new Date(checkCall.createdAt),
      estimatedArrivalTime: checkCall.estimatedArrivalTime ? new Date(checkCall.estimatedArrivalTime) : undefined
    };
  }
}
