$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
$sqlPath = Join-Path $appRoot 'supabase\migrations\20260325000000_user_events.sql'
Set-Clipboard -Value (Get-Content $sqlPath -Raw)
Start-Process 'https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/sql/new'
Write-Host 'user_events migration copied. Paste in SQL Editor and Run.' -ForegroundColor Green
