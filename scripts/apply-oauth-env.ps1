# Load .env.oauth.local and enable OAuth providers on Supabase.
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $appRoot '.env.oauth.local'

if (-not (Test-Path $envFile)) {
    Write-Host 'Missing .env.oauth.local' -ForegroundColor Red
    Write-Host '  copy .env.oauth.local.example to .env.oauth.local and fill values'
    Write-Host '  Or set env vars: SUPABASE_ACCESS_TOKEN, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET'
    exit 1
}

foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
    if ($line -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$') {
        $name = $Matches[1]
        $val = $Matches[2].Trim().Trim('"').Trim("'")
        if ($val -and $val -notmatch 'your_|paste|\.\.\.') {
            Set-Item -Path "Env:$name" -Value $val
        }
    }
}

& (Join-Path $PSScriptRoot 'enable-oauth-providers.ps1')
exit $LASTEXITCODE
