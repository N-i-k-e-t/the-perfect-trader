# Google & GitHub OAuth — The Perfect Trader

**Supabase callback (copy into both Google and GitHub):**

```
https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
```

**Production app URL:** `https://the-perfect-trader.vercel.app`

---

## GitHub (≈3 minutes)

1. Open [New OAuth App](https://github.com/settings/applications/new)
2. Fill in:

| Field | Value |
|-------|--------|
| Application name | `The Perfect Trader` |
| Homepage URL | `https://the-perfect-trader.vercel.app` |
| Authorization callback URL | `https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback` |

3. Click **Register application**
4. Copy **Client ID** and generate **Client secret**
5. Supabase → [Auth → Providers → GitHub](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers?provider=GitHub)
   - Enable GitHub
   - Paste Client ID + Secret → **Save**

---

## Google (≈5 minutes)

**Easy step-by-step guide:** [GOOGLE_OAUTH_EASY.md](./GOOGLE_OAUTH_EASY.md)

Quick version:

1. Run `npm run oauth:google` (copies callback URL + opens tabs)
2. Google Cloud → OAuth consent screen → External → add your Gmail as **Test user**
3. Credentials → OAuth client ID → **Web application** → redirect URI:

   ```
   https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
   ```

4. Supabase → [Google provider](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers?provider=Google) → Enable → paste ID + secret → **Save**

---

## Apple (≈15 minutes, needs Apple Developer $99/yr)

**Easy guide:** [APPLE_OAUTH_EASY.md](./APPLE_OAUTH_EASY.md)

Quick version:

1. Run `npm run oauth:apple`
2. Apple Developer → Services ID + Key (`.p8`) + Team ID
3. Supabase → [Apple provider](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers?provider=Apple) → paste Services ID, `.p8` contents, Key ID, Team ID → **Save**

---

## Auth URLs (required)

[Auth → URL configuration](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/url-configuration)

| Field | Value |
|-------|--------|
| Site URL | `https://the-perfect-trader.vercel.app` |
| Redirect URLs | `https://the-perfect-trader.vercel.app/**` |
| | `http://localhost:3000/**` |

Turn **off** “Confirm email” under [Email provider](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers) to avoid rate limits during beta.

---

## CLI enable (after you have secrets)

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_your_token"
$env:GITHUB_OAUTH_CLIENT_ID = "..."
$env:GITHUB_OAUTH_CLIENT_SECRET = "..."
# optional Google:
$env:GOOGLE_OAUTH_CLIENT_ID = "..."
$env:GOOGLE_OAUTH_CLIENT_SECRET = "..."

npm run oauth:enable
```

---

## Verify

```powershell
node -e "const {createClient}=require('@supabase/supabase-js');const s=createClient('https://firqlsjixojnrofycwbs.supabase.co','YOUR_ANON_OR_PUBLISHABLE');s.auth.signInWithOAuth({provider:'github',options:{redirectTo:'https://the-perfect-trader.vercel.app/auth/callback',skipBrowserRedirect:true}}).then(r=>console.log(r.error?.message||r.data?.url?.slice(0,80)));"
```

Success: URL starts with `https://github.com/login/oauth` (not `validation_failed`).
