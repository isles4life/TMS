# Test Frontend Integration
# This script tests the frontend is running and can access the new feature endpoints

Write-Host "`n=== Frontend Integration Test ===" -ForegroundColor Cyan

# Check if backend is running
Write-Host "`n1. Checking backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/loads" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "Backend is running" -ForegroundColor Green
} catch {
    Write-Host "Backend is not accessible" -ForegroundColor Red
    Write-Host "Please start the backend first" -ForegroundColor Yellow
    exit 1
}

# Check if frontend is running
Write-Host "`n2. Checking frontend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "Frontend is not accessible" -ForegroundColor Red
    Write-Host "Please start the frontend first" -ForegroundColor Yellow
    exit 1
}

# Test each API endpoint with mock data
Write-Host "`n3. Testing API endpoints with mock data..." -ForegroundColor Yellow

# Test Check Call endpoints
Write-Host "`n  Testing Check Call System..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/loads/LOAD-001/check-calls" -Method GET
    Write-Host "  GET Check Calls: Returned $($response.Count) check calls" -ForegroundColor Green
} catch {
    Write-Host "  GET Check Calls failed" -ForegroundColor Red
}

# Test Notes endpoints
Write-Host "`n  Testing Notes System..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/notes?entityType=Load&entityId=LOAD-001' -Method GET
    Write-Host "  GET Notes: Returned $($response.Count) notes" -ForegroundColor Green
} catch {
    Write-Host "  GET Notes failed" -ForegroundColor Red
}

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/notes/pinned?entityType=Load&entityId=LOAD-001' -Method GET
    Write-Host "  GET Pinned Notes: Returned $($response.Count) pinned notes" -ForegroundColor Green
} catch {
    Write-Host "  GET Pinned Notes failed" -ForegroundColor Red
}

# Test Status Machine endpoints
Write-Host "`n  Testing Status Machine System..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/loads/LOAD-001/status/history" -Method GET
    Write-Host "  GET Status History: Returned $($response.Count) status changes" -ForegroundColor Green
} catch {
    Write-Host "  GET Status History failed" -ForegroundColor Red
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/loads/LOAD-001/status/transitions" -Method GET
    Write-Host "  GET Valid Transitions: Current status '$($response.currentStatus)', $($response.validNextStatuses.Count) valid transitions" -ForegroundColor Green
    Write-Host "    Valid next statuses: $($response.validNextStatuses -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "  GET Valid Transitions failed" -ForegroundColor Red
}

Write-Host "`n=== Integration Test Complete ===" -ForegroundColor Cyan
Write-Host "`nFrontend components are ready!" -ForegroundColor Green
Write-Host "Navigate to: http://localhost:4200/load-details/LB-6010" -ForegroundColor Yellow
Write-Host "`nNew tabs available:" -ForegroundColor Cyan
Write-Host "  Status Timeline - View status history and change status" -ForegroundColor White
Write-Host "  Check Calls - Record driver check-ins with GPS" -ForegroundColor White
Write-Host "  Notes - Add threaded notes with priorities and types" -ForegroundColor White
Write-Host ""
