# Scan tracked files for accidental secret leaks (run before commit).
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path $PSScriptRoot -Parent
Set-Location $appRoot

$patterns = @(
    'eyJhbGciOiJIUzI1NiIs',
    'sb_publishable_',
    'postgresql://postgres[^`s]+:[^@]+@',
    'SUPABASE_SERVICE_ROLE_KEY\s*=\s*eyJ',
    'GEMINI_API_KEY\s*=\s*AIza'
)

$files = git ls-files 2>$null
if (-not $files) {
    Write-Host 'Not a git repo or git unavailable — scanning project tree (excluding node_modules).' -ForegroundColor Yellow
    $files = Get-ChildItem -Recurse -File |
        Where-Object { $_.FullName -notmatch 'node_modules|\.git|build|\.next|mobile\\build' } |
        ForEach-Object { $_.FullName.Replace("$appRoot\", '').Replace('\', '/') }
}

$hits = @()
foreach ($f in $files) {
    if ($f -match '^secrets/|\.env|vault\.enc') { continue }
    $path = Join-Path $appRoot $f
    if (-not (Test-Path -LiteralPath $path)) { continue }
    $content = Get-Content -LiteralPath $path -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    foreach ($p in $patterns) {
        if ($content -match $p) {
            $hits += [pscustomobject]@{ File = $f; Pattern = $p }
        }
    }
}

if ($hits.Count -gt 0) {
    Write-Host 'Possible secrets in tracked files:' -ForegroundColor Red
    $hits | Format-Table -AutoSize
    exit 1
}

Write-Host 'No obvious secrets in tracked files.' -ForegroundColor Green
exit 0
