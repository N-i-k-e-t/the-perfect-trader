# Google OAuth setup - copies Supabase callback and opens Google + Supabase consoles.
$callback = 'https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback'
$ref = 'firqlsjixojnrofycwbs'

Set-Clipboard -Value $callback
Write-Host 'Copied redirect URI (paste in Google + Supabase):' -ForegroundColor Green
Write-Host $callback
Write-Host ''

Start-Process 'https://console.cloud.google.com/apis/credentials/consent'
Start-Process 'https://console.cloud.google.com/apis/credentials/oauthclient'
Start-Process "https://supabase.com/dashboard/project/$ref/auth/providers?provider=Google"

Write-Host ''
Write-Host 'Follow: docs/supabase/GOOGLE_OAUTH_EASY.md' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Steps:'
Write-Host '  1. OAuth consent screen - External - add YOUR Gmail as Test user'
Write-Host '  2. Credentials - OAuth client ID - Web application'
Write-Host "  3. Redirect URI (in clipboard): $callback"
Write-Host '  4. Supabase Google tab - Enable - paste Client ID + Secret - Save'
Write-Host '  5. Test: https://the-perfect-trader.vercel.app/signup - Google button'
