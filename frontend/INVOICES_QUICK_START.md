# Invoices Module - Quick Start Guide

## 🚀 Getting Started

### Access the Module
1. Open your browser to `http://localhost:4200`
2. Login with your credentials
3. Click **"Invoices"** in the sidebar

### Create Your First Invoice

**Path:** `/invoices/create`

1. Click **"Create New Invoice"** button
2. Fill in **Client Information**:
   - Client Name (required) - e.g., "ABC Transport Co."
   - Email (required) - e.g., "billing@abctransport.com"
   - Address (required)
   - Phone (optional)

3. Review **Company Information** (pre-filled):
   - Modify if needed
   - All fields required

4. Set **Invoice Details**:
   - Invoice Date (today by default)
   - Due Date (30 days by default)
   - Currency (USD selected by default)
   - Tax Rate (8% by default)
   - Payment Terms (optional) - e.g., "Net 30"
   - Notes (optional)

5. **Add Line Items**:
   - First item is pre-added
   - Click **"+ Add Line Item"** for more
   - Enter: Description, Quantity, Unit Price
   - Amount calculates automatically ✓
   - Click red delete button to remove item (if multiple)

6. **Optional: Add Bank Details**
   - Account Name
   - Account Number (displayed as password)
   - Routing Number
   - Bank Name

7. Review **Totals** section - shows real-time calculations

8. Click **"Create Invoice"** button

✅ Invoice saved! You'll see a confirmation message.

---

## 📋 Managing Invoices

### View All Invoices
**Path:** `/invoices`

**Features Available:**
- **Statistics Cards** (top)
  - Total Invoices
  - Total Revenue (from paid invoices)
  - Unpaid Count
  - Overdue Count

- **Search Bar** - Find by:
  - Client name
  - Invoice number
  - Client email

- **Status Filter** - Select:
  - All Invoices
  - Drafts
  - Sent
  - Viewed
  - Paid
  - Overdue
  - Cancelled

### Invoice Card Actions

For each invoice, you can:
- 👁️ **View** - See invoice details
- ✏️ **Edit** - Modify invoice
- 📋 **Duplicate** - Create copy with today's date
- ⋯ **Menu** - More options:
  - Mark as Sent
  - Mark as Viewed
  - Mark as Paid
  - Delete (with confirmation)

---

## 📄 Viewing Invoice Details

**Path:** `/invoices/view/:id`

### What You'll See:
1. **Professional Invoice Layout**
   - Company header with contact info
   - Client billing information
   - Line items in a table format
   - Subtotal, Tax, Total calculations
   - Payment terms & bank details
   - Any notes

2. **Status Display** (colored badge)
   - Shows current invoice status
   - Color-coded for quick identification

3. **Action Buttons**
   - 🖨️ **Print** - Print or save as PDF (Ctrl+P)
   - ⬇️ **Download** - Download as PDF (coming soon)
   - 📧 **Send** - Email to client (marks as sent)
   - **Menu** ⋯ - Edit, mark as viewed/paid

4. **Sidebar Information**
   - Current Status
   - Quick Action Buttons
   - Client Information
   - Invoice Dates (created, due, updated)
   - Total Amount (highlighted)

---

## 🎯 Common Tasks

### Duplicate an Invoice
1. On Invoice List, find invoice card
2. Click **duplicate icon** (📋)
3. New invoice created as Draft
4. Edit details as needed
5. Save

**Time Saver:** Use this to create similar invoices quickly!

### Update Invoice Status
1. **From List View:**
   - Click **menu ⋯** on invoice card
   - Select new status
   - Confirm

2. **From Detail View:**
   - Click status button in sidebar
   - Or use menu ⋯ for more options

**Status Flow:**
```
Draft → Sent → Viewed → Paid ✓
       ↘ Cancelled
       ↘ Overdue (automatic if past due)
```

### Print Invoice
1. Navigate to invoice detail page
2. Click **Print button** 🖨️
3. Or press **Ctrl+P** (Cmd+P on Mac)
4. Choose printer or "Save as PDF"
5. Configure print settings:
   - Set margins to "Small"
   - Enable "Background graphics"
   - Disable "Headers and footers"

