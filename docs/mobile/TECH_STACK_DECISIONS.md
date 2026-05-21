# Tech stack decisions (locked for this repo)

Answers aligned with the current **The Perfect Trader** monorepo. Update when decisions change.

## Product split

| Surface | Stack | Location | v1 priority |
|---------|-------|----------|-------------|
| Web app | Next.js 16, React 19, Tailwind 4 | `src/` | **P0 — ship first** |
| Mobile | Flutter 3.44, Dart 3.12 | `mobile/` | P1 — after web beta |
| Backend | Supabase Auth + Postgres | `supabase/` | Shared |

**v1 focus:** Web on Vercel. Pipeline: [docs/web/DEVOPS_PIPELINE.md](../web/DEVOPS_PIPELINE.md).

**Not in scope for mobile v1:** Flutter Web, Windows desktop target.

## Flutter mobile (locked)

| Area | Decision |
|------|----------|
| SDK | Flutter **stable** 3.44+ |
| Language | Dart 3.12+, null safety |
| State | **flutter_riverpod** |
| Routing | **go_router** |
| Backend client | **supabase_flutter** |
| Local cache | **hive_flutter** |
| Env | **flutter_dotenv** (`.env`, gitignored) |
| Connectivity | **connectivity_plus** |
| Architecture | Clean architecture: `core/`, `domain/`, `data/`, `features/` |
| Data sync v1 | Single jsonb row per user: `trader_snapshots` |
| Sync debounce | ~1.2s (match web) |
| DATA_VERSION | `1.1.0` |

## Packages (current `pubspec.yaml`)

```yaml
flutter_riverpod, go_router, supabase_flutter, flutter_dotenv,
hive_flutter, connectivity_plus, uuid, intl
```

## Deferred (Phase 2+)

| Package / area | When |
|----------------|------|
| freezed + json_serializable | Larger model codegen |
| graphify (Apache ECharts) | Stats screen: bar, line, force-directed memory graph |
| image_picker | Diary screenshots |
| firebase_messaging | Push notifications |
| in_app_purchase / RevenueCat | Real payments |
| local_auth | Biometric lock |

## iOS / Android targets

| Platform | Build on Windows | Release build |
|----------|------------------|---------------|
| Android | Yes (emulator/device) | `flutter build appbundle` |
| iOS | No | Codemagic or GitHub Actions macOS |

**Bundle/org:** `com.perfecttrader` / `perfect_trader_mobile`

## Linting and tests

- `flutter_lints` via `analysis_options.yaml`
- Tests: `test/snapshot_mapper_test.dart`, `discipline_test.dart`, `widget_test.dart`
- Target: expand unit coverage for grade calculation and sync debounce

## IDE and workflow

- **Cursor** primary; Android Studio for emulator/SDK only
- See [WINDOWS_DEV_SETUP.md](./WINDOWS_DEV_SETUP.md)

## Open decisions (track in MASTER_QUESTIONS)

- Minimum iOS / Android API levels
- Tablet support
- Build flavors (dev/staging/prod)
- Analytics/crash SDK (Sentry vs Firebase)
- Normalized DB schema vs snapshot-only long term
