# Android release checklist

## Debug (Windows)

```bash
cd mobile
flutter build apk --debug
```

Output: `mobile/build/app/outputs/flutter-apk/app-debug.apk`

## Release keystore

1. Create keystore: `keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`
2. Configure `mobile/android/key.properties` (do not commit)
3. Reference in `android/app/build.gradle.kts` signingConfigs

## Play Console

1. Create app with package `com.perfecttrader.app`
2. Internal testing track → upload AAB: `flutter build appbundle --release`
3. Test login + snapshot sync with production Supabase project

## Permissions

Default Flutter manifest is sufficient for v1 (network only). Add camera/storage when Diary ships (Phase 2).
