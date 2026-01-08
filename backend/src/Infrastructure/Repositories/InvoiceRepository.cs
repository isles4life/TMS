using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Repositories;
using TMS.Domain.Entities.Billing;
using TMS.Infrastructure.Persistence;

namespace TMS.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Invoice operations
/// </summary>
public class InvoiceRepository : IInvoiceRepository
{
    private readonly TMSDbContext _context;

    public InvoiceRepository(TMSDbContext context)
    {
        _context = context;
    }

    public async Task<Invoice?> GetByIdAsync(Guid id)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Include(i => i.Customer)
            .Include(i => i.Load)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Include(i => i.Customer)
            .Include(i => i.Load)
            .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);
    }

    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Include(i => i.Customer)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetByCustomerIdAsync(Guid customerId)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Where(i => i.CustomerId == customerId)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Include(i => i.Customer)
            .Where(i => i.Status == status)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetOverdueInvoicesAsync()
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Include(i => i.Customer)
            .Where(i => i.Status != InvoiceStatus.Paid 
                     && i.Status != InvoiceStatus.Cancelled 
                     && i.DueDate < DateTime.UtcNow)
            .OrderBy(i => i.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .Include(i => i.Customer)
            .Where(i => i.InvoiceDate >= startDate && i.InvoiceDate <= endDate)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();
    }

    public async Task<Dictionary<string, decimal>> GetAgingReportAsync()
    {
        var invoices = await _context.Invoices
            .Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled)
            .ToListAsync();

        var report = new Dictionary<string, decimal>
        {
            ["Current"] = invoices.Where(i => i.DueDate >= DateTime.UtcNow).Sum(i => i.AmountDue),
            ["1-30 Days"] = invoices.Where(i => i.GetAgingDays() >= 1 && i.GetAgingDays() <= 30).Sum(i => i.AmountDue),
            ["31-60 Days"] = invoices.Where(i => i.GetAgingDays() >= 31 && i.GetAgingDays() <= 60).Sum(i => i.AmountDue),
            ["61-90 Days"] = invoices.Where(i => i.GetAgingDays() >= 61 && i.GetAgingDays() <= 90).Sum(i => i.AmountDue),
            ["Over 90 Days"] = invoices.Where(i => i.GetAgingDays() > 90).Sum(i => i.AmountDue)
        };

        return report;
    }

    public async Task<Invoice> AddAsync(Invoice invoice)
    {
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice> UpdateAsync(Invoice invoice)
    {
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null)
            return false;

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(string invoiceNumber)
    {
        return await _context.Invoices.AnyAsync(i => i.InvoiceNumber == invoiceNumber);
    }
}
