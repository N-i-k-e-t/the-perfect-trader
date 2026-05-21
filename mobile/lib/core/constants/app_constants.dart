/// Mirrors [src/lib/supabase-data.ts]
class AppConstants {
  AppConstants._();

  static const String dataVersion = '1.1.0';
  static const Duration cloudSaveDebounce = Duration(milliseconds: 1200);
  static const int streakComplianceThreshold = 75;
  static const int perfectComplianceScore = 100;
  static const int trialDays = 3;

  /// When true, trial paywall is disabled (matches web `NEXT_PUBLIC_BETA_MODE`).
  static const bool betaMode = true;

  static const List<String> allowedProEmails = [
    'niketpatil1624@gmail.com',
    'adityaparerao8@gmail.com',
  ];
}
