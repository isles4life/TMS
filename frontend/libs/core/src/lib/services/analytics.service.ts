import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface KPIDashboardResponse {
  generatedAt: string;
  metrics: KPIMetrics;
  revenueTrend: TrendDataPoint[];
  onTimeDeliveryTrend: TrendDataPoint[];
  topDrivers: DriverPerformance[];
  equipmentStats: EquipmentUtilization[];
}

export interface KPIMetrics {
  // Delivery Performance
  onTimeDeliveryPercentage: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  
  // Driver Metrics
  driverUtilizationPercentage: number;
  activeDrivers: number;
  availableDrivers: number;
  averageHoursWorkedPerDriver: number;
  
  // Equipment Metrics
  equipmentUtilizationPercentage: number;
  activeVehicles: number;
  availableVehicles: number;
  averageLoadedMilesPerVehicle: number;
  averageEmptyMilesPerVehicle: number;
  
  // Financial Metrics
  totalRevenue: number;
  revenuePerMile: number;
  averageLoadRate: number;
  totalMilesDriven: number;
  
  // Load Metrics
  totalLoads: number;
  completedLoads: number;
  inProgressLoads: number;
  cancelledLoads: number;
  loadAcceptanceRate: number;
  
  // Safety Metrics
  safetyIncidents: number;
  incidentRate: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface DriverPerformance {
  driverId: string;
  driverName: string;
  completedLoads: number;
  onTimeDeliveryRate: number;
  totalMiles: number;
  revenue: number;
  safetyScore: number;
  overallScore: number;
}

export interface EquipmentUtilization {
  equipmentId: string;
  equipmentNumber: string;
  equipmentType: string;
  utilizationPercentage: number;
  loadedMiles: number;
  emptyMiles: number;
  totalMiles: number;
  tripsCompleted: number;
  revenue: number;
  revenuePerMile: number;
}

export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  timeGrouping?: 'daily' | 'weekly' | 'monthly';
  count?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) {}

  getKPIDashboard(request: AnalyticsRequest): Observable<ApiResponse<KPIDashboardResponse>> {
    return this.http.post<ApiResponse<KPIDashboardResponse>>(`${this.apiUrl}/kpi-dashboard`, request);
  }

  getOnTimeDeliveryPercentage(startDate: string, endDate: string): Observable<ApiResponse<number>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/metrics/otd`, { params });
  }

  getDriverUtilization(startDate: string, endDate: string): Observable<ApiResponse<number>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/metrics/driver-utilization`, { params });
  }

  getEquipmentUtilization(startDate: string, endDate: string): Observable<ApiResponse<number>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/metrics/equipment-utilization`, { params });
  }

  getRevenueTrend(request: AnalyticsRequest): Observable<ApiResponse<TrendDataPoint[]>> {
    return this.http.post<ApiResponse<TrendDataPoint[]>>(`${this.apiUrl}/trends/revenue`, request);
  }

  getOnTimeDeliveryTrend(request: AnalyticsRequest): Observable<ApiResponse<TrendDataPoint[]>> {
    return this.http.post<ApiResponse<TrendDataPoint[]>>(`${this.apiUrl}/trends/otd`, request);
  }

  getTopDrivers(request: AnalyticsRequest): Observable<ApiResponse<DriverPerformance[]>> {
    return this.http.post<ApiResponse<DriverPerformance[]>>(`${this.apiUrl}/drivers/top`, request);
  }

  getEquipmentUtilizationStats(request: AnalyticsRequest): Observable<ApiResponse<EquipmentUtilization[]>> {
    return this.http.post<ApiResponse<EquipmentUtilization[]>>(`${this.apiUrl}/equipment/utilization`, request);
  }
}
