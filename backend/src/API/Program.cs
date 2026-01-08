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
using TMS.Application.Services;
using TMS.Infrastructure.Services;
using TMS.Infrastructure.Persistence;
using TMS.Infrastructure.Repositories;

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

// Add Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Add Dispatch Service
builder.Services.AddScoped<IDispatchService, DispatchService>();

// Add Tracking Service
builder.Services.AddScoped<ITrackingService, TrackingService>();

// Add Route Optimization Service
builder.Services.AddHttpClient(); // Required for HERE Maps API calls
builder.Services.AddScoped<IRouteOptimizationService, RouteOptimizationService>();

// Add ProofOfDelivery Service and Repositories
builder.Services.AddScoped<TMS.Domain.Repositories.IProofOfDeliveryRepository, TMS.Infrastructure.Repositories.ProofOfDeliveryRepository>();
builder.Services.AddScoped<TMS.Domain.Repositories.IPODPhotoRepository, TMS.Infrastructure.Repositories.PODPhotoRepository>();
builder.Services.AddScoped<IProofOfDeliveryService, ProofOfDeliveryService>();

// Add Analytics Service
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

// Add Invoice Service and Repository
builder.Services.AddScoped<TMS.Domain.Repositories.IInvoiceRepository, TMS.Infrastructure.Repositories.InvoiceRepository>();
builder.Services.AddScoped<InvoiceService>();

// Add Compliance Services and Repositories
builder.Services.AddScoped<TMS.Domain.Repositories.IHOSRepository, TMS.Infrastructure.Repositories.HOSRepository>();
builder.Services.AddScoped<TMS.Domain.Repositories.IComplianceRepository, TMS.Infrastructure.Repositories.ComplianceRepository>();
builder.Services.AddScoped<TMS.Application.Services.Compliance.HOSRulesEngine>();
builder.Services.AddScoped<TMS.Application.Services.Compliance.HOSService>();
builder.Services.AddScoped<TMS.Application.Services.Compliance.ComplianceService>();
builder.Services.AddScoped<TMS.Application.Services.Compliance.SafetyScoringService>();

// Add Maintenance Services and Repositories
builder.Services.AddScoped<TMS.Domain.Repositories.IMaintenanceScheduleRepository, TMS.Infrastructure.Repositories.MaintenanceScheduleRepository>();
builder.Services.AddScoped<TMS.Domain.Repositories.IMaintenanceRecordRepository, TMS.Infrastructure.Repositories.MaintenanceRecordRepository>();
builder.Services.AddScoped<TMS.Domain.Repositories.IVendorRepository, TMS.Infrastructure.Repositories.VendorRepository>();
builder.Services.AddScoped<TMS.Application.Services.Maintenance.MaintenanceSchedulingService>();
builder.Services.AddScoped<TMS.Application.Services.Maintenance.MaintenanceRecordService>();
builder.Services.AddScoped<TMS.Application.Services.Maintenance.VendorService>();

// Add SignalR for real-time tracking
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200", "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Apply migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TMSDbContext>();
    // Apply pending migrations (creates database if needed)
    db.Database.Migrate();
    
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

    // Seed test data (drivers, equipment, loads)
    try
    {
        await SeedData.InitializeAsync(db);
        Console.WriteLine("Seeded test data successfully");
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"Error seeding test data: {ex.Message}");
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
    app.RegisterEmailEndpoints();
    app.RegisterPowerOnlyEndpoints();
    app.RegisterEquipmentEndpoints();
    app.RegisterDriverEndpoints();
    app.RegisterDispatchEndpoints();
    app.RegisterTrackingEndpoints();
    app.RegisterRouteEndpoints();
    app.MapProofOfDeliveryEndpoints();
    app.RegisterCheckCallEndpoints();
    app.RegisterNoteEndpoints();
    app.RegisterLoadStatusEndpoints();
    app.MapAnalyticsEndpoints();
    app.MapInvoiceEndpoints();
    app.MapHOSEndpoints();
    app.MapComplianceEndpoints();
    app.MapMaintenanceEndpoints();

    // Register SignalR hubs
    app.MapHub<TMS.API.Hubs.TrackingHub>("/hubs/tracking");
    app.MapHub<TMS.API.Hubs.PODHub>("/hubs/pod");

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


