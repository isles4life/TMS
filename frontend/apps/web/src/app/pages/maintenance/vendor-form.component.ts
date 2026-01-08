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
import { VendorResponse, VendorType, CreateVendorRequest } from '../../models/maintenance.model';

@Component({
  selector: 'app-vendor-form',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Vendor' : 'Add New Vendor' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="vendorForm" class="vendor-form">
        <!-- Basic Information -->
        <h3>Basic Information</h3>
        
        <mat-form-field appearance="outline">
          <mat-label>Vendor Name *</mat-label>
          <input matInput formControlName="vendorName" placeholder="Enter vendor name">
          <mat-error *ngIf="vendorForm.get('vendorName')?.hasError('required')">Vendor name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Vendor Type *</mat-label>
          <mat-select formControlName="vendorType">
            <mat-option [value]="0">Maintenance Shop</mat-option>
            <mat-option [value]="1">Tire Shop</mat-option>
            <mat-option [value]="2">Dealer</mat-option>
            <mat-option [value]="3">Mobile Service</mat-option>
            <mat-option [value]="4">Body Shop</mat-option>
            <mat-option [value]="5">Glass Shop</mat-option>
            <mat-option [value]="6">Upholstery</mat-option>
            <mat-option [value]="7">Towing</mat-option>
            <mat-option [value]="8">Wash & Detail</mat-option>
            <mat-option [value]="9">Other</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Contact Information -->
        <h3>Contact Information</h3>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Contact Name</mat-label>
            <input matInput formControlName="contactName">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="(555) 123-4567">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Website</mat-label>
            <input matInput formControlName="website" placeholder="https://example.com">
          </mat-form-field>
        </div>

        <!-- Address -->
        <h3>Address</h3>

        <mat-form-field appearance="outline">
          <mat-label>Street Address</mat-label>
          <input matInput formControlName="addressLine1">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Address Line 2</mat-label>
          <input matInput formControlName="addressLine2">
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input matInput formControlName="city">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>State</mat-label>
            <input matInput formControlName="state" maxlength="2" placeholder="TX">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>ZIP Code</mat-label>
            <input matInput formControlName="zipCode" maxlength="10">
          </mat-form-field>
        </div>

        <!-- Business Details -->
        <h3>Business Details</h3>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Tax ID</mat-label>
            <input matInput formControlName="taxId">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>License Number</mat-label>
            <input matInput formControlName="licenseNumber">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" *ngIf="vendorForm.get('licenseNumber')?.value">
          <mat-label>License Expiration Date</mat-label>
          <input matInput [matDatepicker]="licensePicker" formControlName="licenseExpirationDate">
          <mat-datepicker-toggle matSuffix [for]="licensePicker"></mat-datepicker-toggle>
          <mat-datepicker #licensePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Service Capabilities</mat-label>
          <textarea matInput formControlName="serviceCapabilities" rows="2" 
                    placeholder="List available services"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Specialty Areas</mat-label>
          <input matInput formControlName="specialtyAreas" placeholder="e.g., Diesel engines, refrigeration">
        </mat-form-field>

        <!-- Insurance -->
        <h3>Insurance</h3>

        <mat-checkbox formControlName="hasInsurance">Vendor has insurance</mat-checkbox>

        <div *ngIf="vendorForm.get('hasInsurance')?.value" class="insurance-fields">
          <mat-form-field appearance="outline">
            <mat-label>Insurance Coverage Amount</mat-label>
            <input matInput formControlName="insuranceCoverageAmount" type="number" placeholder="0">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Insurance Expiration Date</mat-label>
            <input matInput [matDatepicker]="insurancePicker" formControlName="insuranceExpirationDate">
            <mat-datepicker-toggle matSuffix [for]="insurancePicker"></mat-datepicker-toggle>
            <mat-datepicker #insurancePicker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Payment Terms -->
        <h3>Payment Terms</h3>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Payment Terms (Days)</mat-label>
            <input matInput formControlName="paymentTermsDays" type="number" placeholder="30">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Payment Method</mat-label>
            <mat-select formControlName="paymentMethod">
              <mat-option value="Check">Check</mat-option>
              <mat-option value="ACH">ACH</mat-option>
              <mat-option value="Credit Card">Credit Card</mat-option>
              <mat-option value="Wire Transfer">Wire Transfer</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Notes -->
        <mat-form-field appearance="outline">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="isPreferred">Mark as preferred vendor</mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!vendorForm.valid || saving">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .vendor-form {
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

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--ts-spacing-md);
    }

    mat-form-field {
      width: 100%;
    }

    .insurance-fields {
      margin-left: 32px;
      margin-top: var(--ts-spacing-md);
      display: flex;
      flex-direction: column;
      gap: var(--ts-spacing-md);
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
export class VendorFormComponent {
  private fb = inject(FormBuilder);
  private maintenanceService = inject(MaintenanceService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<VendorFormComponent>);

  vendorForm: FormGroup;
  isEdit = false;
  saving = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: VendorResponse | null) {
    this.isEdit = !!data;
    this.vendorForm = this.fb.group({
      vendorName: [data?.vendorName || '', Validators.required],
      vendorType: [data?.vendorType ?? 0, Validators.required],
      contactName: [data?.contactName || ''],
      email: [data?.email || '', Validators.email],
      phone: [data?.phone || ''],
      website: [data?.website || ''],
      addressLine1: [data?.addressLine1 || ''],
      addressLine2: [data?.addressLine2 || ''],
      city: [data?.city || ''],
      state: [data?.state || ''],
      zipCode: [data?.zipCode || ''],
      taxId: [data?.taxId || ''],
      licenseNumber: [data?.licenseNumber || ''],
      licenseExpirationDate: [data?.licenseExpirationDate || null],
      serviceCapabilities: [data?.serviceCapabilities || ''],
      specialtyAreas: [data?.specialtyAreas || ''],
      paymentTermsDays: [data?.paymentTermsDays || 30],
      paymentMethod: [data?.paymentMethod || 'Check'],
      hasInsurance: [data?.hasInsurance || false],
      insuranceCoverageAmount: [data?.insuranceCoverageAmount || null],
      insuranceExpirationDate: [data?.insuranceExpirationDate || null],
      notes: [data?.notes || ''],
      isPreferred: [data?.isPreferred || false]
    });
  }

  onSave(): void {
    if (this.vendorForm.valid) {
      this.saving = true;
      const formValue = this.vendorForm.value;
      
      const request: CreateVendorRequest = {
        vendorName: formValue.vendorName,
        vendorType: formValue.vendorType,
        vendorCode: formValue.vendorCode,
        contactName: formValue.contactName,
        email: formValue.email,
        phone: formValue.phone,
        website: formValue.website,
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode,
        country: 'USA',
        taxId: formValue.taxId,
        licenseNumber: formValue.licenseNumber,
        licenseExpirationDate: formValue.licenseExpirationDate,
        serviceCapabilities: formValue.serviceCapabilities,
        specialtyAreas: formValue.specialtyAreas,
        paymentTermsDays: formValue.paymentTermsDays,
        paymentMethod: formValue.paymentMethod,
        hasInsurance: formValue.hasInsurance,
        insuranceCoverageAmount: formValue.insuranceCoverageAmount,
        insuranceExpirationDate: formValue.insuranceExpirationDate,
        isPreferred: formValue.isPreferred,
        notes: formValue.notes
      };

      this.maintenanceService.createVendor(request).subscribe({
        next: () => {
          this.snackBar.open('Vendor saved successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving vendor:', error);
          this.snackBar.open('Failed to save vendor', 'Close', { duration: 3000 });
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
