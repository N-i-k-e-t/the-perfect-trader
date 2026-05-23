# Contributing to The Perfect Trader

Thank you for your interest. This is an indie beta project — keep PRs focused and small.

## Code style

- **ESLint** — run `npm run lint` before opening a PR
- **TypeScript** — strict types; avoid `any`
- **Formatting** — match existing files (Prettier via editor if configured)
- **Components** — prefer server components unless you need hooks; client components suffixed with interactivity in filename or `'use client'` at top

## Branch naming

- `feature/short-description` — new features
- `fix/short-description` — bug fixes
- `chore/short-description` — tooling, deps, docs

## Commit format

Use conventional prefixes:

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance
- `docs:` — documentation only

Example: `feat: add CSV export to journal`

## Pull request process

1. Fork and branch from `main`
2. Describe **what** and **why** in the PR body
3. Add a **screenshot** for UI changes
4. Note how you **tested** (e.g. `npm run build`, manual steps)
5. Keep secrets out of commits — use `.env.local` only

## Environment setup

Same as [README.md](../README.md):

```powershell
git clone https://github.com/N-i-k-e-t/the-perfect-trader.git
cd the-perfect-trader
npm install
cp .env.example .env.local
# Fill Supabase + Gemini + Resend keys
npm run dev
```

Database: run `docs/supabase/APPLY_SCHEMA.sql` in the Supabase SQL editor.

## Areas that need care

- **RLS** — never weaken Row Level Security without review
- **Service role** — only in `src/app/api/*` and server utilities, never client-side
- **PII** — trading data is sensitive; log minimally in production

Questions? Open an issue or email support@theperfecttrader.app.
