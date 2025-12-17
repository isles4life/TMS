using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using TMS.Application.Commands;
using TMS.Application.DTOs;
using TMS.Application.Queries;

namespace TMS.API.Endpoints;

/// <summary>
/// Note management endpoints for polymorphic notes on any entity
/// </summary>
public static class NoteEndpoints
{
    public static void RegisterNoteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/{entityType}/{entityId}/notes")
            .WithName("Notes")
            .WithDescription("Polymorphic notes for any entity (loads, drivers, trips, etc.)");

        group.MapPost("", CreateNote)
            .WithName("CreateNote")
            .WithDescription("Create a new note for an entity");

        group.MapGet("", GetEntityNotes)
            .WithName("GetEntityNotes")
            .WithDescription("Get all notes for an entity");

        group.MapGet("/pinned", GetPinnedNotes)
            .WithName("GetPinnedNotes")
            .WithDescription("Get all pinned notes for an entity");

        group.MapGet("/{noteId}", GetNoteById)
            .WithName("GetNoteById")
            .WithDescription("Get a specific note by ID");

        group.MapPut("/{noteId}", UpdateNote)
            .WithName("UpdateNote")
            .WithDescription("Update an existing note");

        group.MapDelete("/{noteId}", DeleteNote)
            .WithName("DeleteNote")
            .WithDescription("Delete a note");
    }

    private static async Task<IResult> CreateNote(
        IMediator mediator,
        string entityType,
        Guid entityId,
        CreateUpdateNoteRequest request,
        Guid? userId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var command = new CreateNoteCommand
            {
                EntityType = entityType,
                EntityId = entityId,
                Content = request.Content,
                Type = request.Type,
                Priority = request.Priority,
                IsPinned = request.IsPinned,
                IsVisibleToCustomer = request.IsVisibleToCustomer,
                UserId = userId,
                ParentNoteId = request.ParentNoteId
            };

            var result = await mediator.Send(command, cancellationToken);
            return Results.Created($"/api/{entityType}/{entityId}/notes/{result.Id}", result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    private static async Task<IResult> GetEntityNotes(
        IMediator mediator,
        string entityType,
        Guid entityId,
        bool includeDeleted = false,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetEntityNotesQuery 
            { 
                EntityType = entityType, 
                EntityId = entityId,
                IncludeDeleted = includeDeleted
            };
            var result = await mediator.Send(query, cancellationToken);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    private static async Task<IResult> GetPinnedNotes(
        IMediator mediator,
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetPinnedNotesQuery 
            { 
                EntityType = entityType, 
                EntityId = entityId 
            };
            var result = await mediator.Send(query, cancellationToken);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    private static async Task<IResult> GetNoteById(
        IMediator mediator,
        string entityType,
        Guid entityId,
        Guid noteId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetNoteByIdQuery { NoteId = noteId };
            var result = await mediator.Send(query, cancellationToken);
            
            if (result == null)
                return Results.NotFound();

            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    private static async Task<IResult> UpdateNote(
        IMediator mediator,
        string entityType,
        Guid entityId,
        Guid noteId,
        CreateUpdateNoteRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var command = new UpdateNoteCommand
            {
                NoteId = noteId,
                Content = request.Content,
                Type = request.Type,
                Priority = request.Priority,
                IsPinned = request.IsPinned,
                IsVisibleToCustomer = request.IsVisibleToCustomer
            };

            var result = await mediator.Send(command, cancellationToken);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }

    private static async Task<IResult> DeleteNote(
        IMediator mediator,
        string entityType,
        Guid entityId,
        Guid noteId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var command = new DeleteNoteCommand { NoteId = noteId };
            var result = await mediator.Send(command, cancellationToken);
            
            if (result)
                return Results.NoContent();
            
            return Results.NotFound();
        }
        catch (Exception ex)
        {
            return Results.BadRequest(ex.Message);
        }
    }
}
