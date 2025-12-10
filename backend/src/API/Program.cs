using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using MediatR;
using System.Threading.Tasks;
using Swashbuckle.AspNetCore.SwaggerUI;
using TMS.API;
using TMS.API.Endpoints;
using TMS.Application.Commands.PowerOnly;
using TMS.Application.Queries.PowerOnly;
using TMS.Application.Commands.Equipment;
using TMS.Application.Commands.Drivers;
using TMS.Application.Queries.Equipment;
using TMS.Application.Queries.Drivers;
using TMS.Infrastructure.Services;
using TMS.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Global unhandled exception hooks to capture silent crashes
AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
{
    Console.Error.WriteLine($"UNHANDLED EXCEPTION: {e.ExceptionObject}");
};
TaskScheduler.UnobservedTaskException += (sender, e) =>
{
    Console.Error.WriteLine($"UNOBSERVED TASK EXCEPTION: {e.Exception}");
    e.SetObserved();
};

// Add Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=tms.db;";
builder.Services.AddDbContext<TMSDbContext>(options =>
    options.UseSqlite(connectionString));

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "TMS API",
        Version = "v1",
        Description = "Transportation Management System API - Power Only Module"
    });
});

// Add MediatR - register from Application assembly
builder.Services.AddMediatR(cfg => 
{
    cfg.RegisterServicesFromAssembly(typeof(CreatePowerOnlyLoadHandler).Assembly);
});

// Add Authentication Services
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TMSDbContext>();
    // Ensure database is created from model (for SQLite development)
    db.Database.EnsureCreated();
    
    // Seed test user if database is empty
    try
    {
        if (!db.Users.Any())
        {
            var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();
            var testUser = new TMS.Domain.Entities.Users.User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                PasswordHash = passwordService.HashPassword("password123"),
                FirstName = "Test",
                LastName = "User",
                Role = TMS.Domain.Entities.Users.UserRole.Carrier,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(testUser);
            db.SaveChanges();
            Console.WriteLine("Seeded test user: test@example.com / password123");
        }
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"Error seeding test user: {ex.Message}");
    }
}

try
{
    if (app.Environment.EnvironmentName == "Development")
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "TMS API v1");
            options.DocExpansion(DocExpansion.List);
        });
    }

    // Skip HTTPS redirection in Development
    if (app.Environment.EnvironmentName != "Development")
    {
        app.UseHttpsRedirection();
    }
    app.UseCors("AllowAll");
    app.UseAuthorization();

    // Add middleware to catch exceptions
    app.Use(async (context, next) =>
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"ERROR in middleware: {ex}");
            context.Response.StatusCode = 500;
        }
    });

    // Register minimal API endpoints
    app.MapHealthCheck();
    app.RegisterAuthEndpoints();
    app.RegisterPowerOnlyEndpoints();
    app.RegisterEquipmentEndpoints();
    app.RegisterDriverEndpoints();

    // Lifecycle logging helpers to diagnose unexpected shutdowns
    var lifetime = app.Lifetime;
    lifetime.ApplicationStarted.Register(() => Console.WriteLine("LIFECYCLE: ApplicationStarted"));
    lifetime.ApplicationStopping.Register(() => Console.WriteLine("LIFECYCLE: ApplicationStopping"));
    lifetime.ApplicationStopped.Register(() => Console.WriteLine("LIFECYCLE: ApplicationStopped"));

    Console.WriteLine("About to call app.Run()");

    app.Run();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"FATAL ERROR: {ex}");
    throw;
}


