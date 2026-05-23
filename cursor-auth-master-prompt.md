# 🧠 CURSOR MASTER PROMPT — Fix & Harden Supabase Auth for "The Perfect Trader"

> Paste this entire prompt into Cursor's Composer (Agent mode). It is self-contained. Cursor will read your codebase, cross-reference the open-source reference repos listed below, and apply every fix. Do NOT skip any section.

---

## 🎯 MISSION

You are a senior full-stack engineer. Your task is to **audit, fix, and harden the entire authentication system** of this Next.js 16 App Router project called "The Perfect Trader". The app uses Supabase Auth, `@supabase/ssr`, OAuth (Google + GitHub), optional email/password, and is deployed on Vercel.

You have full access to this codebase. Read every relevant file before making changes. Do not guess — inspect first, then fix.

---

## 📦 OPEN SOURCE REFERENCES (read these to understand correct patterns)

Before touching any file, study the following open-source reference implementations:

1. **Official Supabase + Next.js App Router starter:**
   - Repo: `https://github.com/supabase/supabase/tree/master/examples/auth/nextjs`
   - Also bootstrap with: `npx create-next-app --example with-supabase`
   - Focus on: `app/auth/callback/route.ts`, `utils/supabase/server.ts`, `utils/supabase/client.ts`, `middleware.ts`

2. **Vercel Next.js Subscription Payments (production-grade):**
   - Repo: `https://github.com/vercel/nextjs-subscription-payments`
   - Focus on: auth callback handler, `NEXT_PUBLIC_SITE_URL` usage, redirect URL construction

3. **Supabase SSR package source:**
   - Repo: `https://github.com/supabase/ssr`
   - Focus on: `createServerClient`, `createBrowserClient`, cookie handling contracts

4. **Supabase Auth JS source:**
   - Repo: `https://github.com/supabase/auth-js`
   - Focus on: `exchangeCodeForSession`, `getClaims`, `getUser`, `updateUser`, PKCE verifier storage

Use these to understand the **canonical correct pattern**, then apply it here.

---

## 🗂️ PROJECT CONTEXT

- **App:** The Perfect Trader (discipline/journal web app, beta ~100 users)
- **Stack:** Next.js 16 App Router, React, Vercel, Supabase (project ref: `firqlsjixojnrofycwbs`, region: Tokyo)
- **Auth SDK:** `@supabase/supabase-js` + `@supabase/ssr` (`createBrowserClient`, `createServerClient`)
- **Database:** Supabase Postgres, RLS on `trader_snapshots` (`user_id = auth.uid()`)
- **OAuth:** Google, GitHub (no Apple)
- **Email/password:** Optional — OAuth users can add password later via `updateUser` in Settings
- **No custom auth server** — only Supabase + one Next.js API route

---

## 🔍 PHASE 1 — AUDIT (read-only, no changes yet)

Search and read the following files in this repo:

```
src/middleware.ts
src/app/auth/callback/         ← could be route.ts or page.tsx
src/utils/supabase/server.ts   (or lib/supabase/server.ts)
src/utils/supabase/client.ts   (or lib/supabase/client.ts)
src/app/layout.tsx
src/app/(auth)/login/page.tsx  (or similar)
src/app/(auth)/signup/page.tsx
src/app/settings/page.tsx      (or where updateUser password is called)
src/context/AuthContext.tsx    (or similar React context)
.env.local (or note which SUPABASE env vars are in use)
```

For each file, note:
1. Is `getSession()` used anywhere server-side? (**CRITICAL BUG** — must replace)
2. Is `/auth/callback` a `page.tsx` (client) or `route.ts` (server)? (**CRITICAL BUG** if client)
3. Is the Supabase client initialized at module scope? (**CRITICAL BUG** — must be inside handler)
4. Is `getClaims()` or `getUser()` used in middleware?
5. Are env vars named `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`?
6. Does middleware use correct `setAll` / `getAll` cookie pattern from `@supabase/ssr`?
7. Is `Cache-Control: private, no-store` set on auth routes?
8. Is `x-forwarded-host` handled in the callback?

Print a full audit report as a code comment or markdown block before making any changes.

---

## 🔧 PHASE 2 — CRITICAL FIXES (apply in order)

### FIX 1 — Replace client `/auth/callback/page.tsx` with server Route Handler

**Delete** `src/app/auth/callback/page.tsx` (if it exists).