### Delete Invoice
1. On Invoice List, click **menu ⋯**
2. Select **Delete**
3. Confirm in dialog
4. Invoice removed

**Warning:** This cannot be undone!

### Search Invoices
1. Go to Invoice List (`/invoices`)
2. Type in search box:
   - **Client name** - "ABC Transport"
   - **Invoice number** - "1001"
   - **Email** - "billing@"
3. Results filter automatically

### Filter by Status
1. Go to Invoice List
2. Use **Status Filter** dropdown
3. Select status to view only those invoices
4. Combine with search for precise results

---

## 💡 Pro Tips

✅ **Pre-filled Company Info** - Modify once, use for all invoices

✅ **Auto-Calculate Amounts** - Just enter qty and price, total updates instantly

✅ **Line Items** - Add as many as needed with "+ Add Line Item"

✅ **Tax Rate** - Set once, applies to all items. Modify anytime before saving

✅ **Duplicate Feature** - Fastest way to create similar invoices

✅ **Drag & Drop Friendly** - Form is fully responsive, works on mobile too

✅ **Print to PDF** - Use browser print (Ctrl+P) to save invoice as PDF

✅ **Data Saves Locally** - No internet needed once created (data in browser storage)

✅ **Quick Status Updates** - Change status without opening invoice

---

## 📊 Statistics & Insights

The **Statistics Cards** on the Invoice List page show:

- **Total Invoices** - Count of all invoices created
- **Total Revenue** - Sum of all PAID invoices only
- **Unpaid** - Count of invoices not yet paid
- **Overdue** - Count of past-due unpaid invoices

Use these to quickly understand your invoice status!

---

## ⚠️ Important Notes

1. **Data Storage** - All data stored in browser's local storage
2. **Browser Specific** - Data only available in this browser (not synced)
3. **Clear Cache Warning** - Clearing browser cache will delete all invoices
4. **Backup** - Consider exporting data regularly (feature coming soon)
5. **Edit Drafts** - Only unsent/draft invoices should be edited

---

## 🔍 Status Reference

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Draft | ✏️ | Purple | In progress, not sent |
| Sent | 📧 | Blue | Sent to client |
| Viewed | 👁️ | Green | Client opened invoice |
| Paid | ✅ | Green Bold | Payment received |
| Overdue | ⚠️ | Orange | Past due date, unpaid |
| Cancelled | ❌ | Gray | Voided invoice |

---

## 🆘 Troubleshooting

### Invoice Won't Save
**Check:**
- All required fields filled (red error messages show)
- At least one line item added
- Valid email address for client
- Browser localStorage is enabled

### Calculations Wrong
**Check:**
- Quantity and unit price entered correctly
- Tab out of field to trigger calculation
- Tax rate is correct (0.08 = 8%)
- Reload page if still wrong

### Can't Find Invoice
**Try:**
- Search by client name in search box
- Use Status filter dropdown
- Scroll invoice list (multiple pages)
- Check invoice wasn't deleted

### Print Looks Wrong
**Try:**
- Disable headers/footers in print dialog
- Set margins to "Small"
- Enable "Background graphics"
- Use Chrome or Firefox
- Try "Print to PDF" instead

### Data Disappeared
**Check:**
- Didn't clear browser cache
- Using same browser
- Still logged in
- Check incognito/private mode (data cleared on close)

---

## 📞 Need Help?

Refer to the full documentation:
📖 `docs/ui/INVOICES_MODULE.md`

**Quick Links:**
- Component details
- API reference
- Data models
- Advanced features
- Testing guide

---

## ✨ What's Coming Soon

- ✓ PDF download functionality
- ✓ Email invoices directly
- ✓ Recurring invoice templates
- ✓ Line item discounts
- ✓ Invoice reminders
- ✓ Payment gateway integration
- ✓ Client portal
- ✓ Advanced reporting

---

**Last Updated:** December 9, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
