# GitHub OAuth fix (when Google works but GitHub does not)

Google working proves **Supabase URL config** and **app callback** are correct. GitHub failures are almost always **GitHub OAuth app** or **email scope** settings.

## 1. GitHub OAuth App (not “GitHub App”)

Create or edit: [GitHub → Developer settings → OAuth Apps](https://github.com/settings/developers)

| Field | Must be exactly |
|--------|------------------|
| **Authorization callback URL** | `https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback` |
| **Homepage URL** | `https://the-perfect-trader.vercel.app` |

Do **not** put the Vercel URL in the callback field — only the Supabase URL above.

## 2. Supabase GitHub provider

[Auth → Providers → GitHub](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/auth/providers?provider=GitHub)

- Enabled: **ON**
- Client ID: from GitHub OAuth app
- Client Secret: click **Generate new client secret** on GitHub and paste the new secret (not the Client ID)

## 3. Allow GitHub to share email

On [GitHub → Settings → Emails](https://github.com/settings/emails):

- Have a **primary verified email**
- If sign-in still fails, temporarily enable **“Keep my email addresses private”** → OFF, or allow GitHub to share email with apps

The app now requests scopes `read:user user:email` so Supabase can create your account.

## 4. Try again

1. Incognito window  
2. [https://the-perfect-trader.vercel.app/signup](https://the-perfect-trader.vercel.app/signup)  
3. **Sign up with GitHub**  
4. If it fails, read the message on `/auth/auth-code-error` and fix the step above  

## 5. Still broken?

Use **Google** (already working) or paste the exact error text from the red error page into support.

Quick open setup tabs: `npm run oauth:setup`
