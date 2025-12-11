import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PODPhoto {
  id: string;
  proofOfDeliveryId: string;
  photoType: number;
  photoUrl: string;
  fileSizeBytes: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  capturedDateTime: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProofOfDeliveryDto {
  id: string;
  tripId: string;
  loadId: string;
  driverId: string;
  status: number;
  recipientName?: string;
  signatureData?: string;
  deliveryNotes?: string;
  deliveryDateTime?: Date;
  deliveryLocation?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  completedDateTime?: Date;
  estimatedDeliveryDateTime?: Date;
  isOnTime?: boolean;
  exceptionNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
  photos?: PODPhoto[];
}

export interface CreateProofOfDeliveryDto {
  tripId: string;
  loadId: string;
  driverId: string;
  deliveryLocation?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryNotes?: string;
  estimatedDeliveryDateTime?: Date;
}

export interface SignProofOfDeliveryDto {
  recipientName: string;
  signatureData: string;
  deliveryDateTime: Date;
  deliveryLocation?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryNotes?: string;
}

export interface AddPODPhotoDto {
  photoType: number;
  photoUrl: string;
  fileSizeBytes: number;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompleteProofOfDeliveryDto {
  exceptionNotes?: string;
}

export interface ProofOfDeliveryListDto {
  id: string;
  tripId: string;
  loadId: string;
  driverId: string;
  status: number;
  recipientName?: string;
  deliveryDateTime?: Date;
  isOnTime?: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProofOfDeliveryService {
  private apiUrl = '/api/proof-of-delivery';

  constructor(private http: HttpClient) { }

  /**
   * Create a new Proof of Delivery for a load
   */
  createProofOfDelivery(dto: CreateProofOfDeliveryDto): Observable<ProofOfDeliveryDto> {
    return this.http.post<ProofOfDeliveryDto>(this.apiUrl, dto);
  }

  /**
   * Sign a Proof of Delivery with recipient info and signature
   */
  signProofOfDelivery(id: string, dto: SignProofOfDeliveryDto): Observable<ProofOfDeliveryDto> {
    return this.http.post<ProofOfDeliveryDto>(`${this.apiUrl}/${id}/sign`, dto);
  }

  /**
   * Add a photo to a Proof of Delivery
   */
  addPhoto(id: string, dto: AddPODPhotoDto): Observable<PODPhoto> {
    return this.http.post<PODPhoto>(`${this.apiUrl}/${id}/photos`, dto);
  }

  /**
   * Complete a Proof of Delivery
   */
  completeProofOfDelivery(id: string, dto: CompleteProofOfDeliveryDto): Observable<ProofOfDeliveryDto> {
    return this.http.post<ProofOfDeliveryDto>(`${this.apiUrl}/${id}/complete`, dto);
  }

  /**
   * Get a specific Proof of Delivery by ID
   */
  getProofOfDelivery(id: string): Observable<ProofOfDeliveryDto> {
    return this.http.get<ProofOfDeliveryDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get Proof of Delivery for a specific load
   */
  getByLoadId(loadId: string): Observable<ProofOfDeliveryDto> {
    return this.http.get<ProofOfDeliveryDto>(`${this.apiUrl}/load/${loadId}`);
  }

  /**
   * Get all Proof of Delivery records for a driver with optional date range
   */
  getByDriverId(
    driverId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<ProofOfDeliveryListDto[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    return this.http.get<ProofOfDeliveryListDto[]>(
      `${this.apiUrl}/driver/${driverId}`,
      { params }
    );
  }

  /**
   * Get all pending (draft/incomplete) Proofs of Delivery
   */
  getPending(): Observable<ProofOfDeliveryListDto[]> {
    return this.http.get<ProofOfDeliveryListDto[]>(`${this.apiUrl}/pending/all`);
  }
}
