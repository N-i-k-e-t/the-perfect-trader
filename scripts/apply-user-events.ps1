# Open Supabase SQL Editor with user_events migration on clipboard (when DB password unavailable).
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$projectRef = 'firqlsjixojnrofycwbs'
$sqlFile = Join-Path $appRoot 'supabase\migrations\20260325000000_user_events.sql'

Write-Host 'Checking user_events on cloud...' -ForegroundColor Cyan
node (Join-Path $PSScriptRoot 'apply-user-events.mjs')
if ($LASTEXITCODE -eq 0) { exit 0 }

if (-not (Test-Path $sqlFile)) {
    Write-Host "Missing $sqlFile" -ForegroundColor Red
    exit 1
}

$sql = Get-Content $sqlFile -Raw -Encoding UTF8
Set-Clipboard -Value $sql
Write-Host 'Migration SQL copied to clipboard.' -ForegroundColor Green
Write-Host 'Opening Supabase SQL Editor — paste (Ctrl+V) and click Run.' -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/$projectRef/sql/new"
exit 1
