# Automated Vercel deploy

GitHub already has the code. Pick **one** path:

## Path A — Fastest (no CLI): Vercel dashboard

1. [vercel.com/new](https://vercel.com/new) → Import **`N-i-k-e-t/the-perfect-trader`**
2. Root: **`.`**
3. Add env vars (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://firqlsjixojnrofycwbs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase → API → **anon** |
| `NEXT_PUBLIC_BETA_MODE` | `true` |

4. Deploy → copy `*.vercel.app` URL
5. Supabase → Auth → URL config → Site URL + `https://YOUR-APP.vercel.app/**`

Every future `git push` to `main` auto-deploys.

## Path B — One command (local)

```powershell
# 1. Get tokens (one-time)
# Vercel: https://vercel.com/account/tokens
# Supabase (optional): https://supabase.com/dashboard/account/tokens

# 2. Add anon key to .env.local (required if not there)
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

$env:VERCEL_TOKEN = "paste-vercel-token"
$env:SUPABASE_ACCESS_TOKEN = "paste-sbp-token"   # optional
$env:SUPABASE_DB_PASSWORD = "your-db-password"   # optional

npm run deploy:live
```

## Path C — GitHub Actions

Add secrets under **GitHub → Settings → Secrets → Actions**:

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Workflow: `.github/workflows/deploy-vercel.yml` runs on every push to `main`.

## After deploy

- [ ] Home loads
- [ ] Sign up → `/today`
- [ ] `trader_snapshots` row in Supabase
