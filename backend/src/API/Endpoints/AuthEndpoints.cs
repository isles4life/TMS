namespace TMS.API.Endpoints;

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using MediatR;
using TMS.Application.Commands.Auth;
using TMS.Application.DTOs;

public static class AuthEndpoints
{
    public static void RegisterAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapPost("/login", Login)
            .WithName("Login")
            .Produces<LoginResponse>(StatusCodes.Status200OK)
            .Produces<LoginResponse>(StatusCodes.Status401Unauthorized);

        group.MapPost("/register", Register)
            .WithName("Register")
            .Produces<LoginResponse>(StatusCodes.Status201Created)
            .Produces<LoginResponse>(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> Login(LoginRequest request, IMediator mediator)
    {
        var command = new LoginCommand
        {
            Email = request.Email,
            Password = request.Password
        };

        var result = await mediator.Send(command);

        if (result.Success)
        {
            return Results.Ok(result);
        }

        return Results.Unauthorized();
    }

    private static async Task<IResult> Register(RegisterRequest request, IMediator mediator)
    {
        var command = new RegisterCommand
        {
            Email = request.Email,
            Password = request.Password,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var result = await mediator.Send(command);

        if (result.Success)
        {
            return Results.Created($"/api/auth/users/{result.User?.Id}", result);
        }

        return Results.BadRequest(result);
    }
}
