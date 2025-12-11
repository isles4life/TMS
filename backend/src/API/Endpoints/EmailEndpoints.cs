namespace TMS.API.Endpoints;

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TMS.Application.DTOs;
using TMS.Infrastructure.Services;

public static class EmailEndpoints
{
    public static void RegisterEmailEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/email")
            .WithTags("Email");

        group.MapPost("/send", SendEmail)
            .WithName("SendEmail")
            .Produces<EmailResponse>(StatusCodes.Status200OK)
            .Produces<EmailResponse>(StatusCodes.Status400BadRequest);

        group.MapPost("/send-welcome", SendWelcomeEmail)
            .WithName("SendWelcomeEmail")
            .Produces<EmailResponse>(StatusCodes.Status200OK)
            .Produces<EmailResponse>(StatusCodes.Status400BadRequest);

        group.MapPost("/send-reset", SendPasswordResetEmail)
            .WithName("SendPasswordResetEmail")
            .Produces<EmailResponse>(StatusCodes.Status200OK)
            .Produces<EmailResponse>(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> SendEmail(EmailRequest request, IEmailService emailService)
    {
        if (string.IsNullOrWhiteSpace(request.To) || string.IsNullOrWhiteSpace(request.Subject))
        {
            return Results.BadRequest(new EmailResponse
            {
                Success = false,
                Message = "Email and subject are required",
                EmailId = string.Empty
            });
        }

        var success = await emailService.SendEmailAsync(request.To, request.Subject, request.Body);

        return Results.Ok(new EmailResponse
        {
            Success = success,
            Message = success ? $"Email sent to {request.To}" : "Failed to send email",
            EmailId = $"email_{DateTime.UtcNow.Ticks}"
        });
    }

    private static async Task<IResult> SendWelcomeEmail(WelcomeEmailRequest request, IEmailService emailService)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.FirstName))
        {
            return Results.BadRequest(new EmailResponse
            {
                Success = false,
                Message = "Email and FirstName are required",
                EmailId = string.Empty
            });
        }

        var success = await emailService.SendWelcomeEmailAsync(
            request.Email,
            request.FirstName,
            request.LastName ?? "",
            request.TempPassword ?? "TMS2024"
        );

        return Results.Ok(new EmailResponse
        {
            Success = success,
            Message = success ? $"Welcome email sent to {request.Email}" : "Failed to send welcome email",
            EmailId = $"email_{DateTime.UtcNow.Ticks}"
        });
    }

    private static async Task<IResult> SendPasswordResetEmail(PasswordResetEmailRequest request, IEmailService emailService)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.FirstName))
        {
            return Results.BadRequest(new EmailResponse
            {
                Success = false,
                Message = "Email and FirstName are required",
                EmailId = string.Empty
            });
        }

        var success = await emailService.SendPasswordResetEmailAsync(
            request.Email,
            request.FirstName,
            request.ResetToken ?? ""
        );

        return Results.Ok(new EmailResponse
        {
            Success = success,
            Message = success ? $"Password reset email sent to {request.Email}" : "Failed to send password reset email",
            EmailId = $"email_{DateTime.UtcNow.Ticks}"
        });
    }
}

public class WelcomeEmailRequest
{
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public string? LastName { get; set; }
    public string? TempPassword { get; set; }
}

public class PasswordResetEmailRequest
{
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public string? ResetToken { get; set; }
}
