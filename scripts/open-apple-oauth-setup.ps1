# Apple Sign In setup - copies callback URL and opens Apple + Supabase.
$callback = 'https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback'
$domain = 'firqlsjixojnrofycwbs.supabase.co'
$ref = 'firqlsjixojnrofycwbs'

$clip = @"
Return URL (Apple Return URLs + Supabase):
$callback

Domain (Apple Domains and Subdomains):
$domain
"@
Set-Clipboard -Value $clip

Write-Host 'Copied Return URL + Domain to clipboard.' -ForegroundColor Green
Write-Host ''
Write-Host 'Guide: docs/supabase/APPLE_OAUTH_EASY.md' -ForegroundColor Cyan
Write-Host ''

Start-Process 'https://developer.apple.com/account/resources/identifiers/list'
Start-Process 'https://developer.apple.com/account/resources/authkeys/list'
Start-Process "https://supabase.com/dashboard/project/$ref/auth/providers?provider=Apple"

Write-Host 'Steps: Services ID + Key (.p8) + Team ID -> Supabase Apple provider'
