namespace TMS.Application.Commands;

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;
using TMS.Domain.Entities.Notes;

/// <summary>
/// Command to create a new note for any entity
/// </summary>
public class CreateNoteCommand : IRequest<NoteDto>
{
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = "General";
    public string Priority { get; set; } = "Normal";
    public bool IsPinned { get; set; }
    public bool IsVisibleToCustomer { get; set; }
    public Guid? UserId { get; set; }
    public Guid? ParentNoteId { get; set; }
}

/// <summary>
/// Handler for creating notes
/// </summary>
public class CreateNoteHandler : IRequestHandler<CreateNoteCommand, NoteDto>
{
    public async Task<NoteDto> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
    {
        // In production: validate entity exists, create note, save to database
        var noteId = Guid.NewGuid();
        
        var dto = new NoteDto
        {
            Id = noteId,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Content = request.Content,
            Type = request.Type,
            Priority = request.Priority,
            IsPinned = request.IsPinned,
            IsVisibleToCustomer = request.IsVisibleToCustomer,
            UserId = request.UserId ?? Guid.NewGuid(),
            UserName = "System User", // Would come from user context
            ParentNoteId = request.ParentNoteId,
            CreatedAt = DateTime.UtcNow
        };

        await Task.CompletedTask;
        return dto;
    }
}

/// <summary>
/// Command to update an existing note
/// </summary>
public class UpdateNoteCommand : IRequest<NoteDto>
{
    public Guid NoteId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = "General";
    public string Priority { get; set; } = "Normal";
    public bool IsPinned { get; set; }
    public bool IsVisibleToCustomer { get; set; }
}

/// <summary>
/// Handler for updating notes
/// </summary>
public class UpdateNoteHandler : IRequestHandler<UpdateNoteCommand, NoteDto>
{
    public async Task<NoteDto> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        // In production: fetch note, update fields, save to database
        var dto = new NoteDto
        {
            Id = request.NoteId,
            EntityType = "Load",
            EntityId = Guid.NewGuid(),
            Content = request.Content,
            Type = request.Type,
            Priority = request.Priority,
            IsPinned = request.IsPinned,
            IsVisibleToCustomer = request.IsVisibleToCustomer,
            UserId = Guid.NewGuid(),
            UserName = "System User",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow
        };

        await Task.CompletedTask;
        return dto;
    }
}

/// <summary>
/// Command to delete a note
/// </summary>
public class DeleteNoteCommand : IRequest<bool>
{
    public Guid NoteId { get; set; }
}

/// <summary>
/// Handler for deleting notes
/// </summary>
public class DeleteNoteHandler : IRequestHandler<DeleteNoteCommand, bool>
{
    public async Task<bool> Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
    {
        // In production: soft delete the note
        await Task.CompletedTask;
        return true;
    }
}
