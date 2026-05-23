# Google sign-in — easy setup (5–10 minutes)

Same idea as GitHub: you create a Google app, then paste two values into Supabase.

**Your project:** `firqlsjixojnrofycwbs` (Tokyo)  
**Live app:** https://the-perfect-trader.vercel.app

---

## Copy this once (you will paste it twice)

**Authorized redirect URI** (Google + Supabase use this):

```
https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
```

**Windows shortcut:** run in the project folder:

```powershell
npm run oauth:google
```

That copies the URL above and opens the right browser tabs.

---

## Step 1 — Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Top bar → pick a project or **New Project**
   - Name: `The Perfect Trader` (any name is fine)
3. Wait until the project is selected (name shows in the top bar)

---

## Step 2 — OAuth consent screen (who can log in)

1. Left menu → **APIs & Services** → **OAuth consent screen**
2. **User type** → choose **External** → **Create**
3. Fill only what is required:
   - **App name:** `The Perfect Trader`
   - **User support email:** your Gmail
   - **Developer contact email:** your Gmail
4. **Save and Continue** through Scopes (defaults are OK) → **Save and Continue**
5. **Test users** → **Add users** → add **your Gmail** (the account you will use to test login)
6. **Save and Continue** → back to dashboard

> While the app is in **Testing**, only emails you add as test users can sign in with Google. That is normal for beta.

---

## Step 3 — Create OAuth credentials

1. Left menu → **APIs & Services** → **Credentials**
2. **+ Create credentials** → **OAuth client ID**
3. If asked, complete the consent screen first (Step 2)
4. **Application type:** **Web application**
5. **Name:** `The Perfect Trader Web`
6. **Authorized JavaScript origins** — click **+ Add URI** and add:

   ```
   https://the-perfect-trader.vercel.app
   ```

   Optional for local dev:

   ```
   http://localhost:3000
   ```

7. **Authorized redirect URIs** — click **+ Add URI** and paste **exactly**:

   ```
   https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
   ```

   No trailing slash. No extra paths.

8. Click **Create**
9. A popup shows **Client ID** and **Client secret** — keep this open or download JSON

---

## Step 4 — Paste into Supabase

1. Open [Supabase → Auth → Providers → Google](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers?provider=Google)
2. Turn **Enable Sign in with Google** **ON**
3. Paste:
   - **Client ID** (ends with `.apps.googleusercontent.com`)
   - **Client secret** (starts with `GOCSPX-` usually)
4. Click **Save**

---

## Step 5 — Auth URLs (quick check)

Open [Auth → URL configuration](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/url-configuration)

| Field | Value |
|-------|--------|
| Site URL | `https://the-perfect-trader.vercel.app` |
| Redirect URLs | `https://the-perfect-trader.vercel.app/**` |
| | `http://localhost:3000/**` |

Click **Save** if you changed anything.

---

## Step 6 — Test on the live site

1. Open https://the-perfect-trader.vercel.app/signup
2. Accept **Terms**
3. Click the **Google** icon (under “or sign up with”)
4. Pick your Google account (must be a **test user** from Step 2)
5. You should return to the app → **Onboarding** or **Today**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `provider is not enabled` | Step 4 — enable Google in Supabase and **Save** |
| `redirect_uri_mismatch` | Step 3 — redirect URI must match **exactly** the callback URL above |
| `Access blocked: app has not completed Google verification` | Add your Gmail under **Test users** (Step 2) |
| Google works but lands on login error | Step 5 — add `https://the-perfect-trader.vercel.app/**` to Redirect URLs |
| Email signup still fails | [Turn off Confirm email](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers) under Email provider |

---

## Optional — enable via CLI

OAuth values are stored in **`.env.oauth.local`** (gitignored, same as other secrets).

If you have a [Supabase access token](https://supabase.com/dashboard/account/tokens) (`sbp_...`):

1. Edit `.env.oauth.local` in the project root:

   ```
   SUPABASE_ACCESS_TOKEN=sbp_your_token
   GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...
   ```

2. Run:

   ```powershell
   npm run oauth:apply
   ```

---

## Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen → External + your email as test user
- [ ] OAuth client ID (Web) with redirect URI to Supabase callback
- [ ] Supabase Google provider enabled with Client ID + Secret
- [ ] Auth URL configuration saved
- [ ] Test signup with Google on production

When all boxes are checked, Google login matches GitHub.
