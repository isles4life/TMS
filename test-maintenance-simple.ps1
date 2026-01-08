# Simple Test script for Maintenance Module
$baseUrl = "http://localhost:5000/api/maintenance"

Write-Host "=== Testing TMS Maintenance Module ===" -ForegroundColor Cyan
Write-Host ""

# Get a tractor
Write-Host "1. Getting existing tractor..." -ForegroundColor Yellow
$tractors = Invoke-RestMethod -Uri "http://localhost:5000/api/equipment/tractors" -Method Get
if ($tractors.data -and $tractors.data.Count -gt 0) {
    $tractorId = $tractors.data[0].id
    Write-Host "   Found tractor: $($tractors.data[0].unitNumber) (ID: $tractorId)" -ForegroundColor Green
} else {
    Write-Host "   No tractors found" -ForegroundColor Red
    exit
}

Write-Host ""

# Create a Vendor
Write-Host "2. Creating a vendor..." -ForegroundColor Yellow
$vendorData = @{
    vendorName = "Mike's Truck Repair"
    vendorType = 0
    contactName = "Mike Johnson"
    email = "mike@trucksrepair.com"
    phone = "555-0123"
    addressLine1 = "123 Service Rd"
    city = "Dallas"
    state = "TX"
    zipCode = "75201"
} | ConvertTo-Json

$vendorResponse = Invoke-RestMethod -Uri "$baseUrl/vendors" -Method Post -Body $vendorData -ContentType "application/json"
$vendorId = $vendorResponse.data.id
Write-Host "   Created vendor: $($vendorResponse.data.vendorName)" -ForegroundColor Green

Write-Host ""

# Create a Maintenance Schedule
Write-Host "3. Creating PM schedule (oil change every 10,000 miles)..." -ForegroundColor Yellow
$scheduleData = @{
    tractorId = $tractorId
    trailerId = $null
    scheduleName = "Oil Change Service"
    description = "Regular oil change and filter replacement"
    scheduleType = 0
    mileageInterval = 10000
    lastServiceMileage = 50000
    currentMileage = 58000
    notificationDaysBefore = 7
} | ConvertTo-Json

$scheduleResponse = Invoke-RestMethod -Uri "$baseUrl/schedules" -Method Post -Body $scheduleData -ContentType "application/json"
$scheduleId = $scheduleResponse.data.id
Write-Host "   Created schedule: $($scheduleResponse.data.scheduleName)" -ForegroundColor Green
Write-Host "   Next service due: $($scheduleResponse.data.nextServiceDueMileage) miles" -ForegroundColor Gray
Write-Host "   Miles until due: $($scheduleResponse.data.mileageUntilDue)" -ForegroundColor Gray
Write-Host "   Is overdue: $($scheduleResponse.data.isOverdue)" -ForegroundColor $(if($scheduleResponse.data.isOverdue) {"Red"} else {"Green"})

Write-Host ""

# Check Overdue Schedules
Write-Host "4. Checking overdue schedules..." -ForegroundColor Yellow
$overdueResponse = Invoke-RestMethod -Uri "$baseUrl/schedules/overdue" -Method Get
Write-Host "   Found $($overdueResponse.data.Count) overdue schedule(s)" -ForegroundColor $(if($overdueResponse.data.Count -gt 0) {"Red"} else {"Green"})

Write-Host ""

# Create a Work Order
Write-Host "5. Creating maintenance work order..." -ForegroundColor Yellow
$recordData = @{
    tractorId = $tractorId
    trailerId = $null
    maintenanceScheduleId = $scheduleId
    vendorId = $vendorId
    recordType = 0
    description = "Oil change and filter replacement service"
    serviceDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    mileageAtService = 58000
} | ConvertTo-Json

$recordResponse = Invoke-RestMethod -Uri "$baseUrl/records" -Method Post -Body $recordData -ContentType "application/json"
$recordId = $recordResponse.data.id
$workOrderNumber = $recordResponse.data.workOrderNumber
Write-Host "   Created work order: $workOrderNumber" -ForegroundColor Green
Write-Host "   Status: $($recordResponse.data.status)" -ForegroundColor Gray

Write-Host ""

# Start Work
Write-Host "6. Starting work..." -ForegroundColor Yellow
$startResponse = Invoke-RestMethod -Uri "$baseUrl/records/$recordId/start?technicianName=John%20Smith" -Method Post
Write-Host "   Work started by: $($startResponse.data.technicianName)" -ForegroundColor Green
Write-Host "   Status: $($startResponse.data.status)" -ForegroundColor Gray

Write-Host ""

# Complete Work
Write-Host "7. Completing maintenance..." -ForegroundColor Yellow
$completeData = @{
    laborCost = 125.00
    partsCost = 85.50
    notes = "Completed oil change. Used full synthetic oil."
} | ConvertTo-Json

$completeResponse = Invoke-RestMethod -Uri "$baseUrl/records/$recordId/complete" -Method Post -Body $completeData -ContentType "application/json"
Write-Host "   Maintenance completed!" -ForegroundColor Green
Write-Host "   Labor: `$$($completeResponse.data.laborCost)" -ForegroundColor Gray
Write-Host "   Parts: `$$($completeResponse.data.partsCost)" -ForegroundColor Gray
Write-Host "   Total: `$$($completeResponse.data.totalCost)" -ForegroundColor Gray

Write-Host ""

# Get Records
Write-Host "8. Getting maintenance records for tractor..." -ForegroundColor Yellow
$recordsResponse = Invoke-RestMethod -Uri "$baseUrl/records/tractor/$tractorId" -Method Get
Write-Host "   Found $($recordsResponse.data.Count) record(s)" -ForegroundColor Green

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  Vendor: Mike's Truck Repair" -ForegroundColor Green
Write-Host "  Schedule: Oil Change Service (every 10,000 miles)" -ForegroundColor Green
Write-Host "  Work Order: $workOrderNumber" -ForegroundColor Green
Write-Host "  Total Cost: `$210.50" -ForegroundColor Green
Write-Host ""
Write-Host "Swagger UI: http://localhost:5000/swagger" -ForegroundColor Cyan
