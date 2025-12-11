import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { InvoiceService, Invoice } from './invoice.service';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './invoices-list.component.html',
  styleUrls: ['./invoices-list.component.scss']
})
export class InvoicesListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedStatus = 'all';
  searchQuery = '';
  
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  statusOptions = [
    { value: 'all', label: 'All Invoices' },
    { value: 'draft', label: 'Drafts' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoiceService.getInvoices().subscribe(invoices => {
      this.invoices = invoices;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = this.invoices;

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(inv => inv.status === this.selectedStatus);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.clientName.toLowerCase().includes(query) ||
        inv.invoiceNumber.includes(query) ||
        inv.clientEmail.toLowerCase().includes(query)
      );
    }

    this.filteredInvoices = filtered;
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'draft': 'accent',
      'sent': 'primary',
      'viewed': 'accent',
      'paid': 'success',
      'overdue': 'warn',
      'cancelled': 'disabled'
    };
    return statusColors[status] || 'primary';
  }

  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'draft': 'edit',
      'sent': 'mail',
      'viewed': 'visibility',
      'paid': 'check_circle',
      'overdue': 'warning',
      'cancelled': 'close'
    };
    return statusIcons[status] || 'description';
  }

  viewInvoice(invoiceId: string): void {
    this.router.navigate(['/invoices/view', invoiceId]);
  }

  editInvoice(invoiceId: string): void {
    this.router.navigate(['/invoices/edit', invoiceId]);
  }

  deleteInvoice(invoiceId: string, invoiceNumber: string): void {
    if (confirm(`Are you sure you want to delete invoice #${invoiceNumber}?`)) {
      if (this.invoiceService.deleteInvoice(invoiceId)) {
        this.snackBar.open(`Invoice #${invoiceNumber} deleted successfully`, 'Close', { duration: 3000 });
        this.loadInvoices();
      }
    }
  }

  duplicateInvoice(invoice: Invoice): void {
    const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
      invoiceNumber: '',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      clientPhone: invoice.clientPhone,
      companyName: invoice.companyName,
      companyAddress: invoice.companyAddress,
      companyPhone: invoice.companyPhone,
      companyEmail: invoice.companyEmail,
      lineItems: invoice.lineItems.map(item => ({ ...item, id: `li-${Date.now()}` })),
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      paymentTerms: invoice.paymentTerms,
      bankDetails: invoice.bankDetails,
      currency: invoice.currency
    };

    const created = this.invoiceService.createInvoice(newInvoice);
    this.snackBar.open(`Invoice duplicated as #${created.invoiceNumber}`, 'Close', { duration: 3000 });
    this.loadInvoices();
  }

  updateStatus(invoiceId: string, newStatus: Invoice['status'], invoiceNumber: string): void {
    this.invoiceService.updateInvoiceStatus(invoiceId, newStatus);
    this.snackBar.open(`Invoice #${invoiceNumber} status updated to ${newStatus}`, 'Close', { duration: 3000 });
    this.loadInvoices();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  }

  getStats() {
    return {
      totalInvoices: this.invoices.length,
      totalRevenue: this.invoiceService.getTotalRevenue(),
      unpaidCount: this.invoiceService.getUnpaidInvoices().length,
      overdueCount: this.invoiceService.getOverdueInvoices().length
    };
  }
}
