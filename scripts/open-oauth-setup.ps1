# Opens GitHub/Google OAuth setup pages and copies Supabase callback URL to clipboard.
$callback = 'https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback'
$ref = 'firqlsjixojnrofycwbs'

Set-Clipboard -Value $callback
Write-Host 'Copied Supabase callback URL to clipboard:' -ForegroundColor Green
Write-Host $callback
Write-Host ''

Start-Process 'https://github.com/settings/applications/new'
Start-Process "https://supabase.com/dashboard/project/$ref/auth/providers?provider=GitHub"
Start-Process 'https://console.cloud.google.com/apis/credentials/oauthclient'
Start-Process "https://supabase.com/dashboard/project/$ref/auth/providers?provider=Google"
Start-Process "https://supabase.com/dashboard/project/$ref/auth/url-configuration"

Write-Host 'GitHub: paste callback URL when registering OAuth app, then paste Client ID/Secret into Supabase GitHub provider.'
Write-Host 'Google: add callback as Authorized redirect URI, then paste into Supabase Google provider.'
Write-Host 'Full guide: docs/supabase/OAUTH_SETUP.md'
