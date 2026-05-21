# Push migrations using database URL only (no Supabase access token).
# Set SUPABASE_DB_PASSWORD in environment, or pass -Password.
param(
    [string]$Password = $env:SUPABASE_DB_PASSWORD
)

$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$projectRef = 'firqlsjixojnrofycwbs'

if (-not $Password) {
    if ($env:DATABASE_URL -match 'postgres\.firqlsjixojnrofycwbs:([^@]+)@') {
        $Password = [uri]::UnescapeDataString($Matches[1])
    }
}

if (-not $Password) {
    Write-Host 'Missing database password.' -ForegroundColor Red
    Write-Host 'Run:  npm run secrets:unlock   (then npm run db:push:url in the same terminal)'
    Write-Host 'Or set env SUPABASE_DB_PASSWORD for this session only.'
    exit 1
}

$encoded = [uri]::EscapeDataString($Password)
# Session pooler (IPv4-friendly) — Tokyo (aws-1 for this project)
$dbUrl = "postgresql://postgres.${projectRef}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

Write-Host "Pushing migrations via pooler (firqlsjixojnrofycwbs)..." -ForegroundColor Cyan
npx supabase db push --db-url $dbUrl
exit $LASTEXITCODE
