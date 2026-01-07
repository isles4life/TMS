import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UserRole } from '../../services/auth.service';

export interface UserDialogData {
  mode: 'add' | 'edit';
  user?: SystemUserPayload;
}

export interface SystemUserPayload {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

@Component({
  selector: 'app-ts-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <mat-icon class="header-icon">{{ data.mode === 'add' ? 'person_add' : 'edit' }}</mat-icon>
        <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add New User' : 'Edit User' }}</h2>
      </div>
      <button mat-icon-button (click)="close()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-divider></mat-divider>

    <div mat-dialog-content class="dialog-content">
      <div class="form-section">
        <div class="section-title">
          <mat-icon>person</mat-icon>
          <span>Personal Information</span>
        </div>
        
        <div class="name-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>First Name</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <input matInput [(ngModel)]="form.firstName" required placeholder="Enter first name" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Last Name</mat-label>
            <mat-icon matPrefix>badge</mat-icon>
            <input matInput [(ngModel)]="form.lastName" required placeholder="Enter last name" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email Address</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput [(ngModel)]="form.email" type="email" required placeholder="user@example.com" />
        </mat-form-field>
      </div>

      <mat-divider></mat-divider>

      <div class="form-section">
        <div class="section-title">
          <mat-icon>security</mat-icon>
          <span>Access & Permissions</span>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>User Role</mat-label>
          <mat-icon matPrefix>admin_panel_settings</mat-icon>
          <mat-select [(ngModel)]="form.role" required>
            @for (role of roles; track role) {
              <mat-option [value]="role">
              <div class="role-option">
                <span class="role-name">{{ role }}</span>
                <span class="role-desc">{{ getRoleDescription(role) }}</span>
              </div>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="status-toggle">
          <div class="toggle-info">
            <mat-icon>{{ form.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
            <div>
              <div class="toggle-label">Account Status</div>
              <div class="toggle-hint">{{ form.isActive ? 'User can access the system' : 'User cannot log in' }}</div>
            </div>
          </div>
          <mat-slide-toggle [(ngModel)]="form.isActive" color="primary" class="ts-toggle">
            {{ form.isActive ? 'Active' : 'Inactive' }}
          </mat-slide-toggle>
        </div>
      </div>
    </div>

    <mat-divider></mat-divider>

    <div mat-dialog-actions class="actions">
      <button mat-stroked-button (click)="close()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!isValid()">
        <mat-icon>{{ data.mode === 'add' ? 'person_add' : 'save' }}</mat-icon>
        {{ data.mode === 'add' ? 'Add User' : 'Save Changes' }}
      </button>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      color: #d71920;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      color: #666;
    }

    .dialog-content {
      padding: 24px;
      min-width: 480px;
      max-width: 600px;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #d71920;
    }

    .full-width {
      width: 100%;
    }

    .name-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }

    mat-form-field {
      margin-bottom: 16px;
    }

    mat-form-field:last-child {
      margin-bottom: 0;
    }

    .role-option {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .role-name {
      font-weight: 600;
      color: #333;
    }

    .role-desc {
      font-size: 12px;
      color: #666;
    }

    .status-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-top: 16px;
    }

    .toggle-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toggle-info mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #d71920;
    }

    .toggle-label {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .toggle-hint {
      font-size: 12px;
      color: #666;
    }

    .actions {
      padding: 16px 24px;
      gap: 12px;
      display: flex;
      justify-content: flex-end;
    }

    .actions button {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 40px;
      padding: 0 20px;
    }

    .actions button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Override Material toggle colors to use Truckstop red */
    ::ng-deep .ts-toggle.mat-mdc-slide-toggle {
      --mdc-theme-primary: #d71920;
    }

    ::ng-deep .ts-toggle.mat-mdc-slide-toggle.mat-checked .mdc-switch__thumb {
      background-color: #d71920 !important;
    }

    ::ng-deep .ts-toggle.mat-mdc-slide-toggle.mat-checked .mdc-switch__track {
      background-color: rgba(215, 25, 32, 0.5) !important;
    }

    @media (max-width: 640px) {
      .dialog-content {
        min-width: 320px;
        padding: 20px;
      }

      .name-row {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column-reverse;
      }

      .actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UserDialogComponent {
  roles: UserRole[] = ['SuperAdmin', 'Broker', 'Carrier'];

  form: SystemUserPayload = {
    id: undefined,
    email: '',
    firstName: '',
    lastName: '',
    role: 'Carrier' as UserRole,
    isActive: true
  };

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    if (this.data.user) {
      this.form = { ...this.data.user };
    }
  }

  getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      SuperAdmin: 'Full system access and control',
      Broker: 'Post loads and manage bookings',
      Carrier: 'View and accept load offers'
    };
    return descriptions[role];
  }

  isValid(): boolean {
    return !!(this.form.email && this.form.firstName && this.form.lastName && this.form.role);
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.form);
  }
}
