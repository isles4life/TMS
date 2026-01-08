namespace TMS.Domain.Entities.Billing;

using System;
using System.Collections.Generic;
using System.Linq;
using TMS.Domain.Common;
using TMS.Domain.Entities.Companies;
using TMS.Domain.Entities.Loads;

/// <summary>
/// Invoice entity for billing customers
/// </summary>
public class Invoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(30);
    
    public Guid CustomerId { get; set; }
    public Guid? LoadId { get; set; }
    
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public PaymentTerms PaymentTerms { get; set; } = PaymentTerms.Net30;
    
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal AmountDue => TotalAmount - AmountPaid;
    
    public string Notes { get; set; } = string.Empty;
    public DateTime? SentDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public DateTime? ViewedDate { get; set; }
    
    // Navigation properties
    public Carrier? Customer { get; set; }
    public Load? Load { get; set; }
    public ICollection<InvoiceLineItem> LineItems { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];

    /// <summary>
    /// Calculate totals from line items
    /// </summary>
    public void CalculateTotals()
    {
        Subtotal = LineItems.Sum(li => li.Quantity * li.UnitPrice);
        TaxAmount = Subtotal * TaxRate;
        TotalAmount = Subtotal + TaxAmount;
    }

    /// <summary>
    /// Mark invoice as sent
    /// </summary>
    public void MarkAsSent()
    {
        if (Status == InvoiceStatus.Draft)
        {
            Status = InvoiceStatus.Sent;
            SentDate = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Mark invoice as viewed by customer
    /// </summary>
    public void MarkAsViewed()
    {
        if (Status == InvoiceStatus.Sent && ViewedDate == null)
        {
            Status = InvoiceStatus.Viewed;
            ViewedDate = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Record a payment
    /// </summary>
    public void RecordPayment(decimal amount, string paymentMethod, string? reference = null)
    {
        var payment = new Payment
        {
            InvoiceId = Id,
            Amount = amount,
            PaymentDate = DateTime.UtcNow,
            PaymentMethod = paymentMethod,
            Reference = reference ?? string.Empty
        };

        Payments.Add(payment);
        AmountPaid += amount;

        if (AmountPaid >= TotalAmount)
        {
            Status = InvoiceStatus.Paid;
            PaidDate = DateTime.UtcNow;
        }
        else if (AmountPaid > 0)
        {
            Status = InvoiceStatus.PartiallyPaid;
        }
    }

    /// <summary>
    /// Check if invoice is overdue
    /// </summary>
    public bool IsOverdue()
    {
        return Status != InvoiceStatus.Paid 
            && Status != InvoiceStatus.Cancelled 
            && DueDate < DateTime.UtcNow;
    }

    /// <summary>
    /// Get aging in days
    /// </summary>
    public int GetAgingDays()
    {
        if (Status == InvoiceStatus.Paid || Status == InvoiceStatus.Cancelled)
            return 0;

        if (DueDate > DateTime.UtcNow)
            return 0;

        return (int)(DateTime.UtcNow - DueDate).TotalDays;
    }
}

/// <summary>
/// Invoice line item for detailed billing
/// </summary>
public class InvoiceLineItem : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal LineTotal => Quantity * UnitPrice;
    public string? ItemCode { get; set; }
    
    public Invoice? Invoice { get; set; }
}

/// <summary>
/// Payment record for invoices
/// </summary>
public class Payment : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string? Notes { get; set; }
    
    public Invoice? Invoice { get; set; }
}

/// <summary>
/// Invoice status workflow
/// </summary>
public enum InvoiceStatus
{
    Draft,
    Sent,
    Viewed,
    PartiallyPaid,
    Paid,
    Overdue,
    Cancelled
}

/// <summary>
/// Payment terms for invoices
/// </summary>
public enum PaymentTerms
{
    Immediate,
    Net15,
    Net30,
    Net45,
    Net60,
    Net90,
    DueOnReceipt
}
