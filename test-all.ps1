$base = "http://localhost:3000"
$script:pass = 0
$script:fail = 0

function Check {
    param($name, $url, $method = "GET", $body = $null, $expected, [bool]$noRedirect = $false)
    try {
        $p = @{
            Uri             = $url
            Method          = $method
            UseBasicParsing = $true
            ErrorAction     = "SilentlyContinue"
            TimeoutSec      = 10
        }
        if ($noRedirect) { $p.MaximumRedirection = 0 } else { $p.MaximumRedirection = 5 }
        if ($body) { $p.Body = ($body | ConvertTo-Json); $p.ContentType = "application/json" }
        $r = Invoke-WebRequest @p
        $ok = $r.StatusCode -eq $expected
        if ($ok) { $script:pass++ } else { $script:fail++ }
        $icon = if ($ok) { "PASS" } else { "FAIL" }
        Write-Host "  [$icon] $name -> HTTP $($r.StatusCode) (expected $expected)"
    }
    catch {
        $code = $_.Exception.Response.StatusCode.value__
        $ok = $code -eq $expected
        if ($ok) { $script:pass++ } else { $script:fail++ }
        $icon = if ($ok) { "PASS" } else { "FAIL" }
        Write-Host "  [$icon] $name -> HTTP $code (expected $expected)"
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "  POSTFLOW - FULL FUNCTIONAL TEST SUITE"
Write-Host "========================================"
Write-Host ""

Write-Host "-- Public Pages (expect 200) --"
Check -name "Marketing Home (/)" -url "$base/" -expected 200
Check -name "Login Page" -url "$base/login" -expected 200
Check -name "Signup Page" -url "$base/signup" -expected 200
Check -name "Lead Capture (/capture)" -url "$base/capture" -expected 200

Write-Host ""
Write-Host "-- Auth Guard - Protected Pages (expect 307 -> /login) --"
Check -name "Dashboard" -url "$base/dashboard" -expected 307 -noRedirect $true
Check -name "Compose" -url "$base/compose" -expected 307 -noRedirect $true
Check -name "Analytics" -url "$base/analytics" -expected 307 -noRedirect $true
Check -name "Comments" -url "$base/comments" -expected 307 -noRedirect $true
Check -name "Settings" -url "$base/settings" -expected 307 -noRedirect $true
Check -name "Leads" -url "$base/leads" -expected 307 -noRedirect $true
Check -name "Calendar" -url "$base/calendar" -expected 307 -noRedirect $true

Write-Host ""
Write-Host "-- API Routes --"
Check -name "GET /api/posts (no auth -> 401)" -url "$base/api/posts" -expected 401
Check -name "GET /api/leads (no auth -> 401)" -url "$base/api/leads" -expected 401
Check -name "POST /api/ai/generate (no auth -> 401)" -url "$base/api/ai/generate" -method "POST" -body @{action = "generate"; content = "test"; platform = "linkedin" } -expected 401
Check -name "GET /api/auth/linkedin (OAuth -> 307)" -url "$base/api/auth/linkedin" -expected 307 -noRedirect $true
Check -name "GET /api/auth/facebook (OAuth -> 307)" -url "$base/api/auth/facebook" -expected 307 -noRedirect $true
Check -name "GET /api/auth/twitter (OAuth -> 307)" -url "$base/api/auth/twitter" -expected 307 -noRedirect $true
Check -name "GET /api/approvals/fake-token (-> 404)" -url "$base/api/approvals/fake-token-123" -expected 404
Check -name "GET /approve/fake-token (-> 200)" -url "$base/approve/fake-token-xyz" -expected 200

Write-Host ""
Write-Host "========================================"
Write-Host "  PASSED: $($script:pass)  |  FAILED: $($script:fail)  |  TOTAL: $($script:pass + $script:fail)"
Write-Host "========================================"
Write-Host ""
