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
import { MaintenanceService } from '../../services/maintenance.service';
import { MaintenanceScheduleResponse, getMaintenanceScheduleTypeName } from '../../models/maintenance.model';
import { ScheduleFormComponent } from './schedule-form.component';

@Component({
  selector: 'app-schedules-list',
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
    MatDialogModule
  ],
  template: `
    <div class="schedules-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <div class="title-row">
              <div class="title-content">
                <mat-icon class="title-icon">event_repeat</mat-icon>
                <h1>PM Schedules</h1>
              </div>
              <button mat-raised-button color="primary" (click)="openScheduleForm()">
                <mat-icon>add</mat-icon>
                Create Schedule
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="alerts-section" *ngIf="overdueSchedules.length > 0">
            <div class="alert alert-danger">
              <mat-icon>warning</mat-icon>
              <span>{{ overdueSchedules.length }} schedule(s) are overdue!</span>
            </div>
          </div>

          <div class="alerts-section" *ngIf="dueSoonSchedules.length > 0">
            <div class="alert alert-warning">
              <mat-icon>notifications</mat-icon>
              <span>{{ dueSoonSchedules.length }} schedule(s) need attention soon</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="schedules-tabs">
        <!-- Overdue Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">error</mat-icon>
            Overdue ({{ overdueSchedules.length }})
          </ng-template>
          <div class="tab-content">
            <div class="schedules-grid">
              <mat-card *ngFor="let schedule of overdueSchedules" class="schedule-card overdue">
                <mat-card-header>
                  <div class="schedule-header">
                    <h3>{{ schedule.scheduleName }}</h3>
                    <mat-chip class="status-chip overdue">OVERDUE</mat-chip>
                  </div>
                </mat-card-header>
                <mat-card-content>
                  <div class="schedule-info">
                    <div class="info-item">
                      <mat-icon>category</mat-icon>
                      <span>{{ getMaintenanceScheduleTypeName(schedule.scheduleType) }}</span>
                    </div>
                    
                    <div class="info-item" *ngIf="schedule.nextServiceDueDate">
                      <mat-icon>event</mat-icon>
                      <span>Due: {{ schedule.nextServiceDueDate | date: 'MMM d, yyyy' }}</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.nextServiceDueMileage">
                      <mat-icon>speed</mat-icon>
                      <span>Due at: {{ schedule.nextServiceDueMileage | number }} miles</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.mileageUntilDue !== undefined && schedule.mileageUntilDue < 0">
                      <mat-icon>warning</mat-icon>
                      <span class="overdue-text">{{ Math.abs(schedule.mileageUntilDue) | number }} miles overdue</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.daysUntilDue !== undefined && schedule.daysUntilDue < 0">
                      <mat-icon>warning</mat-icon>
                      <span class="overdue-text">{{ Math.abs(schedule.daysUntilDue) }} days overdue</span>
                    </div>
                  </div>

                  <div class="schedule-actions">
                    <button mat-button color="primary" (click)="createWorkOrder(schedule)">
                      <mat-icon>add</mat-icon>
                      Create Work Order
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngIf="overdueSchedules.length === 0" class="no-results">
              <mat-icon>check_circle</mat-icon>
              <p>No overdue schedules</p>
            </div>
          </div>
        </mat-tab>

        <!-- Due Soon Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">notifications</mat-icon>
            Due Soon ({{ dueSoonSchedules.length }})
          </ng-template>
          <div class="tab-content">
            <div class="schedules-grid">
              <mat-card *ngFor="let schedule of dueSoonSchedules" class="schedule-card due-soon">
                <mat-card-header>
                  <div class="schedule-header">
                    <h3>{{ schedule.scheduleName }}</h3>
                    <mat-chip class="status-chip due-soon">DUE SOON</mat-chip>
                  </div>
                </mat-card-header>
                <mat-card-content>
                  <div class="schedule-info">
                    <div class="info-item">
                      <mat-icon>category</mat-icon>
                      <span>{{ getMaintenanceScheduleTypeName(schedule.scheduleType) }}</span>
                    </div>
                    
                    <div class="info-item" *ngIf="schedule.nextServiceDueDate">
                      <mat-icon>event</mat-icon>
                      <span>Due: {{ schedule.nextServiceDueDate | date: 'MMM d, yyyy' }}</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.daysUntilDue !== undefined">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ schedule.daysUntilDue }} days until due</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.mileageUntilDue !== undefined">
                      <mat-icon>speed</mat-icon>
                      <span>{{ schedule.mileageUntilDue | number }} miles until due</span>
                    </div>
                  </div>

                  <div class="schedule-actions">
                    <button mat-button color="primary" (click)="createWorkOrder(schedule)">
                      <mat-icon>add</mat-icon>
                      Create Work Order
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngIf="dueSoonSchedules.length === 0" class="no-results">
              <mat-icon>check_circle</mat-icon>
              <p>No schedules due soon</p>
            </div>
          </div>
        </mat-tab>

        <!-- All Schedules Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">list</mat-icon>
            All Schedules
          </ng-template>
          <div class="tab-content">
            <div class="schedules-grid">
              <mat-card *ngFor="let schedule of allSchedules" class="schedule-card">
                <mat-card-header>
                  <div class="schedule-header">
                    <h3>{{ schedule.scheduleName }}</h3>
                    <mat-chip [class]="'status-chip ' + getStatusClass(schedule)">
                      {{ getStatusText(schedule) }}
                    </mat-chip>
                  </div>
                </mat-card-header>
                <mat-card-content>
                  <div class="schedule-info">
                    <div class="info-item">
                      <mat-icon>category</mat-icon>
                      <span>{{ getMaintenanceScheduleTypeName(schedule.scheduleType) }}</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.description">
                      <mat-icon>description</mat-icon>
                      <span>{{ schedule.description }}</span>
                    </div>
                    
                    <div class="info-item" *ngIf="schedule.mileageInterval">
                      <mat-icon>speed</mat-icon>
                      <span>Every {{ schedule.mileageInterval | number }} miles</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.daysInterval">
                      <mat-icon>event</mat-icon>
                      <span>Every {{ schedule.daysInterval }} days</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.engineHoursInterval">
                      <mat-icon>engineering</mat-icon>
                      <span>Every {{ schedule.engineHoursInterval }} engine hours</span>
                    </div>

                    <div class="info-item" *ngIf="schedule.lastServiceDate">
                      <mat-icon>history</mat-icon>
                      <span>Last service: {{ schedule.lastServiceDate | date: 'MMM d, yyyy' }}</span>
                    </div>
                  </div>

                  <div class="schedule-actions">
                    <button mat-button (click)="openScheduleForm(schedule)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-button color="warn" (click)="deleteSchedule(schedule)">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngIf="allSchedules.length === 0" class="no-results">
              <mat-icon>event_note</mat-icon>
              <p>No maintenance schedules found</p>
              <button mat-raised-button color="primary" (click)="openScheduleForm()">
                Create Your First Schedule
              </button>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .schedules-container {
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

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: var(--ts-spacing-lg);
    }

    .alerts-section {
      margin-top: var(--ts-spacing-md);
    }

    .alert {
      display: flex;
      align-items: center;
      gap: var(--ts-spacing-md);
      padding: var(--ts-spacing-md) var(--ts-spacing-lg);
      border-radius: 10px;
      margin-bottom: 8px;
      font-weight: 600;
      border: 1px solid;
    }

    .alert-danger {
      background-color: rgba(215, 25, 32, 0.1);
      color: var(--ts-red);
      border-color: var(--ts-red);
    }

    .alert-warning {
      background-color: rgba(245, 163, 0, 0.1);
      color: var(--ts-amber);
      border-color: var(--ts-amber);
    }

    :root.dark-mode .alert-danger {
      background-color: rgba(255, 68, 68, 0.15);
      color: #ff6b6b;
    }

    :root.dark-mode .alert-warning {
      background-color: rgba(255, 184, 77, 0.15);
      color: #ffb84d;
    }

    .alert mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .schedules-tabs {
      margin-top: var(--ts-spacing-lg);
    }

    .tab-icon {
      margin-right: 8px;
    }

    .tab-content {
      padding: var(--ts-spacing-lg) 0;
    }

    .schedules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--ts-spacing-lg);
    }

    .schedule-card {
      background: var(--ts-surface-secondary);
      border: 1px solid var(--ts-border);
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .schedule-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .schedule-card.overdue {
      border-left: 4px solid var(--ts-red);
    }

    .schedule-card.due-soon {
      border-left: 4px solid var(--ts-amber);
    }

    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      gap: 12px;
    }

    .schedule-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      flex: 1;
      color: var(--ts-ink);
    }

    .status-chip {
      font-size: 11px;
      height: 24px;
      padding: 0 8px;
      flex-shrink: 0;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .status-chip.overdue {
      background-color: var(--ts-red);
      color: white;
    }

    .status-chip.due-soon {
      background-color: var(--ts-amber);
      color: white;
    }

    .status-chip.ok {
      background-color: var(--ts-green);
      color: white;
    }

    .status-chip.inactive {
      background-color: var(--ts-stone);
      color: white;
    }

    .schedule-info {
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

    .overdue-text {
      color: var(--ts-red);
      font-weight: 700;
    }

    :root.dark-mode .overdue-text {
      color: #ff6b6b;
    }

    .schedule-actions {
      margin-top: var(--ts-spacing-md);
      display: flex;
      gap: 8px;
      justify-content: flex-end;
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

    .no-results button {
      margin-top: var(--ts-spacing-md);
    }
  `]
})
export class SchedulesListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  overdueSchedules: MaintenanceScheduleResponse[] = [];
  dueSoonSchedules: MaintenanceScheduleResponse[] = [];
  allSchedules: MaintenanceScheduleResponse[] = [];

  Math = Math;

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.maintenanceService.getOverdueSchedules().subscribe({
      next: (schedules) => {
        this.overdueSchedules = schedules;
      },
      error: (error) => {
        console.error('Error loading overdue schedules:', error);
      }
    });

    this.maintenanceService.getSchedulesDueSoon(14).subscribe({
      next: (schedules) => {
        this.dueSoonSchedules = schedules.filter(s => !s.isOverdue);
      },
      error: (error) => {
        console.error('Error loading due soon schedules:', error);
      }
    });

    // For all schedules, we'd need a new endpoint or combine tractor/trailer schedules
    // For now, just combine the overdue and due soon
    this.allSchedules = [...this.overdueSchedules, ...this.dueSoonSchedules];
  }

  openScheduleForm(schedule?: MaintenanceScheduleResponse): void {
    const dialogRef = this.dialog.open(ScheduleFormComponent, {
      width: '600px',
      data: schedule
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSchedules();
      }
    });
  }

  createWorkOrder(schedule: MaintenanceScheduleResponse): void {
    // This would navigate to or open the work order creation form
    this.snackBar.open('Work order creation coming soon', 'Close', { duration: 3000 });
  }

  deleteSchedule(schedule: MaintenanceScheduleResponse): void {
    if (confirm(`Delete schedule "${schedule.scheduleName}"?`)) {
      this.maintenanceService.deleteSchedule(schedule.id).subscribe({
        next: () => {
          this.snackBar.open('Schedule deleted successfully', 'Close', { duration: 3000 });
          this.loadSchedules();
        },
        error: (error) => {
          console.error('Error deleting schedule:', error);
          this.snackBar.open('Failed to delete schedule', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getMaintenanceScheduleTypeName = getMaintenanceScheduleTypeName;

  getStatusClass(schedule: MaintenanceScheduleResponse): string {
    if (schedule.isOverdue) return 'overdue';
    if (schedule.shouldNotify) return 'due-soon';
    if (!schedule.isActive) return 'inactive';
    return 'ok';
  }

  getStatusText(schedule: MaintenanceScheduleResponse): string {
    if (schedule.isOverdue) return 'OVERDUE';
    if (schedule.shouldNotify) return 'DUE SOON';
    if (!schedule.isActive) return 'INACTIVE';
    return 'OK';
  }
}
