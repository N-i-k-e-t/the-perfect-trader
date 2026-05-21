# Admin panel and operations

## Current state

- Admin routes exist on **web** (`/admin`, `/the-terminal-x`) with client-side guards
- **Mobile v1:** no admin features

## Admin capabilities (target)

| Capability | Priority |
|------------|----------|
| User search / view snapshot metadata | High |
| Subscription override (manual Pro) | High |
| Failed import queue | Medium (Phase 2) |
| Feature flags / announcement banner | Medium |
| Support ticket link | Low |

## Support workflows

| Issue | Tooling needed |
|-------|----------------|
| Sync not working | View `updated_at`, last snapshot size, auth provider |
| Trial / Pro wrong | Manual `isPro` in snapshot or future `subscriptions` table |
| Account abuse | Disable auth user |

**Impersonation:** high risk — if added, audit log every action.

## Failed imports (Phase 2)

- Store raw CSV in Storage
- Edge Function status: pending / failed / done
- Admin replay with idempotent job ID

## Audit logs (future)

`admin_audit_log`: admin_user_id, action, target_user_id, timestamp, payload hash.

## Weekly internal report (suggested)

- New signups
- DAU / WAU
- Trades logged per active user
- Trial → Pro conversion (when Stripe live)
- Crash-free sessions
- Top support themes

## Mobile-specific ops

- Monitor Play Console / App Store Connect crash rates
- Review TestFlight feedback before production release
- Keep [IOS_RELEASE.md](./IOS_RELEASE.md) and [ANDROID_RELEASE.md](./ANDROID_RELEASE.md) updated per release
