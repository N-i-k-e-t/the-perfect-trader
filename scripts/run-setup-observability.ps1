# Copy env template, wait for tokens, run setup.
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$example = Join-Path $appRoot 'docs\observability\env.observability.example'
$target = Join-Path $appRoot '.env.observability'

if (-not (Test-Path $target)) {
    Copy-Item $example $target
    Write-Host 'Created .env.observability from template.' -ForegroundColor Green
}

function Test-TokensReady {
    $r = node -e @"
const fs=require('fs');
const t=fs.readFileSync('.env.observability','utf8');
const ok=(k)=>{const l=t.split(/\r?\n/).find(x=>x.startsWith(k+'='));const v=l?l.split('=').slice(1).join('=').trim():'';return v.length>8;};
process.exit(ok('SUPABASE_ACCESS_TOKEN')&&ok('SENTRY_AUTH_TOKEN')&&ok('SENTRY_ORG')?0:1);
"@
    return $LASTEXITCODE -eq 0
}

if (-not (Test-TokensReady)) {
    Write-Host 'Paste tokens into .env.observability (Notepad) and save.' -ForegroundColor Yellow
    Start-Process notepad.exe $target
    for ($i = 0; $i -lt 24; $i++) {
        Start-Sleep -Seconds 5
        if (Test-TokensReady) { break }
        if ($i -eq 5) { Write-Host 'Waiting for .env.observability...' }
    }
}

if (-not (Test-TokensReady)) {
    Write-Host 'Tokens still missing. Fill .env.observability and run: npm run setup:observability' -ForegroundColor Red
    exit 1
}

Write-Host 'Running setup:observability...' -ForegroundColor Cyan
node (Join-Path $PSScriptRoot 'setup-observability.mjs')
exit $LASTEXITCODE
