import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoadTableComponent, LoadRow } from '../components/load-table.component';
import { PageHeaderComponent } from '../components/page-header.component';

@Component({
  selector: 'app-load-board-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, ReactiveFormsModule, RouterModule, LoadTableComponent, PageHeaderComponent],
  template: `
    <div class="page">
      <app-ts-page-header 
        eyebrow="Marketplace" 
        title="Load Board" 
        description="Filter and post Truckstop-ready loads with fast actions."
        [hasActions]="true">
        <button mat-flat-button color="primary" class="primary" routerLink="/post-load">Post load</button>
      </app-ts-page-header>

      <mat-card class="panel">
        <form [formGroup]="filters" class="filters" (ngSubmit)="applyFilters()">
          <mat-form-field appearance="outline">
            <mat-label>Origin</mat-label>
            <input matInput placeholder="e.g. Boise, ID" formControlName="origin" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Destination</mat-label>
            <input matInput placeholder="e.g. Denver, CO" formControlName="destination" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Equipment</mat-label>
            <mat-select formControlName="equipment">
              <mat-option value="">Any</mat-option>
              <mat-option value="Van">Van</mat-option>
              <mat-option value="Reefer">Reefer</mat-option>
              <mat-option value="Flatbed">Flatbed</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit">Search</button>
        </form>
      </mat-card>

      <mat-card class="panel">
        <app-ts-load-table [rows]="rows"></app-ts-load-table>
      </mat-card>
    </div>
  `,
  styles: [`
    .panel { padding: var(--ts-spacing-lg); border: 1px solid var(--ts-border); border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
    .filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--ts-spacing-md); align-items: center; }
  `]
})
export class LoadBoardPage {
  private fb = inject(FormBuilder);

  filters = this.fb.group({ origin: [''], destination: [''], equipment: [''] });

  rows: LoadRow[] = [
    { id: 'LB-6010', origin: 'Boise, ID', destination: 'Salt Lake City, UT', equipment: 'Van', rate: '$2.35', pickup: 'Today 1:00p', status: 'Available' },
    { id: 'LB-6011', origin: 'Seattle, WA', destination: 'Spokane, WA', equipment: 'Flatbed', rate: '$2.18', pickup: 'Today 4:30p', status: 'Pending' },
    { id: 'LB-6012', origin: 'Dallas, TX', destination: 'Phoenix, AZ', equipment: 'Reefer', rate: '$2.90', pickup: 'Tomorrow 8:00a', status: 'Available' },
    { id: 'LB-6013', origin: 'Chicago, IL', destination: 'Columbus, OH', equipment: 'Van', rate: '$2.25', pickup: 'Tomorrow 9:15a', status: 'Available' },
    { id: 'LB-6014', origin: 'Atlanta, GA', destination: 'Tampa, FL', equipment: 'Reefer', rate: '$2.78', pickup: 'Today 6:45p', status: 'Pending' },
    { id: 'LB-6015', origin: 'Denver, CO', destination: 'Kansas City, MO', equipment: 'Flatbed', rate: '$2.05', pickup: 'Tomorrow 7:30a', status: 'Available' },
    { id: 'LB-6016', origin: 'Los Angeles, CA', destination: 'Sacramento, CA', equipment: 'Van', rate: '$2.60', pickup: 'Today 3:20p', status: 'Available' },
    { id: 'LB-6017', origin: 'Houston, TX', destination: 'New Orleans, LA', equipment: 'Reefer', rate: '$2.48', pickup: 'Today 5:00p', status: 'Pending' },
    { id: 'LB-6018', origin: 'Minneapolis, MN', destination: 'Milwaukee, WI', equipment: 'Flatbed', rate: '$2.15', pickup: 'Tomorrow 10:10a', status: 'Available' },
    { id: 'LB-6019', origin: 'Phoenix, AZ', destination: 'Las Vegas, NV', equipment: 'Van', rate: '$2.30', pickup: 'Today 8:00p', status: 'Available' },
    { id: 'LB-6020', origin: 'Portland, OR', destination: 'Redding, CA', equipment: 'Reefer', rate: '$2.65', pickup: 'Tomorrow 6:45a', status: 'Available' },
    { id: 'LB-6021', origin: 'Charlotte, NC', destination: 'Nashville, TN', equipment: 'Van', rate: '$2.12', pickup: 'Tomorrow 11:30a', status: 'Pending' },
    { id: 'LB-6022', origin: 'Cincinnati, OH', destination: 'Detroit, MI', equipment: 'Flatbed', rate: '$2.08', pickup: 'Today 2:50p', status: 'Available' }
  ];

  applyFilters() {
    this.filters.markAllAsTouched();
    // For demo purposes we do not mutate data; plug API here.
  }
}
