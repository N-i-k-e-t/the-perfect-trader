# One-shot production deploy: Vercel + env vars + optional Supabase schema/auth.
# Usage:
#   $env:VERCEL_TOKEN = "..."           # vercel.com/account/tokens
#   $env:SUPABASE_ACCESS_TOKEN = "..."  # optional: supabase.com/dashboard/account/tokens
#   $env:SUPABASE_DB_PASSWORD = "..."   # optional: for db push without supabase login
#   npm run deploy:live
#
# Or interactive: npx vercel login (browser) then run without VERCEL_TOKEN.

param(
    [string]$VercelToken = $env:VERCEL_TOKEN,
    [string]$SupabaseToken = $env:SUPABASE_ACCESS_TOKEN,
    [string]$ProjectRef = 'firqlsjixojnrofycwbs',
    [switch]$SkipDbPush,
    [switch]$SkipSupabaseAuth
)

$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

function Read-DotEnvKey([string]$path, [string]$key) {
    if (-not (Test-Path $path)) { return $null }
    foreach ($line in Get-Content $path) {
        if ($line -match "^\s*$key\s*=\s*(.+)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }
    return $null
}

Write-Host ''
Write-Host '=== The Perfect Trader — live deploy ===' -ForegroundColor Cyan
Write-Host ''

# --- Load config from .env.local (never printed) ---
$supabaseUrl = Read-DotEnvKey '.env.local' 'NEXT_PUBLIC_SUPABASE_URL'
$supabaseAnon = Read-DotEnvKey '.env.local' 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
$betaMode = Read-DotEnvKey '.env.local' 'NEXT_PUBLIC_BETA_MODE'
if (-not $betaMode) { $betaMode = 'true' }
$supportEmail = Read-DotEnvKey '.env.local' 'NEXT_PUBLIC_SUPPORT_EMAIL'
$privacyEmail = Read-DotEnvKey '.env.local' 'NEXT_PUBLIC_PRIVACY_EMAIL'
$geminiKey = Read-DotEnvKey '.env.local' 'GEMINI_API_KEY'

if (-not $supabaseUrl) {
    $supabaseUrl = "https://${ProjectRef}.supabase.co"
}

if (-not $supabaseAnon) {
    Write-Host 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.' -ForegroundColor Red
    Write-Host 'Add it to .env.local OR set env NEXT_PUBLIC_SUPABASE_ANON_KEY for this session.'
    Write-Host 'Get it: Supabase Dashboard → Project Settings → API → anon public'
    exit 1
}

Write-Host 'Config OK (Supabase URL + anon key found).' -ForegroundColor Green

# --- Build gate ---
Write-Host 'Running production build...' -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# --- Supabase migrations (optional) ---
if (-not $SkipDbPush) {
    if ($env:SUPABASE_DB_PASSWORD) {
        Write-Host 'Pushing DB migrations (pooler)...' -ForegroundColor Yellow
        & "$PSScriptRoot\push-db-url.ps1"
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'DB push failed — continue anyway or fix password (npm run db:push:url).' -ForegroundColor Yellow
        }
    } else {
        Write-Host 'Skip DB push (set SUPABASE_DB_PASSWORD to run migrations).' -ForegroundColor DarkYellow
    }
}

# --- Vercel deploy ---
Write-Host 'Deploying to Vercel (production)...' -ForegroundColor Yellow

if ($VercelToken) {
    $env:VERCEL_TOKEN = $VercelToken
}

$deployOut = npx vercel@latest deploy --prod --yes 2>&1 | Out-String
Write-Host $deployOut

if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host 'Vercel deploy failed. If not logged in:' -ForegroundColor Red
    Write-Host '  1. Create token: https://vercel.com/account/tokens'
    Write-Host '  2. $env:VERCEL_TOKEN = "your-token"'
    Write-Host '  3. npm run deploy:live'
    Write-Host 'Or import repo at https://vercel.com/new (GitHub → auto deploy on push).'
    exit $LASTEXITCODE
}

# Parse deployment URL from CLI output
$deployUrl = $null
if ($deployOut -match '(https://[a-zA-Z0-9.-]+\.vercel\.app)') {
    $deployUrl = $Matches[1]
}

if ($deployUrl) {
    Write-Host ''
    Write-Host "Live URL: $deployUrl" -ForegroundColor Green

    Write-Host ''
    Write-Host 'Set these in Vercel → Project → Settings → Environment Variables (Production + Preview):' -ForegroundColor Yellow
    Write-Host '  NEXT_PUBLIC_SUPABASE_URL'
    Write-Host '  NEXT_PUBLIC_SUPABASE_ANON_KEY'
    Write-Host "  NEXT_PUBLIC_BETA_MODE = $betaMode"
    Write-Host 'Then Redeploy once in the Vercel dashboard.' -ForegroundColor Yellow

    if (-not $SkipSupabaseAuth -and $SupabaseToken) {
        & "$PSScriptRoot\set-supabase-auth-urls.ps1" -ProjectRef $ProjectRef -SiteUrl $deployUrl -AccessToken $SupabaseToken
    } else {
        Write-Host ''
        Write-Host 'Supabase auth URLs (manual):' -ForegroundColor Yellow
        Write-Host "  Site URL: $deployUrl"
        Write-Host "  Redirect: ${deployUrl}/**"
        Write-Host '  Dashboard: https://supabase.com/dashboard/project/' + $ProjectRef + '/auth/url-configuration'
    }
} else {
    Write-Host 'Deploy finished — check Vercel dashboard for URL.' -ForegroundColor Green
}

Write-Host ''
Write-Host 'Smoke test: signup → /today → row in trader_snapshots' -ForegroundColor Cyan
Write-Host ''
