namespace TMS.Domain.Repositories;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMS.Domain.Entities.Billing;

/// <summary>
/// Repository interface for Invoice operations
/// </summary>
public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id);
    Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber);
    Task<IEnumerable<Invoice>> GetAllAsync();
    Task<IEnumerable<Invoice>> GetByCustomerIdAsync(Guid customerId);
    Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status);
    Task<IEnumerable<Invoice>> GetOverdueInvoicesAsync();
    Task<IEnumerable<Invoice>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<Dictionary<string, decimal>> GetAgingReportAsync();
    Task<Invoice> AddAsync(Invoice invoice);
    Task<Invoice> UpdateAsync(Invoice invoice);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(string invoiceNumber);
}
