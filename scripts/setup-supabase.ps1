# Connect The Perfect Trader to Supabase — local (Docker) or cloud
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

Write-Host ''
Write-Host '=== The Perfect Trader database setup ===' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Choose mode:'
Write-Host '  [1] Local Supabase (recommended) — edit schema in supabase/migrations/, full control from this repo'
Write-Host '  [2] Cloud Supabase — link to supabase.com project'
Write-Host ''
$mode = Read-Host 'Enter 1 or 2'

if ($mode -eq '1') {
    Write-Host ''
    Write-Host 'Requires Docker Desktop running.' -ForegroundColor Yellow
    Write-Host 'Starting local Supabase...'
    npx supabase start
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & (Join-Path $PSScriptRoot 'sync-env-local.ps1')

    Write-Host ''
    Write-Host 'Applying migrations...'
    npx supabase db reset --local

    Write-Host ''
    Write-Host 'Done. Local URLs:' -ForegroundColor Green
    Write-Host '  App:    http://localhost:3000  (npm run dev)'
    Write-Host '  Studio: http://127.0.0.1:54323   (npm run db:studio)'
    Write-Host '  API:    http://127.0.0.1:54321'
    Write-Host ''
    Write-Host 'Edit schema: supabase/migrations/*.sql  then  npm run db:reset'
    exit 0
}

Write-Host ''
Write-Host 'Cloud setup:' -ForegroundColor Cyan
Write-Host '1. https://supabase.com/dashboard → create/open project'
Write-Host '2. Run:  npx supabase login'
Write-Host '3. Run:  npx supabase link   (pick project, enter DB password)'
Write-Host '4. Paste API keys below (Settings → API)'
Write-Host ''

$url = Read-Host 'NEXT_PUBLIC_SUPABASE_URL'
$key = Read-Host 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

if (-not $url -or -not $key) {
    Write-Host 'Both values required.' -ForegroundColor Red
    exit 1
}

@"
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$key
"@ | Set-Content -Path (Join-Path $appRoot '.env.local') -Encoding utf8

Write-Host ''
Write-Host 'Push migrations to cloud? (y/n)' -ForegroundColor Yellow
$push = Read-Host
if ($push -eq 'y') {
    npx supabase db push
}

Write-Host ''
Write-Host 'Wrote .env.local — restart: npm run dev' -ForegroundColor Green
