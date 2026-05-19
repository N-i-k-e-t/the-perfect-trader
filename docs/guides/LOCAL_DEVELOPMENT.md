# Local development — THE PERFECT TRADER

Run the full app on your machine. Same codebase deploys to Vercel + Supabase cloud.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ (22 recommended) |
| npm | 10+ |
| Git | any |
| Docker Desktop | optional — for local Supabase only |

## 1. Get the code

```powershell
git clone https://github.com/N-i-k-e-t/the-perfect-trader.git THE-PERFECT-TRADER
cd .
```

If you already have `Rulesyci-main`, rename the folder to `THE-PERFECT-TRADER` and `cd` into it.

## 2. Install dependencies

```powershell
npm install
```

## 3. Environment (choose one path)

### Path A — Cloud Supabase (recommended, matches production)

1. Copy example env:
   ```powershell
   copy .env.local.example .env.local
   ```
2. Fill from [Supabase Dashboard](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs) → **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Optional: `GEMINI_API_KEY` for real AI trade parsing on server.

Or run the wizard:

```powershell
npm run setup:supabase
```

Choose **[2] Cloud** and paste keys.

### Path B — Local Supabase (Docker, offline DB)

```powershell
npm run setup:supabase
```

Choose **[1] Local** — starts Docker, writes `.env.local`, runs migrations.

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Studio | http://127.0.0.1:54323 |
| API | http://127.0.0.1:54321 |

Refresh env after restart:

```powershell
npm run db:env
```

## 4. Database schema

**Cloud:**

```powershell
npx supabase login
npx supabase link --project-ref firqlsjixojnrofycwbs
npm run db:push
```

**Local Docker:**

```powershell
npm run db:reset
```

## 5. Run the app

```powershell
npm run dev
```

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Today | http://localhost:3000/today |
| Login | http://localhost:3000/login |

## 6. Verify

- [ ] `npm run build` passes
- [ ] Sign up / log in works
- [ ] Log a trade on `/today` → FAB → Log Trade
- [ ] Row appears in Supabase → `trader_snapshots` (cloud mode)

## Local vs production differences

| Item | Local | Production |
|------|-------|------------|
| URL | localhost:3000 | your Vercel domain |
| Supabase | same project or Docker | `firqlsjixojnrofycwbs` |
| Gemini | optional in `.env.local` | Vercel env var |
| HTTPS | no | yes (required for some PWA features) |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `npx kill-port 3000` or `npm run dev -- -p 3001` |
| Supabase placeholder mode | Fill `.env.local`, restart dev server |
| `db:push` DNS error | Run `supabase link` + check network; use Dashboard SQL Editor as fallback |
| Old `rulesci_data` | Auto-migrates to `perfect_trader_data` on load |

## Cursor / VS Code tasks

**Terminal → Run Task** — Supabase start, reset, studio, dev server (`.vscode/tasks.json`).
