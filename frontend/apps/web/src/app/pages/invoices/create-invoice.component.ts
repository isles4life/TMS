import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { InvoiceService, Invoice, InvoiceLineItem } from './invoice.service';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit {
  invoiceForm!: FormGroup;
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  
  constructor(
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);

    this.invoiceForm = this.formBuilder.group({
      // Client Information
      clientName: ['', [Validators.required, Validators.minLength(2)]],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientAddress: ['', Validators.required],
      clientPhone: [''],
      
      // Company Information
      companyName: ['Your Logistics LLC', Validators.required],
      companyAddress: ['456 Business Ave, New York, NY 10001', Validators.required],
      companyPhone: ['(212) 555-0200', Validators.required],
      companyEmail: ['billing@yourlogistics.com', [Validators.required, Validators.email]],
      
      // Invoice Details
      date: [today, Validators.required],
      dueDate: [dueDate, Validators.required],
      currency: ['USD', Validators.required],
      taxRate: [0.08, [Validators.required, Validators.min(0), Validators.max(1)]],
      paymentTerms: ['Net 30'],
      notes: [''],
      
      // Line Items
      lineItems: this.formBuilder.array([
        this.createLineItemFormGroup()
      ]),
      
      // Bank Details
      bankAccountName: [''],
      bankAccountNumber: [''],
      bankRoutingNumber: [''],
      bankName: ['']
    });
  }

  private createLineItemFormGroup(): FormGroup {
    return this.formBuilder.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      amount: [0, { nonNullable: true }]
    });
  }

  get lineItems(): FormArray {
    return this.invoiceForm.get('lineItems') as FormArray;
  }

  addLineItem(): void {
    this.lineItems.push(this.createLineItemFormGroup());
  }

  removeLineItem(index: number): void {
    if (this.lineItems.length > 1) {
      this.lineItems.removeAt(index);
    } else {
      this.snackBar.open('Invoice must have at least one line item', 'Close', { duration: 3000 });
    }
  }

  onLineItemChange(index: number): void {
    const item = this.lineItems.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const amount = this.invoiceService.calculateLineItemAmount(quantity, unitPrice);
    item.get('amount')?.setValue(amount, { emitEvent: false });
  }

  calculateTotals(): { subtotal: number; taxAmount: number; total: number } {
    const lineItemsArray = this.lineItems.value as InvoiceLineItem[];
    const taxRate = this.invoiceForm.get('taxRate')?.value || 0;
    return this.invoiceService.calculateTotals(lineItemsArray, taxRate);
  }

  getCalculatedTotals() {
    return this.calculateTotals();
  }

  createInvoice(): void {
    if (!this.invoiceForm.valid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.invoiceForm.value;
    const totals = this.calculateTotals();
    
    const lineItems: InvoiceLineItem[] = formValue.lineItems.map((item: { description: string; quantity: number; unitPrice: number; amount: number }, index: number) => ({
      id: `li-${Date.now()}-${index}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount
    }));

    const bankDetails = (formValue.bankAccountName && formValue.bankAccountNumber) ? {
      accountName: formValue.bankAccountName,
      accountNumber: formValue.bankAccountNumber,
      routingNumber: formValue.bankRoutingNumber,
      bankName: formValue.bankName
    } : undefined;

    const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
      invoiceNumber: '',
      date: new Date(formValue.date),
      dueDate: new Date(formValue.dueDate),
      status: 'draft',
      clientName: formValue.clientName,
      clientEmail: formValue.clientEmail,
      clientAddress: formValue.clientAddress,
      clientPhone: formValue.clientPhone || undefined,
      companyName: formValue.companyName,
      companyAddress: formValue.companyAddress,
      companyPhone: formValue.companyPhone,
      companyEmail: formValue.companyEmail,
      lineItems,
      subtotal: totals.subtotal,
      taxRate: formValue.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      notes: formValue.notes || undefined,
      paymentTerms: formValue.paymentTerms || undefined,
      bankDetails,
      currency: formValue.currency
    };

    const createdInvoice = this.invoiceService.createInvoice(newInvoice);
    this.snackBar.open(`Invoice #${createdInvoice.invoiceNumber} created successfully!`, 'Close', { duration: 3000 });
    this.router.navigate(['/invoices']);
  }

  resetForm(): void {
    this.invoiceForm.reset();
    this.initializeForm();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.invoiceForm.get('currency')?.value || 'USD'
    }).format(value);
  }
}
