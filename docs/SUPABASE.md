# Supabase setup (5 minutes)

> **Full database control from this repo:** see **[DATABASE.md](./DATABASE.md)** — edit `supabase/migrations/`, run tasks from Cursor, Studio, push/pull.

Your trades, rules, and diary **sync to Supabase** when you log in (replaces browser-only storage).

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Wait until the database is ready

## 2. API keys → `.env.local`

```powershell
cd .
npm run setup:supabase
```

Paste **Project URL** and **anon public** key from **Project Settings → API**.

## 3. Create the database table

From `` run **`npm run db:push`** (cloud) or **`npm run db:reset`** (local).

Or paste `supabase/migrations/20260321000000_trader_snapshots.sql` in Dashboard → SQL Editor.

## 4. Auth settings

**Authentication → Providers**

- Enable **Email**
- (Optional) Enable **Google** for OAuth on login/signup

**Authentication → URL Configuration**

| Field | Value |
|-------|--------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/**` |

## 5. Restart dev server

```powershell
npm run dev
```

Sign up at http://localhost:3000/signup — your data saves to `trader_snapshots` per user.

## Production (Vercel)

Add the same two env vars in Vercel → Project → Settings → Environment Variables, and set Site URL / redirects to your live domain.
