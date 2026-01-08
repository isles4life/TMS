using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMaintenanceModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 8, 17, 30, 17, 605, DateTimeKind.Utc).AddTicks(5413),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 1, 8, 16, 31, 30, 755, DateTimeKind.Utc).AddTicks(7842));

            migrationBuilder.CreateTable(
                name: "MaintenanceSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TractorId = table.Column<Guid>(type: "TEXT", nullable: true),
                    TrailerId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ScheduleName = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    ScheduleType = table.Column<int>(type: "INTEGER", nullable: false),
                    MileageInterval = table.Column<int>(type: "INTEGER", nullable: true),
                    DaysInterval = table.Column<int>(type: "INTEGER", nullable: true),
                    EngineHoursInterval = table.Column<int>(type: "INTEGER", nullable: true),
                    LastServiceMileage = table.Column<decimal>(type: "TEXT", nullable: true),
                    LastServiceDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastServiceEngineHours = table.Column<decimal>(type: "TEXT", nullable: true),
                    CurrentMileage = table.Column<decimal>(type: "TEXT", nullable: false),
                    CurrentEngineHours = table.Column<decimal>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotificationDaysBefore = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenanceSchedules_PowerOnlyTractors_TractorId",
                        column: x => x.TractorId,
                        principalTable: "PowerOnlyTractors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceSchedules_Trailers_TrailerId",
                        column: x => x.TrailerId,
                        principalTable: "Trailers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Vendors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    VendorName = table.Column<string>(type: "TEXT", nullable: false),
                    VendorCode = table.Column<string>(type: "TEXT", nullable: true),
                    VendorType = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    ContactName = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Phone = table.Column<string>(type: "TEXT", nullable: true),
                    Website = table.Column<string>(type: "TEXT", nullable: true),
                    AddressLine1 = table.Column<string>(type: "TEXT", nullable: true),
                    AddressLine2 = table.Column<string>(type: "TEXT", nullable: true),
                    City = table.Column<string>(type: "TEXT", nullable: true),
                    State = table.Column<string>(type: "TEXT", nullable: true),
                    ZipCode = table.Column<string>(type: "TEXT", nullable: true),
                    Country = table.Column<string>(type: "TEXT", nullable: true),
                    TaxId = table.Column<string>(type: "TEXT", nullable: true),
                    LicenseNumber = table.Column<string>(type: "TEXT", nullable: true),
                    LicenseExpirationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ServiceCapabilities = table.Column<string>(type: "TEXT", nullable: true),
                    SpecialtyAreas = table.Column<string>(type: "TEXT", nullable: true),
                    Rating = table.Column<decimal>(type: "TEXT", nullable: true),
                    TotalJobsCompleted = table.Column<int>(type: "INTEGER", nullable: false),
                    AverageCompletionTime = table.Column<decimal>(type: "TEXT", nullable: true),
                    PaymentTermsDays = table.Column<int>(type: "INTEGER", nullable: false),
                    PaymentMethod = table.Column<string>(type: "TEXT", nullable: true),
                    AccountNumber = table.Column<string>(type: "TEXT", nullable: true),
                    HasInsurance = table.Column<bool>(type: "INTEGER", nullable: false),
                    InsuranceExpirationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    InsuranceCoverageAmount = table.Column<decimal>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    LastServiceDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsPreferred = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vendors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    MaintenanceScheduleId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TaskName = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Category = table.Column<int>(type: "INTEGER", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "TEXT", nullable: true),
                    EstimatedDurationMinutes = table.Column<int>(type: "INTEGER", nullable: true),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenanceTasks_MaintenanceSchedules_MaintenanceScheduleId",
                        column: x => x.MaintenanceScheduleId,
                        principalTable: "MaintenanceSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceRecordsNew",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    MaintenanceScheduleId = table.Column<Guid>(type: "TEXT", nullable: true),
                    TractorId = table.Column<Guid>(type: "TEXT", nullable: true),
                    TrailerId = table.Column<Guid>(type: "TEXT", nullable: true),
                    VendorId = table.Column<Guid>(type: "TEXT", nullable: true),
                    RecordType = table.Column<int>(type: "INTEGER", nullable: false),
                    WorkOrderNumber = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    ServiceDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CompletedDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    MileageAtService = table.Column<decimal>(type: "TEXT", nullable: true),
                    EngineHoursAtService = table.Column<decimal>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    LaborCost = table.Column<decimal>(type: "TEXT", nullable: false),
                    PartsCost = table.Column<decimal>(type: "TEXT", nullable: false),
                    TechnicianName = table.Column<string>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceRecordsNew", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenanceRecordsNew_MaintenanceSchedules_MaintenanceScheduleId",
                        column: x => x.MaintenanceScheduleId,
                        principalTable: "MaintenanceSchedules",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceRecordsNew_PowerOnlyTractors_TractorId",
                        column: x => x.TractorId,
                        principalTable: "PowerOnlyTractors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceRecordsNew_Trailers_TrailerId",
                        column: x => x.TrailerId,
                        principalTable: "Trailers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceRecordsNew_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendors",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceRecordItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    MaintenanceRecordId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ItemType = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<decimal>(type: "TEXT", nullable: false),
                    UnitCost = table.Column<decimal>(type: "TEXT", nullable: false),
                    PartNumber = table.Column<string>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceRecordItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MaintenanceRecordItems_MaintenanceRecordsNew_MaintenanceRecordId",
                        column: x => x.MaintenanceRecordId,
                        principalTable: "MaintenanceRecordsNew",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecordItems_MaintenanceRecordId",
                table: "MaintenanceRecordItems",
                column: "MaintenanceRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecordsNew_MaintenanceScheduleId",
                table: "MaintenanceRecordsNew",
                column: "MaintenanceScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecordsNew_TractorId",
                table: "MaintenanceRecordsNew",
                column: "TractorId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecordsNew_TrailerId",
                table: "MaintenanceRecordsNew",
                column: "TrailerId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecordsNew_VendorId",
                table: "MaintenanceRecordsNew",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceSchedules_TractorId",
                table: "MaintenanceSchedules",
                column: "TractorId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceSchedules_TrailerId",
                table: "MaintenanceSchedules",
                column: "TrailerId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceTasks_MaintenanceScheduleId",
                table: "MaintenanceTasks",
                column: "MaintenanceScheduleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MaintenanceRecordItems");

            migrationBuilder.DropTable(
                name: "MaintenanceTasks");

            migrationBuilder.DropTable(
                name: "MaintenanceRecordsNew");

            migrationBuilder.DropTable(
                name: "MaintenanceSchedules");

            migrationBuilder.DropTable(
                name: "Vendors");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 8, 16, 31, 30, 755, DateTimeKind.Utc).AddTicks(7842),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 1, 8, 17, 30, 17, 605, DateTimeKind.Utc).AddTicks(5413));
        }
    }
}
