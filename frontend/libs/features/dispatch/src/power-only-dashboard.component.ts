import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PowerOnlyService, PowerOnlyLoad } from '../../core/src/services/power-only.service';

@Component({
  selector: 'app-power-only-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Power Only Loads</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <button mat-raised-button color="primary">Create New Load</button>
        <table mat-table [dataSource]="loads" class="loads-table">
          <ng-container matColumnDef="loadNumber">
            <th mat-header-cell>Load #</th>
            <td mat-cell>{{ element.loadNumber }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell>Status</th>
            <td mat-cell>{{ element.status }}</td>
          </ng-container>
          <ng-container matColumnDef="revenue">
            <th mat-header-cell>Revenue</th>
            <td mat-cell>\${{ element.totalRevenue | number: '1.2-2' }}</td>
          </ng-container>
          <ng-container matColumnDef="driver">
            <th mat-header-cell>Driver</th>
            <td mat-cell>{{ element.driverName || 'Unassigned' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell>Actions</th>
            <td mat-cell>
              <button mat-icon-button>
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button>
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row></tr>
          <tr mat-row></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .loads-table {
      width: 100%;
      margin-top: 20px;
    }
  `]
})
export class PowerOnlyDashboardComponent implements OnInit {
  loads: PowerOnlyLoad[] = [];

  constructor(private powerOnlyService: PowerOnlyService) {}

  ngOnInit() {
    // TODO: Load data from service
  }
}
