using System.Threading.Tasks;

namespace TMS.Infrastructure.Services;

public interface IEmailService
{
    Task<bool> SendWelcomeEmailAsync(string email, string firstName, string lastName, string tempPassword);
    Task<bool> SendPasswordResetEmailAsync(string email, string firstName, string resetToken);
    Task<bool> SendEmailAsync(string to, string subject, string body);
}
