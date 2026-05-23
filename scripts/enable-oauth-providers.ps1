# Enable Google + GitHub OAuth on Supabase (Management API).
# Prereqs: create OAuth apps first (see docs/supabase/OAUTH_SETUP.md).
#
#   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."   # dashboard → account → tokens
#   $env:GITHUB_OAUTH_CLIENT_ID = "..."
#   $env:GITHUB_OAUTH_CLIENT_SECRET = "..."
#   $env:GOOGLE_OAUTH_CLIENT_ID = "..."       # optional
#   $env:GOOGLE_OAUTH_CLIENT_SECRET = "..."   # optional
#   npm run oauth:enable

param(
    [string]$ProjectRef = 'firqlsjixojnrofycwbs',
    [string]$SiteUrl = 'https://the-perfect-trader.vercel.app',
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN,
    [string]$GitHubClientId = $env:GITHUB_OAUTH_CLIENT_ID,
    [string]$GitHubSecret = $env:GITHUB_OAUTH_CLIENT_SECRET,
    [string]$GoogleClientId = $env:GOOGLE_OAUTH_CLIENT_ID,
    [string]$GoogleSecret = $env:GOOGLE_OAUTH_CLIENT_SECRET
)

$ErrorActionPreference = 'Stop'
$callback = "https://${ProjectRef}.supabase.co/auth/v1/callback"
$site = $SiteUrl.TrimEnd('/')

if (-not $AccessToken) {
    Write-Host 'Missing SUPABASE_ACCESS_TOKEN.' -ForegroundColor Red
    Write-Host 'Create: https://supabase.com/dashboard/account/tokens'
    exit 1
}

$headers = @{
    Authorization = "Bearer $AccessToken"
    'Content-Type' = 'application/json'
}

$body = @{
    site_url               = $site
    uri_allow_list         = "${site}/**,http://localhost:3000/**"
    mailer_autoconfirm     = $true
    external_email_enabled = $true
}

if ($GitHubClientId -and $GitHubSecret) {
    $body.external_github_enabled = $true
    $body.external_github_client_id = $GitHubClientId
    $body.external_github_secret = $GitHubSecret
    Write-Host 'Including GitHub OAuth.' -ForegroundColor Cyan
} else {
    Write-Host 'Skip GitHub (set GITHUB_OAUTH_CLIENT_ID + GITHUB_OAUTH_CLIENT_SECRET).' -ForegroundColor Yellow
}

if ($GoogleClientId -and $GoogleSecret) {
    $body.external_google_enabled = $true
    $body.external_google_client_id = $GoogleClientId
    $body.external_google_secret = $GoogleSecret
    Write-Host 'Including Google OAuth.' -ForegroundColor Cyan
} else {
    Write-Host 'Skip Google (set GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET).' -ForegroundColor Yellow
}

$uri = "https://api.supabase.com/v1/projects/$ProjectRef/config/auth"
$json = $body | ConvertTo-Json

Write-Host "PATCH auth config ($ProjectRef)..." -ForegroundColor Cyan
Invoke-RestMethod -Method PATCH -Uri $uri -Headers $headers -Body $json | Out-Null
Write-Host 'Supabase auth updated.' -ForegroundColor Green
Write-Host "Callback URL for OAuth apps: $callback"
