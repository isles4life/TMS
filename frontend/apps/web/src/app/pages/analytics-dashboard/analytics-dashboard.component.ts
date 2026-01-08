import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface KPIDashboardResponse {
  generatedAt: string;
  metrics: KPIMetrics;
  revenueTrend: TrendDataPoint[];
  onTimeDeliveryTrend: TrendDataPoint[];
  topDrivers: DriverPerformance[];
  equipmentStats: EquipmentUtilization[];
}

interface KPIMetrics {
  onTimeDeliveryPercentage: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  driverUtilizationPercentage: number;
  activeDrivers: number;
  availableDrivers: number;
  averageHoursWorkedPerDriver: number;
  equipmentUtilizationPercentage: number;
  activeVehicles: number;
  availableVehicles: number;
  averageLoadedMilesPerVehicle: number;
  averageEmptyMilesPerVehicle: number;
  totalRevenue: number;
  revenuePerMile: number;
  averageLoadRate: number;
  totalMilesDriven: number;
  totalLoads: number;
  completedLoads: number;
  inProgressLoads: number;
  cancelledLoads: number;
  loadAcceptanceRate: number;
  safetyIncidents: number;
  incidentRate: number;
}

interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

interface DriverPerformance {
  driverId: string;
  driverName: string;
  completedLoads: number;
  onTimeDeliveryRate: number;
  totalMiles: number;
  revenue: number;
  safetyScore: number;
  overallScore: number;
}

