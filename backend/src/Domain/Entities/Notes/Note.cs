namespace TMS.Domain.Entities.Notes;

using System;
using System.Collections.Generic;
using TMS.Domain.Common;

/// <summary>
/// Polymorphic note entity that can be attached to any entity
/// </summary>
public class Note : BaseEntity
{
    /// <summary>
    /// The type of entity this note is attached to (Load, Driver, Trip, etc.)
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// The ID of the entity this note is attached to
    /// </summary>
    public Guid EntityId { get; set; }

    /// <summary>
    /// The content of the note
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Category/type of note for filtering (General, Important, Issue, Resolution, etc.)
    /// </summary>
    public NoteType Type { get; set; } = NoteType.General;

    /// <summary>
    /// Priority level for the note
    /// </summary>
    public NotePriority Priority { get; set; } = NotePriority.Normal;

    /// <summary>
    /// Whether this note is pinned/starred
    /// </summary>
    public bool IsPinned { get; set; }

    /// <summary>
    /// Whether this note is visible to customers/external parties
    /// </summary>
    public bool IsVisibleToCustomer { get; set; }

    /// <summary>
    /// User ID of the person who created the note
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Optional: Reference to parent note for threading/replies
    /// </summary>
    public Guid? ParentNoteId { get; set; }

    /// <summary>
    /// Navigation property for parent note
    /// </summary>
    public Note? ParentNote { get; set; }

    /// <summary>
    /// Navigation property for child notes (replies)
    /// </summary>
    public ICollection<Note> Replies { get; set; } = [];
}

public enum NoteType
{
    General,
    Important,
    Issue,
    Resolution,
    CustomerCommunication,
    InternalOnly,
    StatusUpdate,
    Instruction,
    Alert
}

public enum NotePriority
{
    Low,
    Normal,
    High,
    Urgent
}
