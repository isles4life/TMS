namespace TMS.Application.DTOs;

public class EmailRequest
{
    public string To { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
    public string Type { get; set; } // 'welcome', 'password-reset', 'notification'
}

public class EmailResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public string EmailId { get; set; }
}
