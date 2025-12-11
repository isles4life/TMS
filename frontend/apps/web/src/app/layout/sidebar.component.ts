import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, UserRole, User } from '../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-ts-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="sidebar">
      <div class="sidebar__header">
        <img src="/assets/Waypoint Default.png" alt="Truckstop" class="sidebar-logo" onerror="this.style.display='none'" />
        <button mat-icon-button class="close" (click)="closed.emit()" aria-label="Close navigation">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <mat-nav-list class="nav-list">
        @for (item of getVisibleItems(); track item.path) {
          <a mat-list-item [routerLink]="item.path" routerLinkActive="active" class="nav-item">
            <div class="nav-content">
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <span class="nav-label">{{ item.label }}</span>
            </div>
          </a>
        }
      </mat-nav-list>

      <div class="sidebar__footer">
        <a mat-stroked-button color="primary" fullWidth href="https://truckstop.com/contact-us/" target="_blank" rel="noopener noreferrer">Support</a>
        @if (isAuthenticated$ | async; as user) {
          <button 
            mat-flat-button 
            color="warn" 
            fullWidth
            (click)="logout()">
            <mat-icon>logout</mat-icon>
            Log Out
          </button>
        } @else {
          <button 
            mat-flat-button 
            [style.background-color]="'#d71920'"
            [style.color]="'white'"
            fullWidth
            routerLink="/login"
            (click)="closed.emit()">
            <mat-icon>login</mat-icon>
            Log In
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--ts-spacing-lg);
      height: 100%;
      padding: var(--ts-spacing-lg);
      background: var(--ts-surface-secondary);
      border-right: 1px solid var(--ts-border);
    }
    .sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-logo {
      height: 40px;
      width: auto;
      max-width: 150px;
      object-fit: contain;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 12px;
      font-weight: 700;
      color: var(--ts-stone);
    }
    .close {
      display: inline-flex;
    }
    .nav-list {
      padding: 0 !important;
    }
    .nav-item {
      display: block !important;
      padding: 0 !important;
      margin-bottom: 4px;
      border-radius: 8px;
      overflow: visible !important;
      height: auto !important;
      min-height: 48px;
    }
    .nav-content {
      display: flex;
      align-items: center;
      gap: var(--ts-spacing-md);
      padding: 12px var(--ts-spacing-md);
      width: 100%;
    }
    .nav-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      line-height: 1;
      overflow: visible;
      color: var(--ts-ink-secondary);
    }
    .nav-label {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: var(--ts-ink);
    }
    a.active {
      background: color-mix(in oklab, var(--ts-red) 12%, transparent);
      outline: 1px solid color-mix(in oklab, var(--ts-red) 30%, var(--ts-border));
    }
    a.active .nav-icon {
      color: var(--ts-red);
    }
    a.active .nav-label {
      color: var(--ts-red);
    }
    .sidebar__footer {
      margin-top: auto;
      display: grid;
      gap: var(--ts-spacing-sm);
    }
    .sidebar__footer button {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .sidebar__footer mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      line-height: 1;
    }

    /* Dark mode explicit overrides for maximum readability */
    :root.dark-mode .sidebar {
      background: var(--ts-surface-secondary);
    }
    :root.dark-mode .nav-label {
      color: var(--ts-ink);
    }
    :root.dark-mode .nav-icon {
      color: var(--ts-ink-secondary);
    }
    :root.dark-mode a.active {
      background: color-mix(in oklab, var(--ts-red) 18%, transparent);
      outline: 1px solid color-mix(in oklab, var(--ts-red) 40%, var(--ts-border));
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() items: NavItem[] = [];
  @Output() closed = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated$ = this.authService.currentUser$;
  currentUser: User | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getVisibleItems(): NavItem[] {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    return this.items.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true; // Show items without role restrictions
      }
      return item.roles.includes(user.role as UserRole);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closed.emit();
  }
}
