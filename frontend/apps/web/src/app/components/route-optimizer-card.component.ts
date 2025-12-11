import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
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
      margin-top: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .route-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      align-items: center;
    }

    .loader {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }

    .results {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .label {
      color: rgba(0,0,0,0.6);
    }

    .fuel, .warnings {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
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

  private readonly fb = inject(FormBuilder);
  private readonly routeService = inject(RouteOptimizationService);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
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
