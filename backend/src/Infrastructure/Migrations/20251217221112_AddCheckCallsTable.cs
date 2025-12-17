using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckCallsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 17, 22, 11, 12, 586, DateTimeKind.Utc).AddTicks(3389),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 12, 11, 19, 58, 49, 206, DateTimeKind.Utc).AddTicks(5648));

            migrationBuilder.CreateTable(
                name: "CheckCalls",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LoadId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DriverId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CheckInTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ContactMethod = table.Column<string>(type: "TEXT", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: true),
                    Latitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    Longitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    IsTruckEmpty = table.Column<bool>(type: "INTEGER", nullable: false),
                    TrailerTemperature = table.Column<int>(type: "INTEGER", nullable: true),
                    ETA = table.Column<string>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckCalls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckCalls_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CheckCalls_Loads_LoadId",
                        column: x => x.LoadId,
                        principalTable: "Loads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CheckCalls_DriverId",
                table: "CheckCalls",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckCalls_LoadId",
                table: "CheckCalls",
                column: "LoadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CheckCalls");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 11, 19, 58, 49, 206, DateTimeKind.Utc).AddTicks(5648),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 12, 17, 22, 11, 12, 586, DateTimeKind.Utc).AddTicks(3389));
        }
    }
}
