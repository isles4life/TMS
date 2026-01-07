import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { RouteOptimizationService, RouteRequest, RouteResponse, FuelCostEstimate, FuelPriceInfo } from '../services/route-optimization.service';

@Component({
  selector: 'app-route-optimizer-card',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="route-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>route</mat-icon>
          Quick Route Optimizer
        </mat-card-title>
        <mat-card-subtitle>Calculate distance, ETA, and fuel cost</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="route-form">
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Origin Latitude</mat-label>
              <input matInput formControlName="originLatitude" type="number" step="0.0001" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Origin Longitude</mat-label>
              <input matInput formControlName="originLongitude" type="number" step="0.0001" required>
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Destination Latitude</mat-label>
              <input matInput formControlName="destinationLatitude" type="number" step="0.0001" required>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Destination Longitude</mat-label>
              <input matInput formControlName="destinationLongitude" type="number" step="0.0001" required>
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Vehicle Type</mat-label>
              <mat-select formControlName="vehicleType">
                <mat-option value="truck">Truck</mat-option>
                <mat-option value="van">Van</mat-option>
                <mat-option value="car">Car</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Fuel Price (per gallon)</mat-label>
              <input matInput formControlName="fuelPricePerGallon" type="number" step="0.01">
              <mat-hint align="end">Optional</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Zip for fuel lookup</mat-label>
              <input matInput formControlName="zipCode" type="text" maxlength="10">
              <mat-hint align="end">Optional</mat-hint>
            </mat-form-field>
          </div>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isLoading">
              <mat-icon>play_circle</mat-icon>
              Calculate
            </button>
            <button mat-stroked-button type="button" (click)="onFetchFuelPrice()" [disabled]="isLoading">
              <mat-icon>local_gas_station</mat-icon>
              Use zip fuel price
            </button>
            <button mat-button type="button" (click)="onReset()" [disabled]="isLoading">Reset</button>
          </div>
        </form>

        @if (isLoading) {
          <div class="loader">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Calculating route...</span>
          </div>
        }

        @if (routeResult && !isLoading) {
          <div class="results">
          <div class="result-row">
            <span class="label">Distance</span>
            <span class="value">{{ formatDistance(routeResult.distanceMiles) }} ({{ routeResult.distanceKilometers | number:'1.1-1' }} km)</span>
          </div>
          <div class="result-row">
            <span class="label">Duration</span>
            <span class="value">{{ formatDuration(routeResult.durationMinutes) }}</span>
          </div>
          <div class="result-row">
            <span class="label">ETA</span>
            <span class="value">{{ formatETA(routeResult.estimatedArrivalTime) }}</span>
          </div>
          @if (routeResult.trafficDelayMinutes) {
            <div class="result-row">
            <span class="label">Traffic Delay</span>
            <span class="value">+{{ routeResult.trafficDelayMinutes | number:'1.0-0' }} min</span>
            </div>
          }

          @if (fuelEstimate) {
            <div class="fuel">
            <mat-chip color="primary" selected>
              Fuel Cost: {{ fuelEstimate.totalFuelCost | currency:'USD':'symbol' }}
            </mat-chip>
            <mat-chip>Consumption: {{ fuelEstimate.fuelConsumptionGallons | number:'1.1-1' }} gal</mat-chip>
            <mat-chip>MPG: {{ fuelEstimate.averageMPG | number:'1.1-1' }}</mat-chip>
            @if (fuelPriceInfo) {
              <mat-chip>{{ fuelPriceInfo.pricePerGallon | currency:'USD':'symbol' }} · {{ fuelPriceInfo.fuelType | uppercase }} ({{ fuelPriceInfo.source }})</mat-chip>
            }
            </div>
          }

          @if (routeResult.summary.warnings.length) {
            <div class="warnings">
              @for (warning of routeResult.summary.warnings; track warning) {
                <mat-chip color="warn" selected>
              {{ warning }}
                </mat-chip>
              }
            </div>
          }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .route-card {
      margin-top: 20px;
      background: var(--card-bg);
      border: 3px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15), 
        0 2px 6px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 5px;
        background: linear-gradient(180deg, var(--ts-red) 0%, #b31218 100%);
        opacity: 0.8;
      }

      &:hover {
        box-shadow: 
          0 8px 16px rgba(0, 0, 0, 0.18), 
          0 4px 8px rgba(0, 0, 0, 0.12),
          0 0 0 2px rgba(215, 25, 32, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
        border-color: var(--ts-red);
        transform: translateY(-2px);

        &::before {
          width: 6px;
          opacity: 1;
        }
      }
    }

    mat-card-header {
      padding: 20px 24px 16px 28px;
      background: linear-gradient(135deg, 
        var(--card-bg) 0%, 
        var(--surface-secondary) 50%,
        var(--card-bg) 100%);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border-bottom: 2px solid var(--border-color);
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 800;
      color: var(--color-text);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      mat-icon {
        color: var(--ts-red);
      }
    }

    mat-card-subtitle {
      color: var(--muted-text);
      font-weight: 500;
      margin-top: 6px;
    }

    mat-card-content {
      padding: 24px 24px 24px 28px;
    }

    .route-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    mat-form-field {
      width: 100%;

      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background-color: var(--card-bg);
        }

        .mat-mdc-form-field-focus-overlay {
          background-color: transparent;
        }

        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: var(--border-color) !important;
          border-width: 2px !important;
        }

        &.mat-focused {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: var(--ts-red) !important;
            border-width: 2px !important;
          }
        }

        .mat-mdc-form-field-error {
          color: var(--accent-red);
        }
      }
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      align-items: center;
      padding-top: 8px;
      flex-wrap: wrap;

      button {
        font-weight: 600;
        border-radius: 8px;
        padding: 0 20px;
        
        mat-icon {
          margin-right: 6px;
        }
      }
    }

    .loader {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 0;
      color: var(--color-text);
      font-weight: 500;
    }

    .results {
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, 
        var(--surface-secondary) 0%, 
        var(--card-bg) 100%);
      border: 2px solid var(--border-color);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }
    }

    .label {
      color: var(--muted-text);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    .value {
      color: var(--color-text);
      font-weight: 700;
      font-size: 15px;
    }

    .fuel, .warnings {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid var(--border-color);
    }

    .fuel mat-chip {
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .row {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
        align-items: stretch;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class RouteOptimizerCardComponent implements OnChanges {
  @Input() defaultOrigin?: { lat: number; lng: number };

  form: FormGroup;
  routeResult: RouteResponse | null = null;
  fuelEstimate: FuelCostEstimate | null = null;
  fuelPriceInfo: FuelPriceInfo | null = null;
  isLoading = false;
  

  constructor(
    private readonly fb: FormBuilder,
    private readonly routeService: RouteOptimizationService,
    private readonly snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      originLatitude: [this.defaultOrigin?.lat, [Validators.required, Validators.min(-90), Validators.max(90)]],
      originLongitude: [this.defaultOrigin?.lng, [Validators.required, Validators.min(-180), Validators.max(180)]],
      destinationLatitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      destinationLongitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      vehicleType: ['truck', Validators.required],
      fuelPricePerGallon: [null],
      zipCode: [null]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultOrigin']?.currentValue && !this.form.value.originLatitude && !this.form.value.originLongitude) {
      this.form.patchValue({
        originLatitude: this.defaultOrigin?.lat,
        originLongitude: this.defaultOrigin?.lng
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 2500 });
      return;
    }

    this.isLoading = true;
    this.routeResult = null;
    this.fuelEstimate = null;
    this.fuelPriceInfo = null;

    const request: RouteRequest = {
      originLatitude: this.form.value.originLatitude,
      originLongitude: this.form.value.originLongitude,
      destinationLatitude: this.form.value.destinationLatitude,
      destinationLongitude: this.form.value.destinationLongitude,
      vehicleType: this.form.value.vehicleType,
      departureTime: new Date()
    };

    try {
      this.routeResult = await firstValueFrom(this.routeService.calculateRoute(request));

      const fuelPrice = this.form.value.fuelPricePerGallon;
      if (fuelPrice && this.routeResult?.distanceMiles) {
        this.fuelEstimate = await firstValueFrom(
          this.routeService.calculateFuelCost(this.routeResult.distanceMiles, request.vehicleType || 'truck', fuelPrice)
        );
      }
    } catch (error) {
      console.error('Route calculation failed', error);
      this.snackBar.open('Failed to calculate route', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  onReset(): void {
    this.form.reset({
      originLatitude: this.defaultOrigin?.lat || null,
      originLongitude: this.defaultOrigin?.lng || null,
      destinationLatitude: null,
      destinationLongitude: null,
      vehicleType: 'truck',
      fuelPricePerGallon: null,
      zipCode: null
    });
    this.routeResult = null;
    this.fuelEstimate = null;
    this.fuelPriceInfo = null;
  }

  formatDistance(miles: number): string {
    return this.routeService.formatDistance(miles);
  }

  formatDuration(minutes: number): string {
    return this.routeService.formatDuration(minutes);
  }

  formatETA(eta: Date): string {
    return this.routeService.formatETA(eta);
  }

  async onFetchFuelPrice(): Promise<void> {
    const zip = this.form.value.zipCode;
    const vehicleType = this.form.value.vehicleType;
    if (!zip) {
      this.snackBar.open('Enter a zip code to lookup fuel price', 'Close', { duration: 2500 });
      return;
    }

    try {
      this.isLoading = true;
      const fuelType = vehicleType === 'truck' ? 'diesel' : 'gas';
      this.fuelPriceInfo = await firstValueFrom(this.routeService.getFuelPriceByZip(zip, fuelType));
      this.form.patchValue({ fuelPricePerGallon: this.fuelPriceInfo.pricePerGallon });
      this.snackBar.open(`Fuel price loaded: ${this.fuelPriceInfo.pricePerGallon.toFixed(2)} per gallon`, 'Close', { duration: 2500 });
    } catch (error) {
      console.error('Fuel price lookup failed', error);
      this.snackBar.open('Failed to lookup fuel price', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }
}
