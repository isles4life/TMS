import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaintenanceService } from '../../services/maintenance.service';
import { MaintenanceScheduleResponse, MaintenanceScheduleType, CreateMaintenanceScheduleRequest } from '../../models/maintenance.model';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Schedule' : 'Create PM Schedule' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="scheduleForm" class="schedule-form">
        <!-- Equipment Selection -->
        <h3>Equipment</h3>

        <mat-form-field appearance="outline">
          <mat-label>Equipment Type *</mat-label>
          <mat-select formControlName="equipmentType" (selectionChange)="onEquipmentTypeChange()">
            <mat-option value="tractor">Tractor</mat-option>
            <mat-option value="trailer">Trailer</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ scheduleForm.get('equipmentType')?.value === 'tractor' ? 'Tractor ID' : 'Trailer ID' }} *</mat-label>
          <input matInput formControlName="equipmentId" placeholder="Enter equipment ID">
          <mat-error *ngIf="scheduleForm.get('equipmentId')?.hasError('required')">Equipment ID is required</mat-error>
        </mat-form-field>

        <!-- Schedule Details -->
        <h3>Schedule Details</h3>

        <mat-form-field appearance="outline">
          <mat-label>Schedule Name *</mat-label>
          <input matInput formControlName="scheduleName" placeholder="e.g., Oil Change">
          <mat-error *ngIf="scheduleForm.get('scheduleName')?.hasError('required')">Schedule name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Schedule Type *</mat-label>
          <mat-select formControlName="scheduleType" (selectionChange)="onScheduleTypeChange()">
            <mat-option [value]="0">Mileage Based</mat-option>
            <mat-option [value]="1">Time Based</mat-option>
            <mat-option [value]="2">Engine Hours Based</mat-option>
            <mat-option [value]="3">Event Based</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Interval Fields (conditional based on schedule type) -->
        <mat-form-field appearance="outline" *ngIf="scheduleForm.get('scheduleType')?.value === 0">
          <mat-label>Mileage Interval *</mat-label>
          <input matInput formControlName="mileageInterval" type="number" placeholder="10000">
          <span matSuffix>miles</span>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="scheduleForm.get('scheduleType')?.value === 1">
          <mat-label>Days Interval *</mat-label>
          <input matInput formControlName="daysInterval" type="number" placeholder="90">
          <span matSuffix>days</span>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="scheduleForm.get('scheduleType')?.value === 2">
          <mat-label>Engine Hours Interval *</mat-label>
          <input matInput formControlName="engineHoursInterval" type="number" placeholder="500">
          <span matSuffix>hours</span>
        </mat-form-field>

        <!-- Last Service Information -->
        <h3>Last Service Information</h3>

        <mat-form-field appearance="outline">
          <mat-label>Last Service Date</mat-label>
          <input matInput [matDatepicker]="servicePicker" formControlName="lastServiceDate">
          <mat-datepicker-toggle matSuffix [for]="servicePicker"></mat-datepicker-toggle>
          <mat-datepicker #servicePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="scheduleForm.get('scheduleType')?.value === 0">
          <mat-label>Last Service Mileage</mat-label>
          <input matInput formControlName="lastServiceMileage" type="number">
          <span matSuffix>miles</span>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="scheduleForm.get('scheduleType')?.value === 2">
          <mat-label>Last Service Engine Hours</mat-label>
          <input matInput formControlName="lastServiceEngineHours" type="number">
          <span matSuffix>hours</span>
        </mat-form-field>

        <!-- Current Status -->
        <h3>Current Status</h3>

        <mat-form-field appearance="outline" *ngIf="scheduleForm.get('scheduleType')?.value === 0">
          <mat-label>Current Mileage</mat-label>
          <input matInput formControlName="currentMileage" type="number">
          <span matSuffix>miles</span>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="scheduleForm.get('scheduleType')?.value === 2">
          <mat-label>Current Engine Hours</mat-label>
          <input matInput formControlName="currentEngineHours" type="number">
          <span matSuffix>hours</span>
        </mat-form-field>

        <!-- Notification Settings -->
        <h3>Notification Settings</h3>

        <mat-form-field appearance="outline">
          <mat-label>Notify Days Before Due</mat-label>
          <input matInput formControlName="notificationDaysBefore" type="number" placeholder="7">
          <span matSuffix>days</span>
        </mat-form-field>

        <mat-checkbox formControlName="isActive">Schedule is active</mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!scheduleForm.valid || saving">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .schedule-form {
      display: flex;
      flex-direction: column;
      gap: var(--ts-spacing-md);
      min-width: 500px;
    }

    h3 {
      margin: var(--ts-spacing-md) 0 8px 0;
      font-size: 15px;
      font-weight: 700;
      color: var(--ts-ink);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid var(--ts-red);
      padding-bottom: 4px;
    }

    mat-form-field {
      width: 100%;
    }

    mat-checkbox {
      margin: 8px 0;
      font-weight: 600;
    }

    mat-dialog-actions {
      padding: var(--ts-spacing-md) var(--ts-spacing-lg);
      background: var(--ts-surface);
      border-top: 1px solid var(--ts-border);
      margin: 0 calc(-1 * var(--ts-spacing-lg));
    }
  `]
})
export class ScheduleFormComponent {
  private fb = inject(FormBuilder);
  private maintenanceService = inject(MaintenanceService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ScheduleFormComponent>);

  scheduleForm: FormGroup;
  isEdit = false;
  saving = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MaintenanceScheduleResponse | null) {
    this.isEdit = !!data;
    this.scheduleForm = this.fb.group({
      equipmentType: [data?.tractorId ? 'tractor' : 'trailer', Validators.required],
      equipmentId: [data?.tractorId || data?.trailerId || '', Validators.required],
      scheduleName: [data?.scheduleName || '', Validators.required],
      description: [data?.description || ''],
      scheduleType: [data?.scheduleType ?? 0, Validators.required],
      mileageInterval: [data?.mileageInterval || null],
      daysInterval: [data?.daysInterval || null],
      engineHoursInterval: [data?.engineHoursInterval || null],
      lastServiceDate: [data?.lastServiceDate || null],
      lastServiceMileage: [data?.lastServiceMileage || null],
      lastServiceEngineHours: [data?.lastServiceEngineHours || null],
      currentMileage: [data?.currentMileage || null],
      currentEngineHours: [data?.currentEngineHours || null],
      notificationDaysBefore: [data?.notificationDaysBefore || 7],
      isActive: [data?.isActive ?? true]
    });
  }

  onEquipmentTypeChange(): void {
    this.scheduleForm.get('equipmentId')?.setValue('');
  }

  onScheduleTypeChange(): void {
    // Clear intervals when type changes
    this.scheduleForm.patchValue({
      mileageInterval: null,
      daysInterval: null,
      engineHoursInterval: null
    });
  }

  onSave(): void {
    if (this.scheduleForm.valid) {
      this.saving = true;
      const formValue = this.scheduleForm.value;
      
      const request: CreateMaintenanceScheduleRequest = {
        tractorId: formValue.equipmentType === 'tractor' ? formValue.equipmentId : undefined,
        trailerId: formValue.equipmentType === 'trailer' ? formValue.equipmentId : undefined,
        scheduleName: formValue.scheduleName,
        description: formValue.description,
        scheduleType: formValue.scheduleType,
        mileageInterval: formValue.mileageInterval,
        daysInterval: formValue.daysInterval,
        engineHoursInterval: formValue.engineHoursInterval,
        lastServiceDate: formValue.lastServiceDate,
        lastServiceMileage: formValue.lastServiceMileage,
        lastServiceEngineHours: formValue.lastServiceEngineHours,
        currentMileage: formValue.currentMileage,
        currentEngineHours: formValue.currentEngineHours,
        notificationDaysBefore: formValue.notificationDaysBefore,
        isActive: formValue.isActive
      };

      this.maintenanceService.createSchedule(request).subscribe({
        next: () => {
          this.snackBar.open('Schedule saved successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving schedule:', error);
          this.snackBar.open('Failed to save schedule: ' + (error.error?.errors?.[0] || 'Unknown error'), 'Close', { duration: 5000 });
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
