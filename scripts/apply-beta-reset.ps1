# Apply beta count reset on Supabase cloud (migration + offset) when DB password is available.
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$projectRef = 'firqlsjixojnrofycwbs'
$Password = $env:SUPABASE_DB_PASSWORD

if (-not $Password -and $env:DATABASE_URL -match 'postgres\.firqlsjixojnrofycwbs:([^@]+)@') {
    $Password = [uri]::UnescapeDataString($Matches[1])
}

if (-not $Password -and (Test-Path '.env.local')) {
    foreach ($line in Get-Content '.env.local') {
        if ($line -match '^SUPABASE_DB_PASSWORD=(.+)$') {
            $Password = $Matches[1].Trim().Trim('"').Trim("'")
            break
        }
        if ($line -match '^DATABASE_URL=(.+)$') {
            $url = $Matches[1].Trim().Trim('"').Trim("'")
            if ($url -match 'postgres\.firqlsjixojnrofycwbs:([^@]+)@') {
                $Password = [uri]::UnescapeDataString($Matches[1])
                break
            }
        }
    }
}

if (-not $Password) {
    Write-Host 'No DB password — trying service-role reset script...' -ForegroundColor Yellow
    node (Join-Path $PSScriptRoot 'reset-beta-count.mjs')
    if ($LASTEXITCODE -eq 0) { exit 0 }
    Write-Host 'Service-role reset failed — opening SQL Editor.' -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot 'reset-beta-count.ps1')
    exit $LASTEXITCODE
}

$encoded = [uri]::EscapeDataString($Password)
$dbUrl = "postgresql://postgres.${projectRef}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
$sqlFile = Join-Path $appRoot 'docs\supabase\RESET_BETA_COUNT.sql'

Write-Host 'Applying beta reset on cloud...' -ForegroundColor Cyan
npx supabase db query --db-url $dbUrl -f $sqlFile -o json
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'Done. Verify with: npm run health:check' -ForegroundColor Green
