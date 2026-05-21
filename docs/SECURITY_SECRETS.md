# Secrets & encryption

Protect API keys, database passwords, and JWTs so they are **not stored in plaintext** in the repo and are **hidden from AI tools** where possible.

## Layers

| Layer | What it does |
|-------|----------------|
| **Encrypted vault** | `secrets/vault.enc` — AES-256-CBC + PBKDF2 (210k iterations). Unlocked only with your master password. |
| **`.gitignore`** | Blocks `.env*`, `secrets/`, local credential docs from git. |
| **`.cursorignore`** | Stops Cursor from indexing `.env.local`, `mobile/.env`, and the vault. |
| **`npm run secrets:check`** | Scans tracked files for leaked JWTs / connection strings before commit. |
| **Client vs server** | Anon key → web/mobile only. Service role & DB password → vault + server scripts only. |

## Important truth

If a secret was **pasted in chat**, treat it as **compromised**. Rotate in [Supabase → Settings → API](https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/settings/api) and reset the **database password**.

Encryption in the repo does **not** undo past leaks — rotation does.

## Setup (once)

```powershell
cd c:\Users\niket\Downloads\Rulesyci-main

# Move existing .env.local secrets into vault and scrub plaintext files
npm run secrets:migrate

# Or create vault from scratch
npm run secrets:init
```

Choose a **strong master password** (12+ characters). You need it whenever you unlock the vault.

## Daily use

```powershell
# Load secrets into current terminal only (nothing written to disk)
npm run secrets:unlock

# Then run app or DB commands in the same window
npm run dev
npm run db:push:url
npm run secrets:sync-mobile   # writes mobile/.env from session (anon only)
```

## What goes in the vault

| Key | Used by |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Web + mobile |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web + mobile (public, RLS-scoped) |
| `SUPABASE_DB_PASSWORD` | CLI migrations only |
| `SUPABASE_SERVICE_ROLE_KEY` | Server scripts only — never Next.js client |
| `SUPABASE_PUBLISHABLE_KEY` | Optional newer key format |
| `GEMINI_API_KEY` | Server API routes only |

## `.env.local` after migration

Only **non-secret** config (project ref, region, public URL). No JWTs, no passwords.

## Mobile

`mobile/.env` is gitignored. After `secrets:unlock`, run `npm run secrets:sync-mobile` to copy URL + anon key locally.

On device, Flutter uses `flutter_secure_storage` for session tokens at runtime (Supabase SDK).

## Vercel / production

Set env vars in the **Vercel dashboard** (or CI secrets), not in the repo. Never add service role to `NEXT_PUBLIC_*`.

## Pre-commit check

```powershell
npm run secrets:check
```
