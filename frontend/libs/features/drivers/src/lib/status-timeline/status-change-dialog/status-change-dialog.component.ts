import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadStatusService } from '../../../../../../core/src/lib/services/load-status.service';
import { LoadStatus, ChangeLoadStatusRequest } from '../../../../../../core/src/lib/models/load-status.model';
import { LoadStatusTransitions } from '../../../../../../core/src/lib/models/load-status.model';

@Component({
  selector: 'tms-status-change-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>swap_horiz</mat-icon>
      Change Load Status
    </h2>
    
    <mat-dialog-content>
      @if (loadingTransitions()) {
        <div class="loading-transitions">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading valid status transitions...</p>
        </div>
      } @else {
        <form [formGroup]="form" class="status-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Status</mat-label>
              <mat-select formControlName="newStatus">
                @for (status of validStatuses(); track status) {
                  <mat-option [value]="status">
                    <div class="status-option">
                      <mat-icon>{{ getStatusIcon(status) }}</mat-icon>
                      <span>{{ getStatusLabel(status) }}</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>flag</mat-icon>
              @if (validStatuses().length === 0) {
                <mat-hint>No valid transitions available from current status</mat-hint>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reason (optional)</mat-label>
              <textarea matInput formControlName="reason" rows="4" 
                        placeholder="Enter reason for status change..."></textarea>
              <mat-icon matPrefix>comment</mat-icon>
              <mat-hint>{{ form.get('reason')?.value?.length || 0 }} characters</mat-hint>
            </mat-form-field>
          </div>

          <div class="form-row two-col">
            <mat-form-field appearance="outline">
              <mat-label>Latitude</mat-label>
              <input matInput type="number" formControlName="latitude" step="0.000001">
              <mat-icon matPrefix>gps_fixed</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Longitude</mat-label>
              <input matInput type="number" formControlName="longitude" step="0.000001">
              <mat-icon matPrefix>gps_fixed</mat-icon>
            </mat-form-field>
          </div>

          <div class="form-row">
            <button mat-stroked-button type="button" (click)="getCurrentLocation()">
              <mat-icon>my_location</mat-icon>
              Use Current Location
            </button>
          </div>
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!form.valid || submitting() || loadingTransitions() || validStatuses().length === 0"
              (click)="submit()">
        @if (submitting()) {
          <mat-spinner diameter="20"></mat-spinner>
          Updating...
        } @else {
          <mat-icon>check</mat-icon>
          Update Status
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      mat-icon {
        color: var(--primary-color);
      }
    }

    .loading-transitions {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .status-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
      min-width: 450px;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      
      &.two-col {
        mat-form-field {
          flex: 1;
        }
      }
      
      button[mat-stroked-button] {
        align-self: flex-start;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-icon[matPrefix] {
      margin-right: 0.5rem;
      color: var(--text-secondary);
    }

    .status-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--primary-color);
      }
    }

    mat-dialog-actions {
      padding: 1rem;
      gap: 0.5rem;
      
      mat-spinner {
        margin-right: 0.5rem;
      }
    }
  `]
})
export class StatusChangeDialogComponent implements OnInit {
  form: FormGroup;
  submitting = signal(false);
  loadingTransitions = signal(true);
  validStatuses = signal<string[]>([]);

  constructor(
    private fb: FormBuilder,
    private statusService: LoadStatusService,
    private dialogRef: MatDialogRef<StatusChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { loadId: string }
  ) {
    this.form = this.fb.group({
      newStatus: ['', Validators.required],
      reason: [''],
      latitude: [null],
      longitude: [null]
    });
  }

  ngOnInit() {
    this.loadValidTransitions();
  }

  loadValidTransitions() {
    this.loadingTransitions.set(true);
    this.statusService.getValidTransitions(this.data.loadId).subscribe({
      next: (transitions: LoadStatusTransitions) => {
        this.validStatuses.set(transitions.validNextStatuses);
        this.loadingTransitions.set(false);
      },
      error: (error: any) => {
        console.error('Error loading valid transitions:', error);
        this.loadingTransitions.set(false);
      }
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.form.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }

  submit() {
    if (this.form.valid) {
      this.submitting.set(true);
      
      const request: ChangeLoadStatusRequest = {
        newStatus: this.form.value.newStatus,
        reason: this.form.value.reason || undefined,
        latitude: this.form.value.latitude || undefined,
        longitude: this.form.value.longitude || undefined,
        isAutomatic: false
      };
      
      this.statusService.changeLoadStatus(this.data.loadId, request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error changing status:', error);
          this.submitting.set(false);
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Draft: 'edit',
      Pending: 'schedule',
      Available: 'playlist_add',
      Booked: 'check_circle',
      Confirmed: 'verified',
      Dispatched: 'send',
      Assigned: 'assignment',
      EnRoute: 'local_shipping',
      AtPickup: 'location_on',
      Loading: 'upload',
      Loaded: 'inventory',
      AtDelivery: 'place',
      Unloading: 'download',
      Delivered: 'done_all',
      Completed: 'task_alt',
      Invoiced: 'receipt',
      Paid: 'payments',
      Delayed: 'schedule',
      OnHold: 'pause',
      Cancelled: 'cancel',
      Problem: 'error'
    };
    
    return icons[status] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      EnRoute: 'En Route',
      AtPickup: 'At Pickup',
      AtDelivery: 'At Delivery',
      OnHold: 'On Hold'
    };
    
    return labels[status] || status;
  }
}
