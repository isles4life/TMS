using System;
using System.Collections.Generic;

namespace TMS.Domain.ValueObjects;

/// <summary>
/// Address value object (shared across entities)
/// </summary>
public class Address
{
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "USA";
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public string GetFormattedAddress() => $"{Street}, {City}, {State} {PostalCode}";
}
