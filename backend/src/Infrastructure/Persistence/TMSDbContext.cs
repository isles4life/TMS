namespace TMS.Infrastructure.Persistence;

using System;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities;
using TMS.Domain.Entities.Companies;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Equipment;
using TMS.Domain.Entities.Loads;
using TMS.Domain.Entities.Trips;
using TMS.Domain.Entities.Users;
using TMS.Domain.Entities.Tracking;

/// <summary>
/// Database context for TMS
/// </summary>
public class TMSDbContext : DbContext
{
    public TMSDbContext(DbContextOptions<TMSDbContext> options) : base(options) { }

    public DbSet<Carrier> Carriers { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<PowerOnlyTractor> PowerOnlyTractors { get; set; }
    public DbSet<Trailer> Trailers { get; set; }
    public DbSet<Load> Loads { get; set; }
    public DbSet<Trip> Trips { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<MaintenanceRecord> MaintenanceRecords { get; set; }
    public DbSet<ComplianceDocument> ComplianceDocuments { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Dispatch> Dispatches { get; set; }
    public DbSet<DriverAvailability> DriverAvailabilities { get; set; }
    public DbSet<DriverLocation> DriverLocations { get; set; }
    public DbSet<GeofenceAlert> GeofenceAlerts { get; set; }
    public DbSet<ProofOfDelivery> ProofsOfDelivery { get; set; }
    public DbSet<PODPhoto> PODPhotos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure entity mappings and relationships
        modelBuilder.Entity<Carrier>()
            .HasMany(c => c.Drivers)
            .WithOne(d => d.Carrier)
            .HasForeignKey(d => d.CarrierId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Carrier>()
            .HasMany(c => c.Equipment)
            .WithOne(e => e.Carrier)
            .HasForeignKey(e => e.CarrierId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Load>()
            .HasMany(l => l.Trips)
            .WithOne(t => t.Load)
            .HasForeignKey(t => t.LoadId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Driver>()
            .HasMany(d => d.ComplianceDocuments)
            .WithOne(cd => cd.Driver)
            .HasForeignKey(cd => cd.DriverId)
            .OnDelete(DeleteBehavior.Cascade);

        // Value objects
        modelBuilder.Entity<Carrier>()
            .OwnsOne(c => c.Address);

        modelBuilder.Entity<Driver>()
            .OwnsOne(d => d.Address);

        modelBuilder.Entity<Load>()
            .OwnsOne(l => l.PickupLocation);

        modelBuilder.Entity<Load>()
            .OwnsOne(l => l.DeliveryLocation);

        modelBuilder.Entity<Carrier>()
            .OwnsOne(c => c.InsuranceInfo);

        // User configuration
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        modelBuilder.Entity<User>()
            .Property(u => u.PasswordHash)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(u => u.FirstName)
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.LastName)
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasDefaultValue(UserRole.Carrier);

        // Dispatch relationships
        modelBuilder.Entity<Dispatch>()
            .HasOne(d => d.Load)
            .WithMany()
            .HasForeignKey(d => d.LoadId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Dispatch>()
            .HasOne(d => d.Driver)
            .WithMany()
            .HasForeignKey(d => d.DriverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Dispatch>()
            .HasOne(d => d.Tractor)
            .WithMany()
            .HasForeignKey(d => d.TractorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Dispatch>()
            .HasOne(d => d.Trailer)
            .WithMany()
            .HasForeignKey(d => d.TrailerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Driver Availability relationships
        modelBuilder.Entity<DriverAvailability>()
            .HasOne(da => da.Driver)
            .WithMany()
            .HasForeignKey(da => da.DriverId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DriverAvailability>()
            .OwnsOne(da => da.CurrentLocation);

        // Driver Location relationships
        modelBuilder.Entity<DriverLocation>()
            .HasOne(dl => dl.Driver)
            .WithMany()
            .HasForeignKey(dl => dl.DriverId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DriverLocation>()
            .HasOne(dl => dl.Dispatch)
            .WithMany()
            .HasForeignKey(dl => dl.DispatchId)
            .OnDelete(DeleteBehavior.SetNull);

        // Geofence Alert relationships
        modelBuilder.Entity<GeofenceAlert>()
            .HasOne(ga => ga.DriverLocation)
            .WithMany()
            .HasForeignKey(ga => ga.DriverLocationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GeofenceAlert>()
            .HasOne(ga => ga.Dispatch)
            .WithMany()
            .HasForeignKey(ga => ga.DispatchId)
            .OnDelete(DeleteBehavior.Cascade);

        // Proof of Delivery relationships
        modelBuilder.Entity<ProofOfDelivery>()
            .HasMany(p => p.Photos)
            .WithOne(ph => ph.ProofOfDelivery)
            .HasForeignKey(ph => ph.ProofOfDeliveryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProofOfDelivery>()
            .Property(p => p.Status)
            .HasDefaultValue(PODStatus.Draft);

        modelBuilder.Entity<ProofOfDelivery>()
            .HasIndex(p => p.LoadId)
            .IsUnique();

        modelBuilder.Entity<ProofOfDelivery>()
            .HasIndex(p => p.TripId);

        modelBuilder.Entity<ProofOfDelivery>()
            .HasIndex(p => p.DriverId);

        modelBuilder.Entity<PODPhoto>()
            .Property(p => p.CapturedDateTime)
            .HasDefaultValue(DateTime.UtcNow);
    }
}