interface EquipmentUtilization {
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

@Component({
  selector: 'tms-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatMenuModule
  ],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/analytics`;
  
  loading = false;
  dashboard: KPIDashboardResponse | null = null;
  useOfflineMode = false; // Toggle this for offline mock data
  
  dateForm = new FormGroup({
    startDate: new FormControl(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    endDate: new FormControl(new Date()),
    timeGrouping: new FormControl('daily')
  });

  driverColumns = ['driverName', 'completedLoads', 'onTimeDeliveryRate', 'revenue', 'overallScore'];
  equipmentColumns = ['equipmentNumber', 'utilizationPercentage', 'tripsCompleted', 'revenue', 'revenuePerMile'];

  // Mock data for offline mode
  private mockDashboard: KPIDashboardResponse = {
    generatedAt: new Date().toISOString(),
    metrics: {
      onTimeDeliveryPercentage: 94.5,
      totalDeliveries: 248,
      onTimeDeliveries: 234,
      lateDeliveries: 14,
      driverUtilizationPercentage: 87.3,
      activeDrivers: 42,
      availableDrivers: 48,
      averageHoursWorkedPerDriver: 9.2,
      equipmentUtilizationPercentage: 82.1,
      activeVehicles: 39,
      availableVehicles: 48,
      averageLoadedMilesPerVehicle: 2847,
      averageEmptyMilesPerVehicle: 412,
      totalRevenue: 487650,
      revenuePerMile: 2.45,
      averageLoadRate: 1967,
      totalMilesDriven: 199046,
      totalLoads: 248,
      completedLoads: 234,
      inProgressLoads: 12,
      cancelledLoads: 2,
      loadAcceptanceRate: 96.8,
      safetyIncidents: 3,
      incidentRate: 1.51
    },
    revenueTrend: this.generateRevenueTrend(),
    onTimeDeliveryTrend: this.generateOTDTrend(),
    topDrivers: [
      { driverId: '1', driverName: 'John Mitchell', completedLoads: 47, onTimeDeliveryRate: 97.9, totalMiles: 12450, revenue: 92380, safetyScore: 98.5, overallScore: 94.2 },
      { driverId: '2', driverName: 'Sarah Johnson', completedLoads: 44, onTimeDeliveryRate: 95.5, totalMiles: 11230, revenue: 87640, safetyScore: 96.0, overallScore: 91.8 },
      { driverId: '3', driverName: 'Michael Rodriguez', completedLoads: 42, onTimeDeliveryRate: 95.2, totalMiles: 10890, revenue: 84520, safetyScore: 95.5, overallScore: 90.5 },
      { driverId: '4', driverName: 'Emily Chen', completedLoads: 41, onTimeDeliveryRate: 92.7, totalMiles: 10340, revenue: 81200, safetyScore: 97.0, overallScore: 89.3 },
      { driverId: '5', driverName: 'David Thompson', completedLoads: 39, onTimeDeliveryRate: 94.9, totalMiles: 9875, revenue: 78450, safetyScore: 94.0, overallScore: 88.7 },
      { driverId: '6', driverName: 'Jessica Williams', completedLoads: 38, onTimeDeliveryRate: 92.1, totalMiles: 9560, revenue: 75890, safetyScore: 93.5, overallScore: 86.9 },
      { driverId: '7', driverName: 'Robert Brown', completedLoads: 36, onTimeDeliveryRate: 91.7, totalMiles: 8940, revenue: 72340, safetyScore: 95.0, overallScore: 86.2 },
      { driverId: '8', driverName: 'Amanda Davis', completedLoads: 35, onTimeDeliveryRate: 88.6, totalMiles: 8650, revenue: 69500, safetyScore: 92.0, overallScore: 83.5 },
      { driverId: '9', driverName: 'James Wilson', completedLoads: 33, onTimeDeliveryRate: 90.9, totalMiles: 8120, revenue: 66780, safetyScore: 91.5, overallScore: 82.8 },
      { driverId: '10', driverName: 'Maria Garcia', completedLoads: 31, onTimeDeliveryRate: 87.1, totalMiles: 7630, revenue: 63240, safetyScore: 90.0, overallScore: 80.1 }
    ],
    equipmentStats: [
      { equipmentId: '1', equipmentNumber: 'TRK-1001', equipmentType: 'Tractor', utilizationPercentage: 91.5, loadedMiles: 8940, emptyMiles: 1260, totalMiles: 10200, tripsCompleted: 28, revenue: 24960, revenuePerMile: 2.45 },
      { equipmentId: '2', equipmentNumber: 'TRK-1002', equipmentType: 'Tractor', utilizationPercentage: 89.2, loadedMiles: 8350, emptyMiles: 1310, totalMiles: 9660, tripsCompleted: 26, revenue: 23667, revenuePerMile: 2.45 },
      { equipmentId: '3', equipmentNumber: 'TRK-1003', equipmentType: 'Tractor', utilizationPercentage: 87.8, loadedMiles: 7920, emptyMiles: 1180, totalMiles: 9100, tripsCompleted: 25, revenue: 22295, revenuePerMile: 2.45 },
      { equipmentId: '4', equipmentNumber: 'TRK-1004', equipmentType: 'Tractor', utilizationPercentage: 85.3, loadedMiles: 7560, emptyMiles: 1290, totalMiles: 8850, tripsCompleted: 24, revenue: 21682, revenuePerMile: 2.45 },
      { equipmentId: '5', equipmentNumber: 'TRK-1005', equipmentType: 'Tractor', utilizationPercentage: 83.7, loadedMiles: 7230, emptyMiles: 1420, totalMiles: 8650, tripsCompleted: 23, revenue: 21192, revenuePerMile: 2.45 },
      { equipmentId: '6', equipmentNumber: 'TRK-1006', equipmentType: 'Tractor', utilizationPercentage: 81.4, loadedMiles: 6890, emptyMiles: 1380, totalMiles: 8270, tripsCompleted: 22, revenue: 20261, revenuePerMile: 2.45 },
      { equipmentId: '7', equipmentNumber: 'TRK-1007', equipmentType: 'Tractor', utilizationPercentage: 79.6, loadedMiles: 6540, emptyMiles: 1450, totalMiles: 7990, tripsCompleted: 21, revenue: 19575, revenuePerMile: 2.45 },
      { equipmentId: '8', equipmentNumber: 'TRK-1008', equipmentType: 'Tractor', utilizationPercentage: 77.2, loadedMiles: 6180, emptyMiles: 1490, totalMiles: 7670, tripsCompleted: 20, revenue: 18791, revenuePerMile: 2.45 }
    ]
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  private generateRevenueTrend(): TrendDataPoint[] {
    const trend: TrendDataPoint[] = [];
    const baseRevenue = 16000;
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variance = Math.random() * 4000 - 2000;
      trend.push({
        date: date.toISOString(),
        value: Math.round(baseRevenue + variance),
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return trend;
  }

  private generateOTDTrend(): TrendDataPoint[] {
    const trend: TrendDataPoint[] = [];
    const baseOTD = 94;
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variance = Math.random() * 8 - 4;
      trend.push({
        date: date.toISOString(),
        value: Math.min(100, Math.max(80, Math.round((baseOTD + variance) * 10) / 10)),
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return trend;
  }

  loadDashboard(): void {
    this.loading = true;

    // Use offline mock data if enabled or if API fails
    if (this.useOfflineMode) {
      setTimeout(() => {
        this.dashboard = this.mockDashboard;
        this.loading = false;
      }, 500); // Simulate network delay
      return;
    }

    const formValue = this.dateForm.value;
    
    const request = {
      startDate: formValue.startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: formValue.endDate?.toISOString() || new Date().toISOString(),
      timeGrouping: formValue.timeGrouping as 'daily' | 'weekly' | 'monthly' || 'daily',
      count: 10
    };

    this.http.post<ApiResponse<KPIDashboardResponse>>(`${this.apiUrl}/kpi-dashboard`, request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboard = response.data;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.warn('API unavailable, using offline mock data:', error);
        // Fallback to mock data if API fails
        this.dashboard = this.mockDashboard;
        this.useOfflineMode = true;
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadDashboard();
  }

  toggleOfflineMode(): void {
    this.useOfflineMode = !this.useOfflineMode;
    this.loadDashboard();
  }

  exportToPDF(): void {
    if (!this.dashboard) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(215, 25, 32); // TMS Red
    doc.text('Analytics & KPI Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date Range
    doc.setFontSize(10);
    doc.setTextColor(100);
    const startDate = this.dateForm.get('startDate')?.value;
    const endDate = this.dateForm.get('endDate')?.value;
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Period: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`,
      pageWidth / 2,
      28,
      { align: 'center' }
    );

