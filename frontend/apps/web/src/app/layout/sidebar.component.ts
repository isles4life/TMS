import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'ts-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <div class="sidebar">
      <div class="sidebar__header">
        <img src="/assets/Waypoint Default.png" alt="Truckstop" class="sidebar-logo" onerror="this.style.display='none'" />
        <button mat-icon-button class="close" (click)="closed.emit()" aria-label="Close navigation">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <mat-nav-list class="nav-list">
        <a mat-list-item *ngFor="let item of items" [routerLink]="item.path" routerLinkActive="active" class="nav-item">
          <div class="nav-content">
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </a>
      </mat-nav-list>
      <div class="sidebar__footer">
        <a mat-stroked-button color="primary" fullWidth href="https://truckstop.com/contact-us/" target="_blank" rel="noopener noreferrer">Support</a>
        <button 
          *ngIf="isAuthenticated$ | async as user; else loginBtn" 
          mat-flat-button 
          color="warn" 
          fullWidth
          (click)="logout()">
          <mat-icon>logout</mat-icon>
          Log Out
        </button>
        <ng-template #loginBtn>
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
        </ng-template>
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
      background: #fff;
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
      color: var(--ts-stone);
    }
    .nav-label {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: var(--ts-ink);
    }
    a.active {
      background: rgba(215,25,32,0.08);
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
  `]
})
export class SidebarComponent {
  @Input() items: NavItem[] = [];
  @Output() closed = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closed.emit();
  }
}
