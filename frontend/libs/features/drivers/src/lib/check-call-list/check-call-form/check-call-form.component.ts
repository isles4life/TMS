import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CheckCallService } from '../../../../../../core/src/lib/services/check-call.service';
import { CreateCheckCallRequest } from '../../../../../../core/src/lib/models/check-call.model';

@Component({
  selector: 'tms-check-call-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>phone_in_talk</mat-icon>
      Record Check Call
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="check-call-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Current Location</mat-label>
            <input matInput formControlName="currentLocation" placeholder="City, State or Highway Exit">
            <mat-icon matPrefix>location_on</mat-icon>
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

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Estimated Arrival Time</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="estimatedArrivalTime">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-row two-col">
          <mat-form-field appearance="outline">
            <mat-label>Delay (minutes)</mat-label>
            <input matInput type="number" formControlName="delayMinutes" min="0">
            <mat-icon matPrefix>schedule</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Miles to Destination</mat-label>
            <input matInput type="number" formControlName="milesToDestination" min="0">
            <mat-icon matPrefix>straighten</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Delay Reason</mat-label>
            <input matInput formControlName="delayReason" placeholder="Traffic, weather, breakdown, etc.">
            <mat-icon matPrefix>info</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row two-col">
          <mat-form-field appearance="outline">
            <mat-label>Trailer Temperature (°F)</mat-label>
            <input matInput type="number" formControlName="trailerTemperature">
            <mat-icon matPrefix>thermostat</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fuel Level (%)</mat-label>
            <input matInput type="number" formControlName="fuelLevel" min="0" max="100">
            <mat-icon matPrefix>local_gas_station</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row checkboxes">
          <mat-checkbox formControlName="equipmentIssue">Equipment Issue</mat-checkbox>
          <mat-checkbox formControlName="safetyIssue">Safety Issue</mat-checkbox>
          <mat-checkbox formControlName="weatherDelay">Weather Delay</mat-checkbox>
          <mat-checkbox formControlName="trafficDelay">Traffic Delay</mat-checkbox>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="4" 
                      placeholder="Additional notes or details about this check call"></textarea>
            <mat-icon matPrefix>notes</mat-icon>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!form.valid || submitting()"
              (click)="submit()">
        @if (submitting()) {
          <ng-container>
            <mat-icon>sync</mat-icon>
            Saving...
          </ng-container>
        } @else {
          <ng-container>
            <mat-icon>save</mat-icon>
            Save Check Call
          </ng-container>
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

    .check-call-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
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

    .checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.5rem 0;
      
      mat-checkbox {
        flex: 0 0 calc(50% - 0.5rem);
      }
    }

    mat-icon[matPrefix] {
      margin-right: 0.5rem;
      color: var(--text-secondary);
    }

    mat-dialog-actions {
      padding: 1rem;
      gap: 0.5rem;
    }
  `]
})
export class CheckCallFormComponent {
  form: FormGroup;
  submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private checkCallService: CheckCallService,
    private dialogRef: MatDialogRef<CheckCallFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { loadId: string; driverId: string }
  ) {
    this.form = this.fb.group({
      currentLocation: ['', Validators.required],
      latitude: [null],
      longitude: [null],
      estimatedArrivalTime: [null],
      delayMinutes: [0],
      delayReason: [''],
      milesToDestination: [null],
      trailerTemperature: [null],
      fuelLevel: [null],
      equipmentIssue: [false],
      safetyIssue: [false],
      weatherDelay: [false],
      trafficDelay: [false],
      notes: ['']
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
      
      const request: CreateCheckCallRequest = this.form.value;
      
      this.checkCallService.createCheckCall(
        this.data.loadId,
        this.data.driverId,
        request
      ).subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error creating check call:', error);
          this.submitting.set(false);
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
