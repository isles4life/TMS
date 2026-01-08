using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddComplianceModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 8, 16, 31, 30, 755, DateTimeKind.Utc).AddTicks(7842),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 1, 8, 1, 26, 32, 574, DateTimeKind.Utc).AddTicks(2540));

            migrationBuilder.CreateTable(
                name: "ComplianceAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: true),
                    VehicleId = table.Column<Guid>(type: "TEXT", nullable: true),
                    AlertType = table.Column<int>(type: "INTEGER", nullable: false),
                    Severity = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    NotificationSent = table.Column<bool>(type: "INTEGER", nullable: false),
                    NotificationSentAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AlertDaysBefore = table.Column<int>(type: "INTEGER", nullable: false),
                    IsAcknowledged = table.Column<bool>(type: "INTEGER", nullable: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AcknowledgedBy = table.Column<string>(type: "TEXT", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComplianceAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComplianceAlerts_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DriverQualificationFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DocumentType = table.Column<int>(type: "INTEGER", nullable: false),
                    DocumentNumber = table.Column<string>(type: "TEXT", nullable: false),
                    IssueDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IssuingAuthority = table.Column<string>(type: "TEXT", nullable: false),
                    IssuingState = table.Column<string>(type: "TEXT", nullable: false),
                    DocumentPath = table.Column<string>(type: "TEXT", nullable: true),
                    IsVerified = table.Column<bool>(type: "INTEGER", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    VerifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverQualificationFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DriverQualificationFiles_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DriverSafetyScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CalculatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PeriodStartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    PeriodEndDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    OverallScore = table.Column<decimal>(type: "TEXT", nullable: false),
                    AccidentScore = table.Column<decimal>(type: "TEXT", nullable: false),
                    ViolationScore = table.Column<decimal>(type: "TEXT", nullable: false),
                    HOSComplianceScore = table.Column<decimal>(type: "TEXT", nullable: false),
                    InspectionScore = table.Column<decimal>(type: "TEXT", nullable: false),
                    DrivingBehaviorScore = table.Column<decimal>(type: "TEXT", nullable: false),
                    AccidentCount = table.Column<int>(type: "INTEGER", nullable: false),
                    ViolationCount = table.Column<int>(type: "INTEGER", nullable: false),
                    HOSViolationCount = table.Column<int>(type: "INTEGER", nullable: false),
                    InspectionCount = table.Column<int>(type: "INTEGER", nullable: false),
                    HardBrakingCount = table.Column<int>(type: "INTEGER", nullable: false),
                    SpeedingCount = table.Column<int>(type: "INTEGER", nullable: false),
                    IdleTimeMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    MilesDriven = table.Column<decimal>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverSafetyScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DriverSafetyScores_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FMCSASMSData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DOTNumber = table.Column<string>(type: "TEXT", nullable: false),
                    DataDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UnsafeDrivingScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    CrashIndicatorScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    HOSComplianceScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    VehicleMaintenanceScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    ControlledSubstancesScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    HazMatComplianceScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    DriverFitnessScore = table.Column<decimal>(type: "TEXT", nullable: true),
                    InspectionCount = table.Column<int>(type: "INTEGER", nullable: false),
                    ViolationCount = table.Column<int>(type: "INTEGER", nullable: false),
                    OutOfServiceCount = table.Column<int>(type: "INTEGER", nullable: false),
                    UnsafeDrivingPercentile = table.Column<int>(type: "INTEGER", nullable: true),
                    CrashIndicatorPercentile = table.Column<int>(type: "INTEGER", nullable: true),
                    HOSCompliancePercentile = table.Column<int>(type: "INTEGER", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DataSource = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FMCSASMSData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HOSLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndTime = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: true),
                    Latitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    Longitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    VehicleId = table.Column<string>(type: "TEXT", nullable: true),
                    Odometer = table.Column<decimal>(type: "TEXT", nullable: true),
                    Source = table.Column<int>(type: "INTEGER", nullable: false),
                    IsEdited = table.Column<bool>(type: "INTEGER", nullable: false),
                    EditedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EditReason = table.Column<string>(type: "TEXT", nullable: true),
                    IsCertified = table.Column<bool>(type: "INTEGER", nullable: false),
                    CertifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HOSLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HOSLogs_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HOSViolations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: false),
                    HOSLogId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ViolationDateTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ViolationType = table.Column<int>(type: "INTEGER", nullable: false),
                    Severity = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    ActualValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    LimitValue = table.Column<decimal>(type: "TEXT", nullable: false),
                    IsResolved = table.Column<bool>(type: "INTEGER", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HOSViolations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HOSViolations_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HOSViolations_HOSLogs_HOSLogId",
                        column: x => x.HOSLogId,
                        principalTable: "HOSLogs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceAlerts_DriverId",
                table: "ComplianceAlerts",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_DriverQualificationFiles_DriverId",
                table: "DriverQualificationFiles",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_DriverSafetyScores_DriverId",
                table: "DriverSafetyScores",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_HOSLogs_DriverId",
                table: "HOSLogs",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_HOSViolations_DriverId",
                table: "HOSViolations",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_HOSViolations_HOSLogId",
                table: "HOSViolations",
                column: "HOSLogId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComplianceAlerts");

            migrationBuilder.DropTable(
                name: "DriverQualificationFiles");

            migrationBuilder.DropTable(
                name: "DriverSafetyScores");

            migrationBuilder.DropTable(
                name: "FMCSASMSData");

            migrationBuilder.DropTable(
                name: "HOSViolations");

            migrationBuilder.DropTable(
                name: "HOSLogs");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 1, 8, 1, 26, 32, 574, DateTimeKind.Utc).AddTicks(2540),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 1, 8, 16, 31, 30, 755, DateTimeKind.Utc).AddTicks(7842));
        }
    }
}
