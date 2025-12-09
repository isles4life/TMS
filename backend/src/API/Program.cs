using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
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


