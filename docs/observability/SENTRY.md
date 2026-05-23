# Sentry error monitoring

Crash and error reporting for the Next.js app on **Vercel**. Disabled locally unless you set a DSN.

## 1. Create a Sentry project

1. [sentry.io](https://sentry.io) → Create organization (free tier: ~5k errors/month)
2. **Create project** → Platform **Next.js**
3. Copy the **DSN** (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)

Optional (source maps on deploy):

- **Settings → Auth Tokens** → create token with `project:releases`
- Note **Organization slug** and **Project slug**

## 2. Environment variables

| Variable | Where | Required |
|----------|--------|----------|
| `SENTRY_DSN` | Vercel Production, Preview | Yes (server) |
| `NEXT_PUBLIC_SENTRY_DSN` | Same | Yes (browser; can match `SENTRY_DSN`) |
| `NEXT_PUBLIC_APP_ENV` | Production: `production`, Preview: `staging` | Recommended |
| `SENTRY_ORG` | Vercel | Optional (source maps) |
| `SENTRY_PROJECT` | Vercel | Optional |
| `SENTRY_AUTH_TOKEN` | Vercel only (secret) | Optional |

Add to `.env.local` for local testing (events tagged `development` and **not sent** by default).

See [`.env.local.example`](../.env.local.example).

## 3. What is wired

| Layer | File |
|--------|------|
| Next.js build | `next.config.ts` (`withSentryConfig`) |
| Server / Edge | `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation.ts` |
| Browser | `sentry.client.config.ts` |
| React root errors | `src/app/global-error.tsx` |
| Request errors | `onRequestError` in instrumentation |
| Analytics bridge | `js_error_caught` in `track.ts` also calls `Sentry.captureException` |
| Ad-blocker tunnel | `/monitoring` (Sentry tunnel route) |

Environment tag comes from `NEXT_PUBLIC_APP_ENV` or `VERCEL_ENV` (`production` / `preview` → staging / `development`).

## 4. Verify

1. Deploy with DSN set on Vercel.
2. In Sentry → **Issues**, filter environment `production`.
3. Optional test (staging only): throw in a test route or trigger a client error; confirm issue appears within ~1 minute.

## 5. Alerts (recommended)

In Sentry → **Alerts**:

- New issue in `production`
- Spike in error rate (>10 events / 10 min)

Route to email or Slack.

## 6. Privacy

- `sendDefaultPii: false`
- Auth headers stripped in `beforeSend`
- Complements in-app `user_events` analytics (product behavior), not a replacement
