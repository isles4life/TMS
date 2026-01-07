namespace TMS.Domain.Entities.Loads;

using System;
using TMS.Domain.Common;

/// <summary>
/// Tracks the history of load status changes for audit trail and state machine validation
/// </summary>
public class LoadStatusHistory : BaseEntity
{
    /// <summary>
    /// The load this status change belongs to
    /// </summary>
    public Guid LoadId { get; set; }

    /// <summary>
    /// The previous status before this change
    /// </summary>
    public LoadStatus? PreviousStatus { get; set; }

    /// <summary>
    /// The new status after this change
    /// </summary>
    public LoadStatus NewStatus { get; set; }

    /// <summary>
    /// When the status change occurred
    /// </summary>
    public DateTime ChangedAt { get; set; }

    /// <summary>
    /// User who made the status change
    /// </summary>
    public Guid? ChangedByUserId { get; set; }

    /// <summary>
    /// Optional reason or notes for the status change
    /// </summary>
    public string? Reason { get; set; }

    /// <summary>
    /// Location where status change occurred (if applicable)
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// GPS coordinates when status changed
    /// </summary>
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    /// <summary>
    /// Whether this was an automatic status change (e.g., from GPS) or manual
    /// </summary>
    public bool IsAutomatic { get; set; }

    /// <summary>
    /// Navigation property to the load
    /// </summary>
    public Load? Load { get; set; }
}
