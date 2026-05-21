# Go live now — current web version (~15 minutes)

Ship **today’s** Next.js app to Vercel + Supabase. No store, no mobile build.

## What users get immediately

- Marketing home → signup/login → Today / Rules / Journal / Stats / Diary
- Data syncs to **your** Supabase project when env vars are set (not “local only”)
- Same build you run with `npm run build` locally

## Prerequisites

| Item | You need |
|------|----------|
| GitHub repo | [github.com/N-i-k-e-t/the-perfect-trader](https://github.com/N-i-k-e-t/the-perfect-trader) (or your fork) |
| Supabase | Free project — ref `firqlsjixojnrofycwbs` or a new one |
| Vercel account | Free Hobby |
| Keys | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Settings → API |

---

## Fast path (copy-paste order)

### 1. Database (once)

```powershell
cd "C:\Users\niket\Downloads\The Prefect Day-main"
npx supabase login
npx supabase link --project-ref firqlsjixojnrofycwbs
npm run db:push
```

If link fails, open Supabase **SQL Editor** and run `docs/supabase/APPLY_SCHEMA.sql`.

### 2. Local env (for your machine)

```powershell
copy .env.local.example .env.local
```

Edit `.env.local` — paste real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key only).

Optional: `GEMINI_API_KEY` for AI diary scan.

Verify:

```powershell
npm run build
npm run secrets:check
```

### 3. Push to GitHub (if not already)

```powershell
git status
# .env.local must NOT appear

git add .
git commit -m "Web: go-live pipeline and data domains"
git push -u origin main
```

### 4. Vercel — instant deploy

1. Open [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. **Root Directory:** `.` (repo root)
4. **Environment variables** (Production + Preview):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon) |

5. Click **Deploy** — live URL in ~2–3 minutes (`https://something.vercel.app`)

### 5. Wire Supabase auth to that URL

Supabase → **Authentication** → **URL configuration**:

| Field | Value |
|-------|--------|
| Site URL | `https://YOUR-APP.vercel.app` |
| Redirect URLs | `https://YOUR-APP.vercel.app/**` and `http://localhost:3000/**` |

Enable **Email** provider.

### 6. Smoke test (2 minutes)

- [ ] Open production URL — home loads
- [ ] Sign up with email → onboarding → `/today`
- [ ] Toggle a rule → refresh → still there
- [ ] Supabase → **Table Editor** → `trader_snapshots` → row for your `user_id`

**You are live.** Share the Vercel URL. Custom domain later: Vercel → Domains.

---

## After go-live (same day, optional)

| Task | Why |
|------|-----|
| Update [privacy page](../../src/app/privacy/page.tsx) | It still says “local only”; you now use cloud sync |
| Add `GEMINI_API_KEY` on Vercel | Diary AI scan on production |
| OAuth Google/GitHub | Only after `/auth/callback` works on prod URL |

---

## Data separation (your rule)

**App settings** and **internal trader data** are documented as separate *domains* in the same user account:

- **App** — profile, trial, preferences  
- **Work** — trades, rules execution, daily grades, analytics  
- **Thoughts** — diary scans, notes, psychology, AI coach memory  
- **History** — append-only timeline (planned)

See [../web/DATA_DOMAINS.md](../web/DATA_DOMAINS.md). v1 still stores one jsonb row; keys are grouped by domain so we can split tables later without losing data.

---

## If deploy fails

| Error | Fix |
|-------|-----|
| Build fails on Vercel | Run `npm run build` locally; fix TypeScript errors |
| Login works but no cloud save | Check Vercel env vars; redeploy |
| Auth redirect error | Supabase redirect URLs must match Vercel URL exactly |
| Empty `trader_snapshots` | RLS + migration: run `npm run db:push` |

Full pipeline: [../web/DEVOPS_PIPELINE.md](../web/DEVOPS_PIPELINE.md).
