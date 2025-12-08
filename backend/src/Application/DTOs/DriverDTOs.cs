using System;
using System.Collections.Generic;

namespace TMS.Application.DTOs.Drivers;

/// <summary>
/// DTO for driver response
/// </summary>
public class DriverResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string CDLNumber { get; set; } = string.Empty;
    public DateTime CDLExpiryDate { get; set; }
    public bool CDLExpiringSoon => (CDLExpiryDate - DateTime.UtcNow).TotalDays <= 30;
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// DTO for creating a driver
/// </summary>
public class CreateDriverRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string CDLNumber { get; set; } = string.Empty;
    public DateTime CDLExpiryDate { get; set; }
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
}
