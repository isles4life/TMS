# Test Load Status State Machine API

Write-Host "Testing Load Status State Machine API" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$loadId = "550e8400-e29b-41d4-a716-446655440000"

# Test 1: Get Valid Status Transitions
Write-Host "`n1. Getting valid status transitions..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/loads/$loadId/status/transitions" `
        -Method GET `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Change Load Status (Valid Transition)
Write-Host "`n2. Changing status to DriverEnRoute (valid transition)..." -ForegroundColor Cyan
$body = @{
    newStatus = "DriverEnRoute"
    reason = "Driver started moving toward pickup location"
    location = "I-75 near Atlanta, GA"
    latitude = 33.7490
    longitude = -84.3880
    isAutomatic = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/loads/$loadId/status/change" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Try Invalid Transition
Write-Host "`n3. Attempting invalid status change to Completed (should fail)..." -ForegroundColor Cyan
$bodyInvalid = @{
    newStatus = "Completed"
    reason = "Trying to skip states"
    isAutomatic = $false
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/loads/$loadId/status/change" `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyInvalid `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    $errorResponse = $_.ErrorDetails.Message
    Write-Host "Expected Error (validation working!):" -ForegroundColor Green
    Write-Host $errorResponse -ForegroundColor Yellow
}

# Test 4: Get Status History
Write-Host "`n4. Getting status history..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/loads/$loadId/status/history" `
        -Method GET `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $history = $response.Content | ConvertFrom-Json
    $history | ConvertTo-Json -Depth 10
    
    Write-Host "`nStatus Timeline:" -ForegroundColor Cyan
    foreach ($entry in $history) {
        $arrow = if ($entry.previousStatus) { "$($entry.previousStatus) -> " } else { "" }
        Write-Host "  $arrow$($entry.newStatus) at $($entry.changedAt) by $($entry.changedByUserName)" -ForegroundColor White
        if ($entry.reason) {
            Write-Host "    Reason: $($entry.reason)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "Tests Complete" -ForegroundColor Green
