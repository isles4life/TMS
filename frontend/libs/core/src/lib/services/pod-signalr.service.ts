import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface PODEvent {
  type: 'created' | 'signed' | 'completed' | 'photosAdded';
  podId: string;
  loadId?: string;
  driverId?: string;
  recipientName?: string;
  deliveryDateTime?: Date;
  photoCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PODSignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private podStatusChanged$ = new Subject<PODEvent>();
  private connectionState$ = new Subject<'connected' | 'disconnected' | 'reconnecting'>();

  constructor(private ngZone: NgZone) {
    this.initializeSignalR();
  }

  /**
   * Initialize SignalR connection to POD hub
   */
  private initializeSignalR(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/pod', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 0, 3000, 5000, 10000, 15000])
      .withServerTimeout(30000)
      .build();

    // Listen for POD created event
    this.hubConnection.on('PODCreated', (podId: string, loadId: string, driverId: string) => {
      this.ngZone.run(() => {
        this.podStatusChanged$.next({
          type: 'created',
          podId,
          loadId,
          driverId
        });
      });
    });

    // Listen for POD signed event
    this.hubConnection.on('PODSigned', (podId: string, recipientName: string, deliveryDateTime: Date) => {
      this.ngZone.run(() => {
        this.podStatusChanged$.next({
          type: 'signed',
          podId,
          recipientName,
          deliveryDateTime
        });
      });
    });

    // Listen for POD completed event
    this.hubConnection.on('PODCompleted', (podId: string, loadId: string) => {
      this.ngZone.run(() => {
        this.podStatusChanged$.next({
          type: 'completed',
          podId,
          loadId
        });
      });
    });

    // Listen for photos added event
    this.hubConnection.on('PhotosAdded', (podId: string, photoCount: number) => {
      this.ngZone.run(() => {
        this.podStatusChanged$.next({
          type: 'photosAdded',
          podId,
          photoCount
        });
      });
    });

    // Handle connection state changes
    this.hubConnection.onreconnecting(() => {
      this.ngZone.run(() => {
        this.connectionState$.next('reconnecting');
      });
    });

    this.hubConnection.onreconnected(() => {
      this.ngZone.run(() => {
        this.connectionState$.next('connected');
      });
    });

    this.hubConnection.onclose(() => {
      this.ngZone.run(() => {
        this.connectionState$.next('disconnected');
      });
    });

    this.startConnection();
  }

  /**
   * Start SignalR connection
   */
  private startConnection(): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection?.start()
      .then(() => {
        console.log('POD SignalR connected');
        this.connectionState$.next('connected');
      })
      .catch(err => {
        console.error('POD SignalR connection error:', err);
        this.connectionState$.next('disconnected');
      });
  }

  /**
   * Get POD status change events
   */
  getPODStatusChanged() {
    return this.podStatusChanged$.asObservable();
  }

  /**
   * Get connection state changes
   */
  getConnectionState() {
    return this.connectionState$.asObservable();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Subscribe to updates for a specific POD
   */
  subscribeToPOD(podId: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SubscribeToPOD', podId)
        .catch(err => console.error('Error subscribing to POD:', err));
    }
  }

  /**
   * Unsubscribe from updates for a specific POD
   */
  unsubscribeFromPOD(podId: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('UnsubscribeFromPOD', podId)
        .catch(err => console.error('Error unsubscribing from POD:', err));
    }
  }

  /**
   * Subscribe to dispatch updates for a driver
   */
  subscribeToDriverUpdates(driverId: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('SubscribeToDriverUpdates', driverId)
        .catch(err => console.error('Error subscribing to driver updates:', err));
    }
  }

  /**
   * Unsubscribe from dispatch updates for a driver
   */
  unsubscribeFromDriverUpdates(driverId: string): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('UnsubscribeFromDriverUpdates', driverId)
        .catch(err => console.error('Error unsubscribing from driver updates:', err));
    }
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.stop()
        .catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }
}
