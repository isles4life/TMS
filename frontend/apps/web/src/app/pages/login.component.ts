import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>TMS Login</mat-card-title>
          <mat-card-subtitle>Transportation Management System</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required />
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button 
              mat-flat-button 
              color="primary" 
              type="submit" 
              [disabled]="!loginForm.valid || isLoading"
              class="full-width login-button">
              <span *ngIf="!isLoading">Login</span>
              <span *ngIf="isLoading">Logging in...</span>
            </button>

            <p class="signup-link">
              Don't have an account? <a href="/register">Sign up here</a>
            </p>
          </form>

          <div class="demo-credentials">
            <h3>Demo Credentials</h3>
            <div class="credentials-list">
              <div class="credential-item">
                <strong>Super Admin</strong>
                <code>superadmin&#64;example.com</code>
                <code>admin123</code>
              </div>
              <div class="credential-item">
                <strong>Broker</strong>
                <code>broker&#64;example.com</code>
                <code>broker123</code>
              </div>
              <div class="credential-item">
                <strong>Carrier</strong>
                <code>carrier&#64;example.com</code>
                <code>carrier123</code>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--ts-page-bg, #f2f3f5);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      color: var(--ts-ink, #0f1115);
      font-size: 24px;
      font-weight: 700;
    }

    mat-card-subtitle {
      color: var(--ts-stone, #2f343d);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      color: var(--ts-red, #d71920);
      font-size: 13px;
      padding: 12px;
      background: rgba(215, 25, 32, 0.1);
      border-radius: 4px;
    }

    .login-button {
      height: 44px;
      font-weight: 600;
      border-radius: 4px;
      margin-top: 8px;
      background-color: #d71920 !important;
      color: white !important;
    }

    .login-button:hover:not(:disabled) {
      background-color: #b01318 !important;
    }

    .signup-link {
      text-align: center;
      font-size: 13px;
      margin: 16px 0 0 0;
      color: var(--ts-stone, #2f343d);
    }

    .signup-link a {
      color: #d71920;
      text-decoration: none;
      font-weight: 600;
    }

    .signup-link a:hover {
      text-decoration: underline;
    }

    .demo-credentials {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .demo-credentials h3 {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
    }

    .credentials-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .credential-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
      border-left: 3px solid #d71920;
    }

    .credential-item strong {
      font-size: 12px;
      color: #d71920;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .credential-item code {
      font-size: 11px;
      background: white;
      padding: 2px 4px;
      border-radius: 2px;
      font-family: 'Courier New', monospace;
      color: #666;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Login failed';
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
