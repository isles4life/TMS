import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaintenanceService } from '../../services/maintenance.service';
import { 
  MaintenanceRecordResponse, 
  MaintenanceRecordType,
  CreateMaintenanceRecordRequest,
  VendorResponse
} from '../../models/maintenance.model';

@Component({
  selector: 'app-work-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Work Order' : 'Create Work Order' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="workOrderForm" class="work-order-form">
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
          <mat-label>{{ workOrderForm.get('equipmentType')?.value === 'tractor' ? 'Tractor ID' : 'Trailer ID' }} *</mat-label>
          <input matInput formControlName="equipmentId" placeholder="Enter equipment ID">
          <mat-error *ngIf="workOrderForm.get('equipmentId')?.hasError('required')">Equipment ID is required</mat-error>
        </mat-form-field>

        <!-- Work Order Details -->
        <h3>Work Order Details</h3>

        <mat-form-field appearance="outline">
          <mat-label>Record Type *</mat-label>
          <mat-select formControlName="recordType">
            <mat-option [value]="0">Preventative Maintenance</mat-option>
            <mat-option [value]="1">Repair</mat-option>
            <mat-option [value]="2">Inspection</mat-option>
            <mat-option [value]="3">Recall</mat-option>
            <mat-option [value]="4">Warranty</mat-option>
            <mat-option [value]="5">Emergency</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description *</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Describe the work to be done"></textarea>
          <mat-error *ngIf="workOrderForm.get('description')?.hasError('required')">Description is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Service Date *</mat-label>
          <input matInput [matDatepicker]="servicePicker" formControlName="serviceDate">
          <mat-datepicker-toggle matSuffix [for]="servicePicker"></mat-datepicker-toggle>
          <mat-datepicker #servicePicker></mat-datepicker>
        </mat-form-field>

        <!-- Vendor Selection -->
        <h3>Vendor</h3>

        <mat-form-field appearance="outline">
          <mat-label>Vendor</mat-label>
          <mat-select formControlName="vendorId">
            <mat-option [value]="null">No vendor (in-house)</mat-option>
            <mat-option *ngFor="let vendor of vendors" [value]="vendor.id">
              {{ vendor.vendorName }} - {{ vendor.city }}, {{ vendor.state }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Service Information -->
        <h3>Service Information</h3>

        <mat-form-field appearance="outline">
          <mat-label>Mileage at Service</mat-label>
          <input matInput formControlName="mileageAtService" type="number" placeholder="0">
          <span matSuffix>miles</span>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Engine Hours at Service</mat-label>
          <input matInput formControlName="engineHoursAtService" type="number" placeholder="0">
          <span matSuffix>hours</span>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!workOrderForm.valid || saving">
        {{ saving ? 'Creating...' : 'Create Work Order' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .work-order-form {
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

    mat-dialog-actions {
      padding: var(--ts-spacing-md) var(--ts-spacing-lg);
      background: var(--ts-surface);
      border-top: 1px solid var(--ts-border);
      margin: 0 calc(-1 * var(--ts-spacing-lg));
    }
  `]
})
export class WorkOrderFormComponent {
  private fb = inject(FormBuilder);
  private maintenanceService = inject(MaintenanceService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<WorkOrderFormComponent>);

  workOrderForm: FormGroup;
  isEdit = false;
  saving = false;
  vendors: VendorResponse[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: MaintenanceRecordResponse | null) {
    this.isEdit = !!data;
    this.workOrderForm = this.fb.group({
      equipmentType: [data?.tractorId ? 'tractor' : 'trailer', Validators.required],
      equipmentId: [data?.tractorId || data?.trailerId || '', Validators.required],
      recordType: [data?.recordType ?? 0, Validators.required],
      description: [data?.description || '', Validators.required],
      serviceDate: [data?.serviceDate || new Date(), Validators.required],
      vendorId: [data?.vendorId || null],
      mileageAtService: [data?.mileageAtService || null],
      engineHoursAtService: [data?.engineHoursAtService || null]
    });

    this.loadVendors();
  }

  loadVendors(): void {
    this.maintenanceService.getActiveVendors().subscribe({
      next: (vendors) => {
        this.vendors = vendors;
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
      }
    });
  }

  onEquipmentTypeChange(): void {
    this.workOrderForm.get('equipmentId')?.setValue('');
  }

  onSave(): void {
    if (this.workOrderForm.valid) {
      this.saving = true;
      const formValue = this.workOrderForm.value;
      
      const request: CreateMaintenanceRecordRequest = {
        tractorId: formValue.equipmentType === 'tractor' ? formValue.equipmentId : undefined,
        trailerId: formValue.equipmentType === 'trailer' ? formValue.equipmentId : undefined,
        recordType: formValue.recordType,
        description: formValue.description,
        serviceDate: formValue.serviceDate,
        vendorId: formValue.vendorId,
        mileageAtService: formValue.mileageAtService,
        engineHoursAtService: formValue.engineHoursAtService
      };

      this.maintenanceService.createRecord(request).subscribe({
        next: (record) => {
          this.snackBar.open(`Work order ${record.workOrderNumber} created successfully`, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating work order:', error);
          this.snackBar.open('Failed to create work order: ' + (error.error?.errors?.[0] || 'Unknown error'), 'Close', { duration: 5000 });
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
