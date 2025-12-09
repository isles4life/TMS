import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone?: string;
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoices$ = new BehaviorSubject<Invoice[]>([]);
  private nextInvoiceNumber = 1001;

  constructor() {
    this.loadInvoices();
  }

  private loadInvoices() {
    const stored = localStorage.getItem('invoices');
    if (stored) {
      const invoices = JSON.parse(stored) as Invoice[];
      invoices.forEach(inv => {
        inv.date = new Date(inv.date);
        inv.dueDate = new Date(inv.dueDate);
        inv.createdAt = new Date(inv.createdAt);
        inv.updatedAt = new Date(inv.updatedAt);
      });
      this.invoices$.next(invoices);
      const maxNum = Math.max(...invoices.map(i => parseInt(i.invoiceNumber)), 1000);
      this.nextInvoiceNumber = maxNum + 1;
    } else {
      this.initMockData();
    }
  }

  private initMockData() {
    const mockInvoices: Invoice[] = [
      {
        id: 'inv-001',
        invoiceNumber: '1001',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'paid',
        clientName: 'ABC Transport Co.',
        clientEmail: 'billing@abctransport.com',
        clientAddress: '123 Commerce St, Chicago, IL 60601',
        clientPhone: '(312) 555-0100',
        companyName: 'Your Logistics LLC',
        companyAddress: '456 Business Ave, New York, NY 10001',
        companyPhone: '(212) 555-0200',
        companyEmail: 'billing@yourlogistics.com',
        lineItems: [
          { id: 'li-1', description: 'Freight Forwarding - Load #12340', quantity: 1, unitPrice: 2500, amount: 2500 },
          { id: 'li-2', description: 'Handling Fee', quantity: 1, unitPrice: 150, amount: 150 }
        ],
        subtotal: 2650,
        taxRate: 0.08,
        taxAmount: 212,
        total: 2862,
        notes: 'Payment received on time. Thank you for your business.',
        paymentTerms: 'Net 30',
        currency: 'USD',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'inv-002',
        invoiceNumber: '1002',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        status: 'sent',
        clientName: 'XYZ Distribution',
        clientEmail: 'accounts@xyzdist.com',
        clientAddress: '789 Industrial Blvd, Los Angeles, CA 90001',
        clientPhone: '(213) 555-0300',
        companyName: 'Your Logistics LLC',
        companyAddress: '456 Business Ave, New York, NY 10001',
        companyPhone: '(212) 555-0200',
        companyEmail: 'billing@yourlogistics.com',
        lineItems: [
          { id: 'li-3', description: 'Freight Forwarding - Load #12345', quantity: 1, unitPrice: 3200, amount: 3200 },
          { id: 'li-4', description: 'Delivery Confirmation', quantity: 1, unitPrice: 75, amount: 75 }
        ],
        subtotal: 3275,
        taxRate: 0.08,
        taxAmount: 262,
        total: 3537,
        paymentTerms: 'Net 30',
        currency: 'USD',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];
    
    this.invoices$.next(mockInvoices);
    this.saveInvoices();
    this.nextInvoiceNumber = 1003;
  }

  private saveInvoices() {
    localStorage.setItem('invoices', JSON.stringify(this.invoices$.value));
  }

  getInvoices(): Observable<Invoice[]> {
    return this.invoices$.asObservable();
  }

  getInvoiceById(id: string): Invoice | null {
    return this.invoices$.value.find(inv => inv.id === id) || null;
  }

  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: this.nextInvoiceNumber.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.nextInvoiceNumber++;
    const invoices = [...this.invoices$.value, newInvoice];
    this.invoices$.next(invoices);
    this.saveInvoices();
    
    return newInvoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const invoices = this.invoices$.value.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          ...updates,
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          createdAt: inv.createdAt,
          updatedAt: new Date()
        };
      }
      return inv;
    });
    
    const updated = invoices.find(inv => inv.id === id);
    if (updated) {
      this.invoices$.next(invoices);
      this.saveInvoices();
    }
    
    return updated || null;
  }

  deleteInvoice(id: string): boolean {
    const invoices = this.invoices$.value.filter(inv => inv.id !== id);
    if (invoices.length < this.invoices$.value.length) {
      this.invoices$.next(invoices);
      this.saveInvoices();
      return true;
    }
    return false;
  }

  updateInvoiceStatus(id: string, status: Invoice['status']): Invoice | null {
    return this.updateInvoice(id, { status });
  }

  calculateLineItemAmount(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  calculateTotals(lineItems: InvoiceLineItem[], taxRate: number): { subtotal: number; taxAmount: number; total: number } {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  }

  getInvoicesByStatus(status: Invoice['status']): Invoice[] {
    return this.invoices$.value.filter(inv => inv.status === status);
  }

  getInvoicesByClient(clientName: string): Invoice[] {
    return this.invoices$.value.filter(inv => inv.clientName.toLowerCase().includes(clientName.toLowerCase()));
  }

  getUnpaidInvoices(): Invoice[] {
    return this.invoices$.value.filter(inv => !['paid', 'cancelled'].includes(inv.status));
  }

  getTotalRevenue(): number {
    return this.invoices$.value
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
  }

  getOverdueInvoices(): Invoice[] {
    const now = new Date();
    return this.invoices$.value.filter(inv => 
      inv.dueDate < now && !['paid', 'cancelled'].includes(inv.status)
    );
  }
}
