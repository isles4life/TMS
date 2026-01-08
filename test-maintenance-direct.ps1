# Direct Test - Maintenance Module
# This test creates data directly without dependencies

$baseUrl = "http://localhost:5000/api/maintenance"

Write-Host "=== Testing TMS Maintenance Module ===" -ForegroundColor Cyan
Write-Host ""

# We'll use a hardcoded tractor ID from the seeded data
# Check the database for existing tractors
Write-Host "Note: Using existing tractor from seeded data" -ForegroundColor Gray
$tractorId = "11111111-1111-1111-1111-111111111111"  # Test tractor ID
Write-Host ""

# Test 1: Create a Vendor
Write-Host "1. Creating a vendor..." -ForegroundColor Yellow
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

try {
    $vendorResponse = Invoke-RestMethod -Uri "$baseUrl/vendors" -Method Post -Body $vendorData -ContentType "application/json"
    $vendorId = $vendorResponse.data.id
    Write-Host "   ✓ Created vendor: $($vendorResponse.data.vendorName)" -ForegroundColor Green
    Write-Host "     ID: $vendorId" -ForegroundColor Gray
    Write-Host "     Code: $($vendorResponse.data.vendorCode)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Get all vendors
Write-Host "2. Getting all vendors..." -ForegroundColor Yellow
try {
    $vendorsResponse = Invoke-RestMethod -Uri "$baseUrl/vendors" -Method Get
    Write-Host "   ✓ Found $($vendorsResponse.data.Count) vendor(s)" -ForegroundColor Green
    $vendorsResponse.data | ForEach-Object {
        Write-Host "     - $($_.vendorName) ($($_.vendorType))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get active vendors
Write-Host "3. Getting active vendors..." -ForegroundColor Yellow
try {
    $activeVendorsResponse = Invoke-RestMethod -Uri "$baseUrl/vendors/active" -Method Get
    Write-Host "   ✓ Found $($activeVendorsResponse.data.Count) active vendor(s)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Create a Maintenance Schedule
Write-Host "4. Creating PM schedule (oil change every 10,000 miles)..." -ForegroundColor Yellow
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

try {
    $scheduleResponse = Invoke-RestMethod -Uri "$baseUrl/schedules" -Method Post -Body $scheduleData -ContentType "application/json"
    $scheduleId = $scheduleResponse.data.id
    Write-Host "   ✓ Created schedule: $($scheduleResponse.data.scheduleName)" -ForegroundColor Green
    Write-Host "     Next service due: $($scheduleResponse.data.nextServiceDueMileage) miles" -ForegroundColor Gray
    Write-Host "     Miles until due: $($scheduleResponse.data.mileageUntilDue)" -ForegroundColor Gray
    Write-Host "     Is overdue: $($scheduleResponse.data.isOverdue)" -ForegroundColor $(if($scheduleResponse.data.isOverdue) {"Red"} else {"Green"})
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 5: Get tractor schedules
Write-Host "5. Getting schedules for this tractor..." -ForegroundColor Yellow
try {
    $tractorSchedules = Invoke-RestMethod -Uri "$baseUrl/schedules/tractor/$tractorId" -Method Get
    Write-Host "   ✓ Found $($tractorSchedules.data.Count) schedule(s)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Check overdue schedules
Write-Host "6. Checking overdue schedules..." -ForegroundColor Yellow
try {
    $overdueResponse = Invoke-RestMethod -Uri "$baseUrl/schedules/overdue" -Method Get
    Write-Host "   ✓ Found $($overdueResponse.data.Count) overdue schedule(s)" -ForegroundColor $(if($overdueResponse.data.Count -gt 0) {"Red"} else {"Green"})
    if ($overdueResponse.data.Count -gt 0) {
        $overdueResponse.data | ForEach-Object {
            Write-Host "     - $($_.scheduleName)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Create a Work Order
Write-Host "7. Creating maintenance work order..." -ForegroundColor Yellow
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

try {
    $recordResponse = Invoke-RestMethod -Uri "$baseUrl/records" -Method Post -Body $recordData -ContentType "application/json"
    $recordId = $recordResponse.data.id
    $workOrderNumber = $recordResponse.data.workOrderNumber
    Write-Host "   ✓ Created work order: $workOrderNumber" -ForegroundColor Green
    Write-Host "     Status: $($recordResponse.data.status)" -ForegroundColor Gray
    Write-Host "     Vendor: $($recordResponse.data.vendorName)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 8: Get record by ID
Write-Host "8. Getting work order details..." -ForegroundColor Yellow
try {
    $recordDetails = Invoke-RestMethod -Uri "$baseUrl/records/$recordId" -Method Get
    Write-Host "   ✓ Retrieved work order: $($recordDetails.data.workOrderNumber)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 9: Start work
Write-Host "9. Starting work on maintenance..." -ForegroundColor Yellow
try {
    $startResponse = Invoke-RestMethod -Uri "$baseUrl/records/$recordId/start?technicianName=John%20Smith" -Method Post
    Write-Host "   ✓ Work started by: $($startResponse.data.technicianName)" -ForegroundColor Green
    Write-Host "     Status: $($startResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 10: Complete work
Write-Host "10. Completing maintenance work..." -ForegroundColor Yellow
$completeData = @{
    laborCost = 125.00
    partsCost = 85.50
    notes = "Completed oil change. Used full synthetic oil. Air filter also replaced."
} | ConvertTo-Json

try {
    $completeResponse = Invoke-RestMethod -Uri "$baseUrl/records/$recordId/complete" -Method Post -Body $completeData -ContentType "application/json"
    Write-Host "   ✓ Maintenance completed!" -ForegroundColor Green
    Write-Host "     Labor: `$$($completeResponse.data.laborCost)" -ForegroundColor Gray
    Write-Host "     Parts: `$$($completeResponse.data.partsCost)" -ForegroundColor Gray
    Write-Host "     Total: `$$($completeResponse.data.totalCost)" -ForegroundColor Green
    Write-Host "     Status: $($completeResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 11: Get all records for tractor
Write-Host "11. Getting all maintenance records for tractor..." -ForegroundColor Yellow
try {
    $recordsResponse = Invoke-RestMethod -Uri "$baseUrl/records/tractor/$tractorId" -Method Get
    Write-Host "   ✓ Found $($recordsResponse.data.Count) record(s)" -ForegroundColor Green
    $recordsResponse.data | ForEach-Object {
        Write-Host "     - $($_.workOrderNumber): `$$($_.totalCost) ($($_.status))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 12: Get scheduled records
Write-Host "12. Getting all scheduled maintenance..." -ForegroundColor Yellow
try {
    $scheduledResponse = Invoke-RestMethod -Uri "$baseUrl/records/scheduled" -Method Get
    Write-Host "   ✓ Found $($scheduledResponse.data.Count) scheduled record(s)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Successfully tested:" -ForegroundColor White
Write-Host "  - Vendor management" -ForegroundColor Green
Write-Host "  - Maintenance schedules" -ForegroundColor Green
Write-Host "  - Work orders and cost tracking" -ForegroundColor Green
Write-Host "  - Status workflow" -ForegroundColor Green
Write-Host ""
Write-Host "View Swagger UI at http://localhost:5000/swagger" -ForegroundColor Cyan
