import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page login">
      <mat-card class="auth-card">
        <h1>Welcome back</h1>
        <p class="lede">Sign in to the Truckstop TMS suite.</p>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline" color="primary">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" required />
            @if (form.controls.email.hasError('required')) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.controls.email.hasError('email')) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" color="primary">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" required />
            @if (form.controls.password.hasError('required')) {
              <mat-error>Password is required</mat-error>
            }
            @if (form.controls.password.hasError('minlength')) {
              <mat-error>Minimum 8 characters</mat-error>
            }
          </mat-form-field>
          <button mat-flat-button color="primary" class="primary" type="submit" [disabled]="form.invalid">Sign in</button>
        </form>
        <div class="footnote">Trouble signing in? Contact support.</div>
      </mat-card>
    </div>
  `,
  styles: [`
    .login {
      min-height: calc(100vh - 120px);
      display: grid;
      place-items: center;
      padding: var(--ts-spacing-2xl) var(--ts-spacing-lg);
    }
    .auth-card {
      width: min(480px, 100%);
      padding: var(--ts-spacing-2xl);
      display: grid;
      gap: var(--ts-spacing-md);
      border-radius: 16px;
      border: 1px solid var(--ts-border);
      box-shadow: 0 10px 28px rgba(0,0,0,0.08);
      background: #fff;
    }
    h1 { margin: 0; font-size: 30px; font-weight: 800; }
    .lede { margin: 0; color: var(--ts-stone); }
    .form { display: grid; gap: var(--ts-spacing-md); margin-top: var(--ts-spacing-md); }
    .footnote { color: var(--ts-stone); font-size: 13px; }
  `]
})
export class LoginPage {
  constructor(private fb: FormBuilder) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      // Placeholder for auth flow
    }
  }
}