    // KPI Metrics Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Key Performance Indicators', 14, 40);
    
    const kpiData = [
      ['On-Time Delivery', `${this.metrics?.onTimeDeliveryPercentage.toFixed(1)}%`, `${this.metrics?.onTimeDeliveries} / ${this.metrics?.totalDeliveries}`],
      ['Driver Utilization', `${this.metrics?.driverUtilizationPercentage.toFixed(1)}%`, `${this.metrics?.activeDrivers} active drivers`],
      ['Equipment Utilization', `${this.metrics?.equipmentUtilizationPercentage.toFixed(1)}%`, `${this.metrics?.activeVehicles} active vehicles`],
      ['Total Revenue', `$${this.metrics?.totalRevenue.toLocaleString()}`, `$${this.metrics?.revenuePerMile.toFixed(2)}/mile`],
      ['Load Performance', `${this.metrics?.totalLoads} loads`, `${this.metrics?.completedLoads} completed`],
      ['Total Miles', `${this.metrics?.totalMilesDriven.toLocaleString()}`, `${this.metrics?.averageLoadedMilesPerVehicle.toFixed(0)} avg/vehicle`]
    ];

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value', 'Details']],
      body: kpiData,
      theme: 'striped',
      headStyles: { fillColor: [215, 25, 32] }
    });

    // Top Drivers Section
    const finalY = (doc as any).lastAutoTable.finalY || 45;
    doc.setFontSize(14);
    doc.text('Top Performing Drivers', 14, finalY + 15);

    const driverData = this.topDrivers.map(d => [
      d.driverName,
      d.completedLoads.toString(),
      `${d.onTimeDeliveryRate.toFixed(1)}%`,
      `$${d.revenue.toLocaleString()}`,
      d.overallScore.toFixed(0)
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Driver', 'Loads', 'OTD%', 'Revenue', 'Score']],
      body: driverData,
      theme: 'striped',
      headStyles: { fillColor: [215, 25, 32] }
    });

    // Equipment Section
    const equipY = (doc as any).lastAutoTable.finalY || finalY + 20;
    doc.setFontSize(14);
    doc.text('Equipment Performance', 14, equipY + 15);

    const equipData = this.equipmentStats.map(e => [
      e.equipmentNumber,
      `${e.utilizationPercentage.toFixed(1)}%`,
      e.tripsCompleted.toString(),
      `$${e.revenue.toLocaleString()}`,
      `$${e.revenuePerMile.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: equipY + 20,
      head: [['Unit', 'Utilization', 'Trips', 'Revenue', '$/Mile']],
      body: equipData,
      theme: 'striped',
      headStyles: { fillColor: [215, 25, 32] }
    });

    // Save PDF
    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel(): void {
    if (!this.dashboard) return;

    const startDate = this.dateForm.get('startDate')?.value;
    const endDate = this.dateForm.get('endDate')?.value;

    // KPI Metrics Worksheet
    const kpiData = [
      ['Analytics & KPI Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Period: ${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`],
      [],
      ['Key Performance Indicators'],
      ['Metric', 'Value', 'Details'],
      ['On-Time Delivery', `${this.metrics?.onTimeDeliveryPercentage.toFixed(1)}%`, `${this.metrics?.onTimeDeliveries} / ${this.metrics?.totalDeliveries}`],
      ['Driver Utilization', `${this.metrics?.driverUtilizationPercentage.toFixed(1)}%`, `${this.metrics?.activeDrivers} active drivers`],
      ['Equipment Utilization', `${this.metrics?.equipmentUtilizationPercentage.toFixed(1)}%`, `${this.metrics?.activeVehicles} active vehicles`],
      ['Total Revenue', `$${this.metrics?.totalRevenue.toLocaleString()}`, `$${this.metrics?.revenuePerMile.toFixed(2)}/mile`],
      ['Load Performance', `${this.metrics?.totalLoads} loads`, `${this.metrics?.completedLoads} completed`],
      ['Total Miles', `${this.metrics?.totalMilesDriven.toLocaleString()}`, `${this.metrics?.averageLoadedMilesPerVehicle.toFixed(0)} avg/vehicle`]
    ];

    const kpiWS = XLSX.utils.aoa_to_sheet(kpiData);

    // Top Drivers Worksheet
    const driverData = [
      ['Top Performing Drivers'],
      [],
      ['Driver', 'Loads', 'OTD%', 'Revenue', 'Score'],
      ...this.topDrivers.map(d => [
        d.driverName,
        d.completedLoads,
        `${d.onTimeDeliveryRate.toFixed(1)}%`,
        d.revenue,
        d.overallScore.toFixed(0)
      ])
    ];

    const driverWS = XLSX.utils.aoa_to_sheet(driverData);

    // Equipment Worksheet
    const equipData = [
      ['Equipment Performance'],
      [],
      ['Unit', 'Utilization', 'Trips', 'Revenue', '$/Mile'],
      ...this.equipmentStats.map(e => [
        e.equipmentNumber,
        `${e.utilizationPercentage.toFixed(1)}%`,
        e.tripsCompleted,
        e.revenue,
        e.revenuePerMile.toFixed(2)
      ])
    ];

    const equipWS = XLSX.utils.aoa_to_sheet(equipData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, kpiWS, 'KPI Metrics');
    XLSX.utils.book_append_sheet(wb, driverWS, 'Top Drivers');
    XLSX.utils.book_append_sheet(wb, equipWS, 'Equipment');

    // Save file
    XLSX.writeFile(wb, `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  get metrics(): KPIMetrics | null {
    return this.dashboard?.metrics || null;
  }

  get topDrivers(): DriverPerformance[] {
    return this.dashboard?.topDrivers || [];
  }

  get equipmentStats(): EquipmentUtilization[] {
    return this.dashboard?.equipmentStats || [];
  }
}
