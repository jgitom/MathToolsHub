param([switch]$RequireDeployedInfrastructure)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content (Join-Path $root "activity-entitlements.json") -Raw | ConvertFrom-Json
$errors = [System.Collections.Generic.List[string]]::new()
function Assert($condition, $message) { if (-not $condition) { $errors.Add($message) } }
Assert ($manifest.activities.Count -eq ($manifest.free_count + $manifest.premium_count)) "Manifest totals do not balance."
Assert (($manifest.activities | Group-Object activity_id | Where-Object Count -gt 1).Count -eq 0) "Duplicate activity IDs found."
Assert (($manifest.activities | Where-Object access_tier -eq "free").Count -eq 25) "Expected 25 Free activities."
Assert (($manifest.activities | Where-Object access_tier -eq "premium").Count -eq 117) "Expected 117 Premium activities."
$guarded = Get-ChildItem $root -Recurse -File -Filter *.html | Where-Object { [IO.File]::ReadAllText($_.FullName).Contains("subscription-access.js") }
Assert ($guarded.Count -eq 146) "Expected guard on 146 catalogue/activity pages; found $($guarded.Count)."
foreach ($required in @("supabase/subscription.sql","supabase/activity-entitlements-seed.sql","supabase/functions/stripe-webhook/index.ts","supabase/functions/customer-portal/index.ts","privacy.html","terms.html","refund-policy.html","cancellation-policy.html")) { Assert (Test-Path (Join-Path $root $required)) "Missing $required" }
$webhook = [IO.File]::ReadAllText((Join-Path $root "supabase/functions/stripe-webhook/index.ts"))
foreach ($event in @("checkout.session.completed","invoice.paid","invoice.payment_failed","customer.subscription.created","customer.subscription.updated","customer.subscription.deleted")) { Assert ($webhook.Contains($event)) "Webhook does not handle $event" }
$trackedText = (Get-ChildItem $root -Recurse -File | Where-Object { $_.FullName -notmatch '\\.git\\|three\\.core|node_modules' } | ForEach-Object { try { [IO.File]::ReadAllText($_.FullName) } catch { "" } }) -join "`n"
Assert ($trackedText -notmatch 'sk_(live|test)_[A-Za-z0-9]{12,}') "A Stripe secret key appears in repository files."
Assert ($trackedText -notmatch 'whsec_[A-Za-z0-9]{12,}') "A Stripe webhook secret appears in repository files."
if ($errors.Count) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }
Write-Host "Subscription preflight passed: $($manifest.activities.Count) activities ($($manifest.free_count) Free / $($manifest.premium_count) Premium), $($guarded.Count) guarded pages, webhook lifecycle handlers present, no committed Stripe secrets."
if ($RequireDeployedInfrastructure) { Write-Warning "Deployment verification requires a signed-in test account and Stripe test-mode lifecycle; follow supabase/SUBSCRIPTION-LAUNCH.md." }