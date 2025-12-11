using System;
using System.Collections.Generic;

namespace TMS.Application.DTOs;

/// <summary>
/// DTO for creating/updating a Proof of Delivery
/// </summary>
public class CreateProofOfDeliveryDto
{
    public string TripId { get; set; } = string.Empty;
    public string LoadId { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;

    public string? RecipientName { get; set; }
    public string? DeliveryNotes { get; set; }
    public DateTime DeliveryDateTime { get; set; }
    public string? DeliveryLocation { get; set; }

    public decimal? DeliveryLatitude { get; set; }
    public decimal? DeliveryLongitude { get; set; }

    public DateTime? EstimatedDeliveryDateTime { get; set; }
    public string? ExceptionNotes { get; set; }
}

/// <summary>
/// DTO for signing a POD (adding signature)
/// </summary>
public class SignProofOfDeliveryDto
{
    public string ProofOfDeliveryId { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    
    /// <summary>
    /// Base64 encoded signature image
    /// </summary>
    public string SignatureData { get; set; } = string.Empty;

    public string? DeliveryNotes { get; set; }
    public decimal? DeliveryLatitude { get; set; }
    public decimal? DeliveryLongitude { get; set; }
}

/// <summary>
/// DTO for adding a photo to POD
/// </summary>
public class AddPODPhotoDto
{
    public string ProofOfDeliveryId { get; set; } = string.Empty;
    public int PhotoType { get; set; } // PODPhotoType enum value
    
    /// <summary>
    /// Base64 encoded image data
    /// </summary>
    public string PhotoData { get; set; } = string.Empty;

    public string? Description { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}

/// <summary>
/// DTO for retrieving POD details
/// </summary>
public class ProofOfDeliveryDto
{
    public string Id { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public string LoadId { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;

    public int Status { get; set; } // PODStatus enum value
    public string? RecipientName { get; set; }
    public string? DeliveryNotes { get; set; }
    public DateTime? DeliveryDateTime { get; set; }
    public string? DeliveryLocation { get; set; }

    public decimal? DeliveryLatitude { get; set; }
    public decimal? DeliveryLongitude { get; set; }

    public bool HasSignature { get; set; }
    public List<PODPhotoDto> Photos { get; set; } = new();

    public DateTime? CompletedDateTime { get; set; }
    public DateTime? EstimatedDeliveryDateTime { get; set; }
    public bool? IsOnTime { get; set; }
    public string? ExceptionNotes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for POD photo
/// </summary>
public class PODPhotoDto
{
    public string Id { get; set; } = string.Empty;
    public int PhotoType { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? Description { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public DateTime CapturedDateTime { get; set; }
}

/// <summary>
/// DTO for POD summary in list views
/// </summary>
public class ProofOfDeliveryListDto
{
    public string Id { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public string LoadId { get; set; } = string.Empty;
    public string DriverId { get; set; } = string.Empty;
    public int Status { get; set; }
    public string? RecipientName { get; set; }
    public DateTime? DeliveryDateTime { get; set; }
    public string? DeliveryLocation { get; set; }
    public bool HasSignature { get; set; }
    public int PhotoCount { get; set; }
    public bool? IsOnTime { get; set; }
}

/// <summary>
/// DTO for completing a POD
/// </summary>
public class CompleteProofOfDeliveryDto
{
    public string ProofOfDeliveryId { get; set; } = string.Empty;
    public string? AdditionalNotes { get; set; }
}
