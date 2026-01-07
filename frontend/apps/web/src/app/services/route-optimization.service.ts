import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RouteRequest {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  vehicleType?: string;
  departureTime?: Date;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  optimizationMode?: string;
}

export interface RouteResponse {
  routeId: string;
  distanceMiles: number;
  distanceKilometers: number;
  durationMinutes: number;
  trafficDelayMinutes: number;
  estimatedArrivalTime: Date;
  tollCost: number;
  segments: RouteSegment[];
  polyline: RoutePoint[];
  summary: RouteSummary;
}

export interface RouteSegment {
  instruction: string;
  distanceMiles: number;
  durationMinutes: number;
  roadName: string;
  maneuverType: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteSummary {
  optimizationMode: string;
  fuelConsumptionGallons: number;
  estimatedFuelCost: number;
  restStopsRequired: number;
  warnings: string[];
}

export interface RouteDistance {
  distanceMiles: number;
  distanceKilometers: number;
  durationMinutes: number;
  trafficDelayMinutes: number;
}

export interface MultiStopRouteRequest {
  waypoints: RouteWaypoint[];
  vehicleType?: string;
  departureTime?: Date;
  optimizeWaypointOrder?: boolean;
  optimizationMode?: string;
}

export interface RouteWaypoint {
  locationId: string;
  latitude: number;
  longitude: number;
  locationName: string;
  serviceTimeMinutes?: number;
  timeWindow?: Date;
}

export interface MultiStopRouteResponse {
  optimizedOrder: RouteWaypoint[];
  totalDistanceMiles: number;
  totalDurationMinutes: number;
  legs: RouteResponse[];
  totalFuelCost: number;
  estimatedCompletionTime: Date;
}

export interface FuelCostEstimate {
  distanceMiles: number;
  fuelConsumptionGallons: number;
  fuelPricePerGallon: number;
  totalFuelCost: number;
  averageMPG: number;
  vehicleType: string;
}

export interface FuelPriceInfo {
  zipCode: string;
  fuelType: string;
  pricePerGallon: number;
  source: string;
  retrievedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class RouteOptimizationService {
  private readonly apiUrl = `${environment.apiUrl}/routes`;

  constructor(private http: HttpClient) {}

  /**
   * Calculate optimized route between two points
   */
  calculateRoute(request: RouteRequest): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(`${this.apiUrl}/calculate`, request);
  }

  /**
   * Get distance and duration between two coordinates
   */
  getDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    vehicleType = 'truck'
  ): Observable<RouteDistance> {
    const params = new HttpParams()
      .set('originLat', originLat.toString())
      .set('originLng', originLng.toString())
      .set('destLat', destLat.toString())
      .set('destLng', destLng.toString())
      .set('vehicleType', vehicleType);

    return this.http.get<RouteDistance>(`${this.apiUrl}/distance`, { params });
  }

  /**
   * Calculate estimated time of arrival
   */
  getETA(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    departureTime: Date
  ): Observable<{ estimatedArrivalTime: Date; departureTime: Date; travelTimeMinutes: number }> {
    const params = new HttpParams()
      .set('originLat', originLat.toString())
      .set('originLng', originLng.toString())
      .set('destLat', destLat.toString())
      .set('destLng', destLng.toString())
      .set('departureTime', departureTime.toISOString());

    return this.http.get<{ estimatedArrivalTime: Date; departureTime: Date; travelTimeMinutes: number }>(`${this.apiUrl}/eta`, { params });
  }

  /**
   * Calculate optimized multi-stop route
   */
  calculateMultiStopRoute(request: MultiStopRouteRequest): Observable<MultiStopRouteResponse> {
    return this.http.post<MultiStopRouteResponse>(`${this.apiUrl}/multi-stop`, request);
  }

  /**
   * Get alternative routes with different optimization criteria
   */
  getAlternativeRoutes(request: RouteRequest, maxAlternatives = 3): Observable<RouteResponse[]> {
    return this.http.post<RouteResponse[]>(
      `${this.apiUrl}/alternatives?maxAlternatives=${maxAlternatives}`,
      request
    );
  }

  /**
   * Calculate fuel cost estimate
   */
  calculateFuelCost(
    distanceMiles: number,
    vehicleType: string,
    fuelPricePerGallon: number
  ): Observable<FuelCostEstimate> {
    const params = new HttpParams()
      .set('distanceMiles', distanceMiles.toString())
      .set('vehicleType', vehicleType)
      .set('fuelPricePerGallon', fuelPricePerGallon.toString());

    return this.http.get<FuelCostEstimate>(`${this.apiUrl}/fuel-cost`, { params });
  }

  /**
   * Lookup fuel price by zip code
   */
  getFuelPriceByZip(zipCode: string, fuelType = 'diesel'): Observable<FuelPriceInfo> {
    const params = new HttpParams()
      .set('zipCode', zipCode)
      .set('fuelType', fuelType);

    return this.http.get<FuelPriceInfo>(`${this.apiUrl}/fuel-price`, { params });
  }

  /**
   * Format distance for display
   */
  formatDistance(miles: number): string {
    return `${miles.toFixed(1)} mi`;
  }

  /**
   * Format duration for display
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Format ETA for display
   */
  formatETA(eta: Date): string {
    return new Date(eta).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
