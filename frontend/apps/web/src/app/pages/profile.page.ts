import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PageHeaderComponent } from '../components/page-header.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,
    PageHeaderComponent,
  ],
  template: `
    <div class="page">
      <ts-page-header
        eyebrow="Account"
        title="Profile"
        description="Manage your profile information and account settings."
        [hasActions]="false">
      </ts-page-header>

      <mat-tab-group class="profile-tabs">
        <!-- Personal Information Tab -->
        <mat-tab label="Personal Information" class="tab-content">
          <mat-card class="panel">
            <form [formGroup]="personalForm" (ngSubmit)="onSavePersonal()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" />
                </mat-form-field>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone</mat-label>
                  <input matInput type="tel" formControlName="phone" />
                </mat-form-field>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Company</mat-label>
                  <input matInput formControlName="company" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Role</mat-label>
                  <input matInput formControlName="role" />
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="onResetPersonal()">Cancel</button>
                <button mat-flat-button color="primary" type="submit">Save Changes</button>
              </div>
            </form>
          </mat-card>
        </mat-tab>

        <!-- Company & Billing Tab -->
        <mat-tab label="Company & Billing" class="tab-content">
          <mat-card class="panel">
            <form [formGroup]="companyForm" (ngSubmit)="onSaveCompany()">
              <h3>Company Information</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Company Name</mat-label>
                  <input matInput formControlName="companyName" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Company Type</mat-label>
                  <mat-select formControlName="companyType">
                    <mat-option value="carrier">Carrier</mat-option>
                    <mat-option value="shipper">Shipper</mat-option>
                    <mat-option value="broker">Broker</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Address</mat-label>
                  <input matInput formControlName="address" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" />
                </mat-form-field>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>State</mat-label>
                  <input matInput formControlName="state" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>ZIP Code</mat-label>
                  <input matInput formControlName="zipCode" />
                </mat-form-field>
              </div>

              <h3 style="margin-top: var(--ts-spacing-lg);">Billing Information</h3>
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Billing Email</mat-label>
                  <input matInput type="email" formControlName="billingEmail" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Payment Method</mat-label>
                  <mat-select formControlName="paymentMethod">
                    <mat-option value="credit_card">Credit Card</mat-option>
                    <mat-option value="bank_transfer">Bank Transfer</mat-option>
                    <mat-option value="check">Check</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="onResetCompany()">Cancel</button>
                <button mat-flat-button color="primary" type="submit">Save Changes</button>
              </div>
            </form>
          </mat-card>
        </mat-tab>

        <!-- Security Tab -->
        <mat-tab label="Security & Privacy" class="tab-content">
          <mat-card class="panel">
            <h3>Change Password</h3>
            <form [formGroup]="securityForm" (ngSubmit)="onChangePassword()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Current Password</mat-label>
                  <input matInput type="password" formControlName="currentPassword" />
                </mat-form-field>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>New Password</mat-label>
                  <input matInput type="password" formControlName="newPassword" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirm Password</mat-label>
                  <input matInput type="password" formControlName="confirmPassword" />
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="onResetSecurity()">Cancel</button>
                <button mat-flat-button color="primary" type="submit">Update Password</button>
              </div>
            </form>

            <mat-divider class="divider"></mat-divider>

            <h3>Privacy & Notifications</h3>
            <mat-list [formGroup]="securityForm">
              <mat-list-item>
                <span matListItemTitle>Email Notifications</span>
                <mat-slide-toggle matListItemMeta [formControl]="getToggleControl('emailNotifs')"></mat-slide-toggle>
              </mat-list-item>
              <mat-list-item>
                <span matListItemTitle>Marketing Emails</span>
                <mat-slide-toggle matListItemMeta [formControl]="getToggleControl('marketingEmails')"></mat-slide-toggle>
              </mat-list-item>
              <mat-list-item>
                <span matListItemTitle>Load Alerts</span>
                <mat-slide-toggle matListItemMeta [formControl]="getToggleControl('loadAlerts')"></mat-slide-toggle>
              </mat-list-item>
            </mat-list>
          </mat-card>
        </mat-tab>

        <!-- Account Tab -->
        <mat-tab label="Account" class="tab-content">
          <mat-card class="panel">
            <h3>Account Details</h3>
            <div class="account-info">
              <div class="info-row">
                <span class="label">Account Status:</span>
                <span class="value status-active">Active</span>
              </div>
              <div class="info-row">
                <span class="label">Member Since:</span>
                <span class="value">January 15, 2024</span>
              </div>
              <div class="info-row">
                <span class="label">Plan:</span>
                <span class="value">Premium</span>
              </div>
              <div class="info-row">
                <span class="label">Quick Pay Enabled:</span>
                <span class="value status-active">Yes</span>
              </div>
            </div>

            <mat-divider class="divider"></mat-divider>

            <h3>Danger Zone</h3>
            <div class="danger-zone">
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button mat-stroked-button color="warn" (click)="onDeleteAccount()">
                Delete Account
              </button>
            </div>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile-tabs {
      padding: var(--ts-spacing-lg);
    }
    .tab-content {
      padding: var(--ts-spacing-lg) 0;
    }
    .panel {
      padding: var(--ts-spacing-lg);
      border: 1px solid var(--ts-border);
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      background: #fff;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--ts-spacing-md);
      margin-bottom: var(--ts-spacing-md);
    }
    .full-width {
      width: 100%;
    }
    mat-form-field {
      width: 100%;
    }
    h3 {
      margin: 0 0 var(--ts-spacing-md) 0;
      padding: var(--ts-spacing-md) 0 0 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--ts-ink);
      border-top: 1px solid var(--ts-border);
    }
    h3:first-of-type {
      border: none;
      padding: 0;
    }
    .form-actions {
      display: flex;
      gap: var(--ts-spacing-md);
      justify-content: flex-end;
      margin-top: var(--ts-spacing-lg);
      padding-top: var(--ts-spacing-lg);
      border-top: 1px solid var(--ts-border);
    }
    .divider {
      margin: var(--ts-spacing-lg) 0;
    }
    .account-info {
      display: grid;
      gap: var(--ts-spacing-md);
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--ts-spacing-sm);
      border-bottom: 1px solid var(--ts-border);
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: var(--ts-ink);
    }
    .value {
      color: var(--ts-stone);
    }
    .status-active {
      color: var(--ts-green, #4caf50);
      font-weight: 600;
    }
    .danger-zone {
      padding: var(--ts-spacing-md);
      background: rgba(255, 0, 0, 0.04);
      border: 1px solid rgba(255, 0, 0, 0.2);
      border-radius: 8px;
      margin-top: var(--ts-spacing-md);
    }
    .danger-zone p {
      margin: 0 0 var(--ts-spacing-md) 0;
      color: var(--ts-stone);
      font-size: 14px;
    }
    @media (max-width: 640px) {
      .form-grid {
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
export class ProfilePage implements OnInit {
  personalForm!: FormGroup;
  companyForm!: FormGroup;
  securityForm!: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  private initializeForms(): void {
    this.personalForm = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Driver', Validators.required],
      email: ['john.driver@truckstop.com', [Validators.required, Validators.email]],
      phone: ['(555) 123-4567', Validators.required],
      company: ['My Trucking Co.', Validators.required],
      role: ['Fleet Manager', Validators.required],
    });

    this.companyForm = this.fb.group({
      companyName: ['My Trucking Co.', Validators.required],
      companyType: ['carrier', Validators.required],
      address: ['123 Main St', Validators.required],
      city: ['Denver', Validators.required],
      state: ['CO', Validators.required],
      zipCode: ['80202', Validators.required],
      billingEmail: ['billing@mytrucking.com', [Validators.required, Validators.email]],
      paymentMethod: ['credit_card', Validators.required],
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      emailNotifs: [true],
      marketingEmails: [false],
      loadAlerts: [true],
    });
  }

  private loadUserData(): void {
    // In a real app, fetch user data from API
  }

  onSavePersonal(): void {
    if (this.personalForm.valid) {
      console.log('Saving personal info:', this.personalForm.value);
      alert('Personal information saved successfully!');
    }
  }

  onResetPersonal(): void {
    this.personalForm.reset();
  }

  onSaveCompany(): void {
    if (this.companyForm.valid) {
      console.log('Saving company info:', this.companyForm.value);
      alert('Company information saved successfully!');
    }
  }

  onResetCompany(): void {
    this.companyForm.reset();
  }

  onChangePassword(): void {
    if (this.securityForm.valid) {
      const { newPassword, confirmPassword } = this.securityForm.value;
      if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      console.log('Changing password...');
      alert('Password changed successfully!');
      this.securityForm.reset();
    }
  }

  onResetSecurity(): void {
    this.securityForm.reset();
  }

  onDeleteAccount(): void {
    if (confirm('Are you sure? This action cannot be undone.')) {
      console.log('Deleting account...');
      this.authService.logout();
    }
  }

  getToggleControl(fieldName: string): FormControl {
    return this.securityForm.get(fieldName) as FormControl;
  }
}
