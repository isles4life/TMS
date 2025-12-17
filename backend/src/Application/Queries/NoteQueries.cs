namespace TMS.Application.Queries;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TMS.Application.DTOs;

/// <summary>
/// Query to get all notes for a specific entity
/// </summary>
public class GetEntityNotesQuery : IRequest<List<NoteDto>>
{
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public bool IncludeDeleted { get; set; }
}

/// <summary>
/// Handler for retrieving notes by entity
/// </summary>
public class GetEntityNotesHandler : IRequestHandler<GetEntityNotesQuery, List<NoteDto>>
{
    public async Task<List<NoteDto>> Handle(GetEntityNotesQuery request, CancellationToken cancellationToken)
    {
        // In production: query database for notes matching EntityType and EntityId
        var mockNotes = new List<NoteDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                Content = "Driver confirmed pickup time. ETA 2:00 PM.",
                Type = "StatusUpdate",
                Priority = "Normal",
                IsPinned = false,
                IsVisibleToCustomer = true,
                UserId = Guid.NewGuid(),
                UserName = "Sarah Dispatcher",
                CreatedAt = DateTime.UtcNow.AddHours(-3)
            },
            new()
            {
                Id = Guid.NewGuid(),
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                Content = "Customer requested special handling - fragile items. Use extra padding.",
                Type = "Important",
                Priority = "High",
                IsPinned = true,
                IsVisibleToCustomer = false,
                UserId = Guid.NewGuid(),
                UserName = "John Manager",
                CreatedAt = DateTime.UtcNow.AddHours(-5)
            },
            new()
            {
                Id = Guid.NewGuid(),
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                Content = "Delivery rescheduled to tomorrow due to receiver availability.",
                Type = "CustomerCommunication",
                Priority = "Normal",
                IsPinned = false,
                IsVisibleToCustomer = true,
                UserId = Guid.NewGuid(),
                UserName = "Mike CS Rep",
                CreatedAt = DateTime.UtcNow.AddHours(-1)
            }
        };

        await Task.CompletedTask;
        return mockNotes.OrderByDescending(n => n.CreatedAt).ToList();
    }
}

/// <summary>
/// Query to get a specific note by ID
/// </summary>
public class GetNoteByIdQuery : IRequest<NoteDto?>
{
    public Guid NoteId { get; set; }
}

/// <summary>
/// Handler for retrieving a specific note
/// </summary>
public class GetNoteByIdHandler : IRequestHandler<GetNoteByIdQuery, NoteDto?>
{
    public async Task<NoteDto?> Handle(GetNoteByIdQuery request, CancellationToken cancellationToken)
    {
        // In production: query database for note by ID
        var mockNote = new NoteDto
        {
            Id = request.NoteId,
            EntityType = "Load",
            EntityId = Guid.NewGuid(),
            Content = "This is a detailed note with important information.",
            Type = "General",
            Priority = "Normal",
            IsPinned = false,
            IsVisibleToCustomer = false,
            UserId = Guid.NewGuid(),
            UserName = "System User",
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        };

        await Task.CompletedTask;
        return mockNote;
    }
}

/// <summary>
/// Query to get all pinned notes for an entity
/// </summary>
public class GetPinnedNotesQuery : IRequest<List<NoteDto>>
{
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
}

/// <summary>
/// Handler for retrieving pinned notes
/// </summary>
public class GetPinnedNotesHandler : IRequestHandler<GetPinnedNotesQuery, List<NoteDto>>
{
    public async Task<List<NoteDto>> Handle(GetPinnedNotesQuery request, CancellationToken cancellationToken)
    {
        // In production: query database for pinned notes
        var mockNotes = new List<NoteDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                Content = "URGENT: This load requires temperature control at 35°F.",
                Type = "Alert",
                Priority = "Urgent",
                IsPinned = true,
                IsVisibleToCustomer = false,
                UserId = Guid.NewGuid(),
                UserName = "Safety Officer",
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        await Task.CompletedTask;
        return mockNotes;
    }
}
