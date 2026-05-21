# Push migrations to Supabase cloud project firqlsjixojnrofycwbs via CLI.
# Requires: supabase login (once) + database password.
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$projectRef = 'firqlsjixojnrofycwbs'
$region = 'ap-northeast-1'

Write-Host ''
Write-Host '=== Supabase cloud — link + db push ===' -ForegroundColor Cyan
Write-Host "Project: $projectRef ($region)"
Write-Host ''

# Optional: personal access token (Dashboard → Account → Access Tokens, sbp_...)
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host 'Step 1: Log in to Supabase CLI (browser will open).' -ForegroundColor Yellow
    npx supabase login
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host 'Using SUPABASE_ACCESS_TOKEN from environment.' -ForegroundColor Green
    npx supabase login --token $env:SUPABASE_ACCESS_TOKEN
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host ''
Write-Host 'Step 2: Link project (enter database password when prompted).' -ForegroundColor Yellow
Write-Host 'Password: Dashboard → Project Settings → Database → Database password'
Write-Host ''

npx supabase link --project-ref $projectRef
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'Step 3: Push migrations from supabase/migrations/' -ForegroundColor Yellow
npx supabase db push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'Done. Schema applied on cloud.' -ForegroundColor Green
Write-Host 'Verify: https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/editor'
Write-Host ''
