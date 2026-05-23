# Google OAuth fix (when GitHub works but Google does not)

GitHub working means **Supabase + app callback are correct**. Google failures are almost always **Google Cloud Console** or **wrong secret in Supabase**.

## 1. Authorized redirect URI (most common)

[Google Cloud → Credentials](https://console.cloud.google.com/apis/credentials) → your **OAuth 2.0 Client ID** (Web application)

Under **Authorized redirect URIs**, add **exactly** (no trailing slash):

```
https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
```

**Not** `https://the-perfect-trader.vercel.app/...` — only the Supabase URL above.

Click **Save**. Wait 1–2 minutes for Google to apply changes.

## 2. Authorized JavaScript origins

Same OAuth client → **Authorized JavaScript origins**:

```
https://the-perfect-trader.vercel.app
http://localhost:3000
```

## 3. Client secret in Supabase (not the Client ID)

1. Google Cloud → Credentials → your client → copy **Client ID** (ends with `.apps.googleusercontent.com`)
2. Click **+ Add secret** or view secret → copy **Client secret** (starts with `GOCSPX-`)
3. [Supabase → Google provider](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers?provider=Google)
   - Enable Google
   - Paste **Client ID** and **Client secret** (`GOCSPX-...`, NOT the Client ID string twice)
   - **Save**

## 4. OAuth consent screen — test users

[OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)

- Publishing status **Testing** → add your Gmail under **Test users**
- Only listed test users can sign in until you publish the app

## 5. Try again

1. Incognito window  
2. [https://the-perfect-trader.vercel.app/signup](https://the-perfect-trader.vercel.app/signup)  
3. **Sign up with Google**  
4. Should reach **onboarding** like GitHub  

Quick setup: `npm run oauth:google`  
Full guide: [GOOGLE_OAUTH_EASY.md](./GOOGLE_OAUTH_EASY.md)