**Create** `src/app/auth/callback/route.ts` with exactly this content:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // If provider returned an error, redirect to error page
  if (error) {
    console.error('[auth/callback] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription ?? '')}`
    )
  }

  // Determine where to send user after login
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/' // prevent open redirect

  if (code) {
    const supabase = await createClient()

    // Debug: verify PKCE verifier cookie is present
    // (remove in production after testing)
    const req = request as Request & { cookies?: { get: (n: string) => { value: string } | undefined } }
    const verifierKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token-code-verifier`
    console.log('[auth/callback] PKCE verifier present:', !!(req as any).headers?.get?.('cookie')?.includes(verifierKey))

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Determine if new user (for onboarding redirect)
    const isNewUser = !data.user?.user_metadata?.onboarding_completed
    next = isNewUser ? '/onboarding' : '/today'

    // Vercel: use x-forwarded-host to resolve the real public origin
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code present — redirect to error page
  console.error('[auth/callback] No code in URL')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}
```

---

### FIX 2 — Create correct `utils/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
            // The middleware will handle session refresh
          }
        },
      },
    }
  )
}
```

---

### FIX 3 — Create correct `utils/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**IMPORTANT:** Never initialize this at module scope. Always call `createClient()` inside a component or hook.

---

### FIX 4 — Rewrite `src/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // NEVER initialize Supabase client outside this function
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Must set on BOTH request and response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Use getClaims() — NOT getSession() — for server auth checks
  // getClaims() validates JWT signature locally (no network call, cryptographically safe)
  // getSession() only reads storage and CANNOT be trusted server-side
  const { data: { claims } } = await supabase.auth.getClaims()

  const { pathname } = request.nextUrl

  // Define protected routes (unauthenticated users → /login)
  const protectedRoutes = ['/today', '/onboarding', '/settings', '/journal']
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!claims && isProtected) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/signup']
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route))
  if (claims && isAuthPage) {
    return NextResponse.redirect(new URL('/today', request.url))
  }

  // Prevent Vercel edge caching of session-bearing responses
  supabaseResponse.headers.set('Cache-Control', 'private, no-store')

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public assets (images, fonts, etc.)
     * DO include /auth/callback — middleware cookie refresh is needed there
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$).*)',
  ],
}
```

---

### FIX 5 — Update Root Layout to initialize AuthProvider with server-side user

```typescript
// src/app/layout.tsx
import { createClient } from '@/utils/supabase/server'
import { AuthProvider } from '@/context/AuthContext' // adjust import path

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Use getClaims() — fast, no network, cryptographically verified
  const { data: { claims } } = await supabase.auth.getClaims()

  // Build a minimal user object from JWT claims
  const initialUser = claims
    ? {
        id: claims.sub,
        email: claims.email as string | undefined,
        user_metadata: claims, // pass full claims as metadata
      }
    : null

  return (
    <html lang="en">
      <body>
        <AuthProvider initialUser={initialUser}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

### FIX 6 — Update `AuthContext.tsx` to accept `initialUser` prop

Find the `AuthProvider` / `AuthContext` component and update it:

```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: Partial<User> | null
}) {
  // Initialize with server-side user — eliminates flash of unauthenticated content
  const [user, setUser] = useState<User | null>(initialUser as User | null)
  const [loading, setLoading] = useState(false) // not loading — already have server data

  useEffect(() => {
    const supabase = createClient()

    // Listen for client-side auth changes (logout, token refresh, OAuth login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

### FIX 7 — Fix `signInWithOAuth` call (in login/signup pages)

Find wherever `signInWithOAuth` is called and ensure it passes the correct `redirectTo`:

```typescript
// In login/signup page or component
const supabase = createClient() // from utils/supabase/client — inside component, not module scope

const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      // For onboarding detection, pass next param:
      // redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
    },
  })
  if (error) console.error('OAuth sign-in error:', error.message)
}
```

---

### FIX 8 — Fix password linking in Settings (add reauthentication)

Find the password update flow in Settings and update it:

```typescript
'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export function SetPasswordForm() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    const supabase = createClient()

    // Step 1: Reauthenticate — prevents session hijack escalation
    // This sends a verification email or prompts for current credentials
    const { error: reAuthError } = await supabase.auth.reauthenticate()
    if (reAuthError) {
      // reauthenticate() sends an email — inform user to check email
      setStatus('error')
      setErrorMsg('Please verify your identity first. Check your email for a confirmation link.')
      return
    }

    // Step 2: Set the new password (only call this after reauthentication token is verified)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('success')
    }
  }

  return (
    <form onSubmit={handleSetPassword}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password (min 8 chars)"
        minLength={8}
        required
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Setting password...' : 'Set Password'}
      </button>
      {status === 'error' && <p className="text-red-500">{errorMsg}</p>}
      {status === 'success' && <p className="text-green-500">Password set successfully!</p>}
    </form>
  )
}
```

---

### FIX 9 — Replace all `getSession()` server-side calls with `getClaims()`

Search the entire codebase:

```bash
grep -r "getSession()" src/ --include="*.ts" --include="*.tsx"
```

For every match in a Server Component, Server Action, Route Handler, or middleware:

```typescript
// ❌ REMOVE — unsafe on server, reads unvalidated storage
const { data: { session } } = await supabase.auth.getSession()
const user = session?.user

