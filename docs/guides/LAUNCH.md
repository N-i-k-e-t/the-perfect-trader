# Launch checklist — GitHub → Vercel (free stack)

Use this when shipping **THE PERFECT TRADER** to [github.com/N-i-k-e-t/the-perfect-trader](https://github.com/N-i-k-e-t/the-perfect-trader).

## Free stack (no credit card required for MVP)

| Layer | Service | Free tier notes |
|-------|---------|-----------------|
| App hosting | [Vercel](https://vercel.com) | Hobby — Next.js, auto deploy on push |
| Auth + DB | [Supabase](https://supabase.com) | Free — 500MB DB, 50k MAU auth |
| AI (optional) | [Google AI Studio](https://aistudio.google.com) | Gemini Flash free quota |
| Source | GitHub | Public repo is fine |

**You do not run Docker on Vercel.** Docker in this repo is for local/staging parity only.

---

## Step 1 — Push code to GitHub

From your project folder (`THE-PERFECT-TRADER` or `Rulesyci-main`):

```powershell
# Point origin at the new empty repo (one time)
git remote set-url origin https://github.com/N-i-k-e-t/the-perfect-trader.git

# Stage app (not secrets)
git add .
git status   # confirm .env.local is NOT listed

git commit -m "Launch: Next.js app, Supabase, Docker, Vercel config"
git push -u origin main
```

If `main` does not exist on GitHub yet, the first push creates it.

---

## Step 2 — Supabase (database + users)

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs) (or create a **new** free project in Mumbai/Tokyo for India users).
2. Run migrations:
   ```powershell
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npm run db:push
   ```
3. **Authentication → URL configuration** (after you know Vercel URL):

   | Field | Value |
   |-------|--------|
   | Site URL | `https://YOUR-APP.vercel.app` |
   | Redirect URLs | `https://YOUR-APP.vercel.app/**`, `http://localhost:3000/**` |

4. Enable **Email** provider. Enable **Google/GitHub** only after Step 4 deploy works and `/auth/callback` is live.

---

## Step 3 — Import repo in Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** `N-i-k-e-t/the-perfect-trader`
2. Framework: **Next.js** (auto-detected)
3. **Root Directory:** `.` (repository root — not `legacy/`)
4. Build: `npm run build` (default)

---

## Step 4 — Vercel environment variables

In **Project → Settings → Environment Variables**, add for **Production** and **Preview**:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `anon` public key only |
| `GEMINI_API_KEY` | Optional | Server route `/api/parse-trade` |

Never add `SUPABASE_SERVICE_ROLE_KEY` unless you add server-only admin routes.

Deploy → copy the `*.vercel.app` URL → update Supabase redirect URLs (Step 2).

---

## Step 5 — Smoke test (production)

- [ ] `https://YOUR-APP.vercel.app` loads marketing page
- [ ] Sign up with email → onboarding → `/today`
- [ ] Check **Supabase → Table Editor → `trader_snapshots`** for a row after use
- [ ] Rule checklist updates compliance % and grade
- [ ] OAuth (optional): Google login returns to `/today` via `/auth/callback`

---

## Step 6 — Custom domain (optional)

Vercel → **Domains** → add your domain → DNS as instructed → set Supabase Site URL to the custom domain.

---

## Docker (local only)

```powershell
# Dev with hot reload
docker compose --profile dev up dev

# Production-like container (requires successful npm run build in image)
docker compose up app --build
```

Requires `.env.local` with Supabase keys.

---

## Discipline formulas (for users)

Documented in [../production/DISCIPLINE-FORMULAS.md](../production/DISCIPLINE-FORMULAS.md).  
Code: `src/lib/discipline.ts`.

---

## Still before public marketing

See [../production/OPEN-QUESTIONS.md](../production/OPEN-QUESTIONS.md): privacy page copy, Stripe vs trial gate, replace PWA icons with final brand assets.
