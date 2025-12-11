import { Routes } from '@angular/router';
// Keep lightweight components eagerly imported; lazy-load heavier pages via loadComponent.
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Register' } },
  
  // Dashboard and general routes
  { path: 'dashboard', canActivate: [AuthGuard], data: { title: 'Dashboard' }, loadComponent: () => import('./pages/dashboard.page').then(m => m.DashboardPage) },
  { path: 'profile', canActivate: [AuthGuard], data: { title: 'Profile' }, loadComponent: () => import('./pages/profile.page').then(m => m.ProfilePage) },
  { path: 'notifications', canActivate: [AuthGuard], data: { title: 'Notifications' }, loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage) },
  { path: 'documents', canActivate: [AuthGuard], data: { title: 'Documents' }, loadComponent: () => import('./pages/documents/documents.page').then(m => m.DocumentsPage) },

  // Broker-specific routes (Post Load)
  { path: 'post-load', canActivate: [AuthGuard, RoleGuard], data: { title: 'Post a Load', roles: ['Broker'] }, loadComponent: () => import('./pages/post-load.page').then(m => m.PostLoadPage) },

  // Carrier-specific routes (Load Board)
  { path: 'load-board', canActivate: [AuthGuard, RoleGuard], data: { title: 'Load Board', roles: ['Carrier', 'Broker', 'SuperAdmin'] }, loadComponent: () => import('./pages/load-board.page').then(m => m.LoadBoardPage) },
  { path: 'load-details/:id', canActivate: [AuthGuard, RoleGuard], data: { title: 'Load Details', roles: ['Carrier', 'Broker', 'SuperAdmin'] }, loadComponent: () => import('./pages/load-details.page').then(m => m.LoadDetailsPage) },

  // Dispatch routes (Broker and SuperAdmin)
  { path: 'dispatch', canActivate: [AuthGuard, RoleGuard], data: { title: 'Dispatch Management', roles: ['Broker', 'SuperAdmin'] }, loadComponent: () => import('./pages/dispatch-dashboard.component').then(m => m.DispatchDashboardComponent) },

  // Real-time tracking (Broker, Carrier, SuperAdmin)
  { path: 'tracking', canActivate: [AuthGuard, RoleGuard], data: { title: 'Live Tracking', roles: ['Broker', 'Carrier', 'SuperAdmin'] }, loadComponent: () => import('./pages/live-tracking-dashboard.component').then(m => m.LiveTrackingDashboardComponent) },

  // User settings (available to all authenticated users)
  { path: 'settings', canActivate: [AuthGuard], data: { title: 'Settings' }, loadComponent: () => import('./pages/settings.page').then(m => m.SettingsPage) },
  { path: 'marketplace', canActivate: [AuthGuard], data: { title: 'Marketplace' }, loadComponent: () => import('./pages/marketplace.page').then(m => m.MarketplacePage) },

  // Invoice routes (available to Broker and SuperAdmin)
  { path: 'invoices', canActivate: [AuthGuard, RoleGuard], data: { title: 'Invoices', roles: ['Broker', 'SuperAdmin'] }, loadComponent: () => import('./pages/invoices/invoices-list.component').then(m => m.InvoicesListComponent) },
  { path: 'invoices/create', canActivate: [AuthGuard, RoleGuard], data: { title: 'Create Invoice', roles: ['Broker', 'SuperAdmin'] }, loadComponent: () => import('./pages/invoices/create-invoice.component').then(m => m.CreateInvoiceComponent) },
  { path: 'invoices/view/:id', canActivate: [AuthGuard, RoleGuard], data: { title: 'View Invoice', roles: ['Broker', 'SuperAdmin'] }, loadComponent: () => import('./pages/invoices/invoice-view.component').then(m => m.InvoiceViewComponent) },
  { path: 'invoices/edit/:id', canActivate: [AuthGuard, RoleGuard], data: { title: 'Edit Invoice', roles: ['Broker', 'SuperAdmin'] }, loadComponent: () => import('./pages/invoices/create-invoice.component').then(m => m.CreateInvoiceComponent) },

  // Admin routes (SuperAdmin only)
  { path: 'admin', canActivate: [AuthGuard, RoleGuard], data: { title: 'System Administration', roles: ['SuperAdmin'] }, loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
];
