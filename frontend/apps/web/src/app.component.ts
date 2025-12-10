import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './app/layout/navbar.component';
import { SidebarComponent } from './app/layout/sidebar.component';
import { AuthService, UserRole } from './app/services/auth.service';

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
      <mat-sidenav #sidenav class="ts-sidenav" [mode]="isMobile ? 'over' : 'side'" [opened]="!isMobile">
        <ts-sidebar [items]="navItems" (closed)="closeNav()"></ts-sidebar>
      </mat-sidenav>

      <mat-sidenav-content>
        <ts-navbar (menu)="toggleNav()"></ts-navbar>
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

  // All available navigation items with their role restrictions
  navItemsBase: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', path: '/dashboard' },
    { label: 'Load Board', icon: 'table_chart', path: '/load-board', roles: ['Carrier'] },
    { label: 'Post Load', icon: 'upload_file', path: '/post-load', roles: ['Broker'] },
    { label: 'Invoices', icon: 'receipt_long', path: '/invoices', roles: ['Broker', 'SuperAdmin'] },
    { label: 'Documents', icon: 'description', path: '/documents' },
    { label: 'Marketplace', icon: 'store', path: '/marketplace' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
    { label: 'System Admin', icon: 'admin_panel_settings', path: '/admin', roles: ['SuperAdmin'] }
  ];

  navItems: NavItem[] = [];

  private authService = inject(AuthService);

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint
      .observe(['(max-width: 960px)'])
      .pipe(takeUntilDestroyed())
      .subscribe(result => this.isMobile = result.matches);

    // Update nav items based on authentication and role
    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        if (user) {
          this.navItems = this.navItemsBase;
        } else {
          this.navItems = [...this.navItemsBase, { label: 'Login', icon: 'login', path: '/login' }];
        }
      });
  }

  toggleNav() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  closeNav() {
    if (this.sidenav?.opened) {
      this.sidenav.close();
    }
  }
}
