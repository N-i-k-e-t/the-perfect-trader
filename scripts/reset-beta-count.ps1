# Copies RESET_BETA_COUNT.sql to clipboard and opens Supabase SQL Editor.
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
$sqlPath = Join-Path $appRoot 'docs\supabase\RESET_BETA_COUNT.sql'
if (-not (Test-Path $sqlPath)) {
    Write-Host "Missing $sqlPath" -ForegroundColor Red
    exit 1
}
Set-Clipboard -Value (Get-Content $sqlPath -Raw)
Start-Process 'https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/sql/new'
Write-Host ''
Write-Host 'Beta reset SQL copied to clipboard.' -ForegroundColor Green
Write-Host 'Paste in SQL Editor → Run → check beta_after_reset shows current: 0' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Then verify: npm run health:check' -ForegroundColor Cyan
