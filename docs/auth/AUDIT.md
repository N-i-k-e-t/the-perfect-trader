# Auth audit (cursor-auth-master-prompt)

## Phase 1 findings (before fix)

| Check | Was | Fixed |
|-------|-----|-------|
| `/auth/callback` | Client `page.tsx` | Server `route.ts` + cookie copy on redirect |
| Server `getSession()` in context sync | Yes (client provider) | Client uses `getUser()`; server layout uses `getUser()` |
| `getClaims()` | Not in SDK v2.97 | Use `getUser()` in middleware/layout (validates JWT) |
| Middleware cookie `setAll` | Request + response | Yes, aligned with Supabase SSR |
| Middleware excludes `/auth/callback` | Yes (wrong) | **Included** again for session refresh |
| `x-forwarded-host` / `NEXT_PUBLIC_SITE_URL` | Partial | `redirectBase()` + `NEXT_PUBLIC_SITE_URL` |
| `Cache-Control: no-store` on auth | No | Set in middleware |
| Auth error page | Login query only | `/auth/auth-code-error` |
| Provider `initialUser` from server | No | Root layout passes `initialUser` + `initialAuthUserId` |
| Supabase client at module scope in provider | Every render | `useMemo(() => createClient(), [])` |

## Canonical flow (after fix)

```
/signup or /login
  → signInWithOAuth → Supabase → Google/GitHub
  → Supabase → GET /auth/callback?code=...
  → route.ts: exchangeCodeForSession + Set-Cookie on redirect
  → /onboarding (new) or /today (onboarding_completed)
  → middleware: getUser() on protected routes
  → AppShell: context user from server + onAuthStateChange
```

## Dashboard checklist

See `cursor-auth-master-prompt.md` Phase 4 and `docs/supabase/CONNECT.md`.
