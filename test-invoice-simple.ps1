# Test Invoice API Endpoints
$baseUrl = "http://localhost:5000/api"

Write-Host "`n=== Testing Invoice API ===" -ForegroundColor Cyan

# First, get a carrier to use as customer
Write-Host "`n1. Getting carriers..." -ForegroundColor Yellow
try {
    $carriers = Invoke-RestMethod -Uri "$baseUrl/carriers" -Method Get -Headers @{"Accept" = "application/json"}
    if ($carriers.data -and $carriers.data.Count -gt 0) {
        $customerId = $carriers.data[0].id
        Write-Host "   OK - Found carrier: $($carriers.data[0].companyName) (ID: $customerId)" -ForegroundColor Green
    } else {
        Write-Host "   ERROR - No carriers found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERROR getting carriers: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create an invoice
Write-Host "`n2. Creating invoice..." -ForegroundColor Yellow
$newInvoiceJson = @"
{
    "customerId": "$customerId",
    "invoiceDate": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')",
    "dueDate": "$((Get-Date).AddDays(30).ToString('yyyy-MM-ddTHH:mm:ss'))",
    "paymentTerms": 3,
    "taxRate": 0.08,
    "notes": "Test invoice created via API",
    "lineItems": [
        {
            "description": "Freight charges for Load #12345",
            "quantity": 1,
            "unitPrice": 2500.00,
            "itemCode": "FREIGHT"
        },
        {
            "description": "Fuel surcharge",
            "quantity": 1,
            "unitPrice": 150.00,
            "itemCode": "FUEL"
        },
        {
            "description": "Loading/Unloading fee",
            "quantity": 2,
            "unitPrice": 75.00,
            "itemCode": "LABOR"
        }
    ]
}
"@

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Post -Body $newInvoiceJson -ContentType "application/json"
    
    if ($createResponse.success) {
        $invoiceId = $createResponse.data.id
        $invoiceNumber = $createResponse.data.invoiceNumber
        Write-Host "   OK - Created invoice: $invoiceNumber (ID: $invoiceId)" -ForegroundColor Green
        Write-Host "     Subtotal: $($createResponse.data.subtotal)" -ForegroundColor Gray
        Write-Host "     Tax: $($createResponse.data.taxAmount)" -ForegroundColor Gray
        Write-Host "     Total: $($createResponse.data.totalAmount)" -ForegroundColor Gray
        Write-Host "     Status: $($createResponse.data.status)" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR - Failed: $($createResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERROR creating invoice: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get invoice by ID
Write-Host "`n3. Getting invoice by ID..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId" -Method Get
    if ($getResponse.success) {
        Write-Host "   OK - Retrieved invoice: $($getResponse.data.invoiceNumber)" -ForegroundColor Green
        Write-Host "     Line items: $($getResponse.data.lineItems.Count)" -ForegroundColor Gray
        Write-Host "     Customer: $($getResponse.data.customerName)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Get all invoices
Write-Host "`n4. Getting all invoices..." -ForegroundColor Yellow
try {
    $allInvoicesResponse = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Get
    if ($allInvoicesResponse.success) {
        Write-Host "   OK - Retrieved $($allInvoicesResponse.data.Count) invoice(s)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Send invoice
Write-Host "`n5. Sending invoice..." -ForegroundColor Yellow
try {
    $sendResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/send" -Method Post
    if ($sendResponse.success) {
        Write-Host "   OK - Invoice sent, Status: $($sendResponse.data.status)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Record payment
Write-Host "`n6. Recording payment..." -ForegroundColor Yellow
$paymentJson = @"
{
    "amount": 1500.00,
    "paymentMethod": "Check",
    "reference": "CHK-001234",
    "notes": "Partial payment"
}
"@

try {
    $paymentResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/payments" -Method Post -Body $paymentJson -ContentType "application/json"
    
    if ($paymentResponse.success) {
        Write-Host "   OK - Payment recorded" -ForegroundColor Green
        Write-Host "     Amount paid: $($paymentResponse.data.amountPaid)" -ForegroundColor Gray
        Write-Host "     Amount due: $($paymentResponse.data.amountDue)" -ForegroundColor Gray
        Write-Host "     Status: $($paymentResponse.data.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Get aging report
Write-Host "`n7. Getting A/R aging report..." -ForegroundColor Yellow
try {
    $agingResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/aging" -Method Get
    if ($agingResponse.success) {
        Write-Host "   OK - Retrieved aging report" -ForegroundColor Green
        Write-Host "     Total outstanding: $($agingResponse.data.totalOutstanding)" -ForegroundColor Gray
        Write-Host "     Current: $($agingResponse.data.currentAmount)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Invoice API Testing Complete ===" -ForegroundColor Cyan
Write-Host "Summary: Core invoice operations tested successfully!" -ForegroundColor Green
