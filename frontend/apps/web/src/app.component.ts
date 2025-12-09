import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './app/layout/navbar.component';
import { SidebarComponent } from './app/layout/sidebar.component';
import { AuthService } from './app/services/auth.service';

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
  navItemsBase = [
    { label: 'Dashboard', icon: 'space_dashboard', path: '/dashboard' },
    { label: 'Load Board', icon: 'table_chart', path: '/load-board' },
    { label: 'Settings', icon: 'settings', path: '/settings' }
  ];
  navItems = [...this.navItemsBase, { label: 'Login', icon: 'login', path: '/login' }];

  private authService = inject(AuthService);

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint
      .observe(['(max-width: 960px)'])
      .pipe(takeUntilDestroyed())
      .subscribe(result => this.isMobile = result.matches);

    // Hide login link when authenticated
    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        this.navItems = user
          ? [...this.navItemsBase]
          : [...this.navItemsBase, { label: 'Login', icon: 'login', path: '/login' }];
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
