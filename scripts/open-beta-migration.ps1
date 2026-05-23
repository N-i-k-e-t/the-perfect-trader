# Opens Supabase SQL Editor with beta_capacity migration on the clipboard.
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
$sqlPath = Join-Path $appRoot 'supabase\migrations\20260323000000_beta_capacity.sql'
if (-not (Test-Path $sqlPath)) {
    Write-Host "Missing $sqlPath" -ForegroundColor Red
    exit 1
}
Set-Clipboard -Value (Get-Content $sqlPath -Raw)
Start-Process 'https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/sql/new'
Write-Host 'Beta migration SQL copied to clipboard. Paste in SQL Editor and click Run.' -ForegroundColor Green
