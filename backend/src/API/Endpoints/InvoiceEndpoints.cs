namespace TMS.API.Endpoints;

using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using TMS.Application.Services;
using TMS.Application.DTOs.Billing;
using TMS.Domain.Common;
using TMS.Domain.Entities.Billing;

/// <summary>
/// Invoice management endpoints
/// </summary>
public static class InvoiceEndpoints
{
    public static void MapInvoiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/invoices")
            .WithTags("Invoices");

        // GET /api/invoices - Get all invoices
        group.MapGet("/", async (InvoiceService service) =>
        {
            var invoices = await service.GetAllInvoicesAsync();
            return ApiResponse<IEnumerable<InvoiceSummaryResponse>>.CreateSuccess(invoices);
        })
        .WithName("GetAllInvoices")
        .WithOpenApi();

        // GET /api/invoices/{id} - Get invoice by ID
        group.MapGet("/{id:guid}", async (Guid id, InvoiceService service) =>
        {
            var invoice = await service.GetInvoiceByIdAsync(id);
            if (invoice == null)
                return ApiResponse<InvoiceResponse>.CreateFailure("Invoice not found");

            return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
        })
        .WithName("GetInvoiceById")
        .WithOpenApi();

        // GET /api/invoices/number/{invoiceNumber} - Get invoice by number
        group.MapGet("/number/{invoiceNumber}", async (string invoiceNumber, InvoiceService service) =>
        {
            var invoice = await service.GetInvoiceByNumberAsync(invoiceNumber);
            if (invoice == null)
                return ApiResponse<InvoiceResponse>.CreateFailure("Invoice not found");

            return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
        })
        .WithName("GetInvoiceByNumber")
        .WithOpenApi();

        // GET /api/invoices/customer/{customerId} - Get invoices by customer
        group.MapGet("/customer/{customerId:guid}", async (Guid customerId, InvoiceService service) =>
        {
            var invoices = await service.GetInvoicesByCustomerAsync(customerId);
            return ApiResponse<IEnumerable<InvoiceSummaryResponse>>.CreateSuccess(invoices);
        })
        .WithName("GetInvoicesByCustomer")
        .WithOpenApi();

        // GET /api/invoices/status/{status} - Get invoices by status
        group.MapGet("/status/{status}", async (InvoiceStatus status, InvoiceService service) =>
        {
            var invoices = await service.GetInvoicesByStatusAsync(status);
            return ApiResponse<IEnumerable<InvoiceSummaryResponse>>.CreateSuccess(invoices);
        })
        .WithName("GetInvoicesByStatus")
        .WithOpenApi();

        // GET /api/invoices/overdue - Get overdue invoices
        group.MapGet("/overdue", async (InvoiceService service) =>
        {
            var invoices = await service.GetOverdueInvoicesAsync();
            return ApiResponse<IEnumerable<InvoiceSummaryResponse>>.CreateSuccess(invoices);
        })
        .WithName("GetOverdueInvoices")
        .WithOpenApi();

        // GET /api/invoices/aging - Get A/R aging report
        group.MapGet("/aging", async (InvoiceService service) =>
        {
            var report = await service.GetAgingReportAsync();
            return ApiResponse<AgingReportResponse>.CreateSuccess(report);
        })
        .WithName("GetAgingReport")
        .WithOpenApi();

        // POST /api/invoices - Create new invoice
        group.MapPost("/", async ([FromBody] CreateInvoiceRequest request, InvoiceService service) =>
        {
            try
            {
                var invoice = await service.CreateInvoiceAsync(request);
                return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
            }
            catch (Exception ex)
            {
                return ApiResponse<InvoiceResponse>.CreateFailure($"Failed to create invoice: {ex.Message}");
            }
        })
        .WithName("CreateInvoice")
        .WithOpenApi();

        // PUT /api/invoices/{id} - Update invoice
        group.MapPut("/{id:guid}", async (Guid id, [FromBody] UpdateInvoiceRequest request, InvoiceService service) =>
        {
            try
            {
                var invoice = await service.UpdateInvoiceAsync(id, request);
                if (invoice == null)
                    return ApiResponse<InvoiceResponse>.CreateFailure("Invoice not found");

                return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
            }
            catch (InvalidOperationException ex)
            {
                return ApiResponse<InvoiceResponse>.CreateFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiResponse<InvoiceResponse>.CreateFailure($"Failed to update invoice: {ex.Message}");
            }
        })
        .WithName("UpdateInvoice")
        .WithOpenApi();

        // POST /api/invoices/{id}/send - Send invoice
        group.MapPost("/{id:guid}/send", async (Guid id, InvoiceService service) =>
        {
            var invoice = await service.SendInvoiceAsync(id);
            if (invoice == null)
                return ApiResponse<InvoiceResponse>.CreateFailure("Invoice not found");

            return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
        })
        .WithName("SendInvoice")
        .WithOpenApi();

        // POST /api/invoices/{id}/view - Mark as viewed
        group.MapPost("/{id:guid}/view", async (Guid id, InvoiceService service) =>
        {
            var invoice = await service.MarkAsViewedAsync(id);
            if (invoice == null)
                return ApiResponse<InvoiceResponse>.CreateFailure("Invoice not found");

            return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
        })
        .WithName("MarkInvoiceAsViewed")
        .WithOpenApi();

        // POST /api/invoices/{id}/payments - Record payment
        group.MapPost("/{id:guid}/payments", async (Guid id, [FromBody] RecordPaymentRequest request, InvoiceService service) =>
        {
            try
            {
                var invoice = await service.RecordPaymentAsync(id, request);
                if (invoice == null)
                    return ApiResponse<InvoiceResponse>.CreateFailure("Invoice not found");

                return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
            }
            catch (InvalidOperationException ex)
            {
                return ApiResponse<InvoiceResponse>.CreateFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiResponse<InvoiceResponse>.CreateFailure($"Failed to record payment: {ex.Message}");
            }
        })
        .WithName("RecordPayment")
        .WithOpenApi();

        // POST /api/invoices/{id}/cancel - Cancel invoice
        group.MapPost("/{id:guid}/cancel", async (Guid id, InvoiceService service) =>
        {
            try
            {
                var invoice = await service.CancelInvoiceAsync(id);
                if (invoice == null)
                    return ApiResponse<InvoiceResponse>.CreateFailure("Invoice not found");

                return ApiResponse<InvoiceResponse>.CreateSuccess(invoice);
            }
            catch (InvalidOperationException ex)
            {
                return ApiResponse<InvoiceResponse>.CreateFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiResponse<InvoiceResponse>.CreateFailure($"Failed to cancel invoice: {ex.Message}");
            }
        })
        .WithName("CancelInvoice")
        .WithOpenApi();

        // DELETE /api/invoices/{id} - Delete invoice
        group.MapDelete("/{id:guid}", async (Guid id, InvoiceService service) =>
        {
            try
            {
                var deleted = await service.DeleteInvoiceAsync(id);
                if (!deleted)
                    return ApiResponse<bool>.CreateFailure("Invoice not found");

                return ApiResponse<bool>.CreateSuccess(true);
            }
            catch (InvalidOperationException ex)
            {
                return ApiResponse<bool>.CreateFailure(ex.Message);
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.CreateFailure($"Failed to delete invoice: {ex.Message}");
            }
        })
        .WithName("DeleteInvoice")
        .WithOpenApi();
    }
}
