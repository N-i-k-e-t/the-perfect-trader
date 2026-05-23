# The Perfect Trader

**Trade your plan. Every session.** — Psychology-first trading discipline PWA (rules, journal, AI coach, daily grades).

[![Live](https://img.shields.io/badge/live-the--perfect--trader.vercel.app-emerald)](https://the-perfect-trader.vercel.app)

## What is The Perfect Trader?

A discipline OS for retail traders: set rules before the session, log trades with reflection, earn daily grades, and get AI nudges when patterns drift. Not a broker, not signals — accountability for how you trade.

## Features

- **Rules & playbooks** — lock your plan before market open
- **Trade journal** — manual logging with AI parse (Gemini)
- **Today** — pre-session check, grade ring, discipline streak
- **Stats** — patterns, heatmaps, Trading DNA card
- **Calendar** — market events + session history
- **Diary** — notes and capture modes
- **AI coach** — tilt warnings and contextual nudges
- **Analytics** — 49-event tracking in `user_events`
- **Beta waitlist** — capped signups with founder invite flow

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React, Tailwind, Framer Motion |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| AI | Google Gemini (`/api/parse-trade`) |
| Email | Resend (invites, contact, weekly reports) |
| Deploy | Vercel (auto-deploy from `main`) |

## Getting started

### Prerequisites

- Node.js 18+
- npm
- [Supabase](https://supabase.com) project

### Clone & install

```powershell
git clone https://github.com/N-i-k-e-t/the-perfect-trader.git
cd the-perfect-trader
npm install
```

### Environment

```powershell
cp .env.example .env.local
```

Fill in values (see table below).

### Database

Run [`docs/supabase/APPLY_SCHEMA.sql`](docs/supabase/APPLY_SCHEMA.sql) in the Supabase SQL editor, then apply any migrations in `supabase/migrations/`.

### Run locally

```powershell
npm run dev
```

Open http://localhost:3000

## Environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only) | Yes |
| `GEMINI_API_KEY` | Google Gemini for trade parse | Yes |
| `RESEND_API_KEY` | Resend email API | Yes (email features) |
| `RESEND_FROM` | Sender address | Optional |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | Yes |
| `NEXT_PUBLIC_TWITTER_URL` | Social link | Optional |
| `NEXT_PUBLIC_BETA_MODE` | `true` / `false` | Optional |
| `NEXT_PUBLIC_BETA_USER_CAP` | Max beta users | Optional |
| `ADMIN_EMAILS` | Comma-separated admin emails | Optional |
| `BETA_REPORT_EMAIL` | Weekly report + contact inbox | Yes (reports) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support address shown in UI | Optional |

Never commit `.env.local`.

## Project structure

```
src/
  app/              # Next.js routes (marketing, app shell, API)
  components/       # UI components
  lib/              # Config, discipline logic, Supabase helpers
  types/            # TypeScript types
docs/               # Specs, Supabase SQL, guides
supabase/           # Migrations & edge functions
public/             # Static assets, robots.txt, manifest
mobile/             # Flutter app (separate client)
```

## Data architecture

User identity lives in Supabase Auth. App state is stored per user in `trader_snapshots` (JSON document, schema v1.1.0). Behavioral analytics go to `user_events`. Beta emails use `beta_waitlist`. **Row Level Security** on all user tables — users only read/write their own rows; admin APIs use the service role server-side.

## Analytics & tracking

49 named product events are written to `user_events` for funnel and retention analysis. See [`docs/DATA_INVENTORY.md`](docs/DATA_INVENTORY.md) and [`docs/analytics/SAVED_QUERIES.sql`](docs/analytics/SAVED_QUERIES.sql).

## Deployment

Push to `main` on GitHub → Vercel builds and deploys. Set environment variables in the Vercel project dashboard. See [`docs/guides/LAUNCH.md`](docs/guides/LAUNCH.md).

## Beta

Join the waitlist at [/beta](https://the-perfect-trader.vercel.app/beta). Capacity is limited (`NEXT_PUBLIC_BETA_USER_CAP`, default 10). Free during beta.

## License

MIT

## Built by

**Niket** — trader from Nagpur, India · [Twitter / X](https://x.com/ThePerfectTrader)
