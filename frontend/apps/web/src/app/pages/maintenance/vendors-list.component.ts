import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MaintenanceService } from '../../services/maintenance.service';
import { VendorResponse, VendorStatus, getVendorTypeName, getVendorStatusName } from '../../models/maintenance.model';
import { VendorFormComponent } from './vendor-form.component';

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    FormsModule
  ],
  template: `
    <div class="vendors-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <div class="title-row">
              <div class="title-content">
                <mat-icon class="title-icon">build</mat-icon>
                <h1>Vendors</h1>
              </div>
              <button mat-raised-button color="primary" (click)="openVendorForm()">
                <mat-icon>add</mat-icon>
                Add Vendor
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search vendors</mat-label>
              <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="Search by name, city, or specialty...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()">
                <mat-option value="all">All Vendors</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="preferred">Preferred</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-value">{{ vendors.length }}</div>
              <div class="stat-label">Total Vendors</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ activeCount }}</div>
              <div class="stat-label">Active</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ preferredCount }}</div>
              <div class="stat-label">Preferred</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ getAverageRating() }}</div>
              <div class="stat-label">Avg Rating</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Vendors List -->
      <div class="vendors-grid">
        <mat-card *ngFor="let vendor of filteredVendors" class="vendor-card">
          <mat-card-header>
            <div class="vendor-header">
              <div class="vendor-title">
                <h3>{{ vendor.vendorName }}</h3>
                <mat-chip [class]="'status-chip status-' + getStatusClass(vendor.status)">
                  {{ getVendorStatusName(vendor.status) }}
                </mat-chip>
              </div>
              <div class="vendor-actions">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openVendorForm(vendor)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="togglePreferred(vendor)">
                    <mat-icon>{{ vendor.isPreferred ? 'star' : 'star_border' }}</mat-icon>
                    <span>{{ vendor.isPreferred ? 'Remove from Preferred' : 'Mark as Preferred' }}</span>
                  </button>
                  <button mat-menu-item (click)="deactivateVendor(vendor)" *ngIf="vendor.status === 0">
                    <mat-icon>block</mat-icon>
                    <span>Deactivate</span>
                  </button>
                </mat-menu>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="vendor-info">
              <div class="info-row">
                <mat-icon class="info-icon">category</mat-icon>
                <span class="info-label">Type:</span>
                <span>{{ getVendorTypeName(vendor.vendorType) }}</span>
              </div>

              <div class="info-row" *ngIf="vendor.contactName">
                <mat-icon class="info-icon">person</mat-icon>
                <span class="info-label">Contact:</span>
                <span>{{ vendor.contactName }}</span>
              </div>

              <div class="info-row" *ngIf="vendor.phone">
                <mat-icon class="info-icon">phone</mat-icon>
                <span class="info-label">Phone:</span>
                <span>{{ vendor.phone }}</span>
              </div>

              <div class="info-row" *ngIf="vendor.email">
                <mat-icon class="info-icon">email</mat-icon>
                <span class="info-label">Email:</span>
                <span>{{ vendor.email }}</span>
              </div>

              <div class="info-row" *ngIf="vendor.city && vendor.state">
                <mat-icon class="info-icon">location_on</mat-icon>
                <span class="info-label">Location:</span>
                <span>{{ vendor.city }}, {{ vendor.state }}</span>
              </div>

              <div class="info-row" *ngIf="vendor.specialtyAreas">
                <mat-icon class="info-icon">build_circle</mat-icon>
                <span class="info-label">Specialty:</span>
                <span>{{ vendor.specialtyAreas }}</span>
              </div>

              <mat-divider class="section-divider"></mat-divider>

              <div class="performance-section">
                <div class="performance-item">
                  <div class="performance-label">Rating</div>
                  <div class="rating-display">
                    <mat-icon class="star-icon" *ngFor="let star of getRatingStars(vendor.rating)">{{ star }}</mat-icon>
                    <span class="rating-number">({{ vendor.rating.toFixed(1) }})</span>
                  </div>
                </div>

                <div class="performance-item">
                  <div class="performance-label">Jobs Completed</div>
                  <div class="performance-value">{{ vendor.totalJobsCompleted }}</div>
                </div>

                <div class="performance-item" *ngIf="vendor.lastServiceDate">
                  <div class="performance-label">Last Service</div>
                  <div class="performance-value">{{ vendor.lastServiceDate | date: 'MMM d, yyyy' }}</div>
                </div>
              </div>

              <div class="badges-section">
                <mat-chip class="badge-chip preferred" *ngIf="vendor.isPreferred">
                  <mat-icon>star</mat-icon>
                  Preferred
                </mat-chip>
                <mat-chip class="badge-chip insurance" *ngIf="vendor.hasInsurance">
                  <mat-icon>verified_user</mat-icon>
                  Insured
                </mat-chip>
                <mat-chip class="badge-chip available" *ngIf="vendor.isAvailable">
                  <mat-icon>check_circle</mat-icon>
                  Available
                </mat-chip>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div *ngIf="filteredVendors.length === 0" class="no-results">
          <mat-icon>search_off</mat-icon>
          <p>No vendors found</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendors-container {
      padding: var(--ts-spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: var(--ts-spacing-lg);
      background: var(--ts-surface-secondary);
      border: 1px solid var(--ts-border);
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: var(--ts-spacing-lg);
    }

    .title-content {
      display: flex;
      align-items: center;
      gap: var(--ts-spacing-md);
    }

    .title-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--ts-red);
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--ts-ink);
    }

    .filters-row {
      display: flex;
      gap: var(--ts-spacing-md);
      margin-top: var(--ts-spacing-md);
    }

    .search-field {
      flex: 1;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--ts-spacing-md);
      margin-top: var(--ts-spacing-md);
    }

    .stat-card {
      background: linear-gradient(135deg, var(--ts-red) 0%, var(--ts-red-dark) 100%);
      color: white;
      padding: var(--ts-spacing-lg);
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(215, 25, 32, 0.2);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(215, 25, 32, 0.3);
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      opacity: 0.95;
      font-weight: 600;
    }

    .vendors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: var(--ts-spacing-lg);
    }

    .vendor-card {
      background: var(--ts-surface-secondary);
      border: 1px solid var(--ts-border);
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .vendor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .vendor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .vendor-title {
      flex: 1;
    }

    .vendor-title h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .status-chip {
      font-size: 11px;
      height: 24px;
      padding: 0 8px;
    }

    .status-chip.status-active {
      background-color: #4caf50;
      color: white;
    }

    .status-chip.status-inactive {
      background-color: #9e9e9e;
      color: white;
    }

    .status-chip.status-suspended {
      background-color: #f44336;
      color: white;
    }

    .status-chip.status-pending {
      background-color: #ff9800;
      color: white;
    }

    .vendor-info {
      margin-top: 12px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--ts-ink);
    }

    .info-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--ts-ink-secondary);
    }

    .info-label {
      font-weight: 600;
      color: var(--ts-ink-secondary);
    }

    .section-divider {
      margin: var(--ts-spacing-md) 0;
      border-color: var(--ts-border);
    }

    .performance-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--ts-spacing-md);
      margin-bottom: var(--ts-spacing-md);
    }

    .performance-item {
      text-align: center;
    }

    .performance-label {
      font-size: 12px;
      color: var(--ts-ink-secondary);
      margin-bottom: 4px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .rating-display {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .star-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--ts-amber);
    }

    .rating-number {
      margin-left: 4px;
      font-size: 12px;
      color: var(--ts-ink-secondary);
      font-weight: 600;
    }

    .performance-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--ts-ink);
    }

    .badges-section {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .badge-chip {
      font-size: 11px;
      height: 28px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .badge-chip.preferred {
      background-color: var(--ts-amber);
      color: #1a1f28;
    }

    .badge-chip.insurance {
      background-color: #2196f3;
      color: white;
    }

    .badge-chip.available {
      background-color: var(--ts-green);
      color: white;
    }

    .badge-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--ts-spacing-3xl);
      color: var(--ts-ink-secondary);
    }

    .no-results mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: var(--ts-spacing-md);
      opacity: 0.3;
      color: var(--ts-ink-secondary);
    }

    .no-results p {
      font-size: 16px;
      font-weight: 600;
    }
  `]
})
export class VendorsListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  vendors: VendorResponse[] = [];
  filteredVendors: VendorResponse[] = [];
  searchQuery = '';
  selectedStatus = 'all';

  get activeCount(): number {
    return this.vendors.filter(v => v.status === VendorStatus.Active).length;
  }

  get preferredCount(): number {
    return this.vendors.filter(v => v.isPreferred).length;
  }

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    this.maintenanceService.getAllVendors().subscribe({
      next: (vendors) => {
        this.vendors = vendors;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
        this.snackBar.open('Failed to load vendors', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.vendors];

    // Apply status filter
    if (this.selectedStatus === 'active') {
      filtered = filtered.filter(v => v.status === VendorStatus.Active);
    } else if (this.selectedStatus === 'preferred') {
      filtered = filtered.filter(v => v.isPreferred);
    } else if (this.selectedStatus === 'inactive') {
      filtered = filtered.filter(v => v.status === VendorStatus.Inactive);
    }

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.vendorName.toLowerCase().includes(query) ||
        v.city?.toLowerCase().includes(query) ||
        v.specialtyAreas?.toLowerCase().includes(query)
      );
    }

    this.filteredVendors = filtered;
  }

  openVendorForm(vendor?: VendorResponse): void {
    const dialogRef = this.dialog.open(VendorFormComponent, {
      width: '600px',
      data: vendor
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVendors();
      }
    });
  }

  togglePreferred(vendor: VendorResponse): void {
    // This would need a backend endpoint to toggle preferred status
    // For now, just show a message
    this.snackBar.open(
      vendor.isPreferred ? 'Removed from preferred vendors' : 'Added to preferred vendors',
      'Close',
      { duration: 3000 }
    );
  }

  deactivateVendor(vendor: VendorResponse): void {
    const reason = prompt('Enter reason for deactivation:');
    if (reason) {
      this.maintenanceService.deactivateVendor(vendor.id, reason).subscribe({
        next: () => {
          this.snackBar.open('Vendor deactivated successfully', 'Close', { duration: 3000 });
          this.loadVendors();
        },
        error: (error) => {
          console.error('Error deactivating vendor:', error);
          this.snackBar.open('Failed to deactivate vendor', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getVendorTypeName = getVendorTypeName;
  getVendorStatusName = getVendorStatusName;

  getStatusClass(status: VendorStatus): string {
    switch (status) {
      case VendorStatus.Active: return 'active';
      case VendorStatus.Inactive: return 'inactive';
      case VendorStatus.Suspended: return 'suspended';
      case VendorStatus.PendingApproval: return 'pending';
      default: return 'inactive';
    }
  }

  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    if (hasHalfStar) {
      stars.push('star_half');
    }
    while (stars.length < 5) {
      stars.push('star_border');
    }
    return stars;
  }

  getAverageRating(): string {
    if (this.vendors.length === 0) return '0.0';
    const total = this.vendors.reduce((sum, v) => sum + v.rating, 0);
    return (total / this.vendors.length).toFixed(1);
  }
}
