# Test Polymorphic Notes API

Write-Host "Testing Polymorphic Notes API" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$loadId = "550e8400-e29b-41d4-a716-446655440000"
$entityType = "loads"

# Test 1: Create Note for Load
Write-Host "`n1. Creating Note for Load..." -ForegroundColor Cyan
$body = @{
    content = "Customer requested temperature control at 35°F for this shipment"
    type = "Important"
    priority = "High"
    isPinned = $true
    isVisibleToCustomer = $false
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/$entityType/$loadId/notes" `
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

# Test 2: Create Another Note
Write-Host "`n2. Creating General Note..." -ForegroundColor Cyan
$body2 = @{
    content = "Driver John called - running 15 minutes early"
    type = "StatusUpdate"
    priority = "Normal"
    isPinned = $false
    isVisibleToCustomer = $true
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/$entityType/$loadId/notes" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body2 `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get All Notes for Entity
Write-Host "`n3. Getting all notes for load..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/$entityType/$loadId/notes" `
        -Method GET `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $notes = $response.Content | ConvertFrom-Json
    $notes | ConvertTo-Json -Depth 10
    
    if ($notes -and $notes.Count -gt 0) {
        $firstNoteId = $notes[0].id
        
        # Test 4: Get Specific Note
        Write-Host "`n4. Getting specific note by ID..." -ForegroundColor Cyan
        $response = Invoke-WebRequest `
            -Uri "http://localhost:5000/api/$entityType/$loadId/notes/$firstNoteId" `
            -Method GET `
            -UseBasicParsing

        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Yellow
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Pinned Notes
Write-Host "`n5. Getting pinned notes..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/$entityType/$loadId/notes/pinned" `
        -Method GET `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "Tests Complete" -ForegroundColor Green
