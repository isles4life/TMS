import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AuthService, UserRole } from '../../services/auth.service';
import { UserDialogComponent, SystemUserPayload } from './user-dialog.component';
import { EmailService } from '../../services/email.service';
import { PasswordResetDialogComponent } from './password-reset-dialog.component';

interface AppSettings {
  maintenanceMode: boolean;
  apiEndpoint: string;
  appName: string;
  logRetentionDays: number;
  maxUploadSizeMB: number;
  enableNotifications: boolean;
  sessionTimeoutMinutes: number;
}

interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

@Component({
  selector: 'app-ts-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTableModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
    UserDialogComponent,
    PasswordResetDialogComponent
  ],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <h1>
          <mat-icon>admin_panel_settings</mat-icon>
          System Administration
        </h1>
        <p class="subtitle">Manage global application settings and user accounts</p>
      </div>

      <mat-tab-group class="admin-tabs">
        <!-- System Settings Tab -->
        <mat-tab label="⚙️ System Settings">
          <div class="settings-grid">
        <!-- General Settings Card -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>settings</mat-icon>
              General Settings
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-row">
              <span class="setting-label">Application Name</span>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>App Name</mat-label>
                <input matInput [(ngModel)]="appSettings.appName" placeholder="Enter app name">
              </mat-form-field>
            </div>

            <div class="setting-row">
              <span class="setting-label">API Endpoint</span>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Backend URL</mat-label>
                <input matInput [(ngModel)]="appSettings.apiEndpoint" placeholder="Enter API endpoint">
              </mat-form-field>
            </div>

            <div class="setting-row">
              <span class="setting-label">Session Timeout (minutes)</span>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Timeout</mat-label>
                <input matInput type="number" [(ngModel)]="appSettings.sessionTimeoutMinutes" min="5" max="480">
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Maintenance & Features Card -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>construction</mat-icon>
              Maintenance & Features
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-row toggle">
              <div class="label-section">
                <span class="setting-label">Maintenance Mode</span>
                <p class="help-text">Enable to prevent users from accessing the application</p>
              </div>
              <mat-slide-toggle [(ngModel)]="appSettings.maintenanceMode" color="primary" class="ts-toggle"></mat-slide-toggle>
            </div>

            <mat-divider></mat-divider>

            <div class="setting-row toggle">
              <div class="label-section">
                <span class="setting-label">Enable Notifications</span>
                <p class="help-text">Allow in-app notifications and email alerts</p>
              </div>
              <mat-slide-toggle [(ngModel)]="appSettings.enableNotifications" color="primary" class="ts-toggle"></mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Data Management Card -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>storage</mat-icon>
              Data Management
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="setting-row">
              <span class="setting-label">Log Retention (days)</span>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Days</mat-label>
                <input matInput type="number" [(ngModel)]="appSettings.logRetentionDays" min="7" max="365">
              </mat-form-field>
            </div>

            <div class="setting-row">
              <span class="setting-label">Max Upload Size (MB)</span>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Size</mat-label>
                <input matInput type="number" [(ngModel)]="appSettings.maxUploadSizeMB" min="1" max="1000">
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- System Info Card -->
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>info</mat-icon>
              System Information
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row">
              <span class="label">Application Version:</span>
              <span class="value">1.0.0</span>
            </div>
            <div class="info-row">
              <span class="label">Last Updated:</span>
              <span class="value">{{ lastUpdated | date: 'medium' }}</span>
            </div>
            <div class="info-row">
              <span class="label">System Status:</span>
              <span class="value status-active">
                <mat-icon>check_circle</mat-icon>
                Active
              </span>
            </div>
            <div class="info-row">
              <span class="label">Logged In As:</span>
              <span class="value">{{ currentUser?.firstName }} {{ currentUser?.lastName }} ({{ currentUser?.role }})</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="action-buttons">
        <button mat-raised-button color="primary" (click)="saveSettings()">
          <mat-icon>save</mat-icon>
          Save Settings
        </button>
        <button mat-stroked-button (click)="resetSettings()">
          <mat-icon>restore</mat-icon>
          Reset to Defaults
        </button>
      </div>
        </mat-tab>

        <!-- User Management Tab -->
        <mat-tab label="👥 User Management">
          <div class="users-container">
            <mat-card class="users-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>group</mat-icon>
                  System Users
                </mat-card-title>
                <button mat-raised-button color="primary" class="add-user-btn" (click)="addUser()">
                  <mat-icon>person_add</mat-icon>
                  Add User
                </button>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="systemUsers" class="users-table">
                  <!-- Email Column -->
                  <ng-container matColumnDef="email">
                    <th mat-header-cell *matHeaderCellDef>Email</th>
                    <td mat-cell *matCellDef="let element">{{ element.email }}</td>
                  </ng-container>

                  <!-- Name Column -->
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let element">{{ element.firstName }} {{ element.lastName }}</td>
                  </ng-container>

                  <!-- Role Column -->
                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>Role</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="role-badge" [class]="'role-' + element.role.toLowerCase()">
                        {{ element.role }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="status-badge" [class.active]="element.isActive" [class.inactive]="!element.isActive">
                        {{ element.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Last Login Column -->
                  <ng-container matColumnDef="lastLogin">
                    <th mat-header-cell *matHeaderCellDef>Last Login</th>
                    <td mat-cell *matCellDef="let element">
                      {{ element.lastLoginAt ? (element.lastLoginAt | date: 'short') : 'Never' }}
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let element">
                      <button mat-icon-button [matMenuTriggerFor]="menu" class="action-btn">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="impersonateUser(element)">
                          <mat-icon>switch_account</mat-icon>
                          <span>Impersonate</span>
                        </button>
                        <button mat-menu-item (click)="toggleUserStatus(element)">
                          <mat-icon>{{ element.isActive ? 'lock' : 'lock_open' }}</mat-icon>
                          <span>{{ element.isActive ? 'Deactivate' : 'Activate' }}</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button mat-menu-item (click)="editUser(element)">
                          <mat-icon>edit</mat-icon>
                          <span>Edit</span>
                        </button>
                        <button mat-menu-item (click)="resetUserPassword(element)">
                          <mat-icon>vpn_key</mat-icon>
                          <span>Reset Password</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button mat-menu-item (click)="deleteUser(element)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Delete</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 16px 12px;
      box-sizing: border-box;
      overflow-x: hidden;
    }

    /* Keep sections compact to reduce vertical overflow */
    .admin-header {
      margin-bottom: 20px;
    }

    .admin-header {
      margin-bottom: 32px;
    }

    .admin-header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .admin-header h1 mat-icon {
      color: #d71920;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .subtitle {
      color: #666;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .settings-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      height: 100%;
    }

    .settings-card mat-card-header {
      border-bottom: 1px solid #e0e0e0;
      padding: 20px;
      margin: -16px -16px 0 -16px;
      background: #fafafa;
    }

    .settings-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .settings-card mat-card-title mat-icon {
      color: #d71920;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .setting-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .setting-row.toggle {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .label-section {
      flex: 1;
    }

    .setting-label {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.4;
    }

    .help-text {
      font-size: 12px;
      color: #999;
      margin: 4px 0 0 0;
    }

    .full-width {
      width: 100%;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }

    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .info-row .label {
      color: #666;
      font-weight: 500;
      line-height: 1.4;
    }

    .info-row .value {
      color: #1a1a1a;
      font-weight: 600;
      line-height: 1.4;
    }

    .status-active {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #4caf50;
    }

    .status-active mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .action-buttons button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .admin-tabs {
      margin-top: 24px;
    }

    .tab-icon {
      margin-right: 8px;
    }

    .users-container {
      padding: 12px 0 8px;
    }

    .users-card {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .users-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      margin: 0;
      background: #fafafa;
    }

    .users-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .users-card mat-card-title mat-icon {
      color: #d71920;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .add-user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      font-size: 14px;
      font-weight: 500;
    }

    .add-user-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .users-table {
      width: 100%;
      margin-top: 0;
      table-layout: fixed;
      word-break: break-word;
      font-size: 14px;
    }

    .users-table th {
      background: #f5f5f5;
      color: #1a1a1a;
      font-weight: 600;
      padding: 12px 16px;
      text-align: left;
      white-space: normal;
      font-size: 13px;
    }

    .users-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      white-space: normal;
      vertical-align: middle;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
      line-height: 1.4;
    }

    .role-superadmin {
      background: #fff3cd;
      color: #856404;
    }

    .role-broker {
      background: #d4edff;
      color: #0c5aa0;
    }

    .role-carrier {
      background: #d4edda;
      color: #155724;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      line-height: 1.4;
    }

    .status-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .action-btn {
      color: #d71920;
      padding: 4px;
    }

    .action-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .action-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .delete-action {
      color: #d71920 !important;
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

    @media (max-width: 768px) {
      .admin-container {
        padding: 16px;
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
        justify-content: center;
      }

      .users-card mat-card-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .add-user-btn {
        width: 100%;
        justify-content: center;
      }

      .users-table {
        font-size: 12px;
      }

      .users-table td {
        padding: 8px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private emailService = inject(EmailService);

  currentUser = this.authService.getCurrentUser();
  lastUpdated = new Date();

  displayedColumns: string[] = ['email', 'name', 'role', 'status', 'lastLogin', 'actions'];
  systemUsers: SystemUser[] = [];

  appSettings: AppSettings = {
    maintenanceMode: false,
    apiEndpoint: 'http://localhost:5000',
    appName: 'TMS - Truckstop Management System',
    logRetentionDays: 30,
    maxUploadSizeMB: 100,
    enableNotifications: true,
    sessionTimeoutMinutes: 30
  };

  private defaultSettings = JSON.parse(JSON.stringify(this.appSettings));

  ngOnInit(): void {
    this.loadSystemUsers();
  }

  loadSystemUsers(): void {
    // Load mock users from localStorage or create sample data
    const savedUsers = localStorage.getItem('systemUsers');
    if (savedUsers) {
      this.systemUsers = JSON.parse(savedUsers);
    } else {
      // Create sample users for demo
      this.systemUsers = [
        {
          id: '1',
          email: 'superadmin@example.com',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SuperAdmin' as UserRole,
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'broker@example.com',
          firstName: 'Broker',
          lastName: 'User',
          role: 'Broker' as UserRole,
          isActive: true,
          lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          email: 'carrier@example.com',
          firstName: 'Carrier',
          lastName: 'User',
          role: 'Carrier' as UserRole,
          isActive: true,
          lastLoginAt: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      this.saveUsers();
    }
  }

  saveUsers(): void {
    localStorage.setItem('systemUsers', JSON.stringify(this.systemUsers));
  }

  impersonateUser(user: SystemUser): void {
    if (user.id === this.currentUser?.id) {
      this.snackBar.open('Cannot impersonate yourself', 'Close', { duration: 3000 });
      return;
    }

    const impersonatedAuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      carrierId: user.id
    } as const;

    const actualUser = this.currentUser;
    if (!actualUser) {
      this.snackBar.open('No current user to impersonate from', 'Close', { duration: 3000 });
      return;
    }

    const impersonationData = {
      actualUser,
      impersonatedUser: impersonatedAuthUser
    };

    this.authService.setImpersonation(impersonationData);
    this.authService.setCurrentUser(impersonatedAuthUser);

    this.snackBar.open(`Now impersonating ${user.firstName} ${user.lastName}`, 'Undo', { duration: 5000 })
      .onAction()
      .subscribe(() => this.stopImpersonation());

    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  stopImpersonation(): void {
    this.authService.endImpersonation();
    this.snackBar.open('Impersonation ended', 'Close', { duration: 3000 });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  toggleUserStatus(user: SystemUser): void {
    user.isActive = !user.isActive;
    this.saveUsers();
    this.snackBar.open(
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      'Close',
      { duration: 3000 }
    );
  }

  deleteUser(user: SystemUser): void {
    if (confirm(`Are you sure you want to delete ${user.email}?`)) {
      this.systemUsers = this.systemUsers.filter(u => u.id !== user.id);
      this.saveUsers();
      this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
    }
  }

  saveSettings(): void {
    localStorage.setItem('appSettings', JSON.stringify(this.appSettings));
    this.lastUpdated = new Date();
    this.snackBar.open('Settings saved successfully!', 'Close', { duration: 3000 });
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset to default settings?')) {
      this.appSettings = JSON.parse(JSON.stringify(this.defaultSettings));
      this.snackBar.open('Settings reset to defaults', 'Close', { duration: 3000 });
    }
  }

  addUser(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '480px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe((result: SystemUserPayload | undefined) => {
      if (!result) {
        return;
      }

      const newUser: SystemUser = {
        id: Date.now().toString(),
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role,
        isActive: result.isActive,
        lastLoginAt: undefined,
        createdAt: new Date().toISOString()
      };

      this.systemUsers = [...this.systemUsers, newUser];
      this.saveUsers();

      // Send welcome email to new user
      const tempPassword = Math.random().toString(36).substring(2, 15);
      this.emailService.sendWelcomeEmail(result.email, result.firstName, result.lastName, tempPassword)
        .subscribe({
          next: () => {
            this.snackBar.open(
              `User added successfully. Welcome email sent to ${result.email}`,
              'Close',
              { duration: 5000 }
            );
          },
          error: () => {
            this.snackBar.open('User added, but email could not be sent', 'Close', { duration: 3000 });
          }
        });
    });
  }

  editUser(user: SystemUser): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '480px',
      data: { mode: 'edit', user }
    });

    dialogRef.afterClosed().subscribe((result: SystemUserPayload | undefined) => {
      if (!result) {
        return;
      }

      const updatedUsers = this.systemUsers.map(u =>
        u.id === user.id
          ? {
              ...u,
              email: result.email,
              firstName: result.firstName,
              lastName: result.lastName,
              role: result.role,
              isActive: result.isActive
            }
          : u
      );

      this.systemUsers = updatedUsers;
      this.saveUsers();
      this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
    });
  }

  resetUserPassword(user: SystemUser): void {
    const dialogRef = this.dialog.open(PasswordResetDialogComponent, {
      width: '480px',
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

    dialogRef.afterClosed().subscribe((result: { action: string } | undefined) => {
      if (!result || result.action !== 'send-reset') {
        return;
      }

      const resetToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken)
        .subscribe({
          next: () => {
            this.snackBar.open(
              `Password reset link sent to ${user.email}`,
              'Close',
              { duration: 5000 }
            );
          },
          error: () => {
            this.snackBar.open('Could not send password reset email', 'Close', { duration: 3000 });
          }
        });
    });
  }
}
