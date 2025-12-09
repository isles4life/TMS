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
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { AuthGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Register' } },
  { path: 'dashboard', component: DashboardPage, canActivate: [AuthGuard], data: { title: 'Dashboard' } },
  { path: 'load-board', component: LoadBoardPage, canActivate: [AuthGuard], data: { title: 'Load Board' } },
  { path: 'post-load', component: PostLoadPage, canActivate: [AuthGuard], data: { title: 'Post a Load' } },
  { path: 'load-details/:id', component: LoadDetailsPage, canActivate: [AuthGuard], data: { title: 'Load Details' } },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard], data: { title: 'Profile' } },
  { path: 'settings', component: SettingsPage, canActivate: [AuthGuard], data: { title: 'Settings' } },
  { path: 'marketplace', component: MarketplacePage, canActivate: [AuthGuard], data: { title: 'Marketplace' } },
  { path: 'notifications', component: NotificationsPage, canActivate: [AuthGuard], data: { title: 'Notifications' } },
  { path: 'documents', component: DocumentsPage, canActivate: [AuthGuard], data: { title: 'Documents' } },
  { path: 'invoices', component: InvoicesListComponent, canActivate: [AuthGuard], data: { title: 'Invoices' } },
  { path: 'invoices/create', component: CreateInvoiceComponent, canActivate: [AuthGuard], data: { title: 'Create Invoice' } },
  { path: 'invoices/view/:id', component: InvoiceViewComponent, canActivate: [AuthGuard], data: { title: 'View Invoice' } },
  { path: 'invoices/edit/:id', component: CreateInvoiceComponent, canActivate: [AuthGuard], data: { title: 'Edit Invoice' } },
];
