# Invoices Module Documentation

## Overview

The Invoices Module provides a comprehensive invoice management system for the TMS (Transportation Management System) application. It allows users to create, manage, view, and track invoices with detailed line items, client information, and automatic calculations.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Components](#components)
- [Services](#services)
- [Data Models](#data-models)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Styling & UI](#styling--ui)
- [State Management](#state-management)
- [Integration Points](#integration-points)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

### Core Functionality

✅ **Create Custom Invoices**
- Drag-and-drop friendly form interface
- Dynamic line items with add/remove capabilities
- Automatic calculations for subtotal, tax, and total
- Support for multiple currencies
- Client information management
- Company branding options
- Payment terms and bank details

✅ **Invoice Management**
- List all invoices with filtering
- Search by client name, invoice number, or email
- Status tracking (Draft, Sent, Viewed, Paid, Overdue, Cancelled)
- Duplicate invoices for quick creation
- Mark invoices as sent, viewed, or paid

✅ **Invoice Viewing**
- Professional invoice PDF-ready layout
- Detailed line item breakdown
- Tax calculations display
- Client and company information
- Payment terms and bank details display
- Print-friendly styling
- Status and action tracking

✅ **Analytics & Insights**
- Total invoice count
- Total revenue (paid invoices only)
- Unpaid invoice count
- Overdue invoice count

### Advanced Features

- Real-time total calculations
- Form validation with helpful error messages
- LocalStorage persistence for offline capability
- Responsive design (mobile, tablet, desktop)
- Material Design UI components
- Status-based color coding
- Client filtering and search
- Duplicate invoice functionality

## Architecture

### Module Structure

```
pages/invoices/
├── invoice.service.ts              # Core service for invoice CRUD operations
├── create-invoice.component.ts     # Form component for creating/editing invoices
├── create-invoice.component.html   # Invoice creation form template
├── create-invoice.component.scss   # Form styling
├── invoices-list.component.ts      # List view with filtering and search
├── invoices-list.component.html    # List template with statistics
├── invoices-list.component.scss    # List styling
├── invoice-view.component.ts       # Detail view for single invoice
├── invoice-view.component.html     # Invoice display template
└── invoice-view.component.scss     # Invoice styling
```

### Data Flow

```
User → Component → Service → LocalStorage
                ↓
          Invoice State
                ↓
            Template Render
```

## Components

### 1. CreateInvoiceComponent

**Purpose:** Create and edit invoices with a comprehensive form interface

**Location:** `pages/invoices/create-invoice.component.ts`

**Key Features:**
- Dynamic form with FormBuilder and FormArray
- Line items management (add/remove)
- Real-time calculations
- Client and company information forms
- Tax rate input
- Bank details (optional)
- Form validation with error messages

**Usage:**
```typescript
// Route for creating new invoice
/invoices/create

// Route for editing existing invoice
/invoices/edit/:id
```

**Key Methods:**
- `initializeForm()` - Initializes form with default values
- `addLineItem()` - Adds new line item to form array
- `removeLineItem(index)` - Removes line item from form array
- `onLineItemChange(index)` - Updates line item amount on quantity/price change
- `calculateTotals()` - Computes subtotal, tax, and total
- `createInvoice()` - Validates and saves invoice
- `resetForm()` - Clears form and reinitializes
- `formatCurrency(value)` - Formats values as currency

### 2. InvoicesListComponent

**Purpose:** Display and manage all invoices with filtering and search

**Location:** `pages/invoices/invoices-list.component.ts`

**Key Features:**
- Statistics cards (total invoices, revenue, unpaid, overdue)
- Search bar with real-time filtering
- Status filter dropdown
- Invoice cards with key information
- Action buttons (view, edit, duplicate)
- Status update menu
- Delete functionality with confirmation
- Empty state message

**Usage:**
```typescript
// Route for invoice list
/invoices
```

**Key Methods:**
- `loadInvoices()` - Fetches invoices from service
- `applyFilters()` - Applies search and status filters
- `onStatusChange()` - Updates status filter
- `onSearchChange()` - Updates search filter
- `viewInvoice(id)` - Navigates to invoice detail view
- `editInvoice(id)` - Navigates to edit view
- `deleteInvoice(id)` - Removes invoice after confirmation
- `duplicateInvoice(invoice)` - Creates copy with new date and draft status
- `updateStatus(id, status)` - Changes invoice status
- `getStats()` - Calculates statistics for cards

### 3. InvoiceViewComponent

**Purpose:** Display detailed view of a single invoice

**Location:** `pages/invoices/invoice-view.component.ts`

**Key Features:**
- Professional invoice layout
- Company header with branding
- Bill-to section with client details
- Line items table with formatting
- Totals with tax breakdown
- Bank details and payment terms
- Status display and update buttons
- Print functionality
- Sidebar with metadata and quick actions

**Usage:**
```typescript
// Route for viewing invoice
/invoices/view/:id
```

**Key Methods:**
- `loadInvoice()` - Fetches invoice by ID
- `updateStatus(status)` - Updates invoice status
- `editInvoice()` - Navigates to edit view
- `printInvoice()` - Triggers browser print dialog
- `downloadInvoice()` - Placeholder for PDF download feature
- `sendInvoice()` - Marks as sent and shows confirmation
- `getStatusColor(status)` - Returns color class for status
- `getStatusIcon(status)` - Returns icon for status
- `formatCurrency(value)` - Formats currency values
- `formatDate(date)` - Formats dates for display
- `goBack()` - Navigates back to invoice list

## Services

### InvoiceService

**Purpose:** Centralized service for invoice management and persistence

**Location:** `pages/invoices/invoice.service.ts`

**Key Features:**
- LocalStorage persistence with JSON serialization
- Observable stream for reactive updates
- Auto-generated invoice numbers
- Invoice CRUD operations
- Query methods for filtering
- Calculation helpers

**Key Methods:**

#### CRUD Operations

```typescript
// Get all invoices as observable
getInvoices(): Observable<Invoice[]>

// Get invoice by ID
getInvoiceById(id: string): Invoice | null

// Create new invoice
createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice

// Update invoice
updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null

// Delete invoice
deleteInvoice(id: string): boolean

// Update only status
updateInvoiceStatus(id: string, status: Invoice['status']): Invoice | null
```

#### Query Methods

```typescript
// Get invoices by status
getInvoicesByStatus(status: Invoice['status']): Invoice[]

// Get invoices by client name
getInvoicesByClient(clientName: string): Invoice[]

// Get all unpaid invoices
getUnpaidInvoices(): Invoice[]

// Get all overdue invoices
getOverdueInvoices(): Invoice[]
```

#### Calculation Methods

```typescript
// Calculate line item amount
calculateLineItemAmount(quantity: number, unitPrice: number): number

// Calculate totals from line items
calculateTotals(
  lineItems: InvoiceLineItem[],
  taxRate: number
): { subtotal: number; taxAmount: number; total: number }

// Get total revenue from paid invoices
getTotalRevenue(): number
```

## Data Models

### Invoice Interface

```typescript
interface Invoice {
  id: string;                          // Unique identifier
  invoiceNumber: string;               // Human-readable invoice number
  date: Date;                          // Invoice date
  dueDate: Date;                       // Payment due date
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  
  // Client Information
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone?: string;
  
  // Company Information
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  // Line Items
  lineItems: InvoiceLineItem[];
  
  // Calculations
  subtotal: number;
  taxRate: number;                     // e.g., 0.08 for 8%
  taxAmount: number;
  total: number;
  
  // Additional Information
  notes?: string;
  paymentTerms?: string;              // e.g., "Net 30"
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  currency: string;                   // e.g., "USD", "EUR"
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### InvoiceLineItem Interface

```typescript
interface InvoiceLineItem {
  id: string;                          // Unique line item ID
  description: string;                 // Item description
  quantity: number;                    // Quantity
  unitPrice: number;                   // Price per unit
  amount: number;                      // Calculated total (quantity × unitPrice)
}
```

## Usage Guide

### Creating an Invoice

1. Navigate to `/invoices/create` or click "Create New Invoice" button
2. Fill in client information:
   - Client Name (required)
   - Email Address (required)
   - Street Address (required)
   - Phone Number (optional)
3. Review/update company information (pre-filled)
4. Set invoice dates and currency
5. Add line items:
   - Click "Add Line Item" to add more
   - Enter description, quantity, and unit price
   - Amount calculates automatically
6. Set tax rate (optional)
7. Add payment terms and notes (optional)
8. Add bank details (optional)
9. Click "Create Invoice"

### Managing Invoices

**View List:**
1. Navigate to `/invoices`
2. Use search bar to find invoices by client, number, or email
3. Filter by status using dropdown
4. View statistics in header cards

**View Invoice Details:**
1. Click the eye icon on an invoice card
2. Review invoice details in professional layout
3. Use action buttons to update status or print

**Update Status:**
1. On list view: Use menu on invoice card
2. On detail view: Click status buttons in sidebar

**Duplicate Invoice:**
- Click duplicate icon on invoice card
- New invoice created as draft with current date
- Line items and company info copied
- Ready for editing

**Delete Invoice:**
1. Click menu button on invoice card
2. Select "Delete"
3. Confirm in dialog

### Filtering and Search

**Search:**
- Enter text in search box to find by:
  - Client name
  - Invoice number
  - Client email

**Filter by Status:**
- Draft: Invoices in progress
- Sent: Invoices sent to client
- Viewed: Invoices opened by client
- Paid: Completed transactions
- Overdue: Past due unpaid invoices
- Cancelled: Void invoices

## API Reference

### Routes

```typescript
/invoices                    // List all invoices
/invoices/create            // Create new invoice
/invoices/view/:id          // View invoice details
/invoices/edit/:id          // Edit existing invoice
```

### Local Storage

**Key:** `invoices`
**Value:** JSON array of Invoice objects

```json
[
  {
    "id": "inv-1234567890",
    "invoiceNumber": "1001",
    "date": "2024-01-15T10:00:00.000Z",
    ...
  }
]
```

## Styling & UI

### Material Design Components Used

- `MatCardModule` - Invoice and stat cards
- `MatButtonModule` - Action buttons
- `MatIconModule` - Icons throughout
- `MatFormFieldModule` - Form inputs
- `MatInputModule` - Text inputs
- `MatSelectModule` - Dropdown selects
- `MatDatepickerModule` - Date selection
- `MatChipsModule` - Status badges
- `MatMenuModule` - Dropdown menus
- `MatSnackBarModule` - Toast notifications
- `MatDividerModule` - Visual separators
- `MatTabsModule` - Tab navigation
- `MatTooltipModule` - Helpful tooltips

### Color Scheme

**Status Colors:**
- Draft: Purple (#f3e5f5)
- Sent: Blue (#e3f2fd)
- Viewed: Green (#e8f5e9)
- Paid: Green (#c8e6c9) - Bold
- Overdue: Orange (#ffccbc) - Warning
- Cancelled: Gray (#bdbdbd)

**Accent Colors:**
- Primary: #1976d2 (Blue)
- Success: #4caf50 (Green)
- Warning: #ff9800 (Orange)
- Error: #f44336 (Red)

### Responsive Breakpoints

- **Desktop:** Full layout (1200px+)
- **Tablet:** Grid adjustments (768px - 1024px)
- **Mobile:** Single column, stacked layout (<768px)

## State Management

### LocalStorage Persistence

Invoice data is automatically persisted to browser's localStorage using JSON serialization/deserialization:

```typescript
// Saving
localStorage.setItem('invoices', JSON.stringify(invoiceArray))

// Loading
const invoices = JSON.parse(localStorage.getItem('invoices'))
```

### Observable Streams

The service uses RxJS BehaviorSubject for reactive state management:

```typescript
private invoices$ = new BehaviorSubject<Invoice[]>([])

// Components subscribe to updates
this.invoiceService.getInvoices().subscribe(invoices => {
  this.invoices = invoices
})
```

## Integration Points

### Navigation Integration

Invoices module is integrated into main navigation:
- Added to sidebar with receipt_long icon
- Route: `/invoices`
- Protected by AuthGuard

### Notification Integration

When creating invoices, users can integrate with notifications system:
```typescript
// Future: Notify client when invoice is sent
this.notificationService.addNotification({
  title: 'Invoice Sent',
  message: `Invoice #${invoiceNumber} sent to ${clientEmail}`,
  type: 'success'
})
```

### Routing Integration

All routes protected by AuthGuard:
- Cannot access invoices without authentication
- Automatic redirect to login if not authenticated

## Testing

### Manual Testing Checklist

- [ ] Create invoice with all fields
- [ ] Create invoice with only required fields
- [ ] Form validation prevents save without required fields
- [ ] Line items add/remove functionality works
- [ ] Calculations update in real-time
- [ ] Search filters by client name
- [ ] Search filters by invoice number
- [ ] Status filter works for all statuses
- [ ] Invoice duplicates with new date
- [ ] Delete invoice after confirmation
- [ ] Update invoice status
- [ ] View invoice detail page
- [ ] Print invoice (Ctrl+P)
- [ ] Data persists after page refresh
- [ ] Empty state shows when no invoices
- [ ] Statistics update accurately
- [ ] Responsive design on mobile
- [ ] All Material icons render correctly
- [ ] Currency formatting displays correctly
- [ ] Date picker works

### Edge Cases to Test

- [ ] Very long client names
- [ ] Special characters in descriptions
- [ ] Large numbers for pricing
- [ ] Zero quantity line items
- [ ] Duplicate invoice numbers (should auto-increment)
- [ ] Delete last invoice in list
- [ ] Search with no results
- [ ] Tax rate as 0
- [ ] Invoice with single line item (cannot delete)

## Troubleshooting

### Invoice Not Saving

**Symptoms:** Click "Create Invoice" but nothing happens

**Solutions:**
1. Check form validation - look for red error messages
2. Ensure all required fields are filled:
   - Client Name
   - Client Email
   - Client Address
   - Company Name
   - Company Address
   - Company Phone
   - Company Email
   - At least one line item
3. Check browser console for errors
4. Verify localStorage is enabled

### Invoices Not Persisting

**Symptoms:** Invoices disappear after page refresh

**Solutions:**
1. Check browser storage limit hasn't been exceeded
2. Verify localStorage is not disabled
3. Check browser privacy/incognito mode isn't blocking storage
4. Clear browser cache and try again
5. Check application in DevTools → Storage → LocalStorage

### Calculations Not Updating

**Symptoms:** Total doesn't update when changing quantity/price

**Solutions:**
1. Ensure you press Tab or click outside field after entering value
2. Check form validation for the field
3. Reload page and try again
4. Check console for TypeScript errors

### Invoice Not Found

**Symptoms:** Cannot view invoice by ID

**Solutions:**
1. Check invoice ID in URL is correct
2. Verify invoice wasn't deleted
3. Refresh page
4. Return to invoice list and try again

### Form Data Lost

**Symptoms:** Form clears unexpectedly

**Solutions:**
1. Avoid navigating away without saving
2. Use browser back button instead of closing tab
3. Check form for validation errors before navigating

### Print Layout Issues

**Symptoms:** Printed invoice doesn't look right

**Solutions:**
1. Open invoice detail view
2. Press Ctrl+P or Cmd+P to open print dialog
3. Select "Print to PDF" or printer
4. In print settings:
   - Disable header/footer
   - Set margins to small
   - Enable background graphics
5. Preview before printing

### Mobile Display Issues

**Symptoms:** Invoice form or list doesn't display correctly on phone

**Solutions:**
1. Try landscape orientation
2. Pinch to zoom if needed
3. Scroll horizontally if fields overflow
4. Report issue with device model and browser

## Future Enhancements

Planned features for future versions:

- [ ] PDF download functionality
- [ ] Email invoice directly to client
- [ ] Recurring invoice templates
- [ ] Multiple tax rates per line item
- [ ] Discount functionality
- [ ] Line item tracking (partial payment)
- [ ] Invoice reminders
- [ ] Payment gateway integration
- [ ] Invoice approval workflow
- [ ] Multi-currency support with conversion
- [ ] Client portal for viewing invoices
- [ ] Advanced reporting and analytics
- [ ] Invoice templates/presets
- [ ] Bulk invoice operations
- [ ] Invoice versioning/history

## Support & Questions

For issues or questions about the Invoices Module:

1. Check this documentation
2. Review code comments in components
3. Check browser console for error messages
4. Clear cache and try again
5. Report bug with detailed steps to reproduce
