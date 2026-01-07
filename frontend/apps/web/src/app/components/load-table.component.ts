import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { Router, RouterModule } from '@angular/router';

export interface LoadRow {
  id: string;
  origin: string;
  destination: string;
  equipment: string;
  rate: string;
  pickup: string;
  status: 'Available' | 'Booked' | 'Pending';
}

@Component({
  selector: 'app-ts-load-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule, MatIconModule, MatCardModule, MatPaginatorModule, RouterModule],
  template: `
    <div class="table-wrapper">
      <table mat-table [dataSource]="visibleRows" class="mat-elevation-z1 desktop">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let row">{{ row.id }}</td>
        </ng-container>
        <ng-container matColumnDef="origin">
          <th mat-header-cell *matHeaderCellDef>Origin</th>
          <td mat-cell *matCellDef="let row">{{ row.origin }}</td>
        </ng-container>
        <ng-container matColumnDef="destination">
          <th mat-header-cell *matHeaderCellDef>Destination</th>
          <td mat-cell *matCellDef="let row">{{ row.destination }}</td>
        </ng-container>
        <ng-container matColumnDef="equipment">
          <th mat-header-cell *matHeaderCellDef>Equip</th>
          <td mat-cell *matCellDef="let row">{{ row.equipment }}</td>
        </ng-container>
        <ng-container matColumnDef="rate">
          <th mat-header-cell *matHeaderCellDef>Rate</th>
          <td mat-cell *matCellDef="let row">{{ row.rate }}</td>
        </ng-container>
        <ng-container matColumnDef="pickup">
          <th mat-header-cell *matHeaderCellDef>Pickup</th>
          <td mat-cell *matCellDef="let row">{{ row.pickup }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip [ngClass]="'status-' + row.status.toLowerCase()">{{ row.status }}</mat-chip>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns" (click)="navigate(row)" class="clickable"></tr>
      </table>
      <mat-paginator 
        [length]="rows.length" 
        [pageSize]="pageSize" 
        [pageIndex]="pageIndex"
        [pageSizeOptions]="pageSizeOptions"
        (page)="handlePage($event)"
        showFirstLastButtons
        class="desktop">
      </mat-paginator>

      <div class="mobile">
        @for (row of visibleRows; track row.id) {
          <mat-card class="load-card" (click)="navigate(row)" role="button" tabindex="0">
          <div class="load-card__header">
            <span class="id">#{{ row.id }}</span>
            <mat-chip [ngClass]="'status-' + row.status.toLowerCase()">{{ row.status }}</mat-chip>
          </div>
          <div class="pair"><mat-icon>trip_origin</mat-icon><span>{{ row.origin }}</span></div>
          <div class="pair"><mat-icon>flag</mat-icon><span>{{ row.destination }}</span></div>
          <div class="meta">Equip: {{ row.equipment }} • Rate: {{ row.rate }}</div>
          <div class="meta">Pickup: {{ row.pickup }}</div>
        </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .table-wrapper { width: 100%; }
    table { width: 100%; }
    .desktop { display: table; }
    .mobile { display: none; }
    th { font-weight: 700; }
    mat-chip { font-weight: 700; }
    .clickable { cursor: pointer; }
    .clickable:hover { background: rgba(0,0,0,0.02); }

    mat-chip.status-available {
      background-color: #10b981 !important;
      color: white !important;
      font-weight: 600;
    }

    mat-chip.status-pending {
      background-color: #f59e0b !important;
      color: white !important;
      font-weight: 600;
    }

    mat-chip.status-booked {
      background-color: #3b82f6 !important;
      color: white !important;
      font-weight: 600;
    }
    .load-card {
      border: 1px solid var(--ts-border);
      border-radius: 12px;
      padding: var(--ts-spacing-md);
      background: #fff;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      display: grid;
      gap: 6px;
    }
    .load-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
    }
    .pair { display: inline-flex; gap: 8px; align-items: center; font-weight: 700; }
    .meta { color: var(--ts-stone); font-size: 13px; }
    @media (max-width: 960px) {
      .desktop { display: none; }
      .mobile { display: grid; gap: var(--ts-spacing-sm); }
    }
  `]
})
export class LoadTableComponent implements OnChanges {
  @Input() rows: LoadRow[] = [];
  displayedColumns = ['id', 'origin', 'destination', 'equipment', 'rate', 'pickup', 'status'];
  pageIndex = 0;
  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  visibleRows: LoadRow[] = [];

  constructor(private router: Router) {}

  ngOnChanges(): void {
    this.pageIndex = 0;
    this.updateVisibleRows();
  }

  handlePage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateVisibleRows();
  }

  navigate(row: LoadRow) {
    this.router.navigate(['/load-details', row.id]);
  }

  private updateVisibleRows() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.visibleRows = this.rows.slice(start, end);
  }
}
