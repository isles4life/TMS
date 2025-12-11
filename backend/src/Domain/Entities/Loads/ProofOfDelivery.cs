using System;
using System.Collections.Generic;
using TMS.Domain.Common;

namespace TMS.Domain.Entities.Loads;

/// <summary>
/// Represents proof of delivery documentation including signature and photos
/// </summary>
public class ProofOfDelivery : BaseEntity
{
    public string TripId { get; set; } = string.Empty;
    public string LoadId { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;

    /// <summary>
    /// Delivery status: Draft, Pending, Signed, Completed
    /// </summary>
    public PODStatus Status { get; set; } = PODStatus.Draft;

    /// <summary>
    /// Recipient name who signed for delivery
    /// </summary>
    public string? RecipientName { get; set; }

    /// <summary>
    /// Recipient signature as base64 encoded image
    /// </summary>
    public string? SignatureData { get; set; }

    /// <summary>
    /// Notes or special delivery instructions
    /// </summary>
    public string? DeliveryNotes { get; set; }

    /// <summary>
    /// Actual delivery date/time
    /// </summary>
    public DateTime? DeliveryDateTime { get; set; }

    /// <summary>
    /// Delivery location (usually from trip destination)
    /// </summary>
    public string? DeliveryLocation { get; set; }

    /// <summary>
    /// Latitude of actual delivery location
    /// </summary>
    public decimal? DeliveryLatitude { get; set; }

    /// <summary>
    /// Longitude of actual delivery location
    /// </summary>
    public decimal? DeliveryLongitude { get; set; }

    /// <summary>
    /// Collection of delivery photos
    /// </summary>
    public ICollection<PODPhoto> Photos { get; set; } = new List<PODPhoto>();

    /// <summary>
    /// Completed date/time for auditing
    /// </summary>
    public DateTime? CompletedDateTime { get; set; }

    /// <summary>
    /// Original estimated delivery date for comparison
    /// </summary>
    public DateTime? EstimatedDeliveryDateTime { get; set; }

    /// <summary>
    /// Flag if delivery was on-time
    /// </summary>
    public bool? IsOnTime { get; set; }

    /// <summary>
    /// Any exceptions or issues during delivery
    /// </summary>
    public string? ExceptionNotes { get; set; }
}

/// <summary>
/// Individual photo in a POD
/// </summary>
public class PODPhoto : BaseEntity
{
    public Guid ProofOfDeliveryId { get; set; }
    public ProofOfDelivery? ProofOfDelivery { get; set; }

    /// <summary>
    /// Photo type: LoadCondition, SignedDocuments, Delivery, Damage, Other
    /// </summary>
    public PODPhotoType PhotoType { get; set; }

    /// <summary>
    /// Photo URL or file path
    /// </summary>
    public string PhotoUrl { get; set; } = string.Empty;

    /// <summary>
    /// Photo file size in bytes
    /// </summary>
    public long FileSizeBytes { get; set; }

    /// <summary>
    /// Photo caption or description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Latitude where photo was taken
    /// </summary>
    public decimal? Latitude { get; set; }

    /// <summary>
    /// Longitude where photo was taken
    /// </summary>
    public decimal? Longitude { get; set; }

    /// <summary>
    /// Timestamp when photo was captured
    /// </summary>
    public DateTime CapturedDateTime { get; set; }
}

/// <summary>
/// POD status enumeration
/// </summary>
public enum PODStatus
{
    Draft = 0,
    Pending = 1,
    Signed = 2,
    Completed = 3,
    Rejected = 4,
    Cancelled = 5
}

/// <summary>
/// Photo type enumeration for categorizing delivery photos
/// </summary>
public enum PODPhotoType
{
    LoadCondition = 0,
    SignedDocuments = 1,
    DeliveryProof = 2,
    DamageReport = 3,
    SafetyCompliance = 4,
    Other = 5
}