// ✅ REPLACE WITH — validates JWT signature cryptographically
const { data: { claims } } = await supabase.auth.getClaims()
const userId = claims?.sub
const userEmail = claims?.email
```

`getSession()` is safe ONLY in client components for reading local state. On the server it must never be used for access control decisions.

---

### FIX 10 — Add `auth-code-error` page

Create `src/app/auth/auth-code-error/page.tsx`:

```typescript
'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const description = params.get('description')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
      <p className="text-gray-600 mb-2">Something went wrong during sign-in.</p>
      {error && (
        <code className="bg-gray-100 px-3 py-1 rounded text-sm mb-2">{error}</code>
      )}
      {description && (
        <p className="text-gray-500 text-sm mb-4">{description}</p>
      )}
      <Link href="/login" className="text-blue-600 underline">
        Try again
      </Link>
    </div>
  )
}

export default function AuthCodeError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
```

---

## ⚙️ PHASE 3 — ENVIRONMENT VARIABLES AUDIT

Check `.env.local` and Vercel Dashboard environment variables. Ensure all of the following are set for **Production** environment in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://firqlsjixojnrofycwbs.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from Supabase Dashboard → Settings → API Keys>
# OR if using legacy key (both work until end of 2026):
NEXT_PUBLIC_SUPABASE_ANON_KEY=<legacy anon key>

# Used for constructing absolute redirect URLs in Server Actions/API routes
NEXT_PUBLIC_SITE_URL=https://the-perfect-trader.vercel.app
```

**In Vercel Dashboard:**
- Set `NEXT_PUBLIC_SITE_URL` only for the **Production** environment
- For **Preview** environments, leave it unset — the callback will use `x-forwarded-host` dynamically

---

## 📋 PHASE 4 — SUPABASE DASHBOARD CHECKLIST (Verify These Settings)

Instruct the user to verify the following in the Supabase Dashboard at `https://supabase.com/dashboard/project/firqlsjixojnrofycwbs`:

### Authentication → URL Configuration

```
Site URL:
  https://the-perfect-trader.vercel.app

Redirect URLs (allow list — add ALL of these):
  https://the-perfect-trader.vercel.app/auth/callback
  http://localhost:3000/auth/callback
  https://*-<your-vercel-team-slug>.vercel.app/**
```

### Authentication → Providers → Google

```
✅ Enabled: ON
Client ID: <from Google Cloud Console>
Client Secret: <from Google Cloud Console>

In Google Cloud Console OAuth app:
  Authorized JavaScript Origins:
    https://the-perfect-trader.vercel.app
    http://localhost:3000

  Authorized Redirect URIs (EXACTLY):
    https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
```

### Authentication → Providers → GitHub

```
✅ Enabled: ON
Client ID: <from GitHub Developer Settings>
Client Secret: <from GitHub Developer Settings>

In GitHub OAuth App:
  Homepage URL: https://the-perfect-trader.vercel.app
  Authorization callback URL (EXACTLY):
    https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback
```

### Authentication → Settings (advanced)

```
Allow new users to sign up: ON
Enable email confirmations: Your choice (OFF = easier beta; ON = more secure)
Secure email change: ON
Secure password change: ON  ← IMPORTANT for updateUser flow
```

---

## 🧪 PHASE 5 — VERIFICATION TESTS

After applying all fixes, run these tests:

### Test 1: OAuth new user flow

```
1. Open incognito browser
2. Navigate to https://the-perfect-trader.vercel.app/login
3. Click "Sign in with Google" or "Sign in with GitHub"
4. Complete OAuth flow
5. ✅ Expected: Redirected to /onboarding (new user) or /today (returning user)
6. ✅ Expected: No redirect loop back to /login
7. Open DevTools → Application → Cookies
8. ✅ Expected: sb-*-auth-token cookie present with HttpOnly=false, SameSite=Lax, Secure=true
```

### Test 2: Session persistence after page refresh

```
1. Log in via OAuth
2. Hard refresh (Ctrl+Shift+R) the page
3. ✅ Expected: Still logged in, no flash of login page
```

### Test 3: Protected route middleware

```
1. Log out completely (clear cookies)
2. Navigate directly to https://the-perfect-trader.vercel.app/today
3. ✅ Expected: Redirected to /login with ?redirectedFrom=/today
```

### Test 4: PKCE cookie debug log

```
1. Check Vercel function logs after an OAuth callback:
   vercel logs --follow
2. ✅ Expected: "[auth/callback] PKCE verifier present: true"
3. ❌ If false: PKCE cookie missing — check SameSite, Secure settings and browser context
```

### Test 5: No getSession() on server

