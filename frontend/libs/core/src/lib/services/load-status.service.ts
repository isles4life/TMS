import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadStatusHistory, ChangeLoadStatusRequest, LoadStatusTransitions } from '../models/load-status.model';

@Injectable({
  providedIn: 'root'
})
export class LoadStatusService {
  private readonly apiUrl = 'http://localhost:5000/api/loads';

  constructor(private http: HttpClient) {}

  changeLoadStatus(loadId: string, request: ChangeLoadStatusRequest): Observable<LoadStatusHistory> {
    return this.http.post<LoadStatusHistory>(
      `${this.apiUrl}/${loadId}/status`,
      request
    ).pipe(
      map(history => this.mapStatusHistoryDates(history))
    );
  }

  getStatusHistory(loadId: string): Observable<LoadStatusHistory[]> {
    return this.http.get<LoadStatusHistory[]>(
      `${this.apiUrl}/${loadId}/status/history`
    ).pipe(
      map(histories => histories.map(h => this.mapStatusHistoryDates(h)))
    );
  }

  getValidTransitions(loadId: string): Observable<LoadStatusTransitions> {
    return this.http.get<LoadStatusTransitions>(
      `${this.apiUrl}/${loadId}/status/transitions`
    );
  }

  private mapStatusHistoryDates(history: any): LoadStatusHistory {
    return {
      ...history,
      changedAt: new Date(history.changedAt)
    };
  }
}
