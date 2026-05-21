import 'package:flutter_dotenv/flutter_dotenv.dart';

class SupabaseConfig {
  SupabaseConfig._();

  static String? _read(String key) {
    try {
      return dotenv.env[key];
    } catch (_) {
      return null;
    }
  }

  static String get url => _read('SUPABASE_URL') ?? '';

  static String get anonKey => _read('SUPABASE_ANON_KEY') ?? '';

  static bool get isConfigured {
    if (url.isEmpty || anonKey.isEmpty) return false;
    if (url.contains('your-project-id') ||
        url.contains('placeholder.supabase.co')) {
      return false;
    }
    if (anonKey.contains('your-anon-key') || anonKey == 'placeholder_key') {
      return false;
    }
    return true;
  }
}
