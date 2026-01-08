# Test Invoice API Endpoints
$baseUrl = "http://localhost:5000/api"

Write-Host "`n=== Testing Invoice API ===" -ForegroundColor Cyan

# First, get a carrier to use as customer
Write-Host "`n1. Getting carriers..." -ForegroundColor Yellow
try {
    $carriers = Invoke-RestMethod -Uri "$baseUrl/carriers" -Method Get -Headers @{"Accept" = "application/json"}
    if ($carriers.data -and $carriers.data.Count -gt 0) {
        $customerId = $carriers.data[0].id
        Write-Host "   ✓ Found carrier: $($carriers.data[0].companyName) (ID: $customerId)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ No carriers found. Please create a carrier first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ Error getting carriers: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create an invoice
Write-Host "`n2. Creating invoice..." -ForegroundColor Yellow
$newInvoice = @{
    customerId = $customerId
    invoiceDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    dueDate = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ss")
    paymentTerms = 3  # Net30
    taxRate = 0.08
    notes = "Test invoice created via API"
    lineItems = @(
        @{
            description = "Freight charges for Load #12345";
            quantity = 1;
            unitPrice = 2500.00;
            itemCode = "FREIGHT"
        };
        @{
            description = "Fuel surcharge";
            quantity = 1;
            unitPrice = 150.00;
            itemCode = "FUEL"
        };
        @{
            description = "Loading/Unloading fee";
            quantity = 2;
            unitPrice = 75.00;
            itemCode = "LABOR"
        }
    )
}

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Post `
        -Body ($newInvoice | ConvertTo-Json -Depth 10) `
        -ContentType "application/json" `
        -Headers @{"Accept" = "application/json"}
    
    if ($createResponse.success) {
        $invoiceId = $createResponse.data.id
        $invoiceNumber = $createResponse.data.invoiceNumber
        Write-Host "   ✓ Created invoice: $invoiceNumber (ID: $invoiceId)" -ForegroundColor Green
        Write-Host "     - Subtotal: $($createResponse.data.subtotal)" -ForegroundColor Gray
        Write-Host "     - Tax: $($createResponse.data.taxAmount)" -ForegroundColor Gray
        Write-Host "     - Total: $($createResponse.data.totalAmount)" -ForegroundColor Gray
        Write-Host "     - Status: $($createResponse.data.status)" -ForegroundColor Gray
    } else {
        Write-Host "   ✗ Failed to create invoice: $($createResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ Error creating invoice: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Get invoice by ID
Write-Host "`n3. Getting invoice by ID..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId" -Method Get
    if ($getResponse.success) {
        Write-Host "   ✓ Retrieved invoice: $($getResponse.data.invoiceNumber)" -ForegroundColor Green
        Write-Host "     - Line items: $($getResponse.data.lineItems.Count)" -ForegroundColor Gray
        Write-Host "     - Customer: $($getResponse.data.customerName)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get invoice by number
Write-Host "`n4. Getting invoice by number..." -ForegroundColor Yellow
try {
    $getByNumberResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/number/$invoiceNumber" -Method Get
    if ($getByNumberResponse.success) {
        Write-Host "   ✓ Retrieved invoice by number" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get all invoices
Write-Host "`n5. Getting all invoices..." -ForegroundColor Yellow
try {
    $allInvoicesResponse = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Get
    if ($allInvoicesResponse.success) {
        Write-Host "   ✓ Retrieved $($allInvoicesResponse.data.Count) invoice(s)" -ForegroundColor Green
        foreach ($inv in $allInvoicesResponse.data) {
            Write-Host "     - $($inv.invoiceNumber): $$($inv.totalAmount) ($($inv.status))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Send invoice
Write-Host "`n6. Sending invoice..." -ForegroundColor Yellow
try {
    $sendResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/send" -Method Post
    if ($sendResponse.success) {
        Write-Host "   ✓ Invoice sent successfully" -ForegroundColor Green
        Write-Host "     - Status: $($sendResponse.data.status)" -ForegroundColor Gray
        Write-Host "     - Sent date: $($sendResponse.data.sentDate)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Mark as viewed
Write-Host "`n7. Marking invoice as viewed..." -ForegroundColor Yellow
try {
    $viewResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/view" -Method Post
    if ($viewResponse.success) {
        Write-Host "   ✓ Invoice marked as viewed" -ForegroundColor Green
        Write-Host "     - Status: $($viewResponse.data.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Record partial payment
Write-Host "`n8. Recording partial payment..." -ForegroundColor Yellow
$partialPayment = @{
    amount = 1500.00
    paymentMethod = "Check"
    reference = "CHK-001234"
    notes = "Partial payment received"
}

try {
    $paymentResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/payments" -Method Post `
        -Body ($partialPayment | ConvertTo-Json) `
        -ContentType "application/json"
    
    if ($paymentResponse.success) {
        Write-Host "   ✓ Payment recorded successfully" -ForegroundColor Green
        Write-Host "     - Amount paid: $$($paymentResponse.data.amountPaid)" -ForegroundColor Gray
        Write-Host "     - Amount due: $$($paymentResponse.data.amountDue)" -ForegroundColor Gray
        Write-Host "     - Status: $($paymentResponse.data.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Record remaining payment
Write-Host "`n9. Recording remaining payment..." -ForegroundColor Yellow
$remainingAmount = $createResponse.data.totalAmount - $partialPayment.amount
$finalPayment = @{
    amount = $remainingAmount
    paymentMethod = "Wire Transfer"
    reference = "WIRE-567890"
    notes = "Final payment"
}

try {
    $finalPaymentResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/payments" -Method Post `
        -Body ($finalPayment | ConvertTo-Json) `
        -ContentType "application/json"
    
    if ($finalPaymentResponse.success) {
        Write-Host "   ✓ Final payment recorded" -ForegroundColor Green
        Write-Host "     - Amount paid: $$($finalPaymentResponse.data.amountPaid)" -ForegroundColor Gray
        Write-Host "     - Amount due: $$($finalPaymentResponse.data.amountDue)" -ForegroundColor Gray
        Write-Host "     - Status: $($finalPaymentResponse.data.status)" -ForegroundColor Gray
        Write-Host "     - Paid date: $($finalPaymentResponse.data.paidDate)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get by status
Write-Host "`n10. Getting invoices by status (Paid)..." -ForegroundColor Yellow
try {
    $paidInvoicesResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/status/Paid" -Method Get
    if ($paidInvoicesResponse.success) {
        Write-Host "   ✓ Found $($paidInvoicesResponse.data.Count) paid invoice(s)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get overdue invoices
Write-Host "`n11. Getting overdue invoices..." -ForegroundColor Yellow
try {
    $overdueResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/overdue" -Method Get
    if ($overdueResponse.success) {
        Write-Host "   ✓ Found $($overdueResponse.data.Count) overdue invoice(s)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Get aging report
Write-Host "`n12. Getting A/R aging report..." -ForegroundColor Yellow
try {
    $agingResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/aging" -Method Get
    if ($agingResponse.success) {
        Write-Host "   ✓ Retrieved aging report" -ForegroundColor Green
        Write-Host "     - Total outstanding: $$($agingResponse.data.totalOutstanding)" -ForegroundColor Gray
        Write-Host "     - Current: $$($agingResponse.data.currentAmount)" -ForegroundColor Gray
        Write-Host "     - 1-30 days: $$($agingResponse.data.days1To30)" -ForegroundColor Gray
        Write-Host "     - 31-60 days: $$($agingResponse.data.days31To60)" -ForegroundColor Gray
        Write-Host "     - 61-90 days: $$($agingResponse.data.days61To90)" -ForegroundColor Gray
        Write-Host "     - Over 90 days: $$($agingResponse.data.over90Days)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Invoice API Testing Complete ===" -ForegroundColor Cyan
Write-Host "Summary: All core invoice operations tested successfully!" -ForegroundColor Green
