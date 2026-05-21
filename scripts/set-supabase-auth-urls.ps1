# Update Supabase Auth URL config for a deployed site (Management API).
param(
    [Parameter(Mandatory = $true)][string]$SiteUrl,
    [string]$ProjectRef = 'firqlsjixojnrofycwbs',
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

$ErrorActionPreference = 'Stop'

if (-not $AccessToken) {
    Write-Host 'Set SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens).' -ForegroundColor Red
    exit 1
}

$site = $SiteUrl.TrimEnd('/')
$redirects = @(
    "${site}/**",
    'http://localhost:3000/**'
)

$body = @{
    site_url = $site
    uri_allow_list = ($redirects -join ',')
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $AccessToken"
    'Content-Type' = 'application/json'
}

Write-Host "Updating Supabase auth URLs for $ProjectRef → $site" -ForegroundColor Cyan

# Supabase Management API — project auth config
$uri = "https://api.supabase.com/v1/projects/$ProjectRef/config/auth"
try {
    Invoke-RestMethod -Method PATCH -Uri $uri -Headers $headers -Body $body | Out-Null
    Write-Host 'Supabase auth URLs updated.' -ForegroundColor Green
} catch {
    Write-Host 'API update failed — set manually in Auth → URL Configuration:' -ForegroundColor Yellow
    Write-Host "  Site URL: $site"
    foreach ($r in $redirects) { Write-Host "  Redirect: $r" }
    Write-Host $_.Exception.Message
    exit 1
}
