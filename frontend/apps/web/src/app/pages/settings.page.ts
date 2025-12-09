import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../components/page-header.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatButtonModule, PageHeaderComponent],
  template: `
    <div class="page">
      <ts-page-header 
        eyebrow="Preferences" 
        title="Settings" 
        description="Simple controls with instant validation."
        [hasActions]="true">
        <button mat-stroked-button color="primary" (click)="form.reset(defaults)">Reset</button>
      </ts-page-header>

      <mat-card class="panel">
        <form [formGroup]="form" class="form" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Company name</mat-label>
            <input matInput formControlName="company" required />
            <mat-error *ngIf="form.controls.company.hasError('required')">Company is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Notification email</mat-label>
            <input matInput formControlName="email" type="email" required />
            <mat-error *ngIf="form.controls.email.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="form.controls.email.hasError('email')">Provide a valid email</mat-error>
          </mat-form-field>
          <mat-slide-toggle formControlName="alerts">Enable critical alerts</mat-slide-toggle>
          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Save changes</button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .panel { padding: var(--ts-spacing-lg); border: 1px solid var(--ts-border); border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); background: #fff; }
    .form { display: grid; gap: var(--ts-spacing-md); max-width: 520px; }
    .actions { display: inline-flex; gap: var(--ts-spacing-sm); }
  `]
})
export class SettingsPage {
  defaults = { company: 'Truckstop Logistics', email: 'ops@truckstop.com', alerts: true };
  form = this.fb.group({
    company: [this.defaults.company, Validators.required],
    email: [this.defaults.email, [Validators.required, Validators.email]],
    alerts: [this.defaults.alerts],
  });

  constructor(private fb: FormBuilder) {}

  save() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      // Save settings here
    }
  }
}
