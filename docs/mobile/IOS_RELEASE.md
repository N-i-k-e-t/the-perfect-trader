# iOS release checklist

Requires **macOS** with Xcode 15+ and CocoaPods.

## One-time setup

1. Apple Developer account — register bundle ID `com.perfecttrader.app`
2. `cd mobile/ios && pod install`
3. Open `mobile/ios/Runner.xcworkspace` in Xcode
4. Set Team, signing, and capabilities (Sign in with Apple if offering social login)

## Build

```bash
cd mobile
flutter build ios --release --no-codesign   # CI
flutter build ipa                           # local archive
```

## TestFlight

1. Archive in Xcode or upload IPA via Transporter
2. App Store Connect → TestFlight → internal testers
3. Verify same Supabase user syncs with web after login

## CI

See `.github/workflows/flutter-mobile.yml` — `macos-latest` job runs `flutter build ios --no-codesign`.
