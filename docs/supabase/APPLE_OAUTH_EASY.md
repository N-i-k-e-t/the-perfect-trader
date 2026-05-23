# Apple Sign In — easy setup (web + Supabase)

Use this after **Google** and **GitHub** are working. Apple needs an **Apple Developer** account ($99/year).

**Project:** `firqlsjixojnrofycwbs`  
**Live app:** https://the-perfect-trader.vercel.app

---

## Copy these (used in Apple + Supabase)

**Return URL / callback** (paste in Apple Developer):

```
https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
```

**Domain** (Apple “Domains and Subdomains”):

```
firqlsjixojnrofycwbs.supabase.co
```

**Windows shortcut:**

```powershell
npm run oauth:apple
```

Copies the callback URL and opens Apple Developer + Supabase Apple provider.

---

## What you will collect (keep in `.env.oauth.local`)

| Name | Example | Where |
|------|---------|--------|
| **Services ID** (Client ID) | `com.perfecttrader.web` | Identifiers → Services IDs |
| **Team ID** | `AB12CD34EF` | Membership details |
| **Key ID** | `90949ae7-8251-...` | Keys → Sign in with Apple key |
| **Secret (.p8 file)** | `AuthKey_XXXX.p8` | Download once from Keys |

Store in `.env.oauth.local` (gitignored):

```
APPLE_SERVICES_ID=com.perfecttrader.web
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_SECRET_KEY_PATH=C:\path\to\AuthKey_XXXX.p8
```

---

## Step 1 — Apple Developer account

1. [developer.apple.com](https://developer.apple.com/) → sign in
2. Enroll in **Apple Developer Program** if you have not already

---

## Step 2 — App ID (enable Sign in with Apple)

1. [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. **Identifiers** → **+** → **App IDs** → **App**
3. Description: `The Perfect Trader`
4. Bundle ID: e.g. `com.perfecttrader.app` (for future iOS app; pick your own reverse-DNS)
5. Enable **Sign in with Apple** → **Configure** → **Enable as primary** (or default) → **Save**
6. **Continue** → **Register**

---

## Step 3 — Services ID (this is your web “Client ID”)

1. **Identifiers** → **+** → **Services IDs** → **Continue**
2. Description: `The Perfect Trader Web`
3. Identifier: e.g. `com.perfecttrader.web` ← **this is your Client ID in Supabase**
4. Enable **Sign in with Apple** → **Configure**
5. **Primary App ID:** pick the App ID from Step 2
6. **Domains and Subdomains:** add:

   ```
   firqlsjixojnrofycwbs.supabase.co
   ```

7. **Return URLs:** add:

   ```
   https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
   ```

8. **Save** → **Continue** → **Register**

---

## Step 4 — Key (.p8 file)

1. **Keys** → **+**
2. Name: `Perfect Trader Sign In with Apple`
3. Enable **Sign in with Apple** → **Configure** → select your **Primary App ID** → **Save**
4. **Continue** → **Register**
5. **Download** the `.p8` file (only once — store safely)
6. Note the **Key ID** shown on the key page

---

## Step 5 — Team ID

1. [Membership details](https://developer.apple.com/account#MembershipDetailsCard) (or Account page)
2. Copy **Team ID** (10 characters)

---

## Step 6 — Supabase Apple provider

1. [Auth → Providers → Apple](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers?provider=Apple)
2. **Enable** Sign in with Apple
3. Fill in:

| Supabase field | Value |
|----------------|--------|
| **Client IDs** | Your **Services ID** (e.g. `com.perfecttrader.web`) |
| **Secret Key** | Open the `.p8` file in a text editor → paste **entire contents** (including `BEGIN` / `END` lines) |
| **Key ID** | From Step 4 |
| **Team ID** | From Step 5 |

4. **Save**

---

## Step 7 — Auth URLs (same as Google/GitHub)

[URL configuration](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/url-configuration)

| Field | Value |
|-------|--------|
| Site URL | `https://the-perfect-trader.vercel.app` |
| Redirect URLs | `https://the-perfect-trader.vercel.app/**` |
| | `http://localhost:3000/**` |

---

## Step 8 — Test

1. https://the-perfect-trader.vercel.app/signup
2. Accept terms
3. Tap the **Apple** button
4. Sign in with Apple ID → return to app → Onboarding / Today

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `provider is not enabled` | Step 6 — Enable Apple in Supabase and **Save** |
| `invalid_client` | Services ID must match **Client IDs** in Supabase exactly |
| Return URL mismatch | Step 3 — Return URL must match callback exactly |
| Secret invalid | Paste full `.p8` file content, not the Client ID |
| Works on Safari only issues | Apple web auth needs HTTPS (production Vercel is fine) |

---

## iOS app later (Flutter `mobile/`)

When you ship the iOS app, add the **Bundle ID** App ID to the same Apple key and add the bundle ID to Supabase **Client IDs** (comma-separated):

```
com.perfecttrader.web,com.perfecttrader.app
```

---

## Checklist

- [ ] Apple Developer Program active
- [ ] App ID with Sign in with Apple
- [ ] Services ID with domain + return URL
- [ ] Key downloaded (.p8) + Key ID noted
- [ ] Team ID copied
- [ ] Supabase Apple provider saved
- [ ] Test Apple button on signup
