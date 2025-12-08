namespace TMS.Domain.Entities.Loads;

using System;
using System.Collections.Generic;
using TMS.Domain.Common;
using TMS.Domain.Entities.Companies;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Equipment;
using TMS.Domain.Entities.Trips;
using TMS.Domain.ValueObjects;

/// <summary>
/// Load entity for Power Only truckload movements
/// </summary>
public class Load : BaseEntity
{
    public string LoadNumber { get; set; } = string.Empty;
    public Guid CarrierId { get; set; }
    public Guid CustomerId { get; set; }
    public LoadType LoadType { get; set; } = LoadType.PowerOnly;
    public LoadStatus Status { get; set; } = LoadStatus.Booked;
    
    // Pickup/Delivery
    public Address PickupLocation { get; set; } = new();
    public DateTime PickupDateTime { get; set; }
    public Address DeliveryLocation { get; set; } = new();
    public DateTime DeliveryDateTime { get; set; }
    
    // Pricing
    public decimal BaseRate { get; set; }
    public decimal FuelSurcharge { get; set; }
    public decimal AccessorialCharges { get; set; }
    public decimal TotalRevenue => BaseRate + FuelSurcharge + AccessorialCharges;
    
    // Assignment
    public Guid? DriverId { get; set; }
    public Guid? TractorId { get; set; }
    public Guid? TrailerId { get; set; }
    
    // Tracking
    public DateTime? PickedUpAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    // Navigation
    public Carrier? Carrier { get; set; }
    public Driver? Driver { get; set; }
    public PowerOnlyTractor? Tractor { get; set; }
    public Trailer? Trailer { get; set; }
    public ICollection<Trip> Trips { get; set; } = [];
    public ICollection<Document> Documents { get; set; } = [];
}

public enum LoadType
{
    PowerOnly,
    DryVan,
    Reefer,
    Flatbed,
    Tanker
}

public enum LoadStatus
{
    Booked,
    Dispatched,
    PickedUp,
    InTransit,
    Delivered,
    Completed,
    Cancelled
}
