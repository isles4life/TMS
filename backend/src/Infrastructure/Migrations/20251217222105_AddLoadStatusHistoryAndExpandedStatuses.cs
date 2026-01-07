using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLoadStatusHistoryAndExpandedStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 17, 22, 21, 5, 312, DateTimeKind.Utc).AddTicks(7756),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 12, 17, 22, 14, 31, 570, DateTimeKind.Utc).AddTicks(3922));

            migrationBuilder.CreateTable(
                name: "LoadStatusHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    LoadId = table.Column<Guid>(type: "TEXT", nullable: false),
                    PreviousStatus = table.Column<int>(type: "INTEGER", nullable: true),
                    NewStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ChangedByUserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Reason = table.Column<string>(type: "TEXT", nullable: true),
                    Location = table.Column<string>(type: "TEXT", nullable: true),
                    Latitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    Longitude = table.Column<decimal>(type: "TEXT", nullable: true),
                    IsAutomatic = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoadStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoadStatusHistories_Loads_LoadId",
                        column: x => x.LoadId,
                        principalTable: "Loads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoadStatusHistories_ChangedAt",
                table: "LoadStatusHistories",
                column: "ChangedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LoadStatusHistories_LoadId",
                table: "LoadStatusHistories",
                column: "LoadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LoadStatusHistories");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CapturedDateTime",
                table: "PODPhotos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 12, 17, 22, 14, 31, 570, DateTimeKind.Utc).AddTicks(3922),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 12, 17, 22, 21, 5, 312, DateTimeKind.Utc).AddTicks(7756));
        }
    }
}
