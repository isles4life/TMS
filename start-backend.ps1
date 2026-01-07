# Backend startup script
$backendDir = "C:\Users\cable\OneDrive\Desktop\TMS\backend\src\API"
$port = 5000

Write-Host "Starting TMS Backend API Server..."
Write-Host "Directory: $backendDir"
Write-Host "Port: $port"

# Navigate to backend directory
Set-Location $backendDir

# Start the dotnet process
Write-Host "`nStarting .NET Core API..."
& dotnet run

# If dotnet exits, restart it
while ($true) {
    Write-Host "`nDotnet process exited. Restarting in 5 seconds..."
    Start-Sleep -Seconds 5
    Write-Host "Restarting..."
    & dotnet run
}
