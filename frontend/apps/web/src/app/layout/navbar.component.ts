import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '../services/notification.service';
import { AuthService, ImpersonationData } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ts-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <div class="ts-nav-wrapper">
      <button mat-icon-button class="nav-toggle" (click)="menu.emit()" aria-label="Open navigation">
        <mat-icon>menu</mat-icon>
      </button>
      <button class="brand-logo-btn" routerLink="/dashboard" aria-label="Go to dashboard">
        <img src="assets/truckstop-logo-optimized.png" alt="Truckstop" class="brand-logo" width="211" height="50" />
      </button>
      <span class="spacer"></span>
      <button mat-icon-button (click)="toggleTheme()" [attr.aria-label]="'Toggle ' + (themeService.getTheme() === 'light' ? 'dark' : 'light') + ' mode'" title="Toggle dark mode" class="theme-toggle-btn">
        <mat-icon>{{ themeService.getTheme() === 'light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
      </button>
      <button mat-icon-button routerLink="/notifications" aria-label="Notifications" class="notification-btn">
        <mat-icon [matBadge]="(unreadCount$ | async) || 0" 
                  [matBadgeHidden]="(unreadCount$ | async) === 0"
                  matBadgeColor="warn"
                  matBadgeSize="small"
                  aria-hidden="false">notifications</mat-icon>
      </button>
      <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu" class="profile-btn">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item routerLink="/notifications">
          <mat-icon>notifications</mat-icon>
          <span>Notifications</span>
        </button>
        <button mat-menu-item routerLink="/profile">Profile</button>
        <button mat-menu-item routerLink="/settings">Settings</button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign out</span>
        </button>
      </mat-menu>
    </div>
    @if (impersonation$ | async; as imp) {
      <div class="impersonation-banner">
        <div class="impersonation-text">
          <mat-icon>switch_account</mat-icon>
          <span>Impersonating {{ imp.impersonatedUser.firstName }} {{ imp.impersonatedUser.lastName }} ({{ imp.impersonatedUser.role }})</span>
        </div>
        <button mat-stroked-button color="accent" (click)="endImpersonation()">
          <mat-icon>close</mat-icon>
          End impersonation
        </button>
      </div>
    }
  `,
  styles: [`
    .ts-nav-wrapper {
      display: flex;
      align-items: center;
      gap: var(--ts-spacing-lg);
      padding: var(--ts-spacing-md) var(--ts-spacing-lg);
      box-shadow: 0 6px 22px rgba(0,0,0,0.18);
      background: #d71920;
      color: #fff;
      height: 64px;
    }
    .nav-toggle {
      display: inline-flex;
    }
    .brand-logo {
      height: 50px;
      width: auto;
      max-width: 200px;
      flex-shrink: 0;
      margin: 0;
      object-fit: contain;
    }
    .brand-logo-btn {
      border: none;
      background: transparent;
      padding: 0;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .spacer { flex: 1 1 auto; }
    .primary {
      background: #fff !important;
      color: var(--ts-red) !important;
      font-weight: 700;
      border-radius: 999px;
      padding: 8px 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
      white-space: nowrap;
      margin-right: var(--ts-spacing-sm);
      width: auto;
      flex-shrink: 0;
      justify-self: end;
    }
    .theme-toggle-btn {
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }
    .theme-toggle-btn:hover {
      transform: rotate(180deg);
    }
    .notification-btn {
      flex-shrink: 0;
    }
    .profile-btn {
      flex-shrink: 0;
    }
    .impersonation-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ts-spacing-md);
      padding: 8px 16px;
      background: #fff3e0;
      color: #bf360c;
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }

    .impersonation-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .impersonation-banner button {
      height: 36px;
    }
    @media (max-width: 960px) {
      .ts-nav-wrapper {
        gap: var(--ts-spacing-md);
        padding: var(--ts-spacing-sm) var(--ts-spacing-md);
      }
      .primary {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  @Output() menu = new EventEmitter<void>();
  unreadCount$: Observable<number>;
  impersonation$: Observable<ImpersonationData | null>;

  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  themeService = inject(ThemeService);

  constructor() {
    this.unreadCount$ = this.notificationService.unreadCount$;
    this.impersonation$ = this.authService.impersonation$;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  endImpersonation(): void {
    this.authService.endImpersonation();
    this.router.navigate(['/admin']);
  }
}
