# Test Check Call API endpoints

Write-Host "Testing Check Call API Endpoints" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test data
$loadId = "550e8400-e29b-41d4-a716-446655440000"
$driverId = "550e8400-e29b-41d4-a716-446655440001"

# Test 1: Create Check Call
Write-Host "`n1. Creating Check Call..." -ForegroundColor Cyan
$body = @{
    contactMethod = "Phone"
    location = "I-75 Atlanta, GA"
    latitude = 33.75
    longitude = -84.39
    isTruckEmpty = $false
    trailerTemperature = 68
    eta = "2 hours"
    notes = "Running smoothly, no issues"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/loads/$loadId/check-calls?driverId=$driverId" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
    # Extract the created check call ID for next test
    $createdCheckCall = $response.Content | ConvertFrom-Json
    $checkCallId = $createdCheckCall.id
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Get Load Check Calls
Write-Host "`n2. Getting all Check Calls for Load..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/loads/$loadId/check-calls" `
        -Method GET `
        -UseBasicParsing

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Check Call by ID
Write-Host "`n3. Getting Check Call by ID..." -ForegroundColor Cyan
try {
    # Get the list first to get a valid check call ID
    $listResponse = Invoke-WebRequest `
        -Uri "http://localhost:5000/api/loads/$loadId/check-calls" `
        -Method GET `
        -UseBasicParsing
    
    $checkCalls = ($listResponse.Content | ConvertFrom-Json).value
    if ($checkCalls -and $checkCalls.Count -gt 0) {
        $firstCheckCallId = $checkCalls[0].id
        
        $response = Invoke-WebRequest `
            -Uri "http://localhost:5000/api/loads/$loadId/check-calls/$firstCheckCallId" `
            -Method GET `
            -UseBasicParsing

        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Yellow
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    } else {
        Write-Host "No check calls found to test GetById" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "Tests Complete" -ForegroundColor Green