```bash
grep -r "getSession()" src/ --include="*.ts" --include="*.tsx"
```

```
✅ Expected: Zero matches in Server Components, Route Handlers, middleware
✅ Allowed: Matches only inside 'use client' files
```

### Test 6: Password linking (Settings)

```
1. Log in via Google OAuth
2. Navigate to Settings → Set Password
3. Enter a new password and submit
4. ✅ Expected: Reauthentication email sent, then password set after confirmation
5. ✅ Expected: Can now log in with email + password as alternative to Google
```

---

## 🚀 PHASE 6 — POST-FIX IMPROVEMENTS (optional but recommended)

### Improvement 1: Type-safe Supabase client hook for client components

```typescript
// hooks/useSupabase.ts
'use client'
import { createClient } from '@/utils/supabase/client'
import { useMemo } from 'react'

export function useSupabase() {
  return useMemo(() => createClient(), [])
}
```

### Improvement 2: Add `export const dynamic = 'force-dynamic'` to auth-sensitive pages

```typescript
// src/app/today/page.tsx
export const dynamic = 'force-dynamic'
// This prevents Vercel from statically caching a page that contains user-specific data
```

### Improvement 3: Protect RLS with typed Supabase client

```typescript
// src/utils/supabase/typed-server.ts
import { createClient } from './server'
import type { Database } from '@/types/supabase' // generated by supabase gen types

export async function createTypedClient() {
  return createClient() as ReturnType<typeof createClient> // replace with Database generic when ready
}
```

Run to generate types:
```bash
npx supabase gen types typescript --project-id firqlsjixojnrofycwbs > src/types/supabase.ts
```

### Improvement 4: Middleware rate limiting on `/auth/callback`

```typescript
// In middleware.ts — add rate limiting check
if (pathname === '/auth/callback') {
  // Optional: add a lightweight IP-based rate limit here
  // Or use Vercel's built-in Edge Middleware rate limiting
}
```

### Improvement 5: Add onboarding check as DB source of truth

```typescript
// Instead of relying on user_metadata.onboarding_completed (client-writable),
// store onboarding status in a server-side table:
// CREATE TABLE user_profiles (user_id uuid PRIMARY KEY REFERENCES auth.users, onboarding_completed boolean DEFAULT false);
// ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
```

---

## ⚠️ STRICT RULES FOR CURSOR — DO NOT VIOLATE

1. **Never initialize Supabase client at module scope** — always inside request handler / component / hook
2. **Never use `getSession()` in server code** — use `getClaims()` instead
3. **Never expose `service_role` / `secret` key as `NEXT_PUBLIC_*`** — only publishable/anon key
4. **The `/auth/callback` must be a Route Handler (`route.ts`)** — not a page component
5. **Never hardcode the Supabase project URL or key** — always use env vars
6. **Never skip the `x-forwarded-host` check** in the callback route — Vercel requires it
7. **Never remove `Cache-Control: private, no-store`** from auth routes
8. **Never use `router.push` for post-auth navigation in the callback** — use `NextResponse.redirect` from the server Route Handler
9. **Both `request` and `response` cookies must be updated** in middleware `setAll` — never only one
10. **Always call `reauthenticate()` before `updateUser({ password })`** in Settings

---

## ✅ FINAL CHECKLIST — Confirm Before Closing

- [ ] `app/auth/callback/route.ts` exists (server Route Handler, NOT page.tsx)
- [ ] `utils/supabase/server.ts` uses `createServerClient` with `async cookies()` from `next/headers`
- [ ] `utils/supabase/client.ts` uses `createBrowserClient` — never at module scope
- [ ] `middleware.ts` uses `getClaims()` not `getSession()`, updates both request and response cookies
- [ ] Root layout passes server-fetched `initialUser` to `AuthProvider`
- [ ] `AuthProvider` initialized with `initialUser`, no client-side auth check on mount
- [ ] `signInWithOAuth` uses dynamic `window.location.origin` for `redirectTo`
- [ ] Settings password update uses `reauthenticate()` before `updateUser({ password })`
- [ ] All `getSession()` server-side calls replaced with `getClaims()`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set in Vercel production env
- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://the-perfect-trader.vercel.app` in Vercel production env
- [ ] Supabase Dashboard: Site URL = production URL
- [ ] Supabase Dashboard: Redirect URLs include production + localhost + Vercel preview wildcard
- [ ] Google Cloud Console: Authorized Redirect URI = `https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback`
- [ ] GitHub OAuth App: Authorization callback URL = `https://firqlsjixojnrofycwbs.supabase.co/auth/v1/callback`
- [ ] `auth-code-error` page created and handles error/description params
- [ ] `export const dynamic = 'force-dynamic'` on all user-specific pages
- [ ] All 6 verification tests pass
