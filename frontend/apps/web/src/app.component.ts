import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from './app/layout/navbar.component';
import { SidebarComponent } from './app/layout/sidebar.component';

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
  navItems = [
    { label: 'Dashboard', icon: 'space_dashboard', path: '/dashboard' },
    { label: 'Load Board', icon: 'table_chart', path: '/load-board' },
    { label: 'Load Details', icon: 'description', path: '/load-details' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
    { label: 'Login', icon: 'login', path: '/login' },
  ];

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint
      .observe(['(max-width: 960px)'])
      .pipe(takeUntilDestroyed())
      .subscribe(result => this.isMobile = result.matches);
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
