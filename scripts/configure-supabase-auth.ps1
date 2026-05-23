# Disable email confirmation + set production auth URLs (needs SUPABASE_ACCESS_TOKEN).
param(
    [string]$SiteUrl = 'https://the-perfect-trader.vercel.app',
    [string]$ProjectRef = 'firqlsjixojnrofycwbs',
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

$ErrorActionPreference = 'Stop'
$site = $SiteUrl.TrimEnd('/')

if (-not $AccessToken) {
    Write-Host 'No SUPABASE_ACCESS_TOKEN — opening dashboard pages for manual save.' -ForegroundColor Yellow
    Start-Process "https://supabase.com/dashboard/project/$ProjectRef/auth/providers"
    Start-Process "https://supabase.com/dashboard/project/$ProjectRef/auth/url-configuration"
    Write-Host 'Manual steps:'
    Write-Host '  1. Email provider: turn OFF Confirm email'
    Write-Host "  2. Site URL: $site"
    Write-Host "  3. Redirect URLs: ${site}/** and http://localhost:3000/**"
    exit 0
}

$headers = @{
    Authorization = "Bearer $AccessToken"
    'Content-Type' = 'application/json'
}

$authUri = "https://api.supabase.com/v1/projects/$ProjectRef/config/auth"
$authBody = @{
    site_url                   = $site
    uri_allow_list             = "${site}/**,http://localhost:3000/**"
    mailer_autoconfirm         = $true
    external_email_enabled     = $true
} | ConvertTo-Json

Write-Host "Updating auth config for $ProjectRef..." -ForegroundColor Cyan
Invoke-RestMethod -Method PATCH -Uri $authUri -Headers $headers -Body $authBody | Out-Null
Write-Host 'Done: autoconfirm ON, URLs set.' -ForegroundColor Green
