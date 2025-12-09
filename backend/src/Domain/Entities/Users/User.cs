namespace TMS.Domain.Entities.Users;

using System;
using TMS.Domain.Common;

/// <summary>
/// User entity for authentication
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    
    // Foreign key to Carrier
    public Guid? CarrierId { get; set; }
    
    // Role - can be Admin, Manager, Driver, Dispatcher, etc.
    public string Role { get; set; } = "User";
}
