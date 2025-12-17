namespace TMS.Application.DTOs;

using System;

/// <summary>
/// DTO for Note responses
/// </summary>
public class NoteDto
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public bool IsPinned { get; set; }
    public bool IsVisibleToCustomer { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public Guid? ParentNoteId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request DTO for creating or updating a note
/// </summary>
public class CreateUpdateNoteRequest
{
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = "General";
    public string Priority { get; set; } = "Normal";
    public bool IsPinned { get; set; }
    public bool IsVisibleToCustomer { get; set; }
    public Guid? ParentNoteId { get; set; }
}
