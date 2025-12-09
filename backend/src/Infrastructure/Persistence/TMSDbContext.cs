namespace TMS.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using TMS.Domain.Entities;
using TMS.Domain.Entities.Companies;
using TMS.Domain.Entities.Drivers;
using TMS.Domain.Entities.Equipment;
using TMS.Domain.Entities.Loads;
using TMS.Domain.Entities.Trips;
using TMS.Domain.Entities.Users;

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
            .HasMaxLength(50)
            .HasDefaultValue("User");
    }
}
