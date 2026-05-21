# DevOps and release pipeline

## Environments (recommended)

| Env | Supabase project | Flutter build |
|-----|------------------|---------------|
| Local | Optional local stack or dev project | Debug |
| Staging | Separate project | Profile |
| Production | Tokyo production project | Release |

**Current:** Single `.env` in `mobile/` for dev; add flavors when staging project exists.

## Git workflow

- **Trunk-based** or **GitFlow** — pick one; document in team README
- PR → `flutter analyze` + `flutter test` (required)
- No secrets in git; use CI secrets for signing

## CI (this repo)

Workflow: [`.github/workflows/flutter-mobile.yml`](../../.github/workflows/flutter-mobile.yml)

| Job | Runner | Steps |
|-----|--------|-------|
| analyze-test | ubuntu | pub get, analyze, test |
| ios-build | macos-latest | build ios --no-codesign |

## Cloud iOS builds (Windows devs)

**Codemagic:** [`mobile/codemagic.yaml`](../../mobile/codemagic.yaml)

- Connect GitHub repo
- Store Apple credentials in Codemagic groups
- Auto-upload to TestFlight on `main` tags (configure per team policy)

## Android release path

1. Create upload keystore (once) — see [ANDROID_RELEASE.md](./ANDROID_RELEASE.md)
2. `flutter build appbundle --release`
3. Play Console → internal testing → production

## iOS release path

1. Mac or Codemagic builds `.ipa`
2. TestFlight internal → external
3. App Store review — see [IOS_RELEASE.md](./IOS_RELEASE.md)

## Versioning

- `pubspec.yaml`: `version: 1.0.0+1` (name+build)
- Bump build number every store upload
- Semantic version for user-visible releases

## Rollback

- **Mobile:** ship previous store build; cannot force-downgrade installed users
- **Backend:** backward-compatible snapshot schema; avoid breaking jsonb without migration

## Monitoring (to add)

| Tool | Purpose |
|------|---------|
| Sentry / Crashlytics | Crashes |
| PostHog / Firebase Analytics | Product funnel |
| Supabase dashboard | DB health |

## Feature flags (future)

Firebase Remote Config or custom `app_config` table for gradual rollouts.
