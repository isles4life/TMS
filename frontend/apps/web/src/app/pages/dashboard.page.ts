import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MetricCardsComponent, Metric } from '../components/metric-cards.component';
import { LoadTableComponent, LoadRow } from '../components/load-table.component';
import { PageHeaderComponent } from '../components/page-header.component';
import { ExportService } from '../services/export.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatMenuModule, MetricCardsComponent, LoadTableComponent, PageHeaderComponent],
  template: `
    <div class="page">
      <app-ts-page-header 
        eyebrow="Overview" 
        title="Dashboard" 
        description="Visibility across loads, revenue, and operations at a glance."
        [hasActions]="true">
        <button mat-stroked-button color="primary" [matMenuTriggerFor]="exportMenu">
          <mat-icon>download</mat-icon> Export report
        </button>
        <mat-menu #exportMenu="matMenu">
          <button mat-menu-item (click)="exportReport()">
            <mat-icon>table_chart</mat-icon> Export to CSV
          </button>
          <button mat-menu-item (click)="exportJSON()">
            <mat-icon>code</mat-icon> Export to JSON
          </button>
          <button mat-menu-item (click)="printReport()">
            <mat-icon>print</mat-icon> Print Report
          </button>
        </mat-menu>
        <!-- <button mat-flat-button color="primary" class="primary">
          New load
        </button> -->
      </app-ts-page-header>

      <app-ts-metric-cards [metrics]="metrics"></app-ts-metric-cards>

      <div class="split">
        <mat-card class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Activity</p>
              <h3>Recent loads</h3>
            </div>
            <button mat-button color="primary" routerLink="/load-board">View board</button>
          </div>
          <app-ts-load-table [rows]="recentLoads"></app-ts-load-table>
        </mat-card>

        <mat-card class="panel health-panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Health</p>
              <h3>Service levels</h3>
            </div>
          </div>
          <mat-list class="health-list">
            <mat-list-item>
              <mat-icon matListItemIcon color="primary">check_circle</mat-icon>
              <span matListItemTitle>On-time pickups</span>
              <span matListItemLine class="metric-value">96%</span>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon color="primary">check_circle</mat-icon>
              <span matListItemTitle>On-time deliveries</span>
              <span matListItemLine class="metric-value">94%</span>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon color="primary">check_circle</mat-icon>
              <span matListItemTitle>Carrier acceptance</span>
              <span matListItemLine class="metric-value">91%</span>
            </mat-list-item>
          </mat-list>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .primary { font-weight: 700; border-radius: 999px; padding: 10px 18px; }
    .split { display: grid; grid-template-columns: 2fr 1fr; gap: var(--ts-spacing-lg); }
    .panel { padding: var(--ts-spacing-lg); border-radius: 14px; border: 1px solid var(--ts-border); box-shadow: 0 6px 18px rgba(0,0,0,0.06); background: #fff; }
    .panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--ts-spacing-md); }
    .health-panel {
      display: flex;
      flex-direction: column;
    }
    .health-list {
      padding: 0 !important;
    }
    .health-list mat-list-item {
      height: auto !important;
      min-height: 56px;
      padding: var(--ts-spacing-sm) 0;
      border-bottom: 1px solid var(--ts-border);
    }
    .health-list mat-list-item:last-child {
      border-bottom: none;
    }
    .health-list mat-icon {
      color: var(--ts-green);
      margin-right: var(--ts-spacing-md);
    }
    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--ts-ink);
      margin-left: auto;
    }
    @media (max-width: 960px) {
      .split { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardPage {
  private exportService = inject(ExportService);

  metrics: Metric[] = [
    { label: 'Revenue (WTD)', value: '$186,400', delta: '+6.4%', trend: 'up' },
    { label: 'Available loads', value: '3,142', delta: '+4.1%', trend: 'up' },
    { label: 'Avg. rate/mile', value: '$2.31', delta: 'Stable', trend: 'neutral' },
    { label: 'On-time %', value: '95.4%', delta: '+0.8%', trend: 'up' },
  ];

  recentLoads: LoadRow[] = [
    { id: 'LB-4821', origin: 'Boise, ID', destination: 'Portland, OR', equipment: 'Van', rate: '$2.45', pickup: 'Today 2:00p', status: 'Available' },
    { id: 'LB-4822', origin: 'Dallas, TX', destination: 'Denver, CO', equipment: 'Reefer', rate: '$2.92', pickup: 'Today 5:00p', status: 'Pending' },
    { id: 'LB-4823', origin: 'Atlanta, GA', destination: 'Chicago, IL', equipment: 'Flatbed', rate: '$2.15', pickup: 'Tomorrow 9:00a', status: 'Booked' },
  ];

  exportReport(): void {
    this.exportService.exportDashboardReport(this.metrics, this.recentLoads);
  }

  exportJSON(): void {
    const data = {
      metrics: this.metrics,
      loads: this.recentLoads,
      exportedAt: new Date().toISOString()
    };
    this.exportService.exportToJSON([data], `dashboard-report-${new Date().toISOString().split('T')[0]}.json`);
  }

  printReport(): void {
    this.exportService.printReport();
  }
}
