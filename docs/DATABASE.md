# Database — everything from this project

You can **define schema**, **connect**, **migrate**, and **browse data** without leaving Cursor/VS Code.

## Project credentials

| Doc | Contents |
|-----|----------|
| [docs/SUPABASE_PROJECT.md](./docs/SUPABASE_PROJECT.md) | Public overview (no secrets) |
| [docs/SUPABASE_PROJECT.local.md](./docs/SUPABASE_PROJECT.local.md) | Full keys & JWKS (local, gitignored) |
| `.env.local` | Active env vars for the app |

**Project ref:** `firqlsjixojnrofycwbs` · **Region:** `ap-northeast-1`

## Folder map

```

├── supabase/
│   ├── config.toml          ← local ports, auth, API settings
│   ├── migrations/          ← EDIT SCHEMA HERE (*.sql)
│   ├── seed.sql             ← optional test data on reset
│   └── seed.sql
├── scripts/
│   ├── setup-supabase.ps1   ← first-time connect (local or cloud)
│   └── sync-env-local.ps1   ← refresh .env.local from local Supabase
├── .env.local               ← connection keys (not in git)
└── src/types/database.ts    ← generated types (npm run db:types)
```

## First-time setup

```powershell
cd .
npm install
npm run setup:supabase
```

Pick **[1] Local** (Docker) or **[2] Cloud** (supabase.com).

## Daily workflow

### 1. Edit schema

Open or create a file in `supabase/migrations/`:

```sql
-- supabase/migrations/20260322120000_add_notes.sql
alter table public.trader_snapshots
  add column if not exists notes text;
```

Or create a blank migration:

```powershell
npm run db:new -- add_notes
```

### 2. Apply changes

| Target | Command |
|--------|---------|
| Local Docker DB | `npm run db:reset` |
| Linked cloud project | `npm run db:push` |

### 3. Run the app

```powershell
npm run dev
```

## All commands

| npm script | Action |
|------------|--------|
| `db:start` | Start local Supabase (needs Docker) |
| `db:stop` | Stop local Supabase |
| `db:status` | Show URLs and keys |
| `db:env` | Write `.env.local` from local Supabase |
| `db:reset` | Drop DB → run all migrations → seed |
| `db:push` | Apply migrations to **cloud** (after `supabase link`) |
| `db:pull` | Pull remote schema into a migration |
| `db:diff` | Auto-generate migration from DB diff |
| `db:new -- name` | New empty migration file |
| `db:studio` | Table editor UI (local or linked) |
| `db:types` | TypeScript types from schema |

## Cloud project link (one time)

```powershell
npx supabase login
npx supabase link --project-ref firqlsjixojnrofycwbs
npm run db:push
```

## Cursor / VS Code tasks

**Terminal → Run Task** (or `Ctrl+Shift+P` → “Tasks: Run Task”):

- Supabase: Start local
- Supabase: Reset DB (apply migrations)
- Supabase: Push to cloud
- Supabase: Open Studio
- Supabase: New migration

## Local URLs (after `db:start`)

| Service | URL |
|---------|-----|
| Studio (tables, SQL) | http://127.0.0.1:54323 |
| API | http://127.0.0.1:54321 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## Production

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` on Vercel, then `npm run db:push` from a machine linked to that project.
