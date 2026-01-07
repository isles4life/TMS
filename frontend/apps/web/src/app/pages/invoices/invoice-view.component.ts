import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvoiceService, Invoice } from './invoice.service';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './invoice-view.component.html',
  styleUrls: ['./invoice-view.component.scss']
})
export class InvoiceViewComponent implements OnInit {
  invoice: Invoice | null = null;
  invoiceId = '';

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id') || '';
    this.loadInvoice();
  }

  loadInvoice(): void {
    this.invoice = this.invoiceService.getInvoiceById(this.invoiceId);
    if (!this.invoice) {
      this.snackBar.open('Invoice not found', 'Close', { duration: 3000 });
      this.router.navigate(['/invoices']);
    }
  }

  updateStatus(newStatus: Invoice['status']): void {
    if (this.invoice) {
      this.invoiceService.updateInvoiceStatus(this.invoice.id, newStatus);
      this.invoice = this.invoiceService.getInvoiceById(this.invoiceId);
      this.snackBar.open(`Invoice status updated to ${newStatus}`, 'Close', { duration: 3000 });
    }
  }

  editInvoice(): void {
    this.router.navigate(['/invoices/edit', this.invoiceId]);
  }

  printInvoice(): void {
    window.print();
  }

  downloadInvoice(): void {
    this.snackBar.open('Download feature coming soon', 'Close', { duration: 3000 });
  }

  sendInvoice(): void {
    if (this.invoice) {
      this.updateStatus('sent');
      this.snackBar.open(`Invoice #${this.invoice.invoiceNumber} sent to ${this.invoice.clientEmail}`, 'Close', { duration: 3000 });
    }
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.invoice?.currency || 'USD'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }
}
