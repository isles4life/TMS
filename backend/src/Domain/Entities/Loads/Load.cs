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
    
    // Proof of Delivery
    public Guid? ProofOfDeliveryId { get; set; }

    // Navigation
    public Carrier? Carrier { get; set; }
    public Driver? Driver { get; set; }
    public PowerOnlyTractor? Tractor { get; set; }
    public Trailer? Trailer { get; set; }
    public ICollection<Trip> Trips { get; set; } = [];
    public ICollection<Document> Documents { get; set; } = [];
    public ProofOfDelivery? ProofOfDelivery { get; set; }
    public ICollection<CheckCall> CheckCalls { get; set; } = [];
    public ICollection<LoadStatusHistory> StatusHistory { get; set; } = [];
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
    // Initial states
    Draft = 0,
    Pending = 1,
    Booked = 2,
    
    // Assignment states
    AwaitingAssignment = 10,
    Assigned = 11,
    Dispatched = 12,
    DriverEnRoute = 13,
    
    // Pickup states
    AtPickup = 20,
    Loading = 21,
    PickedUp = 22,
    
    // In-transit states
    InTransit = 30,
    AtStop = 31,
    Delayed = 32,
    
    // Delivery states
    AtDelivery = 40,
    Unloading = 41,
    Delivered = 42,
    
    // Completion states
    PendingPOD = 50,
    PODReceived = 51,
    Invoiced = 52,
    Completed = 53,
    
    // Exception states
    OnHold = 60,
    Cancelled = 61,
    Problem = 62
}
