# Frontend startup script
$frontendDir = "C:\Users\cable\OneDrive\Desktop\TMS\frontend"
$port = 4200

Write-Host "Starting TMS Frontend Server..."
Write-Host "Directory: $frontendDir"
Write-Host "Port: $port"

# Kill any existing node processes on port 4200
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node' } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Navigate to frontend directory
Set-Location $frontendDir

# Start the Express server
Write-Host "`nStarting Express server..."
& node server.js

# If server exits, restart it
while ($true) {
    Write-Host "`nServer process exited. Restarting in 5 seconds..."
    Start-Sleep -Seconds 5
    & node server.js
}
