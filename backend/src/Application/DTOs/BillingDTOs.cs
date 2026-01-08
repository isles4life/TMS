namespace TMS.Application.DTOs.Billing;

using System;
using System.Collections.Generic;
using TMS.Domain.Entities.Billing;

/// <summary>
/// DTO for creating a new invoice
/// </summary>
public class CreateInvoiceRequest
{
    public Guid CustomerId { get; set; }
    public Guid? LoadId { get; set; }
    public DateTime? DueDate { get; set; }
    public PaymentTerms PaymentTerms { get; set; } = PaymentTerms.Net30;
    public decimal TaxRate { get; set; }
    public string? Notes { get; set; }
    public List<InvoiceLineItemDto> LineItems { get; set; } = [];
}

/// <summary>
/// DTO for updating an existing invoice
/// </summary>
public class UpdateInvoiceRequest
{
    public DateTime? DueDate { get; set; }
    public PaymentTerms? PaymentTerms { get; set; }
    public decimal? TaxRate { get; set; }
    public string? Notes { get; set; }
    public List<InvoiceLineItemDto>? LineItems { get; set; }
}

/// <summary>
/// DTO for invoice line items
/// </summary>
public class InvoiceLineItemDto
{
    public Guid? Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public string? ItemCode { get; set; }
}

/// <summary>
/// DTO for recording a payment
/// </summary>
public class RecordPaymentRequest
{
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for invoice response
/// </summary>
public class InvoiceResponse
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid? LoadId { get; set; }
    public string? LoadNumber { get; set; }
    public InvoiceStatus Status { get; set; }
    public PaymentTerms PaymentTerms { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal AmountDue { get; set; }
    public string? Notes { get; set; }
    public DateTime? SentDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public DateTime? ViewedDate { get; set; }
    public int AgingDays { get; set; }
    public bool IsOverdue { get; set; }
    public List<InvoiceLineItemResponse> LineItems { get; set; } = [];
    public List<PaymentResponse> Payments { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for invoice line item response
/// </summary>
public class InvoiceLineItemResponse
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public string? ItemCode { get; set; }
}

/// <summary>
/// DTO for payment response
/// </summary>
public class PaymentResponse
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for invoice summary (list view)
/// </summary>
public class InvoiceSummaryResponse
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public InvoiceStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountDue { get; set; }
    public int AgingDays { get; set; }
    public bool IsOverdue { get; set; }
}

/// <summary>
/// DTO for A/R aging report
/// </summary>
public class AgingReportResponse
{
    public decimal Current { get; set; }
    public decimal Days1To30 { get; set; }
    public decimal Days31To60 { get; set; }
    public decimal Days61To90 { get; set; }
    public decimal Over90Days { get; set; }
    public decimal TotalOutstanding { get; set; }
}
