import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface PasswordResetDialogData {
  email: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-ts-password-reset-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <mat-icon class="header-icon">vpn_key</mat-icon>
        <h2 mat-dialog-title>Reset Password</h2>
      </div>
      <button mat-icon-button (click)="close()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-divider></mat-divider>

    <div mat-dialog-content class="dialog-content">
      <div class="info-section">
        <div class="info-item">
          <mat-icon>person</mat-icon>
          <div>
            <div class="label">User</div>
            <div class="value">{{ data.firstName }} {{ data.lastName }}</div>
          </div>
        </div>

        <div class="info-item">
          <mat-icon>email</mat-icon>
          <div>
            <div class="label">Email</div>
            <div class="value">{{ data.email }}</div>
          </div>
        </div>
      </div>

      <div class="action-section">
        <p class="description">
          A password reset link will be sent to the user's email address. They will have 24 hours to set a new password.
        </p>
      </div>
    </div>

    <mat-divider></mat-divider>

    <div mat-dialog-actions class="actions">
      <button mat-stroked-button (click)="close()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-flat-button color="primary" (click)="sendReset()">
        <mat-icon>mail_outline</mat-icon>
        Send Reset Link
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
      min-width: 420px;
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .info-item mat-icon {
      color: #d71920;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .action-section {
      margin-top: 16px;
    }

    .description {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1.5;
      padding: 12px;
      background: #fffbf0;
      border-left: 3px solid #d71920;
      border-radius: 4px;
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

    @media (max-width: 480px) {
      .dialog-content {
        min-width: 320px;
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
export class PasswordResetDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PasswordResetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordResetDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  sendReset(): void {
    this.dialogRef.close({ action: 'send-reset', email: this.data.email });
  }
}
