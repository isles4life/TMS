namespace TMS.Application.DTOs;

public class EmailRequest
{
    public required string To { get; set; }
    public required string Subject { get; set; }
    public required string Body { get; set; }
    public required string Type { get; set; } // 'welcome', 'password-reset', 'notification'
}

public class EmailResponse
{
    public bool Success { get; set; }
    public required string Message { get; set; }
    public required string EmailId { get; set; }
}
