import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
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
  selector: 'ts-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add User' : 'Edit User' }}</h2>
    <div mat-dialog-content class="dialog-content">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="form.email" type="email" required />
      </mat-form-field>

      <div class="name-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>First Name</mat-label>
          <input matInput [(ngModel)]="form.firstName" required />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Last Name</mat-label>
          <input matInput [(ngModel)]="form.lastName" required />
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Role</mat-label>
        <mat-select [(ngModel)]="form.role" required>
          <mat-option *ngFor="let role of roles" [value]="role">{{ role }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-slide-toggle [(ngModel)]="form.isActive">Active</mat-slide-toggle>
    </div>

    <div mat-dialog-actions align="end" class="actions">
      <button mat-stroked-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="!isValid()">
        {{ data.mode === 'add' ? 'Add User' : 'Save Changes' }}
      </button>
    </div>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 320px;
      max-width: 500px;
    }

    .name-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .actions {
      margin-top: 4px;
    }

    @media (max-width: 480px) {
      .name-row {
        grid-template-columns: 1fr;
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
    if (data.user) {
      this.form = { ...data.user };
    }
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
