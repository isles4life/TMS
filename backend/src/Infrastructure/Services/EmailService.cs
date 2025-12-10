using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace TMS.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly bool _enableSsl;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        // Read SMTP configuration from appsettings
        var emailSection = configuration.GetSection("Email");
        _smtpHost = emailSection["SmtpHost"] ?? "smtp.gmail.com";
        _smtpPort = int.TryParse(emailSection["SmtpPort"], out var port) ? port : 587;
        _smtpUsername = emailSection["SmtpUsername"] ?? "";
        _smtpPassword = emailSection["SmtpPassword"] ?? "";
        _fromEmail = emailSection["FromEmail"] ?? "noreply@truckstop.com";
        _fromName = emailSection["FromName"] ?? "TMS Admin";
        _enableSsl = bool.TryParse(emailSection["EnableSsl"], out var ssl) ? ssl : true;

        _logger.LogInformation($"Email Service initialized. SMTP Host: {_smtpHost}, Port: {_smtpPort}, From: {_fromEmail}");
    }

    public async Task<bool> SendWelcomeEmailAsync(string email, string firstName, string lastName, string tempPassword)
    {
        try
        {
            var subject = "Welcome to TMS - Set Your Password";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }}
        .header {{ background-color: #d71920; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #d71920; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }}
        .code {{ background-color: #f0f0f0; padding: 10px; border-left: 3px solid #d71920; font-family: monospace; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>Welcome to Truckstop Management System</h2>
        </div>
        <div class=""content"">
            <p>Hi {firstName} {lastName},</p>
            <p>Your account has been created successfully! Please set your password by clicking the button below:</p>
            <a href=""http://localhost:55554/login?email={Uri.EscapeDataString(email)}&action=set-password"" class=""button"">Set Your Password</a>
            <p>Or visit: <code>http://localhost:55554/login</code> and use your email to proceed.</p>
            <p>Your temporary access code:</p>
            <div class=""code"">{tempPassword}</div>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br><strong>TMS Admin Team</strong></p>
        </div>
        <div class=""footer"">
            <p>&copy; {DateTime.UtcNow.Year} Truckstop Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            return await SendEmailAsync(email, subject, body);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending welcome email to {email}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendPasswordResetEmailAsync(string email, string firstName, string resetToken)
    {
        try
        {
            var subject = "Reset Your TMS Password";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }}
        .header {{ background-color: #d71920; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #d71920; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }}
        .warning {{ background-color: #fff3e0; border-left: 3px solid #ff9800; padding: 10px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>Password Reset Request</h2>
        </div>
        <div class=""content"">
            <p>Hi {firstName},</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <a href=""http://localhost:55554/reset-password?token={resetToken}"" class=""button"">Reset Password</a>
            <div class=""warning"">
                <strong>⏱️ This link will expire in 24 hours.</strong>
            </div>
            <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
            <p>Best regards,<br><strong>TMS Admin Team</strong></p>
        </div>
        <div class=""footer"">
            <p>&copy; {DateTime.UtcNow.Year} Truckstop Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            return await SendEmailAsync(email, subject, body);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending password reset email to {email}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            // Log to console in development
            _logger.LogInformation($"Sending email to: {to}, Subject: {subject}");

            // If no SMTP credentials configured, just log and return success (dev mode)
            if (string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
            {
                _logger.LogWarning("SMTP credentials not configured. Email would be sent to: " + to);
                return true; // Simulate success in dev
            }

            using (var client = new SmtpClient(_smtpHost, _smtpPort))
            {
                client.EnableSsl = _enableSsl;
                client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                client.Timeout = 10000;

                using (var mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(_fromEmail, _fromName);
                    mailMessage.To.Add(new MailAddress(to));
                    mailMessage.Subject = subject;
                    mailMessage.Body = body;
                    mailMessage.IsBodyHtml = true;

                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Email sent successfully to: {to}");
                    return true;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending email: {ex.Message}");
            return false;
        }
    }
}
