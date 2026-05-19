# Writes .env.local from local Supabase (run after: npm run db:start)
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$status = npx supabase status -o env 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Start local Supabase first: npm run db:start' -ForegroundColor Red
    Write-Host $status
    exit 1
}

$lines = @()
foreach ($line in ($status -split "`n")) {
    if ($line -match '^API_URL=(.+)$') {
        $lines += "NEXT_PUBLIC_SUPABASE_URL=$($Matches[1])"
    }
    if ($line -match '^ANON_KEY=(.+)$') {
        $lines += "NEXT_PUBLIC_SUPABASE_ANON_KEY=$($Matches[1])"
    }
}

if ($lines.Count -lt 2) {
    Write-Host 'Could not read API_URL / ANON_KEY from supabase status.' -ForegroundColor Red
    exit 1
}

$envFile = Join-Path $appRoot '.env.local'
($lines -join "`n") + "`n" | Set-Content -Path $envFile -Encoding utf8
Write-Host "Updated $envFile for LOCAL Supabase." -ForegroundColor Green
Write-Host 'Studio: http://127.0.0.1:54323' -ForegroundColor Cyan
