import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MaintenanceService } from '../../services/maintenance.service';
import { 
  MaintenanceRecordResponse, 
  MaintenanceRecordStatus,
  getMaintenanceRecordTypeName, 
  getMaintenanceRecordStatusName 
} from '../../models/maintenance.model';
import { WorkOrderFormComponent } from './work-order-form.component';

@Component({
  selector: 'app-work-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule
  ],
  template: `
    <div class="work-orders-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <div class="title-row">
              <div class="title-content">
                <mat-icon class="title-icon">assignment</mat-icon>
                <h1>Work Orders</h1>
              </div>
              <button mat-raised-button color="primary" (click)="openWorkOrderForm()">
                <mat-icon>add</mat-icon>
                Create Work Order
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="stats-row">
            <div class="stat-card scheduled">
              <div class="stat-value">{{ getCountByStatus(0) }}</div>
              <div class="stat-label">Scheduled</div>
            </div>
            <div class="stat-card in-progress">
              <div class="stat-value">{{ getCountByStatus(1) }}</div>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card completed">
              <div class="stat-value">{{ getCountByStatus(2) }}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card total-cost">
              <div class="stat-value">{{ getTotalCost() | currency }}</div>
              <div class="stat-label">Total Cost</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="work-orders-tabs">
        <!-- Scheduled Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">event</mat-icon>
            Scheduled ({{ getCountByStatus(0) }})
          </ng-template>
          <div class="tab-content">
            <div class="work-orders-grid">
              <mat-card *ngFor="let workOrder of getRecordsByStatus(0)" class="work-order-card">
                <mat-card-header>
                  <div class="work-order-header">
                    <div class="work-order-title">
                      <h3>{{ workOrder.workOrderNumber }}</h3>
                      <mat-chip class="status-chip scheduled">{{ getMaintenanceRecordStatusName(workOrder.status) }}</mat-chip>
                    </div>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="startWork(workOrder)">
                        <mat-icon>play_arrow</mat-icon>
                        <span>Start Work</span>
                      </button>
                      <button mat-menu-item (click)="openWorkOrderForm(workOrder)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                    </mat-menu>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="work-order-info">
                    <div class="info-item">
                      <mat-icon>category</mat-icon>
                      <span>{{ getMaintenanceRecordTypeName(workOrder.recordType) }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.vendorName">
                      <mat-icon>build</mat-icon>
                      <span>{{ workOrder.vendorName }}</span>
                    </div>

                    <div class="info-item">
                      <mat-icon>event</mat-icon>
                      <span>Scheduled: {{ workOrder.serviceDate | date: 'MMM d, yyyy' }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.description">
                      <mat-icon>description</mat-icon>
                      <span>{{ workOrder.description }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngIf="getCountByStatus(0) === 0" class="no-results">
              <mat-icon>check_circle</mat-icon>
              <p>No scheduled work orders</p>
            </div>
          </div>
        </mat-tab>

        <!-- In Progress Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">build_circle</mat-icon>
            In Progress ({{ getCountByStatus(1) }})
          </ng-template>
          <div class="tab-content">
            <div class="work-orders-grid">
              <mat-card *ngFor="let workOrder of getRecordsByStatus(1)" class="work-order-card in-progress">
                <mat-card-header>
                  <div class="work-order-header">
                    <div class="work-order-title">
                      <h3>{{ workOrder.workOrderNumber }}</h3>
                      <mat-chip class="status-chip in-progress">{{ getMaintenanceRecordStatusName(workOrder.status) }}</mat-chip>
                    </div>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="completeWork(workOrder)">
                        <mat-icon>check_circle</mat-icon>
                        <span>Complete Work</span>
                      </button>
                      <button mat-menu-item (click)="openWorkOrderForm(workOrder)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                    </mat-menu>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="work-order-info">
                    <div class="info-item">
                      <mat-icon>category</mat-icon>
                      <span>{{ getMaintenanceRecordTypeName(workOrder.recordType) }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.vendorName">
                      <mat-icon>build</mat-icon>
                      <span>{{ workOrder.vendorName }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.technicianName">
                      <mat-icon>person</mat-icon>
                      <span>Technician: {{ workOrder.technicianName }}</span>
                    </div>

                    <div class="info-item">
                      <mat-icon>event</mat-icon>
                      <span>Started: {{ workOrder.serviceDate | date: 'MMM d, yyyy' }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.description">
                      <mat-icon>description</mat-icon>
                      <span>{{ workOrder.description }}</span>
                    </div>
                  </div>

                  <div class="cost-info" *ngIf="workOrder.laborCost > 0 || workOrder.partsCost > 0">
                    <div class="cost-item">
                      <span class="cost-label">Labor:</span>
                      <span class="cost-value">{{ workOrder.laborCost | currency }}</span>
                    </div>
                    <div class="cost-item">
                      <span class="cost-label">Parts:</span>
                      <span class="cost-value">{{ workOrder.partsCost | currency }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngIf="getCountByStatus(1) === 0" class="no-results">
              <mat-icon>build_circle</mat-icon>
              <p>No work orders in progress</p>
            </div>
          </div>
        </mat-tab>

        <!-- Completed Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">check_circle</mat-icon>
            Completed ({{ getCountByStatus(2) }})
          </ng-template>
          <div class="tab-content">
            <div class="work-orders-grid">
              <mat-card *ngFor="let workOrder of getRecordsByStatus(2)" class="work-order-card completed">
                <mat-card-header>
                  <div class="work-order-header">
                    <div class="work-order-title">
                      <h3>{{ workOrder.workOrderNumber }}</h3>
                      <mat-chip class="status-chip completed">{{ getMaintenanceRecordStatusName(workOrder.status) }}</mat-chip>
                    </div>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="work-order-info">
                    <div class="info-item">
                      <mat-icon>category</mat-icon>
                      <span>{{ getMaintenanceRecordTypeName(workOrder.recordType) }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.vendorName">
                      <mat-icon>build</mat-icon>
                      <span>{{ workOrder.vendorName }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.technicianName">
                      <mat-icon>person</mat-icon>
                      <span>{{ workOrder.technicianName }}</span>
                    </div>

                    <div class="info-item">
                      <mat-icon>event</mat-icon>
                      <span>Completed: {{ workOrder.completedDate | date: 'MMM d, yyyy' }}</span>
                    </div>

                    <div class="info-item" *ngIf="workOrder.mileageAtService">
                      <mat-icon>speed</mat-icon>
                      <span>{{ workOrder.mileageAtService | number }} miles</span>
                    </div>
                  </div>

                  <div class="cost-summary">
                    <div class="cost-breakdown">
                      <div class="cost-item">
                        <span class="cost-label">Labor:</span>
                        <span class="cost-value">{{ workOrder.laborCost | currency }}</span>
                      </div>
                      <div class="cost-item">
                        <span class="cost-label">Parts:</span>
                        <span class="cost-value">{{ workOrder.partsCost | currency }}</span>
                      </div>
                    </div>
                    <div class="total-cost">
                      <span class="total-label">Total:</span>
                      <span class="total-value">{{ workOrder.totalCost | currency }}</span>
                    </div>
                  </div>

                  <div class="notes-section" *ngIf="workOrder.notes">
                    <strong>Notes:</strong>
                    <p>{{ workOrder.notes }}</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngIf="getCountByStatus(2) === 0" class="no-results">
              <mat-icon>inbox</mat-icon>
              <p>No completed work orders</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .work-orders-container {
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

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--ts-spacing-md);
      margin-top: var(--ts-spacing-md);
    }

    .stat-card {
      color: white;
      padding: var(--ts-spacing-lg);
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .stat-card.scheduled {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    }

    .stat-card.in-progress {
      background: linear-gradient(135deg, var(--ts-amber) 0%, #e09300 100%);
    }

    .stat-card.completed {
      background: linear-gradient(135deg, var(--ts-green) 0%, #189d5f 100%);
    }

    .stat-card.total-cost {
      background: linear-gradient(135deg, var(--ts-red) 0%, var(--ts-red-dark) 100%);
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

    .work-orders-tabs {
      margin-top: var(--ts-spacing-lg);
    }

    .tab-icon {
      margin-right: 8px;
    }

    .tab-content {
      padding: var(--ts-spacing-lg) 0;
    }

    .work-orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--ts-spacing-lg);
    }

    .work-order-card {
      background: var(--ts-surface-secondary);
      border: 1px solid var(--ts-border);
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .work-order-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .work-order-card.in-progress {
      border-left: 4px solid var(--ts-amber);
    }

    .work-order-card.completed {
      border-left: 4px solid var(--ts-green);
    }

    .work-order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .work-order-title {
      flex: 1;
    }

    .work-order-title h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      color: var(--ts-ink);
    }

    .status-chip {
      font-size: 11px;
      height: 24px;
      padding: 0 8px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .status-chip.scheduled {
      background-color: #2196f3;
      color: white;
    }

    .status-chip.in-progress {
      background-color: var(--ts-amber);
      color: white;
    }

    .status-chip.completed {
      background-color: var(--ts-green);
      color: white;
    }

    .work-order-info {
      margin-top: var(--ts-spacing-md);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--ts-ink);
    }

    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--ts-ink-secondary);
    }

    .cost-info {
      margin-top: var(--ts-spacing-md);
      padding: var(--ts-spacing-md);
      background-color: var(--ts-surface);
      border-radius: 8px;
      border: 1px solid var(--ts-border);
    }

    .cost-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .cost-label {
      color: var(--ts-ink-secondary);
      font-size: 14px;
      font-weight: 600;
    }

    .cost-value {
      font-weight: 700;
      color: var(--ts-ink);
    }

    .cost-summary {
      margin-top: var(--ts-spacing-md);
      padding: var(--ts-spacing-md);
      background-color: var(--ts-surface);
      border-radius: 8px;
      border: 1px solid var(--ts-border);
    }

    .cost-breakdown {
      margin-bottom: 8px;
    }

    .total-cost {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 2px solid var(--ts-border);
      font-weight: 700;
    }

    .total-label {
      font-size: 16px;
      color: var(--ts-ink);
    }

    .total-value {
      font-size: 18px;
      color: var(--ts-green);
      font-weight: 800;
    }

    .notes-section {
      margin-top: var(--ts-spacing-md);
      padding: var(--ts-spacing-md);
      background-color: rgba(245, 163, 0, 0.1);
      border-left: 3px solid var(--ts-amber);
      border-radius: 4px;
      font-size: 14px;
    }

    :root.dark-mode .notes-section {
      background-color: rgba(255, 184, 77, 0.15);
    }

    .notes-section strong {
      color: var(--ts-ink);
      font-weight: 700;
    }

    .notes-section p {
      margin: 4px 0 0 0;
      color: var(--ts-ink-secondary);
    }

    .no-results {
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
export class WorkOrdersListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  workOrders: MaintenanceRecordResponse[] = [];

  ngOnInit(): void {
    this.loadWorkOrders();
  }

  loadWorkOrders(): void {
    this.maintenanceService.getScheduledRecords().subscribe({
      next: (records) => {
        this.workOrders = records;
      },
      error: (error) => {
        console.error('Error loading work orders:', error);
        this.snackBar.open('Failed to load work orders', 'Close', { duration: 3000 });
      }
    });
  }

  openWorkOrderForm(workOrder?: MaintenanceRecordResponse): void {
    const dialogRef = this.dialog.open(WorkOrderFormComponent, {
      width: '600px',
      data: workOrder
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWorkOrders();
      }
    });
  }

  startWork(workOrder: MaintenanceRecordResponse): void {
    const technicianName = prompt('Enter technician name:');
    if (technicianName) {
      this.maintenanceService.startWork(workOrder.id, technicianName).subscribe({
        next: () => {
          this.snackBar.open('Work started successfully', 'Close', { duration: 3000 });
          this.loadWorkOrders();
        },
        error: (error) => {
          console.error('Error starting work:', error);
          this.snackBar.open('Failed to start work', 'Close', { duration: 3000 });
        }
      });
    }
  }

  completeWork(workOrder: MaintenanceRecordResponse): void {
    const notes = prompt('Enter completion notes (optional):');
    this.maintenanceService.completeWork(workOrder.id, { notes: notes || undefined }).subscribe({
      next: () => {
        this.snackBar.open('Work completed successfully', 'Close', { duration: 3000 });
        this.loadWorkOrders();
      },
      error: (error) => {
        console.error('Error completing work:', error);
        this.snackBar.open('Failed to complete work', 'Close', { duration: 3000 });
      }
    });
  }

  getRecordsByStatus(status: MaintenanceRecordStatus): MaintenanceRecordResponse[] {
    return this.workOrders.filter(wo => wo.status === status);
  }

  getCountByStatus(status: MaintenanceRecordStatus): number {
    return this.getRecordsByStatus(status).length;
  }

  getTotalCost(): number {
    return this.workOrders
      .filter(wo => wo.status === MaintenanceRecordStatus.Completed)
      .reduce((sum, wo) => sum + wo.totalCost, 0);
  }

  getMaintenanceRecordTypeName = getMaintenanceRecordTypeName;
  getMaintenanceRecordStatusName = getMaintenanceRecordStatusName;
}
