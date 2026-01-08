import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './app/layout/navbar.component';
import { SidebarComponent } from './app/layout/sidebar.component';
import { AuthService, UserRole } from './app/services/auth.service';
import { ThemeService } from './app/services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, NavbarComponent, SidebarComponent],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav #sidenav class="ts-sidenav" [mode]="isMobile ? 'over' : 'side'" [opened]="isMobile ? false : sidenavOpened">
        <app-ts-sidebar [items]="navItems" (closed)="closeNav()"></app-ts-sidebar>
      </mat-sidenav>

      <mat-sidenav-content>
        <app-ts-navbar (menu)="toggleNav()"></app-ts-navbar>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('sidenav') sidenav?: MatSidenav;
  isMobile = false;
  sidenavOpened = false;

  // All available navigation items with their role restrictions
  navItemsBase: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', path: '/dashboard' },
    { label: 'Load Board', icon: 'table_chart', path: '/load-board', roles: ['Carrier'] },
    { label: 'Post Load', icon: 'upload_file', path: '/post-load', roles: ['Broker'] },
    { label: 'Dispatch', icon: 'local_shipping', path: '/dispatch', roles: ['Broker', 'SuperAdmin'] },
    { label: 'Live Tracking', icon: 'gps_fixed', path: '/tracking', roles: ['Broker', 'Carrier', 'SuperAdmin'] },
    { label: 'Analytics', icon: 'analytics', path: '/analytics', roles: ['Broker', 'SuperAdmin'] },
    { label: 'Invoices', icon: 'receipt_long', path: '/invoices', roles: ['Broker', 'SuperAdmin'] },
    { label: 'Documents', icon: 'description', path: '/documents' },
    { label: 'Marketplace', icon: 'store', path: '/marketplace' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
    { label: 'System Admin', icon: 'admin_panel_settings', path: '/admin', roles: ['SuperAdmin'] }
  ];

  navItems: NavItem[] = [];

  constructor(
    private authService: AuthService,
    private breakpoint: BreakpointObserver,
    private themeService: ThemeService
  ) {
    // Initialize theme service on app startup
    this.themeService;
    this.breakpoint
      .observe(['(max-width: 960px)'])
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Update nav items based on authentication and role
    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        if (user) {
          this.navItems = this.navItemsBase;
          // Open sidebar by default on desktop when user is logged in
          if (!this.isMobile && this.sidenav) {
            this.sidenav.open();
            this.sidenavOpened = true;
          }
        } else {
          this.navItems = [...this.navItemsBase, { label: 'Login', icon: 'login', path: '/login' }];
          // Close sidebar when user logs out
          if (this.sidenav) {
            this.sidenav.close();
            this.sidenavOpened = false;
          }
        }
      });
  }

  toggleNav() {
    if (this.sidenav) {
      this.sidenav.toggle();
      this.sidenavOpened = this.sidenav.opened;
    }
  }

  closeNav() {
    if (this.sidenav?.opened) {
      this.sidenav.close();
      this.sidenavOpened = false;
    }
  }
}
