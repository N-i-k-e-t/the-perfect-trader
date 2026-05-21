# Windows development setup (Flutter + Cursor)

Build **iOS and Android** from a Windows PC. You do not need a Mac for day-to-day development; use **Codemagic** or **GitHub Actions (macOS)** for iOS release builds.

## Hardware

| Item | Recommendation |
|------|----------------|
| RAM | 16 GB minimum, 32 GB preferred |
| Storage | SSD, 50 GB+ free |
| Android testing | Emulator and/or physical Android device |
| iOS testing | iPhone + TestFlight (via cloud build) |

## Software stack (free tier)

| Tool | Role |
|------|------|
| [Cursor](https://cursor.com) | Primary IDE (AI-assisted) |
| Flutter SDK (stable) | Cross-platform framework |
| Android Studio | Emulator + SDK tools (not primary editor) |
| Git | Version control |
| Supabase CLI | Migrations, local DB (optional) |

**This machine:** Flutter is installed at `C:\src\flutter`. Add to PATH:

```powershell
$env:PATH = "C:\src\flutter\bin;" + $env:PATH
flutter doctor
```

## Launch cost estimate (first year)

| Item | Cost | Frequency |
|------|------|-----------|
| Cursor | Free (Pro ~$20/mo optional) | Monthly |
| Flutter / Android Studio | Free | — |
| Apple Developer Program | $99 | Yearly |
| Google Play Console | $25 | One-time |
| Codemagic (iOS cloud builds) | Free tier ~500 min/mo | Monthly |
| Supabase | Free → Pro ~$25/mo when scaling | Monthly |
| **Minimum to publish both stores** | **~$124** | First year |

## iOS on Windows: the pipeline

```text
Windows (Cursor + Flutter)
  → Write code once in mobile/
  → Test on Android emulator/device
  → git push
  → Codemagic or GitHub Actions (macOS) builds .ipa
  → TestFlight → App Store
```

You **cannot** compile iOS locally on Windows. Options:

| Option | Use case |
|--------|----------|
| **Codemagic + TestFlight** | Recommended for real device testing |
| **GitHub Actions `macos-latest`** | Already in `.github/workflows/flutter-mobile.yml` |
| **Appetize.io** | Quick browser-based simulator (visual checks) |

See [`codemagic.yaml`](../../mobile/codemagic.yaml) and [IOS_RELEASE.md](./IOS_RELEASE.md).

## Cursor setup

### Extensions

- Flutter / Dart
- Error Lens
- GitLens

### Project rules

Repo root [`.cursorrules`](../../.cursorrules) targets Flutter clean architecture, Riverpod, iOS + Android.

## Daily workflow

```powershell
cd mobile
flutter pub get
flutter run -d <android-device-id>   # primary on Windows
flutter analyze
flutter test
```

Optional quick UI pass (if web target enabled later):

```powershell
flutter run -d chrome
```

**Phase 1 mobile** ships **iOS + Android only** (no Flutter web in `mobile/`).

## Environment

Copy `mobile/.env.example` → `mobile/.env` with Supabase URL + anon key. See [SETUP.md](./SETUP.md).

## Related

- [SETUP.md](./SETUP.md)
- [TECH_STACK_DECISIONS.md](./TECH_STACK_DECISIONS.md)
- [DEVOPS_PIPELINE.md](./DEVOPS_PIPELINE.md)
