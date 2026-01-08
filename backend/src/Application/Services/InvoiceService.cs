namespace TMS.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Domain.Entities.Billing;
using TMS.Domain.Repositories;
using TMS.Application.DTOs.Billing;

/// <summary>
/// Service for invoice management
/// </summary>
public class InvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private static int _invoiceCounter = 1000;

    public InvoiceService(IInvoiceRepository invoiceRepository)
    {
        _invoiceRepository = invoiceRepository;
    }

    /// <summary>
    /// Generate next invoice number
    /// </summary>
    private string GenerateInvoiceNumber()
    {
        var number = System.Threading.Interlocked.Increment(ref _invoiceCounter);
        return $"INV-{DateTime.UtcNow:yyyyMM}-{number:D5}";
    }

    /// <summary>
    /// Create a new invoice
    /// </summary>
    public async Task<InvoiceResponse> CreateInvoiceAsync(CreateInvoiceRequest request)
    {
        var invoice = new Invoice
        {
            InvoiceNumber = GenerateInvoiceNumber(),
            InvoiceDate = DateTime.UtcNow,
            DueDate = request.DueDate ?? DateTime.UtcNow.AddDays(GetDaysForPaymentTerms(request.PaymentTerms)),
            CustomerId = request.CustomerId,
            LoadId = request.LoadId,
            PaymentTerms = request.PaymentTerms,
            TaxRate = request.TaxRate,
            Notes = request.Notes ?? string.Empty,
            Status = InvoiceStatus.Draft
        };

        // Add line items
        foreach (var lineItemDto in request.LineItems)
        {
            invoice.LineItems.Add(new InvoiceLineItem
            {
                Description = lineItemDto.Description,
                Quantity = lineItemDto.Quantity,
                UnitPrice = lineItemDto.UnitPrice,
                ItemCode = lineItemDto.ItemCode
            });
        }

        // Calculate totals
        invoice.CalculateTotals();

        var created = await _invoiceRepository.AddAsync(invoice);
        
        // Reload to get navigation properties
        var result = await _invoiceRepository.GetByIdAsync(created.Id);
        return MapToResponse(result!);
    }

    /// <summary>
    /// Get invoice by ID
    /// </summary>
    public async Task<InvoiceResponse?> GetInvoiceByIdAsync(Guid id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        return invoice == null ? null : MapToResponse(invoice);
    }

    /// <summary>
    /// Get invoice by invoice number
    /// </summary>
    public async Task<InvoiceResponse?> GetInvoiceByNumberAsync(string invoiceNumber)
    {
        var invoice = await _invoiceRepository.GetByInvoiceNumberAsync(invoiceNumber);
        return invoice == null ? null : MapToResponse(invoice);
    }

    /// <summary>
    /// Get all invoices
    /// </summary>
    public async Task<IEnumerable<InvoiceSummaryResponse>> GetAllInvoicesAsync()
    {
        var invoices = await _invoiceRepository.GetAllAsync();
        return invoices.Select(MapToSummary);
    }

    /// <summary>
    /// Get invoices by customer
    /// </summary>
    public async Task<IEnumerable<InvoiceSummaryResponse>> GetInvoicesByCustomerAsync(Guid customerId)
    {
        var invoices = await _invoiceRepository.GetByCustomerIdAsync(customerId);
        return invoices.Select(MapToSummary);
    }

    /// <summary>
    /// Get invoices by status
    /// </summary>
    public async Task<IEnumerable<InvoiceSummaryResponse>> GetInvoicesByStatusAsync(InvoiceStatus status)
    {
        var invoices = await _invoiceRepository.GetByStatusAsync(status);
        return invoices.Select(MapToSummary);
    }

    /// <summary>
    /// Get overdue invoices
    /// </summary>
    public async Task<IEnumerable<InvoiceSummaryResponse>> GetOverdueInvoicesAsync()
    {
        var invoices = await _invoiceRepository.GetOverdueInvoicesAsync();
        return invoices.Select(MapToSummary);
    }

    /// <summary>
    /// Update invoice
    /// </summary>
    public async Task<InvoiceResponse?> UpdateInvoiceAsync(Guid id, UpdateInvoiceRequest request)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            return null;

        // Only allow updates to drafts
        if (invoice.Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Can only update draft invoices");

        if (request.DueDate.HasValue)
            invoice.DueDate = request.DueDate.Value;

        if (request.PaymentTerms.HasValue)
            invoice.PaymentTerms = request.PaymentTerms.Value;

        if (request.TaxRate.HasValue)
            invoice.TaxRate = request.TaxRate.Value;

        if (request.Notes != null)
            invoice.Notes = request.Notes;

        if (request.LineItems != null)
        {
            invoice.LineItems.Clear();
            foreach (var lineItemDto in request.LineItems)
            {
                invoice.LineItems.Add(new InvoiceLineItem
                {
                    Description = lineItemDto.Description,
                    Quantity = lineItemDto.Quantity,
                    UnitPrice = lineItemDto.UnitPrice,
                    ItemCode = lineItemDto.ItemCode
                });
            }
        }

        invoice.CalculateTotals();
        invoice.UpdatedAt = DateTime.UtcNow;

        var updated = await _invoiceRepository.UpdateAsync(invoice);
        var result = await _invoiceRepository.GetByIdAsync(updated.Id);
        return MapToResponse(result!);
    }

    /// <summary>
    /// Send invoice to customer
    /// </summary>
    public async Task<InvoiceResponse?> SendInvoiceAsync(Guid id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            return null;

        invoice.MarkAsSent();
        invoice.UpdatedAt = DateTime.UtcNow;

        await _invoiceRepository.UpdateAsync(invoice);
        var result = await _invoiceRepository.GetByIdAsync(id);
        return MapToResponse(result!);
    }

    /// <summary>
    /// Mark invoice as viewed
    /// </summary>
    public async Task<InvoiceResponse?> MarkAsViewedAsync(Guid id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            return null;

        invoice.MarkAsViewed();
        invoice.UpdatedAt = DateTime.UtcNow;

        await _invoiceRepository.UpdateAsync(invoice);
        var result = await _invoiceRepository.GetByIdAsync(id);
        return MapToResponse(result!);
    }

    /// <summary>
    /// Record a payment
    /// </summary>
    public async Task<InvoiceResponse?> RecordPaymentAsync(Guid id, RecordPaymentRequest request)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            return null;

        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new InvalidOperationException("Cannot record payment for cancelled invoice");

        invoice.RecordPayment(request.Amount, request.PaymentMethod, request.Reference);
        
        if (request.Notes != null && invoice.Payments.Any())
        {
            invoice.Payments.Last().Notes = request.Notes;
        }

        invoice.UpdatedAt = DateTime.UtcNow;

        await _invoiceRepository.UpdateAsync(invoice);
        var result = await _invoiceRepository.GetByIdAsync(id);
        return MapToResponse(result!);
    }

    /// <summary>
    /// Cancel invoice
    /// </summary>
    public async Task<InvoiceResponse?> CancelInvoiceAsync(Guid id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            return null;

        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Cannot cancel paid invoice");

        invoice.Status = InvoiceStatus.Cancelled;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _invoiceRepository.UpdateAsync(invoice);
        var result = await _invoiceRepository.GetByIdAsync(id);
        return MapToResponse(result!);
    }

    /// <summary>
    /// Delete invoice
    /// </summary>
    public async Task<bool> DeleteInvoiceAsync(Guid id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            return false;

        // Only allow deletion of drafts
        if (invoice.Status != InvoiceStatus.Draft)
            throw new InvalidOperationException("Can only delete draft invoices");

        return await _invoiceRepository.DeleteAsync(id);
    }

    /// <summary>
    /// Get A/R aging report
    /// </summary>
    public async Task<AgingReportResponse> GetAgingReportAsync()
    {
        var report = await _invoiceRepository.GetAgingReportAsync();

        return new AgingReportResponse
        {
            Current = report["Current"],
            Days1To30 = report["1-30 Days"],
            Days31To60 = report["31-60 Days"],
            Days61To90 = report["61-90 Days"],
            Over90Days = report["Over 90 Days"],
            TotalOutstanding = report.Values.Sum()
        };
    }

    /// <summary>
    /// Get payment terms in days
    /// </summary>
    private static int GetDaysForPaymentTerms(PaymentTerms terms)
    {
        return terms switch
        {
            PaymentTerms.Immediate => 0,
            PaymentTerms.DueOnReceipt => 0,
            PaymentTerms.Net15 => 15,
            PaymentTerms.Net30 => 30,
            PaymentTerms.Net45 => 45,
            PaymentTerms.Net60 => 60,
            PaymentTerms.Net90 => 90,
            _ => 30
        };
    }

    /// <summary>
    /// Map entity to response
    /// </summary>
    private static InvoiceResponse MapToResponse(Invoice invoice)
    {
        return new InvoiceResponse
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer?.CompanyName ?? "Unknown",
            LoadId = invoice.LoadId,
            LoadNumber = invoice.Load?.LoadNumber,
            Status = invoice.Status,
            PaymentTerms = invoice.PaymentTerms,
            Subtotal = invoice.Subtotal,
            TaxRate = invoice.TaxRate,
            TaxAmount = invoice.TaxAmount,
            TotalAmount = invoice.TotalAmount,
            AmountPaid = invoice.AmountPaid,
            AmountDue = invoice.AmountDue,
            Notes = invoice.Notes,
            SentDate = invoice.SentDate,
            PaidDate = invoice.PaidDate,
            ViewedDate = invoice.ViewedDate,
            AgingDays = invoice.GetAgingDays(),
            IsOverdue = invoice.IsOverdue(),
            LineItems = invoice.LineItems.Select(li => new InvoiceLineItemResponse
            {
                Id = li.Id,
                Description = li.Description,
                Quantity = li.Quantity,
                UnitPrice = li.UnitPrice,
                LineTotal = li.LineTotal,
                ItemCode = li.ItemCode
            }).ToList(),
            Payments = invoice.Payments.Select(p => new PaymentResponse
            {
                Id = p.Id,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                PaymentMethod = p.PaymentMethod,
                Reference = p.Reference,
                Notes = p.Notes
            }).ToList(),
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt
        };
    }

    /// <summary>
    /// Map entity to summary
    /// </summary>
    private static InvoiceSummaryResponse MapToSummary(Invoice invoice)
    {
        return new InvoiceSummaryResponse
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            CustomerName = invoice.Customer?.CompanyName ?? "Unknown",
            Status = invoice.Status,
            TotalAmount = invoice.TotalAmount,
            AmountDue = invoice.AmountDue,
            AgingDays = invoice.GetAgingDays(),
            IsOverdue = invoice.IsOverdue()
        };
    }
}
