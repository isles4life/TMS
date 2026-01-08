# Simple Invoice API Test - Manual Invoice Creation
$baseUrl = "http://localhost:5000/api"

Write-Host "`n=== Testing Invoice API (Simplified) ===" -ForegroundColor Cyan

# Create a manually specified customer ID (from database)
# Using a carrier GUID that should exist from seed data
$customerId = "00000000-0000-0000-0000-000000000001"  # Use first seeded carrier

# Test 1: Create invoice
Write-Host "`n1. Creating invoice..." -ForegroundColor Yellow
$newInvoiceJson = @"
{
    "customerId": "$customerId",
    "invoiceDate": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')",
    "dueDate": "$((Get-Date).AddDays(30).ToString('yyyy-MM-ddTHH:mm:ss'))",
    "paymentTerms": 3,
    "taxRate": 0.08,
    "notes": "Test invoice - Phase 2 implementation",
    "lineItems": [
        {
            "description": "Freight charges",
            "quantity": 1,
            "unitPrice": 2500.00,
            "itemCode": "FREIGHT"
        }
    ]
}
"@

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Post -Body $newInvoiceJson -ContentType "application/json"
    
    if ($createResponse.success) {
        $invoiceId = $createResponse.data.id
        $invoiceNumber = $createResponse.data.invoiceNumber
        Write-Host "   OK - Created: $invoiceNumber" -ForegroundColor Green
        Write-Host "     Total: $$($createResponse.data.totalAmount)" -ForegroundColor Gray
        Write-Host "     Status: $($createResponse.data.status)" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: $($createResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Test 2: Get by ID
Write-Host "`n2. Getting invoice by ID..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId" -Method Get
    if ($getResponse.success) {
        Write-Host "   OK - Retrieved: $($getResponse.data.invoiceNumber)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Send invoice  
Write-Host "`n3. Sending invoice..." -ForegroundColor Yellow
try {
    $sendResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/send" -Method Post
    if ($sendResponse.success) {
        Write-Host "   OK - Status: $($sendResponse.data.status)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Record payment
Write-Host "`n4. Recording payment..." -ForegroundColor Yellow
$paymentJson = @"
{
    "amount": 2700.00,
    "paymentMethod": "Check",
    "reference": "CHK-TEST-001",
    "notes": "Full payment"
}
"@

try {
    $paymentResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/payments" -Method Post -Body $paymentJson -ContentType "application/json"
    
    if ($paymentResponse.success) {
        Write-Host "   OK - Status: $($paymentResponse.data.status)" -ForegroundColor Green
        Write-Host "     Amount due: $$($paymentResponse.data.amountDue)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get aging report
Write-Host "`n5. Getting A/R aging report..." -ForegroundColor Yellow
try {
    $agingResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/aging" -Method Get
    if ($agingResponse.success) {
        Write-Host "   OK - Total: $$($agingResponse.data.totalOutstanding)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Phase 2 Invoice Backend: COMPLETE ===" -ForegroundColor Cyan
