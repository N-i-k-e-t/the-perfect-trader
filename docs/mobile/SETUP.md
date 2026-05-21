# Mobile setup — The Perfect Trader (Flutter)

**Documentation index:** [README.md](./README.md) — master questions, Windows/Codemagic setup, architecture, GTM, security, and release guides.

## Prerequisites

- Flutter SDK 3.16+ (`C:\src\flutter\bin` on Windows)
- Android Studio / device emulator (Windows)
- For iOS: Mac with Xcode 15+ or macOS CI (see [IOS_RELEASE.md](./IOS_RELEASE.md))

## Environment

1. Copy `mobile/.env.example` to `mobile/.env`
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `mobile/.env` (same **anon JWT** as web `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Project: `firqlsjixojnrofycwbs` — see [docs/supabase/CONNECT.md](../supabase/CONNECT.md).
3. Never commit `mobile/.env` or use the service role key in the app

## Commands

```bash
cd mobile
flutter pub get
flutter analyze
flutter test
flutter run -d <device_id>          # Android device/emulator
flutter build apk --debug           # Android debug APK
```

## Sync behavior

- On login, loads `trader_snapshots` jsonb for the authenticated user
- Local cache via Hive (`perfect_trader_data` key, legacy `rulesci_data` supported)
- Debounced cloud upsert **1.2s** after state changes (matches web)
- `DATA_VERSION` **1.1.0** — see [DATA_CONTRACT.md](./DATA_CONTRACT.md)

## Project layout

```
mobile/lib/
  main.dart, app.dart
  core/          theme, router, discipline, constants
  domain/        entities (trading.dart), repository interfaces
  data/          Supabase, Hive, SnapshotMapper
  features/      auth, today, journal, rules, settings, shell
  shared/        Riverpod providers
```
