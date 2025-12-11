import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ProofOfDeliveryService, ProofOfDeliveryDto, CreateProofOfDeliveryDto } from './proof-of-delivery.service';
import { PODSignalRService, PODEvent } from './pod-signalr.service';

/**
 * Integration service for POD workflow with dispatch system
 * Handles creation of POD when load is marked as delivered
 */
@Injectable({
  providedIn: 'root'
})
export class DispatchPODIntegrationService {
  private podCreatedForLoad$ = new Subject<{ loadId: string; podId: string }>();
  private podCompletedForLoad$ = new Subject<{ loadId: string; podId: string }>();

  constructor(
    private http: HttpClient,
    private podService: ProofOfDeliveryService,
    private signalRService: PODSignalRService
  ) {
    this.listenToSignalREvents();
  }

  /**
   * Create POD when load is marked as delivered
   * This is called from the dispatch service when load reaches "Delivered" status
   */
  async createPODForDelivery(
    loadId: string,
    tripId: string,
    driverId: string,
    deliveryLocation?: string,
    deliveryLatitude?: number,
    deliveryLongitude?: number,
    estimatedDeliveryDateTime?: Date
  ): Promise<ProofOfDeliveryDto> {
    const dto: CreateProofOfDeliveryDto = {
      loadId,
      tripId,
      driverId,
      deliveryLocation,
      deliveryLatitude,
      deliveryLongitude,
      estimatedDeliveryDateTime
    };

    const pod = await this.podService.createProofOfDelivery(dto).toPromise();
    if (pod) {
      this.podCreatedForLoad$.next({ loadId, podId: pod.id });
      this.signalRService.subscribeToPOD(pod.id);
    }
    return pod!;
  }

  /**
   * Check if POD exists for a load
   */
  checkPODForLoad(loadId: string): Observable<ProofOfDeliveryDto | null> {
    return new Observable(observer => {
      this.podService.getByLoadId(loadId).subscribe({
        next: pod => {
          observer.next(pod);
          observer.complete();
        },
        error: () => {
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  /**
   * Batch get PODs for multiple loads
   */
  getPODsForLoads(loadIds: string[]): Observable<Map<string, ProofOfDeliveryDto>> {
    return new Observable(observer => {
      const podMap = new Map<string, ProofOfDeliveryDto>();
      let completed = 0;

      if (loadIds.length === 0) {
        observer.next(podMap);
        observer.complete();
        return;
      }

      loadIds.forEach(loadId => {
        this.podService.getByLoadId(loadId).subscribe({
          next: pod => {
            if (pod) {
              podMap.set(loadId, pod);
            }
            completed++;
            if (completed === loadIds.length) {
              observer.next(podMap);
              observer.complete();
            }
          },
          error: () => {
            completed++;
            if (completed === loadIds.length) {
              observer.next(podMap);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Listen to SignalR events and emit local subjects
   */
  private listenToSignalREvents(): void {
    this.signalRService.getPODStatusChanged().subscribe((event: PODEvent) => {
      switch (event.type) {
        case 'created':
          if (event.loadId) {
            this.podCreatedForLoad$.next({ loadId: event.loadId, podId: event.podId });
          }
          break;
        case 'completed':
          if (event.loadId) {
            this.podCompletedForLoad$.next({ loadId: event.loadId, podId: event.podId });
          }
          break;
      }
    });
  }

  /**
   * Observable stream for when POD is created for a load
   */
  getPODCreatedForLoad() {
    return this.podCreatedForLoad$.asObservable();
  }

  /**
   * Observable stream for when POD is completed for a load
   */
  getPODCompletedForLoad() {
    return this.podCompletedForLoad$.asObservable();
  }

  /**
   * Cleanup subscriptions
   */
  dispose(): void {
    this.signalRService.dispose();
  }
}
