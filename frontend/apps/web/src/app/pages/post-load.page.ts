import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../components/page-header.component';

@Component({
  selector: 'app-post-load-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    PageHeaderComponent,
  ],
  template: `
    <div class="page">
      <app-ts-page-header
        eyebrow="Marketplace"
        title="Post a Load"
        description="Create a new load and set all details. Quick pay enabled loads get priority visibility."
        [hasActions]="false">
      </app-ts-page-header>

      <mat-card class="panel">
        <form [formGroup]="loadForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Route Section -->
            <div class="form-section">
              <h3>Route</h3>
              <div class="field-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Origin City</mat-label>
                  <input matInput placeholder="e.g. Boise, ID" formControlName="origin" required />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Destination City</mat-label>
                  <input matInput placeholder="e.g. Denver, CO" formControlName="destination" required />
                </mat-form-field>
              </div>
            </div>

            <!-- Load Details Section -->
            <div class="form-section">
              <h3>Load Details</h3>
              <div class="field-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Equipment Type</mat-label>
                  <mat-select formControlName="equipment" required>
                    <mat-option value="Van">Van</mat-option>
                    <mat-option value="Flatbed">Flatbed</mat-option>
                    <mat-option value="Reefer">Reefer</mat-option>
                    <mat-option value="Tanker">Tanker</mat-option>
                    <mat-option value="Specialized">Specialized</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Rate ($/mile)</mat-label>
                  <input matInput type="number" placeholder="e.g. 2.35" formControlName="rate" required step="0.01" min="0" />
                </mat-form-field>
              </div>
            </div>

            <!-- Pickup & Delivery Section -->
            <div class="form-section">
              <h3>Pickup & Delivery</h3>
              <div class="field-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Pickup Date</mat-label>
                  <input matInput [matDatepicker]="pickupPicker" formControlName="pickupDate" required />
                  <mat-datepicker-toggle matIconSuffix [for]="pickupPicker"></mat-datepicker-toggle>
                  <mat-datepicker #pickupPicker></mat-datepicker>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Pickup Time</mat-label>
                  <input matInput type="time" formControlName="pickupTime" required />
                </mat-form-field>
              </div>
              <div class="field-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Delivery Window</mat-label>
                  <mat-select formControlName="deliveryWindow" required>
                    <mat-option value="24h">24 Hour</mat-option>
                    <mat-option value="48h">48 Hour</mat-option>
                    <mat-option value="72h">72 Hour</mat-option>
                    <mat-option value="flexible">Flexible</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Load Attributes Section -->
            <div class="form-section">
              <h3>Load Attributes</h3>
              <div class="field-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Load Type</mat-label>
                  <mat-select formControlName="loadType" required>
                    <mat-option value="Live Load">Live Load</mat-option>
                    <mat-option value="Drop & Hook">Drop & Hook</mat-option>
                    <mat-option value="Lumper Required">Lumper Required</mat-option>
                    <mat-option value="Appointment">Appointment</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status" required>
                    <mat-option value="Available">Available</mat-option>
                    <mat-option value="Pending">Pending</mat-option>
                    <mat-option value="Booked">Booked</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Additional Info Section -->
            <div class="form-section">
              <h3>Additional Information</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Special Instructions / Notes</mat-label>
                <textarea
                  matInput
                  formControlName="notes"
                  placeholder="e.g. No tarps, call 30 mins before arrival, safety vest required"
                  rows="4"
                ></textarea>
              </mat-form-field>
              <div class="field-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tags (comma-separated)</mat-label>
                  <input matInput placeholder="e.g. No tarp, Appointment, Quick pay" formControlName="tagsInput" />
                </mat-form-field>
              </div>
            </div>

            <!-- Quick Pay Section -->
            <div class="form-section">
              <h3>Payment Options</h3>
              <div class="field-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Quick Pay Available</mat-label>
                  <mat-select formControlName="quickPay">
                    <mat-option value="yes">Yes - Increases visibility</mat-option>
                    <mat-option value="no">No - Standard posting</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="onCancel()">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="!loadForm.valid">Post Load</button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .panel {
      padding: var(--ts-spacing-lg);
      border: 1px solid var(--ts-border);
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      background: #fff;
    }
    .form-grid {
      display: grid;
      gap: var(--ts-spacing-lg);
    }
    .form-section {
      display: grid;
      gap: var(--ts-spacing-md);
    }
    .form-section h3 {
      margin: 0;
      padding: var(--ts-spacing-md) 0 0 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--ts-ink);
      border-top: 1px solid var(--ts-border);
    }
    .form-section:first-child h3 {
      border: none;
      padding: 0;
      margin-top: 0;
    }
    .field-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--ts-spacing-md);
    }
    .full-width {
      width: 100%;
    }
    mat-form-field {
      width: 100%;
    }
    textarea {
      font-family: inherit;
    }
    .form-actions {
      display: flex;
      gap: var(--ts-spacing-md);
      justify-content: flex-end;
      margin-top: var(--ts-spacing-lg);
      padding-top: var(--ts-spacing-lg);
      border-top: 1px solid var(--ts-border);
    }
    @media (max-width: 640px) {
      .field-row {
        grid-template-columns: 1fr;
      }
      .form-actions {
        flex-direction: column-reverse;
      }
      button {
        width: 100%;
      }
    }
  `],
})
export class PostLoadPage implements OnInit {
  loadForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.loadForm = this.fb.group({
      origin: ['', [Validators.required, Validators.minLength(3)]],
      destination: ['', [Validators.required, Validators.minLength(3)]],
      equipment: ['Van', Validators.required],
      rate: ['', [Validators.required, Validators.min(0)]],
      pickupDate: ['', Validators.required],
      pickupTime: ['', Validators.required],
      deliveryWindow: ['24h', Validators.required],
      loadType: ['Live Load', Validators.required],
      status: ['Available', Validators.required],
      notes: [''],
      tagsInput: [''],
      quickPay: ['yes'],
    });
  }

  onSubmit(): void {
    if (this.loadForm.valid) {
      const formData = this.loadForm.value;
      const tags = formData.tagsInput
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      const newLoad = {
        origin: formData.origin,
        destination: formData.destination,
        equipment: formData.equipment,
        rate: `$${formData.rate} / mile`,
        pickup: `${formData.pickupDate} ${formData.pickupTime}`,
        status: formData.status,
        notes: formData.notes,
        tags,
        deliveryWindow: formData.deliveryWindow,
        loadType: formData.loadType,
        quickPay: formData.quickPay === 'yes',
      };

      console.log('New load posted:', newLoad);
      alert(`Load posted successfully!\n\n${newLoad.origin} → ${newLoad.destination}\nRate: ${newLoad.rate}`);
      this.router.navigate(['/load-board']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/load-board']);
  }
}
