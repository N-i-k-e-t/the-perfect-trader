# Link or push migrations to the STAGING Supabase project (not production).
param(
    [ValidateSet('link', 'push', 'status')]
    [string]$Action = 'push'
)

$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$projectRef = $env:SUPABASE_PROJECT_REF_STAGING
if (-not $projectRef) {
    $projectRef = $env:SUPABASE_PROJECT_REF
}

if (-not $projectRef -or $projectRef -eq 'firqlsjixojnrofycwbs') {
    Write-Host 'Set SUPABASE_PROJECT_REF_STAGING to your staging project ref (not firqlsjixojnrofycwbs).' -ForegroundColor Red
    Write-Host 'See docs/supabase/STAGING_PROJECT.md'
    exit 1
}

Write-Host "Staging project: $projectRef" -ForegroundColor Cyan

if ($Action -eq 'link') {
    npx supabase link --project-ref $projectRef
    exit $LASTEXITCODE
}

if ($Action -eq 'status') {
    Write-Host "Dashboard: https://supabase.com/dashboard/project/$projectRef"
    exit 0
}

$Password = $env:SUPABASE_DB_PASSWORD
if (-not $Password -and $env:DATABASE_URL -match "postgres\.$([regex]::Escape($projectRef)):([^@]+)@") {
    $Password = [uri]::UnescapeDataString($Matches[1])
}

if (-not $Password -and (Test-Path '.env.local')) {
    foreach ($line in Get-Content '.env.local') {
        if ($line -match '^SUPABASE_DB_PASSWORD=(.+)$') {
            $Password = $Matches[1].Trim().Trim('"').Trim("'")
            break
        }
    }
}

if (-not $Password) {
    Write-Host 'Missing SUPABASE_DB_PASSWORD for staging push.' -ForegroundColor Red
    Write-Host 'Run: npm run secrets:unlock  then  npm run db:staging:push'
    exit 1
}

$encoded = [uri]::EscapeDataString($Password)
$dbUrl = "postgresql://postgres.${projectRef}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

Write-Host 'Pushing migrations to STAGING...' -ForegroundColor Yellow
npx supabase db push --db-url $dbUrl --yes
exit $LASTEXITCODE
