import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard.page';
import { LoadBoardPage } from './pages/load-board.page';
import { LoadDetailsPage } from './pages/load-details.page';
import { PostLoadPage } from './pages/post-load.page';
import { ProfilePage } from './pages/profile.page';
import { SettingsPage } from './pages/settings.page';
import { MarketplacePage } from './pages/marketplace.page';
import { NotificationsPage } from './pages/notifications/notifications.page';
import { DocumentsPage } from './pages/documents/documents.page';
import { CreateInvoiceComponent } from './pages/invoices/create-invoice.component';
import { InvoicesListComponent } from './pages/invoices/invoices-list.component';
import { InvoiceViewComponent } from './pages/invoices/invoice-view.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { DispatchDashboardComponent } from './pages/dispatch-dashboard.component';
import { LiveTrackingDashboardComponent } from './pages/live-tracking-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Register' } },
  
  // Dashboard and general routes
  { path: 'dashboard', component: DashboardPage, canActivate: [AuthGuard], data: { title: 'Dashboard' } },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard], data: { title: 'Profile' } },
  { path: 'notifications', component: NotificationsPage, canActivate: [AuthGuard], data: { title: 'Notifications' } },
  { path: 'documents', component: DocumentsPage, canActivate: [AuthGuard], data: { title: 'Documents' } },

  // Broker-specific routes (Post Load)
  { path: 'post-load', component: PostLoadPage, canActivate: [AuthGuard, RoleGuard], data: { title: 'Post a Load', roles: ['Broker'] } },

  // Carrier-specific routes (Load Board)
  { path: 'load-board', component: LoadBoardPage, canActivate: [AuthGuard, RoleGuard], data: { title: 'Load Board', roles: ['Carrier', 'Broker', 'SuperAdmin'] } },
  { path: 'load-details/:id', component: LoadDetailsPage, canActivate: [AuthGuard, RoleGuard], data: { title: 'Load Details', roles: ['Carrier', 'Broker', 'SuperAdmin'] } },

  // Dispatch routes (Broker and SuperAdmin)
  { path: 'dispatch', component: DispatchDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Dispatch Management', roles: ['Broker', 'SuperAdmin'] } },

  // Real-time tracking (Broker, Carrier, SuperAdmin)
  { path: 'tracking', component: LiveTrackingDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Live Tracking', roles: ['Broker', 'Carrier', 'SuperAdmin'] } },

  // User settings (available to all authenticated users)
  { path: 'settings', component: SettingsPage, canActivate: [AuthGuard], data: { title: 'Settings' } },
  { path: 'marketplace', component: MarketplacePage, canActivate: [AuthGuard], data: { title: 'Marketplace' } },

  // Invoice routes (available to Broker and SuperAdmin)
  { path: 'invoices', component: InvoicesListComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Invoices', roles: ['Broker', 'SuperAdmin'] } },
  { path: 'invoices/create', component: CreateInvoiceComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Create Invoice', roles: ['Broker', 'SuperAdmin'] } },
  { path: 'invoices/view/:id', component: InvoiceViewComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'View Invoice', roles: ['Broker', 'SuperAdmin'] } },
  { path: 'invoices/edit/:id', component: CreateInvoiceComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Edit Invoice', roles: ['Broker', 'SuperAdmin'] } },

  // Admin routes (SuperAdmin only)
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'System Administration', roles: ['SuperAdmin'] } },
];
