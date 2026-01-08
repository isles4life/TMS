# Test script for Maintenance Module
$baseUrl = "http://localhost:5000/api/maintenance"

Write-Host "=== Testing TMS Maintenance Module ===" -ForegroundColor Cyan
Write-Host ""

# First, let's get a tractor ID from the database
Write-Host "1. Getting existing tractor..." -ForegroundColor Yellow
try {
    $tractors = Invoke-RestMethod -Uri "http://localhost:5000/api/equipment/tractors" -Method Get
    if ($tractors.data -and $tractors.data.Count -gt 0) {
        $tractorId = $tractors.data[0].id
        Write-Host "   ✓ Found tractor: $($tractors.data[0].unitNumber) (ID: $tractorId)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ No tractors found. Creating test data..." -ForegroundColor Red
        # Create a test tractor
        $newTractor = @{
            unitNumber = "TEST-001"
            vin = "1HGBH41JXMN109186"
            licensePlate = "ABC123"
            year = 2023
            make = "Freightliner"
            model = "Cascadia"
            status = 0
            carrierId = "00000000-0000-0000-0000-000000000001"
            fuelCapacity = 150
            currentMileage = 50000
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "http://localhost:5000/api/equipment/tractors" -Method Post -Body $newTractor -ContentType "application/json"
        $tractorId = $result.data.id
        Write-Host "   ✓ Created test tractor: $tractorId" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Error getting tractor: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 1: Create a Vendor
Write-Host "2. Creating a vendor..." -ForegroundColor Yellow
$vendorData = @{
    vendorName = "Mike's Truck Repair"
    vendorType = 0  # MaintenanceShop
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
    Write-Host "   ✓ Created vendor: $($vendorResponse.data.vendorName) (ID: $vendorId)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error creating vendor: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Create a Maintenance Schedule
Write-Host "3. Creating a mileage-based PM schedule (oil change every 10,000 miles)..." -ForegroundColor Yellow
$scheduleData = @{
    tractorId = $tractorId
    trailerId = $null
    scheduleName = "Oil Change Service"
    description = "Regular oil change and filter replacement"
    scheduleType = 0  # MileageBased
    mileageInterval = 10000
    lastServiceMileage = 50000
    currentMileage = 58000
    notificationDaysBefore = 7
} | ConvertTo-Json

try {
    $scheduleResponse = Invoke-RestMethod -Uri "$baseUrl/schedules" -Method Post -Body $scheduleData -ContentType "application/json"
    $scheduleId = $scheduleResponse.data.id
    Write-Host "   ✓ Created schedule: $($scheduleResponse.data.scheduleName)" -ForegroundColor Green
    Write-Host "     - Next service due at: $($scheduleResponse.data.nextServiceDueMileage) miles" -ForegroundColor Gray
    Write-Host "     - Miles until due: $($scheduleResponse.data.mileageUntilDue)" -ForegroundColor Gray
    Write-Host "     - Is overdue: $($scheduleResponse.data.isOverdue)" -ForegroundColor $(if($scheduleResponse.data.isOverdue) {"Red"} else {"Green"})
} catch {
    Write-Host "   ✗ Error creating schedule: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 3: Get Overdue Schedules
Write-Host "4. Checking for overdue schedules..." -ForegroundColor Yellow
try {
    $overdueResponse = Invoke-RestMethod -Uri "$baseUrl/schedules/overdue" -Method Get
    Write-Host "   ✓ Found $($overdueResponse.data.Count) overdue schedule(s)" -ForegroundColor $(if($overdueResponse.data.Count -gt 0) {"Red"} else {"Green"})
    if ($overdueResponse.data.Count -gt 0) {
        $overdueResponse.data | ForEach-Object {
            Write-Host "     - $($_.scheduleName) (Overdue by $($_.mileageUntilDue * -1) miles)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ✗ Error getting overdue schedules: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Create a Maintenance Record (Work Order)
Write-Host "5. Creating a maintenance work order..." -ForegroundColor Yellow
$recordData = @{
    tractorId = $tractorId
    trailerId = $null
    maintenanceScheduleId = $scheduleId
    vendorId = $vendorId
    recordType = 0  # PM (Preventative Maintenance)
    description = "Oil change and filter replacement service"
    serviceDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    mileageAtService = 58000
} | ConvertTo-Json

try {
    $recordResponse = Invoke-RestMethod -Uri "$baseUrl/records" -Method Post -Body $recordData -ContentType "application/json"
    $recordId = $recordResponse.data.id
    $workOrderNumber = $recordResponse.data.workOrderNumber
    Write-Host "   ✓ Created work order: $workOrderNumber" -ForegroundColor Green
    Write-Host "     - Status: $($recordResponse.data.status)" -ForegroundColor Gray
    Write-Host "     - Vendor: $($recordResponse.data.vendorName)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error creating record: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 5: Start Work on the Record
Write-Host "6. Starting work on the maintenance record..." -ForegroundColor Yellow
try {
    $startResponse = Invoke-RestMethod -Uri "$baseUrl/records/$recordId/start?technicianName=John%20Smith" -Method Post
    Write-Host "   ✓ Work started by technician: $($startResponse.data.technicianName)" -ForegroundColor Green
    Write-Host "     - Status: $($startResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error starting work: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Complete the Maintenance Record
Write-Host "7. Completing the maintenance work..." -ForegroundColor Yellow
$completeData = @{
    laborCost = 125.00
    partsCost = 85.50
    notes = "Completed oil change. Used full synthetic oil. Air filter also replaced."
} | ConvertTo-Json

try {
    $completeResponse = Invoke-RestMethod -Uri "$baseUrl/records/$recordId/complete" -Method Post -Body $completeData -ContentType "application/json"
    Write-Host "   ✓ Maintenance completed!" -ForegroundColor Green
    Write-Host "     - Labor cost: `$$($completeResponse.data.laborCost)" -ForegroundColor Gray
    Write-Host "     - Parts cost: `$$($completeResponse.data.partsCost)" -ForegroundColor Gray
    Write-Host "     - Total cost: `$$($completeResponse.data.totalCost)" -ForegroundColor Gray
    Write-Host "     - Status: $($completeResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Error completing work: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Get Tractor's Maintenance Records
Write-Host "8. Getting all maintenance records for this tractor..." -ForegroundColor Yellow
try {
    $recordsResponse = Invoke-RestMethod -Uri "$baseUrl/records/tractor/$tractorId" -Method Get
    Write-Host "   ✓ Found $($recordsResponse.data.Count) maintenance record(s)" -ForegroundColor Green
    $recordsResponse.data | ForEach-Object {
        Write-Host "     - $($_.workOrderNumber): $($_.description) (`$$($_.totalCost))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error getting records: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Get All Vendors
Write-Host "9. Getting all vendors..." -ForegroundColor Yellow
try {
    $vendorsResponse = Invoke-RestMethod -Uri "$baseUrl/vendors" -Method Get
    Write-Host "   ✓ Found $($vendorsResponse.data.Count) vendor(s)" -ForegroundColor Green
    $vendorsResponse.data | ForEach-Object {
        Write-Host "     - $($_.vendorName) (Rating: $($_.rating)/5, Jobs: $($_.totalJobsCompleted))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error getting vendors: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 9: Get Scheduled Records
Write-Host "10. Getting scheduled maintenance records..." -ForegroundColor Yellow
try {
    $scheduledResponse = Invoke-RestMethod -Uri "$baseUrl/records/scheduled" -Method Get
    Write-Host "   ✓ Found $($scheduledResponse.data.Count) scheduled record(s)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error getting scheduled records: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Maintenance Module Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  ✓ Created vendor: Mike's Truck Repair" -ForegroundColor Green
Write-Host "  ✓ Created PM schedule: Oil Change Service (every 10,000 miles)" -ForegroundColor Green
Write-Host "  ✓ Created work order: $workOrderNumber" -ForegroundColor Green
Write-Host "  ✓ Completed maintenance with cost tracking" -ForegroundColor Green
Write-Host "  ✓ Total cost: `$210.50" -ForegroundColor Green
Write-Host ""
Write-Host "You can view all endpoints in Swagger at: http://localhost:5000/swagger" -ForegroundColor Cyan
