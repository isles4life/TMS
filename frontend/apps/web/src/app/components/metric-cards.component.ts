import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface Metric {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'ts-metric-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="metric-grid">
      <mat-card class="metric-card" *ngFor="let metric of metrics">
        <div class="metric-card__header">
          <div class="trend-icon-wrapper">
            <mat-icon *ngIf="metric.trend === 'up'" class="trend up">trending_up</mat-icon>
            <mat-icon *ngIf="metric.trend === 'down'" class="trend down">trending_down</mat-icon>
            <mat-icon *ngIf="metric.trend === 'neutral'" class="trend neutral">horizontal_rule</mat-icon>
          </div>
          <span class="metric-label">{{ metric.label }}</span>
        </div>
        <div class="metric-value">{{ metric.value }}</div>
        <div class="metric-delta" *ngIf="metric.delta">{{ metric.delta }}</div>
      </mat-card>
    </div>
  `,
  styles: [`
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--ts-spacing-lg);
    }
    .metric-card {
      padding: var(--ts-spacing-lg);
      border-radius: 12px;
      border: 1px solid var(--ts-border);
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      background: #fff;
    }
    .metric-card__header {
      display: flex;
      align-items: center;
      gap: var(--ts-spacing-sm);
      color: var(--ts-stone);
      font-weight: 600;
    }
    .trend-icon-wrapper {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    .metric-label { font-size: 13px; letter-spacing: 0.01em; }
    .metric-value { font-size: 26px; font-weight: 800; margin-top: 6px; color: var(--ts-ink); }
    .metric-delta { font-size: 13px; font-weight: 600; color: var(--ts-stone); margin-top: 4px; }
    .trend {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .trend.up { color: var(--ts-green); }
    .trend.down { color: var(--ts-red); }
    .trend.neutral { color: var(--ts-stone); }
  `]
})
export class MetricCardsComponent {
  @Input() metrics: Metric[] = [];
}
