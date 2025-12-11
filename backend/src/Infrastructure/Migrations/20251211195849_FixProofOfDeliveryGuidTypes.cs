using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixProofOfDeliveryGuidTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProofOfDeliveryId",
                table: "Loads",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProofsOfDelivery",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    TripId = table.Column<string>(type: "TEXT", nullable: false),
                    LoadId = table.Column<string>(type: "TEXT", nullable: false),
                    DriverId = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    RecipientName = table.Column<string>(type: "TEXT", nullable: true),
                    SignatureData = table.Column<string>(type: "TEXT", nullable: true),
                    DeliveryNotes = table.Column<string>(type: "TEXT", nullable: true),
                    DeliveryDateTime = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeliveryLocation = table.Column<string>(type: "TEXT", nullable: true),
                    DeliveryLatitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    DeliveryLongitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    CompletedDateTime = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EstimatedDeliveryDateTime = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsOnTime = table.Column<bool>(type: "INTEGER", nullable: true),
                    ExceptionNotes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProofsOfDelivery", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PODPhotos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProofOfDeliveryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PhotoType = table.Column<int>(type: "INTEGER", nullable: false),
                    PhotoUrl = table.Column<string>(type: "TEXT", nullable: false),
                    FileSizeBytes = table.Column<long>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Latitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    Longitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    CapturedDateTime = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValue: new DateTime(2025, 12, 11, 19, 58, 49, 206, DateTimeKind.Utc).AddTicks(5648)),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PODPhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PODPhotos_ProofsOfDelivery_ProofOfDeliveryId",
                        column: x => x.ProofOfDeliveryId,
                        principalTable: "ProofsOfDelivery",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Loads_ProofOfDeliveryId",
                table: "Loads",
                column: "ProofOfDeliveryId");

            migrationBuilder.CreateIndex(
                name: "IX_PODPhotos_ProofOfDeliveryId",
                table: "PODPhotos",
                column: "ProofOfDeliveryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProofsOfDelivery_DriverId",
                table: "ProofsOfDelivery",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_ProofsOfDelivery_LoadId",
                table: "ProofsOfDelivery",
                column: "LoadId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProofsOfDelivery_TripId",
                table: "ProofsOfDelivery",
                column: "TripId");

            migrationBuilder.AddForeignKey(
                name: "FK_Loads_ProofsOfDelivery_ProofOfDeliveryId",
                table: "Loads",
                column: "ProofOfDeliveryId",
                principalTable: "ProofsOfDelivery",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Loads_ProofsOfDelivery_ProofOfDeliveryId",
                table: "Loads");

            migrationBuilder.DropTable(
                name: "PODPhotos");

            migrationBuilder.DropTable(
                name: "ProofsOfDelivery");

            migrationBuilder.DropIndex(
                name: "IX_Loads_ProofOfDeliveryId",
                table: "Loads");

            migrationBuilder.DropColumn(
                name: "ProofOfDeliveryId",
                table: "Loads");
        }
    }
}
